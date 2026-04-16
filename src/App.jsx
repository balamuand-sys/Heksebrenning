import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, Map, HelpCircle, Info, MapPin, Clock, Wallet, 
  ChevronDown, ChevronUp, Flame, Beer, Train, Music, 
  CheckCircle2, Headphones, PlayCircle, Send, 
  RefreshCw, Thermometer, Sun, Cloud, CloudRain, 
  Snowflake, CloudLightning, Coins, AlertTriangle, ShieldCheck,
  Landmark, ScrollText, Plane, Utensils, Search,
  Share, X, Download, Navigation, ShieldAlert, MessageCircle,
  Plus, Minus
} from 'lucide-react';

/**
 * OPTIMALISERT FOR VERCEL DEPLOYMENT
 */
const getEnvApiKey = () => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
      return import.meta.env.VITE_GEMINI_API_KEY;
    }
    return "";
  } catch (e) {
    return "";
  }
};

const apiKey = getEnvApiKey();

const callGeminiAPI = async (history, prompt, systemInstruction = null) => {
  if (!apiKey || apiKey.trim() === "") return "FEIL: API-nøkkel mangler i Vercel-innstillingene.";
  
  // Prioriterer de nyeste og raskeste modellene først
  const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ];
  
  let errorMessages = [];

  // Konverterer chat-historikk (hopper over den hardkodede velkomstmeldingen)
  const formattedHistory = history.slice(1).map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));
  // Legger til det nye spørsmålet
  formattedHistory.push({ role: "user", parts: [{ text: prompt }] });

  for (const model of modelsToTry) {
    try {
      const payload = {
        contents: formattedHistory,
        // Riktig aktivering av Google Søk for REST API:
        tools: [{ googleSearch: {} }] 
      };

      // Settes opp riktig for nyere Gemini-modeller
      if (systemInstruction) {
        payload.systemInstruction = { parts: [{ text: systemInstruction }] };
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Rakel mumler noe uforståelig...";
      } else {
        const errData = await response.json().catch(() => ({}));
        const googleError = errData?.error?.message || response.statusText;
        
        // Sjekker spesifikt for "Limit: 0" problemet
        if (googleError.includes("limit: 0")) {
          return "FEIL: Google gir deg fremdeles 0 i kvote. Sjekk at kortet/faktureringen er knyttet til riktig prosjekt i Google Cloud, og at API-nøkkelen er oppdatert!";
        }

        if (response.status === 400 && googleError.includes("API key not valid")) {
          return "FEIL 400: API-nøkkelen din er ugyldig. Sjekk at du kopierte hele nøkkelen uten mellomrom.";
        }

        errorMessages.push(`[${model}: ${response.status} ${googleError}]`);
        continue;
      }
    } catch (error) {
      errorMessages.push(`[${model}: Nettverksfeil - ${error.message}]`);
    }
  }

  return `Orakelet feilet på alle forsøk.\n\nDetaljer:\n${errorMessages.join("\n")}`;
};

