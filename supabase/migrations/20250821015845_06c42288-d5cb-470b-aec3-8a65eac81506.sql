-- Insert sample candidates
INSERT INTO public.candidates (name, party, age, occupation, education, experience, manifesto, inec_candidate_id, status) 
SELECT 
  t.name, t.party, t.age, t.occupation, t.education, t.experience, t.manifesto, t.inec_candidate_id, t.status::candidate_status
FROM (VALUES
  ('Dr. Amina Ibrahim', 'All Progressives Congress (APC)', 58, 'Medical Doctor & Former Governor', 'MBBS University of Lagos, MSc Public Health Harvard University', '12 years as Governor, 8 years in Senate, 15 years medical practice', 'Healthcare reform, economic diversification, youth empowerment', 'INEC-PRES-2027-001', 'active'),
  ('Engr. Chinedu Okafor', 'Peoples Democratic Party (PDP)', 62, 'Engineer & Former Minister', 'B.Eng Mechanical Engineering, MBA Business Administration', '8 years as Minister of Works, 6 years as Commissioner', 'Infrastructure development, job creation, poverty alleviation', 'INEC-PRES-2027-002', 'active'),
  ('Barr. Fatima Mohammed', 'Labour Party (LP)', 55, 'Lawyer & Human Rights Activist', 'LLB University of Abuja, LLM Human Rights Law', '20 years legal practice, 10 years human rights advocacy', 'Rule of law, anti-corruption, women empowerment', 'INEC-PRES-2027-003', 'active'),
  ('Prof. Adebayo Williams', 'New Nigeria Peoples Party (NNPP)', 60, 'University Professor & Economist', 'PhD Economics London School of Economics', '25 years academic career, Former CBN Deputy Governor', 'Economic transformation, education revolution, agricultural modernization', 'INEC-PRES-2027-004', 'active'),
  ('Mr. Babajide Adeyemi', 'All Progressives Congress (APC)', 50, 'Businessman & Public Administrator', 'B.Sc Economics University of Lagos, MBA Finance', '4 years as Commissioner, 10 years private sector', 'Lagos megacity development, technology hub expansion', 'INEC-LAG-GOV-2027-001', 'active'),
  ('Dr. Funmilayo Olawale', 'Peoples Democratic Party (PDP)', 48, 'Physician & Public Health Specialist', 'MBBS University of Ibadan, MPH Johns Hopkins', '6 years healthcare administration, 5 years civil service', 'Healthcare accessibility, education reform, urban planning', 'INEC-LAG-GOV-2027-002', 'active')
) AS t(name, party, age, occupation, education, experience, manifesto, inec_candidate_id, status)
WHERE NOT EXISTS (SELECT 1 FROM public.candidates c WHERE c.inec_candidate_id = t.inec_candidate_id);

-- Insert election deadlines
INSERT INTO public.deadlines (title, description, type, deadline_date, priority) 
SELECT 
  t.title, t.description, t.type, t.deadline_date::timestamptz, t.priority
FROM (VALUES
  ('Voter Registration Deadline', 'Last date for voter registration and PVC collection for 2027 elections', 'registration', '2026-12-15 23:59:59+00', 'high'),
  ('Campaign Period Begins', 'Official campaign period starts for all candidates', 'campaign', '2026-11-25 00:00:00+00', 'medium'),
  ('Campaign Period Ends', 'All campaign activities must cease 24 hours before election', 'campaign', '2027-02-23 23:59:59+00', 'high'),
  ('Candidate List Publication', 'INEC publishes final list of cleared candidates', 'administrative', '2026-12-31 17:00:00+00', 'medium')
) AS t(title, description, type, deadline_date, priority)
WHERE NOT EXISTS (SELECT 1 FROM public.deadlines d WHERE d.title = t.title);

-- Insert sample news
INSERT INTO public.news (title, content, summary, source_name, source_url, published_at, category, tags, is_verified) 
SELECT 
  t.title, t.content, t.summary, t.source_name, t.source_url, NOW(), t.category, t.tags::text[], t.is_verified::boolean
FROM (VALUES
  ('INEC Announces Voter Registration Extension', 'The Independent National Electoral Commission has announced an extension of the continuous voter registration exercise to accommodate more eligible voters ahead of the 2027 general elections.', 'INEC extends voter registration deadline to increase participation.', 'Premium Times', 'https://premiumtimesng.com/news/elections', 'elections', ARRAY['INEC', 'voter-registration', 'elections'], 'true'),
  ('Security Agencies Begin Election Preparations', 'Security agencies across Nigeria have commenced preparations for the upcoming elections, with focus on ensuring peaceful conduct across all polling units.', 'Security forces prepare comprehensive election security framework.', 'The Guardian', 'https://guardian.ng/politics/security-prep', 'security', ARRAY['security', 'elections', 'preparation'], 'true'),
  ('New Electoral Technology Unveiled', 'INEC demonstrates new biometric voting technology that will be deployed in the 2027 elections to enhance transparency and reduce electoral malpractice.', 'INEC showcases advanced voting technology for 2027 elections.', 'Channels TV', 'https://channelstv.com/electoral-tech', 'technology', ARRAY['INEC', 'technology', 'biometric', 'elections'], 'true')
) AS t(title, content, summary, source_name, source_url, category, tags, is_verified)
WHERE NOT EXISTS (SELECT 1 FROM public.news n WHERE n.title = t.title);