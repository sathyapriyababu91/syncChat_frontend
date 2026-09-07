import { useNavigate, useLocation } from "react-router-dom";

function SideNav({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: "chats",
      icon: "💬",
      label: "Chats",
      path: "/home",
    },
    {
      id: "calls",
      icon: "📞",
      label: "Calls",
      path: "/calls",
    },
    {
      id: "status",
      icon: "🟢",
      label: "Status",
      path: "/status",
    },
  ];

  const bottomItems = [
    {
      id: "profile",
      icon: "👤",
      label: "Profile",
      path: "/profile",
    },
    {
      id: "settings",
      icon: "⚙️",
      label: "Settings",
      path: "/settings",
    },
  ];

  const handleNavigation = (id, path) => {
    if (setActiveTab) setActiveTab(id);
    navigate(path);
  };

  // Checks if item is currently active via URL or prop
  const checkIsActive = (item) => {
    if (location.pathname === item.path) return true;
    return activeTab === item.id;
  };

  return (
    <div className="w-18 h-screen bg-gradient-to-b from-violet-700 via-violet-800 to-indigo-900 text-white flex flex-col items-center justify-between py-5 shrink-0 shadow-2xl border-r border-violet-600/30">
      <div className="flex flex-col items-center gap-6 w-full">
        {/* App Logo */}
        <div 
          onClick={() => navigate("/home")}
          className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-violet-900/20 cursor-pointer hover:scale-105 transition-all border border-white/20"
          title="SyncChat Home"
        >
          💬
        </div>

        {/* Top Menu Items */}
        <div className="flex flex-col gap-2.5 w-full px-2.5">
          {menuItems.map((item) => {
            const isActive = checkIsActive(item);
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id, item.path)}
                title={item.label}
                className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center text-xl transition-all duration-200 relative group ${
                  isActive
                    ? "bg-white text-violet-700 shadow-lg shadow-black/10 scale-105 font-bold"
                    : "hover:bg-white/10 text-violet-200 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {/* Tooltip on hover */}
                <span className="absolute left-16 bg-gray-900 text-white text-[10px] font-semibold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md z-50">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Menu Items */}
      <div className="flex flex-col gap-2.5 w-full px-2.5">
        {bottomItems.map((item) => {
          const isActive = checkIsActive(item);
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id, item.path)}
              title={item.label}
              className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center text-xl transition-all duration-200 relative group ${
                isActive
                  ? "bg-white text-violet-700 shadow-lg shadow-black/10 scale-105 font-bold"
                  : "hover:bg-white/10 text-violet-200 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {/* Tooltip on hover */}
              <span className="absolute left-16 bg-gray-900 text-white text-[10px] font-semibold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md z-50">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SideNav;