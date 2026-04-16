import React from 'react';
import { MessageCircle } from 'lucide-react';
import { qaData, parlorData } from '../data/qa.js';

export const QATab = () => (
  <div className="animate-in fade-in space-y-3">
    <h2 className="text-xl font-bold mb-4">Q&A & Trivia</h2>
    {qaData.map((d, i) => (
      <div key={i} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <h3 className="text-sm font-bold mb-1 text-orange-400">{d.q}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{d.a}</p>
      </div>
    ))}

    <h2 className="text-xl font-bold mb-4 mt-8 flex items-center gap-2 text-zinc-100">
      <MessageCircle size={20} className="text-orange-500" /> Mini-Parlør
    </h2>
    <div className="grid grid-cols-1 gap-2">
      {parlorData.map((d, i) => (
        <div key={i} className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 flex flex-col shadow-sm">
          <span className="text-xs text-zinc-500 mb-1">{d.no}</span>
          <span className="font-bold text-orange-400">{d.de}</span>
        </div>
      ))}
    </div>
  </div>
);
