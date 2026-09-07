import { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";

function MessageInput({
  message,
  setMessage,
  selectedUser,
  currentUserId,
  onSendMessage,
  socket,
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (selectedUser && value.trim() && socket) {
      socket.emit("typing", {
        senderId: currentUserId,
        receiverId: selectedUser._id,
      });
    } else if (selectedUser && socket) {
      socket.emit("stopTyping", {
        senderId: currentUserId,
        receiverId: selectedUser._id,
      });
    }
  };

  const handleBlur = () => {
    if (selectedUser && socket) {
      socket.emit("stopTyping", {
        senderId: currentUserId,
        receiverId: selectedUser._id,
      });
    }
  };

  const handleSend = () => {
    if (!message.trim() && !selectedFile) return;

    if (selectedFile) {
      onSendMessage(message.trim(), selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else if (message.trim()) {
      onSendMessage(message.trim());
    }

    setMessage("");
    setShowEmojiPicker(false);

    if (selectedUser && socket) {
      socket.emit("stopTyping", {
        senderId: currentUserId,
        receiverId: selectedUser._id,
      });
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage(file.name);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        onSendMessage("🎤 [Voice Note]", audioUrl);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access error:", error);
      alert("Microphone permission is required to record voice notes.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="relative shrink-0 p-3 sm:p-4 border-t bg-white flex items-center gap-2">
      {/* EMOJI PICKER POPUP */}
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-16 left-4 z-50 shadow-2xl">
          <EmojiPicker onEmojiClick={handleEmojiClick} theme="light" />
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="text-2xl text-gray-500 hover:text-violet-600 transition"
        title="Emoji"
      >
        😊
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,video/*,application/pdf"
      />

      <button
        type="button"
        conClick={() => fileInputRef.current?.click()}
        onClick={() => fileInputRef.current?.click()}
        className="text-xl text-gray-500 hover:text-violet-600 transition p-1"
        title="Attach File"
      >
        📎
      </button>

      <input
        type="text"
        placeholder={isRecording ? "Recording voice note..." : "Type a message..."}
        value={message}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }}
        disabled={isRecording}
        className="flex-1 min-w-0 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-violet-500 text-sm disabled:bg-gray-100"
      />

      {isRecording ? (
        <button
          type="button"
          onClick={stopRecording}
          className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition animate-pulse flex items-center gap-1 font-medium text-sm shrink-0"
        >
          ⏹️ Stop
        </button>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          className="text-2xl text-gray-500 hover:text-violet-600 transition p-2 shrink-0"
          title="Record Voice Note"
        >
          🎤
        </button>
      )}

      <button
        onClick={handleSend}
        disabled={isRecording}
        className="bg-violet-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-violet-700 transition disabled:opacity-50 shrink-0"
      >
        Send
      </button>
    </div>
  );
}

export default MessageInput;