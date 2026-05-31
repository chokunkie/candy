import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://agjqadihwvfnqqczkzra.supabase.co';
const supabaseKey = 'sb_publishable_dDjZm1J-Xd7aaRbnev95Dg_yejre7Qf';
const supabase = createClient(supabaseUrl, supabaseKey);

async function listHouseMates() {
  const { data: participants, error } = await supabase
    .from('participants')
    .select('id, name, team');
  if (error) {
    console.error(error);
    return;
  }

  console.log("--- Listing all students in 'บ้านบัวลอยไข่หวาน' ---");
  participants.filter(p => p.team === 'บ้านบัวลอยไข่หวาน').forEach(p => {
    console.log(`- ID=${p.id}, Name="${p.name}"`);
  });
}

listHouseMates();
