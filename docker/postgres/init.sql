-- Create test database for CI/testing
SELECT 'CREATE DATABASE airona_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'airona_test')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE airona_test TO airona;
