interface MessageBubbleProps {
  content: string;
  isSent: boolean;
  timestamp: string;
  showTimestamp?: boolean;
}

export function MessageBubble({ content, isSent, timestamp, showTimestamp }: MessageBubbleProps) {
  const displayTime = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col w-full mb-2">
      {showTimestamp && (
        <div className="text-center text-[12px] text-[#8E8E93] my-4">
          {displayTime}
        </div>
      )}
      <div className={`flex w-full ${isSent ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-[75%] px-[16px] py-[10px] rounded-[18px] text-[17px] leading-[22px] ${
            isSent
              ? 'bg-[#FFD60A] text-black'
              : 'bg-[#F2F2F7] dark:bg-[#1C1C1E] text-black dark:text-white'
          }`}
          style={{ wordBreak: 'break-word' }}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
