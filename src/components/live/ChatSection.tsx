import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ChatMessage {
  id: string;
  user_name: string;
  message: string;
  is_from_admin: boolean;
  created_at: string;
}

interface ChatSectionProps {
  messages: ChatMessage[];
  userName: string;
  onSendMessage: (message: string) => void;
  primaryColor: string;
  secondaryColor: string;
}

export default function ChatSection({ 
  messages, 
  userName, 
  onSendMessage, 
  primaryColor,
  secondaryColor 
}: ChatSectionProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div 
      className="rounded-xl h-[500px] lg:h-[600px] flex flex-col"
      style={{ backgroundColor: secondaryColor }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-semibold text-white flex items-center gap-2">
          💬 Chat ao vivo
          <span className="text-xs text-gray-400">({messages.length} mensagens)</span>
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>Seja o primeiro a comentar!</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 ${msg.user_name === userName ? 'flex-row-reverse' : ''}`}
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0"
              style={{ backgroundColor: msg.is_from_admin ? primaryColor : getAvatarColor(msg.user_name) }}
            >
              {getInitials(msg.user_name)}
            </div>
            
            <div className={`max-w-[80%] ${msg.user_name === userName ? 'text-right' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <span 
                  className="text-sm font-medium"
                  style={{ color: msg.is_from_admin ? primaryColor : '#9ca3af' }}
                >
                  {msg.user_name}
                  {msg.is_from_admin && ' ✓'}
                </span>
              </div>
              <div 
                className={`inline-block px-3 py-2 rounded-2xl text-sm ${
                  msg.user_name === userName 
                    ? 'rounded-tr-none' 
                    : 'rounded-tl-none'
                }`}
                style={{ 
                  backgroundColor: msg.user_name === userName ? primaryColor : 'rgba(255,255,255,0.1)',
                  color: 'white'
                }}
              >
                {msg.message}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
          />
          <Button 
            type="submit"
            size="icon"
            style={{ backgroundColor: primaryColor }}
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
