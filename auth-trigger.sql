-- 1. Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, nome_completo, nif, documento_url)
  VALUES (
    NEW.id,
    CAST(NEW.raw_user_meta_data->>'role' AS public.user_role),
    NEW.raw_user_meta_data->>'nome_completo',
    NEW.raw_user_meta_data->>'nif',
    NEW.raw_user_meta_data->>'documento_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger on the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
