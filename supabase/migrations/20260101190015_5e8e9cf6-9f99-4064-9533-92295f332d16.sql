-- Add INSERT and UPDATE policies for badges table for admins
CREATE POLICY "Admins can insert badges" 
ON public.badges 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update badges" 
ON public.badges 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete badges" 
ON public.badges 
FOR DELETE 
USING (is_admin());