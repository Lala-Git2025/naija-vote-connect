-- Insert sample elections data
INSERT INTO public.elections (name, type, election_date, status, description, states) 
SELECT 
  t.name, t.type::election_type, t.election_date::date, t.status::election_status, t.description, t.states
FROM (VALUES
  ('2027 Presidential Election', 'presidential', '2027-02-25', 'upcoming', 'Presidential Election for the Federal Republic of Nigeria', ARRAY['FCT', 'Lagos', 'Kano', 'Rivers', 'Ogun', 'Kaduna']),
  ('2027 Senate Elections', 'senatorial', '2027-02-25', 'upcoming', 'Senate Elections for all states', ARRAY['FCT', 'Lagos', 'Kano', 'Rivers', 'Ogun', 'Kaduna']),
  ('2027 Gubernatorial Elections', 'gubernatorial', '2027-03-11', 'upcoming', 'Governorship Elections', ARRAY['Lagos', 'Kano', 'Rivers', 'Ogun', 'Kaduna'])
) AS t(name, type, election_date, status, description, states)
WHERE NOT EXISTS (SELECT 1 FROM public.elections e WHERE e.name = t.name);