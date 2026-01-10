import { Plane, Download, LogOut, LogIn, Cloud, CloudOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTravelFundHybrid } from '@/hooks/useTravelFundHybrid';
import { useAuth } from '@/hooks/useAuth';
import { useSharing } from '@/hooks/useSharing';
import { BalanceCard } from '@/components/BalanceCard';
import { ExpenseList } from '@/components/ExpenseList';
import { AddExpenseForm } from '@/components/AddExpenseForm';
import { TopUpDialog } from '@/components/TopUpDialog';
import { TopUpHistory } from '@/components/TopUpHistory';
import { SettingsDialog } from '@/components/SettingsDialog';
import { GroupMembersCard } from '@/components/GroupMembersCard';
import { BudgetAnalysis } from '@/components/BudgetAnalysis';
import { ShareFundDialog } from '@/components/ShareFundDialog';
import { SharedFundInvites } from '@/components/SharedFundInvites';
import { getCurrencySymbol } from '@/types/expense';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { exportToExcel } from '@/lib/exportToExcel';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const {
    fund,
    fundId,
    currentBalance,
    isLowBalance,
    totalSpent,
    pendingReimbursements,
    memberBalances,
    isLoading: dataLoading,
    isCloudMode,
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
  } = useTravelFundHybrid();

  const {
    members: sharedMembers,
    pendingInvites,
    isOwner,
    inviteMember,
    removeMember,
    acceptInvite,
    declineInvite,
  } = useSharing(fundId);

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

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen gradient-sunset">
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
          </div>
        </header>
        <main className="container px-3 sm:px-4 py-4 sm:py-6">
          <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

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
            {/* Cloud status indicator */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                  isCloudMode 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {isCloudMode ? (
                    <Cloud className="h-3.5 w-3.5" />
                  ) : (
                    <CloudOff className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">{isCloudMode ? 'Synced' : 'Local'}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {isCloudMode 
                  ? 'Your data is saved to the cloud' 
                  : 'Data is stored locally on this device'}
              </TooltipContent>
            </Tooltip>

            <Button 
              variant="outline" 
              size="icon"
              onClick={handleExport}
              title="Export to Excel"
              className="h-10 w-10 sm:h-10 sm:w-10"
            >
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            {isCloudMode && user && (
              <ShareFundDialog
                members={sharedMembers}
                isOwner={isOwner}
                onInviteMember={inviteMember}
                onRemoveMember={removeMember}
              />
            )}
            <SettingsDialog 
              threshold={fund.lowBalanceThreshold}
              currency={fund.currency}
              onSetThreshold={setThreshold}
              onSetCurrency={setCurrency}
              onReset={resetFund}
            />
            {user ? (
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleSignOut}
                title="Sign out"
                className="h-10 w-10 sm:h-10 sm:w-10"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="sm"
                onClick={handleSignIn}
                className="h-10 gap-1.5"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign in</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Guest mode banner */}
      {!user && (
        <div className="bg-primary/5 border-b border-primary/10">
          <div className="container px-3 sm:px-4 py-2">
            <div className="mx-auto max-w-2xl flex items-center justify-between gap-2">
              <p className="text-xs sm:text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Guest mode:</span> Data is saved locally.{' '}
                <span className="hidden sm:inline">Sign in to sync across devices.</span>
              </p>
              <Button 
                variant="link" 
                size="sm" 
                onClick={handleSignIn}
                className="text-primary h-auto p-0"
              >
                Create account
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container px-3 sm:px-4 py-4 sm:py-6 pb-20 sm:pb-24">
        <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
          {/* Pending Invites */}
          {isCloudMode && pendingInvites.length > 0 && (
            <SharedFundInvites
              invites={pendingInvites}
              onAccept={acceptInvite}
              onDecline={declineInvite}
            />
          )}

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
