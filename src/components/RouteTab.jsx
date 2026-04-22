import React from 'react';
import { Navigation, CheckCircle2, Circle } from 'lucide-react';
import { sightseeingData } from '../data/sightseeing.js';

export const RouteTab = ({ selectedMapStop, setSelectedMapStop, completedStops, onToggleStop }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4">
    <h2 className="text-xl font-bold mb-4">Lørdagsrute</h2>
    <div className="mb-6 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 h-64 relative shadow-2xl">
      <iframe
        width="100%" height="100%"
        style={{ border: 0, filter: 'invert(90%)' }}
        src={selectedMapStop
          ? `https://www.openstreetmap.org/export/embed.html?bbox=${selectedMapStop.lon - 0.005}%2C${selectedMapStop.lat - 0.005}%2C${selectedMapStop.lon + 0.005}%2C${selectedMapStop.lat + 0.005}&marker=${selectedMapStop.lat}%2C${selectedMapStop.lon}`
          : "https://www.openstreetmap.org/export/embed.html?bbox=9.95%2C53.54%2C10.00%2C53.57"
        }
        title="Kart"
      />
    </div>
    <div className="space-y-4">
      {sightseeingData.map((stop, i) => {
        const done = completedStops.has(stop.id);
        return (
          <div
            key={stop.id}
            onClick={() => setSelectedMapStop(stop)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              done ? 'bg-zinc-900 border-green-700/40 opacity-70' :
              selectedMapStop?.id === stop.id ? 'bg-zinc-800 border-orange-500 shadow-lg' :
              'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex gap-4 items-start">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${done ? 'bg-green-700 text-white' : 'bg-orange-600 text-white'}`}>{i + 1}</span>
              <div className="flex-1">
                <h3 className={`font-bold ${done ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>{stop.title}</h3>
                <p className="text-sm text-zinc-400 mt-1">{stop.desc}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lon}`);
                  }}
                  className="mt-3 text-xs flex items-center gap-1 text-blue-400 font-bold bg-blue-500/10 px-2 py-1.5 rounded-md hover:bg-blue-500/20 transition-colors w-fit border border-blue-500/20"
                >
                  <Navigation size={12} /> Ta meg dit
                </button>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStop(stop.id);
                }}
                className="text-zinc-600 hover:text-green-500 transition-colors ml-2 shrink-0"
                title={done ? "Merk som ikke besøkt" : "Merk som besøkt"}
              >
                {done ? <CheckCircle2 size={20} className="text-green-500" /> : <Circle size={20} />}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
