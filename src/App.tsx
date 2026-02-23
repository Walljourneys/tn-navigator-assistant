import { useState, useRef, useEffect } from 'react';
import { startQnaSession, sendMessage } from './services/geminiService';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
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
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col items-center p-4">
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6 p-4 border-b border-yellow-600/30">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-600 p-2 rounded-full">
            <Ship size={24} className="text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">CAPT. NAVIGATOR</h1>
            <p className="text-xs text-yellow-500 font-mono">TN SYSTEM AI ASSISTANT V5.7</p>
          </div>
        </div>
        <Anchor size={20} className="text-gray-500" />
      </div>

      {/* Chat Container */}
      <div className="w-full max-w-2xl flex-1 overflow-y-auto space-y-4 px-2 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-yellow-600'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Ship size={16} className="text-black" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                  msg.role === 'user' 
                  ? 'bg-blue-700 text-white rounded-tr-none' 
                  : 'bg-[#1a1a1a] border border-gray-800 text-gray-200 rounded-tl-none'
                }`}>
                  <Markdown className="prose prose-invert prose-yellow max-w-none font-sans">
                    {msg.text}
                  </Markdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a1a] p-4 rounded-2xl animate-pulse text-gray-500 text-xs">
              Capt. Navigator sedang menganalisa arus bursa...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="w-full max-w-2xl mt-4 pb-4">
        <div className="relative flex items-center gap-2 bg-[#1a1a1a] border border-gray-800 rounded-xl p-2 focus-within:border-yellow-600 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tanya seputar saham atau TN System..."
            className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 p-2 rounded-lg transition-colors"
          >
            <Send size={20} className="text-black" />
          </button>
        </div>
        <p className="text-[10px] text-center mt-2 text-gray-600 italic">
          Education only. Not a financial advice. ©2026 TN SYSTEM
        </p>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
      `}</style>
    </div>
  );
}