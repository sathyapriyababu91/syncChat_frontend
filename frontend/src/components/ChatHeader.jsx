import React from "react";

function ChatHeader({
  selectedUser,
  isTyping,
  onlineUsers = [],
  onBack,
  onAudioCall,
  onVideoCall,
}) {
  // Safe check with string conversion for online status
  const isOnline = selectedUser
    ? onlineUsers.map(String).includes(String(selectedUser._id))
    : false;

  const handleMenu = () => {
    console.log("⋮ Chat menu clicked");
  };

  if (!selectedUser) return null;

  // Format profile pic URL safely
  const profilePicUrl = selectedUser.profilePic
    ? selectedUser.profilePic.startsWith("http")
      ? selectedUser.profilePic
      : `https://syncchat-rfzq.onrender.com${selectedUser.profilePic.startsWith("/") ? "" : "/"}${selectedUser.profilePic}`
    : null;

  return (
    <div className="flex items-center gap-3 p-3 border-b bg-white">
      {/* Mobile Back Button */}
      <button
        onClick={onBack}
        className="md:hidden text-2xl mr-1 text-gray-600 hover:text-black"
      >
        ←
      </button>

      {/* Profile Avatar */}
      <div className="w-12 h-12 shrink-0 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold overflow-hidden shadow-sm">
        {profilePicUrl ? (
          <img
            src={profilePicUrl}
            alt={selectedUser.name || "User"}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = "none";
            }}
          />
        ) : (
          <span className="text-lg">
            {selectedUser.name?.charAt(0).toUpperCase() || "U"}
          </span>
        )}
      </div>

      {/* User Details */}
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-semibold text-gray-900 truncate leading-tight">
          {selectedUser.name}
        </h2>

        {/* Display Phone instead of Email */}
        <p className="text-xs text-gray-500 truncate">
          {selectedUser.phone || "No phone number"}
        </p>

        <p
          className={`text-xs font-medium ${
            isTyping
              ? "text-violet-600 animate-pulse"
              : isOnline
              ? "text-green-600"
              : "text-gray-400"
          }`}
        >
          {isTyping
            ? "✍️ Typing..."
            : isOnline
            ? "🟢 Online"
            : "Offline"}
        </p>
      </div>

      {/* Action Call Buttons */}
      <div className="flex items-center gap-1">
        {/* Audio Call */}
        <button
          onClick={onAudioCall}
          className="w-10 h-10 rounded-full hover:bg-violet-50 flex items-center justify-center text-xl transition-colors text-violet-600"
          title="Audio Call"
        >
          📞
        </button>

        {/* Video Call */}
        <button
          onClick={onVideoCall}
          className="w-10 h-10 rounded-full hover:bg-violet-50 flex items-center justify-center text-xl transition-colors text-violet-600"
          title="Video Call"
        >
          📹
        </button>

        {/* Menu */}
        <button
          onClick={handleMenu}
          className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-2xl transition-colors text-gray-600"
          title="More Options"
        >
          ⋮
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;