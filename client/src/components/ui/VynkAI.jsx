import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, X, Send, Maximize2, Minimize2, Code, GraduationCap, Briefcase } from 'lucide-react';

const VynkAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm Vynk AI. I can help you debug code, find study notes, or prep for interviews. What's on your mind?", isAi: true }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    setMessages(prev => [...prev, { id: Date.now(), text: inputText, isAi: false }]);
    setInputText('');
    
    // Mock AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "I can certainly help with that! Let me search the ecosystem for the best resources...", 
        isAi: true 
      }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-linear-to-tr from-vynk-primary to-vynk-accent shadow-2xl flex items-center justify-center text-white z-90 border-2 border-white/20"
      >
        <Sparkles size={24} className="animate-pulse" />
      </motion.button>

      {/* AI Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed z-100 bottom-6 right-6 ${isExpanded ? 'w-[80vw] h-[80vh] md:w-[60vw] md:h-[70vh]' : 'w-80 sm:w-96 h-125'} bg-vynk-bg-1/90 backdrop-blur-2xl border border-vynk-border shadow-2xl shadow-vynk-primary/20 rounded-2xl flex flex-col overflow-hidden transition-all duration-300`}
          >
            {/* Header */}
            <div className="p-4 border-b border-vynk-border flex items-center justify-between bg-linear-to-r from-vynk-primary/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-vynk-primary to-vynk-accent flex items-center justify-center text-white">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-vynk-text text-sm">Vynk Assistant</h3>
                  <p className="text-[10px] font-bold text-vynk-primary tracking-wider uppercase">Beta</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-vynk-muted hover:text-vynk-text p-1">
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="text-vynk-muted hover:text-vynk-text p-1">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-hide">
              {messages.map(msg => (
                <div key={msg.id} className={`max-w-[85%] ${msg.isAi ? 'self-start' : 'self-end'}`}>
                  <div className={`p-3 rounded-2xl text-sm ${
                    msg.isAi 
                      ? 'bg-vynk-bg-2 border border-vynk-border text-vynk-text rounded-tl-sm' 
                      : 'bg-linear-to-tr from-vynk-primary to-vynk-accent text-white rounded-tr-sm shadow-md'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {/* Suggestions (only when short chat) */}
              {messages.length === 1 && (
                <div className="grid grid-cols-1 gap-2 mt-4">
                  <button onClick={() => setInputText("Help me debug a React useEffect loop")} className="flex items-center gap-2 p-2 rounded-xl border border-vynk-border bg-white/50 text-xs font-bold text-vynk-text hover:border-vynk-primary transition-colors text-left">
                    <Code size={14} className="text-blue-500" /> Help me debug a React useEffect loop
                  </button>
                  <button onClick={() => setInputText("Find notes for Operating Systems")} className="flex items-center gap-2 p-2 rounded-xl border border-vynk-border bg-white/50 text-xs font-bold text-vynk-text hover:border-vynk-primary transition-colors text-left">
                    <GraduationCap size={14} className="text-vynk-secondary" /> Find notes for Operating Systems
                  </button>
                  <button onClick={() => setInputText("Analyze my resume for Frontend roles")} className="flex items-center gap-2 p-2 rounded-xl border border-vynk-border bg-white/50 text-xs font-bold text-vynk-text hover:border-vynk-primary transition-colors text-left">
                    <Briefcase size={14} className="text-vynk-primary" /> Analyze my resume for Frontend roles
                  </button>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-vynk-border bg-white/50">
              <div className="relative">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Vynk AI..." 
                  className="w-full bg-white border border-vynk-border rounded-full py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:border-vynk-primary shadow-sm"
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-vynk-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-vynk-primary/90 transition-colors"
                >
                  <Send size={14} className="ml-0.5" />
                </button>
              </div>
              <p className="text-center text-[10px] text-vynk-muted mt-2">Vynk AI can make mistakes. Consider verifying important information.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VynkAI;
