import { Trash2, Check, Wallet, User, MoreVertical } from 'lucide-react';
import { Expense, categoryConfig, getCurrencySymbol, CurrencyCode } from '@/types/expense';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
      <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center animate-fade-in">
        <div className="mb-3 sm:mb-4 text-5xl sm:text-6xl">🧳</div>
        <h3 className="font-display text-base sm:text-lg font-semibold text-foreground">No expenses yet</h3>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
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

  const formatDateShort = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      {expenses.map((expense, index) => {
        const config = categoryConfig[expense.category];
        const isIndividual = expense.paymentSource === 'individual';
        const needsReimbursement = isIndividual && !expense.isReimbursed;

        return (
          <div
            key={expense.id}
            className={`group rounded-xl bg-card p-3 sm:p-4 shadow-soft transition-all duration-200 hover:shadow-elevated animate-slide-up ${
              needsReimbursement ? 'border-l-4 border-l-warning' : ''
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Mobile Layout */}
            <div className="flex items-start gap-3">
              <div 
                className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl text-xl sm:text-2xl"
                style={{ backgroundColor: `${config.color}20` }}
              >
                {config.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-card-foreground text-sm sm:text-base truncate pr-2">
                      {expense.description}
                    </h4>
                    
                    {/* Tags row */}
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <span 
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-medium"
                        style={{ 
                          backgroundColor: `${config.color}15`,
                          color: config.color 
                        }}
                      >
                        {config.label}
                      </span>
                      {isIndividual && (
                        <span className={`shrink-0 flex items-center gap-0.5 rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium ${
                          expense.isReimbursed 
                            ? 'bg-success/10 text-success' 
                            : 'bg-warning/10 text-warning'
                        }`}>
                          {expense.isReimbursed ? (
                            <>
                              <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              <span className="hidden xs:inline">Reimbursed</span>
                              <span className="xs:hidden">Paid</span>
                            </>
                          ) : (
                            <>
                              <User className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              <span className="truncate max-w-[60px] sm:max-w-none">Owes {expense.paidBy}</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Amount */}
                  <span className="font-display text-base sm:text-lg font-bold text-foreground shrink-0">
                    -{symbol}{expense.amount.toFixed(2)}
                  </span>
                </div>
                
                {/* Meta info row */}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {expense.paymentSource === 'pool' ? (
                        <Wallet className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      ) : (
                        <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      )}
                      <span className="hidden sm:inline">
                        {expense.paymentSource === 'pool' ? 'Pool' : `Paid by ${expense.paidBy}`}
                      </span>
                      <span className="sm:hidden">
                        {expense.paymentSource === 'pool' ? 'Pool' : expense.paidBy}
                      </span>
                    </span>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="hidden sm:inline">{formatDate(expense.date)}</span>
                    <span className="sm:hidden">{formatDateShort(expense.date)}</span>
                  </div>
                  
                  {/* Actions - Mobile dropdown */}
                  <div className="flex items-center gap-1">
                    {needsReimbursement && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => onReimburse(expense.id)}
                        className="h-8 px-2 sm:px-3 text-[10px] sm:text-xs touch-target-sm"
                      >
                        <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 sm:mr-1" />
                        <span className="hidden sm:inline">Reimburse</span>
                      </Button>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground touch-target-sm"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem 
                          onClick={() => onRemove(expense.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete expense
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                {expense.reimbursedAt && (
                  <p className="mt-1.5 text-[10px] sm:text-xs text-success">
                    ✓ Reimbursed {formatDateShort(expense.reimbursedAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}