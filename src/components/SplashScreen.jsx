import React from 'react';
import { Flame } from 'lucide-react';

export const SplashScreen = () => (
  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center animate-out fade-out duration-1000 fill-mode-forwards overflow-hidden">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: 'url(/brocken.png)',
        backgroundSize: 'cover',
        backgroundPosition: '65% 55%',
        transform: 'scale(1.1)',
      }}
    />
    <div className="absolute inset-0 bg-black/40" />
    <div className="relative z-10 flex flex-col items-center">
      <Flame
        size={80}
        className="text-orange-500 animate-bounce"
        style={{ filter: 'drop-shadow(0 0 30px rgba(249, 115, 22, 0.9)) drop-shadow(0 0 60px rgba(249, 115, 22, 0.5))' }}
      />
      <h1
        className="mt-8 text-4xl font-black text-orange-500 tracking-widest uppercase"
        style={{ textShadow: '0 0 20px rgba(249, 115, 22, 0.9), 0 0 50px rgba(249, 115, 22, 0.5)' }}
      >Heksejakt</h1>
    </div>
  </div>
);
