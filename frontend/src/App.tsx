import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsCard from './components/StatsCard';

interface TestResult {
  barcode: string;
  machine_id: string;
  product_id: string;
  measured_value: number;
  status: 'PASS' | 'FAIL';
  timestamp: string;
}

function App() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [stats, setStats] = useState({ total: 0, pass: 0, fail: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    // Initial fetch
    fetch('http://localhost:8000/results')
      .then(res => res.json())
      .then((data: TestResult[]) => setResults(data))
      .catch(err => console.error("API Error:", err));

    fetch('http://localhost:8000/metrics')
      .then(res => res.json())
      .then(data => setStats({ total: data.total_tests, pass: data.pass_count, fail: data.fail_count }))
      .catch(err => console.error("Metrics API Error:", err));

    // WebSocket connection
    const ws = new WebSocket('ws://localhost:8000/ws/live');

    ws.onopen = () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
    };

    ws.onclose = () => {
      setIsConnected(false);
    }

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setIsConnected(false);
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('New result:', data);
      setResults(prev => [data, ...prev].slice(0, 50)); // Keep last 50

      // Update stats optimistically (or re-fetch)
      setStats(prev => ({
        total: prev.total + 1,
        pass: data.status === 'PASS' ? prev.pass + 1 : prev.pass,
        fail: data.status === 'FAIL' ? prev.fail + 1 : prev.fail
      }));
    };

    return () => {
      ws.close();
    };
  }, []);

  // Prepare chart data for AreaChart (mock trend for now, or based on results)
  const areaChartData = results.slice(0, 20).reverse().map((r, i) => ({
    name: i,
    value: r.measured_value,
    status: r.status
  }));

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="ml-64 flex flex-1 flex-col h-screen overflow-hidden">
        <Header isConnected={isConnected} />

        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {activeTab === 'dashboard' ? (
            <div className="mx-auto max-w-7xl space-y-6">

              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <StatsCard title="Total Tests" value={stats.total} type="default" />
                <StatsCard title="Passed Units" value={stats.pass} type="success" />
                <StatsCard title="Failed Units" value={stats.fail} type="danger" />
              </div>

              {/* Charts & Tables Grid */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                {/* Main Chart */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Live Measurement Trend</h3>
                    <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400">Last 20 Tests</span>
                  </div>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={areaChartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" hide />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc' }}
                          itemStyle={{ color: '#3b82f6' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Results Table */}
                <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
                  <div className="border-b border-slate-800 p-6">
                    <h3 className="text-lg font-semibold text-white">Recent Test Results</h3>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                      <thead className="bg-slate-950/50 text-xs uppercase text-slate-500 font-medium tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Barcode</th>
                          <th className="px-6 py-4">Value</th>
                          <th className="px-6 py-4">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {results.map((r, i) => (
                          <tr key={i} className="group hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${r.status === 'PASS'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono text-slate-300 group-hover:text-white">{r.barcode}</td>
                            <td className="px-6 py-4 font-medium text-slate-300">{r.measured_value.toFixed(2)}</td>
                            <td className="px-6 py-4 text-xs">{new Date(r.timestamp).toLocaleTimeString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="p-4 rounded-full bg-slate-900 border border-slate-800">
                <span className="text-4xl">🚧</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white capitalize">{activeTab}</h2>
                <p className="text-slate-400 mt-2 max-w-md">
                  This module is currently under development. The backend services for {activeTab} integration are coming in the next sprint.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
