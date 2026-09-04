import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    
    localStorage.removeItem("token");
    localStorage.removeItem("user"); 
    
    navigate("/");
  };

  return (
    <div className="flex justify-between items-center bg-violet-600 text-white px-6 py-4 shadow-md">
      <h1 className="text-xl sm:text-2xl font-bold tracking-wide">SyncChat</h1>

      <button
        onClick={logout}
        className="bg-red-500 hover:bg-red-600 transition text-sm font-semibold px-4 py-2 rounded-xl shadow-sm"
      >
        Logout
      </button>
    </div>
  );
}

export default Navbar;