import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Gift, ExternalLink } from 'lucide-react';

interface Webinar {
  id: string;
  title: string;
}

interface Offer {
  id: string;
  webinar_id: string;
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

export default function Offers() {
  const { user } = useAuth();
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [selectedWebinar, setSelectedWebinar] = useState<string>('');
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    original_price: '',
    discount_price: '',
    installments: 1,
    payment_url: '',
    button_text: 'QUERO GARANTIR MINHA VAGA',
    trigger_minutes: 0,
    trigger_seconds: 0,
    is_visible: false,
    use_trigger: false
  });

  useEffect(() => {
    fetchWebinars();
  }, []);

  useEffect(() => {
    if (selectedWebinar) {
      fetchOffer();
    }
  }, [selectedWebinar]);

  const fetchWebinars = async () => {
    const { data } = await supabase
      .from('webinars')
      .select('id, title')
      .eq('admin_id', user?.id);
    
    if (data) {
      setWebinars(data);
      if (data.length > 0) {
        setSelectedWebinar(data[0].id);
      }
    }
    setLoading(false);
  };

  const fetchOffer = async () => {
    const { data } = await supabase
      .from('offers')
      .select('*')
      .eq('webinar_id', selectedWebinar)
      .single();
    
    if (data) {
      setOffer(data);
      const triggerMins = data.trigger_time_seconds ? Math.floor(data.trigger_time_seconds / 60) : 0;
      const triggerSecs = data.trigger_time_seconds ? data.trigger_time_seconds % 60 : 0;
      
      setForm({
        title: data.title,
        description: data.description || '',
        original_price: data.original_price?.toString() || '',
        discount_price: data.discount_price.toString(),
        installments: data.installments,
        payment_url: data.payment_url,
        button_text: data.button_text,
        trigger_minutes: triggerMins,
        trigger_seconds: triggerSecs,
        is_visible: data.is_visible,
        use_trigger: !!data.trigger_time_seconds
      });
    } else {
      setOffer(null);
      setForm({
        title: '',
        description: '',
        original_price: '',
        discount_price: '',
        installments: 1,
        payment_url: '',
        button_text: 'QUERO GARANTIR MINHA VAGA',
        trigger_minutes: 0,
        trigger_seconds: 0,
        is_visible: false,
        use_trigger: false
      });
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.discount_price || !form.payment_url) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setSaving(true);
    
    const triggerTimeSeconds = form.use_trigger 
      ? (form.trigger_minutes * 60) + form.trigger_seconds 
      : null;

    const offerData = {
      webinar_id: selectedWebinar,
      title: form.title,
      description: form.description || null,
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      discount_price: parseFloat(form.discount_price),
      installments: form.installments,
      payment_url: form.payment_url,
      button_text: form.button_text,
      trigger_time_seconds: triggerTimeSeconds,
      is_visible: form.is_visible
    };

    let result;
    if (offer) {
      result = await supabase
        .from('offers')
        .update(offerData)
        .eq('id', offer.id);
    } else {
      result = await supabase
        .from('offers')
        .insert(offerData);
    }

    if (result.error) {
      toast.error('Erro ao salvar oferta');
    } else {
      toast.success('Oferta salva!');
      fetchOffer();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <Link to="/admin" className="inline-flex items-center text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-white mb-8">Gerenciar Oferta</h1>

        {/* Webinar Selector */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="p-4">
            <Label className="text-gray-300 mb-2 block">Selecionar Webinar</Label>
            <Select value={selectedWebinar} onValueChange={setSelectedWebinar}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione um webinar" />
              </SelectTrigger>
              <SelectContent>
                {webinars.map(w => (
                  <SelectItem key={w.id} value={w.id}>{w.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Offer Form */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Gift className="w-5 h-5 text-yellow-500" />
              {offer ? 'Editar Oferta' : 'Criar Oferta'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Título da Oferta *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Treinamento Completo"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Descrição</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descreva os benefícios da oferta..."
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Preço Original (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.original_price}
                  onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                  placeholder="997.00"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Preço com Desconto * (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.discount_price}
                  onChange={(e) => setForm({ ...form, discount_price: e.target.value })}
                  placeholder="497.00"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Parcelas</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.installments}
                  onChange={(e) => setForm({ ...form, installments: parseInt(e.target.value) || 1 })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Link de Pagamento *</Label>
              <div className="flex gap-2">
                <Input
                  value={form.payment_url}
                  onChange={(e) => setForm({ ...form, payment_url: e.target.value })}
                  placeholder="https://pay.hotmart.com/..."
                  className="bg-gray-700 border-gray-600 text-white"
                />
                {form.payment_url && (
                  <a href={form.payment_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Texto do Botão</Label>
              <Input
                value={form.button_text}
                onChange={(e) => setForm({ ...form, button_text: e.target.value })}
                placeholder="QUERO GARANTIR MINHA VAGA"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-700">
              <div className="flex items-center gap-4">
                <Switch
                  checked={form.use_trigger}
                  onCheckedChange={(checked) => setForm({ ...form, use_trigger: checked })}
                />
                <Label className="text-gray-300">Exibir oferta em momento específico do vídeo</Label>
              </div>

              {form.use_trigger && (
                <div className="space-y-2">
                  <Label className="text-gray-300">Momento do Vídeo</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      min="0"
                      value={form.trigger_minutes}
                      onChange={(e) => setForm({ ...form, trigger_minutes: parseInt(e.target.value) || 0 })}
                      placeholder="Min"
                      className="w-24 bg-gray-700 border-gray-600 text-white"
                    />
                    <span className="text-white">:</span>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={form.trigger_seconds}
                      onChange={(e) => setForm({ ...form, trigger_seconds: parseInt(e.target.value) || 0 })}
                      placeholder="Seg"
                      className="w-24 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <Switch
                  checked={form.is_visible}
                  onCheckedChange={(checked) => setForm({ ...form, is_visible: checked })}
                />
                <Label className="text-gray-300">Oferta visível (exibir imediatamente se não usar trigger)</Label>
              </div>
            </div>

            <Button 
              onClick={handleSave}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={saving}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Oferta'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
