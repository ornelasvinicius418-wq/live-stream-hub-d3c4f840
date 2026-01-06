import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Users, Trophy, Search, Download } from 'lucide-react';

interface Webinar {
  id: string;
  title: string;
}

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export default function Registrations() {
  const { user } = useAuth();
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [selectedWebinar, setSelectedWebinar] = useState<string>('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebinars();
  }, []);

  useEffect(() => {
    if (selectedWebinar) {
      fetchRegistrations();
    }
  }, [selectedWebinar]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = registrations.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRegistrations(filtered);
    } else {
      setFilteredRegistrations(registrations);
    }
  }, [searchTerm, registrations]);

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

  const fetchRegistrations = async () => {
    const { data } = await supabase
      .from('webinar_registrations')
      .select('*')
      .eq('webinar_id', selectedWebinar)
      .order('created_at', { ascending: false });
    
    if (data) {
      setRegistrations(data);
      setFilteredRegistrations(data);
    }
  };

  const selectWinner = async (registration: Registration) => {
    // Insert winner
    const { error } = await supabase
      .from('winners')
      .insert({
        webinar_id: selectedWebinar,
        registration_id: registration.id,
        message: `Parabéns ${registration.name}! Você foi selecionado(a)!`
      });

    if (error) {
      toast.error('Erro ao selecionar ganhador');
    } else {
      toast.success(`${registration.name} foi selecionado(a) como ganhador(a)!`);
    }
  };

  const exportCSV = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'Data de Inscrição'];
    const rows = filteredRegistrations.map(r => [
      r.name,
      r.email,
      r.phone || '',
      new Date(r.created_at).toLocaleString('pt-BR')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inscritos-${selectedWebinar}.csv`;
    link.click();
    
    toast.success('CSV exportado!');
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

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Inscritos</h1>

        {/* Controls */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
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
              </div>
              
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome ou email..."
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <Button onClick={exportCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-white">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="font-medium">{filteredRegistrations.length}</span>
            <span className="text-gray-400">inscritos</span>
          </div>
        </div>

        {/* Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-0">
            {filteredRegistrations.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Nenhum inscrito encontrado</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400">Nome</TableHead>
                    <TableHead className="text-gray-400">Email</TableHead>
                    <TableHead className="text-gray-400">Telefone</TableHead>
                    <TableHead className="text-gray-400">Data</TableHead>
                    <TableHead className="text-gray-400 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((reg) => (
                    <TableRow key={reg.id} className="border-gray-700">
                      <TableCell className="text-white font-medium">{reg.name}</TableCell>
                      <TableCell className="text-gray-300">{reg.email}</TableCell>
                      <TableCell className="text-gray-300">{reg.phone || '-'}</TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(reg.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => selectWinner(reg)}
                          className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/20"
                        >
                          <Trophy className="w-4 h-4 mr-1" />
                          Ganhador
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
