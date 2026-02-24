import { useState, useRef, useEffect } from 'react';
import { startQnaSession, sendMessage } from './services/geminiService';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Ship, Anchor, User, Copy, Check } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<{ role: string, text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const chatSession = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatSession.current = startQnaSession();
    setMessages([{ 
      role: 'model', 
      text: 'Halo bro! Gue **Capt. Navigator**. Mau navigasi market apa hari ini? 🚢⚓️' 
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSend = async () => {
    if (!input.trim() || !chatSession.current || loading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const response = await sendMessage(chatSession.current, userMsg);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Error radar, Bro! Coba lagi.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-gray-100 flex flex-col items-center p-4 font-sans">
      
      {/* HEADER */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-[#c5a059] p-2 rounded-xl">
            <Ship size={24} className="text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#c5a059]">CAPT. NAVIGATOR</h1>
            <p className="text-[10px] text-gray-500 font-mono tracking-widest">TN SYSTEM V5.7</p>
          </div>
        </div>
        <Anchor size={20} className="text-[#c5a059]/30" />
      </div>

      {/* CHAT AREA */}
      <div className="w-full max-w-2xl flex-1 overflow-y-auto space-y-6 px-2 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 250px)' }}>
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* AVATAR */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-[#c5a059]'}`}>
                  {msg.role === 'user' ? <User size={18} className="text-white" /> : <Ship size={18} className="text-black" />}
                </div>

                {/* BUBBLE */}
                <div className={`relative group p-4 rounded-2xl text-sm leading-relaxed border backdrop-blur-sm ${
                  msg.role === 'user' ? 'bg-blue-600/20 border-blue-500/30' : 'bg-white/5 border-white/10'
                }`}>
                  {/* FIX: Hapus whitespace-pre-wrap karena bentrok dengan Markdown */}
                  <div className="prose prose-invert prose-yellow max-w-none">
                    <Markdown>{msg.text}</Markdown>
                  </div>

                  {msg.role === 'model' && (
                    <button 
                      onClick={() => handleCopy(msg.text, idx)}
                      className="absolute -top-2 -right-2 p-1.5 bg-black border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-xl"
                    >
                      {copiedIndex === idx ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-500 hover:text-[#c5a059]" />}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <div className="flex items-center gap-2 text-[#c5a059] text-xs animate-pulse ml-12">
            <Ship size={14} className="animate-bounce" /> Capt lagi ngeracik data... 🧭
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="w-full max-w-2xl mt-4 pb-4">
        <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-[#c5a059]/50 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onInput={() => {
              if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
              }
            }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Tanya seputar saham atau edukasi..."
            className="flex-1 bg-transparent border-none outline-none px-2 py-2 text-sm resize-none custom-scrollbar"
          />
          <button 
            onClick={handleSend} 
            disabled={loading || !input.trim()} 
            className="bg-[#c5a059] hover:bg-[#d4b373] disabled:bg-gray-800 p-2.5 rounded-xl text-black transition-all active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(197, 160, 89, 0.2); border-radius: 10px; }
        /* Perbaikan spasi antar paragraf di Markdown */
        .prose p { margin-bottom: 0.75rem !important; margin-top: 0.75rem !important; }
        .prose p:first-child { margin-top: 0 !important; }
        .prose p:last-child { margin-bottom: 0 !important; }
      `}</style>
    </div>
  );
}