import { useEffect, useState } from "react";
import { getMessages } from "../services/messageService";
import { searchUsers } from "../services/userService";
import { sendRequest, removeContact } from "../services/contactService";

function ChatSidebar({
  contacts = [],
  currentUserId,
  onlineUsers = [],
  unreadCounts = {},
  selectedUser,
  onSelectUser,
  onDeleteContact,
}) {
  const [lastMessages, setLastMessages] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // DROPDOWN & CUSTOM MODAL STATES
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  // Close dropdown menu when clicking outside anywhere on the document
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".menu-container")) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // LOAD LAST MESSAGES
  useEffect(() => {
    let isMounted = true;

    const loadLastMessages = async () => {
      const result = {};

      await Promise.all(
        contacts.map(async (contact) => {
          const user =
            String(contact.sender?._id) === String(currentUserId)
              ? contact.receiver
              : contact.sender;

          if (!user?._id) return;

          try {
            const data = await getMessages(user._id);
            const messages = data.messages || data || [];

            if (Array.isArray(messages) && messages.length > 0) {
              result[String(user._id)] = messages[messages.length - 1];
            }
          } catch (error) {
            console.log("Failed to load last message for user:", user._id, error);
          }
        })
      );

      if (isMounted) {
        setLastMessages(result);
      }
    };

    if (contacts.length > 0) {
      loadLastMessages();
    } else {
      setLastMessages({});
    }

    return () => {
      isMounted = false;
    };
  }, [contacts, currentUserId]);

  // SEARCH USERS
  useEffect(() => {
    const search = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setSearchLoading(true);
        const data = await searchUsers(searchQuery.trim());
        const users = data.users || data || [];

        const filteredUsers = Array.isArray(users)
          ? users.filter((user) => String(user._id) !== String(currentUserId))
          : [];

        setSearchResults(filteredUsers);
      } catch (error) {
        console.log("Search users failed:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, currentUserId]);

  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSendRequest = async (receiverId) => {
    try {
      const data = await sendRequest(receiverId);
      alert(data.message || "Friend request sent!");
    } catch (error) {
      alert(
        error.response?.data?.message || "Failed to send friend request"
      );
    }
  };

  const handleRemoveContact = async (user) => {
    try {
      const data = await removeContact(user._id);
      alert(data.message || "Contact removed!");

      if (onDeleteContact) {
        onDeleteContact(user._id);
      }
    } catch (error) {
      console.error("Remove contact error:", error.response?.data || error);
      alert(
        error.response?.data?.message || "Failed to remove contact"
      );
    } finally {
      setActiveModal(null);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const user =
      String(contact.sender?._id) === String(currentUserId)
        ? contact.receiver
        : contact.sender;

    return user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full relative bg-white/60 backdrop-blur-md border-r border-gray-100">
      {/* SEARCH BOX */}
      <div className="p-4 shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50/80 outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white text-sm transition shadow-sm"
          />
          <span className="absolute left-3.5 top-3.5 text-gray-400 text-sm">🔍</span>
        </div>
      </div>

      {/* SEARCH RESULTS */}
      {searchQuery.trim() && (
        <div className="px-3 pb-2 overflow-y-auto">
          {searchLoading ? (
            <p className="text-center text-gray-400 text-xs py-4">Searching users...</p>
          ) : searchResults.length === 0 ? (
            <p className="text-center text-gray-400 text-xs py-4">No users found</p>
          ) : (
            searchResults.map((user) => {
              const userId = String(user._id);
              const isOnline = onlineUsers.map(String).includes(userId);
              const isContact = contacts.some((contact) => {
                const contactUser =
                  String(contact.sender?._id) === String(currentUserId)
                    ? contact.receiver
                    : contact.sender;
                return String(contactUser?._id) === userId;
              });

              return (
                <div
                  key={userId}
                  className="flex items-center gap-3 p-3 rounded-2xl mb-2 hover:bg-violet-50/60 transition border border-transparent hover:border-violet-100 shadow-xs"
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-violet-500/20">
                      {user.profilePic ? (
                        <img
                          src={`https://syncchat-rfzq.onrender.com${user.profilePic.startsWith("/") ? "" : "/"}${user.profilePic}`}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    {isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold truncate text-sm text-gray-800">{user.name}</h2>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>

                  {isContact ? (
                    <button
                      onClick={() => {
                        onSelectUser(user);
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className="px-3.5 py-2 bg-emerald-500 text-white text-xs font-medium rounded-xl hover:bg-emerald-600 shadow-sm transition"
                    >
                      Chat
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSendRequest(user._id)}
                      className="px-3.5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-medium rounded-xl hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/20 transition"
                    >
                      Add
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* CONTACT LIST */}
      {!searchQuery.trim() && (
        <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
          {filteredContacts.length === 0 ? (
            <div className="text-center mt-12 px-4">
              <div className="w-16 h-16 bg-violet-50 text-violet-500 rounded-3xl flex items-center justify-center mx-auto mb-3 text-2xl">💬</div>
              <p className="text-gray-600 font-medium text-sm">No conversations yet</p>
              <p className="text-gray-400 text-xs mt-1">Search above to find and add friends!</p>
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const user =
                String(contact.sender?._id) === String(currentUserId)
                  ? contact.receiver
                  : contact.sender;

              if (!user) return null;

              const userId = String(user._id);
              const isOnline = onlineUsers.map(String).includes(userId);
              const lastMessage = lastMessages[userId];
              const isSelected = selectedUser && String(selectedUser._id) === userId;
              const unreadCount = unreadCounts?.[userId] || 0;

              return (
                <div
                  key={contact._id || userId}
                  onClick={() => onSelectUser(user)}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer mb-2 transition relative group border ${
                    isSelected
                      ? "bg-gradient-to-r from-violet-50/90 to-indigo-50/50 border-violet-200/80 shadow-sm"
                      : "bg-transparent border-transparent hover:bg-violet-50/40"
                  }`}
                >
                  {/* PROFILE */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-violet-500/15">
                      {user.profilePic ? (
                        <img
                          src={`http://localhost:5000${user.profilePic}`}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    {isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs"></span>
                    )}
                  </div>

                  {/* USER DETAILS */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold truncate text-sm text-gray-800 flex-1">
                        {user.name}
                      </h2>

                      {lastMessage && (
                        <span className="text-[11px] font-medium text-gray-400 shrink-0">
                          {formatTime(lastMessage.createdAt || lastMessage.updatedAt)}
                        </span>
                      )}

                      {/* 3 DOTS MENU BUTTON */}
                      <div className="relative shrink-0 menu-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === userId ? null : userId);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-gray-200/60 text-gray-400 hover:text-gray-700 text-lg shrink-0 transition"
                          title="Options"
                        >
                          ⋮
                        </button>

                        {/* REAL-TIME DROPDOWN MENU */}
                        {activeMenuId === userId && (
                          <div className="absolute right-0 top-8 w-44 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                setActiveModal({ type: "block", user });
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-600 flex items-center gap-2.5 transition"
                            >
                              🚫 Block Contact
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                setActiveModal({ type: "delete", user });
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition"
                            >
                              🗑️ Delete Contact
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* LAST MESSAGE + UNREAD */}
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-xs text-gray-500 truncate font-normal">
                        {lastMessage ? lastMessage.message : "Tap to start conversation"}
                      </p>

                      {unreadCount > 0 && (
                        <span className="min-w-5 h-5 px-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* REAL-TIME CUSTOM MODAL */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center border border-gray-100">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-lg ${
              activeModal.type === "block" 
                ? "bg-violet-100 text-violet-600 shadow-violet-500/10" 
                : "bg-red-100 text-red-600 shadow-red-500/10"
            }`}>
              {activeModal.type === "block" ? "🚫" : "🗑️"}
            </div>

            <h3 className="text-base font-bold text-gray-800">
              {activeModal.type === "block"
                ? `Block ${activeModal.user?.name}?`
                : `Delete ${activeModal.user?.name}?`}
            </h3>

            <p className="text-xs text-gray-500 mt-1.5 mb-6 leading-relaxed">
              {activeModal.type === "block"
                ? "This user will no longer be able to send you messages or interact with you."
                : `Are you sure you want to remove ${activeModal.user?.name} from your contacts list?`}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 text-xs font-semibold rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (activeModal.type === "delete") {
                    handleRemoveContact(activeModal.user);
                  } else {
                    alert(`${activeModal.user?.name} blocked!`);
                    setActiveModal(null);
                  }
                }}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-2xl text-white shadow-md transition ${
                  activeModal.type === "block"
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-violet-500/20"
                    : "bg-red-600 hover:bg-red-700 shadow-red-500/20"
                }`}
              >
                {activeModal.type === "block" ? "Block" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatSidebar;