import React from 'react';
import {
  ScrollText, ChevronDown, ChevronUp, Beer, Headphones, Thermometer,
  RefreshCw, Coins, CheckCircle2, PlayCircle, ShieldAlert, MapPin, Navigation,
  Plus, Minus
} from 'lucide-react';
import { getWeatherDetails, formatDay } from '../utils/weather.jsx';

export const InfoTab = ({
  introExpanded, setIntroExpanded,
  weather, expandedWeather, setExpandedWeather,
  eurRate,
  wegbierCount, handleWegbierChange
}) => (
  <div className="animate-in fade-in space-y-6">

    {/* INTRO */}
    <section className={`bg-zinc-900 rounded-2xl border transition-all duration-500 overflow-hidden shadow-xl ${introExpanded ? 'border-orange-500/50' : 'border-zinc-800'}`}>
      <div className="p-6 cursor-pointer flex justify-between items-center bg-zinc-900/50" onClick={() => setIntroExpanded(!introExpanded)}>
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
        <h2 className="font-bold flex items-center gap-2 text-zinc-100"><Beer size={20} className="text-orange-500" /> Wegbier-teller</h2>
        <p className="text-xs text-zinc-500 mt-1">Din personlige logg for turen</p>
      </div>
      <div className="flex items-center gap-3 bg-zinc-950 p-1.5 rounded-full border border-zinc-800">
        <button onClick={() => handleWegbierChange(-1)} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors"><Minus size={16} className="text-zinc-300" /></button>
        <span className="w-8 text-center font-black text-xl text-orange-400">{wegbierCount}</span>
        <button onClick={() => handleWegbierChange(1)} className="p-2 bg-orange-600 hover:bg-orange-500 rounded-full transition-colors"><Plus size={16} className="text-white" /></button>
      </div>
    </section>

    {/* PODCAST */}
    <section className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl">
      <h2 className="font-bold mb-4 flex items-center gap-2 text-zinc-100"><Headphones className="text-orange-500" /> Podcast</h2>
      <iframe style={{ borderRadius: '12px' }} src="https://open.spotify.com/embed/episode/6HTGxq4it3BRx9a69VAN89?utm_source=generator" width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title="Podcast" />
    </section>

    {/* VÆRVARSEL */}
    <section className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl">
      <h2 className="font-bold mb-4 flex items-center gap-2 text-zinc-100"><Thermometer className="text-orange-500" /> Værvarsel</h2>
      {weather.loading ? (
        <div className="flex justify-center p-4"><RefreshCw className="animate-spin text-zinc-500" size={24} /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {['hamburg', 'goslar'].map(city => {
            const data = weather[city];
            const label = city === 'hamburg' ? 'Hamburg' : 'Goslar';
            return (
              <div
                key={city}
                onClick={() => setExpandedWeather(expandedWeather === city ? null : city)}
                className={`bg-zinc-950 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${expandedWeather === city ? 'border-orange-500 shadow-lg' : 'border-zinc-800 hover:border-zinc-700'}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">{label}</div>
                    <div className="text-sm font-bold text-zinc-100">
                      {expandedWeather === city ? '3-dagers varsel' : 'Været i dag'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getWeatherDetails(data?.weather_code[0]).icon}
                    <div className="text-xl font-black">{Math.round(data?.temperature_2m_max[0] || 0)}°</div>
                    {expandedWeather === city ? <ChevronUp size={16} className="text-zinc-600" /> : <ChevronDown size={16} className="text-zinc-600" />}
                  </div>
                </div>
                {expandedWeather === city && data && (
                  <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-3 gap-2 animate-in fade-in duration-300">
                    {[0, 1, 2].map(dayIdx => (
                      <div key={dayIdx} className="flex flex-col items-center text-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold mb-1">
                          {dayIdx === 0 ? 'I dag' : formatDay(data.time[dayIdx])}
                        </span>
                        {getWeatherDetails(data.weather_code[dayIdx]).icon}
                        <div className="mt-1 flex items-center gap-1 text-xs">
                          <span className="font-bold text-zinc-200">{Math.round(data.temperature_2m_max[dayIdx])}°</span>
                          <span className="text-zinc-600">/</span>
                          <span className="text-zinc-500">{Math.round(data.temperature_2m_min[dayIdx])}°</span>
                        </div>
                        <span className="text-[9px] text-zinc-400 mt-1 uppercase leading-tight">
                          {getWeatherDetails(data.weather_code[dayIdx]).text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>

    {/* VALUTA & BUDSJETT */}
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

    {/* SPILLELISTE */}
    <section className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl">
      <h2 className="font-bold mb-4 flex items-center gap-2 text-zinc-100"><PlayCircle className="text-orange-500" /> Spilleliste</h2>
      <iframe style={{ borderRadius: '12px' }} src="https://open.spotify.com/embed/playlist/1me7HbLOFEA2JG764uTqFg?utm_source=generator" width="100%" height="352" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title="Spilleliste" />
    </section>

    {/* SIKKERHET & ADRESSER */}
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
          <h3 className="font-bold text-zinc-100 mb-1 flex items-center gap-1"><MapPin size={14} className="text-orange-500" /> Hotel Hamburg</h3>
          <p className="text-xs text-zinc-400 leading-relaxed mb-3">Scandic Hamburg Emporio<br />Dammtorwall 19, 20355 Hamburg</p>
          <button
            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Scandic Hamburg Emporio, Dammtorwall 19, 20355 Hamburg, Tyskland')}`, '_blank', 'noopener,noreferrer')}
            className="absolute bottom-3 right-3 flex items-center gap-1 text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
          >
            <Navigation size={10} /> Ta meg dit
          </button>
        </div>
        <div className="bg-zinc-950/50 p-3 rounded-xl border border-red-900/20 relative">
          <h3 className="font-bold text-zinc-100 mb-1 flex items-center gap-1"><MapPin size={14} className="text-orange-500" /> Hotel Goslar</h3>
          <p className="text-xs text-zinc-400 leading-relaxed mb-3">Hotel der Achtermann<br />Rosentorstraße 20, 38640 Goslar</p>
          <button
            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Hotel der Achtermann, Rosentorstraße 20, 38640 Goslar, Tyskland')}`, '_blank', 'noopener,noreferrer')}
            className="absolute bottom-3 right-3 flex items-center gap-1 text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
          >
            <Navigation size={10} /> Ta meg dit
          </button>
        </div>
      </div>
    </section>

  </div>
);
