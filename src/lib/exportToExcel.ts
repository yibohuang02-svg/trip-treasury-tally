import * as XLSX from 'xlsx';
import { Expense, TopUp, categoryConfig, getCurrencySymbol, CurrencyCode } from '@/types/expense';

interface ExportData {
  expenses: Expense[];
  topUps: TopUp[];
  currency: CurrencyCode;
  totalBalance: number;
  groupMembers: string[];
}

export function exportToExcel(data: ExportData) {
  const { expenses, topUps, currency, totalBalance, groupMembers } = data;
  const symbol = getCurrencySymbol(currency);
  
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Format date for Excel
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Summary sheet
  const summaryData = [
    ['Travel Fund Summary'],
    [],
    ['Currency', currency],
    ['Total Balance', `${symbol}${totalBalance.toFixed(2)}`],
    ['Total Top-ups', `${symbol}${topUps.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}`],
    ['Total Expenses', `${symbol}${expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}`],
    ['Number of Expenses', expenses.length],
    ['Number of Top-ups', topUps.length],
    [],
    ['Group Members'],
    ...groupMembers.map(m => [m]),
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // Top-ups sheet
  const topUpHeaders = ['Date', 'Amount', 'Added By', 'Note'];
  const topUpRows = topUps.map(t => [
    formatDate(t.date),
    t.amount,
    t.addedBy,
    t.note || '',
  ]);
  const topUpSheet = XLSX.utils.aoa_to_sheet([topUpHeaders, ...topUpRows]);
  
  // Set column widths
  topUpSheet['!cols'] = [
    { wch: 20 },
    { wch: 12 },
    { wch: 15 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, topUpSheet, 'Top-ups');

  // Expenses sheet
  const expenseHeaders = ['Date', 'Description', 'Category', 'Amount', 'Paid By', 'Payment Source', 'Reimbursed', 'Reimbursed At'];
  const expenseRows = expenses.map(e => [
    formatDate(e.date),
    e.description,
    categoryConfig[e.category].label,
    e.amount,
    e.paidBy,
    e.paymentSource === 'pool' ? 'Pool' : 'Individual',
    e.isReimbursed ? 'Yes' : 'No',
    e.reimbursedAt ? formatDate(e.reimbursedAt) : '',
  ]);
  const expenseSheet = XLSX.utils.aoa_to_sheet([expenseHeaders, ...expenseRows]);
  
  // Set column widths
  expenseSheet['!cols'] = [
    { wch: 20 },
    { wch: 30 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 14 },
    { wch: 10 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, expenseSheet, 'Expenses');

  // All Transactions sheet (combined timeline)
  const allTransactions = [
    ...topUps.map(t => ({
      date: t.date,
      type: 'Top-up' as const,
      description: t.note || 'Fund Top-up',
      amount: t.amount,
      person: t.addedBy,
      isCredit: true,
    })),
    ...expenses.map(e => ({
      date: e.date,
      type: 'Expense' as const,
      description: e.description,
      amount: e.amount,
      person: e.paidBy,
      isCredit: false,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const transactionHeaders = ['Date', 'Type', 'Description', 'Credit', 'Debit', 'Person'];
  const transactionRows = allTransactions.map(t => [
    formatDate(t.date),
    t.type,
    t.description,
    t.isCredit ? t.amount : '',
    t.isCredit ? '' : t.amount,
    t.person,
  ]);
  const transactionSheet = XLSX.utils.aoa_to_sheet([transactionHeaders, ...transactionRows]);
  
  transactionSheet['!cols'] = [
    { wch: 20 },
    { wch: 10 },
    { wch: 30 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(wb, transactionSheet, 'All Transactions');

  // Generate filename with date
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `travel-fund-${dateStr}.xlsx`;

  // Download
  XLSX.writeFile(wb, filename);
}