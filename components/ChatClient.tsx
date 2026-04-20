'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { MessageBubble } from './MessageBubble';
import { Smile, Send, ChevronLeft, Share, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ChatClientProps {
  initialMessages: Message[];
  conversationId: string;
  userId: string;
  otherUserName: string;
}

export function ChatClient({ initialMessages, conversationId, userId, otherUserName }: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // GIF Picker State
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearch, setGifSearch] = useState('');
  const [gifs, setGifs] = useState<any[]>([]);
  const [isGifsLoading, setIsGifsLoading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const channel = supabase.channel(`messages:${conversationId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as Message];
          });
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Check if there is any presence record for a user other than the current user
        const presences = Object.values(state).flat() as any[];
        const hasOtherUser = presences.some((p) => p.user_id && p.user_id !== userId);
        setIsOnline(hasOtherUser);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId, online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase, userId]);

  // Fetch GIFs Effect (debounced 500ms)
  useEffect(() => {
    if (!showGifPicker) return;

    const fetchGifs = async () => {
      setIsGifsLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY || '';
        const endpoint = gifSearch.trim()
          ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(gifSearch)}&limit=20&rating=g`
          : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=20&rating=g`;

        const res = await fetch(endpoint);
        const data = await res.json();
        if (data.data) {
          setGifs(data.data);
        }
      } catch (err) {
        console.error('Error fetching GIFs:', err);
      } finally {
        setIsGifsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchGifs();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [gifSearch, showGifPicker]);

  const handleSendText = async () => {
    if (!inputText.trim()) return;

    const content = inputText;
    setInputText('');

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      content,
    });

    if (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSendGif = async (url: string) => {
    setShowGifPicker(false);
    
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: `giphy:${url}`,
    });

    if (error) {
      console.error('Error sending gif:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendText();
    }
  };

  const shouldShowTimestamp = (current: Message, previous?: Message) => {
    if (!previous) return true;
    const currentT = new Date(current.created_at).getTime();
    const prevT = new Date(previous.created_at).getTime();
    return currentT - prevT > 3600000; // 1 hour
  };

  const shouldShowSender = (current: Message, previous?: Message) => {
    if (!previous) return true;
    if (shouldShowTimestamp(current, previous)) return true;
    if (current.sender_id !== previous.sender_id) return true;
    return false;
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --ruled-line-color: rgba(0,0,0,0.07);
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --ruled-line-color: rgba(255,255,255,0.07);
          }
        }
      `}} />

      {/* Header */}
      <div className="flex items-center justify-between px-2 py-3 border-b border-[#C6C6C8] dark:border-gray-800 shrink-0 bg-[#FFFEF5] dark:bg-[#0D0D0D]">
        <Link href="/" className="flex items-center text-[#E4AF0A] -ml-2 shrink-0">
          <ChevronLeft size={32} strokeWidth={2} />
          <div className="flex flex-col items-start ml-[-4px]">
            <span className="text-[17px] font-medium truncate max-w-[150px]">
              {otherUserName}
            </span>
            <span className="text-[12px] flex items-center gap-1.5 mt-[-2px]">
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                  <span className="text-gray-500 dark:text-gray-400 font-normal">в сети</span>
                </>
              ) : (
                <span className="text-gray-500 dark:text-gray-400 font-normal">был(а) недавно</span>
              )}
            </span>
          </div>
        </Link>
        <div className="flex items-center space-x-4 text-black dark:text-[#8E8E93]">
          <button className="p-1">
            <Share size={24} strokeWidth={1.5} />
          </button>
          <button className="p-1">
            <MoreHorizontal size={24} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div 
        className="flex-1 overflow-y-auto relative"
        style={{
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, var(--ruled-line-color) 27px, var(--ruled-line-color) 28px)',
          backgroundAttachment: 'local'
        }}
      >
        <div className="px-4 py-4 min-h-full">
          {messages.map((msg, index) => {
            const prevMsg = index > 0 ? messages[index - 1] : undefined;
            const showTime = shouldShowTimestamp(msg, prevMsg);
            const showSender = shouldShowSender(msg, prevMsg);
            
            return (
              <MessageBubble
                key={msg.id}
                content={msg.content}
                isSent={msg.sender_id === userId}
                timestamp={msg.created_at}
                showTimestamp={showTime}
                senderLabel={msg.sender_id === userId ? 'Вы' : otherUserName}
                showSender={showSender}
              />
            );
          })}
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      {/* Input Bar Layer */}
      <div className="relative bg-[#FFFEF5] dark:bg-[#0D0D0D] border-t border-[#C6C6C8] dark:border-gray-800 p-2 pb-[env(safe-area-inset-bottom)] shrink-0 z-10 w-full">
        
        {/* GIF Picker Panel (positioned absolute above the input bar) */}
        {showGifPicker && (
          <div className="absolute bottom-[100%] left-0 w-full h-[300px] bg-[#FFFEF5] dark:bg-[#0D0D0D] border-t border-[#C6C6C8] dark:border-gray-800 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] flex flex-col z-20">
            <div className="p-3 border-b border-[#C6C6C8] dark:border-gray-800 shrink-0">
              <input
                type="text"
                placeholder="Поиск гифок..."
                value={gifSearch}
                onChange={(e) => setGifSearch(e.target.value)}
                autoFocus
                className="w-full bg-[#E5E5EA] dark:bg-[#1C1C1E] rounded-[10px] px-3 py-2 text-[15px] outline-none text-black dark:text-white placeholder:text-[#8E8E93]"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {isGifsLoading ? (
                <div className="text-center text-[#8E8E93] text-[13px] mt-4">Загрузка...</div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {gifs.map((gif) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={gif.id}
                      src={gif.images.fixed_height.url}
                      alt={gif.title || "gif"}
                      className="w-full h-[120px] object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleSendGif(gif.images.fixed_height.url)}
                      loading="lazy"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-end px-2 pt-1">
          <div className="flex-1 bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-[20px] min-h-[40px] flex items-center pr-2 pl-3">
            <button 
              onClick={() => setShowGifPicker(!showGifPicker)}
              className="text-[#E4AF0A] mr-2 flex-shrink-0 flex items-center justify-center p-1 cursor-pointer transition-opacity hover:opacity-80"
            >
              <Smile size={24} strokeWidth={1.5} />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Сообщение"
              className="flex-1 bg-transparent text-[17px] outline-none text-black dark:text-white placeholder:text-[#8E8E93] py-[10px]"
            />
            {inputText.trim() && (
              <button
                onClick={handleSendText}
                className="text-[#E4AF0A] ml-2 flex-shrink-0 flex items-center justify-center p-1 cursor-pointer transition-opacity hover:opacity-80"
              >
                <div className="w-7 h-7 rounded-full flex mx-auto items-center justify-center bg-transparent">
                  <Send size={22} strokeWidth={2} />
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
