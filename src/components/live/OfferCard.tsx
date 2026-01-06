import { Gift, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface Offer {
  id: string;
  title: string;
  description: string | null;
  original_price: number | null;
  discount_price: number;
  installments: number;
  payment_url: string;
  button_text: string;
}

interface OfferCardProps {
  offer: Offer;
  primaryColor: string;
}

export default function OfferCard({ offer, primaryColor }: OfferCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes countdown

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const discount = offer.original_price 
    ? Math.round(((offer.original_price - offer.discount_price) / offer.original_price) * 100)
    : 0;

  return (
    <div 
      className="rounded-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500"
      style={{ 
        background: `linear-gradient(135deg, ${primaryColor}20, ${primaryColor}05)`,
        border: `2px solid ${primaryColor}40`
      }}
    >
      {/* Header */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ backgroundColor: `${primaryColor}20` }}
      >
        <div className="flex items-center gap-3">
          <Gift className="w-6 h-6" style={{ color: primaryColor }} />
          <span className="font-bold text-white">🎁 OFERTA ESPECIAL LIBERADA!</span>
        </div>
        <div className="flex items-center gap-2 text-white">
          <Clock className="w-4 h-4" />
          <span className="font-mono font-bold">{formatCountdown(timeLeft)}</span>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 space-y-4">
          <h3 className="text-xl font-bold text-white">{offer.title}</h3>
          
          {offer.description && (
            <p className="text-gray-300 text-sm">{offer.description}</p>
          )}

          <div className="flex items-end gap-4">
            {offer.original_price && (
              <div>
                <span className="text-gray-500 line-through text-lg">
                  {formatPrice(offer.original_price)}
                </span>
                {discount > 0 && (
                  <span 
                    className="ml-2 px-2 py-1 rounded text-sm font-bold"
                    style={{ backgroundColor: primaryColor, color: 'white' }}
                  >
                    -{discount}%
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {formatPrice(offer.discount_price)}
            </span>
            {offer.installments > 1 && (
              <span className="text-gray-400">
                ou {offer.installments}x de {formatPrice(offer.discount_price / offer.installments)}
              </span>
            )}
          </div>

          <Button 
            className="w-full h-14 text-lg font-bold text-white group"
            style={{ backgroundColor: primaryColor }}
            onClick={() => window.open(offer.payment_url, '_blank')}
          >
            {offer.button_text}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="text-center text-xs text-gray-500">
            ⚡ Vagas limitadas • Acesso imediato após confirmação
          </p>
        </div>
      )}
    </div>
  );
}
