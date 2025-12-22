import { Plane } from 'lucide-react';
import { useTravelFund } from '@/hooks/useTravelFund';
import { BalanceCard } from '@/components/BalanceCard';
import { ExpenseList } from '@/components/ExpenseList';
import { AddExpenseForm } from '@/components/AddExpenseForm';
import { TopUpDialog } from '@/components/TopUpDialog';
import { SettingsDialog } from '@/components/SettingsDialog';
import { GroupMembersCard } from '@/components/GroupMembersCard';

const Index = () => {
  const {
    fund,
    currentBalance,
    isLowBalance,
    totalSpent,
    pendingReimbursements,
    addExpense,
    removeExpense,
    reimburseExpense,
    topUpFund,
    setThreshold,
    addGroupMember,
    removeGroupMember,
    resetFund,
  } = useTravelFund();

  return (
    <div className="min-h-screen gradient-sunset">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-warm shadow-soft">
              <Plane className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">TravelFund</h1>
              <p className="text-xs text-muted-foreground">Group expense tracker</p>
            </div>
          </div>
          <SettingsDialog 
            threshold={fund.lowBalanceThreshold}
            onSetThreshold={setThreshold}
            onReset={resetFund}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6 pb-24">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Balance Card */}
          <BalanceCard
            currentBalance={currentBalance}
            totalSpent={totalSpent}
            isLowBalance={isLowBalance}
            threshold={fund.lowBalanceThreshold}
          />

          {/* Pending Reimbursements Alert */}
          {pendingReimbursements.length > 0 && (
            <div className="rounded-xl bg-warning/10 border border-warning/20 p-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💸</span>
                <div>
                  <p className="font-medium text-warning">
                    {pendingReimbursements.length} pending reimbursement{pendingReimbursements.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total: ${pendingReimbursements.reduce((sum, e) => sum + e.amount, 0).toFixed(2)} owed to members
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Group Members */}
          <GroupMembersCard
            members={fund.groupMembers}
            onAddMember={addGroupMember}
            onRemoveMember={removeGroupMember}
          />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <AddExpenseForm onAdd={addExpense} groupMembers={fund.groupMembers} />
            <TopUpDialog onTopUp={topUpFund} currentBalance={currentBalance} />
          </div>

          {/* Expenses Section */}
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Recent Expenses
              </h2>
              {fund.expenses.length > 0 && (
                <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                  {fund.expenses.length} {fund.expenses.length === 1 ? 'expense' : 'expenses'}
                </span>
              )}
            </div>
            <ExpenseList 
              expenses={fund.expenses} 
              onRemove={removeExpense} 
              onReimburse={reimburseExpense}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
