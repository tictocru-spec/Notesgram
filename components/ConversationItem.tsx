import Link from 'next/link';
import { format } from 'date-fns';

interface ConversationItemProps {
  id: string;
  name: string;
  previewMessage: string;
  timestamp: string;
  unreadCount?: number;
}

function getInitials(name: string) {
  return name.substring(0, 2).toUpperCase();
}

const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];

export function ConversationItem({ id, name, previewMessage, timestamp, unreadCount }: ConversationItemProps) {
  const colorIndex = name.length % colors.length;
  const avatarColor = colors[colorIndex];
  
  const displayTime = new Date(timestamp);
  const isToday = new Date().toDateString() === displayTime.toDateString();
  const timeString = isToday 
    ? format(displayTime, 'h:mm a') 
    : format(displayTime, 'M/d/yy');

  return (
    <Link href={`/chat/${id}`}>
      <div className="h-[80px] flex items-center px-4 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer relative overflow-hidden">
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-medium text-lg ${avatarColor}`}>
          {getInitials(name)}
        </div>
        
        {/* Content */}
        <div className="ml-4 flex-1 h-full flex flex-col justify-center min-w-0 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-baseline mb-0.5">
            <h3 className="font-semibold text-[17px] text-black dark:text-white truncate pr-2">
              {name}
            </h3>
            <span className="text-[15px] text-[#8E8E93] whitespace-nowrap flex-shrink-0">
              {timeString}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-[15px] text-[#8E8E93] truncate pr-2">
              {previewMessage || 'No messages yet'}
            </p>
            {unreadCount ? (
              <div className="w-2.5 h-2.5 bg-[#E4AF0A] rounded-full flex-shrink-0" />
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
