import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, Map, HelpCircle, Info, MapPin, Clock, Wallet, 
  ChevronDown, ChevronUp, Flame, Beer, Train, Music, 
  CheckCircle2, Headphones, PlayCircle, Sparkles, Send, 
  Bot, RefreshCw, Thermometer, Sun, Cloud, CloudRain, 
  Snowflake, CloudLightning, Coins, AlertTriangle
} from 'lucide-react';

/**
 * OPTIMALISERT FOR VERCEL DEPLOYMENT
 * Bruker en tryggere sjekk for import.meta for å unngå kompileringsfeil i eldre miljøer.
 */
const getEnvApiKey = () => {
  try {
    // Vite bruker import.meta.env for miljøvariabler
    return import.meta.env.VITE_GEMINI_API_KEY || "";
  } catch (e) {
    return "";
  }
};

const apiKey = getEnvApiKey();

const callGeminiAPI = async (prompt, systemInstruction = null, retries = 5) => {
  if (!apiKey) return "API-nøkkel mangler. Vennligst legg til VITE_GEMINI_API_KEY i Vercel-innstillingene dine.";
  
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  let attempt = 0;

  while (attempt < retries) {
    try {
      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
      };
      
      if (systemInstruction) {
        payload.systemInstruction = { parts: [{ text: systemInstruction }] };
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Klarte ikke å generere svar.";
    } catch (error) {
      attempt++;
      if (attempt >= retries) return "Beklager, heksene har tuklet med forbindelsen. Prøv igjen senere!";
      await delay(Math.pow(2, attempt) * 1000);
    }
  }
};

// --- STATISK DATA ---
const agendaData = [
  {
    date: "Torsdag 30.04.26",
    items: [
      { id: 1, time: "13:30", title: "Matbit", location: "Hamburg Hbf", budget: null, icon: <Beer size={18} />, details: "Vi reiser fra flughafen med S-bahn til Hamburg haubtbahnhof. Vi får i oss en matbit på togstasjonen i Hamburg før videre reise. Evt. Innkjøp av snacks til turen." },
      { id: 2, time: "14:23", title: "Avreise til Goslar", location: "Hamburg Hbf", budget: null, icon: <Train size={18} />, details: "Vi reiser med ICE 1187 kl. 14:23 fra spor 12C-F. Toget går i retning Frankfurt. Vi hopper av i Hannover 15:38 og bytter til regiontog RE10 som skal til Bad Harzburg (spor 7). Seks stopp senere ankommer vi Goslar. Reisekomiteen gjør oppmerksom på at wegbier er helt greit å ha med om bord ICE-tog, men ikke regiontogene." },
      { id: 3, time: "~17:00", title: "Innsjekking", location: "Hotel der Achtermann", budget: null, icon: <MapPin size={18} />, details: "Innsjekk og omstilling på hotellet før kveldens festligheter." },
      { id: 4, time: "~18:00", title: "Heksebrenning", location: "Goslar", budget: "€ 35 (bargeld)", icon: <Flame size={18} className="text-orange-500" />, details: "Vi tar del i kveldens festligheter. Det ryktes om matboder, live-musikk, store bål og god stemning. Hver deltaker får et budsjett på € 35 utdelt i kontanter til eget forbruk av mat og drikke." }
    ]
  },
  {
    date: "Fredag 01.05.26",
    items: [
      { id: 5, time: "10:30", title: "Frühschoppen", location: "Cafe am Markt", budget: "€ 30", icon: <Beer size={18} />, details: "...tyskerne har selvsagt både et ord, og kultur for, å drikke til frokost. Selv om fokuset er på drikke, serveres ofte en andre frokost, gjerne med Weißwurst, søt sennep og pretzel. Tog til Hamburg går 13:03." },
      { id: 6, time: "13:03", title: "Avreise til Hamburg", location: "Goslar Stasjon", budget: null, icon: <Train size={18} />, details: "Tog til Hamburg med bytte i Hannover 14:10-14:36." },
      { id: 7, time: "~17:15", title: "Innsjekking", location: "Scandic Hamburg Emporio", budget: null, icon: <MapPin size={18} />, details: "Innsjekking på hotellet vårt i Hamburg." },
      { id: 8, time: "18:00", title: "Middag", location: "Oberhafen Kantine", budget: "€ 60", icon: <MapPin size={18} />, details: "Meget tradisjonsrik restaurant hvor arbeiderne i havnen gjerne spiste. Bygget er et lite mursteinshus som ligger under en jernbanebro. På grunn av grunnforholdene har huset sunket og er skjevt. Kjent for husmannskost (typisk Labskaus)." },
      { id: 9, time: "21:00", title: "Utflukt", location: "Hamburg", budget: null, icon: <MapPin size={18} />, details: "Etter middag beveger vi oss en kort gåtur og starter kveldens aktivitet." }
    ]
  },
  {
    date: "Lørdag 02.05.26",
    items: [
      { id: 10, time: "10:30", title: "Frokost", location: "Berta Boozy Brunch Club", budget: "€ 50", icon: <Beer size={18} />, details: "Bord er booket hos Berta. Budsjettet tar høyde for lunsj og Bottomless Mimosa med vb jenter <3" },
      { id: 11, time: "12:30", title: "Utforsking i Hamburg", location: "Schanzenviertel -> St. Pauli", budget: "€ 25 (bargeld)", icon: <Map size={18} />, details: "Sjekk Sightseeing-fanen for detaljert rute. Vi stopper for å spise og drikke ved behov. Cash-budsjettet gjelder. Vi ender på hotellet, tar en pust i bakken, og fortsetter kvelden." },
      { id: 12, time: "19:15", title: "Vordrink", location: "Pallas", budget: "€ 30", icon: <Beer size={18} />, details: "Vordrink før vi drar videre til middag." },
      { id: 13, time: "20:30", title: "Middag", location: "Bullerei", budget: "€ 85", icon: <MapPin size={18} />, details: "Bord er booket på Bullerei – en restaurant i gourmet-klassen. De spesialiserer seg på kjøtt, men har også andre hovedretter." }
    ]
  },
  {
    date: "Søndag 03.05.26",
    items: [
      { id: 14, time: "11:45", title: "Avreise til HAM", location: "Hamburg", budget: null, icon: <Train size={18} />, details: "Vi setter snuten mot flyplassen." },
      { id: 15, time: "13:50", title: "Fly til Bergen", location: "Hamburg Flughafen", budget: null, icon: <MapPin size={18} />, details: "Takk for turen! Auf Wiedersehen." }
    ]
  }
];

