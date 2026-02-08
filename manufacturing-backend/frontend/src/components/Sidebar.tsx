import { LayoutDashboard, Activity, AlertCircle, Settings, BarChart3, Box } from "lucide-react";

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
        { icon: BarChart3, label: "Analytics", id: "analytics" },
        { icon: Activity, label: "Real-time", id: "realtime" },
        { icon: Box, label: "Machines", id: "machines" },
        { icon: AlertCircle, label: "Alerts", id: "alerts" },
        { icon: Settings, label: "Settings", id: "settings" },
    ];

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-800 bg-slate-950/50 backdrop-blur-xl transition-transform">
            <div className="flex h-16 items-center border-b border-slate-800 px-6">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                        <Activity size={20} />
                    </div>
                    <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        InduMonitor
                    </span>
                </div>
            </div>

            <div className="px-3 py-4">
                <ul className="space-y-1">
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => onTabChange(item.id)}
                                className={`w-full flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group ${activeTab === item.id
                                    ? "bg-blue-600/10 text-blue-400"
                                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                                    }`}
                            >
                                <item.icon
                                    size={20}
                                    className={`mr-3 ${activeTab === item.id ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                                        }`}
                                />
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>


        </aside>
    );
}
