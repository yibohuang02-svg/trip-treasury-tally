import { useState } from 'react';
import { Wallet, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const symbol = getCurrencySymbol(currency);

  const allSelected = groupMembers.length > 0 && selectedMembers.length === groupMembers.length;
  const totalAmount = parseFloat(amount || '0') * selectedMembers.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error('Please select at least one member');
      return;
    }

    // Create a top-up record for each selected member
    selectedMembers.forEach((member) => {
      onTopUp(parsedAmount, member, note.trim() || undefined);
    });

    const total = parsedAmount * selectedMembers.length;
    toast.success(`Added ${symbol}${total.toFixed(2)} to the fund from ${selectedMembers.length} member${selectedMembers.length > 1 ? 's' : ''}!`);
    setAmount('');
    setSelectedMembers([]);
    setNote('');
    setOpen(false);
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handleMemberToggle = (member: string) => {
    setSelectedMembers((prev) =>
      prev.includes(member)
        ? prev.filter((m) => m !== member)
        : [...prev, member]
    );
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers([...groupMembers]);
    }
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
            <Label htmlFor="topup-amount" className="text-sm">Amount per person ({symbol})</Label>
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
            <div className="flex items-center justify-between">
              <Label className="text-sm">Select members</Label>
              {groupMembers.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-8 text-xs text-primary hover:text-primary/80"
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto rounded-lg border border-border p-2">
              {groupMembers.length > 0 ? (
                groupMembers.map((member) => (
                  <label
                    key={member}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedMembers.includes(member)}
                      onCheckedChange={() => handleMemberToggle(member)}
                    />
                    <span className="text-sm">{member}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-muted-foreground p-2">No members added yet</p>
              )}
            </div>
            {selectedMembers.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedMembers.length} member{selectedMembers.length > 1 ? 's' : ''} selected
              </p>
            )}
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

          {selectedMembers.length > 0 && parseFloat(amount) > 0 && (
            <div className="rounded-xl bg-success/10 border border-success/20 p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-success">Total to add</div>
              <div className="font-display text-xl sm:text-2xl font-bold text-success">
                {symbol}{totalAmount.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {symbol}{parseFloat(amount).toFixed(2)} × {selectedMembers.length} member{selectedMembers.length > 1 ? 's' : ''}
              </div>
            </div>
          )}

          <Button type="submit" variant="success" className="w-full h-12 text-base">
            <Plus className="h-5 w-5" />
            Add to Fund
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}