import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideNav from "../components/SideNav";

function SettingsPage() {
  const [activeTab, setActiveTab] = useState("settings");
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [enterToSend, setEnterToSend] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  // Modals State
  const [showBlockedContacts, setShowBlockedContacts] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Sample blocked contacts list
  const [blockedUsers, setBlockedUsers] = useState([
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Alex Smith", email: "alex@example.com" },
  ]);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Unblock user handler
  const handleUnblock = (id) => {
    setBlockedUsers(blockedUsers.filter((user) => user.id !== id));
  };

  return (
    <div
      className={`flex w-screen h-screen overflow-hidden ${
        darkMode ? "bg-gray-900 text-white" : "bg-slate-50 text-gray-800"
      }`}
    >
      {/* SIDE NAV */}
      <SideNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* SETTINGS PANEL (LEFT SIDEBAR) */}
      <div
        className={`w-full md:w-80 h-full flex flex-col border-r ${
          darkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b ${
            darkMode ? "border-gray-700" : "border-gray-100"
          }`}
        >
          <h1
            className={`text-xl font-bold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Settings
          </h1>
          <p
            className={`text-xs mt-1 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Manage your account and preferences
          </p>
        </div>

        {/* Settings List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* PROFILE */}
          <div
            onClick={() => navigate("/profile")}
            className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition border ${
              darkMode
                ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                : "bg-slate-50 border-slate-100 hover:bg-violet-50"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-lg">
              👤
            </div>
            <div className="min-w-0">
              <h5
                className={`font-semibold text-sm ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Profile
              </h5>
              <p
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Update your name, email & photo
              </p>
            </div>
            <span className="ml-auto text-gray-400 text-lg">›</span>
          </div>

          {/* NOTIFICATIONS */}
          <div
            className={`flex items-center justify-between p-3.5 rounded-xl border ${
              darkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-slate-50 border-slate-100"
            }`}
          >
            <div>
              <h5
                className={`font-semibold text-sm ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Notifications
              </h5>
              <p
                className={`text-xs mt-0.5 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Enable message notifications
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
              className="w-4 h-4 accent-violet-600 cursor-pointer"
            />
          </div>

          {/* DARK MODE */}
          <div
            className={`flex items-center justify-between p-3.5 rounded-xl border ${
              darkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-slate-50 border-slate-100"
            }`}
          >
            <div>
              <h5
                className={`font-semibold text-sm ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Dark Mode
              </h5>
              <p
                className={`text-xs mt-0.5 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Switch application theme
              </p>
            </div>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              className="w-4 h-4 accent-violet-600 cursor-pointer"
            />
          </div>

          {/* PRIVACY */}
          <div
            className={`p-3.5 rounded-xl border ${
              darkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-slate-50 border-slate-100"
            }`}
          >
            <h5
              className={`font-semibold text-sm mb-2 ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              🔒 Privacy
            </h5>

            <div className="flex items-center justify-between py-1.5">
              <div>
                <p
                  className={`text-xs font-medium ${
                    darkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  Online Status
                </p>
                <p
                  className={`text-[11px] ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Show when you are online
                </p>
              </div>
              <input
                type="checkbox"
                checked={showOnlineStatus}
                onChange={() => setShowOnlineStatus(!showOnlineStatus)}
                className="w-4 h-4 accent-violet-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-1.5 mt-1 border-t border-slate-200/50 dark:border-gray-600/50">
              <div>
                <p
                  className={`text-xs font-medium ${
                    darkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  Read Receipts
                </p>
                <p
                  className={`text-[11px] ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Show message read status
                </p>
              </div>
              <input
                type="checkbox"
                checked={readReceipts}
                onChange={() => setReadReceipts(!readReceipts)}
                className="w-4 h-4 accent-violet-600 cursor-pointer"
              />
            </div>
          </div>

          {/* CHATS */}
          <div
            className={`p-3.5 rounded-xl border ${
              darkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-slate-50 border-slate-100"
            }`}
          >
            <h5
              className={`font-semibold text-sm mb-2 ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              💬 Chats
            </h5>

            <div className="flex items-center justify-between py-1.5">
              <div>
                <p
                  className={`text-xs font-medium ${
                    darkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  Enter to Send
                </p>
                <p
                  className={`text-[11px] ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Press Enter to send messages
                </p>
              </div>
              <input
                type="checkbox"
                checked={enterToSend}
                onChange={() => setEnterToSend(!enterToSend)}
                className="w-4 h-4 accent-violet-600 cursor-pointer"
              />
            </div>
          </div>

          {/* PREFERENCES / ACCOUNT & SUPPORT */}
          <div
            className={`p-3.5 rounded-xl border ${
              darkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-slate-50 border-slate-100"
            }`}
          >
            <h5
              className={`font-semibold text-sm mb-2 ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              ⚙️ Preferences
            </h5>

            {/* BLOCKED CONTACTS */}
            <div
              onClick={() => setShowBlockedContacts(true)}
              className={`flex items-center justify-between py-1.5 cursor-pointer ${
                darkMode
                  ? "text-gray-200 hover:text-white"
                  : "text-gray-700 hover:text-violet-600"
              }`}
            >
              <span className="text-xs font-medium">Blocked Contacts</span>
              <span className="text-gray-400">›</span>
            </div>

            {/* HELP & SUPPORT */}
            <div
              onClick={() => setShowHelpModal(true)}
              className={`flex items-center justify-between py-1.5 cursor-pointer border-t border-slate-200/50 dark:border-gray-600/50 ${
                darkMode
                  ? "text-gray-200 hover:text-white"
                  : "text-gray-700 hover:text-violet-600"
              }`}
            >
              <span className="text-xs font-medium">Help & Support</span>
              <span className="text-gray-400">›</span>
            </div>
          </div>

          {/* LOGOUT */}
          <div
            onClick={handleLogout}
            className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer hover:bg-red-50 transition border border-red-100 text-red-600 mt-2"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-lg">
              🚪
            </div>
            <div>
              <h5 className="font-semibold text-sm">Log Out</h5>
              <p className="text-xs text-red-400">Sign out from your account</p>
            </div>
            <span className="ml-auto text-red-400 text-lg">›</span>
          </div>

          <p
            className={`text-center text-[11px] py-2 ${
              darkMode ? "text-gray-500" : "text-gray-400"
            }`}
          >
            SyncChat • Version 1.0.0
          </p>
        </div>
      </div>

      {/* HELP & SUPPORT MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-md p-6 rounded-2xl shadow-xl ${
              darkMode
                ? "bg-gray-800 text-white border border-gray-700"
                : "bg-white text-gray-800"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Help & Support</h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-red-500 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div
                className={`p-3 rounded-xl border ${
                  darkMode ? "bg-gray-700/50 border-gray-600" : "bg-slate-50 border-slate-200"
                }`}
              >
                <h4 className="font-semibold text-xs text-violet-600 dark:text-violet-400">
                  ❓ Need help?
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                  For support, reach out to us at <strong>support@syncchat.com</strong>
                </p>
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  darkMode ? "bg-gray-700/50 border-gray-600" : "bg-slate-50 border-slate-200"
                }`}
              >
                <h4 className="font-semibold text-xs text-violet-600 dark:text-violet-400">
                  🔒 Privacy & Security
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                  Your chats and calls are processed securely within your network session.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BLOCKED CONTACTS MODAL */}
      {showBlockedContacts && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-md p-6 rounded-2xl shadow-xl ${
              darkMode
                ? "bg-gray-800 text-white border border-gray-700"
                : "bg-white text-gray-800"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Blocked Contacts</h2>
              <button
                onClick={() => setShowBlockedContacts(false)}
                className="text-gray-400 hover:text-red-500 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {blockedUsers.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-6">
                  No blocked contacts
                </p>
              ) : (
                blockedUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      darkMode
                        ? "bg-gray-700/50 border-gray-600"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div>
                      <h4 className="text-sm font-semibold">{user.name}</h4>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>

                    <button
                      onClick={() => handleUnblock(user.id)}
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold rounded-lg transition"
                    >
                      Unblock
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* CENTER PLACEHOLDER PANEL */}
      <div
        className={`hidden md:flex flex-1 h-full items-center justify-center ${
          darkMode ? "bg-gray-900" : "bg-slate-50"
        }`}
      >
        <div className="text-center p-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-violet-100 flex items-center justify-center text-4xl mb-4 text-violet-600">
            ⚙️
          </div>
          <p
            className={`text-2xl font-bold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Settings
          </p>
          <p
            className={`text-xs mt-1 max-w-xs mx-auto ${
              darkMode ? "text-gray-400" : "text-gray-400"
            }`}
          >
            Manage your account, privacy and chat preferences
          </p>

          <div className="flex justify-center gap-2 mt-6">
            <span className="px-3.5 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold">
              🔔 Notifications
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold">
              🔒 Privacy
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold">
              💬 Chats
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;