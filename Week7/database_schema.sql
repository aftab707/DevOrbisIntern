-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'booked',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT,
    call_transcript TEXT,
    call_summary TEXT
);

-- Optional: Create an index on appointment_date for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);

-- Set up Row Level Security (RLS)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users (update as needed for your auth setup)
-- For a webhook bypassing auth, you might need to use the service role key 
-- or create a policy allowing anon inserts if configured securely.
CREATE POLICY "Allow anon insert for webhook" ON appointments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon select for frontend" ON appointments FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon update for webhook/n8n" ON appointments FOR UPDATE TO anon USING (true);
