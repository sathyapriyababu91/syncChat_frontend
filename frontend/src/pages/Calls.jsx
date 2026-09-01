import { useEffect, useState } from "react";
import { getCallHistory } from "../services/messageService";

function Calls({ onStartAudioCall, onStartVideoCall }) {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = localStorage.getItem("userId");

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const data = await getCallHistory();
      setCalls(data.calls || data || []);
    } catch (error) {
      console.error("Failed to fetch call history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const formatCallTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeString = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) return `Today, ${timeString}`;
    if (isYesterday) return `Yesterday, ${timeString}`;
    return `${date.toLocaleDateString()} ${timeString}`;
  };

  const handleRedial = (partner, rawType) => {
    if (!partner) return;
    if (rawType === "video" || rawType === "video_call") {
      onStartVideoCall?.(partner);
    } else {
      onStartAudioCall?.(partner);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `http://localhost:5000${cleanPath}`;
  };

  return (
    <div className="flex-1 bg-white flex flex-col min-w-0">
      {/* Header */}
      <div className="h-16 border-b border-gray-200 flex items-center px-6 shrink-0">
        <h1 className="text-xl font-semibold text-gray-800">Calls</h1>
      </div>

      {/* Calls List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p>Loading call history...</p>
          </div>
        ) : calls.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <div className="text-6xl mb-4">📞</div>
            <h2 className="text-xl font-semibold">No calls yet</h2>
            <p className="text-sm mt-2">Your call history will appear here</p>
          </div>
        ) : (
          calls.map((call) => {
            const senderObj = call.sender || call.caller;
            const senderId = typeof senderObj === "object" ? senderObj?._id : senderObj;
            const isOutgoing = String(senderId) === String(currentUserId);
            const partner = isOutgoing ? call.receiver : senderObj;

            const rawType = call.type || call.callType;
            const isVideo = rawType === "video" || rawType === "video_call";

            return (
              <div
                key={call._id || call.id}
                className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                onClick={() => handleRedial(partner, rawType)}
              >
                {/* Avatar Section */}
                {partner?.profilePic ? (
                  <img
                    src={getImageUrl(partner.profilePic)}
                    alt={partner?.name || "User"}
                    className="w-12 h-12 rounded-full object-cover shrink-0 border border-gray-200"
                    onError={(e) => {
                      // Image error வந்தால் உடைந்த image icon தெரியாமல் தவிர்க்க avatar UI-க்கு மாற்றுதல்
                      e.target.style.display = "none";
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = "flex";
                      }
                    }}
                  />
                ) : null}

                {/* Fallback Letter Avatar */}
                <div
                  className="w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center text-lg font-semibold shrink-0"
                  style={{ display: partner?.profilePic ? "none" : "flex" }}
                >
                  {partner?.name?.charAt(0).toUpperCase() || "U"}
                </div>

                {/* Details */}
                <div className="flex-1 ml-4 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {partner?.name || "Unknown User"}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                    <span className={isOutgoing ? "text-green-600" : "text-blue-600"}>
                      {isOutgoing ? "↗️ Outgoing" : "↙️ Incoming"}
                    </span>
                    <span>•</span>
                    <span>{formatCallTime(call.createdAt || call.timestamp)}</span>
                  </div>
                </div>

                {/* Call Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRedial(partner, rawType);
                  }}
                  className="w-10 h-10 rounded-full hover:bg-violet-100 flex items-center justify-center text-xl transition text-violet-600"
                  title={isVideo ? "Start Video Call" : "Start Audio Call"}
                >
                  {isVideo ? "📹" : "📞"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Calls;