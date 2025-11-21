import React from 'react';
import { useLiveApi } from '../hooks/useLiveApi';
import { Orb } from './Orb';
import { Mic, MicOff, XCircle } from 'lucide-react';

export const VoiceMode: React.FC = () => {
  const { isConnected, isConnecting, isSpeaking, connect, disconnect, volume, error } = useLiveApi();

  const handleToggleConnection = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between py-8 h-full overflow-y-auto">
      {/* Visualizer Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[300px]">
         <Orb isActive={isConnected} isSpeaking={isSpeaking} volume={volume} />
         
         {!isConnected && !isConnecting && (
           <div className="mt-12 text-center max-w-md animate-fade-in px-6">
             <p className="text-slate-400 text-lg mb-2 font-light font-serif italic">
               "Pedi e se vos dará. Buscai e achareis. Batei e vos será aberto."
             </p>
             <p className="text-slate-600 text-sm uppercase tracking-widest">Mateus 7,7</p>
             
             <div className="mt-8 p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-sm text-slate-400">
                <p>Toque no microfone para iniciar uma conversa em tempo real sobre a fé católica.</p>
             </div>
           </div>
         )}

        {error && (
          <div className="mt-8 mx-4 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-3 text-red-300 max-w-md">
             <XCircle className="w-5 h-5 flex-shrink-0" />
             <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full max-w-md flex flex-col items-center gap-6 mb-4">
         <button 
           onClick={handleToggleConnection}
           disabled={isConnecting}
           className={`
             relative group flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300
             ${isConnected 
               ? 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400' 
               : 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_50px_rgba(245,158,11,0.6)]'
             }
             ${isConnecting ? 'opacity-80 cursor-wait' : ''}
           `}
         >
            {isConnecting ? (
               <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            ) : isConnected ? (
               <MicOff className="w-8 h-8" />
            ) : (
               <Mic className="w-8 h-8" />
            )}
         </button>

         <div className="flex items-center gap-2 text-xs font-medium tracking-widest uppercase">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
            <span className={isConnected ? 'text-green-400' : 'text-slate-600'}>
              {isConnected ? 'Gemini Live Ativo' : 'Toque para falar'}
            </span>
         </div>
      </div>
    </div>
  );
};