import { useState } from 'react';
import { Users, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface GroupMembersCardProps {
  members: string[];
  onAddMember: (name: string) => void;
  onRemoveMember: (name: string) => void;
}

export function GroupMembersCard({ members, onAddMember, onRemoveMember }: GroupMembersCardProps) {
  const [newMember, setNewMember] = useState('');

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
        <div className="flex flex-wrap gap-2">
          {members.map((member) => (
            <div
              key={member}
              className="group flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-foreground"
            >
              <span>{member}</span>
              <button
                onClick={() => onRemoveMember(member)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
