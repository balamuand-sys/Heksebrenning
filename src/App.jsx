import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Map, HelpCircle, Info, Flame } from 'lucide-react';

import { InstallPrompt } from './components/InstallPrompt.jsx';
import { SplashScreen } from './components/SplashScreen.jsx';
import { WitchHatIcon } from './components/WitchHatIcon.jsx';
import { ProgramTab } from './components/ProgramTab.jsx';
import { RouteTab } from './components/RouteTab.jsx';
import { OrakelTab } from './components/OrakelTab.jsx';
import { QATab } from './components/QATab.jsx';
import { InfoTab } from './components/InfoTab.jsx';

const INITIAL_CHAT = [{ role: 'model', text: 'Kakk-kakk! Rakel er klar. Spør meg om Walpurgis, Hamburg eller øl!' }];
const CHAT_STORAGE_KEY = 'rakel_chat';
const WEGBIER_STORAGE_KEY = 'heksejakt_wegbiers';
const STOPS_STORAGE_KEY = 'heksejakt_stops';

export default function App() {
  const [activeTab, setActiveTab] = useState('program');
  const [selectedMapStop, setSelectedMapStop] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [introExpanded, setIntroExpanded] = useState(false);

  // Chat state med localStorage-persistering
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_CHAT;
    } catch {
      return INITIAL_CHAT;
    }
  });
  const [isChatting, setIsChatting] = useState(false);

  // Vær-states
  const [weather, setWeather] = useState({ hamburg: null, goslar: null, loading: true });
  const [expandedWeather, setExpandedWeather] = useState(null);
  const [eurRate, setEurRate] = useState(null);

  // Wegbier-teller
  const [wegbierCount, setWegbierCount] = useState(() => {
    const saved = localStorage.getItem(WEGBIER_STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  // Avkryssede sightseeing-stopp
  const [completedStops, setCompletedStops] = useState(() => {
    try {
      const saved = localStorage.getItem(STOPS_STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Påskeegg
  const [logoTaps, setLogoTaps] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatHistory));
    } catch { /* full storage */ }
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem(WEGBIER_STORAGE_KEY, wegbierCount.toString());
  }, [wegbierCount]);

  useEffect(() => {
    try {
      localStorage.setItem(STOPS_STORAGE_KEY, JSON.stringify([...completedStops]));
    } catch { /* full storage */ }
  }, [completedStops]);

  const fetchWeather = useCallback(async () => {
    setWeather(prev => ({ ...prev, loading: true }));
    try {
      const [h, g] = await Promise.all([
        fetch('https://api.open-meteo.com/v1/forecast?latitude=53.55&longitude=9.99&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe%2FBerlin&forecast_days=3'),
        fetch('https://api.open-meteo.com/v1/forecast?latitude=51.90&longitude=10.42&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe%2FBerlin&forecast_days=3')
      ]);
      const hd = await h.json();
      const gd = await g.json();
      setWeather({ hamburg: hd.daily, goslar: gd.daily, loading: false });
    } catch {
      setWeather(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const fetchEurRate = useCallback(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/EUR')
      .then(res => res.json())
      .then(data => setEurRate(data.rates.NOK))
      .catch(() => setEurRate(null));
  }, []);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);
  useEffect(() => { fetchEurRate(); }, [fetchEurRate]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchWeather();
        fetchEurRate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchWeather, fetchEurRate]);

  const handleWegbierChange = (increment) => {
    setWegbierCount(prev => Math.max(0, prev + increment));
  };

  const handleToggleStop = (stopId) => {
    setCompletedStops(prev => {
      const next = new Set(prev);
      next.has(stopId) ? next.delete(stopId) : next.add(stopId);
      return next;
    });
  };

  const handleLogoClick = () => {
    const newCount = logoTaps + 1;
    setLogoTaps(newCount);
    if (newCount >= 5) {
      setShowEasterEgg(true);
      setLogoTaps(0);
      setTimeout(() => setShowEasterEgg(false), 5000);
    }
  };

  return (
    <>
      <InstallPrompt />

      {showEasterEgg && (
        <>
          <style>{`
            @keyframes fall {
              0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
              100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
            }
          `}</style>
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="fixed z-[200] pointer-events-none text-4xl"
              style={{
                left: Math.random() * 100 + 'vw',
                top: '-10vh',
                animation: `fall ${Math.random() * 2 + 2}s linear ${Math.random() * 1}s forwards`
              }}>
              {Math.random() > 0.5 ? '🍺' : '🔥'}
            </div>
          ))}
        </>
      )}

      {showSplash && <SplashScreen />}

      <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40 px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] shadow-xl">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <h1
              onClick={handleLogoClick}
              className="text-xl font-black text-orange-500 flex items-center gap-2 cursor-pointer select-none"
            >
              <Flame size={20} /> HEKSEJAKT
            </h1>
            <div className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
              #nød 2026
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto p-4">
          {activeTab === 'program' && (
            <ProgramTab />
          )}
          {activeTab === 'rute' && (
            <RouteTab
              selectedMapStop={selectedMapStop}
              setSelectedMapStop={setSelectedMapStop}
              completedStops={completedStops}
              onToggleStop={handleToggleStop}
            />
          )}
          {activeTab === 'orakel' && (
            <OrakelTab
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              chatInput={chatInput}
              setChatInput={setChatInput}
              isChatting={isChatting}
              setIsChatting={setIsChatting}
            />
          )}
          {activeTab === 'qa' && <QATab />}
          {activeTab === 'info' && (
            <InfoTab
              introExpanded={introExpanded}
              setIntroExpanded={setIntroExpanded}
              weather={weather}
              expandedWeather={expandedWeather}
              setExpandedWeather={setExpandedWeather}
              eurRate={eurRate}
              wegbierCount={wegbierCount}
              handleWegbierChange={handleWegbierChange}
            />
          )}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800 pt-4 px-2 z-50 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="max-w-md mx-auto flex justify-between">
            {[
              { id: 'program', icon: <Calendar size={22} />, label: 'Program' },
              { id: 'rute', icon: <Map size={22} />, label: 'Lørdagsrute' },
              { id: 'orakel', icon: <WitchHatIcon size={22} />, label: 'Rakel' },
              { id: 'qa', icon: <HelpCircle size={22} />, label: 'Q&A' },
              { id: 'info', icon: <Info size={22} />, label: 'Info' }
            ].map(t => (
              <button
                key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex flex-col items-center gap-1.5 flex-1 transition-all ${activeTab === t.id ? 'text-orange-500 scale-110' : 'text-zinc-500'}`}
              >
                {t.icon} <span className="text-[10px] font-bold uppercase tracking-tighter">{t.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}
