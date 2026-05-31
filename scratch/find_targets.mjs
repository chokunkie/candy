import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://agjqadihwvfnqqczkzra.supabase.co';
const supabaseKey = 'sb_publishable_dDjZm1J-Xd7aaRbnev95Dg_yejre7Qf';
const supabase = createClient(supabaseUrl, supabaseKey);

async function findLockedStudents() {
  const { data: participants, error } = await supabase
    .from('participants')
    .select('id, name, team');
  if (error) {
    console.error(error);
    return;
  }

  const targets = [
    { name: 'กนกลัก', house: 'บ้านมาการอง อุอิ' },
    { name: 'ธนดล', house: 'บ้านครองแครงกะทิสด' },
    { name: 'มณีรัตน์', house: 'บ้านบัวลอยไข่หวาน' },
    { name: 'อดิศร', house: 'บ้านขนมเปียกปูน' }
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
      console.log(`🔴 NOT FOUND`);
    }
  });
}

findLockedStudents();
