import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    type?: 'default' | 'success' | 'danger';
}

export default function StatsCard({ title, value, type = 'default' }: StatsCardProps) {
    // Determine color scheme based on title/type for visual variety
    let colorClass = "text-blue-400";
    let bgClass = "bg-blue-500/10";

    if (type === "success" || title.includes("Pass")) {
        colorClass = "text-emerald-400";
        bgClass = "bg-emerald-500/10";
    } else if (type === "danger" || title.includes("Fail")) {
        colorClass = "text-rose-400";
        bgClass = "bg-rose-500/10";
    } else if (title.includes("Total")) {
        colorClass = "text-indigo-400";
        bgClass = "bg-indigo-500/10";
    }

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm transition-all hover:border-slate-700 hover:shadow-lg hover:shadow-blue-900/10">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-400">{title}</p>
                    <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</h3>
                </div>
                <div className={`rounded-xl p-3 ${bgClass} ${colorClass}`}>
                    <Activity size={24} />
                </div>
            </div>

            {/* Decorative background glow */}
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${bgClass} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`}></div>

            <div className="mt-4 flex items-center gap-2">
                {TypeToTrend(type)}
            </div>
        </div>
    );
}

function TypeToTrend(type: string) {
    if (type === 'success') {
        return (
            <>
                <span className="flex items-center text-xs font-medium text-emerald-400">
                    <ArrowUpRight size={14} className="mr-1" />
                    +2.5%
                </span>
                <span className="text-xs text-slate-500">from last hour</span>
            </>
        )
    }
    if (type === 'danger') {
        return (
            <>
                <span className="flex items-center text-xs font-medium text-rose-400">
                    <ArrowDownRight size={14} className="mr-1" />
                    +0.8%
                </span>
                <span className="text-xs text-slate-500">defect rate</span>
            </>
        )
    }
    return (
        <span className="text-xs text-slate-500">Updated just now</span>
    )
}
