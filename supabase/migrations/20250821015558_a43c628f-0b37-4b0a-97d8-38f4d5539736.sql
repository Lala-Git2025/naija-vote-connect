-- Insert sample election data
INSERT INTO public.elections (name, type, election_date, status, description, states) 
SELECT * FROM (VALUES
  ('2027 Presidential Election', 'presidential', '2027-02-25'::date, 'upcoming', 'Presidential Election for the Federal Republic of Nigeria', ARRAY['FCT', 'Lagos', 'Kano', 'Rivers', 'Ogun', 'Kaduna']),
  ('2027 Senate Elections', 'senatorial', '2027-02-25'::date, 'upcoming', 'Senate Elections for all states', ARRAY['FCT', 'Lagos', 'Kano', 'Rivers', 'Ogun', 'Kaduna']),
  ('2027 Gubernatorial Elections', 'gubernatorial', '2027-03-11'::date, 'upcoming', 'Governorship Elections', ARRAY['Lagos', 'Kano', 'Rivers', 'Ogun', 'Kaduna'])
) AS t(name, type, election_date, status, description, states)
WHERE NOT EXISTS (SELECT 1 FROM public.elections WHERE elections.name = t.name);

-- Insert races for the elections
INSERT INTO public.races (name, type, election_id, description) 
SELECT 
  'President of Nigeria',
  'presidential',
  e.id,
  'Presidential race for the Federal Republic of Nigeria'
FROM public.elections e 
WHERE e.name = '2027 Presidential Election'
  AND NOT EXISTS (SELECT 1 FROM public.races WHERE races.name = 'President of Nigeria');

-- Insert gubernatorial race for Lagos
INSERT INTO public.races (name, type, election_id, state, description)
SELECT 
  'Governor of Lagos State',
  'gubernatorial',
  e.id,
  'Lagos',
  'Gubernatorial race for Lagos State'
FROM public.elections e 
WHERE e.name = '2027 Gubernatorial Elections'
  AND NOT EXISTS (SELECT 1 FROM public.races WHERE races.name = 'Governor of Lagos State');

-- Insert senatorial race
INSERT INTO public.races (name, type, election_id, state, constituency, description)
SELECT 
  'Lagos Central Senatorial District',
  'senatorial',
  e.id,
  'Lagos',
  'Lagos Central',
  'Senate seat for Lagos Central Senatorial District'
FROM public.elections e 
WHERE e.name = '2027 Senate Elections'
  AND NOT EXISTS (SELECT 1 FROM public.races WHERE races.name = 'Lagos Central Senatorial District');