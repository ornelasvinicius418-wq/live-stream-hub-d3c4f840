-- Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Criar tabela de perfis
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can insert profile" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Criar tabela de roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função para verificar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Criar tabela de webinars
CREATE TABLE public.webinars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  video_url TEXT,
  cover_image TEXT,
  scheduled_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT false,
  primary_color TEXT DEFAULT '#22c55e',
  secondary_color TEXT DEFAULT '#1f2937',
  background_color TEXT DEFAULT '#111827',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.webinars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active webinars" ON public.webinars
  FOR SELECT USING (is_active = true OR auth.uid() = admin_id);

CREATE POLICY "Admins can manage own webinars" ON public.webinars
  FOR ALL USING (public.has_role(auth.uid(), 'admin') AND auth.uid() = admin_id);

-- Criar tabela de registros de espectadores
CREATE TABLE public.webinar_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id UUID REFERENCES public.webinars(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.webinar_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register" ON public.webinar_registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view registrations" ON public.webinar_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.webinars w 
      WHERE w.id = webinar_id AND w.admin_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own registration" ON public.webinar_registrations
  FOR SELECT USING (email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

-- Criar tabela de comentários automáticos
CREATE TABLE public.scheduled_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id UUID REFERENCES public.webinars(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  message TEXT NOT NULL,
  trigger_time_seconds INTEGER NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scheduled comments" ON public.scheduled_comments
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage scheduled comments" ON public.scheduled_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.webinars w 
      WHERE w.id = webinar_id AND w.admin_id = auth.uid()
    )
  );

-- Criar tabela de mensagens do chat (enviadas por usuários)
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id UUID REFERENCES public.webinars(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_from_admin BOOLEAN DEFAULT false,
  visible_to_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Usuários veem: suas próprias mensagens + mensagens do admin
CREATE POLICY "Users view own and admin messages" ON public.chat_messages
  FOR SELECT USING (
    user_id = auth.uid() 
    OR is_from_admin = true 
    OR visible_to_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.webinars w 
      WHERE w.id = webinar_id AND w.admin_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.webinars w 
      WHERE w.id = webinar_id AND w.admin_id = auth.uid()
    )
  );

-- Criar tabela de ofertas
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id UUID REFERENCES public.webinars(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  original_price DECIMAL(10,2),
  discount_price DECIMAL(10,2) NOT NULL,
  installments INTEGER DEFAULT 1,
  payment_url TEXT NOT NULL,
  button_text TEXT DEFAULT 'QUERO GARANTIR MINHA VAGA',
  trigger_time_seconds INTEGER,
  is_visible BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible offers" ON public.offers
  FOR SELECT USING (
    is_visible = true 
    OR EXISTS (
      SELECT 1 FROM public.webinars w 
      WHERE w.id = webinar_id AND w.admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage offers" ON public.offers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.webinars w 
      WHERE w.id = webinar_id AND w.admin_id = auth.uid()
    )
  );

-- Criar tabela de ganhadores
CREATE TABLE public.winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id UUID REFERENCES public.webinars(id) ON DELETE CASCADE NOT NULL,
  registration_id UUID REFERENCES public.webinar_registrations(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Winners can view own win" ON public.winners
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.webinar_registrations r 
      WHERE r.id = registration_id AND r.email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Admins can manage winners" ON public.winners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.webinars w 
      WHERE w.id = webinar_id AND w.admin_id = auth.uid()
    )
  );

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'name', 'Usuário'), new.email);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Habilitar realtime para chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;