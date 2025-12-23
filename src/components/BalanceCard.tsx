import { Wallet, TrendingDown, AlertTriangle } from 'lucide-react';
import { getCurrencySymbol, CurrencyCode } from '@/types/expense';

interface BalanceCardProps {
  currentBalance: number;
  totalSpent: number;
  isLowBalance: boolean;
  threshold: number;
  currency: CurrencyCode;
}

export function BalanceCard({ currentBalance, totalSpent, isLowBalance, threshold, currency }: BalanceCardProps) {
  const symbol = getCurrencySymbol(currency);

  return (
    <div className="relative overflow-hidden rounded-2xl gradient-warm p-4 sm:p-6 text-primary-foreground shadow-elevated animate-fade-in">
      {/* Background decoration */}
      <div className="absolute -right-6 -top-6 sm:-right-8 sm:-top-8 h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-primary-foreground/10" />
      <div className="absolute -right-2 top-10 sm:-right-4 sm:top-12 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary-foreground/5" />
      
      <div className="relative">
        <div className="flex items-center gap-2 text-primary-foreground/80">
          <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-xs sm:text-sm font-medium">Available Balance</span>
        </div>
        
        <div className="mt-1 sm:mt-2 flex items-baseline gap-1">
          <span className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
            {symbol}{currentBalance.toFixed(2)}
          </span>
        </div>

        {isLowBalance && (
          <div className="mt-3 sm:mt-4 flex items-center gap-2 rounded-lg bg-primary-foreground/20 px-2.5 sm:px-3 py-2 backdrop-blur-sm animate-pulse-soft">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">
              Balance below {symbol}{threshold} - Top up!
            </span>
          </div>
        )}

        <div className="mt-4 sm:mt-6 flex items-center gap-2 text-primary-foreground/70">
          <TrendingDown className="h-4 w-4 shrink-0" />
          <span className="text-xs sm:text-sm">
            Total spent: <span className="font-semibold text-primary-foreground">{symbol}{totalSpent.toFixed(2)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}