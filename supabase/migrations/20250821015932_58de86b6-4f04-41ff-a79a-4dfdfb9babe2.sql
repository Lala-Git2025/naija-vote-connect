-- Insert sample fact-checks
INSERT INTO public.fact_checks (claim, verdict, explanation, source_name, source_url, topic, confidence_score, published_at, candidate_id) 
SELECT 
  t.claim, t.verdict, t.explanation, t.source_name, t.source_url, t.topic, t.confidence_score::numeric, NOW(), c.id
FROM (VALUES
  ('Built 100 schools during tenure as governor', 'partly-true', 'Records show 67 schools were built, not 100 as claimed. However, significant progress was made in education infrastructure development.', 'Africa Check', 'https://africacheck.org/fact-checks/schools-claim', 'education', '0.85'),
  ('Created 2 million jobs in previous role', 'misleading', 'While employment increased, the figure includes indirect jobs and temporary positions that may not represent permanent job creation.', 'DUBAWA', 'https://dubawa.org/employment-claims', 'employment', '0.78'),
  ('Reduced crime rate by 60% in Lagos State', 'true', 'Official statistics from the Lagos State Police Command confirm a significant reduction in reported crimes during the specified period.', 'Africa Check', 'https://africacheck.org/crime-statistics-lagos', 'security', '0.89'),
  ('Nigeria has the highest unemployment rate in Africa', 'false', 'While Nigeria faces unemployment challenges, South Africa currently has the highest unemployment rate in Africa according to recent statistics.', 'FactCheck.ng', 'https://factcheck.ng/unemployment-statistics', 'economy', '0.92')
) AS t(claim, verdict, explanation, source_name, source_url, topic, confidence_score)
LEFT JOIN public.candidates c ON c.inec_candidate_id = 'INEC-PRES-2027-001'
WHERE NOT EXISTS (SELECT 1 FROM public.fact_checks f WHERE f.claim = t.claim);

-- Insert some polling units
INSERT INTO public.polling_units (name, code, state, lga, ward, address, registered_voters, inec_pu_id) 
SELECT 
  t.name, t.code, t.state, t.lga, t.ward, t.address, t.registered_voters, t.inec_pu_id
FROM (VALUES
  ('Ikeja Primary School', 'LA/IKJ/001', 'Lagos', 'Ikeja', 'Ward 1', 'Ikeja GRA, Lagos State', 1500, 'PU-LAG-001'),
  ('Victoria Island Community Center', 'LA/VI/002', 'Lagos', 'Lagos Island', 'Ward 2', 'Victoria Island, Lagos State', 2200, 'PU-LAG-002'),
  ('National Theatre Complex', 'LA/SUR/003', 'Lagos', 'Surulere', 'Ward 5', 'National Theatre, Iganmu, Lagos', 1800, 'PU-LAG-003'),
  ('Tafawa Balewa Square', 'LA/LIS/004', 'Lagos', 'Lagos Island', 'Ward 1', 'Tafawa Balewa Square, Lagos Island', 1650, 'PU-LAG-004'),
  ('University of Lagos Sports Center', 'LA/YAB/005', 'Lagos', 'Yaba', 'Ward 3', 'University of Lagos, Akoka', 2100, 'PU-LAG-005')
) AS t(name, code, state, lga, ward, address, registered_voters, inec_pu_id)
WHERE NOT EXISTS (SELECT 1 FROM public.polling_units p WHERE p.code = t.code);