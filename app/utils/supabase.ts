import { createClient } from '@supabase/supabase-js';

// Lấy biến môi trường từ file .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Khởi tạo kết nối
export const supabase = createClient(supabaseUrl, supabaseKey);