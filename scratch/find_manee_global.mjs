import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://agjqadihwvfnqqczkzra.supabase.co';
const supabaseKey = 'sb_publishable_dDjZm1J-Xd7aaRbnev95Dg_yejre7Qf';
const supabase = createClient(supabaseUrl, supabaseKey);

async function findManeeGlobal() {
  const { data: participants, error } = await supabase
    .from('participants')
    .select('id, name, team');
  if (error) {
    console.error(error);
    return;
  }

  console.log("Searching globally in DB for any student with first name containing 'มณี':");
  participants.forEach(p => {
    if (p.name && p.name.includes("มณี")) {
      console.log(`- ID=${p.id}, Name="${p.name}", Team="${p.team || 'ยังไม่ระบุ'}"`);
    }
  });
}

findManeeGlobal();
