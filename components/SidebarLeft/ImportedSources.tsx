export const IMPORTED_SOURCES = [
  { id: "src-crowd", name: "Crowd Management Baseline", count: 2, color: "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" },
  { id: "src-evac", name: "Evacuation Routes Baseline", count: 1, color: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" },
  { id: "src-vip", name: "VIP Security Baseline", count: 1, color: "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]" },
  { id: "src-health", name: "Medical Response Baseline", count: 1, color: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" },
  { id: "src-cctv", name: "CCTV Surveillance Baseline", count: 1, color: "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" },
  { id: "src-drone", name: "Drone Surveillance Baseline", count: 1, color: "bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]" },
  { id: "src-traffic", name: "Traffic Management Baseline", count: 1, color: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" },
  { id: "src-police", name: "Police Deployment Baseline", count: 1, color: "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]" },
  { id: "src-ghat", name: "Ghat Monitoring Baseline", count: 1, color: "bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" },
  { id: "src-parking", name: "Parking Control Baseline", count: 1, color: "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" },
  { id: "src-lost", name: "Lost & Found Ops Baseline", count: 1, color: "bg-blue-300 shadow-[0_0_8px_rgba(147,197,253,0.8)]" },
];

export default function ImportedSources() {
  return (
    <div className="pb-8">
      <div className="flex items-center justify-between mb-3 px-2 border-b border-gray-300 pb-3">
        <h2 className="text-black font-extrabold text-sm tracking-wide">Imported Sources</h2>
      </div>
      <ul className="flex flex-col gap-1.5 px-1">
        {IMPORTED_SOURCES.map((source) => (
          <li key={source.id} className="group flex items-center justify-between p-2 px-3 rounded-lg transition-colors hover:bg-white shadow-sm cursor-default bg-white shadow-sm border-gray-300">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${source.color}`}></div>
              <span className="text-xs font-medium text-gray-700 font-medium group-hover:text-black font-extrabold truncate">{source.name}</span>
            </div>
            <div className="flex flex-col items-end flex-shrink-0 ml-2">
              <span className="text-[9px] text-gray-700 font-bold uppercase tracking-wider">Demo</span>
              <span className="text-[10px] text-gray-900 font-bold font-bold">{source.count} feat.</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
