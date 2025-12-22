import { useState } from 'react';
import { Settings, AlertTriangle, RotateCcw } from 'lucide-react';
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
import { toast } from 'sonner';

interface SettingsDialogProps {
  threshold: number;
  onSetThreshold: (threshold: number) => void;
  onReset: () => void;
}

export function SettingsDialog({ threshold, onSetThreshold, onReset }: SettingsDialogProps) {
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
              You'll see a warning when your balance falls below this amount.
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
