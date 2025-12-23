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
      <div className="flex flex-col items-center justify-center py-8 sm:py-10 text-center animate-fade-in">
        <div className="mb-3 sm:mb-4 text-4xl sm:text-5xl">💰</div>
        <h3 className="font-display text-base sm:text-lg font-semibold text-foreground">No top-ups yet</h3>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
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

  const formatDateShort = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      {topUps.map((topUp, index) => (
        <div
          key={topUp.id}
          className="group flex items-center gap-3 sm:gap-4 rounded-xl bg-card p-3 sm:p-4 shadow-soft transition-all duration-200 hover:shadow-elevated animate-slide-up border-l-4 border-l-success"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-success/20">
            <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-card-foreground text-sm sm:text-base">
                  Fund Top-up
                </h4>
                {topUp.note && (
                  <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
                    {topUp.note}
                  </p>
                )}
              </div>
              <span className="font-display text-base sm:text-lg font-bold text-success shrink-0">
                +{symbol}{topUp.amount.toFixed(2)}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {topUp.addedBy}
              </span>
              <span className="text-muted-foreground/50">•</span>
              <span className="hidden sm:inline">{formatDate(topUp.date)}</span>
              <span className="sm:hidden">{formatDateShort(topUp.date)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}