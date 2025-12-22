import { useState, useCallback, useEffect } from 'react';
import { Expense, TravelFund, ExpenseCategory } from '@/types/expense';

const STORAGE_KEY = 'travel-fund-data';

const generateId = () => Math.random().toString(36).substring(2, 9);

const defaultFund: TravelFund = {
  totalBalance: 0,
  lowBalanceThreshold: 100,
  expenses: [],
};

export function useTravelFund() {
  const [fund, setFund] = useState<TravelFund>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        expenses: parsed.expenses.map((e: any) => ({
          ...e,
          date: new Date(e.date),
        })),
      };
    }
    return defaultFund;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fund));
  }, [fund]);

  const currentBalance = fund.totalBalance - fund.expenses.reduce((sum, e) => sum + e.amount, 0);
  const isLowBalance = currentBalance <= fund.lowBalanceThreshold;
  const totalSpent = fund.expenses.reduce((sum, e) => sum + e.amount, 0);

  const addExpense = useCallback((
    amount: number,
    description: string,
    category: ExpenseCategory,
    paidBy: string
  ) => {
    const newExpense: Expense = {
      id: generateId(),
      amount,
      description,
      category,
      paidBy,
      date: new Date(),
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

  const topUpFund = useCallback((amount: number) => {
    setFund((prev) => ({
      ...prev,
      totalBalance: prev.totalBalance + amount,
    }));
  }, []);

  const setThreshold = useCallback((threshold: number) => {
    setFund((prev) => ({
      ...prev,
      lowBalanceThreshold: threshold,
    }));
  }, []);

  const resetFund = useCallback(() => {
    setFund(defaultFund);
  }, []);

  return {
    fund,
    currentBalance,
    isLowBalance,
    totalSpent,
    addExpense,
    removeExpense,
    topUpFund,
    setThreshold,
    resetFund,
  };
}
