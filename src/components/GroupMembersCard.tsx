import { useState } from 'react';
import { Users, Plus, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getCurrencySymbol, CurrencyCode } from '@/types/expense';
import { toast } from 'sonner';

interface GroupMembersCardProps {
  members: string[];
  memberBalances: Record<string, number>;
  currency: CurrencyCode;
  onAddMember: (name: string) => void;
  onRemoveMember: (name: string) => void;
  onReimburseMember: (name: string) => void;
}

export function GroupMembersCard({ 
  members, 
  memberBalances, 
  currency,
  onAddMember, 
  onRemoveMember,
  onReimburseMember,
}: GroupMembersCardProps) {
  const [newMember, setNewMember] = useState('');
  const symbol = getCurrencySymbol(currency);

  const handleAdd = () => {
    const name = newMember.trim();
    if (!name) {
      toast.error('Please enter a name');
      return;
    }
    if (members.includes(name)) {
      toast.error('This member already exists');
      return;
    }
    onAddMember(name);
    setNewMember('');
    toast.success(`${name} added to the group`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleReimburseMember = (member: string) => {
    const amount = memberBalances[member] || 0;
    onReimburseMember(member);
    toast.success(`Reimbursed ${symbol}${amount.toFixed(2)} to ${member}`);
  };

  return (
    <div className="rounded-2xl bg-card p-5 shadow-soft animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-card-foreground">Group Members</h3>
          <p className="text-sm text-muted-foreground">
            {members.length} {members.length === 1 ? 'person' : 'people'} in this trip
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Add member name..."
          value={newMember}
          onChange={(e) => setNewMember(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-10"
        />
        <Button onClick={handleAdd} size="sm" className="h-10 px-3">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No members added yet
        </p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Member</TableHead>
                <TableHead className="font-semibold text-right">Owed</TableHead>
                <TableHead className="font-semibold text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const owedAmount = memberBalances[member] || 0;
                const hasOwed = owedAmount > 0;

                return (
                  <TableRow key={member}>
                    <TableCell className="font-medium">{member}</TableCell>
                    <TableCell className={`text-right font-display ${hasOwed ? 'text-warning font-semibold' : 'text-muted-foreground'}`}>
                      {hasOwed ? `${symbol}${owedAmount.toFixed(2)}` : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {hasOwed && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleReimburseMember(member)}
                            className="h-7 px-2 text-xs"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Reimburse
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveMember(member)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}