import { Users, Clock } from 'lucide-react';

interface LiveHeaderProps {
  title: string;
  userName: string;
  viewerCount: number;
  currentTime: number;
  primaryColor: string;
}

export default function LiveHeader({ title, userName, viewerCount, currentTime, primaryColor }: LiveHeaderProps) {
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">{title}</h1>
        <p className="text-gray-400">
          Olá, <span style={{ color: primaryColor }} className="font-medium">{userName}</span>! Bem-vindo(a) à aula.
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-gray-300">
          <Users className="w-5 h-5" style={{ color: primaryColor }} />
          <span className="font-medium">{viewerCount.toLocaleString()}</span>
          <span className="text-gray-500 text-sm">assistindo</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-300">
          <Clock className="w-5 h-5" style={{ color: primaryColor }} />
          <span className="font-mono">{formatTime(currentTime)}</span>
        </div>
      </div>
    </div>
  );
}