// --- KOMPLETT DATA FRA AGENDA-PDF ---
const agendaData = [
  {
    date: "Torsdag 30.04.26",
    items: [
      { id: 1, time: "13:30", title: "Matbit", location: "Hamburg Hbf", budget: null, icon: <Beer size={20} />, details: "Vi reiser fra flughafen med S-bahn til Hamburg haubtbahnhof. Vi får i oss en matbit på togstasjonen i Hamburg før videre reise. Evt. Innkjøp av snacks til turen." },
      { id: 2, time: "14:23", title: "Avreise til Goslar", location: "Hamburg Hbf", budget: null, icon: <Train size={20} />, details: "Vi reiser med ICE 1187 kl. 14:23 fra spor 12C-F. Toget går i retning Frankfurt. Vi hopper av i Hannover 15:38 og bytter til regiontog RE10 som skal til Bad Harzburg (spor 7). Seks stopp senere ankommer vi Goslar. Reisekomiteen gjør oppmerksom på at wegbier er helt greit å ha med om bord ICE-tog, men ikke regiontogene." },
      { id: 3, time: "~17:00", title: "Innsjekking", location: "Hotel der Achtermann", budget: null, icon: <MapPin size={20} />, details: "Innsjekk og omstilling på hotellet før kveldens festligheter. Hotellet ligger sentralt i den UNESCO-vernede byen Goslar." },
      { id: 4, time: "~18:00", title: "Heksebrenning", location: "Goslar", budget: "€ 35 (bargeld)", icon: <Flame size={20} className="text-orange-500" />, details: "Vi tar del i kveldens festligheter. Det ryktes om matboder, live-musikk, store bål og god stemning. Hver deltaker får et budsjett på € 35 utdelt i kontanter til eget forbruk av mat og drikke." }
    ]
  },
  {
    date: "Fredag 01.05.26",
    items: [
      { id: 5, time: "10:30", title: "Frühschoppen", location: "Cafe am Markt, Goslar", budget: "€ 30", icon: <Beer size={20} />, details: "...tyskerne har selvsagt både et ord, og kultur for, å drikke til frokost. Selv om fokuset er på drikke, serveres ofte en andre frokost, gjerne med Weißwurst, søt sennep og pretzel. Tog til Hamburg går 13:03." },
      { id: 6, time: "13:03", title: "Avreise til Hamburg", location: "Goslar Stasjon", budget: null, icon: <Train size={20} />, details: "Tog til Hamburg med bytte i Hannover 14:10-14:36. Tilbake til sivilisasjonen i Tysklands nest største by." },
      { id: 7, time: "~17:15", title: "Innsjekking", location: "Scandic Hamburg Emporio", budget: null, icon: <MapPin size={20} />, details: "Innsjekking på hotellet vårt i Hamburg, beliggende ved Gänsemarkt." },
      { id: 8, time: "18:00", title: "Middag", location: "Oberhafen Kantine, Hamburg", budget: "€ 60", icon: <Utensils size={20} />, details: "Meget tradisjonsrik restaurant hvor arbeiderne i havnen gjerne spiste. Bygget er skjevt og det serveres Labskaus." },
      { id: 9, time: "21:00", title: "Utflukt", location: "Hemmelig", budget: null, icon: <Search size={20} />, details: "Etter middag beveger vi oss en kort gåtur og starter kveldens hemmelige aktivitet." }
    ]
  },
  {
    date: "Lørdag 02.05.26",
    items: [
      { id: 10, time: "10:30", title: "Frokost", location: "Berta Boozy Brunch Club", budget: "€ 50", icon: <Beer size={20} />, details: "Bord er booket hos Berta. Budsjettet på € 50 tar høyde for lunsj og Bottomless Mimosa med vb jenter <3." },
      { id: 11, time: "12:30", title: "Utforsking i Hamburg", location: "Schanzenviertel -> St. Pauli", budget: "€ 25 (bargeld)", icon: <Map size={20} />, details: "Sjekk Sightseeing-fanen for detaljert rute. Vi ender på hotellet, tar en pust i bakken, og fortsetter kvelden." },
      { id: 12, time: "19:15", title: "Vordrink", location: "Pallas Hamburg", budget: "€ 30", icon: <Beer size={20} />, details: "Vordrink før vi drar videre til middag." },
      { id: 13, time: "20:30", title: "Middag", location: "Bullerei, Hamburg", budget: "€ 85", icon: <Utensils size={20} />, details: "Bord er booket på Bullerei – en restaurant i gourmet-klassen. De spesialiserer seg på kjøtt." }
    ]
  },
  {
    date: "Søndag 03.05.26",
    items: [
      { id: 14, time: "11:45", title: "Avreise til HAM", location: "Hamburg", budget: null, icon: <Train size={20} />, details: "Vi setter snuten mot flyplassen for hjemreise." },
      { id: 15, time: "13:50", title: "Fly til Bergen", location: "Hamburg Flughafen", budget: null, icon: <Plane size={20} />, details: "Takk for turen! Auf Wiedersehen." }
    ]
  }
];

const sightseeingData = [
  { id: 1, title: "1. Start: Berta Emil Richard Schneider", location: "Schanzenviertel", desc: "Start ved Kampstraße 25-27. Hipper Sternschanze. Gå forbi Rote Flora. Kjøp en Astra (wegbier).", lat: 53.5619, lon: 9.9613 },
  { id: 2, title: "2. Via Reeperbahn til St. Pauli", location: "The Sinful Mile", desc: "Hele Reeperbahn. Beatles-Platz. En kjapp enhet på Zum Silbersack (fra 1949).", lat: 53.5496, lon: 9.9602 },
  { id: 3, title: "3. Landungsbrücken og Elbtunnel", location: "Havnen", desc: "Alter Elbtunnel (gratis, 426m lang). Gruppebilde av skyline. Fischbrötchen!", lat: 53.5458, lon: 9.9665 },
  { id: 4, title: "4. Speicherstadt og Elbphilharmonie", location: "HafenCity", desc: "Elbphilharmonie Plaza. Broene i Speicherstadt (UNESCO). Teglsteinsmagi.", lat: 53.5413, lon: 9.9841 },
  { id: 5, title: "5. Rådhuset og Jungfernstieg", location: "Altstadt", desc: "Rathaus (647 rom!). Siste enhet ved Jungfernstieg (Alster).", lat: 53.5534, lon: 9.9936 },
  { id: 6, title: "6. Mål: Scandic Hamburg Emporio", location: "Gänsemarkt", desc: "10 minutter gange til hotellet for oppladning.", lat: 53.5558, lon: 9.9830 }
];

