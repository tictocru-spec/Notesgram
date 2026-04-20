/*
Run this SQL block in your Supabase SQL Editor:
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id FROM auth.users WHERE email = user_email LIMIT 1;
$$;
*/

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { PencilLine } from 'lucide-react';

export function NewConversationModal({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim()) return;
    
    setLoading(true);

    // 1. Get recipient ID by email
    const { data: recipientId, error: rpcError } = await supabase
      .rpc('get_user_id_by_email', { user_email: email });

    if (rpcError || !recipientId) {
      setErrorMsg('Пользователь не найден');
      setLoading(false);
      return;
    }
    
    // 2. Create a new conversation row
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .insert({ name: email })
      .select()
      .single();
      
    if (convError || !convData) {
      console.error('Error creating conversation:', convError);
      setErrorMsg('Ошибка создания');
      setLoading(false);
      return;
    }
    
    // 3. Insert both users as participants
    const { error: partError } = await supabase
      .from('participants')
      .insert([
        { conversation_id: convData.id, user_id: userId },
        { conversation_id: convData.id, user_id: recipientId }
      ]);
      
    if (partError) {
      console.error('Error adding participants:', partError);
    }
    
    setLoading(false);
    setIsOpen(false);
    setEmail('');
    
    // Redirect to the new chat
    router.push(`/chat/${convData.id}`);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-[#E4AF0A] hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
      >
        <PencilLine size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1C1C1E] rounded-[14px] w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-[#F2F2F7] dark:bg-[#2C2C2E]">
              <button 
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setErrorMsg('');
                  setEmail('');
                }}
                className="text-[#E4AF0A] text-[17px] focus:outline-none"
              >
                Отменить
              </button>
              <h2 className="font-semibold text-[17px] text-black dark:text-white">Новое</h2>
              <button 
                type="button"
                onClick={handleSubmit}
                disabled={loading || !email.trim()}
                className="text-[#E4AF0A] font-semibold text-[17px] focus:outline-none disabled:opacity-50"
              >
                Создать
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 flex flex-col">
              <div className="flex items-center">
                <label className="text-[17px] text-[#8E8E93] mr-3 whitespace-nowrap">Кому:</label>
                <input
                  type="email"
                  placeholder="Email пользователя"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  className="w-full text-[17px] bg-transparent text-black dark:text-white border-none focus:ring-0 outline-none placeholder:text-[#8E8E93]"
                />
              </div>
              {errorMsg && (
                <div className="mt-3 text-red-500 text-[15px]">{errorMsg}</div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
