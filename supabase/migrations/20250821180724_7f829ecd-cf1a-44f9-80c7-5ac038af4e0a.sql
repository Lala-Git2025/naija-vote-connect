-- Update races to populate state information based on their names
UPDATE races 
SET state = CASE 
  WHEN name LIKE '%Anambra%' THEN 'anambra'
  WHEN name LIKE '%Ekiti%' THEN 'ekiti' 
  WHEN name LIKE '%Osun%' THEN 'osun'
  WHEN name LIKE '%FCT%' THEN 'fct'
  WHEN name LIKE '%Lagos%' THEN 'lagos'
  WHEN name LIKE '%Kano%' THEN 'kano'
  ELSE 'nigeria'
END
WHERE state IS NULL;