const qaData = [
  { q: "Hvorfor akkurat fjellet Brocken?", a: "Det er det høyeste punktet i Nord-Tyskland, og tåkeformasjoner her skaper ofte 'Brocken-spøkelset', noe som ga grobunn for myter om overnaturlige vesener." },
  { q: "Hvilken kjent forfatter udødeliggjorde Walpurgisnacht på Brocken?", a: "Johann Wolfgang von Goethe i verket Faust, etter at han selv besteg fjellet i 1777." },
  { q: "Hva er 'Maifeuer'?", a: "Det er de enorme bålene som tennes natt til 1. mai for å jage bort onde ånder og feire at vinteren er over." },
  { q: "Er det lov å gå til toppen av Brocken under feiringen?", a: "Ja, men de fleste tar 'Harzer Schmalspurbahnen' – et gammelt damptog som er en opplevelse i seg selv." },
  { q: "Hva er forskjellen på en 'Hexe' og en 'Teufel' i feiringen?", a: "Menn kler seg ofte ut som djevler (Teufel) og damene som hekser (Hexen) i et gigantisk rollespill." },
  { q: "Hvilken drikk er obligatorisk denne natten?", a: "'Maibowle' en punsj laget på hvitvin, musserende vin og skogsurten myske." },
  { q: "Hva betyr uttrykket 'Tanz in den Mai'?", a: "Det er den moderne tyske tradisjonen med å feste og danse seg fra kvelden 30. april og inn i den nye måneden." },
  { q: "Hvorfor er det så mange katter i Harz-souvenirbutikkene?", a: "Katten ble tradisjonelt sett på som heksens følgesvenn, spesielt den sorte katten." },
  { q: "Hva er det 'skjulte' symbolet på Goslars rikdom?", a: "Dukatenmännchen – en liten figur på et hus i gamlebyen som bæsjer gullmynter, et symbol på byens tidligere gruverikdom." },
  { q: "Hvilket kjent palass ligger i Goslar?", a: "Kaiserpfalz Goslar – et enormt romansk palass fra 1000-tallet." },
  { q: "Hva er spesielt med skiferen på husene i Goslar?", a: "Mange hus er dekket av blå-grå skifer fra de local gruvene i fiskeskjell-mønstre." },
  { q: "Hva er klokkespillet på torget (Marktplatz)?", a: "Hver dag kl. 09, 12, 15 og 18 viser figurer gruvehistorien til Rammelsberg." },
  { q: "Hva er den mørke siden av Goslars historie?", a: "Under 1500- og 1600-tallet var byen åsted for omfattende hekseprosesser." },
  { q: "Hva smaker egentlig Gose-øl?", a: "Den er syrlig, salt og forfriskende – minner nesten om en belgisk Geuze eller en surøl." },
  { q: "Hvor ligger 'Europas minste hotell'?", a: "I den nærliggende byen Amberg, men Goslar har mange 'Tiny Houses'." },
  { q: "Hva er 'Harzer Roller'?", a: "En lokal, ekstremt mager (og illeluktende) ost som har vært populær siden 1700-tallet." },
  { q: "Hvorfor er det flere broer i Hamburg enn i Venezia og Amsterdam?", a: "Byen har over 2500 broer på grunn av alle kanalene (fleeten) og elvene Elben og Alster." },
  { q: "Hva er 'Harry's Hafenbasar'?", a: "En butikk i en gammel kran i havnen som selger kuriositeter fra hele verden." },
  { q: "Hvilken hemmelighet skjuler seg under St. Pauli?", a: "Et enormt nettverk av bunkere, noen brukes nå som nattklubber." },
  { q: "Hva er 'Pfeffersäcke'?", a: "Kallenavn på de rike handelsmennene i Hamburg (pepper-sekker)." },
  { q: "Hvorfor er kaffen så god i Hamburg?", a: "Byen har vært Europas største importhavn for kaffe i generasjoner." },
  { q: "Hva er 'Der Hamburger Dom'?", a: "Nord-Tysklands største tivoli, arrangeres tre ganger i året." },
  { q: "Hva betyr 'Hummel, Hummel'?", a: "Tradisjonelt Hamburg-rop. Svaret er 'Mors, Mors!'." },
  { q: "Hvorfor spiller St. Pauli i brunt og hvitt?", a: "Det var de billigste fargene de kunne skaffe tekstiler i da klubben startet." },
  { q: "Hva er den dyreste gaten i Hamburg?", a: "Neuer Wall - her finner du luksusmerkene." }
];

