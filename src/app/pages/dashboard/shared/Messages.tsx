import { motion } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Star,
  Archive,
  Trash2,
  Circle,
  ChevronLeft
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '@/app/utils/api';
import { format } from 'date-fns';
import { io, Socket } from 'socket.io-client';
import VideoCallModal from './VideoCallModal';

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  role: 'client' | 'freelancer';
}

interface Message {
  id: string;
  sender: 'me' | 'them';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

import { useSearchParams } from 'react-router-dom';

const formatChatName = (user: any) => {
  if (!user) return 'Unknown User';
  const name = user.full_name || '';
  const email = user.email || '';
  
  // If the name is NOT an email, return it.
  if (name && !name.includes('@')) return name;

  // If the name IS an email, try to use username.
  if (user.username && !user.username.includes('@')) {
    // Clean up username if it looks like slugified email (optional)
    return user.username.split(/[0-9]/)[0].charAt(0).toUpperCase() + user.username.split(/[0-9]/)[0].slice(1);
  }

  // Fallback: Strip domain from email and capitalize
  const base = email.split('@')[0] || name.split('@')[0] || 'User';
  return base.charAt(0).toUpperCase() + base.slice(1);
};

export default function Messages() {
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const queryUser = searchParams.get('user');
  const queryIntent = searchParams.get('intent');
  const [selectedChat, setSelectedChat] = useState<string>('1');
  const [messageText, setMessageText] = useState('');

  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<any>({});
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [callerInfo, setCallerInfo] = useState<{ id: string, name: string, signal: any, isReceiving: boolean } | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    fetchConversations();

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    setSocket(newSocket);

    const userId = user._id || user.id;
    if (userId) {
      newSocket.emit('register', userId);
    }

    if (queryUser) {
      handleNewRecipient(queryUser);
    }

    return () => {
      newSocket.close();
    };
  }, [queryUser]);

  const handleNewRecipient = async (identifier: string) => {
    try {
      // First try to find in existing chats (might be matched by username or ID)
      const existingChat = chats.find(c => c.id === identifier);
      
      if (existingChat) {
        setSelectedChat(existingChat.id);
      } else {
        const res = await api.get(`/auth/users/${identifier}`);
        if (res.data.success) {
          const u = res.data.user;
          const realId = u._id;
          
          // Re-check with real ID
          const chatWithRealId = chats.find(c => c.id === realId);
          if (chatWithRealId) {
            setSelectedChat(realId);
          } else {
            const tempChat: Chat = {
              id: realId,
              name: formatChatName(u),
              avatar: u.profile_image ? (u.profile_image.startsWith('http') ? u.profile_image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${u.profile_image}`) : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
              lastMessage: '',
              timestamp: '',
              unread: 0,
              online: false,
              role: 'freelancer'
            };
            setChats(prev => [tempChat, ...prev]);
            setSelectedChat(realId);
          }
        }
      }

      if (queryIntent === 'hire') {
        setMessageText('Hi! I am interested in hiring you for a project. Could we discuss the details?');
      }
    } catch (err) {
      console.error('Error fetching recipient info:', err);
    }
  };

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (msg: any) => {
        fetchConversations();
        if (msg.sender._id === selectedChat || msg.sender === selectedChat) {
          fetchChatHistory();
        }
      };
      const handleUserOnline = (userId: string) => {
        setChats(prev => prev.map(c => c.id === userId ? { ...c, online: true } : c));
      };
      const handleUserOffline = (userId: string) => {
        setChats(prev => prev.map(c => c.id === userId ? { ...c, online: false } : c));
      };

      const handleIncomingCall = (data: any) => {
        setCallerInfo({
          id: data.from,
          name: data.name || 'Incoming Call',
          signal: data.signal,
          isReceiving: true
        });
        setIsVideoModalOpen(true);
      };

      socket.on('newMessage', handleNewMessage);
      socket.on('userOnline', handleUserOnline);
      socket.on('userOffline', handleUserOffline);
      socket.on('callUser', handleIncomingCall);
      return () => {
        socket.off('newMessage', handleNewMessage);
        socket.off('userOnline', handleUserOnline);
        socket.off('userOffline', handleUserOffline);
        socket.off('callUser', handleIncomingCall);
      };
    }
  }, [socket, selectedChat]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      if (res.data.success) {
        const mappedChats = res.data.data.map((c: any) => ({
          id: c.user._id,
          name: formatChatName(c.user),
          avatar: c.user.profile_image ? (c.user.profile_image.startsWith('http') ? c.user.profile_image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${c.user.profile_image}`) : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
          lastMessage: c.lastMessage?.content || '',
          timestamp: c.lastMessage?.createdAt ? format(new Date(c.lastMessage.createdAt), 'hh:mm a') : '',
          unread: c.unreadCount,
          online: false, // Could integrate websockets later
          role: 'client'
        }));
        setChats(mappedChats);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [showChatArea, setShowChatArea] = useState(false);

  useEffect(() => {
    if (selectedChat !== '1') {
      setShowChatArea(true);
      fetchChatHistory();
    }
  }, [selectedChat]);

  const fetchChatHistory = async () => {
    try {
      const res = await api.get(`/messages/${selectedChat}`);
      if (res.data.success) {
        setMessages(res.data.data.map((m: any) => ({
          id: m._id,
          sender: m.sender === currentUser._id || m.sender === currentUser.id ? 'me' : 'them',
          text: m.content,
          timestamp: format(new Date(m.createdAt), 'hh:mm a'),
          chat: m.chatunread || 0,
          status: m.isRead ? 'read' : 'delivered'
        })));
        scrollToBottom();
      }
    } catch (err) { }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const selectedChatData = chats.find(c => c.id === selectedChat);

  const handleSendMessage = async () => {
    if (messageText.trim() && selectedChatData) {
      const currentText = messageText;
      setMessageText('');
      try {
        const res = await api.post('/messages', {
          receiverId: selectedChat,
          content: currentText
        });
        if (res.data.success) {
          fetchChatHistory(); // refresh after sending
          fetchConversations(); // refresh last message
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const initiateVideoCall = () => {
    if (selectedChatData && currentUser) {
      setCallerInfo({
        id: selectedChatData.id,
        name: selectedChatData.name,
        signal: null,
        isReceiving: false
      });
      setIsVideoModalOpen(true);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 relative h-full">
      {isVideoModalOpen && socket && callerInfo && currentUser && (
        <VideoCallModal
          socket={socket}
          callerId={callerInfo.id}
          callerName={callerInfo.name}
          isReceivingCall={callerInfo.isReceiving}
          incomingSignal={callerInfo.signal}
          currentUserId={currentUser._id || currentUser.id}
          onClose={() => {
            setIsVideoModalOpen(false);
            setCallerInfo(null);
          }}
        />
      )}
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${showChatArea ? 'hidden md:block' : 'block'}`}
      >
        <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
          Messages
        </h1>
        <p className={`mt-1 md:mt-2 text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
          Communicate with clients and freelancers
        </p>
      </motion.div>

      {/* Messages Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-2xl border backdrop-blur-sm overflow-hidden ${isDarkMode
          ? 'bg-neutral-900/50 border-neutral-800'
          : 'bg-white/50 border-neutral-200'
          }`}
        style={{ height: 'calc(100vh - 200px)' }}
      >
        <div className="flex h-full relative">
          {/* Chat List Sidebar */}
          <div className={`${showChatArea ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r ${isDarkMode ? 'border-neutral-800' : 'border-neutral-200'} flex-col`}>
            {/* Search */}
            <div className="p-4 border-b border-neutral-800/50">
              <div className={`relative rounded-xl overflow-hidden ${isDarkMode ? 'bg-neutral-800/50' : 'bg-neutral-100'
                }`}>
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'
                  }`} />
                <input
                  type="text"
                  placeholder="Search messages..."
                  className={`w-full pl-10 pr-4 py-2.5 bg-transparent text-sm outline-none ${isDarkMode
                    ? 'text-white placeholder:text-neutral-500'
                    : 'text-neutral-900 placeholder:text-neutral-400'
                    }`}
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {chats.length > 0 ? chats.map((chat) => (
                <motion.button
                  key={chat.id}
                  onClick={() => {
                    setSelectedChat(chat.id);
                    setShowChatArea(true);
                  }}
                  whileHover={{ x: 4 }}
                  className={`w-full p-4 flex items-start gap-3 border-b transition-colors ${selectedChat === chat.id
                    ? isDarkMode
                      ? 'bg-[#F24C20]/10 border-[#F24C20]/30'
                      : 'bg-[#F24C20]/10 border-[#F24C20]/30'
                    : isDarkMode
                      ? 'border-neutral-800 hover:bg-neutral-800/50'
                      : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                >
                  <div className="relative">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-neutral-900" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {chat.name}
                      </span>
                      <span className={`text-xs ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        {chat.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm line-clamp-1 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        {chat.lastMessage || 'Start a conversation'}
                      </p>
                      {chat.unread > 0 && (
                        <span className="px-2 py-0.5 bg-[#F24C20] text-white text-xs rounded-full ml-2">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              )) : (
                <div className="p-8 text-center text-sm text-neutral-500 italic">No conversations found</div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${showChatArea ? 'flex' : 'hidden md:flex'} flex-1 flex-col h-full bg-neutral-950/20`}>
             {selectedChatData ? (
                <>
                  {/* Chat Header */}
                  <div className={`p-3 md:p-4 border-b ${isDarkMode ? 'border-neutral-800' : 'border-neutral-200'} flex items-center justify-between bg-neutral-900/40 backdrop-blur-md`}>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setShowChatArea(false)}
                        className="p-2 md:hidden text-neutral-400 hover:text-white"
                      >
                         <ChevronLeft className="w-6 h-6" />
                      </button>
                      <div className="relative">
                        <img
                          src={selectedChatData.avatar}
                          alt={selectedChatData.name}
                          className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
                        />
                        {selectedChatData.online && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-neutral-900" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className={`font-bold text-sm md:text-base truncate ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                          {selectedChatData.name}
                        </h3>
                        <p className={`text-[10px] md:text-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                          {selectedChatData.online ? 'Active now' : 'Offline'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <button className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'}`}>
                        <Phone className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      <button onClick={initiateVideoCall} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'}`}>
                        <Video className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      <button className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'}`}>
                        <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] md:max-w-md px-4 py-3 rounded-2xl ${message.sender === 'me'
                          ? 'bg-[#F24C20] text-white rounded-br-sm shadow-lg shadow-[#F24C20]/20'
                          : isDarkMode
                            ? 'bg-neutral-800 text-white rounded-bl-sm border border-neutral-700'
                            : 'bg-neutral-100 text-neutral-900 rounded-bl-sm border border-neutral-200'
                          }`}>
                          <p className="text-sm leading-relaxed">{message.text}</p>
                          <span className={`text-[10px] mt-1 block font-bold uppercase tracking-widest ${message.sender === 'me'
                            ? 'text-white/60'
                            : isDarkMode ? 'text-neutral-500' : 'text-neutral-400'
                            }`}>
                            {message.timestamp}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className={`p-3 md:p-4 border-t ${isDarkMode ? 'border-neutral-800' : 'border-neutral-200'} bg-neutral-900/40 backdrop-blur-md`}>
                    <div className={`flex items-end gap-2 md:gap-3 p-2 md:p-3 rounded-2xl ${isDarkMode ? 'bg-neutral-800/50' : 'bg-neutral-100'
                      }`}>
                      <button className={`p-2 rounded-lg transition-colors hidden sm:block ${isDarkMode ? 'hover:bg-neutral-700 text-neutral-400' : 'hover:bg-neutral-200 text-neutral-600'}`}>
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Message..."
                        rows={1}
                        className={`flex-1 bg-transparent py-2 px-1 outline-none resize-none text-sm ${isDarkMode
                          ? 'text-white placeholder:text-neutral-500'
                          : 'text-neutral-900 placeholder:text-neutral-400'
                          }`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <button className={`p-2 rounded-lg transition-colors hidden sm:block ${isDarkMode ? 'hover:bg-neutral-700 text-neutral-400' : 'hover:bg-neutral-200 text-neutral-600'}`}>
                        <Smile className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        className={`p-2 rounded-xl transition-all ${messageText.trim()
                          ? 'bg-[#F24C20] text-white hover:scale-110 active:scale-95 shadow-lg shadow-[#F24C20]/30'
                          : isDarkMode
                            ? 'bg-neutral-700 text-neutral-500 opacity-50'
                            : 'bg-neutral-200 text-neutral-400 opacity-50'
                          }`}
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
             ) : (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-[#F24C20]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
                       <MessageSquare className={`w-10 h-10 ${isDarkMode ? 'text-[#F24C20]' : 'text-[#F24C20]'}`} />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Your Inbox</h3>
                    <p className={`text-sm max-w-xs mx-auto ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      Select an active conversation to start collaborating with experts or clients.
                    </p>
                    <button 
                      onClick={() => setShowChatArea(false)}
                      className="mt-8 px-8 py-3 bg-[#F24C20] text-white rounded-full font-bold text-sm md:hidden hover:scale-105 transition-transform shadow-lg shadow-[#F24C20]/20"
                    >
                      View All Conversations
                    </button>
                  </div>
                </div>
             )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}