import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ydnjvfynbfwhuajyrjkm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkbmp2ZnluYmZ3aHVhanlyamttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MDgwNzksImV4cCI6MjA4ODM4NDA3OX0.pMFnLAkwjabZRxUA2jSmvIvqF0jGD6hHCB9HzZ3Qpt4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);