// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://gbofjwopkmuxicecfnlh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdib2Zqd29wa211eGljZWNmbmxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NzMyNjYsImV4cCI6MjA2MTQ0OTI2Nn0.KkM0M9jetjFCcx5gI5rK1YXv-a0WCokqy2OuvrsijHk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);