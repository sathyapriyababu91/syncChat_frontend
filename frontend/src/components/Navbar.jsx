import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  // Optionally, you can grab the user info to display their name
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); 
    navigate("/");
  };

  return (
    <div className="flex justify-between items-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3.5 shadow-lg border-b border-violet-500/20 shrink-0">
      {/* APP LOGO / TITLE */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-lg shadow-inner">
          💬
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-wide">SyncChat</h1>
          <p className="text-[11px] text-violet-200 font-medium">Real-time Messaging</p>
        </div>
      </div>

      {/* RIGHT SIDE: USER INFO & LOGOUT */}
      <div className="flex items-center gap-4">
        {user?.name && (
          <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-2xl backdrop-blur-md border border-white/10">
            <div className="w-7 h-7 rounded-xl bg-white text-violet-600 font-bold flex items-center justify-center text-xs shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-violet-50 max-w-[120px] truncate">
              {user.name}
            </span>
          </div>
        )}

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 transition text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-red-500/20 flex items-center gap-1.5"
          title="Logout"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;