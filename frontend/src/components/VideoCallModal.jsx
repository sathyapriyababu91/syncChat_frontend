import React, { useEffect, useRef, useState } from "react";

// Public STUN Configuration
const iceServersConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

function VideoCallModal({ currentUserId, targetUserId, socket, onClose }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    const pc = new RTCPeerConnection(iceServersConfig);
    peerConnectionRef.current = pc;

    // 1. Get Camera & Audio Feed
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Add Local Tracks to WebRTC Peer
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });
      })
      .catch((err) => console.error("Media devices access error:", err));

    // 2. Attach Remote Stream to Main Screen
    pc.ontrack = (event) => {
      console.log("🟢 Remote Stream Received:", event.streams[0]);
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // 3. ICE Candidate Signaling
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ice-candidate", {
          to: targetUserId,
          candidate: event.candidate,
        });
      }
    };

    // 4. Socket Listeners for WebRTC Handshake
    if (socket) {
      socket.on("offer", async ({ from, offer }) => {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit("answer", { to: from, answer });
        } catch (err) {
          console.error("Error handling offer:", err);
        }
      });

      socket.on("answer", async ({ answer }) => {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error("Error setting remote answer:", err);
        }
      });

      socket.on("ice-candidate", async ({ candidate }) => {
        try {
          if (candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      });
    }

    // Cleanup tracks on modal close
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      pc.close();
      if (socket) {
        socket.off("offer");
        socket.off("answer");
        socket.off("ice-candidate");
      }
    };
  }, [targetUserId, socket]);

  // Start Call Trigger
  const handleStartCall = async () => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("offer", { to: targetUserId, offer });
    } catch (err) {
      console.error("Start call error:", err);
    }
  };

  // Toggle Audio Mute
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle Video Off
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center p-4 z-50">
      <div className="relative w-full max-w-3xl h-[520px] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
        
        {/* Remote Video (Main Display) */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* Local Video (Self View Box) */}
          <div className="absolute bottom-4 right-4 w-32 h-44 bg-slate-800 rounded-xl overflow-hidden border-2 border-white/50 shadow-xl z-10">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Action Call Controls */}
        <div className="p-4 bg-slate-950 flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={handleStartCall}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-xs transition shadow-md"
          >
            Start Call 📞
          </button>

          <button
            onClick={toggleAudio}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition shadow-md text-white ${
              isAudioMuted ? "bg-amber-600 hover:bg-amber-700" : "bg-slate-700 hover:bg-slate-600"
            }`}
          >
            {isAudioMuted ? "Unmute 🎤" : "Mute 🎤"}
          </button>

          <button
            onClick={toggleVideo}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition shadow-md text-white ${
              isVideoOff ? "bg-amber-600 hover:bg-amber-700" : "bg-slate-700 hover:bg-slate-600"
            }`}
          >
            {isVideoOff ? "Start Video 📹" : "Stop Video 📹"}
          </button>
          
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs transition shadow-md"
          >
            End Call 🔴
          </button>
        </div>

      </div>
    </div>
  );
}

export default VideoCallModal;