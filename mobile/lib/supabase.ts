================================================================
// Supabase client — เชื่อม titan-9 Project (backend ของแอป)
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pnluhkfzxtprnpwwcrlq.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBubHVoa2Z6eHRwcm5wd3djcmxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MzYxMDQsImV4cCI6MjEwNDExMjEwNH0.NLOQx7yfSGMowDk6sf6mNhSeMrrXAmT2I0d7CRsdB98';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


================================================================
