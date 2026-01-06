import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Video, Users, MessageSquare, Gift, Settings, LogOut } from 'lucide-react';

interface WebinarStats {
  id: string;
  title: string;
  is_active: boolean;
  registrations_count: number;
}

export default function Dashboard() {
  const { user, signOut, isAdmin } = useAuth();
  const [webinars, setWebinars] = useState<WebinarStats[]>([]);
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebinars();
  }, []);

  const fetchWebinars = async () => {
    const { data: webinarsData } = await supabase
      .from('webinars')
      .select('id, title, is_active')
      .eq('admin_id', user?.id);

    if (webinarsData) {
      // Fetch registrations count for each webinar
      const webinarsWithStats = await Promise.all(
        webinarsData.map(async (webinar) => {
          const { count } = await supabase
            .from('webinar_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('webinar_id', webinar.id);
          
          return {
            ...webinar,
            registrations_count: count || 0
          };
        })
      );

      setWebinars(webinarsWithStats);
      setTotalRegistrations(webinarsWithStats.reduce((acc, w) => acc + w.registrations_count, 0));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Painel Administrativo</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-gray-400 hover:text-white">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Total de Webinars</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold text-white">{webinars.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Total de Inscritos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-bold text-white">{totalRegistrations}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Webinars Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-2xl font-bold text-white">
                  {webinars.filter(w => w.is_active).length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <Link to="/admin/webinars/new">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Webinar
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link to="/admin/webinars">
            <Card className="bg-gray-800 border-gray-700 hover:border-green-500/50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <Video className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Webinars</h3>
                  <p className="text-sm text-gray-400">Gerenciar webinars</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/comments">
            <Card className="bg-gray-800 border-gray-700 hover:border-blue-500/50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <MessageSquare className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Comentários</h3>
                  <p className="text-sm text-gray-400">Agendar comentários</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/offers">
            <Card className="bg-gray-800 border-gray-700 hover:border-yellow-500/50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/20">
                  <Gift className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Ofertas</h3>
                  <p className="text-sm text-gray-400">Gerenciar ofertas</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/registrations">
            <Card className="bg-gray-800 border-gray-700 hover:border-purple-500/50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Inscritos</h3>
                  <p className="text-sm text-gray-400">Ver espectadores</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Webinars List */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Seus Webinars</CardTitle>
          </CardHeader>
          <CardContent>
            {webinars.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Nenhum webinar criado</h3>
                <p className="text-gray-400 mb-4">Crie seu primeiro webinar para começar</p>
                <Link to="/admin/webinars/new">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Webinar
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {webinars.map((webinar) => (
                  <Link 
                    key={webinar.id} 
                    to={`/admin/webinars/${webinar.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${webinar.is_active ? 'bg-green-500' : 'bg-gray-500'}`} />
                        <div>
                          <h4 className="font-medium text-white">{webinar.title}</h4>
                          <p className="text-sm text-gray-400">
                            {webinar.registrations_count} inscritos
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          webinar.is_active 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {webinar.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
