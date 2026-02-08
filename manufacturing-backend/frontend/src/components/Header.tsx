import { Bell, User } from "lucide-react";

interface HeaderProps {
    isConnected: boolean;
}

export default function Header({ isConnected }: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <span className="text-sm font-medium text-slate-400 hover:text-white cursor-pointer">
                                Manufacturing
                            </span>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <span className="text-slate-600">/</span>
                                <span className="ml-1 text-sm font-medium text-white md:ml-2">
                                    Live Monitoring
                                </span>
                            </div>
                        </li>
                    </ol>
                </nav>
            </div>

            <div className="flex items-center gap-4">
                {/* Status Indicator */}
                <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border transition-colors duration-300 ${isConnected
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : "border-rose-500/20 bg-rose-500/10 text-rose-400"
                    }`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></div>
                    {isConnected ? "LIVE FEED" : "DISCONNECTED"}
                </div>

                <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                    <Bell size={20} />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500"></span>
                </button>

                <div className="h-8 w-px bg-slate-800 mx-1"></div>

                <div className="h-4 w-px bg-slate-800 mx-1 opacity-0"></div>
            </div>
        </header>
    );
}
