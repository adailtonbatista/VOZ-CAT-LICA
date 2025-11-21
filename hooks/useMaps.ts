import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

export interface MapPlace {
  title: string;
  uri: string;
}

export function useMaps() {
  const [places, setPlaces] = useState<MapPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findChurches = async () => {
    if (!process.env.API_KEY) {
        setError("Chave de API não configurada.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setPlaces([]);

    try {
      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Encontre igrejas católicas próximas a mim e liste-as.",
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            googleSearchRetrieval: {
                dynamicRetrievalConfig: {
                    mode: "MODE_UNSPECIFIED",
                    dynamicThreshold: 0.7
                }
            },
            // Note: While @google/genai types might vary, passing retrievalConfig for maps grounding is standard pattern.
            // If strict types fail, we rely on the model understanding the prompt + location context if implicitly handled 
            // or we pass it via prompt if toolConfig fails.
            // However, correct pattern for Maps Grounding involves providing location context if possible.
             retrievalConfig: {
                latLng: {
                  latitude,
                  longitude
                }
              }
          } as any // Type casting to avoid strict type issues if local definitions lag behind
        },
      });

      // Extract chunks
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const foundPlaces: MapPlace[] = [];

      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web?.uri && chunk.web?.title) {
             // Sometimes maps results come as web chunks in generic search, 
             // but specifically for googleMaps tool, check structure.
             foundPlaces.push({ title: chunk.web.title, uri: chunk.web.uri });
          }
          // Check for specific map structure if available in future API versions
          // Current standard returns web-like grounding chunks for places.
        });
      } 
      
      // Fallback if chunks are empty but text contains info (shouldn't happen with strict grounding rules, but safety net)
      if (foundPlaces.length === 0) {
         // Retry parsing logic or just show text? 
         // Requirement: "MUST ALWAYS extract the URLs from groundingChunks".
         // If no chunks, maybe no results found.
      }

      setPlaces(foundPlaces);
      
      if (foundPlaces.length === 0) {
        setError("Nenhuma igreja encontrada nas proximidades ou erro ao obter dados do mapa.");
      }

    } catch (err: any) {
      console.error("Maps error:", err);
      if (err.code === 1) { // Permission denied
        setError("Permissão de localização negada. Por favor, habilite o GPS.");
      } else {
        setError("Não foi possível buscar igrejas no momento.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { places, isLoading, error, findChurches };
}