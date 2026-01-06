import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Video, Users, MessageSquare, Gift, ArrowRight } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Plataforma de Webinars
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Crie webinars <span className="text-green-500">profissionais</span> em minutos
          </h1>

          <p className="text-xl text-gray-400 mb-8">
            Plataforma completa para criar lives fake, com chat automático, ofertas programadas e muito mais.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/auth">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8">
                Acessar Painel Admin
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <div className="p-6 rounded-2xl bg-gray-800/50 border border-gray-700">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4 mx-auto">
                <Video className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-white font-semibold mb-2">Vídeo Fake Live</h3>
              <p className="text-gray-400 text-sm">Use vídeos pré-gravados como se fossem ao vivo</p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-800/50 border border-gray-700">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 mx-auto">
                <MessageSquare className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-white font-semibold mb-2">Chat Automático</h3>
              <p className="text-gray-400 text-sm">Agende comentários para momentos específicos</p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-800/50 border border-gray-700">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-4 mx-auto">
                <Gift className="w-6 h-6 text-yellow-500" />
              </div>
              <h3 className="text-white font-semibold mb-2">Ofertas Programadas</h3>
              <p className="text-gray-400 text-sm">Exiba ofertas no momento certo do vídeo</p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-800/50 border border-gray-700">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-white font-semibold mb-2">Gestão de Inscritos</h3>
              <p className="text-gray-400 text-sm">Acompanhe todos os registros em tempo real</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
