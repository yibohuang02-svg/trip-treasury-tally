import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ExpenseCategory, PaymentSource, categoryConfig, getCurrencySymbol, CurrencyCode } from '@/types/expense';
import { toast } from 'sonner';

interface AddExpenseFormProps {
  onAdd: (amount: number, description: string, category: ExpenseCategory, paidBy: string, paymentSource: PaymentSource) => void;
  groupMembers: string[];
  currency: CurrencyCode;
}

export function AddExpenseForm({ onAdd, groupMembers, currency }: AddExpenseFormProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [paidBy, setPaidBy] = useState('');
  const [paymentSource, setPaymentSource] = useState<PaymentSource>('pool');
  const symbol = getCurrencySymbol(currency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (!paidBy.trim()) {
      toast.error('Please select or enter who paid');
      return;
    }

    onAdd(parsedAmount, description.trim(), category, paidBy.trim(), paymentSource);
    toast.success('Expense added successfully!');
    
    // Reset form
    setAmount('');
    setDescription('');
    setCategory('food');
    setPaidBy('');
    setPaymentSource('pool');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gradient" size="lg" className="w-full sm:w-auto">
          <Plus className="h-5 w-5" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Add New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({symbol})</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 text-lg font-display"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What was this expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Payment Source</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentSource('pool')}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all ${
                  paymentSource === 'pool'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <span className="text-xl">💰</span>
                <span className="text-sm font-medium">Pool Money</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentSource('individual')}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all ${
                  paymentSource === 'individual'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <span className="text-xl">👤</span>
                <span className="text-sm font-medium">Paid by Individual</span>
                <span className="text-xs text-muted-foreground">(Needs reimbursement)</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidBy">Paid by</Label>
            {groupMembers.length > 0 ? (
              <Select value={paidBy} onValueChange={setPaidBy}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select who paid" />
                </SelectTrigger>
                <SelectContent>
                  {groupMembers.map((member) => (
                    <SelectItem key={member} value={member}>
                      {member}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="paidBy"
                placeholder="Who paid for this?"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="h-12"
              />
            )}
          </div>

          <Button type="submit" variant="gradient" className="w-full h-12 text-base">
            <Plus className="h-5 w-5" />
            Add Expense
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
