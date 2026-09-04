import { useEffect, useState } from "react";
import { searchUsers } from "../services/userService";
import { sendContactRequest } from "../services/contactService";

function Search() {
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    if (keyword.trim() === "") {
      setUsers([]);
      return;
    }

    loadUsers();
  }, [keyword]);

  const loadUsers = async () => {
    try {
      const data = await searchUsers(keyword);
      setUsers(data.users || []);
    } catch (error) {
      console.log(error.response?.data || error.message);
      setUsers([]);
    }
  };

  const handleRequest = async (receiverId) => {
    try {
      setLoadingId(receiverId);

      const data = await sendContactRequest(receiverId);
      alert(data.message || "Request Sent Successfully ✅");
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert(error.response?.data?.message || "Request Failed ❌");
    } finally {
      setLoadingId(null);
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
          placeholder="Search by name or phone..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-violet-500"
        />

        <div className="mt-6 space-y-3">
          {keyword.trim() !== "" && users.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No users found</p>
          ) : (
            users.map((user) => (
              <div
                key={user._id}
                className="flex justify-between items-center border rounded-xl p-4 shadow-sm"
              >
                <div>
                  <h2 className="font-semibold text-gray-800">{user.name || "User"}</h2>
                  <p className="text-sm text-gray-500">{user.phone}</p>
                </div>

                <button
                  onClick={() => handleRequest(user._id)}
                  disabled={loadingId === user._id}
                  className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 disabled:bg-gray-400 transition font-medium text-sm"
                >
                  {loadingId === user._id ? "Sending..." : "Add Friend"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;