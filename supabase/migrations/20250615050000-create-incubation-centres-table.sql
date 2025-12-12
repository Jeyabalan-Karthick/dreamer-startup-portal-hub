-- Create incubation_centres table
CREATE TABLE IF NOT EXISTS public.incubation_centres (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_incubation_centres_name ON public.incubation_centres(name);
CREATE INDEX IF NOT EXISTS idx_incubation_centres_admin_email ON public.incubation_centres(admin_email);

-- Enable RLS (Row Level Security)
ALTER TABLE public.incubation_centres ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read incubation centres
CREATE POLICY "Anyone can view incubation centres" 
ON public.incubation_centres 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to insert incubation centres (for admin functionality)
CREATE POLICY "Anyone can insert incubation centres" 
ON public.incubation_centres 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow anyone to update incubation centres
CREATE POLICY "Anyone can update incubation centres" 
ON public.incubation_centres 
FOR UPDATE 
USING (true);

-- Create policy to allow anyone to delete incubation centres
CREATE POLICY "Anyone can delete incubation centres" 
ON public.incubation_centres 
FOR DELETE 
USING (true);

