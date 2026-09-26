import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Loader2, Send, ShieldCheck } from 'lucide-react';

type Chat = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  other_user?: { name: string; avatar_url: string };
  last_message?: string;
  updated_at: string;
};

export default function Chats() {
  const { session } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'me' | 'them'; text: string; time: string }>>([
    { sender: 'them', text: 'Hey! Is this textbook or gear still available on campus?', time: '2:15 PM' },
    { sender: 'me', text: 'Yes, it is! I have it with me in the library right now.', time: '2:17 PM' },
    { sender: 'them', text: 'Awesome, can we meet near the central canteen entrance in 15 mins?', time: '2:18 PM' }
  ]);

  const mockChats: Chat[] = [
    {
      id: 'mock-1',
      listing_id: 'mock-listing-1',
      buyer_id: 'buyer',
      seller_id: 'seller',
      other_user: { name: 'Aarav Patel', avatar_url: '' },
      last_message: 'Awesome, can we meet near the central canteen entrance in 15 mins?',
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-2',
      listing_id: 'mock-listing-2',
      buyer_id: 'buyer',
      seller_id: 'seller',
      other_user: { name: 'Ananya Sharma', avatar_url: '' },
      last_message: 'Thanks for lending the scientific calculator!',
      updated_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  useEffect(() => {
    if (session?.user.id) fetchChats();
    else {
      setChats(mockChats);
      setLoading(false);
    }
  }, [session]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`*, buyer:profiles!chats_buyer_id_fkey(name), seller:profiles!chats_seller_id_fkey(name)`)
        .or(`buyer_id.eq.${session?.user.id},seller_id.eq.${session?.user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const formattedChats = data.map((chat: any) => ({
          ...chat,
          other_user: chat.buyer_id === session?.user.id ? chat.seller : chat.buyer
        }));
        setChats(formattedChats);
      } else {
        setChats(mockChats);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats(mockChats);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMessages(prev => [
      ...prev,
      { sender: 'me', text: messageText.trim(), time: 'Just now' }
    ]);
    setMessageText('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (selectedChat) {
    return (
      <div className="max-w-3xl mx-auto luxury-surface rounded-3xl p-5 flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
        {/* Chat Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedChat(null)} 
              className="luxury-pill w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white"
              aria-label="Back to chat list"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-white to-zinc-200 text-black flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              {selectedChat.other_user?.name.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-semibold text-white text-sm tracking-tight">{selectedChat.other_user?.name || 'Campus Peer'}</h2>
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
              </div>
              <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active on campus
              </p>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 px-1">
          <div className="flex justify-center my-2">
            <span className="font-mono text-[10px] text-zinc-500 luxury-inset-sm px-2.5 py-0.5 rounded-full">
              Verified Campus Messaging
            </span>
          </div>

          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed tracking-tight ${
                  msg.sender === 'me' 
                    ? 'bg-gradient-to-b from-white to-zinc-100 text-black font-medium rounded-tr-sm shadow-sm' 
                    : 'luxury-surface text-zinc-200 rounded-tl-sm border border-white/[0.08]'
                }`}
              >
                <p>{msg.text}</p>
                <span className={`block font-mono text-[9px] mt-1 tabular-nums ${msg.sender === 'me' ? 'text-zinc-600 text-right' : 'text-zinc-500'}`}>
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="pt-3 border-t border-white/[0.08] flex items-center gap-2">
          <input 
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message to agree on meetup location..." 
            className="flex-1 luxury-inset-sm rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/[0.3] tracking-tight"
          />
          <button 
            type="submit" 
            className="luxury-btn-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Campus Messages</h1>
        <p className="text-xs text-zinc-400 mt-1 tracking-tight">Coordinate direct campus hand-offs and negotiate listings.</p>
      </div>

      <div className="luxury-surface rounded-3xl p-5 space-y-3">
        {chats.map(chat => (
          <button 
            key={chat.id}
            onClick={() => setSelectedChat(chat)}
            className="w-full luxury-surface-interactive p-4 rounded-2xl flex items-center gap-4 text-left group"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-white to-zinc-200 text-black flex items-center justify-center text-sm font-bold shadow-sm">
                {chat.other_user?.name.charAt(0) || 'U'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-black rounded-full" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-sm text-white truncate tracking-tight group-hover:text-zinc-300 transition-colors">
                  {chat.other_user?.name || 'Campus Student'}
                </h3>
                <span className="font-mono text-[10px] text-zinc-500 tabular-nums">
                  {new Date(chat.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate tracking-tight">
                {chat.last_message || 'Start the conversation...'}
              </p>
            </div>
          </button>
        ))}
      </div>

    </div>
  );
}
