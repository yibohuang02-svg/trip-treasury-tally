import { useState } from 'react';
import { Settings, AlertTriangle, RotateCcw, Globe } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CurrencyCode, currencies, getCurrencySymbol } from '@/types/expense';
import { toast } from 'sonner';

interface SettingsDialogProps {
  threshold: number;
  currency: CurrencyCode;
  onSetThreshold: (threshold: number) => void;
  onSetCurrency: (currency: CurrencyCode) => void;
  onReset: () => void;
}

export function SettingsDialog({ threshold, currency, onSetThreshold, onSetCurrency, onReset }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [newThreshold, setNewThreshold] = useState(threshold.toString());

  const handleSave = () => {
    const parsed = parseFloat(newThreshold);
    if (isNaN(parsed) || parsed < 0) {
      toast.error('Please enter a valid threshold amount');
      return;
    }
    onSetThreshold(parsed);
    toast.success('Settings saved!');
    setOpen(false);
  };

  const handleReset = () => {
    onReset();
    toast.success('All data has been reset');
    setOpen(false);
  };

  const handleCurrencyChange = (value: CurrencyCode) => {
    onSetCurrency(value);
    toast.success(`Currency changed to ${value}`);
  };

  const currencySymbol = getCurrencySymbol(currency);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-10 sm:w-10">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md mx-3 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg sm:text-xl">Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 sm:space-y-6 mt-3 sm:mt-4">
          <div className="space-y-2 sm:space-y-3">
            <Label className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-primary" />
              Currency
            </Label>
            <Select value={currency} onValueChange={(v) => handleCurrencyChange(v as CurrencyCode)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="bg-popover max-h-[40vh]">
                {currencies.map((c) => (
                  <SelectItem key={c.code} value={c.code} className="py-3">
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{c.symbol}</span>
                      <span>{c.name}</span>
                      <span className="text-muted-foreground text-xs">({c.code})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="threshold" className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Low Balance Alert Threshold
            </Label>
            <Input
              id="threshold"
              type="number"
              step="1"
              min="0"
              inputMode="numeric"
              placeholder="100"
              value={newThreshold}
              onChange={(e) => setNewThreshold(e.target.value)}
              className="h-12 text-base"
            />
            <p className="text-xs sm:text-sm text-muted-foreground">
              You'll see a warning when your balance falls below {currencySymbol}{threshold}.
            </p>
          </div>

          <Button onClick={handleSave} variant="default" className="w-full h-12 text-base">
            Save Settings
          </Button>

          <div className="border-t pt-5 sm:pt-6">
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-destructive flex items-center gap-2 text-sm">
                <RotateCcw className="h-4 w-4" />
                Danger Zone
              </Label>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full h-12 text-base">
                    Reset All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="mx-3">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-base sm:text-lg">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm">
                      This will permanently delete all your expenses and reset the fund balance to zero. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                    <AlertDialogCancel className="h-11 sm:h-10">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset} className="h-11 sm:h-10 bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Yes, reset everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}