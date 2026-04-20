import React, { useRef, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { callGeminiAPI } from '../api/gemini.js';
import { agendaData } from '../data/agenda.js';
import { sightseeingData } from '../data/sightseeing.js';
import { qaData } from '../data/qa.js';

const INITIAL_MESSAGE = { role: 'model', text: 'Kakk-kakk! Rakel er klar. Spør meg om Walpurgis, Hamburg eller øl!' };

const buildSystemPrompt = () => {
  const heksKunnskap = `
    Agenda: ${JSON.stringify(agendaData.map(d => `${d.date}: ${d.items.map(i => `${i.time} ${i.title} på ${i.location} (${i.details})`).join(" | ")}`))}
    Sightseeing i Hamburg: ${JSON.stringify(sightseeingData.map(s => `${s.title}: ${s.desc}`))}
    Trivia og Spørsmål: ${JSON.stringify(qaData)}
    Nødkontakter: Politi 110, Ambulanse 112. Taxi: Bruk FreeNow eller Uber.
    Hotell Hamburg: Scandic Hamburg Emporio, Dammtorwall 19. Hotell Goslar: Hotel der Achtermann, Rosentorstraße 20.
  `;
  return `Du er en sarkastisk tysk heks fra Brocken-fjellet som heter Rakel. Svar på norsk, men sleng inn et tysk ord her og der. Vær morsom og litt bitende, men DU MÅ ALLTID GI ET FAKTISK SVAR på det brukeren spør om i den samme meldingen!
  ALDRI si "jeg skal sjekke" uten å faktisk gi svaret. Bruk Google Søk til å finne ekte, oppdatert informasjon (for eksempel værmeldingen for Goslar) og gi svaret umiddelbart sammen med de sarkastiske kommentarene dine.

  Intern reiseinformasjon for Heksejakten 2026: ${heksKunnskap}`;
};

export const OrakelTab = ({ chatHistory, setChatHistory, chatInput, setChatInput, isChatting, setIsChatting }) => {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatting]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatting) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setIsChatting(true);

    try {
      const res = await callGeminiAPI(chatHistory, msg, buildSystemPrompt());
      setChatHistory(prev => [...prev, { role: 'model', text: res }]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleClearChat = () => {
    setChatHistory([INITIAL_MESSAGE]);
  };

  return (
    <div className="animate-in fade-in flex flex-col" style={{ height: 'calc(100dvh - 190px - env(safe-area-inset-bottom))' }}>
      <div className="flex justify-end mb-2">
        <button
          onClick={handleClearChat}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 transition-colors"
          title="Tøm chat"
        >
          <Trash2 size={14} /> Tøm chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 p-2 custom-scrollbar">
        {chatHistory.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-orange-600 rounded-br-none shadow-lg' : 'bg-zinc-800 rounded-bl-none border border-zinc-700'}`}>
              <p className="text-sm whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {isChatting && <div className="text-orange-500 text-xs animate-pulse italic">Rakel brygger på et svar...</div>}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleChatSubmit} className="mt-4 flex gap-2 pb-2">
        <input
          type="text"
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          onFocus={() => setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 300)}
          placeholder="Spør Rakel..."
          enterKeyHint="send"
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-5 py-3 text-sm focus:border-orange-500 outline-none"
        />
        <button type="submit" disabled={isChatting} className="bg-orange-600 p-3 rounded-full shadow-lg active:scale-95 transition-transform">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};
