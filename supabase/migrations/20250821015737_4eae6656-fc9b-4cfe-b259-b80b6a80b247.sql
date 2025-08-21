-- Insert sample data with correct enum casting
INSERT INTO public.elections (name, type, election_date, status, description, states) VALUES
  ('2027 Presidential Election', 'presidential'::election_type, '2027-02-25'::date, 'upcoming'::election_status, 'Presidential Election for the Federal Republic of Nigeria', ARRAY['FCT', 'Lagos', 'Kano', 'Rivers', 'Ogun', 'Kaduna']),
  ('2027 Senate Elections', 'senatorial'::election_type, '2027-02-25'::date, 'upcoming'::election_status, 'Senate Elections for all states', ARRAY['FCT', 'Lagos', 'Kano', 'Rivers', 'Ogun', 'Kaduna']),
  ('2027 Gubernatorial Elections', 'gubernatorial'::election_type, '2027-03-11'::date, 'upcoming'::election_status, 'Governorship Elections', ARRAY['Lagos', 'Kano', 'Rivers', 'Ogun', 'Kaduna'])
WHERE NOT EXISTS (SELECT 1 FROM public.elections WHERE name IN ('2027 Presidential Election', '2027 Senate Elections', '2027 Gubernatorial Elections'));

-- Insert sample candidates with realistic data
INSERT INTO public.candidates (name, party, age, occupation, education, experience, manifesto, inec_candidate_id, status) VALUES
  ('Dr. Amina Ibrahim', 'All Progressives Congress (APC)', 58, 'Medical Doctor & Former Governor', 'MBBS University of Lagos, MSc Public Health Harvard University', '12 years as Governor, 8 years in Senate, 15 years medical practice', 'Healthcare reform, economic diversification, youth empowerment', 'INEC-PRES-2027-001', 'active'::candidate_status),
  ('Engr. Chinedu Okafor', 'Peoples Democratic Party (PDP)', 62, 'Engineer & Former Minister', 'B.Eng Mechanical Engineering, MBA Business Administration', '8 years as Minister of Works, 6 years as Commissioner', 'Infrastructure development, job creation, poverty alleviation', 'INEC-PRES-2027-002', 'active'::candidate_status),
  ('Barr. Fatima Mohammed', 'Labour Party (LP)', 55, 'Lawyer & Human Rights Activist', 'LLB University of Abuja, LLM Human Rights Law', '20 years legal practice, 10 years human rights advocacy', 'Rule of law, anti-corruption, women empowerment', 'INEC-PRES-2027-003', 'active'::candidate_status),
  ('Prof. Adebayo Williams', 'New Nigeria Peoples Party (NNPP)', 60, 'University Professor & Economist', 'PhD Economics London School of Economics', '25 years academic career, Former CBN Deputy Governor', 'Economic transformation, education revolution, agricultural modernization', 'INEC-PRES-2027-004', 'active'::candidate_status)
WHERE NOT EXISTS (SELECT 1 FROM public.candidates WHERE inec_candidate_id IN ('INEC-PRES-2027-001', 'INEC-PRES-2027-002', 'INEC-PRES-2027-003', 'INEC-PRES-2027-004'));

-- Insert election deadlines
INSERT INTO public.deadlines (title, description, type, deadline_date, priority) VALUES
  ('Voter Registration Deadline', 'Last date for voter registration and PVC collection for 2027 elections', 'registration', '2026-12-15 23:59:59+00'::timestamptz, 'high'),
  ('Campaign Period Begins', 'Official campaign period starts for all candidates', 'campaign', '2026-11-25 00:00:00+00'::timestamptz, 'medium'),
  ('Campaign Period Ends', 'All campaign activities must cease 24 hours before election', 'campaign', '2027-02-23 23:59:59+00'::timestamptz, 'high'),
  ('Candidate List Publication', 'INEC publishes final list of cleared candidates', 'administrative', '2026-12-31 17:00:00+00'::timestamptz, 'medium')
WHERE NOT EXISTS (SELECT 1 FROM public.deadlines WHERE title IN ('Voter Registration Deadline', 'Campaign Period Begins', 'Campaign Period Ends', 'Candidate List Publication'));

-- Insert sample news
INSERT INTO public.news (title, content, summary, source_name, source_url, published_at, category, tags, is_verified) VALUES
  ('INEC Announces Voter Registration Extension', 'The Independent National Electoral Commission has announced an extension of the continuous voter registration exercise to accommodate more eligible voters ahead of the 2027 general elections.', 'INEC extends voter registration deadline to increase participation.', 'Premium Times', 'https://premiumtimesng.com/news/elections', NOW(), 'elections', ARRAY['INEC', 'voter-registration', 'elections'], true),
  ('Security Agencies Begin Election Preparations', 'Security agencies across Nigeria have commenced preparations for the upcoming elections, with focus on ensuring peaceful conduct across all polling units.', 'Security forces prepare comprehensive election security framework.', 'The Guardian', 'https://guardian.ng/politics/security-prep', NOW(), 'security', ARRAY['security', 'elections', 'preparation'], true),
  ('New Electoral Technology Unveiled', 'INEC demonstrates new biometric voting technology that will be deployed in the 2027 elections to enhance transparency and reduce electoral malpractice.', 'INEC showcases advanced voting technology for 2027 elections.', 'Channels TV', 'https://channelstv.com/electoral-tech', NOW(), 'technology', ARRAY['INEC', 'technology', 'biometric', 'elections'], true)
WHERE NOT EXISTS (SELECT 1 FROM public.news WHERE title IN ('INEC Announces Voter Registration Extension', 'Security Agencies Begin Election Preparations', 'New Electoral Technology Unveiled'));