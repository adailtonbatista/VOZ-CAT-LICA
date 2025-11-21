import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createPcmBlob, base64ToUint8Array, decodeAudioData } from '../utils/audio';

export interface UseLiveApiResult {
  isConnected: boolean;
  isConnecting: boolean;
  isSpeaking: boolean; // Model is speaking
  isUserSpeaking: boolean; // Simple VAD approximation or just transmitting
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  volume: number; // For visualization
}

const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-09-2025';
const SYSTEM_INSTRUCTION = `
Você é um assistente católico piedoso e sábio.
Sua missão é responder perguntas sobre a fé católica.
Você DEVE basear suas respostas EXCLUSIVAMENTE nas seguintes fontes:
1. Catecismo da Igreja Católica (texto oficial do Vaticano).
2. Bíblia Sagrada Católica (tradução Ave Maria).
3. Documentos do Magistério da Igreja.
4. Catecismo de São Pio X.

Se uma pergunta fugir deste escopo ou não puder ser respondida por estas fontes, diga educadamente que não sabe ou que a questão está fora do seu domínio doutrinal.
Mantenha um tom sereno, caridoso e pastoral. Seja claro e direto, mas com profundidade teológica quando necessário.
Fale português do Brasil.
`;

export function useLiveApi(): UseLiveApiResult {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  // Refs for audio context and processing
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Analyzer for visualization
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }

    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }

    if (sessionPromiseRef.current) {
      // We can't strictly "cancel" the promise, but we can close the session if we had the object.
      // The library handles close on the session object.
      sessionPromiseRef.current.then(session => {
         try {
            session.close();
         } catch (e) {
            console.warn("Error closing session", e);
         }
      });
      sessionPromiseRef.current = null;
    }

    sourcesRef.current.forEach(source => {
        try { source.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setIsConnected(false);
    setIsSpeaking(false);
    setVolume(0);
  }, []);

  // Initialize Audio Contexts
  const initializeAudio = async () => {
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    inputAudioContextRef.current = inputCtx;
    outputAudioContextRef.current = outputCtx;

    // Setup Analyzer for Output
    const analyzer = outputCtx.createAnalyser();
    analyzer.fftSize = 256;
    analyzerRef.current = analyzer;
    
    return { inputCtx, outputCtx };
  };

  // Connect Function
  const connect = useCallback(async () => {
    if (!process.env.API_KEY) {
        setError("API Key not found in environment variables.");
        return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const { inputCtx, outputCtx } = await initializeAudio();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        callbacks: {
          onopen: () => {
            console.log('Live API Connected');
            setIsConnected(true);
            setIsConnecting(false);

            // Setup Input Stream Processing
            const source = inputCtx.createMediaStreamSource(stream);
            // Using ScriptProcessor as per documentation example for raw PCM access
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (!sessionPromiseRef.current) return; // Guard if disconnected

              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              
              sessionPromiseRef.current.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio) {
              setIsSpeaking(true);
              const ctx = outputAudioContextRef.current;
              if (!ctx) return;

              // Sync start time
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              try {
                  const audioBytes = base64ToUint8Array(base64Audio);
                  const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
                  
                  const source = ctx.createBufferSource();
                  source.buffer = audioBuffer;
                  
                  // Connect to analyzer then destination
                  if (analyzerRef.current) {
                      source.connect(analyzerRef.current);
                      analyzerRef.current.connect(ctx.destination);
                  } else {
                      source.connect(ctx.destination);
                  }

                  source.addEventListener('ended', () => {
                    sourcesRef.current.delete(source);
                    if (sourcesRef.current.size === 0) {
                        setIsSpeaking(false);
                    }
                  });

                  source.start(nextStartTimeRef.current);
                  nextStartTimeRef.current += audioBuffer.duration;
                  sourcesRef.current.add(source);

              } catch (decodeErr) {
                  console.error("Error decoding audio", decodeErr);
              }
            }

            // Handle Interruption
            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
               console.log("Model interrupted");
               sourcesRef.current.forEach(src => {
                   try { src.stop(); } catch(e){}
               });
               sourcesRef.current.clear();
               nextStartTimeRef.current = 0;
               setIsSpeaking(false);
            }
          },
          onclose: () => {
            console.log('Session closed');
            cleanup();
          },
          onerror: (err) => {
            console.error('Session error', err);
            setError("Ocorreu um erro na conexão. Tente novamente.");
            cleanup();
          }
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect");
      setIsConnecting(false);
      cleanup();
    }
  }, [cleanup]);

  // Visualizer Loop
  useEffect(() => {
    const updateVolume = () => {
        if (analyzerRef.current && isSpeaking) {
            const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
            analyzerRef.current.getByteFrequencyData(dataArray);
            
            // Calculate average volume
            let sum = 0;
            for(let i=0; i<dataArray.length; i++) {
                sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            setVolume(average); // 0-255
        } else {
            setVolume(v => Math.max(0, v - 5)); // Decay
        }
        animationFrameRef.current = requestAnimationFrame(updateVolume);
    };
    updateVolume();
    return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isSpeaking]);


  return {
    isConnected,
    isConnecting,
    isSpeaking,
    isUserSpeaking: false, // Can be implemented with another analyzer on input
    error,
    connect,
    disconnect: async () => cleanup(),
    volume
  };
}