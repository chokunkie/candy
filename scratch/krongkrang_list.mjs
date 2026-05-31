import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://agjqadihwvfnqqczkzra.supabase.co';
const supabaseKey = 'sb_publishable_dDjZm1J-Xd7aaRbnev95Dg_yejre7Qf';
const supabase = createClient(supabaseUrl, supabaseKey);

async function searchKrongKrangFuzzy() {
  const { data: participants, error } = await supabase
    .from('participants')
    .select('id, name, team');
  if (error) {
    console.error(error);
    return;
  }

  const krongKrang = participants.filter(p => p.team === 'บ้านครองแครง');
  console.log("Listing all members inside 'บ้านครองแครง' fuzzy matching 'จริ' or similar:");
  krongKrang.forEach(p => {
    console.log(`- ID=${p.id}, Name="${p.name}"`);
  });
}

searchKrongKrangFuzzy();
