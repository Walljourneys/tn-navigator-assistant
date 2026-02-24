import { useState, useRef, useEffect } from 'react';
import { startQnaSession, sendMessage } from './services/geminiService'; // Sesuaikan import
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Ship, Anchor, User, Copy, Check } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<{ role: string, text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatSession = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatSession.current = startQnaSession();
    setMessages([{ role: 'model', text: 'Halo bro! Gue **Capt. Navigator**. Mau navigasi market apa hari ini? 🚢⚓️' }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession.current || loading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      // Panggil sendMessage biasa
      const response = await sendMessage(chatSession.current, userMsg);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Error radar, Bro! Coba lagi.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-gray-100 flex flex-col items-center p-4">
      {/* HEADER */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <Ship size={24} className="text-[#c5a059]" />
          <h1 className="text-xl font-bold text-[#c5a059]">CAPT. NAVIGATOR</h1>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="w-full max-w-2xl flex-1 overflow-y-auto space-y-4 px-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             <div className={`p-4 rounded-2xl text-sm max-w-[85%] ${msg.role === 'user' ? 'bg-blue-600/20' : 'bg-white/5 border border-white/10'}`}>
               <Markdown>{msg.text}</Markdown>
             </div>
          </div>
        ))}
        {loading && <div className="text-[#c5a059] text-xs animate-pulse">Capt lagi mikir... 🧭</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="w-full max-w-2xl mt-4">
        <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Tanya saham..."
            className="flex-1 bg-transparent border-none outline-none p-2 text-sm resize-none"
          />
          <button onClick={handleSend} disabled={loading || !input.trim()} className="bg-[#c5a059] p-2 rounded-xl text-black">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}