import { Check, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Invite {
  id: string;
  fundOwnerEmail: string;
  invitedAt: Date;
}

interface SharedFundInvitesProps {
  invites: Invite[];
  onAccept: (inviteId: string) => Promise<void>;
  onDecline: (inviteId: string) => Promise<void>;
}

export function SharedFundInvites({ invites, onAccept, onDecline }: SharedFundInvitesProps) {
  if (invites.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-primary" />
          Pending Invitations
        </CardTitle>
        <CardDescription>
          You've been invited to join these travel funds
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center justify-between rounded-lg bg-background p-3"
          >
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">
                From: {invite.fundOwnerEmail}
              </p>
              <p className="text-xs text-muted-foreground">
                Invited {invite.invitedAt.toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="success"
                size="sm"
                onClick={() => onAccept(invite.id)}
                className="h-8 gap-1"
              >
                <Check className="h-3.5 w-3.5" />
                Accept
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDecline(invite.id)}
                className="h-8 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
