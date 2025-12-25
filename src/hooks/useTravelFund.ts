import { useState, useCallback, useEffect } from 'react';
import { Expense, TravelFund, ExpenseCategory, PaymentSource, CurrencyCode, TopUp } from '@/types/expense';

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

export function useTravelFund() {
  const [fund, setFund] = useState<TravelFund>(() => {
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
        expenses: parsed.expenses.map((e: any) => ({
          ...e,
          date: new Date(e.date),
          reimbursedAt: e.reimbursedAt ? new Date(e.reimbursedAt) : undefined,
          paymentSource: e.paymentSource || 'pool',
          isReimbursed: e.isReimbursed || false,
        })),
      };
    }
    return defaultFund;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fund));
  }, [fund]);

  // Only count pool expenses and reimbursed individual expenses
  const spentFromPool = fund.expenses.reduce((sum, e) => {
    if (e.paymentSource === 'pool') return sum + e.amount;
    if (e.paymentSource === 'individual' && e.isReimbursed) return sum + e.amount;
    return sum;
  }, 0);

  const currentBalance = fund.totalBalance - spentFromPool;
  const isLowBalance = currentBalance <= fund.lowBalanceThreshold;
  const totalSpent = fund.expenses.reduce((sum, e) => sum + e.amount, 0);

  const pendingReimbursements = fund.expenses.filter(
    (e) => e.paymentSource === 'individual' && !e.isReimbursed
  );

  const addExpense = useCallback((
    amount: number,
    description: string,
    category: ExpenseCategory,
    paidBy: string,
    paymentSource: PaymentSource
  ) => {
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

    setFund((prev) => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
    }));
  }, []);

  const removeExpense = useCallback((id: string) => {
    setFund((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  }, []);

  const reimburseExpense = useCallback((id: string) => {
    setFund((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) =>
        e.id === id
          ? { ...e, isReimbursed: true, reimbursedAt: new Date() }
          : e
      ),
    }));
  }, []);

  const reimburseMember = useCallback((memberName: string) => {
    setFund((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) =>
        e.paymentSource === 'individual' && e.paidBy === memberName && !e.isReimbursed
          ? { ...e, isReimbursed: true, reimbursedAt: new Date() }
          : e
      ),
    }));
  }, []);

  const topUpFund = useCallback((amount: number, addedBy: string = 'Unknown', note?: string) => {
    const newTopUp: TopUp = {
      id: generateId(),
      amount,
      date: new Date(),
      addedBy,
      note,
    };

    setFund((prev) => ({
      ...prev,
      totalBalance: prev.totalBalance + amount,
      topUps: [newTopUp, ...prev.topUps],
    }));
  }, []);

  const setThreshold = useCallback((threshold: number) => {
    setFund((prev) => ({
      ...prev,
      lowBalanceThreshold: threshold,
    }));
  }, []);

  const addGroupMember = useCallback((name: string) => {
    setFund((prev) => ({
      ...prev,
      groupMembers: [...prev.groupMembers, name],
    }));
  }, []);

  const removeGroupMember = useCallback((name: string) => {
    setFund((prev) => ({
      ...prev,
      groupMembers: prev.groupMembers.filter((m) => m !== name),
    }));
  }, []);

  const setCurrency = useCallback((currency: CurrencyCode) => {
    setFund((prev) => ({
      ...prev,
      currency,
    }));
  }, []);

  const resetFund = useCallback(() => {
    setFund(defaultFund);
  }, []);

  const setTripSettings = useCallback((startDate: string, duration: number, budget: number) => {
    setFund((prev) => ({
      ...prev,
      tripStartDate: startDate,
      tripDuration: duration,
      totalBudget: budget,
    }));
  }, []);

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
