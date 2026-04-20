import { createClient } from '@/lib/supabase-server';
import { ConversationItem } from '@/components/ConversationItem';
import { PencilLine } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch conversations the user is part of
  let conversations: any[] = [];
  
  if (user) {
    const { data } = await supabase
      .from('conversations')
      .select(`
        id,
        name,
        created_at,
        messages (
          id,
          content,
          created_at
        )
      `)
      .order('created_at', { ascending: false });
    
    // Process and sort by latest message
    if (data) {
      conversations = data.map((conv: any) => {
        const sortedMsgs = conv.messages?.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ) || [];
        const lastMsg = sortedMsgs[0];
        return {
          ...conv,
          previewMessage: lastMsg?.content || '',
          timestamp: lastMsg?.created_at || conv.created_at,
        };
      }).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black p-5">
      <div className="flex items-center justify-between mt-8 mb-4">
        <h1 className="text-[34px] font-bold text-black dark:text-white">Сообщения</h1>
        <button className="p-2 text-[#E4AF0A] hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
          <PencilLine size={24} />
        </button>
      </div>

      <div className="bg-white dark:bg-[#1C1C1E] rounded-[10px] overflow-hidden shadow-sm">
        {conversations.length > 0 ? (
          conversations.map((conv, index) => (
            <ConversationItem
              key={conv.id}
              id={conv.id}
              name={conv.name || 'Unknown'}
              previewMessage={conv.previewMessage}
              timestamp={conv.timestamp}
            />
          ))
        ) : (
          <div className="p-8 text-center text-[#8E8E93]">
            No conversations yet
          </div>
        )}
      </div>
    </div>
  );
}
