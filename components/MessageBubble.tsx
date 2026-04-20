interface MessageBubbleProps {
  content: string;
  isSent: boolean;
  timestamp: string;
  showTimestamp?: boolean;
  senderLabel: string;
  showSender?: boolean;
}

export function MessageBubble({ content, isSent, timestamp, showTimestamp, senderLabel, showSender }: MessageBubbleProps) {
  const displayTime = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isGif = content.startsWith('giphy:');
  const gifUrl = isGif ? content.substring(6) : '';

  return (
    <div className="flex flex-col w-full mb-1">
      {showTimestamp && (
        <div className="text-center text-[12px] text-[#8E8E93] mt-5 mb-3 font-medium">
          {displayTime}
        </div>
      )}
      
      {showSender && (
        <div className="text-[12px] text-[#8E8E93] mt-2 mb-0 px-1 font-medium">
          {senderLabel}
        </div>
      )}

      {/* No bubble shapes, just left-aligned text lines */}
      <div 
        className={`px-1 text-[17px] leading-[28px] ${
          isSent 
            ? 'text-[#1A1A1A] dark:text-white' 
            : 'text-[#FFD60A]'
        }`}
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {isGif ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={gifUrl} 
            alt="GIF" 
            className="max-w-[200px] w-full rounded-[12px] my-1 object-cover" 
            loading="lazy"
          />
        ) : (
          content
        )}
      </div>
    </div>
  );
}
