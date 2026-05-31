import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://agjqadihwvfnqqczkzra.supabase.co';
const supabaseKey = 'sb_publishable_dDjZm1J-Xd7aaRbnev95Dg_yejre7Qf';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectKanok() {
  const { data: p, error } = await supabase
    .from('participants')
    .select('id, name, team')
    .eq('name', 'กนกลักษณ์ เพชรอาวุธ')
    .single();

  if (error) {
    console.error(error);
  } else {
    console.log("Database values for Kanoklakkana:");
    console.log(`ID: ${p.id}`);
    console.log(`Name: "${p.name}"`);
    console.log(`Team: "${p.team}"`);
    
    // Hex/Unicode representation comparison to see if there is any invisible character
    console.log("Name chars:", Array.from(p.name).map(c => c.charCodeAt(0).toString(16)));
    console.log("Team chars:", Array.from(p.team).map(c => c.charCodeAt(0).toString(16)));
  }
}

inspectKanok();