const parlorData = [
  { no: "En stor øl, takk!", de: "Ein großes Bier, bitte!" },
  { no: "Hvor er toalettet?", de: "Wo ist die Toilette?" },
  { no: "Regningen, takk", de: "Die Rechnung, bitte" },
  { no: "Snakker du engelsk?", de: "Sprechen Sie Englisch?" },
  { no: "Skål!", de: "Prost!" },
  { no: "Unnskyld (for å få oppmerksomhet)", de: "Entschuldigung" },
  { no: "Takk", de: "Danke" }
];

const nightclubs = ["Uebel & Gefährlich", "Mojo Club", "Südpol", "Angie's", "NOHO"];

// --- HJELPEFUNKSJONER ---
const getWeatherDetails = (code) => {
  if (code === 0) return { text: "Klart", icon: <Sun size={28} className="text-yellow-400" /> };
  if (code === 1 || code === 2 || code === 3) return { text: "Delvis skyet", icon: <Cloud size={28} className="text-zinc-400" /> };
  if (code >= 45 && code <= 48) return { text: "Tåke", icon: <Cloud size={28} className="text-zinc-500" /> };
  if (code >= 51 && code <= 67) return { text: "Regn", icon: <CloudRain size={28} className="text-blue-400" /> };
  if (code >= 71 && code <= 77) return { text: "Snø", icon: <Snowflake size={28} className="text-white" /> };
  if (code >= 80 && code <= 82) return { text: "Regnbyger", icon: <CloudRain size={28} className="text-blue-500" /> };
  if (code >= 95) return { text: "Torden", icon: <CloudLightning size={28} className="text-purple-500" /> };
  return { text: "Skiftende", icon: <Cloud size={28} className="text-zinc-400" /> };
};

const formatDay = (dateString) => {
  const date = new Date(dateString);
  const days = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'];
  return days[date.getDay()];
};

// --- KOMPONENTER ---

// Custom Heksehatt-ikon
const WitchHatIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2.5 17a19.5 19.5 0 0 0 19 0" />
    <path d="M6 16.5l2 -10.5c.5 -2.5 2 -4 4 -4c0 2 2 3 2 5l1.5 9.5" />
    <line x1="8" y1="14" x2="16" y2="14" />
  </svg>
);

// Pop-up for å legge til på hjemskjerm (PWA)
const InstallPrompt = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);
    const isAndroidStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (!isInStandaloneMode() && !isAndroidStandalone) {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-4 left-4 right-4 bg-orange-600/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl z-[150] flex justify-between items-start animate-in slide-in-from-top-4 border border-orange-400/30">
      <div className="flex gap-4">
        <div className="bg-zinc-950/30 p-2 rounded-xl h-fit text-white">
          <Download size={24} />
        </div>
        <div>
          <h3 className="font-bold text-sm">Få App-følelsen!</h3>
          <p className="text-xs text-orange-100 mt-1 leading-relaxed">
            Trykk på <Share size={12} className="inline mx-1" /> (Del) i Safari, rull ned og velg <strong>«Legg til på hjemskjerm»</strong>.
          </p>
        </div>
      </div>
      <button onClick={() => setShow(false)} className="bg-black/20 hover:bg-black/30 p-1.5 rounded-full transition-colors ml-2">
        <X size={16} />
      </button>
    </div>
  );
};

