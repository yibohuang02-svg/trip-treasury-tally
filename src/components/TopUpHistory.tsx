import { Wallet, User } from 'lucide-react';
import { TopUp, getCurrencySymbol, CurrencyCode } from '@/types/expense';

interface TopUpHistoryProps {
  topUps: TopUp[];
  currency: CurrencyCode;
}

export function TopUpHistory({ topUps, currency }: TopUpHistoryProps) {
  const symbol = getCurrencySymbol(currency);

  if (topUps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
        <div className="mb-4 text-4xl">💰</div>
        <h3 className="font-display text-lg font-semibold text-foreground">No top-ups yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add funds to start tracking contributions
        </p>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-3">
      {topUps.map((topUp, index) => (
        <div
          key={topUp.id}
          className="group flex items-center gap-4 rounded-xl bg-card p-4 shadow-soft transition-all duration-200 hover:shadow-elevated animate-slide-up border-l-4 border-l-success"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20 text-2xl">
            <Wallet className="h-6 w-6 text-success" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-card-foreground">
                Fund Top-up
              </h4>
              {topUp.note && (
                <span className="text-sm text-muted-foreground truncate">
                  — {topUp.note}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {topUp.addedBy}
              </span>
              <span>•</span>
              <span>{formatDate(topUp.date)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-bold text-success">
              +{symbol}{topUp.amount.toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}