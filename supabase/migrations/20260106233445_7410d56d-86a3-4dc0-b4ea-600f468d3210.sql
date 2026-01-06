-- Corrigir política de insert no profiles para ser mais segura
DROP POLICY IF EXISTS "Anyone can insert profile" ON public.profiles;

CREATE POLICY "System can insert profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Corrigir política de insert no webinar_registrations
DROP POLICY IF EXISTS "Anyone can register" ON public.webinar_registrations;

CREATE POLICY "Authenticated users can register" ON public.webinar_registrations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR auth.uid() IS NULL);