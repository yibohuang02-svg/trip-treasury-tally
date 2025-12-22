import { Trash2, Check, Wallet, User } from 'lucide-react';
import { Expense, categoryConfig, getCurrencySymbol, CurrencyCode } from '@/types/expense';
import { Button } from '@/components/ui/button';

interface ExpenseListProps {
  expenses: Expense[];
  currency: CurrencyCode;
  onRemove: (id: string) => void;
  onReimburse: (id: string) => void;
}

export function ExpenseList({ expenses, currency, onRemove, onReimburse }: ExpenseListProps) {
  const symbol = getCurrencySymbol(currency);

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
        <div className="mb-4 text-6xl">🧳</div>
        <h3 className="font-display text-lg font-semibold text-foreground">No expenses yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Start tracking your travel expenses!
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
      {expenses.map((expense, index) => {
        const config = categoryConfig[expense.category];
        const isIndividual = expense.paymentSource === 'individual';
        const needsReimbursement = isIndividual && !expense.isReimbursed;

        return (
          <div
            key={expense.id}
            className={`group flex items-center gap-4 rounded-xl bg-card p-4 shadow-soft transition-all duration-200 hover:shadow-elevated animate-slide-up ${
              needsReimbursement ? 'border-l-4 border-l-warning' : ''
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div 
              className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
              style={{ backgroundColor: `${config.color}20` }}
            >
              {config.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium text-card-foreground truncate">
                  {expense.description}
                </h4>
                <span 
                  className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ 
                    backgroundColor: `${config.color}15`,
                    color: config.color 
                  }}
                >
                  {config.label}
                </span>
                {isIndividual && (
                  <span className={`shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    expense.isReimbursed 
                      ? 'bg-success/10 text-success' 
                      : 'bg-warning/10 text-warning'
                  }`}>
                    {expense.isReimbursed ? (
                      <>
                        <Check className="h-3 w-3" />
                        Reimbursed
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3" />
                        Owes {expense.paidBy}
                      </>
                    )}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  {expense.paymentSource === 'pool' ? (
                    <Wallet className="h-3.5 w-3.5" />
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                  {expense.paymentSource === 'pool' ? 'Pool' : `Paid by ${expense.paidBy}`}
                </span>
                <span>•</span>
                <span>{formatDate(expense.date)}</span>
                {expense.reimbursedAt && (
                  <>
                    <span>•</span>
                    <span className="text-success">Reimbursed {formatDate(expense.reimbursedAt)}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold text-foreground">
                -{symbol}{expense.amount.toFixed(2)}
              </span>
              
              {needsReimbursement && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => onReimburse(expense.id)}
                  className="h-8 px-3 text-xs"
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Reimburse
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(expense.id)}
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
