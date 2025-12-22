export type ExpenseCategory = 
  | 'food' 
  | 'transport' 
  | 'accommodation' 
  | 'activities' 
  | 'shopping' 
  | 'other';

export type PaymentSource = 'pool' | 'individual';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  paidBy: string;
  date: Date;
  paymentSource: PaymentSource;
  isReimbursed: boolean;
  reimbursedAt?: Date;
}

export interface TravelFund {
  totalBalance: number;
  lowBalanceThreshold: number;
  expenses: Expense[];
  groupMembers: string[];
}

export const categoryConfig: Record<ExpenseCategory, { label: string; icon: string; color: string }> = {
  food: { label: 'Food & Drinks', icon: '🍽️', color: 'hsl(16 85% 60%)' },
  transport: { label: 'Transport', icon: '🚗', color: 'hsl(200 70% 50%)' },
  accommodation: { label: 'Accommodation', icon: '🏨', color: 'hsl(260 60% 55%)' },
  activities: { label: 'Activities', icon: '🎯', color: 'hsl(145 55% 42%)' },
  shopping: { label: 'Shopping', icon: '🛍️', color: 'hsl(330 70% 55%)' },
  other: { label: 'Other', icon: '📌', color: 'hsl(35 80% 55%)' },
};
