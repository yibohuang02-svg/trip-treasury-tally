import { useState } from 'react';
import { Users, Plus, X, Check, MoreVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCurrencySymbol, CurrencyCode } from '@/types/expense';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface GroupMembersCardProps {
  members: string[];
  memberBalances: Record<string, number>;
  currency: CurrencyCode;
  onAddMember: (name: string) => void;
  onRemoveMember: (name: string) => void;
  onReimburseMember: (name: string) => void;
}

const VISIBLE_MEMBERS_COUNT = 3;

export function GroupMembersCard({ 
  members, 
  memberBalances, 
  currency,
  onAddMember, 
  onRemoveMember,
  onReimburseMember,
}: GroupMembersCardProps) {
  const [newMember, setNewMember] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
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

  const hasMoreMembers = members.length > VISIBLE_MEMBERS_COUNT;
  const visibleMembers = isExpanded ? members : members.slice(0, VISIBLE_MEMBERS_COUNT);
  const hiddenCount = members.length - VISIBLE_MEMBERS_COUNT;

  const TopToggleButton = () => (
    <button
      onClick={() => setIsExpanded(!isExpanded)}
      className="flex items-center gap-1 text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors font-medium touch-target-sm"
    >
      {isExpanded ? (
        <>
          <ChevronUp className="h-4 w-4" />
          Collapse list
        </>
      ) : (
        <>
          <ChevronDown className="h-4 w-4" />
          Show all
        </>
      )}
    </button>
  );

  const BottomToggleButton = () => (
    <button
      onClick={() => setIsExpanded(!isExpanded)}
      className="w-full flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors font-medium touch-target-sm"
    >
      {isExpanded ? (
        <>
          <ChevronUp className="h-4 w-4" />
          Collapse list
        </>
      ) : (
        <>
          <ChevronDown className="h-4 w-4" />
          Show all
          /* {/* Show {hiddenCount} more {hiddenCount === 1 ? 'member' : 'members'} */} */
        </>
      )}
    </button>
  );

  return (
    <div className="rounded-2xl bg-card p-4 sm:p-5 shadow-soft animate-fade-in">
      <div className="flex items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-card-foreground text-sm sm:text-base">Group Members</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {members.length} {members.length === 1 ? 'person' : 'people'} in this trip
            </p>
          </div>
        </div>
        {hasMoreMembers && <TopToggleButton />}
      </div>

      <div className="flex gap-2 mb-3 sm:mb-4">
        <Input
          placeholder="Add member name..."
          value={newMember}
          onChange={(e) => setNewMember(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-11 sm:h-10 text-base sm:text-sm"
        />
        <Button onClick={handleAdd} className="h-11 w-11 sm:h-10 sm:w-10 p-0">
          <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
        </Button>
      </div>

      {members.length === 0 ? (
        <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
          No members added yet
        </p>
      ) : (
        <div className="space-y-2">
          {visibleMembers.map((member) => {
            const owedAmount = memberBalances[member] || 0;
            const hasOwed = owedAmount > 0;

            return (
              <div 
                key={member}
                className="flex items-center justify-between rounded-xl bg-muted/50 p-3 sm:p-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs sm:text-sm font-semibold text-primary">
                      {member.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">{member}</p>
                    <p className={`text-xs sm:text-sm ${hasOwed ? 'text-warning font-medium' : 'text-muted-foreground'}`}>
                      {hasOwed ? `Owed ${symbol}${owedAmount.toFixed(2)}` : 'No pending'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 shrink-0">
                  {hasOwed && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleReimburseMember(member)}
                      className="h-9 px-2 sm:px-3 text-xs touch-target-sm"
                    >
                      <Check className="h-3.5 w-3.5 sm:mr-1" />
                      <span className="hidden sm:inline">Reimburse</span>
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground touch-target-sm"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover">
                      <DropdownMenuItem 
                        onClick={() => onRemoveMember(member)}
                        className="text-destructive focus:text-destructive"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
          
          {hasMoreMembers && <BottomToggleButton />}
        </div>
      )}
    </div>
  );
}
