import { createClient } from '@/lib/supabase-server';
import { ConversationItem } from '@/components/ConversationItem';
import { NewConversationModal } from '@/components/NewConversationModal';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch conversations the user is part of
  let conversations: any[] = [];
  
  if (user) {
    const { data: participantData } = await supabase
      .from('participants')
      .select(`
        conversations (
          id,
          name,
          created_at,
          messages (
            content,
            created_at
          )
        )
      `)
      .eq('user_id', user.id);

    if (participantData) {
      conversations = participantData
        .map((p: any) => p.conversations)
        .filter(Boolean)
        .map((conv: any) => {
          const sorted = (conv.messages || []).sort((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          return {
            ...conv,
            previewMessage: sorted[0]?.content || '',
            timestamp: sorted[0]?.created_at || conv.created_at,
          };
        })
        .sort((a: any, b: any) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black p-5">
      <div className="flex items-center justify-between mt-8 mb-4">
        <h1 className="text-[34px] font-bold text-black dark:text-white">Сообщения</h1>
        {user && <NewConversationModal userId={user.id} />}
      </div>

      <div className="bg-white dark:bg-[#1C1C1E] rounded-[10px] overflow-hidden shadow-sm">
        {conversations.length > 0 ? (
          conversations.map((conv) => (
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
