import React, { useState } from 'react';
import { VoiceMode } from './components/VoiceMode';
import { ChatMode } from './components/ChatMode';
import { MapMode } from './components/MapMode';
import { Mic, MessageSquare, MapPin, BookOpen, HelpCircle } from 'lucide-react';

type Mode = 'voice' | 'chat' | 'map';

export default function App() {
  const [activeMode, setActiveMode] = useState<Mode>('voice');

  return (
    <div className="min-h-screen w-full bg-slate-950 relative flex flex-col overflow-hidden font-sans text-slate-100">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-amber-900/20 rounded-full blur-[100px]"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full flex justify-between items-center border-b border-slate-800 p-4 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-900/50">
             <BookOpen className="text-slate-900 w-6 h-6" />
           </div>
           <div>
             <h1 className="text-xl font-bold text-slate-100 tracking-tight font-serif">Vox Catholica</h1>
             <p className="text-[10px] text-amber-400 uppercase tracking-widest hidden sm:block">Catecismo & Doutrina</p>
           </div>
        </div>
        <div className="flex gap-4">
           <a href="#" className="text-slate-400 hover:text-amber-300 transition-colors">
             <HelpCircle className="w-5 h-5" />
           </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col w-full overflow-hidden">
        {activeMode === 'voice' && <VoiceMode />}
        {activeMode === 'chat' && <ChatMode />}
        {activeMode === 'map' && <MapMode />}
      </main>

      {/* Bottom Navigation */}
      <nav className="relative z-20 w-full bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 p-2 pb-4 sm:pb-2">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button
            onClick={() => setActiveMode('voice')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeMode === 'voice' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Mic className={`w-6 h-6 ${activeMode === 'voice' ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-medium uppercase tracking-wider">Voz</span>
          </button>

          <button
            onClick={() => setActiveMode('chat')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeMode === 'chat' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <MessageSquare className={`w-6 h-6 ${activeMode === 'chat' ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-medium uppercase tracking-wider">Chat</span>
          </button>

          <button
            onClick={() => setActiveMode('map')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeMode === 'map' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <MapPin className={`w-6 h-6 ${activeMode === 'map' ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-medium uppercase tracking-wider">Igrejas</span>
          </button>
        </div>
      </nav>
    </div>
  );
}