import { useEffect, useState, useRef } from "react";
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
  const [activeModal, setActiveModal] = useState(null); // { type: 'block' | 'delete', user: object }
  const menuRef = useRef(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
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

  // REMOVE CONTACT ACTION
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
    <div className="flex flex-col h-full relative">
      {/* SEARCH BOX */}
      <div className="p-4 shrink-0">
        <input
          type="text"
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-300 bg-gray-100 outline-none focus:ring-2 focus:ring-violet-500 text-sm"
        />
      </div>

      {/* SEARCH RESULTS */}
      {searchQuery.trim() && (
        <div className="px-3 pb-2 overflow-y-auto">
          {searchLoading ? (
            <p className="text-center text-gray-500 text-sm py-3">Searching...</p>
          ) : searchResults.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-3">No user found</p>
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
                  className="flex items-center gap-3 p-3 rounded-xl mb-2 hover:bg-violet-50 transition"
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-violet-600 text-white flex items-center justify-center font-bold text-lg">
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
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold truncate text-sm">{user.name}</h2>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>

                  {isContact ? (
                    <button
                      onClick={() => {
                        onSelectUser(user);
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className="px-3 py-2 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600"
                    >
                      Chat
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSendRequest(user._id)}
                      className="px-3 py-2 bg-violet-600 text-white text-xs rounded-lg hover:bg-violet-700"
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
        <div className="flex-1 overflow-y-auto px-3">
          {filteredContacts.length === 0 ? (
            <p className="text-center text-gray-500 mt-10 text-sm">No contacts found</p>
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
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer mb-2 transition relative ${
                    isSelected ? "bg-violet-100" : "hover:bg-violet-50"
                  }`}
                >
                  {/* PROFILE */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-violet-600 text-white flex items-center justify-center font-bold text-lg">
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
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>

                  {/* USER DETAILS */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold truncate text-sm flex-1">
                        {user.name}
                      </h2>

                      {lastMessage && (
                        <span className="text-xs text-gray-400 shrink-0">
                          {formatTime(lastMessage.createdAt || lastMessage.updatedAt)}
                        </span>
                      )}

                      {/* 3 DOTS MENU BUTTON */}
                      <div
                        className="relative shrink-0"
                        ref={activeMenuId === userId ? menuRef : null}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === userId ? null : userId);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 text-lg shrink-0 transition"
                          title="Options"
                        >
                          ⋮
                        </button>

                        {/* REAL-TIME DROPDOWN MENU */}
                        {activeMenuId === userId && (
                          <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-40">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                setActiveModal({ type: "block", user });
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-600 flex items-center gap-2"
                            >
                              🚫 Block Contact
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                setActiveModal({ type: "delete", user });
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              🗑️ Delete Contact
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* LAST MESSAGE + UNREAD */}
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-sm text-gray-500 truncate">
                        {lastMessage ? lastMessage.message : "No messages yet"}
                      </p>

                      {unreadCount > 0 && (
                        <span className="min-w-6 h-6 px-2 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-3 text-xl">
              {activeModal.type === "block" ? "🚫" : "🗑️"}
            </div>

            <h3 className="text-base font-bold text-gray-800">
              {activeModal.type === "block"
                ? `Block ${activeModal.user?.name}?`
                : `Delete ${activeModal.user?.name}?`}
            </h3>

            <p className="text-xs text-gray-500 mt-1 mb-5">
              {activeModal.type === "block"
                ? "This user will no longer be able to send you messages."
                : `Remove ${activeModal.user?.name} from your contacts list?`}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
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
                className={`flex-1 py-2 text-xs font-semibold rounded-xl text-white transition ${
                  activeModal.type === "block"
                    ? "bg-violet-600 hover:bg-violet-700"
                    : "bg-red-600 hover:bg-red-700"
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