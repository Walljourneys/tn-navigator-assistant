import { useState, useRef, useEffect } from 'react';
import { startQnaSession, sendMessage } from './services/geminiService';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
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
      text: 'Halo bro! Gue **Capt. Navigator**. Ada yang mau di-spill soal edukasi trading hari ini? 🚢⚓️' 
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
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-[#c5a059] p-2 rounded-xl">
            <Ship size={24} className="text-black" />
          </div>
          <h1 className="text-xl font-bold text-[#c5a059]">CAPT. NAVIGATOR</h1>
        </div>
        <Anchor size={20} className="text-gray-500" />
      </div>

      {/* Chat */}
      <div className="w-full max-w-2xl flex-1 overflow-y-auto space-y-4 px-2 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 220px)' }}>
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-[#c5a059]'}`}>
                  {msg.role === 'user' ? <User size={18} /> : <Ship size={18} className="text-black" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed backdrop-blur-sm border ${msg.role === 'user' ? 'bg-blue-600/20 border-blue-500/30' : 'bg-white/5 border-white/10'}`}>
                  <Markdown className="prose prose-invert prose-yellow max-w-none">{msg.text}</Markdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="w-full max-w-2xl mt-4 pb-4">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-[#c5a059]/50 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tanya seputar saham..."
            className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm"
          />
          <button onClick={handleSend} disabled={loading} className="bg-[#c5a059] p-2.5 rounded-xl text-black font-bold">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}