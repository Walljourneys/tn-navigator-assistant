import { useState, useRef, useEffect } from 'react';
import { startQnaSession, sendMessage } from './services/geminiService';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Ship, Anchor, User, Copy, Check, Download } from 'lucide-react';

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

  const handleDownloadChat = () => {
    const chatText = messages.map(msg => {
      const sender = msg.role === 'user' ? 'Member' : 'Capt. Navigator';
      return `[${sender}]:\n${msg.text}\n`;
    }).join('\n========================================\n\n');

    const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `Laporan-Navigasi-${dateStr}.txt`;
    
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
      setMessages(prev => [...prev, { role: 'model', text: 'Waduh bro, radar lagi gangguan. Coba ulangi lagi pertanyaanya ya!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Penambahan Radial Gradient di Background biar lebih elegan
    <div className="min-h-screen bg-[#070707] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900/40 via-[#070707] to-[#070707] text-gray-100 flex flex-col items-center p-4 font-sans relative overflow-hidden">
      
      {/* HEADER */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg z-10">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-[#d4b373] to-[#c5a059] p-2.5 rounded-xl shadow-[0_0_15px_rgba(197,160,89,0.3)]">
            <Ship size={24} className="text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#c5a059] tracking-wide">CAPT. NAVIGATOR</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-[10px] text-gray-400 font-mono tracking-widest">SYSTEM ONLINE • IDX ULTIMATE V5.7</p>
            </div>
          </div>
        </div>
        
        {/* TOMBOL DOWNLOAD */}
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDownloadChat} 
            title="Save as .txt"
            className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-[#c5a059] hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
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
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-[#d4b373] to-[#c5a059]'}`}>
                  {msg.role === 'user' ? <User size={18} className="text-white" /> : <Ship size={18} className="text-black" />}
                </div>

                {/* BUBBLE */}
                <div className={`relative flex flex-col p-4 rounded-2xl text-sm leading-relaxed border backdrop-blur-md shadow-xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-600/10 border-blue-500/20 text-blue-50' 
                    : 'bg-white/5 border-white/10 text-gray-200'
                }`}>
                  <div className="prose prose-invert prose-yellow max-w-none">
                    <Markdown 
                      components={{
                        a: ({node, ...props}) => (
                          <a {...props} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5" />
                        )
                      }}
                    >
                      {msg.text}
                    </Markdown>
                  </div>

                  {/* TOMBOL COPY */}
                  <div className="flex justify-end mt-3 pt-2 border-t border-white/5">
                    <button 
                      onClick={() => handleCopy(msg.text, idx)}
                      className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 hover:text-[#c5a059] transition-colors"
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-[#c5a059] text-xs ml-12 bg-white/5 w-max px-4 py-2 rounded-full border border-white/5">
            <Ship size={14} className="animate-bounce" /> <span>Capt lagi ngeracik data navigasi... 🧭</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="w-full max-w-2xl mt-4 z-10">
        <div className="flex items-end gap-2 bg-[#121212]/80 border border-white/10 rounded-2xl p-2.5 focus-within:border-[#c5a059]/50 focus-within:shadow-[0_0_20px_rgba(197,160,89,0.1)] transition-all backdrop-blur-xl">
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
            placeholder="Ketik pertanyaan seputar saham, bedah emiten, atau edukasi market..."
            className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm resize-none custom-scrollbar text-gray-100 placeholder-gray-600"
          />
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend} 
            disabled={loading || !input.trim()} 
            className="bg-gradient-to-br from-[#c5a059] to-[#b08b45] hover:from-[#d4b373] hover:to-[#c5a059] disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 p-3 rounded-xl text-black shadow-lg transition-all"
          >
            <Send size={18} className={loading ? "opacity-50" : "opacity-100"} />
          </motion.button>
        </div>
        <div className="text-center mt-3">
          <span className="text-[10px] text-gray-600 font-medium">Tekan <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-gray-400">Enter</kbd> untuk kirim, <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-gray-400">Shift + Enter</kbd> untuk baris baru.</span>
        </div>
      </div>

      <style>{`
        /* SCROLLBAR STYLING */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(197, 160, 89, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(197, 160, 89, 0.6); }
        
        /* MARKDOWN TYPOGRAPHY STYLING */
        .prose p { margin-bottom: 0.8rem !important; margin-top: 0.8rem !important; line-height: 1.6; }
        .prose p:first-child { margin-top: 0 !important; }
        .prose p:last-child { margin-bottom: 0 !important; }
        
        /* List Styling (Bullets & Numbers) */
        .prose ul { list-style-type: disc; padding-left: 1.25rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
        .prose ol { list-style-type: decimal; padding-left: 1.25rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
        .prose li { margin-bottom: 0.3rem; padding-left: 0.2rem; }
        .prose li::marker { color: #c5a059; }
        
        /* Bold & Headings */
        .prose strong { color: #d4b373; font-weight: 700; }
        .prose h1, .prose h2, .prose h3 { color: #c5a059; margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: 700; }
        
        /* Blockquote Styling */
        .prose blockquote { 
          border-left: 3px solid #c5a059; 
          padding-left: 1rem; 
          color: #9ca3af; 
          font-style: italic; 
          background: rgba(197, 160, 89, 0.05);
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          border-radius: 0 8px 8px 0;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }
        
        /* Link Styling */
        .prose a { 
          color: #c5a059 !important; 
          text-decoration: underline !important; 
          text-decoration-color: rgba(197, 160, 89, 0.4) !important;
          text-underline-offset: 3px;
          font-weight: 600; 
          transition: all 0.2s;
        }
        .prose a:hover { 
          color: #d4b373 !important; 
          text-decoration-color: #d4b373 !important;
        }
      `}</style>
    </div>
  );
}