const sightseeingData = [
  { id: 1, title: "Start: Berta Emil Richard Schneider", location: "Schanzenviertel", desc: "Dere ruller ut fra Kampstraße 25-27. Dere befinner dere nå i det hippe Sternschanze. Gå gjennom de grafittifylte gatene. Stikk innom en 'Kiosk' (Späti) for en kald Astra til vandringen. Gå forbi Rote Flora.", lat: 53.5619, lon: 9.9613 },
  { id: 2, title: "Via Reeperbahn til St. Pauli", location: "The Sinful Mile", desc: "Sving sørover. Gå ned hele Reeperbahn. Sjekk ut Beatles-Platz. Ta en kjapp enhet på Zum Silbersack – en institusjon som har sett lik ut siden 1949.", lat: 53.5496, lon: 9.9602 },
  { id: 3, title: "Landungsbrücken og Alter Elbtunnel", location: "Havnen", desc: "Gå gjennom Alter Elbtunnel (gratis, 426m lang, 24m under bakken). Obligatorisk gruppebilde av skyline! Kjøp en Fischbrötchen ved bodene på brygga.", lat: 53.5458, lon: 9.9665 },
  { id: 4, title: "Speicherstadt og Elbphilharmonie", location: "HafenCity", desc: "Beundre Elbphilharmonie (The Plaza er gratis for 360-graders utsikt). Gå over broene i Speicherstadt. UNESCO-vernet og fotogent.", lat: 53.5413, lon: 9.9841 },
  { id: 5, title: "Rådhuset og Jungfernstieg", location: "Altstadt", desc: "Gå forbi Rathaus. Ta en siste 'enhet' ved Jungfernstieg ved Binnenalster-innsjøen og se på folkelivet.", lat: 53.5534, lon: 9.9936 },
  { id: 6, title: "Mål: Scandic Hamburg Emporio", location: "Gänsemarkt", desc: "Bare 10 minutter rolig gange til hotellet. Pust i bakken før kvelden fortsetter!", lat: 53.5558, lon: 9.9830 }
];

