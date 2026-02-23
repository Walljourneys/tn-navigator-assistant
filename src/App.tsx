import { useState, useRef, useEffect } from 'react';
import { startQnaSession, sendMessage } from './services/geminiService';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion';
import { Send, Ship, Anchor, User } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<{ role: string, text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatSession = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatSession.current = startQnaSession();
    setMessages([{ 
      role: 'model', 
      text: 'Halo bro! Gue **Capt. Navigator**. Ada yang mau di-spill soal edukasi trading atau cara baca dashboard **TN System** hari ini? 🚢⚓️' 
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession.current) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await sendMessage(chatSession.current, userMsg);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Waduh bro, radar gue lagi gangguan. Coba tanya lagi ya!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-gray-100 flex flex-col items-center p-4">
      {/* Header Glassmorphism */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-[#c5a059] p-2 rounded-xl shadow-[0_0_15px_rgba(197,160,89,0.4)]">
            <Ship size={24} className="text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-[#c5a059]">CAPT. NAVIGATOR</h1>
            <p className="text-[10px] text-gray-400 font-mono tracking-[0.2em]">TN SYSTEM AI ASSISTANT V5.7</p>
          </div>
        </div>
        <Anchor size={20} className="text-[#c5a059]/50 animate-pulse" />
      </div>

      {/* Chat Container */}
      <div className="w-full max-w-2xl flex-1 overflow-y-auto space-y-4 px-2 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 220px)' }}>
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-blue-600' : 'bg-[#c5a059]'}`}>
                  {msg.role === 'user' ? <User size={18} /> : <Ship size={18} className="text-black" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed backdrop-blur-sm shadow-xl border ${
                  msg.role === 'user' 
                  ? 'bg-blue-600/20 border-blue-500/30 text-blue-100 rounded-tr-none' 
                  : 'bg-white/5 border-white/10 text-gray-200 rounded-tl-none'
                }`}>
                  <Markdown className="prose prose-invert prose-yellow max-w-none font-sans prose-p:leading-relaxed">
                    {msg.text}
                  </Markdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 flex gap-2 items-center">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-[#c5a059] rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-[#c5a059] rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-[#c5a059] rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-[10px] text-gray-400 font-mono">NAVIGATING...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area Glass */}
      <div className="w-full max-w-2xl mt-4 pb-4">
        <div className="relative flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:border-[#c5a059]/50 transition-all duration-300">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tanya seputar saham atau TN System..."
            className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm placeholder:text-gray-600"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-[#c5a059] hover:bg-[#d4b373] disabled:bg-gray-800 p-2.5 rounded-xl transition-all duration-300 shadow-[0_0_10px_rgba(197,160,89,0.2)] active:scale-95"
          >
            <Send size={20} className="text-black" />
          </button>
        </div>
        <p className="text-[9px] text-center mt-3 text-gray-700 tracking-[0.3em] uppercase">
          Proprietary Intelligence ©2026 TN SYSTEM
        </p>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(197, 160, 89, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(197, 160, 89, 0.4); }
      `}</style>
    </div>
  );
}