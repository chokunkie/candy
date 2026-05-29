import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://agjqadihwvfnqqczkzra.supabase.co';
const supabaseKey = 'sb_publishable_dDjZm1J-Xd7aaRbnev95Dg_yejre7Qf';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: participants, error } = await supabase
    .from('participants')
    .select('name, team, rank1');
  if (error) {
    console.error(error);
    return;
  }

  const counts = {};
  participants.forEach(p => {
    const teamName = p.team || 'ยังไม่เลือกบ้าน';
    if (!counts[teamName]) {
      counts[teamName] = { 
        total: 0, 
        submitted: 0,
        majors: {} // major -> count
      };
    }
    counts[teamName].total++;
    if (p.rank1 && p.rank1 !== '') {
      counts[teamName].submitted++;
      const major = p.rank1;
      counts[teamName].majors[major] = (counts[teamName].majors[major] || 0) + 1;
    }
  });

  console.log('Grouped Counts:');
  Object.keys(counts).forEach(team => {
    console.log(`${team}: total=${counts[team].total}, submitted=${counts[team].submitted}, majors=`, counts[team].majors);
  });
}

check();
