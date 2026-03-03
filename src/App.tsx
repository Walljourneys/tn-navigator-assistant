import { useState, useRef, useEffect } from 'react';
import { startQnaSession, sendMessage } from './services/geminiService';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Globe, Target, User, Copy, Check, Download } from 'lucide-react';

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
      text: 'Halo Trader! Gue **Panglima Quant**. Mau bedah likuiditas market apa hari ini? 🌍📊' 
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

  const handleDownloadChat = () => {
    const chatText = messages.map(msg => {
      const sender = msg.role === 'user' ? 'Trader' : 'Panglima Quant';
      return `[${sender}]:\n${msg.text}\n`;
    }).join('\n========================================\n\n');

    const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `Intelijen-Global-${dateStr}.txt`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      setMessages(prev => [...prev, { role: 'model', text: 'Koneksi ke Pusat Komando terputus sementara. Coba ulangi instruksinya, Bro!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050b14] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-[#050b14] to-[#050b14] text-gray-100 flex flex-col items-center p-4 font-sans relative overflow-hidden">
      
      {/* HEADER */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg z-10">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2.5 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.3)]">
            <Globe size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-orange-400 tracking-wide">PANGLIMA QUANT</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <p className="text-[10px] text-gray-400 font-mono tracking-widest">COMMAND CENTER • GLOBAL V1.1</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDownloadChat} 
            title="Save Intelijen (.txt)"
            className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-orange-400 hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
          >
            <Download size={18} />
          </motion.button>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="w-full max-w-2xl flex-1 overflow-y-auto space-y-6 px-2 pb-4 custom-scrollbar z-10" style={{ maxHeight: 'calc(100vh - 250px)' }}>
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[92%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* AVATAR */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-gradient-to-br from-gray-600 to-gray-800' : 'bg-gradient-to-br from-orange-500 to-red-600'}`}>
                  {msg.role === 'user' ? <User size={18} className="text-white" /> : <Target size={18} className="text-white" />}
                </div>

                {/* BUBBLE */}
                <div className={`relative flex flex-col p-4 rounded-2xl text-sm leading-relaxed border backdrop-blur-md shadow-xl ${
                  msg.role === 'user' 
                    ? 'bg-gray-800/80 border-gray-600/50 text-gray-100' 
                    : 'bg-white/5 border-white/10 text-gray-200'
                }`}>
                  <div className="prose prose-invert max-w-none">
                    <Markdown 
                      components={{
                        a: ({node, ...props}) => (
                          <a {...props} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-orange-400 hover:text-orange-300" />
                        )
                      }}
                    >
                      {msg.text}
                    </Markdown>
                  </div>

                  <div className="flex justify-end mt-3 pt-2 border-t border-white/5">
                    <button 
                      onClick={() => handleCopy(msg.text, idx)}
                      className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 hover:text-orange-400 transition-colors"
                    >
                      {copiedIndex === idx ? (
                        <><Check size={12} className="text-green-500" /> <span className="text-green-500">Tersalin</span></>
                      ) : (
                        <><Copy size={12} /> Salin Teks</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-orange-400 text-xs ml-12 bg-white/5 w-max px-4 py-2 rounded-full border border-white/5">
            <Target size={14} className="animate-pulse" /> <span>Panglima sedang menyusun taktik... 📊</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="w-full max-w-2xl mt-4 z-10">
        <div className="flex items-end gap-2 bg-[#0a111a]/80 border border-white/10 rounded-2xl p-2.5 focus-within:border-orange-500/50 focus-within:shadow-[0_0_20px_rgba(249,115,22,0.1)] transition-all backdrop-blur-xl">
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
            placeholder="Ketik pertanyaan Forex, Crypto, atau taktik market..."
            className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm resize-none custom-scrollbar text-gray-100 placeholder-gray-600"
          />
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend} 
            disabled={loading || !input.trim()} 
            className="bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 p-3 rounded-xl text-white shadow-lg transition-all"
          >
            <Send size={18} className={loading ? "opacity-50" : "opacity-100"} />
          </motion.button>
        </div>
      </div>

      <style>{`
        /* SCROLLBAR STYLING */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(249, 115, 22, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(249, 115, 22, 0.6); }
        
        /* MARKDOWN TYPOGRAPHY STYLING */
        .prose p { margin-bottom: 0.8rem !important; margin-top: 0.8rem !important; line-height: 1.6; }
        .prose ul { list-style-type: disc; padding-left: 1.25rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
        .prose ol { list-style-type: decimal; padding-left: 1.25rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
        .prose li { margin-bottom: 0.3rem; padding-left: 0.2rem; }
        .prose li::marker { color: #f97316; }
        .prose strong { color: #fdba74; font-weight: 700; }
        .prose h1, .prose h2, .prose h3 { color: #f97316; margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: 700; }
        .prose blockquote { 
          border-left: 3px solid #f97316; 
          padding-left: 1rem; color: #9ca3af; font-style: italic; 
          background: rgba(249, 115, 22, 0.05); padding-top: 0.5rem; padding-bottom: 0.5rem;
          border-radius: 0 8px 8px 0; margin-top: 1rem; margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}