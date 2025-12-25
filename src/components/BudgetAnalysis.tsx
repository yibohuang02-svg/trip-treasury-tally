import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { format, differenceInDays, parseISO, addDays } from 'date-fns';
import { getCurrencySymbol, CurrencyCode, Expense } from '@/types/expense';
import { cn } from '@/lib/utils';

interface BudgetAnalysisProps {
  expenses: Expense[];
  currency: CurrencyCode;
  tripStartDate?: string;
  tripDuration?: number;
  totalBudget?: number;
  onSetTripSettings: (startDate: string, duration: number, budget: number) => void;
}

export function BudgetAnalysis({
  expenses,
  currency,
  tripStartDate,
  tripDuration,
  totalBudget,
  onSetTripSettings,
}: BudgetAnalysisProps) {
  const symbol = getCurrencySymbol(currency);
  
  const [isEditing, setIsEditing] = useState(!tripStartDate || !tripDuration || !totalBudget);
  const [startDate, setStartDate] = useState<Date | undefined>(
    tripStartDate ? parseISO(tripStartDate) : undefined
  );
  const [duration, setDuration] = useState(tripDuration?.toString() || '');
  const [budget, setBudget] = useState(totalBudget?.toString() || '');

  const handleSave = () => {
    if (startDate && duration && budget) {
      onSetTripSettings(format(startDate, 'yyyy-MM-dd'), parseInt(duration), parseFloat(budget));
      setIsEditing(false);
    }
  };

  const analysis = useMemo(() => {
    if (!tripStartDate || !tripDuration || !totalBudget) return null;

    const start = parseISO(tripStartDate);
    const today = new Date();
    const tripEnd = addDays(start, tripDuration);
    
    const daysElapsed = Math.max(0, Math.min(differenceInDays(today, start) + 1, tripDuration));
    const daysRemaining = Math.max(0, tripDuration - daysElapsed);
    
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const averageDailyBudget = totalBudget / tripDuration;
    const actualDailySpending = daysElapsed > 0 ? totalSpent / daysElapsed : 0;
    
    const expectedSpendingToDate = averageDailyBudget * daysElapsed;
    const budgetVariance = expectedSpendingToDate - totalSpent;
    const budgetUsagePercent = (totalSpent / totalBudget) * 100;
    const daysElapsedPercent = (daysElapsed / tripDuration) * 100;
    
    const projectedTotal = daysElapsed > 0 ? (totalSpent / daysElapsed) * tripDuration : 0;
    const remainingBudget = totalBudget - totalSpent;
    const remainingPerDay = daysRemaining > 0 ? remainingBudget / daysRemaining : 0;

    let status: 'on-track' | 'over' | 'under';
    if (Math.abs(budgetVariance) < averageDailyBudget * 0.1) {
      status = 'on-track';
    } else if (budgetVariance > 0) {
      status = 'under';
    } else {
      status = 'over';
    }

    return {
      daysElapsed,
      daysRemaining,
      totalSpent,
      averageDailyBudget,
      actualDailySpending,
      expectedSpendingToDate,
      budgetVariance,
      budgetUsagePercent,
      daysElapsedPercent,
      projectedTotal,
      remainingBudget,
      remainingPerDay,
      status,
      tripEnd,
    };
  }, [tripStartDate, tripDuration, totalBudget, expenses]);

  const getStatusConfig = (status: 'on-track' | 'over' | 'under') => {
    switch (status) {
      case 'on-track':
        return { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', label: 'On Track' };
      case 'under':
        return { icon: TrendingDown, color: 'text-primary', bg: 'bg-primary/10', label: 'Under Budget' };
      case 'over':
        return { icon: TrendingUp, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Over Budget' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Trip Settings Card */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Trip Settings
            </CardTitle>
            {!isEditing && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Duration (days)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 7"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Budget ({symbol})</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 1000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                {tripStartDate && tripDuration && totalBudget && (
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                )}
                <Button onClick={handleSave} disabled={!startDate || !duration || !budget}>
                  Save Settings
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Start Date</p>
                <p className="font-semibold">{tripStartDate ? format(parseISO(tripStartDate), 'MMM d, yyyy') : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-semibold">{tripDuration} days</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Budget</p>
                <p className="font-semibold">{symbol}{totalBudget?.toFixed(2)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <>
          {/* Budget Overview Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="glass-card p-3 sm:p-4">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Daily Budget</p>
              <p className="text-lg sm:text-xl font-bold text-primary">
                {symbol}{analysis.averageDailyBudget.toFixed(2)}
              </p>
            </Card>
            <Card className="glass-card p-3 sm:p-4">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Actual/Day</p>
              <p className="text-lg sm:text-xl font-bold">
                {symbol}{analysis.actualDailySpending.toFixed(2)}
              </p>
            </Card>
            <Card className={cn("p-3 sm:p-4", getStatusConfig(analysis.status).bg)}>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Status</p>
              <div className="flex items-center gap-1">
                {(() => {
                  const StatusIcon = getStatusConfig(analysis.status).icon;
                  return <StatusIcon className={cn("h-4 w-4", getStatusConfig(analysis.status).color)} />;
                })()}
                <span className={cn("text-sm sm:text-base font-semibold", getStatusConfig(analysis.status).color)}>
                  {getStatusConfig(analysis.status).label}
                </span>
              </div>
            </Card>
          </div>

          {/* Progress Section */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Budget Used</span>
                  <span className="font-medium">{analysis.budgetUsagePercent.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={Math.min(analysis.budgetUsagePercent, 100)} 
                  className={cn(
                    "h-3",
                    analysis.budgetUsagePercent > 100 && "[&>div]:bg-destructive"
                  )}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {symbol}{analysis.totalSpent.toFixed(2)} of {symbol}{totalBudget?.toFixed(2)}
                </p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Days Elapsed</span>
                  <span className="font-medium">Day {analysis.daysElapsed} of {tripDuration}</span>
                </div>
                <Progress value={analysis.daysElapsedPercent} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  {analysis.daysRemaining} days remaining
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Projection Section */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Projection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Projected Total</span>
                </div>
                <span className={cn(
                  "font-semibold",
                  analysis.projectedTotal > (totalBudget || 0) ? "text-destructive" : "text-success"
                )}>
                  {symbol}{analysis.projectedTotal.toFixed(2)}
                </span>
              </div>
              
              {analysis.daysRemaining > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">To Stay on Budget</span>
                  </div>
                  <span className={cn(
                    "font-semibold",
                    analysis.remainingPerDay < 0 ? "text-destructive" : "text-foreground"
                  )}>
                    {symbol}{Math.max(0, analysis.remainingPerDay).toFixed(2)}/day
                  </span>
                </div>
              )}

              {analysis.budgetVariance !== 0 && (
                <div className={cn(
                  "flex items-center gap-2 p-3 rounded-lg",
                  analysis.budgetVariance > 0 ? "bg-success/10" : "bg-destructive/10"
                )}>
                  {analysis.budgetVariance > 0 ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">
                        You're <span className="font-semibold text-success">{symbol}{Math.abs(analysis.budgetVariance).toFixed(2)}</span> under expected daily spend
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="text-sm">
                        You're <span className="font-semibold text-destructive">{symbol}{Math.abs(analysis.budgetVariance).toFixed(2)}</span> over expected daily spend
                      </span>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
