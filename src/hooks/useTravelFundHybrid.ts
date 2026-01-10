import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Expense, TravelFund, ExpenseCategory, PaymentSource, CurrencyCode, TopUp } from '@/types/expense';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

const STORAGE_KEY = 'travel-fund-data';
const generateId = () => Math.random().toString(36).substring(2, 9);

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

// Helper to load from localStorage
const loadFromStorage = (): TravelFund => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    return {
      ...parsed,
      groupMembers: parsed.groupMembers || [],
      currency: parsed.currency || 'USD',
      tripStartDate: parsed.tripStartDate,
      tripDuration: parsed.tripDuration,
      totalBudget: parsed.totalBudget,
      topUps: (parsed.topUps || []).map((t: any) => ({
        ...t,
        date: new Date(t.date),
      })),
      expenses: (parsed.expenses || []).map((e: any) => ({
        ...e,
        date: new Date(e.date),
        reimbursedAt: e.reimbursedAt ? new Date(e.reimbursedAt) : undefined,
        paymentSource: e.paymentSource || 'pool',
        isReimbursed: e.isReimbursed || false,
      })),
    };
  }
  return defaultFund;
};

export function useTravelFundHybrid() {
  const { user } = useAuth();
  const [fund, setFund] = useState<TravelFund>(defaultFund);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloudMode, setIsCloudMode] = useState(false);

  // Save to localStorage (only in guest mode)
  const saveToStorage = useCallback((data: TravelFund) => {
    if (!isCloudMode) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [isCloudMode]);

  const [fundId, setFundId] = useState<string | null>(null);

  // Fetch data from database
  const fetchFromDb = useCallback(async () => {
    if (!user) return null;

    try {
      const { data: fundData, error: fundError } = await supabase
        .from('travel_funds')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fundError) throw fundError;

      // Store the fund ID for sharing
      if (fundData?.id) {
        setFundId(fundData.id);
      }

      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (expensesError) throw expensesError;

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

      return {
        totalBalance: fundData ? Number(fundData.total_balance) : 0,
        lowBalanceThreshold: fundData ? Number(fundData.low_balance_threshold) : 100,
        expenses,
        topUps,
        groupMembers: fundData?.group_members || [],
        currency: (fundData?.currency as CurrencyCode) || 'USD',
        tripStartDate: fundData?.trip_start_date || undefined,
        tripDuration: fundData?.trip_duration || undefined,
        totalBudget: fundData?.total_budget ? Number(fundData.total_budget) : undefined,
      };
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  }, [user]);

  // Migrate local data to cloud
  const migrateToCloud = useCallback(async () => {
    if (!user) return false;

    const localData = loadFromStorage();
    
    // Check if local data has anything to migrate
    const hasLocalData = localData.expenses.length > 0 || 
                         localData.topUps.length > 0 || 
                         localData.totalBalance > 0;
    
    if (!hasLocalData) return true;

    try {
      // Update travel fund settings
      await supabase
        .from('travel_funds')
        .update({
          total_balance: localData.totalBalance,
          low_balance_threshold: localData.lowBalanceThreshold,
          currency: localData.currency,
          group_members: localData.groupMembers,
          trip_start_date: localData.tripStartDate || null,
          trip_duration: localData.tripDuration || null,
          total_budget: localData.totalBudget || null,
        })
        .eq('user_id', user.id);

      // Insert expenses
      if (localData.expenses.length > 0) {
        const expensesToInsert = localData.expenses.map((e) => ({
          user_id: user.id,
          amount: e.amount,
          description: e.description,
          category: e.category,
          paid_by: e.paidBy,
          date: e.date.toISOString(),
          payment_source: e.paymentSource,
          is_reimbursed: e.isReimbursed,
          reimbursed_at: e.reimbursedAt?.toISOString() || null,
        }));
        
        await supabase.from('expenses').insert(expensesToInsert);
      }

      // Insert top-ups
      if (localData.topUps.length > 0) {
        const topUpsToInsert = localData.topUps.map((t) => ({
          user_id: user.id,
          amount: t.amount,
          date: t.date.toISOString(),
          added_by: t.addedBy,
          note: t.note || null,
        }));
        
        await supabase.from('top_ups').insert(topUpsToInsert);
      }

      // Clear local storage after successful migration
      localStorage.removeItem(STORAGE_KEY);
      toast.success('Your local data has been synced to the cloud!');
      return true;
    } catch (error) {
      console.error('Error migrating data:', error);
      toast.error('Failed to sync local data');
      return false;
    }
  }, [user]);

  // Initialize data
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      
      if (user) {
        // User is logged in - use cloud mode
        setIsCloudMode(true);
        
        // Check if there's local data to migrate
        const localData = loadFromStorage();
        const hasLocalData = localData.expenses.length > 0 || 
                             localData.topUps.length > 0 || 
                             localData.totalBalance > 0;
        
        if (hasLocalData) {
          await migrateToCloud();
        }
        
        // Fetch from database
        const dbData = await fetchFromDb();
        if (dbData) {
          setFund(dbData);
        }
      } else {
        // Guest mode - use localStorage
        setIsCloudMode(false);
        setFund(loadFromStorage());
      }
      
      setIsLoading(false);
    };

    init();
  }, [user, fetchFromDb, migrateToCloud]);

  // Calculate derived values
  const totalExpenses = fund.expenses.reduce((sum, e) => sum + e.amount, 0);
  const currentBalance = fund.totalBalance - totalExpenses;
  const isLowBalance = currentBalance <= fund.lowBalanceThreshold;
  const totalSpent = fund.expenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingReimbursements = fund.expenses.filter(
    (e) => e.paymentSource === 'individual' && !e.isReimbursed
  );
  const memberBalances = fund.groupMembers.reduce((acc, member) => {
    const owedAmount = fund.expenses
      .filter((e) => e.paymentSource === 'individual' && e.paidBy === member && !e.isReimbursed)
      .reduce((sum, e) => sum + e.amount, 0);
    acc[member] = owedAmount;
    return acc;
  }, {} as Record<string, number>);

  // Add expense
  const addExpense = useCallback(async (
    amount: number,
    description: string,
    category: ExpenseCategory,
    paidBy: string,
    paymentSource: PaymentSource
  ) => {
    if (isCloudMode && user) {
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
    } else {
      const newExpense: Expense = {
        id: generateId(),
        amount,
        description,
        category,
        paidBy,
        date: new Date(),
        paymentSource,
        isReimbursed: false,
      };

      setFund((prev) => {
        const updated = {
          ...prev,
          expenses: [newExpense, ...prev.expenses],
        };
        saveToStorage(updated);
        return updated;
      });
    }
  }, [isCloudMode, user, saveToStorage]);

  // Remove expense
  const removeExpense = useCallback(async (id: string) => {
    if (isCloudMode) {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) {
        toast.error('Failed to remove expense');
        return;
      }
    }

    setFund((prev) => {
      const updated = {
        ...prev,
        expenses: prev.expenses.filter((e) => e.id !== id),
      };
      saveToStorage(updated);
      return updated;
    });
  }, [isCloudMode, saveToStorage]);

  // Reimburse expense
  const reimburseExpense = useCallback(async (id: string) => {
    if (isCloudMode) {
      const { error } = await supabase
        .from('expenses')
        .update({ is_reimbursed: true, reimbursed_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        toast.error('Failed to reimburse expense');
        return;
      }
    }

    setFund((prev) => {
      const updated = {
        ...prev,
        expenses: prev.expenses.map((e) =>
          e.id === id ? { ...e, isReimbursed: true, reimbursedAt: new Date() } : e
        ),
      };
      saveToStorage(updated);
      return updated;
    });
  }, [isCloudMode, saveToStorage]);

  // Reimburse member
  const reimburseMember = useCallback(async (memberName: string) => {
    if (isCloudMode && user) {
      const { error } = await supabase
        .from('expenses')
        .update({ is_reimbursed: true, reimbursed_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('paid_by', memberName)
        .eq('payment_source', 'individual')
        .eq('is_reimbursed', false);

      if (error) {
        toast.error('Failed to reimburse member');
        return;
      }
    }

    setFund((prev) => {
      const updated = {
        ...prev,
        expenses: prev.expenses.map((e) =>
          e.paymentSource === 'individual' && e.paidBy === memberName && !e.isReimbursed
            ? { ...e, isReimbursed: true, reimbursedAt: new Date() }
            : e
        ),
      };
      saveToStorage(updated);
      return updated;
    });
  }, [isCloudMode, user, saveToStorage]);

  // Top up fund
  const topUpFund = useCallback(async (amount: number, addedBy: string = 'Unknown', note?: string) => {
    if (isCloudMode && user) {
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
        toast.error('Failed to add top-up');
        return;
      }

      const { error: updateError } = await supabase
        .from('travel_funds')
        .update({ total_balance: fund.totalBalance + amount })
        .eq('user_id', user.id);

      if (updateError) {
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
    } else {
      const newTopUp: TopUp = {
        id: generateId(),
        amount,
        date: new Date(),
        addedBy,
        note,
      };

      setFund((prev) => {
        const updated = {
          ...prev,
          totalBalance: prev.totalBalance + amount,
          topUps: [newTopUp, ...prev.topUps],
        };
        saveToStorage(updated);
        return updated;
      });
    }
  }, [isCloudMode, user, fund.totalBalance, saveToStorage]);

  // Set threshold
  const setThreshold = useCallback(async (threshold: number) => {
    if (isCloudMode && user) {
      const { error } = await supabase
        .from('travel_funds')
        .update({ low_balance_threshold: threshold })
        .eq('user_id', user.id);

      if (error) {
        toast.error('Failed to set threshold');
        return;
      }
    }

    setFund((prev) => {
      const updated = { ...prev, lowBalanceThreshold: threshold };
      saveToStorage(updated);
      return updated;
    });
  }, [isCloudMode, user, saveToStorage]);

  // Add group member
  const addGroupMember = useCallback(async (name: string) => {
    const newMembers = [...fund.groupMembers, name];
    
    if (isCloudMode && user) {
      const { error } = await supabase
        .from('travel_funds')
        .update({ group_members: newMembers })
        .eq('user_id', user.id);

      if (error) {
        toast.error('Failed to add member');
        return;
      }
    }

    setFund((prev) => {
      const updated = { ...prev, groupMembers: newMembers };
      saveToStorage(updated);
      return updated;
    });
  }, [isCloudMode, user, fund.groupMembers, saveToStorage]);

  // Remove group member
  const removeGroupMember = useCallback(async (name: string) => {
    const newMembers = fund.groupMembers.filter((m) => m !== name);
    
    if (isCloudMode && user) {
      const { error } = await supabase
        .from('travel_funds')
        .update({ group_members: newMembers })
        .eq('user_id', user.id);

      if (error) {
        toast.error('Failed to remove member');
        return;
      }
    }

    setFund((prev) => {
      const updated = { ...prev, groupMembers: newMembers };
      saveToStorage(updated);
      return updated;
    });
  }, [isCloudMode, user, fund.groupMembers, saveToStorage]);

  // Set currency
  const setCurrency = useCallback(async (currency: CurrencyCode) => {
    if (isCloudMode && user) {
      const { error } = await supabase
        .from('travel_funds')
        .update({ currency })
        .eq('user_id', user.id);

      if (error) {
        toast.error('Failed to set currency');
        return;
      }
    }

    setFund((prev) => {
      const updated = { ...prev, currency };
      saveToStorage(updated);
      return updated;
    });
  }, [isCloudMode, user, saveToStorage]);

  // Reset fund
  const resetFund = useCallback(async () => {
    if (isCloudMode && user) {
      await supabase.from('expenses').delete().eq('user_id', user.id);
      await supabase.from('top_ups').delete().eq('user_id', user.id);
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
    }

    setFund(defaultFund);
    saveToStorage(defaultFund);
    toast.success('Fund reset successfully');
  }, [isCloudMode, user, saveToStorage]);

  // Set trip settings
  const setTripSettings = useCallback(async (startDate: string, duration: number, budget: number) => {
    if (isCloudMode && user) {
      const { error } = await supabase
        .from('travel_funds')
        .update({
          trip_start_date: startDate,
          trip_duration: duration,
          total_budget: budget,
        })
        .eq('user_id', user.id);

      if (error) {
        toast.error('Failed to save trip settings');
        return;
      }
    }

    setFund((prev) => {
      const updated = {
        ...prev,
        tripStartDate: startDate,
        tripDuration: duration,
        totalBudget: budget,
      };
      saveToStorage(updated);
      return updated;
    });
  }, [isCloudMode, user, saveToStorage]);

  return {
    fund,
    fundId,
    currentBalance,
    isLowBalance,
    totalSpent,
    pendingReimbursements,
    memberBalances,
    isLoading,
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
  };
}
