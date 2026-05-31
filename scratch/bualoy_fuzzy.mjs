import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://agjqadihwvfnqqczkzra.supabase.co';
const supabaseKey = 'sb_publishable_dDjZm1J-Xd7aaRbnev95Dg_yejre7Qf';
const supabase = createClient(supabaseUrl, supabaseKey);

async function searchBualoyFuzzy() {
  const { data: participants, error } = await supabase
    .from('participants')
    .select('id, name, team');
  if (error) {
    console.error(error);
    return;
  }

  const bualoy = participants.filter(p => p.team === 'บ้านบัวลอยไข่หวาน');
  console.log("Searching fuzzy matches in บ้านบัวลอยไข่หวาน for 'ม':");
  bualoy.forEach(p => {
    if (p.name && (p.name.includes("ม") || p.name.includes("ร") || p.name.includes("น"))) {
      console.log(`- ID=${p.id}, Name="${p.name}"`);
    }
  });
}

searchBualoyFuzzy();
