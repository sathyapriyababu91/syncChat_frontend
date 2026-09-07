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
    <div className="w-16 h-screen bg-violet-700 text-white flex flex-col items-center justify-between py-4 shrink-0 shadow-lg">
      <div className="flex flex-col items-center gap-6 w-full">
        {/* App Logo */}
        <div 
          onClick={() => navigate("/home")}
          className="w-10 h-10 rounded-xl bg-white text-violet-700 flex items-center justify-center text-xl font-bold shadow-md cursor-pointer hover:scale-105 transition-transform"
        >
          💜
        </div>

        {/* Top Menu Items */}
        <div className="flex flex-col gap-3 w-full px-2">
          {menuItems.map((item) => {
            const isActive = checkIsActive(item);
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id, item.path)}
                title={item.label}
                className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-xl transition-all duration-200 ${
                  isActive
                    ? "bg-white text-violet-700 shadow-lg scale-105 font-bold"
                    : "hover:bg-violet-600/80 text-violet-200 hover:text-white"
                }`}
              >
                {item.icon}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Menu Items */}
      <div className="flex flex-col gap-3 w-full px-2">
        {bottomItems.map((item) => {
          const isActive = checkIsActive(item);
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id, item.path)}
              title={item.label}
              className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-xl transition-all duration-200 ${
                isActive
                  ? "bg-white text-violet-700 shadow-lg scale-105 font-bold"
                  : "hover:bg-violet-600/80 text-violet-200 hover:text-white"
              }`}
            >
              {item.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SideNav;