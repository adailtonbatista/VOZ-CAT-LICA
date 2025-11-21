import React, { useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { Send, User, Sparkles, Loader2 } from 'lucide-react';

export const ChatMode: React.FC = () => {
  const { messages, isLoading, sendMessage } = useChat();
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const message = input;
    setInput('');
    await sendMessage(message);
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4 opacity-60">
            <Sparkles className="w-12 h-12 text-amber-500/50" />
            <p className="text-center text-sm max-w-xs">
              Pergunte sobre a Bíblia, o Catecismo ou documentos da Igreja.
              O Gemini Pro ajudará você com respostas profundas.
            </p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-slate-700' : 'bg-amber-600'
            }`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5 text-white" />}
            </div>
            
            <div className={`rounded-2xl p-4 max-w-[85%] text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-slate-800 text-slate-100 rounded-tr-none border border-slate-700' 
                : 'bg-amber-900/20 text-slate-100 rounded-tl-none border border-amber-500/20'
            }`}>
              <div className="whitespace-pre-wrap font-light">{msg.text}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0">
               <Loader2 className="w-4 h-4 animate-spin text-white" />
            </div>
            <div className="bg-amber-900/10 p-3 rounded-2xl rounded-tl-none border border-amber-500/10">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-amber-500/50 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-amber-500/50 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-amber-500/50 rounded-full animate-bounce delay-300"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-slate-900/50 border-t border-slate-800 backdrop-blur-sm">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua dúvida católica..."
            className="w-full bg-slate-800/50 text-slate-100 placeholder-slate-500 rounded-full py-3 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-amber-500/50 border border-slate-700 hover:border-slate-600 transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-amber-500 text-slate-900 rounded-full hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};