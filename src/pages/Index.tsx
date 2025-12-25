import { Plane, Download } from 'lucide-react';
import { useTravelFund } from '@/hooks/useTravelFund';
import { BalanceCard } from '@/components/BalanceCard';
import { ExpenseList } from '@/components/ExpenseList';
import { AddExpenseForm } from '@/components/AddExpenseForm';
import { TopUpDialog } from '@/components/TopUpDialog';
import { TopUpHistory } from '@/components/TopUpHistory';
import { SettingsDialog } from '@/components/SettingsDialog';
import { GroupMembersCard } from '@/components/GroupMembersCard';
import { BudgetAnalysis } from '@/components/BudgetAnalysis';
import { getCurrencySymbol } from '@/types/expense';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { exportToExcel } from '@/lib/exportToExcel';
import { toast } from 'sonner';

const Index = () => {
  const {
    fund,
    currentBalance,
    isLowBalance,
    totalSpent,
    pendingReimbursements,
    memberBalances,
    addExpense,
    removeExpense,
    reimburseExpense,
    reimburseMember,
    topUpFund,
    setThreshold,
    addGroupMember,
    removeGroupMember,
    setCurrency,
    resetFund,
    setTripSettings,
  } = useTravelFund();

  const symbol = getCurrencySymbol(fund.currency);

  const handleExport = () => {
    exportToExcel({
      expenses: fund.expenses,
      topUps: fund.topUps,
      currency: fund.currency,
      totalBalance: currentBalance,
      groupMembers: fund.groupMembers,
    });
    toast.success('Excel file downloaded!');
  };

  return (
    <div className="min-h-screen gradient-sunset">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg safe-area-top">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl gradient-warm shadow-soft">
              <Plane className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-base sm:text-lg font-bold text-foreground">TravelFund</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden xs:block">Group expense tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleExport}
              title="Export to Excel"
              className="h-10 w-10 sm:h-10 sm:w-10"
            >
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <SettingsDialog 
              threshold={fund.lowBalanceThreshold}
              currency={fund.currency}
              onSetThreshold={setThreshold}
              onSetCurrency={setCurrency}
              onReset={resetFund}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-3 sm:px-4 py-4 sm:py-6 pb-20 sm:pb-24">
        <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
          {/* Balance Card */}
          <BalanceCard
            currentBalance={currentBalance}
            totalSpent={totalSpent}
            isLowBalance={isLowBalance}
            threshold={fund.lowBalanceThreshold}
            currency={fund.currency}
          />

          {/* Pending Reimbursements Alert */}
          {pendingReimbursements.length > 0 && (
            <div className="rounded-xl bg-warning/10 border border-warning/20 p-3 sm:p-4 animate-fade-in">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl">💸</span>
                <div className="min-w-0">
                  <p className="font-medium text-warning text-sm sm:text-base">
                    {pendingReimbursements.length} pending reimbursement{pendingReimbursements.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    Total: {symbol}{pendingReimbursements.reduce((sum, e) => sum + e.amount, 0).toFixed(2)} owed
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Group Members */}
          <GroupMembersCard
            members={fund.groupMembers}
            memberBalances={memberBalances}
            currency={fund.currency}
            onAddMember={addGroupMember}
            onRemoveMember={removeGroupMember}
            onReimburseMember={reimburseMember}
          />

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <AddExpenseForm onAdd={addExpense} groupMembers={fund.groupMembers} currency={fund.currency} />
            <TopUpDialog 
              onTopUp={topUpFund} 
              currentBalance={currentBalance} 
              currency={fund.currency}
              groupMembers={fund.groupMembers}
            />
          </div>

          {/* Transactions Section with Tabs */}
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Tabs defaultValue="expenses" className="w-full">
              <TabsList className="w-full mb-3 sm:mb-4 h-11 sm:h-10">
                <TabsTrigger value="expenses" className="flex-1 text-xs sm:text-sm h-9 sm:h-8">
                  Expenses ({fund.expenses.length})
                </TabsTrigger>
                <TabsTrigger value="topups" className="flex-1 text-xs sm:text-sm h-9 sm:h-8">
                  Top-ups ({fund.topUps.length})
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex-1 text-xs sm:text-sm h-9 sm:h-8">
                  Analysis
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="expenses">
                <ExpenseList 
                  expenses={fund.expenses} 
                  currency={fund.currency}
                  onRemove={removeExpense} 
                  onReimburse={reimburseExpense}
                />
              </TabsContent>
              
              <TabsContent value="topups">
                <TopUpHistory 
                  topUps={fund.topUps}
                  currency={fund.currency}
                />
              </TabsContent>

              <TabsContent value="analysis">
                <BudgetAnalysis
                  expenses={fund.expenses}
                  currency={fund.currency}
                  tripStartDate={fund.tripStartDate}
                  tripDuration={fund.tripDuration}
                  totalBudget={fund.totalBudget}
                  onSetTripSettings={setTripSettings}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;