const qaData = [
  { q: "Hvorfor akkurat fjellet Brocken?", a: "Det er det høyeste punktet i Nord-Tyskland, og tåkeformasjoner her skaper ofte 'Brocken-spøkelset', noe som ga grobunn for myter om overnaturlige vesener." },
  { q: "Hvilken kjent forfatter udødeliggjorde Walpurgisnacht på Brocken?", a: "Johann Wolfgang von Goethe i verket Faust, etter at han selv besteg fjellet i 1777." },
  { q: "Hva er 'Maifeuer'?", a: "Det er de enorme bålene som tennes natt til 1. mai for å jage bort onde ånder og feire at vinteren er over." },
  { q: "Er det lov å gå til toppen av Brocken under feiringen?", a: "Ja, men de fleste tar 'Harzer Schmalspurbahnen' – et gammelt damptog som er en opplevelse i seg selv." },
  { q: "Hva er forskellen på en 'Hexe' og en 'Teufel' i feiringen?", a: "Menn kler seg ofte ut som djevler (Teufel) og damene som hekser (Hexen) i et gigantisk rollespill." },
  { q: "Hva betyr uttrykket 'Tanz in den Mai'?", a: "Det er den moderne tyske tradisjonen med å feste og danse seg fra kvelden 30. april og inn i den nye måneden." },
  { q: "Hva betyr det når folk roper 'Hummel, Hummel'?", a: "Det er det tradisjonelle Hamburg-ropet. Svaret skal alltid være 'Mors, Mors!'." }
];

const nightclubs = ["Uebel & Gefährlich", "Mojo Club", "Südpol", "Angie's", "NOHO"];

// --- HJELPERE ---
const getWeatherDetails = (code) => {
  if (code === 0) return { text: "Klart", icon: <Sun size={28} className="text-yellow-400" /> };
  if (code <= 3) return { text: "Delvis skyet", icon: <Cloud size={28} className="text-zinc-400" /> };
  if (code >= 51 && code <= 67) return { text: "Regn", icon: <CloudRain size={28} className="text-blue-400" /> };
  if (code >= 95) return { text: "Torden", icon: <CloudLightning size={28} className="text-purple-500" /> };
  return { text: "Skiftende", icon: <Cloud size={28} className="text-zinc-400" /> };
};

const AgendaCard = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div 
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3 cursor-pointer hover:border-orange-500/50 transition-colors"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="mt-1 text-zinc-400">{item.icon}</div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100">{item.title}</h3>
            <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
              <Clock size={14} /> <span>{item.time}</span>
              <span className="px-1">•</span>
              <MapPin size={14} /> <span>{item.location}</span>
            </div>
            {item.budget && (
              <div className="flex items-center gap-1 text-sm text-orange-400 mt-1 font-medium">
                <Wallet size={14} /> {item.budget}
              </div>
            )}
          </div>
        </div>
        <div className="text-zinc-500">{expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
      </div>
      {expanded && item.details && (
        <div className="mt-4 pt-4 border-t border-zinc-800 text-sm text-zinc-300 leading-relaxed animate-in fade-in duration-300">
          {item.details}
        </div>
      )}
    </div>
  );
};

