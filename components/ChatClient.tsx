'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { MessageBubble } from './MessageBubble';
import { Smile, Send } from 'lucide-react';

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
}

export function ChatClient({ initialMessages, conversationId, userId }: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
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
            // Avoid adding duplicate message if it was sent by this user (it might have been added optimistically, but we'll re-fetch or let realtime append. Better yet, we can filter out duplicates if we did optimistic updates, but here we just append)
            // if we want to be safe against duplicates:
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as Message];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  const handleSend = async () => {
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
      // Optional: restore text if failed or show error
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // Determine when to show timestamps (e.g. if > 1 hour apart)
  const shouldShowTimestamp = (current: Message, previous?: Message) => {
    if (!previous) return true;
    const currentT = new Date(current.created_at).getTime();
    const prevT = new Date(previous.created_at).getTime();
    return currentT - prevT > 3600000; // 1 hour
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((msg, index) => {
          const prevMsg = index > 0 ? messages[index - 1] : undefined;
          const showTime = shouldShowTimestamp(msg, prevMsg);
          return (
            <MessageBubble
              key={msg.id}
              content={msg.content}
              isSent={msg.sender_id === userId}
              timestamp={msg.created_at}
              showTimestamp={showTime}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white dark:bg-black border-t border-[#C6C6C8] dark:border-gray-800 p-2 pb-[env(safe-area-inset-bottom)] shrink-0">
        <div className="flex items-end px-2">
          <div className="flex-1 bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-[20px] min-h-[40px] flex items-center pr-2 pl-3">
            <button className="text-[#E4AF0A] mr-2 flex-shrink-0 flex items-center justify-center">
              <Smile size={24} strokeWidth={1.5} />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Сообщение"
              className="flex-1 bg-transparent text-[17px] outline-none text-black dark:text-white placeholder:text-[#8E8E93] py-2"
            />
            {inputText.trim() && (
              <button
                onClick={handleSend}
                className="text-[#E4AF0A] ml-2 flex-shrink-0 flex items-center justify-center p-1"
              >
                <div className="w-7 h-7 rounded-full flex mx-auto items-center justify-center bg-transparent">
                    {/* The apple send button is typically an arrow pointing right. Using lucide Send as requested. Wait, they requested send arrow button in #E4AF0A. Send icon is available. */}
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
