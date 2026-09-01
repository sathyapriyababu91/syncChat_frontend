import { useNavigate } from "react-router-dom";

function SideNav({ activeTab, setActiveTab }) {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: "chats",
      icon: "💬",
      label: "Chats",
      onClick: () => navigate("/home"), 
    },
    {
      id: "calls",
      icon: "📞",
      label: "Calls",
      onClick: () => navigate("/calls"),
    },
    {
      id: "status",
      icon: "🟢",
      label: "Status",
      onClick: () => navigate("/status"), 
    },
  ];

  return (
    <div className="w-16 h-screen bg-violet-700 text-white flex flex-col items-center justify-between py-4 shrink-0">
      <div className="flex flex-col items-center gap-6 w-full">
        <div className="w-10 h-10 rounded-xl bg-white text-violet-700 flex items-center justify-center text-xl font-bold shadow-md">
          💜
        </div>

        <div className="flex flex-col gap-2 w-full px-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (item.onClick) {
                  item.onClick(); 
                }
              }}
              title={item.label}
              className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-xl transition ${
                activeTab === item.id
                  ? "bg-white text-violet-700 shadow-md"
                  : "hover:bg-violet-600 text-violet-200"
              }`}
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full px-2">
        <button
          onClick={() => navigate("/profile")}
          title="Profile"
          className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-xl hover:bg-violet-600 text-violet-200 transition"
        >
          👤
        </button>

        <button
          onClick={() => navigate("/settings")}
          title="Settings"
          className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-xl hover:bg-violet-600 text-violet-200 transition"
        >
          ⚙️
        </button>
      </div>
    </div>
  );
}

export default SideNav;