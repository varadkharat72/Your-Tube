import { useCallback, useEffect, useRef, useState } from "react";
import socket from "@/lib/socket";

const RTC_CONFIG = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

export default function useWebRTC(roomId) {
  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenSharer, setScreenSharer] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const localVideoRef = useRef(null);
  const screenPreviewRef = useRef(null);
  const peers = useRef({});
  const pendingCandidates = useRef({});
  const joiningRef = useRef(false);
  const leavingRef = useRef(false);
  const stopScreenShareRef = useRef(null);
  const recorderRef = useRef(null);
  const recordingStreamRef = useRef(null);
  const recordingChunksRef = useRef([]);

  const updateParticipant = useCallback((id, changes) => {
    if (!id) return;
    setParticipants((prev) => {
      const existing = prev.find((participant) => participant.id === id);
      if (existing) {
        return prev.map((participant) =>
          participant.id === id
            ? {
                ...participant,
                ...changes,
              }
            : participant,
        );
      }
      return [
        ...prev,
        {
          id,
          cameraStream: null,
          screenStream: null,
          ...changes,
        },
      ];
    });
  }, []);

  const removeParticipant = useCallback((id) => {
    if (!id) return;
    setParticipants((prev) =>
      prev.filter((participant) => participant.id !== id),
    );
  }, []);

  const closePeer = useCallback((id) => {
    const peer = peers.current[id];
    if (!peer) return;
    try {
      peer.pc.ontrack = null;
      peer.pc.onicecandidate = null;
      peer.pc.onconnectionstatechange = null;
      peer.pc.oniceconnectionstatechange = null;
      peer.pc.close();
    } catch (error) {
      console.error("PEER CLOSE ERROR:", error);
    }
    delete peers.current[id];
    delete pendingCandidates.current[id];
  }, []);

  const sendOffer = useCallback(async (id) => {
    const peer = peers.current[id];
    if (!peer) return;
    const pc = peer.pc;
    if (pc.signalingState !== "stable") {
      return;
    }
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (!socket.connected) return;
      socket.emit("offer", {
        target: id,
        offer: pc.localDescription,
      });
    } catch (error) {
      console.error("SEND OFFER ERROR:", id, error);
    }
  }, []);

  const createPeer = useCallback(
    (id) => {
      if (!id) return null;
      if (peers.current[id]) {
        return peers.current[id].pc;
      }
      const pc = new RTCPeerConnection(RTC_CONFIG);
      const peerData = {
        pc,
        cameraSender: null,
        audioSender: null,
        screenSender: null,
      };
      peers.current[id] = peerData;
      const cameraStream = localStreamRef.current;
      if (cameraStream) {
        const cameraTrack = cameraStream.getVideoTracks()[0];
        const audioTrack = cameraStream.getAudioTracks()[0];
        if (cameraTrack) {
          peerData.cameraSender = pc.addTrack(cameraTrack, cameraStream);
        }
        if (audioTrack) {
          peerData.audioSender = pc.addTrack(audioTrack, cameraStream);
        }
      }
      const currentScreenStream = screenStreamRef.current;
      if (currentScreenStream) {
        const screenTrack = currentScreenStream.getVideoTracks()[0];
        if (screenTrack) {
          peerData.screenSender = pc.addTrack(screenTrack, currentScreenStream);
        }
      }
      pc.ontrack = (event) => {
        event.track.enabled = true;
        let stream = null;
        if (event.streams && event.streams.length > 0) {
          stream = event.streams[0];
        }
        if (!stream) {
          console.warn("REMOTE TRACK HAS NO STREAM:", id);
          return;
        }
        const audioTracks = stream.getAudioTracks();
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length === 0) {
          return;
        }
        if (audioTracks.length > 0) {
          updateParticipant(id, {
            cameraStream: stream,
          });
        } else {
          updateParticipant(id, {
            screenStream: stream,
          });
        }
      };
      pc.onicecandidate = (event) => {
        if (!event.candidate) return;
        if (!socket.connected) return;
        socket.emit("ice-candidate", {
          target: id,
          candidate: event.candidate,
        });
      };
      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "closed"
        ) {
          closePeer(id);
          removeParticipant(id);
        }
      };
      pc.oniceconnectionstatechange = () => {};
      return pc;
    },
    [closePeer, removeParticipant, updateParticipant],
  );

  const attachLocalVideo = useCallback(async () => {
    const video = localVideoRef.current;
    const stream = localStreamRef.current;
    if (!video || !stream) return;
    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }
    video.muted = true;
    try {
      await video.play();
      console.log("LOCAL CAMERA PLAYING");
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("LOCAL VIDEO PLAY ERROR:", error);
      }
    }
  }, []);

  const attachScreenPreview = useCallback(async () => {
    const video = screenPreviewRef.current;
    const stream = screenStreamRef.current;
    if (!video || !stream) return;
    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }
    video.muted = true;
    try {
      await video.play();
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("SCREEN PREVIEW PLAY ERROR:", error);
      }
    }
  }, []);

  const prepareMedia = useCallback(async () => {
    if (typeof window === "undefined") {
      return null;
    }
    if (localStreamRef.current && localStreamRef.current.active) {
      return localStreamRef.current;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("getUserMedia is not supported.");

      return null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      const videoEnabled = stream
        .getVideoTracks()
        .some((track) => track.enabled);
      const audioEnabled = stream
        .getAudioTracks()
        .some((track) => track.enabled);
      setCameraOn(videoEnabled);
      setMicOn(audioEnabled);
      return stream;
    } catch (error) {
      console.error("GET USER MEDIA ERROR:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!roomId) return;
    prepareMedia();
  }, [roomId, prepareMedia]);

  const joinMeeting = useCallback(async () => {
    if (!roomId) {
      console.error("ROOM ID MISSING");
      return;
    }
    if (joiningRef.current || joined) {
      return;
    }
    joiningRef.current = true;
    try {
      const stream = await prepareMedia();
      if (!stream) {
        joiningRef.current = false;
        return;
      }
      const joinRoom = () => {
        if (!socket.connected) return;
        socket.emit("join-room", roomId);
        setJoined(true);
        joiningRef.current = false;
      };
      if (!socket.connected) {
        socket.connect();
        socket.once("connect", joinRoom);
      } else {
        joinRoom();
      }
    } catch (error) {
      console.error("JOIN MEETING ERROR:", error);

      joiningRef.current = false;
    }
  }, [joined, prepareMedia, roomId]);

  useEffect(() => {
    if (!roomId) return;
    const handleAllUsers = async (users) => {
      if (!Array.isArray(users)) return;
      for (const id of users) {
        if (!id || id === socket.id) {
          continue;
        }
        createPeer(id);
        await sendOffer(id);
      }
    };

    const handleNewUser = (id) => {};

    const handleOffer = async ({ from, offer }) => {
      if (!from || !offer) return;
      let pc = peers.current[from]?.pc;
      if (!pc) {
        pc = createPeer(from);
      }
      if (!pc) return;
      try {
        if (pc.signalingState === "have-local-offer") {
          console.warn("OFFER COLLISION:", from);

          return;
        }
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const queued = pendingCandidates.current[from] || [];
        for (const candidate of queued) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (error) {
            console.error("QUEUED ICE ERROR:", error);
          }
        }
        delete pendingCandidates.current[from];
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", {
          target: from,
          answer: pc.localDescription,
        });
      } catch (error) {
        console.error("OFFER ERROR:", from, error);
      }
    };

    const handleAnswer = async ({ from, answer }) => {
      if (!from || !answer) return;
      const peer = peers.current[from];
      if (!peer) return;
      const pc = peer.pc;
      if (pc.signalingState !== "have-local-offer") {
        console.warn("ANSWER IGNORED - WRONG STATE:", from, pc.signalingState);
        return;
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        const queued = pendingCandidates.current[from] || [];
        for (const candidate of queued) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (error) {
            console.error("ANSWER ICE ERROR:", error);
          }
        }
        delete pendingCandidates.current[from];
      } catch (error) {
        console.error("ANSWER ERROR:", from, error);
      }
    };

    const handleIceCandidate = async ({ from, candidate }) => {
      if (!from || !candidate) return;
      const peer = peers.current[from];
      if (!peer) {
        if (!pendingCandidates.current[from]) {
          pendingCandidates.current[from] = [];
        }
        pendingCandidates.current[from].push(candidate);
        return;
      }
      const pc = peer.pc;
      if (!pc.remoteDescription || !pc.remoteDescription.type) {
        if (!pendingCandidates.current[from]) {
          pendingCandidates.current[from] = [];
        }
        pendingCandidates.current[from].push(candidate);
        return;
      }
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("ICE ERROR:", error);
      }
    };

    const handleUserLeft = (id) => {
      closePeer(id);
      removeParticipant(id);
      setScreenSharer((current) => (current === id ? null : current));
    };

    const handleScreenStarted = (data) => {
      const id =
        typeof data === "string"
          ? data
          : data?.userId || data?.socketId || data?.sharerId || data?.id;
      if (!id) return;
      setScreenSharer(id);
    };

    const handleScreenStopped = (data) => {
      const id =
        typeof data === "string"
          ? data
          : data?.userId || data?.socketId || data?.sharerId || data?.id;
      if (!id) return;
      setScreenSharer((current) => (current === id ? null : current));
      setParticipants((prev) =>
        prev.map((participant) =>
          participant.id === id
            ? {
                ...participant,
                screenStream: null,
              }
            : participant,
        ),
      );
    };

    const handleCurrentScreen = (data) => {
      const id = data?.userId || data?.socketId || data?.sharerId;
      if (!id) return;
      setScreenSharer(id);
    };
    socket.on("all-users", handleAllUsers);
    socket.on("new-user", handleNewUser);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("user-left", handleUserLeft);
    socket.on("screen-share-started", handleScreenStarted);
    socket.on("screen-share-stopped", handleScreenStopped);
    socket.on("screen-share-state", handleCurrentScreen);

    return () => {
      socket.off("all-users", handleAllUsers);
      socket.off("new-user", handleNewUser);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("user-left", handleUserLeft);
      socket.off("screen-share-started", handleScreenStarted);
      socket.off("screen-share-stopped", handleScreenStopped);
      socket.off("screen-share-state", handleCurrentScreen);
    };
  }, [roomId, createPeer, sendOffer, closePeer, removeParticipant]);

  const startScreenShare = useCallback(async () => {
    if (!joined) return;
    if (screenStreamRef.current) {
      return;
    }
    if (
      typeof window === "undefined" ||
      !navigator.mediaDevices?.getDisplayMedia
    ) {
      console.error("Screen sharing is not supported.");

      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      const track = stream.getVideoTracks()[0];
      if (!track) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      screenStreamRef.current = stream;
      setScreenStream(stream);
      if (screenPreviewRef.current) {
        screenPreviewRef.current.srcObject = stream;
        screenPreviewRef.current.muted = true;
        try {
          await screenPreviewRef.current.play();
        } catch (error) {
          if (error?.name !== "AbortError") {
            console.error("SCREEN PREVIEW ERROR:", error);
          }
        }
      }
      for (const id of Object.keys(peers.current)) {
        const peer = peers.current[id];
        if (!peer) continue;
        const pc = peer.pc;
        try {
          if (!peer.screenSender) {
            peer.screenSender = pc.addTrack(track, stream);
          }
          if (pc.signalingState === "stable") {
            await sendOffer(id);
          }
        } catch (error) {
          console.error("ADD SCREEN TRACK ERROR:", id, error);
        }
      }
      setIsScreenSharing(true);
      setScreenSharer(socket.id);
      socket.emit("start-screen-share", {
        roomId,
        streamId: stream.id,
      });
      track.onended = () => {
        stopScreenShareRef.current?.();
      };
    } catch (error) {}
  }, [joined, roomId, sendOffer]);

  const stopScreenShare = useCallback(async () => {
    const stream = screenStreamRef.current;
    if (!stream) return;
    for (const id of Object.keys(peers.current)) {
      const peer = peers.current[id];
      if (!peer) continue;
      const pc = peer.pc;
      try {
        if (peer.screenSender) {
          pc.removeTrack(peer.screenSender);
          peer.screenSender = null;
        }
        if (pc.signalingState === "stable") {
          await sendOffer(id);
        }
      } catch (error) {
        console.error("REMOVE SCREEN TRACK ERROR:", id, error);
      }
    }
    stream.getTracks().forEach((track) => {
      track.onended = null;
      track.stop();
    });
    screenStreamRef.current = null;
    setScreenStream(null);
    if (screenPreviewRef.current) {
      try {
        screenPreviewRef.current.pause();
      } catch {}
      screenPreviewRef.current.srcObject = null;
    }
    setIsScreenSharing(false);
    setScreenSharer(null);
    if (socket.connected) {
      socket.emit("stop-screen-share", {
        roomId,
        streamId: stream.id,
      });
    }
  }, [roomId, sendOffer]);

  useEffect(() => {
    stopScreenShareRef.current = stopScreenShare;
    return () => {
      stopScreenShareRef.current = null;
    };
  }, [stopScreenShare]);

  const toggleMic = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  }, []);

  const toggleCamera = () => {
    if (!localStream) return;
    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length === 0) return;
    const nextState = !cameraOn;
    videoTracks.forEach((track) => {
      track.enabled = nextState;
    });

    setCameraOn(nextState);
  };

  const startRecording = useCallback(async () => {
    if (isRecording) return;
    if (typeof window === "undefined") {
      return;
    }
    if (!navigator.mediaDevices?.getDisplayMedia) {
      console.error("Screen recording is not supported.");
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      console.error("MediaRecorder is not supported.");
      return;
    }
    try {
      const recordingStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      recordingStreamRef.current = recordingStream;
      let mimeType = "";
      const supportedTypes = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
      ];
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      recordingChunksRef.current = [];
      const recorder = new MediaRecorder(
        recordingStream,
        mimeType ? { mimeType } : undefined,
      );
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(recordingChunksRef.current, {
          type: mimeType || "video/webm",
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `meeting-${new Date()
          .toISOString()
          .replace(/[:.]/g, "-")}.webm`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
        recordingStream.getTracks().forEach((track) => {
          track.stop();
        });
        recordingStreamRef.current = null;
        recordingChunksRef.current = [];
        recorderRef.current = null;
        setIsRecording(false);
        console.log("RECORDING SAVED");
      };
      recorder.onerror = (event) => {
        console.error("MEDIA RECORDER ERROR:", event);
      };
      recorder.start(1000);
      recorderRef.current = recorder;
      setIsRecording(true);
      recordingStream.getVideoTracks()[0]?.addEventListener(
        "ended",
        () => {
          if (recorder.state !== "inactive") {
            recorder.stop();
          }
        },
        { once: true },
      );
    } catch (error) {
      console.error("RECORDING ERROR:", error);
      recordingStreamRef.current = null;
      setIsRecording(false);
    }
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    if (recorder.state !== "inactive") {
      recorder.stop();
    }
  }, []);

  const leaveMeeting = useCallback(() => {
    if (leavingRef.current) {
      return;
    }
    leavingRef.current = true;
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    if (recordingStreamRef.current) {
      recordingStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      recordingStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => {
        track.onended = null;
        track.stop();
      });
      screenStreamRef.current = null;
      setScreenStream(null);
    }
    if (socket.connected) {
      socket.emit("stop-screen-share", {
        roomId,
      });
      socket.emit("leave-room", roomId);
    }
    Object.keys(peers.current).forEach((id) => {
      closePeer(id);
    });
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      localStreamRef.current = null;
      setLocalStream(null);
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (screenPreviewRef.current) {
      screenPreviewRef.current.srcObject = null;
    }
    pendingCandidates.current = {};
    setParticipants([]);
    setJoined(false);
    setIsScreenSharing(false);
    setScreenSharer(null);
    setMicOn(true);
    setCameraOn(true);
    if (socket.connected) {
      socket.disconnect();
    }
    joiningRef.current = false;
    leavingRef.current = false;
  }, [closePeer, roomId]);

  useEffect(() => {
    if (!localStream) return;
    const timer = setTimeout(() => {
      attachLocalVideo();
    }, 50);
    return () => {
      clearTimeout(timer);
    };
  }, [localStream, attachLocalVideo]);

  useEffect(() => {
    if (!screenStream) return;
    const timer = setTimeout(() => {
      attachScreenPreview();
    }, 50);
    return () => {
      clearTimeout(timer);
    };
  }, [screenStream, attachScreenPreview]);

  useEffect(() => {
    return () => {
      Object.keys(peers.current).forEach((id) => {
        closePeer(id);
      });
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        screenStreamRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        localStreamRef.current = null;
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (screenPreviewRef.current) {
        screenPreviewRef.current.srcObject = null;
      }
      pendingCandidates.current = {};
    };
  }, [closePeer]);

  return {
    localVideoRef,
    screenPreviewRef,
    localStream,
    localStreamRef,
    screenStream,
    screenStreamRef,
    joined,
    participants,
    micOn,
    cameraOn,
    isScreenSharing,
    screenSharer,
    isRecording,
    joinMeeting,
    leaveMeeting,
    toggleMic,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
    startRecording,
    stopRecording,
    prepareMedia,
  };
}
