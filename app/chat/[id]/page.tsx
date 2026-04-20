/*
Run this SQL block in your Supabase SQL Editor:
CREATE OR REPLACE FUNCTION get_user_email_by_id(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT email FROM auth.users WHERE id = user_id LIMIT 1;
$$;
*/

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

  // Fetch participants
  const { data: participants } = await supabase
    .from('participants')
    .select('user_id')
    .eq('conversation_id', conversationId);

  // Determine the other participant's user_id
  const otherParticipant = participants?.find((p) => p.user_id !== user.id);
  
  let displayName = conversation.name?.split('@')[0] || 'Chat';

  if (otherParticipant) {
    const { data: otherEmail } = await supabase.rpc('get_user_email_by_id', {
      user_id: otherParticipant.user_id,
    });
    
    if (otherEmail && typeof otherEmail === 'string') {
      displayName = otherEmail.split('@')[0];
    }
  }

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
