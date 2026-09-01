import { useEffect, useState, useRef } from "react";
import { getContacts } from "../services/contactService";
import { useNavigate } from "react-router-dom";
import {
  sendMessage,
  getMessages,
  getUnreadCount,
  markMessagesAsRead,
  saveCallHistory,
} from "../services/messageService";
import socket from "../services/socket";
import ChatSidebar from "../components/ChatSidebar";
import ChatHeader from "../components/ChatHeader";
import ChatMessages from "../components/ChatMessages";
import MessageInput from "../components/MessageInput";
import SideNav from "../components/SideNav";
import PendingRequests from "../components/PendingRequests";

function Home() {
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showChat, setShowChat] = useState(false);

  const [activeTab, setActiveTab] = useState("chats");

  const [callType, setCallType] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCallUser, setActiveCallUser] = useState(null); // Call screen-ல் பெயர் காட்டுவதற்கு

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const callStartTimeRef = useRef(null);
  const callPartnerRef = useRef(null);
  const callTypeRef = useRef(null);
  const callConnectedRef = useRef(false);
  const peerConnectionRef = useRef(null);

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const pendingIceCandidatesRef = useRef([]);

  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");

  const loadContacts = async () => {
    try {
      const data = await getContacts();
      const contactList = data.contacts || [];
      setContacts(contactList);
      const counts = {};

      await Promise.all(
        contactList.map(async (contact) => {
          const user =
            String(contact.sender._id) === String(currentUserId)
              ? contact.receiver
              : contact.sender;
          try {
            const count = await getUnreadCount(user._id);
            counts[String(user._id)] = count;
          } catch (error) {
            counts[String(user._id)] = 0;
          }
        })
      );
      setUnreadCounts(counts);
    } catch (error) {
      console.error("Failed to load contacts:", error);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    const handleConnect = () => {
      if (currentUserId) {
        socket.emit("join", currentUserId);
      }
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on("connect", handleConnect);
    }

    return () => {
      socket.off("connect", handleConnect);
    };
  }, [currentUserId]);

  const handleReceive = (newMessage) => {
    const senderId =
      typeof newMessage.sender === "object"
        ? newMessage.sender?._id
        : newMessage.sender;

    const receiverId =
      typeof newMessage.receiver === "object"
        ? newMessage.receiver?._id
        : newMessage.receiver;

    const senderIdString = String(senderId);
    const receiverIdString = String(receiverId);

    const isCurrentChat =
      selectedUser &&
      (senderIdString === String(selectedUser._id) ||
        receiverIdString === String(selectedUser._id));

    if (isCurrentChat) {
      setMessages((prev) => {
        const alreadyExists = prev.some(
          (msg) => String(msg._id) === String(newMessage._id)
        );
        if (alreadyExists) return prev;
        return [...prev, newMessage];
      });

      if (senderIdString !== String(currentUserId)) {
        markMessagesAsRead(senderIdString).catch((error) =>
          console.error("Failed to mark read:", error)
        );
      }
      return;
    }

    setUnreadCounts((prev) => ({
      ...prev,
      [senderIdString]: (prev[senderIdString] || 0) + 1,
    }));
  };

  useEffect(() => {
    socket.on("receiveMessage", handleReceive);
    return () => {
      socket.off("receiveMessage", handleReceive);
    };
  }, [selectedUser]);

  useEffect(() => {
    const handleUserTyping = (data) => {
      if (selectedUser && String(data.userId) === String(selectedUser._id)) {
        setIsTyping(true);
      }
    };

    const handleUserStopTyping = (data) => {
      if (selectedUser && String(data.userId) === String(selectedUser._id)) {
        setIsTyping(false);
      }
    };

    socket.on("userTyping", handleUserTyping);
    socket.on("userStopTyping", handleUserStopTyping);

    return () => {
      socket.off("userTyping", handleUserTyping);
      socket.off("userStopTyping", handleUserStopTyping);
    };
  }, [selectedUser]);

  useEffect(() => {
    const handleOnlineUsers = (users) => setOnlineUsers(users.map(String));

    const handleUserOnline = ({ userId }) => {
      setOnlineUsers((prev) => {
        const id = String(userId);
        return prev.includes(id) ? prev : [...prev, id];
      });
    };

    const handleUserOffline = ({ userId }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== String(userId)));
    };

    socket.on("onlineUsers", handleOnlineUsers);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);

    if (socket.connected && currentUserId) {
      socket.emit("join", currentUserId);
    }

    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
    };
  }, [currentUserId]);

  useEffect(() => {
    const handleMessagesRead = (data) => {
      if (String(data.senderId) === String(currentUserId)) {
        setMessages((prev) =>
          prev.map((msg) => {
            const senderId =
              typeof msg.sender === "object" ? msg.sender._id : msg.sender;
            const receiverId =
              typeof msg.receiver === "object" ? msg.receiver._id : msg.receiver;

            if (
              String(senderId) === String(currentUserId) &&
              String(receiverId) === String(data.receiverId)
            ) {
              return { ...msg, isRead: true };
            }
            return msg;
          })
        );
      }
    };

    socket.on("messagesRead", handleMessagesRead);
    return () => {
      socket.off("messagesRead", handleMessagesRead);
    };
  }, [currentUserId]);

  const createPeerConnection = (receiverId) => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", {
          senderId: currentUserId,
          receiverId: receiverId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      let stream = remoteStreamRef.current;
      if (!stream) {
        stream = new MediaStream();
        remoteStreamRef.current = stream;
      }

      const alreadyAdded = stream
        .getTracks()
        .some((track) => track.id === event.track.id);

      if (!alreadyAdded) {
        stream.addTrack(event.track);
      }

      setRemoteStream(stream);

      const activeCallType = callTypeRef.current;

      if (activeCallType === "video" && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play().catch((e) => console.log("Video play error:", e));
      }

      if (activeCallType === "audio" && remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.play().catch((e) => console.log("Audio play error:", e));
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        callConnectedRef.current = true;
        if (!callStartTimeRef.current) {
          callStartTimeRef.current = Date.now();
        }
      }
    };

    return pc;
  };

  const createOffer = async (receiverId) => {
    try {
      const pc = createPeerConnection(receiverId);
      const stream = localStreamRef.current;

      if (!stream) return;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("webrtcOffer", {
        callerId: currentUserId,
        receiverId: receiverId,
        offer: offer,
        callType: callTypeRef.current,
      });
    } catch (error) {
      console.error("Create offer error:", error);
    }
  };

  useEffect(() => {
    const handleIncomingCall = (data) => {
      setIncomingCall(data);
      setCallType(data.callType);
      callTypeRef.current = data.callType;
    };

    const handleCallAccepted = async (data) => {
      setCallType(data.callType);
      callTypeRef.current = data.callType;
      setIsCalling(true);

      const receiverId = data.receiverId || selectedUser?._id || callPartnerRef.current;
      if (!receiverId) return;

      await createOffer(receiverId);
    };

    const handleCallRejected = () => {
      cleanupCall(false);
      alert("Call rejected");
    };

    const handleCallEnded = () => {
      cleanupCall(false);
    };

    socket.on("incomingCall", handleIncomingCall);
    socket.on("callAccepted", handleCallAccepted);
    socket.on("callRejected", handleCallRejected);
    socket.on("callEnded", handleCallEnded);

    return () => {
      socket.off("incomingCall", handleIncomingCall);
      socket.off("callAccepted", handleCallAccepted);
      socket.off("callRejected", handleCallRejected);
      socket.off("callEnded", handleCallEnded);
    };
  }, [selectedUser]);

  useEffect(() => {
    const handleWebRTCOffer = async (data) => {
      try {
        const pc = createPeerConnection(data.callerId);
        const stream = localStreamRef.current;

        if (stream) {
          stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        }

        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

        for (const candidate of pendingIceCandidatesRef.current) {
          await pc.addIceCandidate(candidate);
        }
        pendingIceCandidatesRef.current = [];

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("webrtcAnswer", {
          callerId: data.callerId,
          receiverId: currentUserId,
          answer: answer,
        });
      } catch (error) {
        console.error("WebRTC offer error:", error);
      }
    };

    const handleWebRTCAnswer = async (data) => {
      try {
        const pc = peerConnectionRef.current;
        if (!pc) return;

        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));

        for (const candidate of pendingIceCandidatesRef.current) {
          await pc.addIceCandidate(candidate);
        }
        pendingIceCandidatesRef.current = [];
      } catch (error) {
        console.error("WebRTC answer error:", error);
      }
    };

    const handleIceCandidate = async (data) => {
      try {
        if (!data.candidate) return;
        const candidate = new RTCIceCandidate(data.candidate);
        const pc = peerConnectionRef.current;

        if (pc && pc.remoteDescription) {
          await pc.addIceCandidate(candidate);
        } else {
          pendingIceCandidatesRef.current.push(candidate);
        }
      } catch (error) {
        console.error("ICE candidate error:", error);
      }
    };

    socket.on("webrtcOffer", handleWebRTCOffer);
    socket.on("webrtcAnswer", handleWebRTCAnswer);
    socket.on("iceCandidate", handleIceCandidate);

    return () => {
      socket.off("webrtcOffer", handleWebRTCOffer);
      socket.off("webrtcAnswer", handleWebRTCAnswer);
      socket.off("iceCandidate", handleIceCandidate);
    };
  }, [currentUserId]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch((e) => console.log("Local video error:", e));
    }
  }, [localStream, isCalling, callType]);

  useEffect(() => {
    if (!remoteStream) return;

    if (callType === "video" && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch((e) => console.log("Remote video error:", e));
    }

    if (callType === "audio" && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch((e) => console.log("Remote audio error:", e));
    }
  }, [remoteStream, isCalling, callType]);

  const cleanupCall = async (notifyOtherUser = true) => {
    if (
      callStartTimeRef.current &&
      callPartnerRef.current &&
      callTypeRef.current
    ) {
      const duration = Math.floor(
        (Date.now() - callStartTimeRef.current) / 1000
      );

      try {
        const response = await saveCallHistory(
          callPartnerRef.current,
          callTypeRef.current === "video" ? "video_call" : "audio_call",
          "completed",
          duration
        );

        if (response?.data) {
          setMessages((prev) => [...prev, response.data]);
        }
      } catch (error) {
        console.error("Failed to save call history:", error);
      }
    }

    if (notifyOtherUser && callPartnerRef.current) {
      socket.emit("endCall", {
        callerId: currentUserId,
        receiverId: callPartnerRef.current,
      });
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;

    pendingIceCandidatesRef.current = [];

    callStartTimeRef.current = null;
    callPartnerRef.current = null;
    callTypeRef.current = null;

    setLocalStream(null);
    setRemoteStream(null);
    setIsCalling(false);
    setIncomingCall(null);
    setCallType(null);
    setActiveCallUser(null);
  };

  const handleBack = () => {
    setShowChat(false);
    setSelectedUser(null);
    setMessages([]);
    setIsTyping(false);
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setIsTyping(false);
    setShowChat(true);

    setUnreadCounts((prev) => ({
      ...prev,
      [String(user._id)]: 0,
    }));

    try {
      const data = await getMessages(user._id);
      setMessages(data.messages || []);
      await markMessagesAsRead(user._id);
    } catch (error) {
      console.error("Failed to load chat:", error);
    }
  };

  const handleSendMessage = async (text, audioUrl = null) => {
    if (!selectedUser || (!text?.trim() && !audioUrl)) return;

    try {
      await sendMessage(selectedUser._id, text?.trim() || "");
      setMessage("");
      const chat = await getMessages(selectedUser._id);
      setMessages(chat.messages || []);
    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  const handleAudioCall = async () => {
    if (!selectedUser) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      setCallType("audio");
      setIsCalling(true);
      setActiveCallUser(selectedUser);

      callStartTimeRef.current = null;
      callPartnerRef.current = selectedUser._id;
      callTypeRef.current = "audio";
      callConnectedRef.current = false;

      socket.emit("callUser", {
        callerId: currentUserId,
        callerName: localStorage.getItem("name") || "User",
        receiverId: selectedUser._id,
        callType: "audio",
      });
    } catch (error) {
      alert("Microphone permission is required");
    }
  };

  const handleVideoCall = async () => {
    if (!selectedUser) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      setCallType("video");
      setIsCalling(true);
      setActiveCallUser(selectedUser);

      callStartTimeRef.current = null;
      callPartnerRef.current = selectedUser._id;
      callTypeRef.current = "video";
      callConnectedRef.current = false;

      socket.emit("callUser", {
        callerId: currentUserId,
        callerName: localStorage.getItem("name") || "User",
        receiverId: selectedUser._id,
        callType: "video",
      });
    } catch (error) {
      alert("Camera/Microphone permission denied or not available.");
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    try {
      const isVideo = incomingCall.callType === "video";
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      setCallType(incomingCall.callType);
      setIsCalling(true);
      setActiveCallUser({ name: incomingCall.callerName, _id: incomingCall.callerId });

      callStartTimeRef.current = null;
      callPartnerRef.current = incomingCall.callerId;
      callTypeRef.current = incomingCall.callType;

      socket.emit("acceptCall", {
        callerId: incomingCall.callerId,
        receiverId: currentUserId,
        callType: incomingCall.callType,
      });

      setIncomingCall(null);
    } catch (error) {
      alert("Camera/Microphone permission required to accept.");
      cleanupCall(true);
    }
  };

  const handleRejectCall = () => {
    if (!incomingCall) return;

    socket.emit("rejectCall", {
      callerId: incomingCall.callerId,
      receiverId: currentUserId,
    });

    setIncomingCall(null);
    setCallType(null);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Hidden global audio element for audio calls */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <SideNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <div
        className={`${
          showChat ? "hidden md:flex" : "flex"
        } w-full md:w-80 flex-col bg-white border-r border-gray-200`}
      >
        <ChatSidebar
          contacts={contacts}
          selectedUser={selectedUser}
          onSelectUser={handleSelectUser}
          unreadCounts={unreadCounts}
          onlineUsers={onlineUsers}
          currentUserId={currentUserId}
        />
        <PendingRequests onRequestAccepted={loadContacts} />
      </div>

      <div
        className={`${
          showChat ? "flex" : "hidden md:flex"
        } flex-1 flex-col h-full relative bg-gray-50`}
      >
        {selectedUser ? (
          <>
            <ChatHeader
              selectedUser={selectedUser}
              onlineUsers={onlineUsers}
              onBack={handleBack}
              onAudioCall={handleAudioCall}
              onVideoCall={handleVideoCall}
            />
            <ChatMessages
              messages={messages}
              currentUserId={currentUserId}
              isTyping={isTyping}
              selectedUser={selectedUser}
            />
            <MessageInput
              message={message}
              setMessage={setMessage}
              onSendMessage={handleSendMessage}
              selectedUser={selectedUser}
              currentUserId={currentUserId}
              socket={socket}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-400">
            <p>Select a contact to start chatting</p>
          </div>
        )}

        {incomingCall && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center space-y-4 max-w-sm w-full mx-4">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                {incomingCall.callerName?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  Incoming {incomingCall.callType} call...
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {incomingCall.callerName || "Someone"} is calling you
                </p>
              </div>
              <div className="flex space-x-4 w-full pt-2">
                <button
                  onClick={handleRejectCall}
                  className="flex-1 bg-red-500 text-white py-2.5 rounded-lg font-medium hover:bg-red-600 transition"
                >
                  Decline
                </button>
                <button
                  onClick={handleAcceptCall}
                  className="flex-1 bg-green-500 text-white py-2.5 rounded-lg font-medium hover:bg-green-600 transition"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        )}

        {isCalling && (
          <div className="absolute inset-0 bg-gray-900 flex flex-col z-50">
            <div className="p-4 flex justify-between items-center text-white bg-gradient-to-b from-black/60 to-transparent">
              <h3 className="font-medium text-lg">
                {callType === "video" ? "Video Call" : "Audio Call"}
              </h3>
            </div>

            <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
              {callType === "video" ? (
                <>
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover rounded-xl bg-black"
                  />
                  <div className="absolute bottom-6 right-6 w-32 h-48 md:w-48 md:h-36 bg-black rounded-lg overflow-hidden shadow-lg border-2 border-white/20">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center space-y-4 text-white">
                  <div className="w-28 h-28 bg-gray-800 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-blue-500 animate-pulse">
                    {activeCallUser?.name?.[0]?.toUpperCase() || selectedUser?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <h2 className="text-2xl font-semibold">{activeCallUser?.name || selectedUser?.name || "User"}</h2>
                  <p className="text-gray-400">Ongoing audio call...</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-black/40 flex justify-center items-center space-x-6">
              <button
                onClick={() => cleanupCall(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-medium shadow-lg transition transform active:scale-95"
              >
                End Call
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;