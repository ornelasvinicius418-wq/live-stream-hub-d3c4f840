import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import VideoPlayer from '@/components/live/VideoPlayer';
import LiveHeader from '@/components/live/LiveHeader';
import ChatSection from '@/components/live/ChatSection';
import OfferCard from '@/components/live/OfferCard';

interface Webinar {
  id: string;
  title: string;
  video_url: string | null;
  primary_color: string;
  secondary_color: string;
  background_color: string;
}

interface ScheduledComment {
  id: string;
  author_name: string;
  message: string;
  trigger_time_seconds: number;
  avatar_url: string | null;
}

interface Offer {
  id: string;
  title: string;
  description: string | null;
  original_price: number | null;
  discount_price: number;
  installments: number;
  payment_url: string;
  button_text: string;
  trigger_time_seconds: number | null;
  is_visible: boolean;
}

interface ChatMessage {
  id: string;
  user_name: string;
  message: string;
  is_from_admin: boolean;
  created_at: string;
}

export default function Live() {
  const { webinarId } = useParams();
  const navigate = useNavigate();
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [viewerCount, setViewerCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [scheduledComments, setScheduledComments] = useState<ScheduledComment[]>([]);
  const [triggeredComments, setTriggeredComments] = useState<Set<string>>(new Set());
  const [offer, setOffer] = useState<Offer | null>(null);
  const [showOffer, setShowOffer] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('webinar_user');
    if (!storedUser) {
      navigate(`/webinar/${webinarId}`);
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.webinarId !== webinarId) {
      navigate(`/webinar/${webinarId}`);
      return;
    }

    setUserName(userData.name);
    setUserEmail(userData.email);
    fetchWebinar();
    fetchScheduledComments();
    fetchOffer();
    
    // Simular contagem de espectadores
    const baseViewers = Math.floor(Math.random() * 500) + 800;
    setViewerCount(baseViewers);
    
    const viewerInterval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 10) - 4);
    }, 5000);

    return () => clearInterval(viewerInterval);
  }, [webinarId, navigate]);

  // Subscribe to real-time chat messages
  useEffect(() => {
    if (!webinarId) return;

    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `webinar_id=eq.${webinarId}`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [webinarId]);

  // Trigger scheduled comments based on video time
  useEffect(() => {
    scheduledComments.forEach(comment => {
      if (
        currentTime >= comment.trigger_time_seconds && 
        !triggeredComments.has(comment.id)
      ) {
        setTriggeredComments(prev => new Set([...prev, comment.id]));
        setMessages(prev => [...prev, {
          id: comment.id,
          user_name: comment.author_name,
          message: comment.message,
          is_from_admin: true,
          created_at: new Date().toISOString()
        }]);
      }
    });
  }, [currentTime, scheduledComments, triggeredComments]);

  // Trigger offer based on video time
  useEffect(() => {
    if (offer && offer.trigger_time_seconds && currentTime >= offer.trigger_time_seconds) {
      setShowOffer(true);
    }
  }, [currentTime, offer]);

  const fetchWebinar = async () => {
    const { data, error } = await supabase
      .from('webinars')
      .select('*')
      .eq('id', webinarId)
      .single();

    if (error || !data) {
      toast.error('Webinar não encontrado');
      navigate('/');
      return;
    }

    setWebinar(data);
    setLoading(false);
  };

  const fetchScheduledComments = async () => {
    const { data } = await supabase
      .from('scheduled_comments')
      .select('*')
      .eq('webinar_id', webinarId)
      .order('trigger_time_seconds', { ascending: true });

    if (data) {
      setScheduledComments(data);
    }
  };

  const fetchOffer = async () => {
    const { data } = await supabase
      .from('offers')
      .select('*')
      .eq('webinar_id', webinarId)
      .single();

    if (data) {
      setOffer(data);
      if (data.is_visible && !data.trigger_time_seconds) {
        setShowOffer(true);
      }
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        webinar_id: webinarId,
        user_name: userName,
        message: message.trim(),
        is_from_admin: false
      });

    if (error) {
      toast.error('Erro ao enviar mensagem');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (!webinar) return null;

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: webinar.background_color }}
    >
      <div className="container mx-auto px-4 py-4">
        <LiveHeader 
          title={webinar.title}
          userName={userName}
          viewerCount={viewerCount}
          currentTime={currentTime}
          primaryColor={webinar.primary_color}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Video + Offer */}
          <div className="lg:col-span-2 space-y-4">
            <VideoPlayer 
              videoUrl={webinar.video_url}
              onTimeUpdate={setCurrentTime}
              primaryColor={webinar.primary_color}
            />
            
            {showOffer && offer && (
              <OfferCard 
                offer={offer}
                primaryColor={webinar.primary_color}
              />
            )}
          </div>

          {/* Chat */}
          <div className="lg:col-span-1">
            <ChatSection 
              messages={messages}
              userName={userName}
              onSendMessage={handleSendMessage}
              primaryColor={webinar.primary_color}
              secondaryColor={webinar.secondary_color}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
