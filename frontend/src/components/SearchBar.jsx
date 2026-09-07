import { useEffect, useState } from "react";
import { searchUsers } from "../services/userService";
import { sendContactRequest } from "../services/contactService";

function Search() {
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [sentRequests, setSentRequests] = useState({}); // Track requested users

  useEffect(() => {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword === "") {
      setUsers([]);
      return;
    }

    // Debounce to prevent too many API calls while typing (fixed to 300ms)
    const timer = setTimeout(() => {
      loadUsers(trimmedKeyword);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [keyword]);

  const loadUsers = async (searchQuery) => {
    try {
      setLoading(true);
      const data = await searchUsers(searchQuery);
      setUsers(data.users || []);
    } catch (error) {
      console.log("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (receiverId) => {
    try {
      await sendContactRequest(receiverId);
      
      // Mark this specific user as request sent
      setSentRequests((prev) => ({ ...prev, [receiverId]: true }));
      setStatusMsg("Contact request sent successfully!");

      setTimeout(() => setStatusMsg(""), 3000);
    } catch (error) {
      setStatusMsg(error.response?.data?.message || "Failed to send request");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-violet-700 mb-5">
          Search Friends
        </h1>

        <input
          type="text"
          placeholder="Search by phone number or name..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm"
        />

        {statusMsg && (
          <p className="mt-3 text-sm text-center font-medium text-violet-600 bg-violet-50 p-2 rounded-lg">
            {statusMsg}
          </p>
        )}

        {loading && (
          <p className="text-center text-gray-400 text-xs mt-4">Searching...</p>
        )}

        <div className="mt-6 space-y-3">
          {users.map((user) => {
            const isRequested = sentRequests[user._id];

            return (
              <div
                key={user._id}
                className="flex justify-between items-center border border-gray-200 bg-gray-50 rounded-xl p-4 shadow-sm"
              >
                <div>
                  <h2 className="font-semibold text-gray-800">{user.name || "User"}</h2>
                  <p className="text-xs text-gray-500">{user.phone}</p>
                </div>

                <button
                  onClick={() => handleAddFriend(user._id)}
                  disabled={isRequested}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                    isRequested
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-violet-600 text-white hover:bg-violet-700"
                  }`}
                >
                  {isRequested ? "Requested ✓" : "Add Friend"}
                </button>
              </div>
            );
          })}

          {!loading && keyword.trim() !== "" && users.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">No users found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;