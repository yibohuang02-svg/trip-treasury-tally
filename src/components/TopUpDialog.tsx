import { useState } from 'react';
import { Wallet, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCurrencySymbol, CurrencyCode } from '@/types/expense';
import { toast } from 'sonner';

interface TopUpDialogProps {
  onTopUp: (amount: number, addedBy: string, note?: string) => void;
  currentBalance: number;
  currency: CurrencyCode;
  groupMembers: string[];
}

const quickAmounts = [50, 200, 500, 1000];

export function TopUpDialog({ onTopUp, currentBalance, currency, groupMembers }: TopUpDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [addedBy, setAddedBy] = useState('');
  const [note, setNote] = useState('');
  const symbol = getCurrencySymbol(currency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!addedBy.trim()) {
      toast.error('Please select who added the funds');
      return;
    }

    onTopUp(parsedAmount, addedBy.trim(), note.trim() || undefined);
    toast.success(`Added ${symbol}${parsedAmount.toFixed(2)} to the fund!`);
    setAmount('');
    setAddedBy('');
    setNote('');
    setOpen(false);
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="success" size="lg" className="w-full h-12 sm:h-11 text-sm sm:text-base">
          <Wallet className="h-5 w-5" />
          <span>Top Up</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md mx-3 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg sm:text-xl">Top Up Travel Fund</DialogTitle>
        </DialogHeader>
        
        <div className="mt-3 sm:mt-4 rounded-xl bg-muted p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Current Balance</div>
          <div className="font-display text-xl sm:text-2xl font-bold text-foreground">
            {symbol}{currentBalance.toFixed(2)}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 mt-3 sm:mt-4">
          <div className="space-y-2">
            <Label htmlFor="topup-amount" className="text-sm">Amount to add ({symbol})</Label>
            <Input
              id="topup-amount"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 text-lg font-display"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Quick amounts</Label>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((qa) => (
                <Button
                  key={qa}
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickAmount(qa)}
                  className="h-11 text-sm px-2"
                >
                  {symbol}{qa}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="added-by" className="text-sm">Added by</Label>
            <Select value={addedBy} onValueChange={setAddedBy}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select who added the funds" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {groupMembers.length > 0 ? (
                  groupMembers.map((member) => (
                    <SelectItem key={member} value={member} className="py-3">
                      {member}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="unknown" className="py-3">Unknown</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm">Note (optional)</Label>
            <Input
              id="note"
              placeholder="e.g., Day 1 contribution"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          <Button type="submit" variant="success" className="w-full h-12 text-base">
            <Plus className="h-5 w-5" />
            Add to Fund
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}