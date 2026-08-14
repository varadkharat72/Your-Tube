import { useCallback, useEffect, useRef, useState } from "react";

export default function useMeetingRecorder({
  localStream,
  participants = [],
  screenStream = null,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingStreamRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasAnimationRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioDestinationRef = useRef(null);
  const timerRef = useRef(null);

  const getMimeType = useCallback(() => {
    const types = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return "";
  }, []);

  const createAudioMix = useCallback(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      return null;
    }
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();
    const streams = [];
    if (localStream) {
      streams.push(localStream);
    }
    participants.forEach((participant) => {
      if (participant?.stream) {
        streams.push(participant.stream);
      }
    });
    streams.forEach((stream) => {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        return;
      }
      try {
        const audioOnlyStream = new MediaStream([audioTracks[0]]);
        const source = audioContext.createMediaStreamSource(audioOnlyStream);
        source.connect(destination);
      } catch (error) {
        console.error("Audio source creation error:", error);
      }
    });
    audioContextRef.current = audioContext;
    audioDestinationRef.current = destination;
    return destination.stream;
  }, [localStream, participants]);

  const getVideoStream = useCallback(() => {
    if (!localStream) {
      return null;
    }
    const cameraTrack = localStream.getVideoTracks()[0];
    if (!cameraTrack) {
      return null;
    }
    return new MediaStream([cameraTrack]);
  }, [localStream]);

  const drawVideo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const videos = [];
    if (screenStream) {
      videos.push({
        stream: screenStream,
        type: "screen",
      });
    }
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videos.push({
          stream: localStream,
          type: "local",
        });
      }
    }
    participants.forEach((participant) => {
      if (
        participant?.stream &&
        participant.stream.getVideoTracks().length > 0
      ) {
        videos.push({
          stream: participant.stream,
          type: "remote",
        });
      }
    });
    videos.forEach((item, index) => {
      let video = document.querySelector(`[data-recorder-video="${index}"]`);
      if (!video) {
        video = document.createElement("video");
        video.dataset.recorderVideo = index;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.style.display = "none";
        document.body.appendChild(video);
      }
      if (video.srcObject !== item.stream) {
        video.srcObject = item.stream;
        video.play().catch(() => {});
      }
      if (item.type === "screen") {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return;
      }
      const cameraVideos = videos.filter((v) => v.type !== "screen");
      const cameraIndex = cameraVideos.findIndex(
        (v) => v.stream === item.stream,
      );
      const count = cameraVideos.length;
      let columns = 1;
      if (count === 2) {
        columns = 2;
      } else if (count >= 3 && count <= 4) {
        columns = 2;
      } else if (count >= 5) {
        columns = 3;
      }
      const rows = Math.ceil(count / columns);
      const cellWidth = canvas.width / columns;
      const cellHeight = canvas.height / rows;
      const x = (cameraIndex % columns) * cellWidth;
      const y = Math.floor(cameraIndex / columns) * cellHeight;
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        ctx.drawImage(video, x, y, cellWidth, cellHeight);
      }
    });
    canvasAnimationRef.current = requestAnimationFrame(drawVideo);
  }, [localStream, participants, screenStream]);

  const startRecording = useCallback(async () => {
    if (isRecording) {
      console.warn("Recording already running");
      return;
    }
    if (!localStream) {
      console.error("Cannot record: local stream missing");
      return;
    }
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      canvasRef.current = canvas;
      drawVideo();
      const canvasStream = canvas.captureStream(30);
      const audioStream = createAudioMix();
      const recordingStream = new MediaStream();
      canvasStream.getVideoTracks().forEach((track) => {
        recordingStream.addTrack(track);
      });
      if (audioStream) {
        audioStream.getAudioTracks().forEach((track) => {
          recordingStream.addTrack(track);
        });
      }
      recordingStreamRef.current = recordingStream;
      const mimeType = getMimeType();
      if (!mimeType) {
        throw new Error("Your browser does not support WebM recording.");
      }
      const recorder = new MediaRecorder(recordingStream, {
        mimeType,
        videoBitsPerSecond: 2_500_000,
        audioBitsPerSecond: 128_000,
      });
      recordedChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: mimeType,
        });
        if (blob.size === 0) {
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const date = new Date().toISOString().replace(/[:.]/g, "-");
        link.download = `YourTube-Meet-${date}.webm`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
        recordedChunksRef.current = [];
      };
      recorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
      };
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((previous) => previous + 1);
      }, 1000);
    } catch (error) {
      console.error("START RECORDING ERROR:", error);
      if (canvasAnimationRef.current) {
        cancelAnimationFrame(canvasAnimationRef.current);
      }
      if (audioContextRef.current) {
        try {
          await audioContextRef.current.close();
        } catch {}
      }
      canvasRef.current = null;
      audioContextRef.current = null;
      audioDestinationRef.current = null;
      recordingStreamRef.current = null;
    }
  }, [isRecording, localStream, drawVideo, createAudioMix, getMimeType]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current) {
      console.warn("No active recording.");
      return;
    }
    try {
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    } catch (error) {
      console.error("Stop recording error:", error);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);

      timerRef.current = null;
    }
    if (canvasAnimationRef.current) {
      cancelAnimationFrame(canvasAnimationRef.current);
      canvasAnimationRef.current = null;
    }
    if (recordingStreamRef.current) {
      recordingStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      recordingStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
      audioDestinationRef.current = null;
    }
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setRecordingTime(0);
  }, []);

  const formattedRecordingTime = `${String(
    Math.floor(recordingTime / 60),
  ).padStart(2, "0")}:${String(recordingTime % 60).padStart(2, "0")}`;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (canvasAnimationRef.current) {
        cancelAnimationFrame(canvasAnimationRef.current);
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {}
        });
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      document.querySelectorAll("[data-recorder-video]").forEach((element) => {
        element.remove();
      });
    };
  }, []);

  return {
    isRecording,
    recordingTime,
    formattedRecordingTime,
    startRecording,
    stopRecording,
  };
}
