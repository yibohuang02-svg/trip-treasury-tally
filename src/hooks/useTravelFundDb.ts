import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Expense, TravelFund, ExpenseCategory, PaymentSource, CurrencyCode, TopUp } from '@/types/expense';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

const defaultFund: TravelFund = {
  totalBalance: 0,
  lowBalanceThreshold: 100,
  expenses: [],
  topUps: [],
  groupMembers: [],
  currency: 'USD',
  tripStartDate: undefined,
  tripDuration: undefined,
  totalBudget: undefined,
};

export function useTravelFundDb() {
  const { user } = useAuth();
  const [fund, setFund] = useState<TravelFund>(defaultFund);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data from database
  const fetchData = useCallback(async () => {
    if (!user) {
      setFund(defaultFund);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch travel fund settings
      const { data: fundData, error: fundError } = await supabase
        .from('travel_funds')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fundError) throw fundError;

      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (expensesError) throw expensesError;

      // Fetch top-ups
      const { data: topUpsData, error: topUpsError } = await supabase
        .from('top_ups')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (topUpsError) throw topUpsError;

      const expenses: Expense[] = (expensesData || []).map((e) => ({
        id: e.id,
        amount: Number(e.amount),
        description: e.description,
        category: e.category as ExpenseCategory,
        paidBy: e.paid_by,
        date: new Date(e.date),
        paymentSource: e.payment_source as PaymentSource,
        isReimbursed: e.is_reimbursed,
        reimbursedAt: e.reimbursed_at ? new Date(e.reimbursed_at) : undefined,
      }));

      const topUps: TopUp[] = (topUpsData || []).map((t) => ({
        id: t.id,
        amount: Number(t.amount),
        date: new Date(t.date),
        addedBy: t.added_by,
        note: t.note || undefined,
      }));

      setFund({
        totalBalance: fundData ? Number(fundData.total_balance) : 0,
        lowBalanceThreshold: fundData ? Number(fundData.low_balance_threshold) : 100,
        expenses,
        topUps,
        groupMembers: fundData?.group_members || [],
        currency: (fundData?.currency as CurrencyCode) || 'USD',
        tripStartDate: fundData?.trip_start_date || undefined,
        tripDuration: fundData?.trip_duration || undefined,
        totalBudget: fundData?.total_budget ? Number(fundData.total_budget) : undefined,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate total of all expenses regardless of reimbursement status
  const totalExpenses = fund.expenses.reduce((sum, e) => sum + e.amount, 0);

  const currentBalance = fund.totalBalance - totalExpenses;
  const isLowBalance = currentBalance <= fund.lowBalanceThreshold;
  const totalSpent = fund.expenses.reduce((sum, e) => sum + e.amount, 0);

  const pendingReimbursements = fund.expenses.filter(
    (e) => e.paymentSource === 'individual' && !e.isReimbursed
  );

  const addExpense = useCallback(async (
    amount: number,
    description: string,
    category: ExpenseCategory,
    paidBy: string,
    paymentSource: PaymentSource
  ) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        amount,
        description,
        category,
        paid_by: paidBy,
        payment_source: paymentSource,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
      return;
    }

    const newExpense: Expense = {
      id: data.id,
      amount: Number(data.amount),
      description: data.description,
      category: data.category as ExpenseCategory,
      paidBy: data.paid_by,
      date: new Date(data.date),
      paymentSource: data.payment_source as PaymentSource,
      isReimbursed: data.is_reimbursed,
    };

    setFund((prev) => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
    }));
  }, [user]);

  const removeExpense = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing expense:', error);
      toast.error('Failed to remove expense');
      return;
    }

    setFund((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  }, []);

  const reimburseExpense = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .update({ is_reimbursed: true, reimbursed_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error reimbursing expense:', error);
      toast.error('Failed to reimburse expense');
      return;
    }

    setFund((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) =>
        e.id === id
          ? { ...e, isReimbursed: true, reimbursedAt: new Date() }
          : e
      ),
    }));
  }, []);

  const reimburseMember = useCallback(async (memberName: string) => {
    if (!user) return;

    const expensesToReimburse = fund.expenses.filter(
      (e) => e.paymentSource === 'individual' && e.paidBy === memberName && !e.isReimbursed
    );

    const { error } = await supabase
      .from('expenses')
      .update({ is_reimbursed: true, reimbursed_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('paid_by', memberName)
      .eq('payment_source', 'individual')
      .eq('is_reimbursed', false);

    if (error) {
      console.error('Error reimbursing member:', error);
      toast.error('Failed to reimburse member');
      return;
    }

    setFund((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) =>
        e.paymentSource === 'individual' && e.paidBy === memberName && !e.isReimbursed
          ? { ...e, isReimbursed: true, reimbursedAt: new Date() }
          : e
      ),
    }));
  }, [user, fund.expenses]);

  const topUpFund = useCallback(async (amount: number, addedBy: string = 'Unknown', note?: string) => {
    if (!user) return;

    // Insert top-up record
    const { data: topUpData, error: topUpError } = await supabase
      .from('top_ups')
      .insert({
        user_id: user.id,
        amount,
        added_by: addedBy,
        note,
      })
      .select()
      .single();

    if (topUpError) {
      console.error('Error adding top-up:', topUpError);
      toast.error('Failed to add top-up');
      return;
    }

    // Update total balance
    const { error: updateError } = await supabase
      .from('travel_funds')
      .update({ total_balance: fund.totalBalance + amount })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating balance:', updateError);
      toast.error('Failed to update balance');
      return;
    }

    const newTopUp: TopUp = {
      id: topUpData.id,
      amount: Number(topUpData.amount),
      date: new Date(topUpData.date),
      addedBy: topUpData.added_by,
      note: topUpData.note || undefined,
    };

    setFund((prev) => ({
      ...prev,
      totalBalance: prev.totalBalance + amount,
      topUps: [newTopUp, ...prev.topUps],
    }));
  }, [user, fund.totalBalance]);

  const setThreshold = useCallback(async (threshold: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('travel_funds')
      .update({ low_balance_threshold: threshold })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error setting threshold:', error);
      toast.error('Failed to set threshold');
      return;
    }

    setFund((prev) => ({
      ...prev,
      lowBalanceThreshold: threshold,
    }));
  }, [user]);

  const addGroupMember = useCallback(async (name: string) => {
    if (!user) return;

    const newMembers = [...fund.groupMembers, name];
    
    const { error } = await supabase
      .from('travel_funds')
      .update({ group_members: newMembers })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member');
      return;
    }

    setFund((prev) => ({
      ...prev,
      groupMembers: newMembers,
    }));
  }, [user, fund.groupMembers]);

  const removeGroupMember = useCallback(async (name: string) => {
    if (!user) return;

    const newMembers = fund.groupMembers.filter((m) => m !== name);
    
    const { error } = await supabase
      .from('travel_funds')
      .update({ group_members: newMembers })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
      return;
    }

    setFund((prev) => ({
      ...prev,
      groupMembers: newMembers,
    }));
  }, [user, fund.groupMembers]);

  const setCurrency = useCallback(async (currency: CurrencyCode) => {
    if (!user) return;

    const { error } = await supabase
      .from('travel_funds')
      .update({ currency })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error setting currency:', error);
      toast.error('Failed to set currency');
      return;
    }

    setFund((prev) => ({
      ...prev,
      currency,
    }));
  }, [user]);

  const resetFund = useCallback(async () => {
    if (!user) return;

    // Delete all expenses
    await supabase.from('expenses').delete().eq('user_id', user.id);
    
    // Delete all top-ups
    await supabase.from('top_ups').delete().eq('user_id', user.id);
    
    // Reset travel fund settings
    await supabase
      .from('travel_funds')
      .update({
        total_balance: 0,
        low_balance_threshold: 100,
        currency: 'USD',
        group_members: [],
        trip_start_date: null,
        trip_duration: null,
        total_budget: null,
      })
      .eq('user_id', user.id);

    setFund(defaultFund);
    toast.success('Fund reset successfully');
  }, [user]);

  const setTripSettings = useCallback(async (startDate: string, duration: number, budget: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('travel_funds')
      .update({
        trip_start_date: startDate,
        trip_duration: duration,
        total_budget: budget,
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error setting trip settings:', error);
      toast.error('Failed to save trip settings');
      return;
    }

    setFund((prev) => ({
      ...prev,
      tripStartDate: startDate,
      tripDuration: duration,
      totalBudget: budget,
    }));
  }, [user]);

  // Calculate amount owed to each member
  const memberBalances = fund.groupMembers.reduce((acc, member) => {
    const owedAmount = fund.expenses
      .filter((e) => e.paymentSource === 'individual' && e.paidBy === member && !e.isReimbursed)
      .reduce((sum, e) => sum + e.amount, 0);
    acc[member] = owedAmount;
    return acc;
  }, {} as Record<string, number>);

  return {
    fund,
    currentBalance,
    isLowBalance,
    totalSpent,
    pendingReimbursements,
    memberBalances,
    isLoading,
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
  };
}
