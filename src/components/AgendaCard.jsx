import React, { useState } from 'react';
import { Clock, MapPin, Wallet, ChevronDown, ChevronUp, Navigation, CheckCircle2, Circle,
  Beer, Train, Flame, Map, Plane, Utensils, Search } from 'lucide-react';

const ICON_MAP = { Beer, Train, Flame, MapPin, Utensils, Search, Map, Plane };

export const AgendaCard = ({ item, completed, onToggleComplete }) => {
  const [expanded, setExpanded] = useState(false);
  const IconComponent = ICON_MAP[item.icon] || Beer;

  return (
    <div
      className={`bg-zinc-900 border rounded-2xl p-5 mb-4 transition-all duration-300 shadow-lg ${
        completed ? 'border-green-700/40 opacity-70' : expanded ? 'border-orange-500/50' : 'border-zinc-800 hover:border-zinc-700'
      }`}
    >
      <div className="flex justify-between items-start">
        <div
          className="flex gap-4 flex-1 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className={`mt-1 flex items-center justify-center w-10 h-10 ${completed ? 'text-green-500' : 'text-orange-500'}`}>
            <IconComponent size={20} />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${completed ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
              {item.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-2 font-medium">
              <Clock size={14} /> <span>{item.time}</span>
              <span>•</span>
              <MapPin size={14} /> <span>{item.location}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {item.budget && (
                <div className="flex items-center gap-1.5 text-xs text-orange-400 font-bold bg-orange-500/5 px-2 py-1 rounded-md border border-orange-500/10">
                  <Wallet size={12} /> {item.budget}
                </div>
              )}
              {item.location !== "Hemmelig" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location + ', Tyskland')}`);
                  }}
                  className="flex items-center gap-1 text-xs text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                >
                  <Navigation size={12} /> Ta meg dit
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 ml-2">
          <button
            onClick={() => onToggleComplete(item.id)}
            className="text-zinc-600 hover:text-green-500 transition-colors"
            title={completed ? "Merk som ikke gjennomført" : "Merk som gjennomført"}
          >
            {completed ? <CheckCircle2 size={20} className="text-green-500" /> : <Circle size={20} />}
          </button>
          <div className="text-zinc-600" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>
      {expanded && (
        <div className="mt-5 pt-5 border-t border-zinc-800 text-sm text-zinc-400 leading-relaxed animate-in fade-in duration-300">
          {item.details}
        </div>
      )}
    </div>
  );
};
