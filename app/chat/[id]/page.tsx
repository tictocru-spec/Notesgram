import { createClient } from '@/lib/supabase-server';
import { ChatClient } from '@/components/ChatClient';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Share, MoreHorizontal } from 'lucide-react';

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

  // Fetch initial messages
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-3 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <Link href="/" className="flex items-center text-[#E4AF0A] -ml-2">
          <ChevronLeft size={32} strokeWidth={2} />
          <span className="text-[17px] font-medium ml-[-4px] truncate max-w-[150px]">
            {conversation.name || 'Chat'}
          </span>
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
      <ChatClient
        initialMessages={messages || []}
        conversationId={conversationId}
        userId={user.id}
      />
    </div>
  );
}
