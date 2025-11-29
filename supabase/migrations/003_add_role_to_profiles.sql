-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Add constraint to validate role values
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('user', 'admin'));

-- Create index for faster role queries
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- Update existing profiles to have 'user' role if null
UPDATE profiles SET role = 'user' WHERE role IS NULL;

