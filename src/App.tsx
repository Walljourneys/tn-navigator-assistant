import { useState, useRef, useEffect } from 'react';
import { startQnaSession, sendMessageStream } from './services/geminiService'; // Update import ke Stream
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Ship, Anchor, User, Plus, Copy, Check, X, Image as ImageIcon } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<{ role: string, text: string, image?: string }[]>([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null); // State untuk gambar
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const chatSession = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatSession.current = startQnaSession();
    setMessages([{ 
      role: 'model', 
      text: 'Halo bro! Gue **Capt. Navigator**. Ada yang mau di-spill soal edukasi trading atau cara baca dashboard **TN Navigator IDX Ultimate** hari ini? 🚢⚓️' 
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fungsi Copy ke Clipboard
  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Fungsi Handle Upload Gambar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !image) || !chatSession.current || loading) return;

    const userMsg = input.trim();
    const userImg = image;
    
    // 1. Tambah pesan user ke layar
    setMessages(prev => [...prev, { role: 'user', text: userMsg, image: userImg || undefined }]);
    
    // Reset Input
    setInput('');
    setImage(null);
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // 2. Siapkan wadah kosong untuk jawaban Streaming Capt
    setMessages(prev => [...prev, { role: 'model', text: '' }]);

    try {
      // 3. Panggil fungsi Stream dari service
      await sendMessageStream(chatSession.current, userMsg, userImg, (chunk) => {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsgIndex = newMessages.length - 1;
          newMessages[lastMsgIndex] = { 
            ...newMessages[lastMsgIndex], 
            text: newMessages[lastMsgIndex].text + chunk 
          };
          return newMessages;
        });
        setLoading(false); // Matikan loading saat chunk mulai datang
      });
    } catch (error) {
      setMessages(prev => [...prev.slice(0, -1), { role: 'model', text: 'Waduh bro, radar gue lagi gangguan. Ngopi dulu bentar, coba tanya lagi ya!' }]);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-gray-100 flex flex-col items-center p-4 font-sans">
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-[#c5a059] p-2 rounded-xl shadow-[0_0_15px_rgba(197,160,89,0.3)]">
            <Ship size={24} className="text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-[#c5a059]">CAPT. NAVIGATOR</h1>
            <p className="text-[10px] text-gray-500 font-mono tracking-widest">TN SYSTEM AI V5.7</p>
          </div>
        </div>
        <Anchor size={20} className="text-[#c5a059]/50" />
      </div>

      {/* Chat Container */}
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
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-blue-600' : 'bg-[#c5a059]'}`}>
                  {msg.role === 'user' ? <User size={18} className="text-white" /> : <Ship size={18} className="text-black" />}
                </div>
                
                <div className={`relative group p-4 rounded-2xl text-sm leading-relaxed backdrop-blur-sm border shadow-xl ${
                  msg.role === 'user' 
                  ? 'bg-blue-600/20 border-blue-500/30 text-blue-50 rounded-tr-none' 
                  : 'bg-white/5 border-white/10 text-gray-200 rounded-tl-none'
                }`}>
                  
                  {/* Tampilkan Gambar jika ada */}
                  {msg.image && (
                    <img src={msg.image} alt="Upload" className="max-w-full h-auto rounded-lg mb-3 border border-white/10" />
                  )}

                  <Markdown className="prose prose-invert prose-yellow max-w-none prose-p:leading-relaxed prose-strong:text-[#c5a059] whitespace-pre-wrap">
                    {msg.text}
                  </Markdown>

                  {/* Tombol Copy (Hanya muncul di respon AI) */}
                  {msg.role === 'model' && msg.text.length > 0 && (
                    <button 
                      onClick={() => handleCopy(msg.text, idx)}
                      className="absolute -bottom-8 right-0 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all opacity-0 group-hover:opacity-100"
                      title="Salin Pesan"
                    >
                      {copiedIndex === idx ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-500" />}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 flex gap-3 items-center">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-[#c5a059] rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-[#c5a059] rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-[#c5a059] rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">Analyzing Market Data...</span>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="w-full max-w-2xl mt-4 pb-4">
        {/* Preview Gambar Sebelum Kirim */}
        {image && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative inline-block mb-3 ml-2">
            <img src={image} alt="Preview" className="w-20 h-20 object-cover rounded-xl border-2 border-[#c5a059]" />
            <button 
              onClick={() => setImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 p-1 rounded-full text-white shadow-lg"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}

        <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:border-[#c5a059]/50 transition-all duration-300">
          
          {/* Tombol + (Upload) */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl hover:bg-white/10 text-gray-500 hover:text-[#c5a059] transition-colors"
          >
            <Plus size={22} />
          </button>
          <input 
            type="file" 
            hidden 
            ref={fileInputRef} 
            accept="image/*" 
            onChange={handleFileChange} 
          />

          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onInput={() => {
              if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Tanya seputar saham atau analisa chart..."
            className="flex-1 bg-transparent border-none outline-none px-2 py-2 text-sm placeholder:text-gray-600 resize-none custom-scrollbar"
            style={{ maxHeight: '120px' }}
          />

          <button 
            onClick={handleSend} 
            disabled={loading || (!input.trim() && !image)} 
            className="bg-[#c5a059] hover:bg-[#d4b373] disabled:bg-gray-800 p-2.5 rounded-xl text-black transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(197,160,89,0.2)]"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[9px] text-center mt-3 text-gray-700 tracking-[0.2em] uppercase font-medium">
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