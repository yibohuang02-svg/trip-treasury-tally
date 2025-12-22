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
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Currency
            </Label>
            <Select value={currency} onValueChange={(v) => handleCurrencyChange(v as CurrencyCode)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{c.symbol}</span>
                      <span>{c.name}</span>
                      <span className="text-muted-foreground">({c.code})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="threshold" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Low Balance Alert Threshold
            </Label>
            <Input
              id="threshold"
              type="number"
              step="1"
              min="0"
              placeholder="100"
              value={newThreshold}
              onChange={(e) => setNewThreshold(e.target.value)}
              className="h-12"
            />
            <p className="text-sm text-muted-foreground">
              You'll see a warning when your balance falls below {currencySymbol}{threshold}.
            </p>
          </div>

          <Button onClick={handleSave} variant="default" className="w-full">
            Save Settings
          </Button>

          <div className="border-t pt-6">
            <div className="space-y-3">
              <Label className="text-destructive flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Danger Zone
              </Label>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    Reset All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your expenses and reset the fund balance to zero. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
