CREATE TABLE public.master_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.master_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can check master status"
ON public.master_accounts
FOR SELECT
TO authenticated
USING (true);

INSERT INTO public.master_accounts (email) VALUES ('spineda2014.123@gmail.com');