// --- HOVEDKOMPONENT ---
export default function App() {
  const [activeTab, setActiveTab] = useState('program');
  const [selectedMapStop, setSelectedMapStop] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', text: 'Kakk-kakk! Jeg er Brocken-heksa. Jeg er orakelet for turen deres til Goslar og Hamburg. Spør meg om hva som helst!' }
  ]);
  const [isChatting, setIsChatting] = useState(false);
  const [weather, setWeather] = useState({ hamburg: null, goslar: null, loading: true });
  const [eurRate, setEurRate] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const [h, g] = await Promise.all([
          fetch('https://api.open-meteo.com/v1/forecast?latitude=53.55&longitude=9.99&current=temperature_2m,weather_code'),
          fetch('https://api.open-meteo.com/v1/forecast?latitude=51.90&longitude=10.42&current=temperature_2m,weather_code')
        ]);
        const hd = await h.json();
        const gd = await g.json();
        setWeather({ hamburg: hd.current, goslar: gd.current, loading: false });
      } catch (e) { setWeather(prev => ({ ...prev, loading: false })); }
    };
    fetchWeather();
  }, []);

  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/EUR')
      .then(res => res.json())
      .then(data => setEurRate(data.rates.NOK))
      .catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatting) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setIsChatting(true);

    const systemPrompt = `Du er en sarkastisk tysk heks fra Brocken. Du er ekspert på denne spesifikke turen for 7 norske menn til Goslar (30. april) og Hamburg. Bruk litt tyske ord (Jawohl, Prost). Hold svarene korte.`;
    const response = await callGeminiAPI(msg, systemPrompt);
    
    setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    setIsChatting(false);
  };

  return (
    <>
      {showSplash && (
        <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center animate-out fade-out duration-1000 fill-mode-forwards">
          <Flame size={80} className="text-orange-500 animate-bounce" />
          <h1 className="mt-8 text-4xl font-black text-orange-500 tracking-widest">HEKSEJAKT</h1>
        </div>
      )}

      <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans pb-24">
        <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40 p-4">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <h1 className="text-xl font-black text-orange-500 flex items-center gap-2">
              <Flame size={20} /> HEKSEJAKT
            </h1>
            <div className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Goslar • Hamburg</div>
          </div>
        </header>

        <main className="max-w-md mx-auto p-4">
          {activeTab === 'program' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              {agendaData.map((day, idx) => (
                <div key={idx} className="mb-8">
                  <h2 className="text-lg font-bold mb-4 text-orange-500 border-b border-zinc-800 pb-2 flex items-center gap-2">
                    <Calendar size={18} /> {day.date}
                  </h2>
                  {day.items.map(item => <AgendaCard key={item.id} item={item} />)}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'rute' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-bold mb-2">Lørdagsruta</h2>
              <div className="mb-6 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 h-64 relative">
                <iframe 
                  width="100%" height="100%" 
                  style={{ border: 0, filter: 'invert(90%)' }}
                  src={selectedMapStop 
                    ? `https://www.openstreetmap.org/export/embed.html?bbox=${selectedMapStop.lon - 0.005}%2C${selectedMapStop.lat - 0.005}%2C${selectedMapStop.lon + 0.005}%2C${selectedMapStop.lat + 0.005}&marker=${selectedMapStop.lat}%2C${selectedMapStop.lon}`
                    : "https://www.openstreetmap.org/export/embed.html?bbox=9.95%2C53.54%2C10.00%2C53.57"
                  }
                  title="Kart"
                ></iframe>
              </div>
              <div className="space-y-4">
                {sightseeingData.map((stop, i) => (
                  <div 
                    key={stop.id} 
                    onClick={() => setSelectedMapStop(stop)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedMapStop?.id === stop.id ? 'bg-zinc-800 border-orange-500' : 'bg-zinc-900 border-zinc-800'}`}
                  >
                    <div className="flex gap-3">
                      <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">{i+1}</span>
                      <div>
                        <h3 className="font-bold">{stop.title}</h3>
                        <p className="text-sm text-zinc-400 mt-1">{stop.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orakel' && (
            <div className="animate-in fade-in flex flex-col h-[70vh]">
              {!apiKey && (
                <div className="bg-red-900/20 border border-red-500/50 p-3 rounded-lg mb-4 flex items-center gap-3 text-red-200 text-xs">
                  <AlertTriangle size={18} />
                  <span>API-nøkkel mangler i Vercel-oppsettet! Sjekk miljøvariabler.</span>
                </div>
              )}
              <div className="flex-1 overflow-y-auto space-y-4 p-2">
                {chatHistory.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl ${m.role === 'user' ? 'bg-orange-600 rounded-br-none' : 'bg-zinc-800 rounded-bl-none border border-zinc-700'}`}>
                      <p className="text-sm">{m.text}</p>
                    </div>
                  </div>
                ))}
                {isChatting && <div className="text-zinc-500 text-xs animate-pulse italic">Heksa brygger på et svar...</div>}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleChatSubmit} className="mt-4 flex gap-2">
                <input 
                  type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                  placeholder="Spør heksa..." 
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-sm outline-none focus:border-orange-500"
                />
                <button type="submit" className="bg-orange-600 p-2 rounded-full disabled:opacity-50"><Send size={18} /></button>
              </form>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="animate-in fade-in space-y-6">
              <section className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-lg">
                <h2 className="font-bold mb-4 flex items-center gap-2"><Headphones className="text-orange-500" /> Podcast</h2>
                <div className="w-full bg-zinc-950 rounded-xl overflow-hidden shadow-inner border border-zinc-800">
                  <iframe 
                    style={{ borderRadius: '12px' }} 
                    src="https://open.spotify.com/embed/episode/6HTGxq4it3BRx9a69VAN89?utm_source=generator" 
                    width="100%" 
                    height="152" 
                    frameBorder="0" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy"
                    title="Spotify Podcast Episode"
                  ></iframe>
                </div>
              </section>

              <section className="bg-zinc-900 p-5 rounded-xl border border-zinc-800">
                <h2 className="font-bold mb-4 flex items-center gap-2"><Thermometer className="text-orange-500" /> Været</h2>
                {weather.loading ? <RefreshCw className="animate-spin mx-auto text-zinc-500" /> : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-950 p-3 rounded-lg text-center border border-zinc-800">
                      <div className="text-[10px] text-zinc-500 uppercase font-bold">Hamburg</div>
                      <div className="flex flex-col items-center mt-2">
                        {getWeatherDetails(weather.hamburg?.weather_code).icon}
                        <span className="text-xl font-bold text-zinc-100">{Math.round(weather.hamburg?.temperature_2m)}°</span>
                      </div>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-lg text-center border border-zinc-800">
                      <div className="text-[10px] text-zinc-500 uppercase font-bold">Goslar</div>
                      <div className="flex flex-col items-center mt-2">
                        {getWeatherDetails(weather.goslar?.weather_code).icon}
                        <span className="text-xl font-bold text-zinc-100">{Math.round(weather.goslar?.temperature_2m)}°</span>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <section className="bg-zinc-900 p-5 rounded-xl border border-zinc-800">
                <h2 className="font-bold mb-3 flex items-center gap-2"><Wallet className="text-orange-500" /> Valuta</h2>
                <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <span className="text-sm text-zinc-400 flex items-center gap-2"><Coins size={14} className="text-yellow-500" /> Eurokurs:</span>
                  <span className="font-bold text-orange-400">{eurRate ? `1€ = ${eurRate.toFixed(2)} NOK` : 'Laster...'}</span>
                </div>
              </section>

              <section className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-lg">
                <h2 className="font-bold mb-3 flex items-center gap-2"><PlayCircle className="text-orange-500" /> Spilleliste</h2>
                <div className="w-full bg-zinc-950 rounded-xl overflow-hidden shadow-inner border border-zinc-800">
                  <iframe 
                    style={{ borderRadius: '12px' }} 
                    src="https://open.spotify.com/embed/playlist/1me7HbLOFEA2JG764uTqFg?utm_source=generator" 
                    width="100%" 
                    height="352" 
                    frameBorder="0" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy"
                    title="Heksejakt Spilleliste"
                  ></iframe>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'qa' && (
            <div className="animate-in fade-in space-y-3">
              {qaData.map((d, i) => (
                <div key={i} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                  <h3 className="text-sm font-bold mb-1 text-zinc-200">{d.q}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{d.a}</p>
                </div>
              ))}
            </div>
          )}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800 py-3 px-2 z-50">
          <div className="max-w-md mx-auto flex justify-between">
            {[
              { id: 'program', icon: <Calendar size={20} />, label: 'Program' },
              { id: 'rute', icon: <Map size={20} />, label: 'Rute' },
              { id: 'orakel', icon: <Sparkles size={20} />, label: 'Orakel' },
              { id: 'qa', icon: <HelpCircle size={20} />, label: 'Tips' },
              { id: 'info', icon: <Info size={20} />, label: 'Info' }
            ].map(t => (
              <button 
                key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex flex-col items-center gap-1 flex-1 transition-colors ${activeTab === t.id ? 'text-orange-500' : 'text-zinc-500 hover:text-zinc-300'}`}
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
