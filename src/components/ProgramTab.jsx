import React from 'react';
import { Calendar } from 'lucide-react';
import { agendaData } from '../data/agenda.js';
import { AgendaCard } from './AgendaCard.jsx';

export const ProgramTab = ({ completedItems, onToggleComplete }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4">
    {agendaData.map((day, idx) => (
      <div key={idx} className="mb-8">
        <h2 className="text-lg font-bold mb-4 text-orange-500 border-b border-zinc-800 pb-2 flex items-center gap-2">
          <Calendar size={18} /> {day.date}
        </h2>
        {day.items.map(item => (
          <AgendaCard
            key={item.id}
            item={item}
            completed={completedItems.has(item.id)}
            onToggleComplete={onToggleComplete}
          />
        ))}
      </div>
    ))}
  </div>
);