const AgendaCard = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div 
      className={`bg-zinc-900 border rounded-2xl p-5 mb-4 cursor-pointer transition-all duration-300 shadow-lg ${expanded ? 'border-orange-500/50' : 'border-zinc-800 hover:border-zinc-700'}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className="mt-1 text-orange-500 flex items-center justify-center w-10 h-10">
            {item.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100">{item.title}</h3>
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
              {/* TA MEG DIT KNAPP */}
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
        <div className="text-zinc-600 mt-1">{expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
      </div>
      {expanded && (
        <div className="mt-5 pt-5 border-t border-zinc-800 text-sm text-zinc-400 leading-relaxed animate-in fade-in duration-300">
          {item.details}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('program');
  const [selectedMapStop, setSelectedMapStop] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [introExpanded, setIntroExpanded] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', text: 'Kakk-kakk! Rakel er klar. Spør meg om Walpurgis, Hamburg eller øl!' }
  ]);
  const [isChatting, setIsChatting] = useState(false);
  
  // Vær-states
  const [weather, setWeather] = useState({ hamburg: null, goslar: null, loading: true });
  const [expandedWeather, setExpandedWeather] = useState(null); // 'hamburg' eller 'goslar'

  const [eurRate, setEurRate] = useState(null);
  const chatEndRef = useRef(null);

  // Nye states for Wegbier-teller
  const [wegbierCount, setWegbierCount] = useState(0);

  // Påskeegg state
  const [logoTaps, setLogoTaps] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Laste inn lokal lagret data for wegbier
  useEffect(() => {
    const savedBeers = localStorage.getItem('heksejakt_wegbiers');
    if (savedBeers) setWegbierCount(parseInt(savedBeers));
  }, []);

  const handleWegbierChange = (increment) => {
    const newCount = Math.max(0, wegbierCount + increment);
    setWegbierCount(newCount);
    localStorage.setItem('heksejakt_wegbiers', newCount.toString());
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const [h, g] = await Promise.all([
          // Henter daglig varsel for 3 dager
          fetch('https://api.open-meteo.com/v1/forecast?latitude=53.55&longitude=9.99&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe%2FBerlin&forecast_days=3'),
          fetch('https://api.open-meteo.com/v1/forecast?latitude=51.90&longitude=10.42&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe%2FBerlin&forecast_days=3')
        ]);
        const hd = await h.json();
        const gd = await g.json();
        setWeather({ hamburg: hd.daily, goslar: gd.daily, loading: false });
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
  }, [chatHistory, isChatting]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatting) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setIsChatting(true);

    try {
      const heksKunnskap = `
        Agenda: ${JSON.stringify(agendaData.map(d => `${d.date}: ${d.items.map(i => `${i.time} ${i.title} på ${i.location} (${i.details})`).join(" | ")}`))}
        Sightseeing i Hamburg: ${JSON.stringify(sightseeingData.map(s => `${s.title}: ${s.desc}`))}
        Trivia og Spørsmål: ${JSON.stringify(qaData)}
        Nødkontakter: Politi 110, Ambulanse 112. Taxi: Bruk FreeNow eller Uber. 
        Hotell Hamburg: Scandic Hamburg Emporio, Dammtorwall 19. Hotell Goslar: Hotel der Achtermann, Rosentorstraße 20.
      `;

      const sys = `Du er en sarkastisk tysk heks fra Brocken-fjellet som heter Rakel. Svar på norsk, men sleng inn et tysk ord her og der. Vær morsom og litt bitende, men DU MÅ ALLTID GI ET FAKTISK SVAR på det brukeren spør om i den samme meldingen! 
      ALDRI si "jeg skal sjekke" uten å faktisk gi svaret. Bruk Google Søk til å finne ekte, oppdatert informasjon (for eksempel værmeldingen for Goslar) og gi svaret umiddelbart sammen med de sarkastiske kommentarene dine.
      
      Intern reiseinformasjon for Heksejakten 2026: ${heksKunnskap}`;
      
      // Nå sender vi også med historikken inn i funksjonen!
      const res = await callGeminiAPI(chatHistory, msg, sys);
      setChatHistory(prev => [...prev, { role: 'model', text: res }]);
    } finally {
      setIsChatting(false);
    }
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
      
      {/* PÅSKEEGG ANIMASJON */}
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

      {showSplash && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center animate-out fade-out duration-1000 fill-mode-forwards"
          style={{
            backgroundImage: 'url(/brocken.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 55%',
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex flex-col items-center">
            {/* GLØDENDE FLAMME I INTROEN */}
            <Flame
              size={80}
              className="text-orange-500 animate-bounce"
              style={{ filter: 'drop-shadow(0 0 25px rgba(249, 115, 22, 0.8))' }}
            />
            <h1 className="mt-8 text-4xl font-black text-orange-500 tracking-widest uppercase">Heksejakt</h1>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans pb-24">
        <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40 p-4 shadow-xl">
          <div className="max-w-md mx-auto flex justify-between items-center">
            {/* Logo med skjult Påskeegg-trigger */}
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
                ></iframe>
              </div>
              <div className="space-y-4">
                {sightseeingData.map((stop, i) => (
                  <div 
                    key={stop.id} 
                    onClick={() => setSelectedMapStop(stop)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedMapStop?.id === stop.id ? 'bg-zinc-800 border-orange-500 shadow-lg' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
                  >
                    <div className="flex gap-4">
                      <span className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">{i+1}</span>
                      <div>
                        <h3 className="font-bold text-zinc-100">{stop.title}</h3>
                        <p className="text-sm text-zinc-400 mt-1">{stop.desc}</p>
                        
                        {/* TA MEG DIT KNAPP FOR SIGHTSEEING */}
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lon}`); 
                          }}
                          className="mt-3 text-xs flex items-center gap-1 text-blue-400 font-bold bg-blue-500/10 px-2 py-1.5 rounded-md hover:bg-blue-500/20 transition-colors w-fit border border-blue-500/20"
                        >
                          <Navigation size={12}/> Ta meg dit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orakel' && (
            <div className="animate-in fade-in flex flex-col h-[calc(100dvh-190px)]">
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
              <form onSubmit={handleChatSubmit} className="mt-4 flex gap-2">
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Spør Rakel..." 
                  enterKeyHint="send"
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-5 py-3 text-sm focus:border-orange-500 outline-none"
                />
                <button type="submit" disabled={isChatting} className="bg-orange-600 p-3 rounded-full shadow-lg active:scale-95 transition-transform"><Send size={20} /></button>
              </form>
            </div>
          )}

          {activeTab === 'qa' && (
            <div className="animate-in fade-in space-y-3">
              <h2 className="text-xl font-bold mb-4">Q&A & Trivia</h2>
              {qaData.map((d, i) => (
                <div key={i} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                  <h3 className="text-sm font-bold mb-1 text-orange-400">{d.q}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{d.a}</p>
                </div>
              ))}

              {/* MINI-PARLØR */}
              <h2 className="text-xl font-bold mb-4 mt-8 flex items-center gap-2 text-zinc-100">
                <MessageCircle size={20} className="text-orange-500"/> Mini-Parlør
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
          )}

          {activeTab === 'info' && (
            <div className="animate-in fade-in space-y-6">

              {/* UTVIDBAR INTRO FRA PDF */}
              <section 
                className={`bg-zinc-900 rounded-2xl border transition-all duration-500 overflow-hidden shadow-xl ${introExpanded ? 'border-orange-500/50' : 'border-zinc-800'}`}
              >
                <div 
                  className="p-6 cursor-pointer flex justify-between items-center bg-zinc-900/50"
                  onClick={() => setIntroExpanded(!introExpanded)}
                >
                  <div className="flex items-center gap-3">
                    <ScrollText className="text-orange-500" size={24} />
                    <h2 className="font-bold text-zinc-100">#nød drar til Blokksberg</h2>
                  </div>
                  {introExpanded ? <ChevronUp className="text-zinc-500" /> : <ChevronDown className="text-zinc-500" />}
                </div>
                
                <div className={`transition-all duration-500 ${introExpanded ? 'max-h-[2000px] opacity-100 p-6 pt-0' : 'max-h-0 opacity-0'}`}>
                  <div className="text-sm text-zinc-400 space-y-4 leading-relaxed border-t border-zinc-800 pt-6">
                    <p>I likhet med forrige #nød-tur, og turen før det, reiser vi til Tyskland. Denne gang starter turen i Freie und Hansestadt Hamburg - Tysklands nest største by med nær to millioner innbyggere. Hamburg ligger ved munningen til Elben - en viktig elv som krysser Tyskland og Tsjekkia. Nærheten til Nordsjøen, og knutepunktet med Elben, gjør Hamburg havn til den nest største i Europa, med lange og stolte sjøfartsrøtter.</p>
                    <p>Hamburg skal vi bli mer kjent med etter hvert, men først; det er 30. April Valborgsnatt.</p>
                    <p>St. Valborg, Walpurga på tysk, var en nonne som levde på slutten av 700-tallet. Uansett markeres Valborgsmesse 1. mai - seks måneder etter allehelgensdag. Dagen før feires Walpurgisnacht - et sammensurium av hedenske tradisjoner, vårmarkeringer og katolske skikker. Blant annet ble St. Walpurga påkalt for å holde på avstand pest, rabies, kikhoste - og hekser.</p>
                    <p>I kombinasjon med hyllest av Walpurga ble det fyrt opp store bål som skulle holde heksene som fløy over hodene, på sopelimer, fra å lande og plage lokalbefolkningen. Særlig 30. April, ved overgangen til våren, skal det ha vært svært høy hekseaktivitet ved foten av fjellet Brocken. På Norsk - Blokksberg.</p>
                    <p>Vi reiser derfor til byen Goslar ved utkanten av fjellområdet Harz, hvor Blokksberg befinner seg. Her brennes fremdeles hekser til langt ut på natten. Vi bistår.</p>
                    <p>Goslar er en godt bevart by med verdensarvstatus. Gamlebyen består av over 1500 gamle bindingsverkshus. Gruvene i nærliggende Rammelsberg gav innbyggerne i Goslar jobb i 1000 år før den siste malmbiten ble utvunnet i 1988. Goslar ligger ved elven Gose, som også er navnet på en spesiell øltype fra området.</p>
                  </div>
                </div>
              </section>

              {/* WEGBIER-TELLER */}
              <section className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl flex items-center justify-between">
                <div>
                  <h2 className="font-bold flex items-center gap-2 text-zinc-100"><Beer size={20} className="text-orange-500"/> Wegbier-teller</h2>
                  <p className="text-xs text-zinc-500 mt-1">Din personlige logg for turen</p>
                </div>
                <div className="flex items-center gap-3 bg-zinc-950 p-1.5 rounded-full border border-zinc-800">
                  <button onClick={() => handleWegbierChange(-1)} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors"><Minus size={16} className="text-zinc-300"/></button>
                  <span className="w-8 text-center font-black text-xl text-orange-400">{wegbierCount}</span>
                  <button onClick={() => handleWegbierChange(1)} className="p-2 bg-orange-600 hover:bg-orange-500 rounded-full transition-colors"><Plus size={16} className="text-white"/></button>
                </div>
              </section>

              <section className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl">
                <h2 className="font-bold mb-4 flex items-center gap-2 text-zinc-100"><Headphones className="text-orange-500" /> Podcast</h2>
                <iframe style={{ borderRadius: '12px' }} src="https://open.spotify.com/embed/episode/6HTGxq4it3BRx9a69VAN89?utm_source=generator" width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
              </section>

              {/* UTVIDET 3-DAGERS VÆRVARSEL */}
              <section className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl">
                <h2 className="font-bold mb-4 flex items-center gap-2 text-zinc-100"><Thermometer className="text-orange-500" /> Værvarsel</h2>
                {weather.loading ? (
                  <div className="flex justify-center p-4"><RefreshCw className="animate-spin text-zinc-500" size={24} /></div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    
                    {/* HAMBURG KORT */}
                    <div 
                      onClick={() => setExpandedWeather(expandedWeather === 'hamburg' ? null : 'hamburg')}
                      className={`bg-zinc-950 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${expandedWeather === 'hamburg' ? 'border-orange-500 shadow-lg' : 'border-zinc-800 hover:border-zinc-700'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Hamburg</div>
                          <div className="text-sm font-bold text-zinc-100">
                            {expandedWeather === 'hamburg' ? '3-dagers varsel' : 'Været i dag'}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                           {getWeatherDetails(weather.hamburg?.weather_code[0]).icon}
                           <div className="text-xl font-black">{Math.round(weather.hamburg?.temperature_2m_max[0] || 0)}°</div>
                           {expandedWeather === 'hamburg' ? <ChevronUp size={16} className="text-zinc-600"/> : <ChevronDown size={16} className="text-zinc-600"/>}
                        </div>
                      </div>

                      {/* Utvidet visning Hamburg */}
                      {expandedWeather === 'hamburg' && weather.hamburg && (
                        <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-3 gap-2 animate-in fade-in duration-300">
                          {[0, 1, 2].map(dayIdx => (
                            <div key={dayIdx} className="flex flex-col items-center text-center">
                              <span className="text-[10px] text-zinc-500 uppercase font-bold mb-1">
                                {dayIdx === 0 ? 'I dag' : formatDay(weather.hamburg.time[dayIdx])}
                              </span>
                              {getWeatherDetails(weather.hamburg.weather_code[dayIdx]).icon}
                              <div className="mt-1 flex items-center gap-1 text-xs">
                                <span className="font-bold text-zinc-200">{Math.round(weather.hamburg.temperature_2m_max[dayIdx])}°</span>
                                <span className="text-zinc-600">/</span>
                                <span className="text-zinc-500">{Math.round(weather.hamburg.temperature_2m_min[dayIdx])}°</span>
                              </div>
                              <span className="text-[9px] text-zinc-400 mt-1 uppercase leading-tight">
                                {getWeatherDetails(weather.hamburg.weather_code[dayIdx]).text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* GOSLAR KORT */}
                    <div 
                      onClick={() => setExpandedWeather(expandedWeather === 'goslar' ? null : 'goslar')}
                      className={`bg-zinc-950 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${expandedWeather === 'goslar' ? 'border-orange-500 shadow-lg' : 'border-zinc-800 hover:border-zinc-700'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Goslar</div>
                          <div className="text-sm font-bold text-zinc-100">
                            {expandedWeather === 'goslar' ? '3-dagers varsel' : 'Været i dag'}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                           {getWeatherDetails(weather.goslar?.weather_code[0]).icon}
                           <div className="text-xl font-black">{Math.round(weather.goslar?.temperature_2m_max[0] || 0)}°</div>
                           {expandedWeather === 'goslar' ? <ChevronUp size={16} className="text-zinc-600"/> : <ChevronDown size={16} className="text-zinc-600"/>}
                        </div>
                      </div>

                      {/* Utvidet visning Goslar */}
                      {expandedWeather === 'goslar' && weather.goslar && (
                        <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-3 gap-2 animate-in fade-in duration-300">
                          {[0, 1, 2].map(dayIdx => (
                            <div key={dayIdx} className="flex flex-col items-center text-center">
                              <span className="text-[10px] text-zinc-500 uppercase font-bold mb-1">
                                {dayIdx === 0 ? 'I dag' : formatDay(weather.goslar.time[dayIdx])}
                              </span>
                              {getWeatherDetails(weather.goslar.weather_code[dayIdx]).icon}
                              <div className="mt-1 flex items-center gap-1 text-xs">
                                <span className="font-bold text-zinc-200">{Math.round(weather.goslar.temperature_2m_max[dayIdx])}°</span>
                                <span className="text-zinc-600">/</span>
                                <span className="text-zinc-500">{Math.round(weather.goslar.temperature_2m_min[dayIdx])}°</span>
                              </div>
                              <span className="text-[9px] text-zinc-400 mt-1 uppercase leading-tight">
                                {getWeatherDetails(weather.goslar.weather_code[dayIdx]).text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </section>

              <section className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl">
                <h2 className="font-bold mb-3 flex items-center gap-2 text-zinc-100"><Coins className="text-orange-500" /> Valuta & Budsjett</h2>
                <div className="flex justify-between items-center bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <span className="text-sm text-zinc-400">Eurokurs:</span>
                  <span className="font-bold text-orange-400 text-lg">{eurRate ? `1€ = ${eurRate.toFixed(2)} NOK` : 'Laster...'}</span>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex gap-3 items-center text-xs text-zinc-400">
                    <CheckCircle2 size={24} className="text-green-500 shrink-0" />
                    <p>Måltider med oppført budsjett dekkes av felleskassa. Reiseleder betaler.</p>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex gap-3 items-center text-xs text-zinc-400">
                    <Coins size={24} className="text-yellow-500 shrink-0" />
                    <p>Hver deltaker får utdelt <strong className="text-zinc-200">60 euro i kontanter (bargeld)</strong> til mat/drikke der kort ikke tas.</p>
                  </div>
                </div>
              </section>

              <section className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl">
                <h2 className="font-bold mb-4 flex items-center gap-2 text-zinc-100"><PlayCircle className="text-orange-500" /> Spilleliste</h2>
                <iframe style={{ borderRadius: '12px' }} src="https://open.spotify.com/embed/playlist/1me7HbLOFEA2JG764uTqFg?utm_source=generator" width="100%" height="352" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
              </section>

              {/* NØDKONTAKTER & ADRESSER - FLYTTET NEDERST */}
              <section className="bg-red-950/30 p-6 rounded-2xl border border-red-900/50 shadow-xl mb-4">
                <h2 className="font-bold mb-4 flex items-center gap-2 text-red-400"><ShieldAlert size={20} /> Sikkerhet & Adresser</h2>
                <div className="space-y-4 text-sm text-zinc-300">
                  <div>
                    <h3 className="font-bold text-zinc-100 mb-1">Nødnummer</h3>
                    <p className="flex justify-between border-b border-red-900/30 pb-1"><span>Politi:</span> <strong className="text-red-400">110</strong></p>
                    <p className="flex justify-between pt-1"><span>Ambulanse / Brann:</span> <strong className="text-red-400">112</strong></p>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-zinc-100 mb-1 mt-3">Transport</h3>
                    <p className="leading-relaxed mb-2">
                      <strong className="text-white">Kollektivt (Hamburg):</strong> Last ned appen <strong className="text-white">HVV</strong> (Hamburger Verkehrsverbund). Veldig enkel for å kjøpe billetter til U-bahn, S-bahn og busser. Alternativt kan du betale med Apple Pay / kort direkte på de fleste stasjoner.
                    </p>
                    <p className="leading-relaxed">
                      <strong className="text-white">Taxi:</strong> Last ned appene <strong className="text-white">FreeNow</strong> eller <strong className="text-white">Uber</strong> for å bestille taxi raskest mulig.
                    </p>
                  </div>

                  <div className="bg-zinc-950/50 p-3 rounded-xl border border-red-900/20 relative">
                    <h3 className="font-bold text-zinc-100 mb-1 flex items-center gap-1"><MapPin size={14} className="text-orange-500"/> Hotel Hamburg</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-3">Scandic Hamburg Emporio<br/>Dammtorwall 19, 20355 Hamburg</p>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Scandic Hamburg Emporio, Dammtorwall 19, 20355 Hamburg, Tyskland')}`); 
                      }}
                      className="absolute bottom-3 right-3 flex items-center gap-1 text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                    >
                      <Navigation size={10} /> Ta meg dit
                    </button>
                  </div>

                  <div className="bg-zinc-950/50 p-3 rounded-xl border border-red-900/20 relative">
                    <h3 className="font-bold text-zinc-100 mb-1 flex items-center gap-1"><MapPin size={14} className="text-orange-500"/> Hotel Goslar</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-3">Hotel der Achtermann<br/>Rosentorstraße 20, 38640 Goslar</p>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Hotel der Achtermann, Rosentorstraße 20, 38640 Goslar, Tyskland')}`); 
                      }}
                      className="absolute bottom-3 right-3 flex items-center gap-1 text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                    >
                      <Navigation size={10} /> Ta meg dit
                    </button>
                  </div>
                </div>
              </section>

            </div>
          )}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800 py-4 px-2 z-50">
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


