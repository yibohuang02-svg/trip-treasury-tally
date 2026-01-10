-- Create travel_fund_members table for sharing
CREATE TABLE public.travel_fund_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  travel_fund_id UUID NOT NULL REFERENCES public.travel_funds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  invited_email TEXT,
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(travel_fund_id, user_id)
);

-- Enable RLS
ALTER TABLE public.travel_fund_members ENABLE ROW LEVEL SECURITY;

-- Policies for travel_fund_members
CREATE POLICY "Users can view memberships they belong to"
ON public.travel_fund_members
FOR SELECT
USING (
  user_id = auth.uid() OR 
  travel_fund_id IN (SELECT id FROM public.travel_funds WHERE user_id = auth.uid())
);

CREATE POLICY "Fund owners can manage memberships"
ON public.travel_fund_members
FOR INSERT
WITH CHECK (
  travel_fund_id IN (SELECT id FROM public.travel_funds WHERE user_id = auth.uid())
);

CREATE POLICY "Fund owners can update memberships"
ON public.travel_fund_members
FOR UPDATE
USING (
  travel_fund_id IN (SELECT id FROM public.travel_funds WHERE user_id = auth.uid())
);

CREATE POLICY "Fund owners can delete memberships"
ON public.travel_fund_members
FOR DELETE
USING (
  travel_fund_id IN (SELECT id FROM public.travel_funds WHERE user_id = auth.uid())
);

-- Create function to check if user has access to a travel fund
CREATE OR REPLACE FUNCTION public.has_travel_fund_access(_user_id UUID, _fund_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.travel_funds WHERE id = _fund_id AND user_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.travel_fund_members 
    WHERE travel_fund_id = _fund_id AND user_id = _user_id AND accepted_at IS NOT NULL
  )
$$;

-- Create function to check if user owns a travel fund
CREATE OR REPLACE FUNCTION public.is_travel_fund_owner(_user_id UUID, _fund_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.travel_funds WHERE id = _fund_id AND user_id = _user_id
  )
$$;

-- Update travel_funds policies to allow shared access
DROP POLICY IF EXISTS "Users can view their own travel fund" ON public.travel_funds;
CREATE POLICY "Users can view travel funds they have access to"
ON public.travel_funds
FOR SELECT
USING (
  user_id = auth.uid() OR 
  id IN (SELECT travel_fund_id FROM public.travel_fund_members WHERE user_id = auth.uid() AND accepted_at IS NOT NULL)
);

-- Update expenses policies to allow shared access
DROP POLICY IF EXISTS "Users can view their own expenses" ON public.expenses;
CREATE POLICY "Users can view expenses for accessible funds"
ON public.expenses
FOR SELECT
USING (
  user_id = auth.uid() OR 
  user_id IN (
    SELECT tf.user_id FROM public.travel_funds tf
    JOIN public.travel_fund_members tfm ON tf.id = tfm.travel_fund_id
    WHERE tfm.user_id = auth.uid() AND tfm.accepted_at IS NOT NULL
  )
);

DROP POLICY IF EXISTS "Users can insert their own expenses" ON public.expenses;
CREATE POLICY "Users can insert expenses for accessible funds"
ON public.expenses
FOR INSERT
WITH CHECK (
  user_id = auth.uid() OR 
  user_id IN (
    SELECT tf.user_id FROM public.travel_funds tf
    JOIN public.travel_fund_members tfm ON tf.id = tfm.travel_fund_id
    WHERE tfm.user_id = auth.uid() AND tfm.accepted_at IS NOT NULL
  )
);

-- Update top_ups policies to allow shared access
DROP POLICY IF EXISTS "Users can view their own top ups" ON public.top_ups;
CREATE POLICY "Users can view top ups for accessible funds"
ON public.top_ups
FOR SELECT
USING (
  user_id = auth.uid() OR 
  user_id IN (
    SELECT tf.user_id FROM public.travel_funds tf
    JOIN public.travel_fund_members tfm ON tf.id = tfm.travel_fund_id
    WHERE tfm.user_id = auth.uid() AND tfm.accepted_at IS NOT NULL
  )
);

DROP POLICY IF EXISTS "Users can insert their own top ups" ON public.top_ups;
CREATE POLICY "Users can insert top ups for accessible funds"
ON public.top_ups
FOR INSERT
WITH CHECK (
  user_id = auth.uid() OR 
  user_id IN (
    SELECT tf.user_id FROM public.travel_funds tf
    JOIN public.travel_fund_members tfm ON tf.id = tfm.travel_fund_id
    WHERE tfm.user_id = auth.uid() AND tfm.accepted_at IS NOT NULL
  )
);