-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL DEFAULT '',
    last_name VARCHAR(100) NOT NULL DEFAULT '',
    phone VARCHAR(20) NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_profile_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Backfill existing users with empty profiles
INSERT INTO profiles (user_id, first_name, last_name, phone)
SELECT id, '', '', ''
FROM users
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE profiles.user_id = users.id
);
