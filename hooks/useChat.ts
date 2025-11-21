import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const SYSTEM_INSTRUCTION = `
Você é um assistente católico piedoso e erudito.
Sua missão é responder perguntas sobre a fé católica com profundidade e precisão teológica.
Você DEVE basear suas respostas EXCLUSIVAMENTE nas seguintes fontes:
1. Catecismo da Igreja Católica (texto oficial do Vaticano).
2. Bíblia Sagrada Católica (tradução Ave Maria).
3. Documentos do Magistério da Igreja (Encíclicas, Concílios, etc.).
4. Catecismo de São Pio X.

Se uma pergunta fugir deste escopo, diga educadamente que não sabe.
Mantenha um tom sereno e caridoso.
Fale português do Brasil.
`;

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!process.env.API_KEY) return;

    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { role: 'user', text }]);

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        history: messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }))
      });

      const result = await chat.sendMessageStream({ message: text });
      
      let fullResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of result) {
        const chunkText = chunk.text || '';
        fullResponse += chunkText;
        
        setMessages(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { role: 'model', text: fullResponse };
          return newHistory;
        });
      }

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Desculpe, ocorreu um erro ao consultar os documentos. Tente novamente." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, sendMessage };
}