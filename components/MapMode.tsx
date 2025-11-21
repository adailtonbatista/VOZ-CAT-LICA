import React from 'react';
import { useMaps } from '../hooks/useMaps';
import { MapPin, Navigation, Loader2, ExternalLink } from 'lucide-react';

export const MapMode: React.FC = () => {
  const { places, isLoading, error, findChurches } = useMaps();

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto p-4">
      <div className="text-center mb-6 space-y-2">
        <h2 className="text-2xl font-serif text-amber-100">Encontrar Paróquias</h2>
        <p className="text-slate-400 text-sm">
          Localize igrejas católicas próximas para Missa e Adoração.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <button
          onClick={findChurches}
          disabled={isLoading}
          className="flex items-center gap-3 bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-full shadow-lg shadow-amber-900/20 transition-all disabled:opacity-70 disabled:cursor-wait font-medium"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Navigation className="w-5 h-5" />
          )}
          {isLoading ? 'Buscando...' : 'Buscar Igrejas Próximas'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-300 p-4 rounded-xl text-sm text-center mb-6">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pb-20">
        {places.map((place, index) => (
          <div 
            key={index}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-amber-500/30 transition-colors"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-lg font-serif text-amber-100 mb-1">{place.title}</h3>
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
                  <MapPin className="w-3 h-3" />
                  <span>Local Sugerido</span>
                </div>
              </div>
              {place.uri && (
                <a 
                  href={place.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-800 rounded-full hover:bg-amber-500/20 hover:text-amber-400 text-slate-400 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>
            
            {/* Although the chunk doesn't give us address directly in all cases, we can render what we have or just the link */}
            <p className="text-slate-500 text-sm italic">
              Verifique os horários de missa no Google Maps.
            </p>
          </div>
        ))}

        {!isLoading && places.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-600 opacity-50">
            <MapPin className="w-16 h-16 mb-4" />
            <p>Nenhuma igreja listada ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
};