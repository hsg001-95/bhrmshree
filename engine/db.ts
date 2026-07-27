import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// For the backend engine, load from dashboard/.env.local where the keys are
dotenv.config({ path: path.join(process.cwd(), 'dashboard', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function createNoopSupabaseClient() {
	const chain: any = {
		upsert: async () => ({ data: null, error: null }),
		insert: async () => ({ data: null, error: null }),
		update: async () => ({ data: null, error: null }),
		select: () => chain,
		eq: () => chain,
		single: async () => ({ data: null, error: null }),
		upload: async () => ({ data: null, error: new Error('Supabase is not configured') }),
		getPublicUrl: () => ({ data: { publicUrl: '' } }),
	};

	return {
		from: () => chain,
		storage: {
			from: () => chain,
		},
	} as any;
}

export const supabase = supabaseUrl && supabaseKey
	? createClient(supabaseUrl, supabaseKey)
	: createNoopSupabaseClient();
