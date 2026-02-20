-- Creates the test database used by pytest
SELECT 'CREATE DATABASE domu_test_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'domu_test_db')\gexec
