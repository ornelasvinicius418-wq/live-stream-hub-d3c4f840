import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Calendar, Clock, Users } from 'lucide-react';

interface Webinar {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cover_image: string | null;
  scheduled_at: string | null;
  primary_color: string;
  secondary_color: string;
  background_color: string;
}

export default function Landing() {
  const { webinarId } = useParams();
  const navigate = useNavigate();
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    if (webinarId) {
      fetchWebinar();
    }
  }, [webinarId]);

  const fetchWebinar = async () => {
    const { data, error } = await supabase
      .from('webinars')
      .select('*')
      .eq('id', webinarId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      toast.error('Webinar não encontrado');
      navigate('/');
      return;
    }

    setWebinar(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase
      .from('webinar_registrations')
      .insert({
        webinar_id: webinarId,
        name: form.name,
        email: form.email,
        phone: form.phone || null
      });

    if (error) {
      toast.error('Erro ao fazer inscrição. Tente novamente.');
      setSubmitting(false);
      return;
    }

    // Salvar dados no localStorage para usar na live
    localStorage.setItem('webinar_user', JSON.stringify({
      name: form.name,
      email: form.email,
      webinarId
    }));

    toast.success('Inscrição realizada com sucesso!');
    navigate(`/live/${webinarId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (!webinar) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: webinar.background_color }}
    >
      {/* Hero Section */}
      <div className="relative">
        {webinar.cover_image && (
          <div className="w-full h-64 md:h-96 overflow-hidden">
            <img 
              src={webinar.cover_image} 
              alt={webinar.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90" />
          </div>
        )}
        
        <div className="container mx-auto px-4 py-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ 
                backgroundColor: `${webinar.primary_color}20`,
                color: webinar.primary_color 
              }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: webinar.primary_color }} />
              AULA ONLINE AO VIVO
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {webinar.title}
            </h1>
            
            {webinar.subtitle && (
              <p className="text-lg md:text-xl text-gray-300 mb-8">
                {webinar.subtitle}
              </p>
            )}

            {webinar.scheduled_at && (
              <div className="flex flex-wrap items-center justify-center gap-6 text-gray-300 mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" style={{ color: webinar.primary_color }} />
                  <span className="capitalize">{formatDate(webinar.scheduled_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" style={{ color: webinar.primary_color }} />
                  <span>{formatTime(webinar.scheduled_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: webinar.primary_color }} />
                  <span>Vagas Limitadas</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-md mx-auto">
          <div 
            className="rounded-2xl p-8 shadow-2xl"
            style={{ backgroundColor: webinar.secondary_color }}
          >
            <h2 className="text-xl font-bold text-white mb-2 text-center">
              Garanta sua vaga gratuita
            </h2>
            <p className="text-gray-400 text-center mb-6 text-sm">
              Preencha seus dados para participar da aula ao vivo
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Seu nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Seu melhor email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300">
                  WhatsApp <span className="text-gray-500">(opcional)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold text-white"
                style={{ backgroundColor: webinar.primary_color }}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'QUERO PARTICIPAR GRATUITAMENTE'
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                🔒 Seus dados estão seguros e não serão compartilhados
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
