import { useState } from 'react';
import { Send, Search } from 'lucide-react';

const Chat = () => {
  const [msg, setMsg] = useState('');
  return (
    <div className="min-h-screen pt-20 px-4 max-w-6xl mx-auto pb-4">
      <div className="glass-card flex h-[80vh] overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-vynk-charcoal/10 bg-white/30 flex flex-col">
          <div className="p-4 border-b border-vynk-charcoal/10">
            <h2 className="font-bold text-xl mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-vynk-charcoal/40" size={18} />
              <input type="text" placeholder="Search..." className="glass-input pl-10 py-2 text-sm" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="p-3 bg-white/50 rounded-xl cursor-pointer flex gap-3 items-center">
              <div className="w-10 h-10 rounded-full bg-vynk-mint relative">
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-bold text-sm">Alex Developer</h4>
                <p className="text-xs text-vynk-charcoal/60 truncate">Hey, are we still on for the collab?</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white/10">
          <div className="p-4 border-b border-vynk-charcoal/10 bg-white/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-vynk-mint"></div>
            <div>
              <h3 className="font-bold">Alex Developer</h3>
              <p className="text-xs text-green-600 font-medium">Online</p>
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
            <div className="self-start bg-white/60 p-3 rounded-2xl rounded-tl-sm max-w-[70%]">
              <p className="text-sm">Hey, are we still on for the collab?</p>
            </div>
            <div className="self-end bg-linear-to-r from-vynk-coral to-vynk-peach text-white p-3 rounded-2xl rounded-tr-sm max-w-[70%]">
              <p className="text-sm">Yes! Let's sync up tonight.</p>
            </div>
          </div>

          <div className="p-4 border-t border-vynk-charcoal/10 bg-white/20 flex gap-2">
            <input type="text" placeholder="Type a message..." className="flex-1 glass-input py-2" value={msg} onChange={e => setMsg(e.target.value)} />
            <button className="btn-primary p-3 rounded-xl"><Send size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
