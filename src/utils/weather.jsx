import React from 'react';
import { Sun, Cloud, CloudRain, Snowflake, CloudLightning } from 'lucide-react';

export const getWeatherDetails = (code) => {
  if (code === 0) return { text: "Klart", icon: <Sun size={28} className="text-yellow-400" /> };
  if (code === 1 || code === 2 || code === 3) return { text: "Delvis skyet", icon: <Cloud size={28} className="text-zinc-400" /> };
  if (code >= 45 && code <= 48) return { text: "Tåke", icon: <Cloud size={28} className="text-zinc-500" /> };
  if (code >= 51 && code <= 67) return { text: "Regn", icon: <CloudRain size={28} className="text-blue-400" /> };
  if (code >= 71 && code <= 77) return { text: "Snø", icon: <Snowflake size={28} className="text-white" /> };
  if (code >= 80 && code <= 82) return { text: "Regnbyger", icon: <CloudRain size={28} className="text-blue-500" /> };
  if (code >= 95) return { text: "Torden", icon: <CloudLightning size={28} className="text-purple-500" /> };
  return { text: "Skiftende", icon: <Cloud size={28} className="text-zinc-400" /> };
};

export const formatDay = (dateString) => {
  const date = new Date(dateString);
  const days = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'];
  return days[date.getDay()];
};
