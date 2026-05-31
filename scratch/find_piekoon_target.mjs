import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://agjqadihwvfnqqczkzra.supabase.co';
const supabaseKey = 'sb_publishable_dDjZm1J-Xd7aaRbnev95Dg_yejre7Qf';
const supabase = createClient(supabaseUrl, supabaseKey);

async function findPiekoonTarget() {
  const { data: participants, error } = await supabase
    .from('participants')
    .select('id, name, team');
  if (error) {
    console.error(error);
    return;
  }

  console.log("Searching in Database for surname 'อัคคีสุวรรณ':");
  participants.forEach(p => {
    if (p.name && p.name.includes("อัคคีสุวรรณ")) {
      console.log(`🟢 FOUND: ID=${p.id}, Name="${p.name}", Team="${p.team}"`);
    }
  });
}

findPiekoonTarget();
