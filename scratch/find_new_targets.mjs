import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://agjqadihwvfnqqczkzra.supabase.co';
const supabaseKey = 'sb_publishable_dDjZm1J-Xd7aaRbnev95Dg_yejre7Qf';
const supabase = createClient(supabaseUrl, supabaseKey);

async function findNewTargets() {
  const { data: participants, error } = await supabase
    .from('participants')
    .select('id, name, team');
  if (error) {
    console.error(error);
    return;
  }

  const targets = [
    { name: 'กานธิดา', house: 'บ้านโรตีท้ายบังบ่าว' },
    { name: 'ศุภนัส', house: 'บ้านโรตีท้ายบังบ่าว' },
    { name: 'มนิสรา', house: 'บ้านบัวลอยไข่หวาน' }
  ];

  console.log("--- Searching in database ---");
  targets.forEach(t => {
    const match = participants.filter(p => p.name && p.name.includes(t.name));
    console.log(`\nSearch Query: "${t.name}" (Expected house: ${t.house})`);
    if (match.length > 0) {
      match.forEach(m => {
        console.log(`🟢 FOUND: ID=${m.id}, Name="${m.name}", Current DB Team="${m.team}"`);
      });
    } else {
      // Fuzzy search in case spelling is different
      const fuzzy = participants.filter(p => p.name && (p.name.includes(t.name.substring(0, 3)) || p.name.includes(t.name.substring(t.name.length - 3))));
      console.log(`🔴 NOT FOUND EXACTLY. Fuzzy matches:`);
      fuzzy.forEach(f => {
        console.log(`  - ID=${f.id}, Name="${f.name}", Current DB Team="${f.team}"`);
      });
    }
  });
}

findNewTargets();
