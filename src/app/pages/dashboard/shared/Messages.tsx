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
  Circle
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
              name: u.full_name,
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
          name: c.user.full_name,
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

  useEffect(() => {
    if (selectedChat !== '1') {
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
    <div className="space-y-6 relative">
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
      >
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
          Messages
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
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
        style={{ height: 'calc(100vh - 280px)' }}
      >
        <div className="flex h-full">
          {/* Chat List Sidebar */}
          <div className={`w-80 border-r ${isDarkMode ? 'border-neutral-800' : 'border-neutral-200'} flex flex-col`}>
            {/* Search */}
            <div className="p-4 border-b border-neutral-800">
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
              {chats.map((chat) => (
                <motion.button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
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
                        {chat.lastMessage}
                      </p>
                      {chat.unread > 0 && (
                        <span className="px-2 py-0.5 bg-[#F24C20] text-white text-xs rounded-full ml-2">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          {selectedChatData ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className={`p-4 border-b ${isDarkMode ? 'border-neutral-800' : 'border-neutral-200'} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={selectedChatData.avatar}
                      alt={selectedChatData.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {selectedChatData.online && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-neutral-900" />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                      {selectedChatData.name}
                    </h3>
                    <p className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      {selectedChatData.online ? 'Active now' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className={`p-2 rounded-lg transition-colors ${isDarkMode
                    ? 'hover:bg-neutral-800 text-neutral-400'
                    : 'hover:bg-neutral-100 text-neutral-600'
                    }`}>
                    <Phone className="w-5 h-5" />
                  </button>
                  <button onClick={initiateVideoCall} className={`p-2 rounded-lg transition-colors ${isDarkMode
                    ? 'hover:bg-neutral-800 text-neutral-400'
                    : 'hover:bg-neutral-100 text-neutral-600'
                    }`}>
                    <Video className="w-5 h-5" />
                  </button>
                  <button className={`p-2 rounded-lg transition-colors ${isDarkMode
                    ? 'hover:bg-neutral-800 text-neutral-400'
                    : 'hover:bg-neutral-100 text-neutral-600'
                    }`}>
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md px-4 py-3 rounded-2xl ${message.sender === 'me'
                      ? 'bg-[#F24C20] text-white rounded-br-sm'
                      : isDarkMode
                        ? 'bg-neutral-800 text-white rounded-bl-sm'
                        : 'bg-neutral-100 text-neutral-900 rounded-bl-sm'
                      }`}>
                      <p className="text-sm">{message.text}</p>
                      <span className={`text-xs mt-1 block ${message.sender === 'me'
                        ? 'text-white/70'
                        : isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
                        }`}>
                        {message.timestamp}
                      </span>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className={`p-4 border-t ${isDarkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
                <div className={`flex items-end gap-3 p-3 rounded-xl ${isDarkMode ? 'bg-neutral-800/50' : 'bg-neutral-100'
                  }`}>
                  <button className={`p-2 rounded-lg transition-colors ${isDarkMode
                    ? 'hover:bg-neutral-700 text-neutral-400'
                    : 'hover:bg-neutral-200 text-neutral-600'
                    }`}>
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    rows={1}
                    className={`flex-1 bg-transparent outline-none resize-none ${isDarkMode
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
                  <button className={`p-2 rounded-lg transition-colors ${isDarkMode
                    ? 'hover:bg-neutral-700 text-neutral-400'
                    : 'hover:bg-neutral-200 text-neutral-600'
                    }`}>
                    <Smile className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className={`p-2 rounded-lg transition-colors ${messageText.trim()
                      ? 'bg-[#F24C20] text-white hover:bg-[#F24C20]/90'
                      : isDarkMode
                        ? 'bg-neutral-700 text-neutral-500'
                        : 'bg-neutral-200 text-neutral-400'
                      }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-neutral-700' : 'text-neutral-300'}`} />
                <p className={`text-lg ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  Select a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}