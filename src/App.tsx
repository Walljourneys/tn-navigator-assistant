import { useState, useRef, useEffect } from 'react';
import { startQnaSession, sendMessage } from './services/geminiService';

export default function App() {
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Nyimpen memori chat dari Google AI
  const chatSession = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inisialisasi Capt. Navigator pas web dibuka
  useEffect(() => {
    chatSession.current = startQnaSession();
    setMessages([{ 
      role: 'model', 
      text: 'Halo bro! Gue Capt. Navigator. Ada yang mau di-spill soal edukasi trading atau cara baca dashboard TN System hari ini?' 
    }]);
  }, []);

  // Auto-scroll ke bawah kalau ada pesan baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession.current) return;

    const userMsg = input.trim();
    // Munculin chat user di layar
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      // Panggil fungsi sendMessage dari file service lu
      const responseText = await sendMessage(chatSession.current, userMsg);
      // Munculin balasan AI di layar
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Waduh bro, radar gue lagi gangguan dikit nih. Coba tanya lagi ya!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', color: '#1a1a1a' }}>💬 Ask Capt. Navigator</h2>
      
      <div style={{ height: '500px', overflowY: 'auto', border: '1px solid #ccc', padding: '15px', borderRadius: '8px', backgroundColor: '#f4f7f6' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: '15px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
            <span style={{ 
              display: 'inline-block', 
              padding: '12px 18px', 
              borderRadius: '15px', 
              backgroundColor: msg.role === 'user' ? '#0d6efd' : '#ffffff',
              color: msg.role === 'user' ? '#ffffff' : '#333333',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              maxWidth: '85%',
              lineHeight: '1.5'
            }}>
              {msg.text}
            </span>
          </div>
        ))}
        {loading && <div style={{ textAlign: 'left', color: '#666' }}><i>Capt. Navigator lagi ngetik...</i></div>}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', marginTop: '15px' }}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Tanya seputar saham atau TN System..."
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
        />
        <button 
          onClick={handleSend} 
          disabled={loading}
          style={{ padding: '12px 24px', marginLeft: '10px', cursor: 'pointer', backgroundColor: '#198754', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}
        >
          Kirim
        </button>
      </div>
    </div>
  );
}