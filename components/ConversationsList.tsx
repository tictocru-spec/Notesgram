'use client';

import { useState, useMemo } from 'react';
import { Search, Mic } from 'lucide-react';
import { ConversationItem } from './ConversationItem';

interface ConversationsListProps {
  initialConversations: any[];
}

export function ConversationsList({ initialConversations }: ConversationsListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return initialConversations;
    const lowerQuery = searchQuery.toLowerCase();
    
    return initialConversations.filter(conv => {
      const name = conv.name || '';
      const nameBeforeAt = name.split('@')[0];
      return nameBeforeAt.toLowerCase().includes(lowerQuery);
    });
  }, [initialConversations, searchQuery]);

  return (
    <div className="w-full flex flex-col">
      {/* Search Bar */}
      <div className="w-full bg-[#E5E5EA] dark:bg-[#1C1C1E] rounded-[12px] h-[44px] flex items-center px-3 mb-4">
        <Search size={20} className="text-[#8E8E93] mr-2 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск"
          className="flex-1 bg-transparent text-[17px] text-black dark:text-white placeholder:text-[#8E8E93] outline-none"
        />
        <Mic size={20} className="text-[#8E8E93] ml-2 shrink-0 cursor-pointer" />
      </div>

      {/* Conversations List */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-[10px] overflow-hidden shadow-sm">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => {
            // Truncate email prefix for display consistency
            const displayName = (conv.name || 'Unknown').split('@')[0];
            return (
              <ConversationItem
                key={conv.id}
                id={conv.id}
                name={displayName}
                previewMessage={conv.previewMessage}
                timestamp={conv.timestamp}
              />
            );
          })
        ) : (
          <div className="p-8 text-center text-[#8E8E93]">
            {searchQuery.trim() ? 'Ничего не найдено' : 'Нет сообщений'}
          </div>
        )}
      </div>
    </div>
  );
}
