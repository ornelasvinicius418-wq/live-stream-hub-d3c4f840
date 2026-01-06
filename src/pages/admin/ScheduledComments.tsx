import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Clock, Loader2 } from 'lucide-react';

interface Webinar {
  id: string;
  title: string;
}

interface ScheduledComment {
  id: string;
  webinar_id: string;
  author_name: string;
  message: string;
  trigger_time_seconds: number;
}

export default function ScheduledComments() {
  const { user } = useAuth();
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [selectedWebinar, setSelectedWebinar] = useState<string>('');
  const [comments, setComments] = useState<ScheduledComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [newComment, setNewComment] = useState({
    author_name: '',
    message: '',
    trigger_minutes: 0,
    trigger_seconds: 0
  });

  useEffect(() => {
    fetchWebinars();
  }, []);

  useEffect(() => {
    if (selectedWebinar) {
      fetchComments();
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

  const fetchComments = async () => {
    const { data } = await supabase
      .from('scheduled_comments')
      .select('*')
      .eq('webinar_id', selectedWebinar)
      .order('trigger_time_seconds', { ascending: true });
    
    if (data) {
      setComments(data);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.author_name || !newComment.message) {
      toast.error('Preencha todos os campos');
      return;
    }

    setSaving(true);
    const triggerTimeSeconds = (newComment.trigger_minutes * 60) + newComment.trigger_seconds;

    const { error } = await supabase
      .from('scheduled_comments')
      .insert({
        webinar_id: selectedWebinar,
        author_name: newComment.author_name,
        message: newComment.message,
        trigger_time_seconds: triggerTimeSeconds
      });

    if (error) {
      toast.error('Erro ao adicionar comentário');
    } else {
      toast.success('Comentário adicionado!');
      setNewComment({ author_name: '', message: '', trigger_minutes: 0, trigger_seconds: 0 });
      fetchComments();
    }
    setSaving(false);
  };

  const handleDeleteComment = async (id: string) => {
    const { error } = await supabase
      .from('scheduled_comments')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir');
    } else {
      toast.success('Comentário excluído');
      fetchComments();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
        <h1 className="text-2xl font-bold text-white mb-8">Comentários Agendados</h1>

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

        {/* Add Comment Form */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-lg">Adicionar Novo Comentário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Nome do Autor</Label>
                <Input
                  value={newComment.author_name}
                  onChange={(e) => setNewComment({ ...newComment, author_name: e.target.value })}
                  placeholder="Ex: Maria Silva"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Momento do Vídeo</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={newComment.trigger_minutes}
                    onChange={(e) => setNewComment({ ...newComment, trigger_minutes: parseInt(e.target.value) || 0 })}
                    placeholder="Min"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <span className="text-white self-center">:</span>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={newComment.trigger_seconds}
                    onChange={(e) => setNewComment({ ...newComment, trigger_seconds: parseInt(e.target.value) || 0 })}
                    placeholder="Seg"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Mensagem</Label>
              <Textarea
                value={newComment.message}
                onChange={(e) => setNewComment({ ...newComment, message: e.target.value })}
                placeholder="Digite o comentário que será exibido..."
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <Button 
              onClick={handleAddComment} 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={saving}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> Adicionar Comentário</>}
            </Button>
          </CardContent>
        </Card>

        {/* Comments List */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              Comentários Programados ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {comments.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Nenhum comentário programado ainda
              </p>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div 
                    key={comment.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-gray-700/50"
                  >
                    <div className="flex items-center gap-2 px-3 py-1 rounded bg-blue-500/20 text-blue-400 text-sm shrink-0">
                      <Clock className="w-4 h-4" />
                      {formatTime(comment.trigger_time_seconds)}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{comment.author_name}</p>
                      <p className="text-gray-400 text-sm">{comment.message}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
