import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, History, Trash2, Moon, Sun, Star } from 'lucide-react';
import CarvedCard from '../ui/CarvedCard';
import OrnateCorner from '../ui/OrnateCorner';
import { cn } from '../../utils/cn';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface JyotishPragyaAIProps {
  profile?: any;
  navigate?: (view: string) => void;
  showToast?: (msg: string) => void;
}

const JyotishPragyaAI: React.FC<JyotishPragyaAIProps> = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'नमस्ते! मैं आपका ज्योतिष प्रज्ञा AI परामर्शदाता हूँ। आपके जन्म विवरण (मिथुन लग्न, मंगल की महादशा) के आधार पर मैं आपके भविष्य और समाधानों में सहायता कर सकता हूँ। आप क्या जानना चाहते हैं?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Mock AI response for now (since we need to connect to backend/Gemini)
    setTimeout(() => {
      const aiMessage: Message = {
        role: 'assistant',
        content: `आपके प्रश्न का विश्लेषण करते हुए, गोचर में बृहस्पति का संचार आपके नवम भाव में अनुकूल फल दे रहा है। सात्विक आहार और 'ॐ नमो भगवते वासुदेवाय' का जाप आपके लिए श्रेयस्कर रहेगा।`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Context Badge */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <ContextBadge icon={<Sun size={12} />} label="Lagna: Mithuna" />
        <ContextBadge icon={<Moon size={12} />} label="Rashi: Kumbha" />
        <ContextBadge icon={<Star size={12} />} label="Dasha: Mangal" />
        <ContextBadge icon={<Sparkles size={12} />} label="Vedic Context Active" color="gold" />
      </div>

      <CarvedCard className="flex-1 flex flex-col p-0 overflow-hidden relative border-[#D4AF37]/40">
        <OrnateCorner position="top-left" size={30} />
        <OrnateCorner position="top-right" size={30} />
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-[#D4AF37]/20 flex justify-between items-center bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center border border-[#D4AF37]/30">
              <Sparkles className="text-[#D4AF37]" size={20} />
            </div>
            <div>
              <h2 className="text-[#D4AF37] font-serif font-bold text-lg">ज्योतिष प्रज्ञा AI</h2>
              <p className="text-[10px] text-green-500 flex items-center gap-1 uppercase font-bold tracking-widest">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Personalized Advisor
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-gray-500 hover:text-white transition-colors">
              <History size={18} />
            </button>
            <button onClick={() => setMessages([])} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-[#D4AF37]/20">
          {messages.map((m, i) => (
            <div key={i} className={cn(
              "flex gap-4 max-w-[85%]",
              m.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border mt-1",
                m.role === 'user' ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]"
              )}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={cn(
                "space-y-1",
                m.role === 'user' ? "text-right" : "text-left"
              )}>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  m.role === 'user' 
                    ? "bg-blue-600/10 border border-blue-500/20 text-blue-100 rounded-tr-none" 
                    : "bg-[#1A1A1A] border border-[#D4AF37]/10 text-gray-200 rounded-tl-none shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
                )}>
                  {m.content}
                </div>
                <p className="text-[9px] text-gray-600 font-medium px-1">{m.timestamp}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
                <Sparkles size={16} className="text-[#D4AF37] animate-spin" />
              </div>
              <div className="bg-[#1A1A1A] p-4 rounded-2xl rounded-tl-none border border-[#D4AF37]/10">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#141414] border-t border-[#D4AF37]/20">
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="जन्म कुंडली या जीवन के समाधान के बारे में पूछें..."
              className="flex-1 bg-[#0A0A0A] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-xl flex items-center justify-center text-[#1A1A1A] shadow-[0_4px_15px_rgba(212,175,55,0.3)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-[10px] text-gray-600 text-center mt-3">
            ज्योतिष प्रज्ञा AI मार्गदर्शन के लिए है। मुख्य निर्णयों के लिए गुरु या विशेषज्ञ से परामर्श लें।
          </p>
        </div>
      </CarvedCard>
    </div>
  );
};

const ContextBadge: React.FC<{ icon: React.ReactNode; label: string; color?: 'gold' | 'default' }> = ({ icon, label, color = 'default' }) => (
  <div className={cn(
    "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold whitespace-nowrap transition-all uppercase tracking-wider",
    color === 'gold' 
      ? "bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]" 
      : "bg-[#1A1A1A] border-white/10 text-gray-400"
  )}>
    {icon}
    {label}
  </div>
);

export default JyotishPragyaAI;
