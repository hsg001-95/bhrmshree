import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// For the backend engine, load from dashboard/.env.local where the keys are
dotenv.config({ path: path.join(process.cwd(), 'dashboard', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);
