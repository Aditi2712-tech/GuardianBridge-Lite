import { useState } from 'react';
import { BatteryMedium, CircleX, Radio, RotateCcw, Waves } from 'lucide-react';
import { sensorNodes } from '@/data/mockData';
import { useDemo } from '@/context/DemoContext';
import { getScenarioStats } from '@/data/mockData';
import type { SensorNode } from '@/types';

export function BridgeVisualization() {
  const [selectedNode, setSelectedNode] = useState<SensorNode | null>(null);
  const { scenario, isDemo } = useDemo();
  const stats = getScenarioStats(isDemo ? scenario : 'normal');
  return (
    <section className="panel min-w-0 p-5" data-testid="card-bridge-visualization">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.16em] text-slate-100">BRIDGE STRUCTURE</div>
          <div className="mono mt-1 text-[9px] text-slate-500">GB-01 <span className="text-slate-700">•</span> NORTH CHANNEL BRIDGE</div>
        </div>
        <span className="border border-emerald-300/20 bg-emerald-300/[0.06] px-2 py-1 text-[9px] font-medium text-emerald-300">2 NODES ONLINE</span>
      </div>
      <div className="technical-grid relative mt-4 overflow-hidden border border-slate-700/50 bg-[#0d1927] px-2 py-3">
        <svg viewBox="0 0 540 260" className="h-[230px] w-full" role="img" aria-label="Stylized North Channel Bridge with two clickable sensor nodes">
          <defs>
            <linearGradient id="deckGradient" x1="0" x2="1">
              <stop offset="0" stopColor="#29455a" /><stop offset=".5" stopColor="#4b6875" /><stop offset="1" stopColor="#29455a" />
            </linearGradient>
            <linearGradient id="waterGradient" x1="0" x2="0" y1="0" y2="1">
              <stop stopColor="#18384b" stopOpacity=".8" /><stop offset="1" stopColor="#0c1826" />
            </linearGradient>
          </defs>
          <rect x="0" y="182" width="540" height="78" fill="url(#waterGradient)" />
          <path d="M0 209 C70 193 106 223 167 207 S276 197 345 210 S461 193 540 209" fill="none" stroke="#2d6073" strokeWidth="1.5" opacity=".7" />
          <path d="M0 224 C70 208 106 238 167 222 S276 212 345 225 S461 208 540 224" fill="none" stroke="#224b5d" strokeWidth="1" />
          <path d="M35 165 L505 165" stroke="#8aa3aa" strokeWidth="4" />
          <path d="M35 160 L505 160" stroke="#304d5c" strokeWidth="2" />
          <path d="M42 165 L50 179 M72 165 L80 179 M102 165 L110 179 M132 165 L140 179 M162 165 L170 179 M192 165 L200 179 M222 165 L230 179 M252 165 L260 179 M282 165 L290 179 M312 165 L320 179 M342 165 L350 179 M372 165 L380 179 M402 165 L410 179 M432 165 L440 179 M462 165 L470 179 M492 165 L500 179" stroke="#547381" strokeWidth="1.5" />
          <path d="M73 160 Q148 30 270 160 Q392 30 467 160" fill="none" stroke="#71909a" strokeWidth="3" />
          <path d="M73 160 Q148 50 270 160 Q392 50 467 160" fill="none" stroke="#253f50" strokeWidth="2" strokeDasharray="4 5" />
          <path d="M73 160 V179 M467 160 V179" stroke="#71909a" strokeWidth="5" />
          <path d="M270 159 V182" stroke="#71909a" strokeWidth="4" />
          <g fill="#78919a" opacity=".65"><circle cx="73" cy="160" r="3" /><circle cx="270" cy="160" r="3" /><circle cx="467" cy="160" r="3" /></g>
          {sensorNodes.map((node) => {
            const x = node.position.x * 5.4;
            const y = 164;
            return (
              <g key={node.id} onClick={() => setSelectedNode(node)} onKeyDown={(event) => event.key === 'Enter' && setSelectedNode(node)} tabIndex={0} role="button" aria-label={`Open ${node.id} sensor details`} data-testid={`sensor-node-${node.id}`} className="cursor-pointer outline-none">
                <circle cx={x} cy={y} r="15" fill="#59e1a3" opacity=".08" />
                <circle cx={x} cy={y} r="7" fill="#123029" stroke="#59e1a3" strokeWidth="2" />
                <circle cx={x} cy={y} r="3" fill="#70f1ae" />
                <text x={x} y={y - 23} textAnchor="middle" fill="#8decb7" fontSize="9" fontFamily="IBM Plex Mono">{node.id}</text>
              </g>
            );
          })}
          <text x="26" y="242" fill="#547181" fontSize="9" fontFamily="IBM Plex Mono">NORTH CHANNEL / SPAN 04</text>
          <text x="514" y="242" textAnchor="end" fill="#547181" fontSize="9" fontFamily="IBM Plex Mono">SCALE 1:240</text>
        </svg>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-400" />Select a sensor node to inspect telemetry</div>
      {selectedNode && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#07111c]/75 p-4" onClick={() => setSelectedNode(null)}>
          <div className="panel w-full max-w-[390px] p-5 shadow-2xl" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${selectedNode.id} details`}>
            <div className="flex items-start justify-between border-b border-slate-700/70 pb-4">
              <div><div className="mono text-[10px] tracking-[0.16em] text-cyan-300">SENSOR TELEMETRY</div><h2 className="mt-1 text-lg font-semibold text-slate-100">{selectedNode.id}</h2></div>
              <button aria-label="Close sensor details" data-testid="button-close-sensor-modal" onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-slate-200"><CircleX size={20} /></button>
            </div>
            <div className="mt-4 flex items-center gap-2 border border-emerald-300/20 bg-emerald-300/[0.06] px-3 py-2 text-[11px] text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />ONLINE <span className="ml-auto mono text-[9px] text-slate-500">PACKET {selectedNode.lastPacket}</span></div>
            <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden border border-slate-700/70 bg-slate-700/70">
              {([
                { label: 'Battery', value: `${selectedNode.battery}%`, icon: BatteryMedium },
                { label: 'RSSI', value: `${selectedNode.rssi} dBm`, icon: Radio },
                { label: 'Vibration', value: `${stats.nodeVibration.toFixed(2)} g`, icon: Waves },
                { label: 'Tilt', value: `${stats.nodeTilt.toFixed(2)}°`, icon: RotateCcw },
              ] as { label: string; value: string; icon: typeof BatteryMedium }[]).map(({ label, value, icon: MetricIcon }) => (
                <div key={label} className="bg-[#152638] p-3"><MetricIcon size={14} className="mb-2 text-cyan-300" /><div className="text-[9px] uppercase tracking-[0.16em] text-slate-500">{label}</div><div className="mono mt-1 text-[13px] text-slate-100" data-testid={`node-${label.toLowerCase()}-${selectedNode.id}`}>{value}</div></div>
              ))}
            </div>
            <div className="mono mt-4 text-[9px] text-slate-500">LAST PACKET RECEIVED <span className="text-slate-300">{selectedNode.lastPacket} UTC</span></div>
          </div>
        </div>
      )}
    </section>
  );
}