import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Copy, ExternalLink } from 'lucide-react';

export default function WebinarForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    video_url: '',
    cover_image: '',
    scheduled_at: '',
    is_active: false,
    primary_color: '#22c55e',
    secondary_color: '#1f2937',
    background_color: '#111827'
  });

  useEffect(() => {
    if (isEditing) {
      fetchWebinar();
    }
  }, [id]);

  const fetchWebinar = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('webinars')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      toast.error('Webinar não encontrado');
      navigate('/admin');
      return;
    }

    setForm({
      title: data.title,
      subtitle: data.subtitle || '',
      description: data.description || '',
      video_url: data.video_url || '',
      cover_image: data.cover_image || '',
      scheduled_at: data.scheduled_at ? new Date(data.scheduled_at).toISOString().slice(0, 16) : '',
      is_active: data.is_active,
      primary_color: data.primary_color,
      secondary_color: data.secondary_color,
      background_color: data.background_color
    });
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const webinarData = {
      ...form,
      admin_id: user?.id,
      scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null
    };

    let result;
    if (isEditing) {
      result = await supabase
        .from('webinars')
        .update(webinarData)
        .eq('id', id);
    } else {
      result = await supabase
        .from('webinars')
        .insert(webinarData)
        .select()
        .single();
    }

    if (result.error) {
      toast.error('Erro ao salvar webinar');
      setSaving(false);
      return;
    }

    toast.success(isEditing ? 'Webinar atualizado!' : 'Webinar criado!');
    navigate(isEditing ? `/admin/webinars/${id}` : '/admin');
    setSaving(false);
  };

  const copyLink = (path: string) => {
    const url = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado!');
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
        <h1 className="text-2xl font-bold text-white mb-8">
          {isEditing ? 'Editar Webinar' : 'Criar Novo Webinar'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Links (only for editing) */}
          {isEditing && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Links do Webinar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={`${window.location.origin}/webinar/${id}`}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyLink(`/webinar/${id}`)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <a href={`/webinar/${id}`} target="_blank" rel="noopener noreferrer">
                    <Button type="button" variant="outline" size="icon">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
                <p className="text-xs text-gray-500">Página de registro</p>

                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={`${window.location.origin}/live/${id}`}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyLink(`/live/${id}`)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Página da live</p>
              </CardContent>
            </Card>
          )}

          {/* Basic Info */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Título do Webinar *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Como ganhar R$10mil por mês"
                  required
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Subtítulo</Label>
                <Input
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Ex: A estratégia que mudou minha vida"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Descrição</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descreva seu webinar..."
                  className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Data e Hora</Label>
                <Input
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="flex items-center gap-4">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                />
                <Label className="text-gray-300">Webinar ativo (visível publicamente)</Label>
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Mídia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">URL do Vídeo (MP4)</Label>
                <Input
                  value={form.video_url}
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                  placeholder="https://exemplo.com/video.mp4"
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <p className="text-xs text-gray-500">Deixe vazio para usar vídeo de demonstração</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Imagem de Capa</Label>
                <Input
                  value={form.cover_image}
                  onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Colors */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Personalização de Cores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Cor Principal</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={form.primary_color}
                      onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={form.primary_color}
                      onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={form.secondary_color}
                      onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={form.secondary_color}
                      onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Cor de Fundo</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={form.background_color}
                      onChange={(e) => setForm({ ...form, background_color: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={form.background_color}
                      onChange={(e) => setForm({ ...form, background_color: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin')}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={saving}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEditing ? 'Salvar Alterações' : 'Criar Webinar')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
