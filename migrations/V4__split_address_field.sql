-- Split address field into street and address2
-- Rename existing address column to street
ALTER TABLE properties RENAME COLUMN address TO street;

-- Add new optional address2 column
ALTER TABLE properties ADD COLUMN address2 VARCHAR(100);
