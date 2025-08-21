-- Add unique constraint for races name and then insert current INEC races
ALTER TABLE public.races 
ADD CONSTRAINT races_name_unique UNIQUE (name);

-- Create races for current INEC elections  
INSERT INTO public.races (name, type, description, election_id) VALUES
('Anambra State Governor', 'gubernatorial', 'Anambra State Governorship Election', null),
('FCT Area Council Chairman', 'local_government', 'FCT Area Council Election', null),
('Ekiti State Governor', 'gubernatorial', 'Ekiti State Governorship Election', null),
('Osun State Governor', 'gubernatorial', 'Osun State Governorship Election', null);