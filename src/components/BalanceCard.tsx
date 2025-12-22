import { Wallet, TrendingDown, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  currentBalance: number;
  totalSpent: number;
  isLowBalance: boolean;
  threshold: number;
}

export function BalanceCard({ currentBalance, totalSpent, isLowBalance, threshold }: BalanceCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl gradient-warm p-6 text-primary-foreground shadow-elevated animate-fade-in">
      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-foreground/10" />
      <div className="absolute -right-4 top-12 h-20 w-20 rounded-full bg-primary-foreground/5" />
      
      <div className="relative">
        <div className="flex items-center gap-2 text-primary-foreground/80">
          <Wallet className="h-5 w-5" />
          <span className="text-sm font-medium">Available Balance</span>
        </div>
        
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-display font-bold tracking-tight">
            ${currentBalance.toFixed(2)}
          </span>
        </div>

        {isLowBalance && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary-foreground/20 px-3 py-2 backdrop-blur-sm animate-pulse-soft">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Balance is below ${threshold} - Consider topping up!
            </span>
          </div>
        )}

        <div className="mt-6 flex items-center gap-2 text-primary-foreground/70">
          <TrendingDown className="h-4 w-4" />
          <span className="text-sm">
            Total spent: <span className="font-semibold text-primary-foreground">${totalSpent.toFixed(2)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
