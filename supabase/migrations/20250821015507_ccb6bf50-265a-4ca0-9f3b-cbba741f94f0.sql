-- Insert sample election data directly
INSERT INTO public.elections (name, type, election_date, status, description, states) VALUES
('2027 Presidential Election', 'presidential', '2027-02-25', 'upcoming', 'Presidential Election for the Federal Republic of Nigeria', ARRAY['FCT', 'Lagos', 'Kano', 'Rivers', 'Ogun', 'Kaduna']),
('2027 National Assembly Elections', 'legislative', '2027-02-25', 'upcoming', 'Senate and House of Representatives Elections', ARRAY['FCT', 'Lagos', 'Kano', 'Rivers', 'Ogun', 'Kaduna']),
('2027 Gubernatorial Elections', 'gubernatorial', '2027-03-11', 'upcoming', 'Governorship and State Assembly Elections', ARRAY['Lagos', 'Kano', 'Rivers', 'Ogun', 'Kaduna'])
ON CONFLICT (name) DO UPDATE SET
  type = EXCLUDED.type,
  election_date = EXCLUDED.election_date,
  status = EXCLUDED.status,
  description = EXCLUDED.description,
  states = EXCLUDED.states,
  updated_at = NOW();

-- Insert races for the elections
INSERT INTO public.races (name, type, election_id, state, constituency, description) 
SELECT 
  'President of Nigeria',
  'presidential',
  e.id,
  NULL,
  NULL,
  'Presidential race for the Federal Republic of Nigeria'
FROM public.elections e 
WHERE e.name = '2027 Presidential Election'
ON CONFLICT (name) DO UPDATE SET
  type = EXCLUDED.type,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Insert gubernatorial races for Lagos
INSERT INTO public.races (name, type, election_id, state, description)
SELECT 
  'Governor of Lagos State',
  'gubernatorial',
  e.id,
  'Lagos',
  'Gubernatorial race for Lagos State'
FROM public.elections e 
WHERE e.name = '2027 Gubernatorial Elections'
ON CONFLICT (name) DO UPDATE SET
  type = EXCLUDED.type,
  state = EXCLUDED.state,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Insert senatorial races
INSERT INTO public.races (name, type, election_id, state, constituency, description)
SELECT 
  'Lagos Central Senatorial District',
  'senatorial',
  e.id,
  'Lagos',
  'Lagos Central',
  'Senate seat for Lagos Central Senatorial District'
FROM public.elections e 
WHERE e.name = '2027 National Assembly Elections'
ON CONFLICT (name) DO UPDATE SET
  type = EXCLUDED.type,
  state = EXCLUDED.state,
  constituency = EXCLUDED.constituency,
  description = EXCLUDED.description,
  updated_at = NOW();