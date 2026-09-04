import React from "react";

function CallScreen({
  isCalling,
  incomingCall,
  callType,
  activeCallUser,
  selectedUser,
  localVideoRef,
  remoteVideoRef,
  remoteAudioRef,
  onAccept,
  onReject,
  onEndCall,
}) {
  return (
    <>
      {/* Hidden global audio element for audio calls */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Incoming Call Overlay */}
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
                onClick={onReject}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-lg font-medium hover:bg-red-600 transition"
              >
                Decline
              </button>
              <button
                onClick={onAccept}
                className="flex-1 bg-green-500 text-white py-2.5 rounded-lg font-medium hover:bg-green-600 transition"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Call Screen */}
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
                  {activeCallUser?.name?.[0]?.toUpperCase() ||
                    selectedUser?.name?.[0]?.toUpperCase() ||
                    "U"}
                </div>
                <h2 className="text-2xl font-semibold">
                  {activeCallUser?.name || selectedUser?.name || "User"}
                </h2>
                <p className="text-gray-400">Ongoing audio call...</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-black/40 flex justify-center items-center space-x-6">
            <button
              onClick={onEndCall}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-medium shadow-lg transition transform active:scale-95"
            >
              End Call
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default CallScreen;