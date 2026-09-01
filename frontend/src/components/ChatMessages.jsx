import { useEffect, useRef } from "react";

function ChatMessages({
  messages,
  currentUserId,
  isTyping,
  selectedUser,
}) {
  const scrollRef = useRef(null);

  // Automatically scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  const formatDuration = (seconds) => {
    const totalSeconds = Number(seconds) || 0;

    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-400 text-xs shadow-sm bg-white px-4 py-2 rounded-full border">
            No messages yet
          </p>
        </div>
      ) : (
        messages.map((msg, index) => {
          const senderId =
            typeof msg.sender === "object"
              ? msg.sender?._id
              : msg.sender;

          const isMine =
            String(senderId) === String(currentUserId);

          // Message types
          const isVoiceNote =
            msg.type === "audio" || !!msg.audioUrl;

          const isAudioCall =
            msg.type === "audio_call";

          const isVideoCall =
            msg.type === "video_call";

          return (
            <div
              key={msg._id || index}
              className={`flex ${
                isMine ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`relative max-w-[85%] sm:max-w-xs md:max-w-md px-3.5 py-2 rounded-2xl shadow-sm ${
                  isMine
                    ? "bg-purple-600 text-white rounded-tr-none"
                    : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                }`}
              >
                {/* AUDIO CALL */}
                {isAudioCall ? (
                  <div className={`flex items-center gap-3 p-2 rounded-xl ${isMine ? 'bg-purple-700/50' : 'bg-slate-100'}`}>
                    <div className={`p-2.5 rounded-full ${isMine ? 'bg-purple-500/30 text-white' : 'bg-purple-100 text-purple-600'}`}>
                      📞
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        Audio Call
                      </span>
                      <div className="flex items-center gap-2 text-xs opacity-80">
                        <span>{formatDuration(msg.callDuration)}</span>
                        {msg.callStatus && (
                          <span className="capitalize">
                            • {msg.callStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : isVideoCall ? (
                  /* VIDEO CALL */
                  <div className={`flex items-center gap-3 p-2 rounded-xl ${isMine ? 'bg-purple-700/50' : 'bg-slate-100'}`}>
                    <div className={`p-2.5 rounded-full ${isMine ? 'bg-purple-500/30 text-white' : 'bg-purple-100 text-purple-600'}`}>
                      📹
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        Video Call
                      </span>
                      <div className="flex items-center gap-2 text-xs opacity-80">
                        <span>{formatDuration(msg.callDuration)}</span>
                        {msg.callStatus && (
                          <span className="capitalize">
                            • {msg.callStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : isVoiceNote ? (
                  /* VOICE NOTE */
                  <div className="flex flex-col gap-1.5 py-1">
                    <span className="text-xs font-medium flex items-center gap-1.5 opacity-90">
                      🎤 Voice Message
                    </span>

                    {msg.audioUrl ? (
                      <audio
                        controls
                        src={msg.audioUrl}
                        className="w-56 h-9 rounded-md outline-none"
                      >
                        Your browser does not support the audio element.
                      </audio>
                    ) : (
                      <span className="text-xs italic opacity-70">
                        Audio not available
                      </span>
                    )}
                  </div>
                ) : (
                  /* TEXT MESSAGE */
                  <div className="break-words text-[14.5px] leading-relaxed">
                    {msg.message}
                  </div>
                )}

                {/* TIME + READ RECEIPT */}
                <div
                  className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${
                    isMine ? "text-purple-200" : "text-slate-400"
                  }`}
                >
                  <span>
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>

                  {isMine && (
                    <span className="text-[12px] leading-none ml-0.5">
                      {msg.isRead ? (
                        <span className="text-purple-200">✓✓</span>
                      ) : (
                        "✓"
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* TYPING INDICATOR */}
      {isTyping && (
        <div className="flex justify-start">
          <div className="bg-white border border-slate-100 px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              {selectedUser?.name || "Someone"} is typing
            </span>
            <div className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        </div>
      )}

      {/* AUTO SCROLL ANCHOR */}
      <div ref={scrollRef} />
    </div>
  );
}

export default ChatMessages;