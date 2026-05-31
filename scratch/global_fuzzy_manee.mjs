import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://agjqadihwvfnqqczkzra.supabase.co';
const supabaseKey = 'sb_publishable_dDjZm1J-Xd7aaRbnev95Dg_yejre7Qf';
const supabase = createClient(supabaseUrl, supabaseKey);

async function globalFuzzySearch() {
  const { data: participants, error } = await supabase
    .from('participants')
    .select('id, name, team');
  if (error) {
    console.error(error);
    return;
  }

  console.log("Fuzzy searching globally for Manee/มณี/มณ/รัตน์ (all entries):");
  participants.forEach(p => {
    if (p.name && (p.name.includes("มณีรัตน์") || p.name.includes("มณี") || p.name.includes("รัตน์") || p.name.includes("มณีร"))) {
      console.log(`- ID=${p.id}, Name="${p.name}", Team="${p.team || 'ยังไม่ระบุ'}"`);
    }
  });
}

globalFuzzySearch();
