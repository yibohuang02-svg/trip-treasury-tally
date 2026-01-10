import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Member {
  id: string;
  email: string;
  role: 'owner' | 'member';
  accepted: boolean;
}

interface Invite {
  id: string;
  fundOwnerEmail: string;
  invitedAt: Date;
}

export function useSharing(fundId: string | null) {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch members and pending invites
  const fetchSharingData = useCallback(async () => {
    if (!user || !fundId) {
      setIsLoading(false);
      return;
    }

    try {
      // Check if current user is owner
      const { data: fundData } = await supabase
        .from('travel_funds')
        .select('user_id')
        .eq('id', fundId)
        .single();

      const ownerUserId = fundData?.user_id;
      setIsOwner(ownerUserId === user.id);

      // Fetch members of this fund
      const { data: membersData, error: membersError } = await supabase
        .from('travel_fund_members')
        .select('id, user_id, role, invited_email, accepted_at')
        .eq('travel_fund_id', fundId);

      if (membersError) throw membersError;

      // Get owner's email
      const ownerEmail = user.email || 'Owner';

      const membersList: Member[] = [
        // Add owner first
        {
          id: 'owner',
          email: isOwner ? ownerEmail : 'Fund Owner',
          role: 'owner',
          accepted: true,
        },
        // Add other members
        ...(membersData || []).map((m) => ({
          id: m.id,
          email: m.invited_email || 'Unknown',
          role: m.role as 'owner' | 'member',
          accepted: m.accepted_at !== null,
        })),
      ];

      setMembers(membersList);

      // Fetch pending invites for current user
      const { data: invitesData, error: invitesError } = await supabase
        .from('travel_fund_members')
        .select(`
          id,
          invited_at,
          travel_fund_id,
          travel_funds!inner (
            user_id
          )
        `)
        .eq('user_id', user.id)
        .is('accepted_at', null);

      if (invitesError) throw invitesError;

      // For now, we'll just show the fund ID since getting owner email requires more complex queries
      const invitesList: Invite[] = (invitesData || []).map((inv) => ({
        id: inv.id,
        fundOwnerEmail: 'Travel Fund Invitation',
        invitedAt: new Date(inv.invited_at),
      }));

      setPendingInvites(invitesList);
    } catch (error) {
      console.error('Error fetching sharing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, fundId, isOwner]);

  useEffect(() => {
    fetchSharingData();
  }, [fetchSharingData]);

  // Invite a member by email
  const inviteMember = useCallback(async (email: string): Promise<boolean> => {
    if (!user || !fundId) return false;

    try {
      // Check if user with this email exists
      // Note: We can't query auth.users directly, so we'll check profiles or create a pending invite
      
      // First check if already invited
      const { data: existing } = await supabase
        .from('travel_fund_members')
        .select('id')
        .eq('travel_fund_id', fundId)
        .eq('invited_email', email)
        .maybeSingle();

      if (existing) {
        toast.error('This email has already been invited');
        return false;
      }

      // Look up user by checking profiles (we need to match by email from auth)
      // Since we can't query auth.users, we'll create an invite that gets linked when the user signs in
      
      // For now, create a pending invite with just the email
      // When a user with that email signs in/up, we can link them
      const { error } = await supabase
        .from('travel_fund_members')
        .insert({
          travel_fund_id: fundId,
          user_id: user.id, // Temporary - will be updated when invited user signs in
          invited_email: email,
          role: 'member',
        });

      if (error) {
        console.error('Error inviting member:', error);
        toast.error('Failed to send invitation');
        return false;
      }

      await fetchSharingData();
      return true;
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error('Failed to send invitation');
      return false;
    }
  }, [user, fundId, fetchSharingData]);

  // Remove a member
  const removeMember = useCallback(async (memberId: string) => {
    if (!user || !fundId) return;

    try {
      const { error } = await supabase
        .from('travel_fund_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      await fetchSharingData();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  }, [user, fundId, fetchSharingData]);

  // Accept an invite
  const acceptInvite = useCallback(async (inviteId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('travel_fund_members')
        .update({ 
          accepted_at: new Date().toISOString(),
          user_id: user.id 
        })
        .eq('id', inviteId);

      if (error) throw error;

      toast.success('You joined the travel fund!');
      await fetchSharingData();
    } catch (error) {
      console.error('Error accepting invite:', error);
      toast.error('Failed to accept invitation');
    }
  }, [user, fetchSharingData]);

  // Decline an invite
  const declineInvite = useCallback(async (inviteId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('travel_fund_members')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;

      toast.success('Invitation declined');
      await fetchSharingData();
    } catch (error) {
      console.error('Error declining invite:', error);
      toast.error('Failed to decline invitation');
    }
  }, [user, fetchSharingData]);

  return {
    members,
    pendingInvites,
    isOwner,
    isLoading,
    inviteMember,
    removeMember,
    acceptInvite,
    declineInvite,
    refetch: fetchSharingData,
  };
}
