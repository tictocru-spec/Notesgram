import { createClient } from '@/lib/supabase-server';
import { ChatClient } from '@/components/ChatClient';
import { redirect } from 'next/navigation';

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: conversationId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  // Fetch conversation details
  const { data: conversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (!conversation) {
    return <div className="p-4">Conversation not found</div>;
  }

  // Truncate name before @ 
  const displayName = conversation.name?.split('@')[0] || 'Chat';

  // Fetch initial messages
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  return (
    <div className="flex flex-col h-screen bg-[#FFFEF5] dark:bg-[#0D0D0D]">
      <ChatClient
        initialMessages={messages || []}
        conversationId={conversationId}
        userId={user.id}
        otherUserName={displayName}
      />
    </div>
  );
}
