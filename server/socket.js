import { Server } from "socket.io";

let io = null;

const activeScreenShares = new Map();

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  io.on("connection", (socket) => {
    socket.on("join-room", (roomId) => {
      if (!roomId) return;
      socket.join(roomId);
      const room = io.sockets.adapter.rooms.get(roomId);
      const users = room ? [...room] : [];
      socket.emit(
        "all-users",
        users.filter((id) => id !== socket.id),
      );
      socket.to(roomId).emit("new-user", socket.id);
      const currentScreen = activeScreenShares.get(roomId);
      if (currentScreen) {
        socket.emit("screen-share-state", {
          userId: currentScreen.userId,
          streamId: currentScreen.streamId,
        });
      }
    });
    socket.on("offer", ({ target, offer }) => {
      if (!target || !offer) {
        return;
      }
      io.to(target).emit("offer", {
        from: socket.id,
        offer,
      });
    });
    socket.on("answer", ({ target, answer }) => {
      if (!target || !answer) {
        return;
      }
      io.to(target).emit("answer", {
        from: socket.id,
        answer,
      });
    });
    socket.on("ice-candidate", ({ target, candidate }) => {
      if (!target || !candidate) {
        return;
      }
      io.to(target).emit("ice-candidate", {
        from: socket.id,
        candidate,
      });
    });
    socket.on("start-screen-share", ({ roomId, streamId }) => {
      if (!roomId) return;
      activeScreenShares.set(roomId, {
        userId: socket.id,
        streamId: streamId || null,
      });
      io.to(roomId).emit("screen-share-started", {
        userId: socket.id,
        streamId: streamId || null,
      });
    });
    socket.on("stop-screen-share", ({ roomId } = {}) => {
      if (!roomId) return;
      const current = activeScreenShares.get(roomId);
      if (current && current.userId !== socket.id) {
        return;
      }
      activeScreenShares.delete(roomId);
      io.to(roomId).emit("screen-share-stopped", {
        userId: socket.id,
      });
    });
    socket.on("leave-room", (roomId) => {
      if (!roomId) return;
      const current = activeScreenShares.get(roomId);
      if (current && current.userId === socket.id) {
        activeScreenShares.delete(roomId);
        io.to(roomId).emit("screen-share-stopped", {
          userId: socket.id,
        });
      }
      socket.to(roomId).emit("user-left", socket.id);
      socket.leave(roomId);
    });
    socket.on("disconnecting", () => {
      socket.rooms.forEach((roomId) => {
        if (roomId === socket.id) {
          return;
        }
        const current = activeScreenShares.get(roomId);
        if (current && current.userId === socket.id) {
          activeScreenShares.delete(roomId);
          io.to(roomId).emit("screen-share-stopped", {
            userId: socket.id,
          });
        }
        socket.to(roomId).emit("user-left", socket.id);
      });
    });
    socket.on("disconnect", () => {
      console.log("DISCONNECTED:", socket.id);
    });
  });
  return io;
};

export const getIO = () => {
  return io;
};
