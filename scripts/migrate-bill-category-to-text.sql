-- Migration: Change bills.category from bill_category enum to text
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Step 1: Change the column type from enum to text
ALTER TABLE bills ALTER COLUMN category TYPE text;

-- Step 2: Drop the default that still references the old enum
ALTER TABLE bills ALTER COLUMN category DROP DEFAULT;

-- Step 3: Drop the old enum type (no longer needed)
DROP TYPE IF EXISTS bill_category;
