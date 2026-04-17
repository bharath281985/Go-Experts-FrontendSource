import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { MessageSquare, Send, Loader2, User } from "lucide-react";
import api from "@/app/utils/api";
import { useTheme } from "@/app/components/ThemeProvider";

interface Message {
  _id: string;
  sender: string | { _id: string; full_name: string; profile_image: string };
  receiver: string;
  content: string;
  createdAt: string;
}

interface ChatWindowProps {
  otherUser: { _id: string; full_name: string; profile_image: string };
  onClose: () => void;
}

export default function ChatWindow({ otherUser, onClose }: ChatWindowProps) {
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchHistory();
    initSocket();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [otherUser._id]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initSocket = () => {
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    socketRef.current = io(socketUrl);

    socketRef.current.on('connect', () => {
      socketRef.current?.emit('register', currentUser._id);
    });

    socketRef.current.on('newMessage', (msg: Message) => {
      // Check if message is from the user we are chatting with
      const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender._id;
      if (senderId === otherUser._id || senderId === currentUser._id) {
        setMessages(prev => [...prev, msg]);
      }
    });
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/messages/${otherUser._id}`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await api.post('/messages', {
        receiverId: otherUser._id,
        content: newMessage
      });

      if (res.data.success) {
        setNewMessage("");
        // Socket will handle adding the message to the list via 'newMessage' event
      }
    } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to send message");
    }
  };

  return (
    <div className={`flex flex-col h-full rounded-3xl overflow-hidden border ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-xl'}`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'border-neutral-800 bg-black/20' : 'border-neutral-100 bg-neutral-50'}`}>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-700 overflow-hidden ring-2 ring-[#F24C20]/20">
                     {otherUser.profile_image ? (
                         <img src={otherUser.profile_image} className="w-full h-full object-cover" />
                     ) : (
                         <div className="w-full h-full flex items-center justify-center text-white"><User className="w-5 h-5"/></div>
                     )}
                </div>
                <div>
                    <h4 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{otherUser.full_name}</h4>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Online
                    </span>
                </div>
            </div>
            <button 
                onClick={onClose} 
                className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5 text-neutral-500' : 'hover:bg-black/5 text-neutral-500'}`}
                title="Back to Inbox"
            >
                <MessageSquare className="w-5 h-5 md:rotate-90" />
            </button>
        </div>

        {/* Messages Space */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth">
            {loading ? (
                <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-[#F24C20]"/></div>
            ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-20 grayscale">
                    <MessageSquare className="w-12 h-12 mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">Start of conversation</p>
                </div>
            ) : messages.map((msg) => {
                const isMe = (typeof msg.sender === 'string' ? msg.sender : msg.sender._id) === currentUser._id;
                return (
                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-medium ${
                            isMe 
                            ? 'bg-[#F24C20] text-white rounded-br-none' 
                            : isDarkMode ? 'bg-neutral-800 text-neutral-200 rounded-bl-none' : 'bg-neutral-100 text-neutral-800 rounded-bl-none'
                        }`}>
                            {msg.content}
                            <div className={`text-[8px] mt-1 opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className={`p-4 border-t ${isDarkMode ? 'border-neutral-800 bg-black/20' : 'border-neutral-100 bg-neutral-50'}`}>
            <div className="relative">
                <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className={`w-full pl-4 sm:pl-5 pr-14 py-3 sm:py-3.5 rounded-2xl outline-none transition-all text-sm font-bold ${
                        isDarkMode ? 'bg-neutral-800 border-0 focus:ring-2 focus:ring-[#F24C20] text-white placeholder:text-neutral-500' : 'bg-white border-neutral-200 focus:ring-2 focus:ring-[#F24C20] text-neutral-900 shadow-sm'
                    }`}
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#F24C20] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#F24C20]/20"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </form>
    </div>
  );
}

import { toast } from "sonner";
