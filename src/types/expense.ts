export type ExpenseCategory = 
  | 'food' 
  | 'transport' 
  | 'accommodation' 
  | 'activities' 
  | 'shopping' 
  | 'other';

export type PaymentSource = 'pool' | 'individual';

export type CurrencyCode = 'USD' | 'CNY' | 'EUR' | 'GBP' | 'JPY' | 'SGD' | 'AUD' | 'CAD' | 'THB' | 'MYR' | 'KRW';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
];

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

export interface TopUp {
  id: string;
  amount: number;
  date: Date;
  addedBy: string;
  note?: string;
}

export interface TravelFund {
  totalBalance: number;
  lowBalanceThreshold: number;
  expenses: Expense[];
  topUps: TopUp[];
  groupMembers: string[];
  currency: CurrencyCode;
  tripStartDate?: string;
  tripDuration?: number;
  totalBudget?: number;
}

export const categoryConfig: Record<ExpenseCategory, { label: string; icon: string; color: string }> = {
  food: { label: 'Food & Drinks', icon: '🍽️', color: 'hsl(16 85% 60%)' },
  transport: { label: 'Transport', icon: '🚗', color: 'hsl(200 70% 50%)' },
  accommodation: { label: 'Accommodation', icon: '🏨', color: 'hsl(260 60% 55%)' },
  activities: { label: 'Activities', icon: '🎯', color: 'hsl(145 55% 42%)' },
  shopping: { label: 'Shopping', icon: '🛍️', color: 'hsl(330 70% 55%)' },
  other: { label: 'Other', icon: '📌', color: 'hsl(35 80% 55%)' },
};

export const getCurrencySymbol = (code: CurrencyCode): string => {
  return currencies.find(c => c.code === code)?.symbol || '$';
};
