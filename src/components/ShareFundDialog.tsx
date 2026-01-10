import { useState } from 'react';
import { Share2, UserPlus, X, Check, Clock, Crown, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Member {
  id: string;
  email: string;
  role: 'owner' | 'member';
  accepted: boolean;
}

interface ShareFundDialogProps {
  members: Member[];
  isOwner: boolean;
  onInviteMember: (email: string) => Promise<boolean>;
  onRemoveMember: (memberId: string) => Promise<void>;
}

export function ShareFundDialog({ 
  members, 
  isOwner,
  onInviteMember, 
  onRemoveMember 
}: ShareFundDialogProps) {
  const [email, setEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsInviting(true);
    try {
      const success = await onInviteMember(email.trim().toLowerCase());
      if (success) {
        setEmail('');
        toast.success(`Invitation sent to ${email}`);
      }
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (member: Member) => {
    await onRemoveMember(member.id);
    toast.success(`Removed ${member.email} from the fund`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInvite();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Share Travel Fund
          </DialogTitle>
          <DialogDescription>
            Invite others to track expenses together. They'll be able to view and add expenses.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Invite form */}
          {isOwner && (
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address..."
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isInviting}
                className="h-11 sm:h-10"
              />
              <Button 
                onClick={handleInvite} 
                disabled={isInviting}
                className="h-11 sm:h-10 gap-1.5"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Invite</span>
              </Button>
            </div>
          )}

          {/* Members list */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Members ({members.length})
            </p>
            
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No members yet. Invite someone to share!
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        {member.role === 'owner' ? (
                          <Crown className="h-4 w-4 text-primary" />
                        ) : (
                          <span className="text-sm font-semibold text-primary">
                            {member.email.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{member.email}</p>
                        <div className="flex items-center gap-1.5">
                          {member.role === 'owner' ? (
                            <span className="text-xs text-primary font-medium">Owner</span>
                          ) : member.accepted ? (
                            <span className="text-xs text-success flex items-center gap-1">
                              <Check className="h-3 w-3" /> Joined
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isOwner && member.role !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(member)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {!isOwner && (
            <p className="text-xs text-muted-foreground text-center">
              Only the fund owner can invite or remove members.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
