// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Значения рекомендуется хранить в переменных окружения
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
