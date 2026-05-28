import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Eye, EyeOff, ShieldAlert } from 'lucide-react';

export default function Leaderboard() {
  const [teams, setTeams] = useState([]);
  const [hideScores, setHideScores] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    
    // Realtime subscription for points
    const teamsSub = supabase
      .channel('public:teams')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'teams' }, (payload) => {
        const updatedTeam = payload.new;
        setTeams(prevTeams => {
          const newTeams = prevTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t);
          return [...newTeams].sort((a, b) => b.points - a.points);
        });
      })
      .subscribe();

    // Realtime subscription for settings (visibility)
    const settingsSub = supabase
      .channel('public:settings')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings', filter: 'id=eq.1' }, (payload) => {
        setHideScores(payload.new.hide_scores);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(teamsSub);
      supabase.removeChannel(settingsSub);
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch Teams
    const { data: teamsData } = await supabase
      .from('teams')
      .select('*')
      .order('points', { ascending: false });
    if (teamsData) setTeams(teamsData);

    // Fetch Settings
    const { data: settingsData } = await supabase
      .from('settings')
      .select('hide_scores')
      .eq('id', 1)
      .single();
    if (settingsData) setHideScores(settingsData.hide_scores);
    
    setLoading(false);
  };

  const toggleHideScore = async () => {
    const newVal = !hideScores;
    await supabase.from('settings').update({ hide_scores: newVal }).eq('id', 1);
    setHideScores(newVal);
  };

  return (
    <div className="mt-2" style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <div className="text-center mb-4">
        <Trophy size={48} color="var(--accent-amber)" style={{ margin: '0 auto 0.5rem' }} />
        <h1 className="title-main" style={{ color: 'var(--text-main)', fontSize: '2.5rem' }}>LEADERBOARD</h1>
        <p className="title-sub">ตารางอันดับคะแนนรวม</p>
      </div>

      <div className="glass-card mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--accent-pink-light)', borderColor: 'var(--accent-pink)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <ShieldAlert color="var(--accent-pink)" />
          <div>
            <h4 style={{ color: 'var(--accent-pink)', fontWeight: 800 }}>สถานะการมองเห็น</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{hideScores ? 'ซ่อนคะแนนจากมือถือน้องๆ แล้ว' : 'น้องๆ สามารถเห็นคะแนนตัวเองได้ตามปกติ'}</p>
          </div>
        </div>
        
        <button 
          onClick={toggleHideScore}
          className="btn" 
          style={{ width: 'auto', background: hideScores ? '#ef4444' : 'var(--accent-green)', padding: '0.6rem 1rem', fontSize: '0.9rem' }}
        >
          {hideScores ? <><EyeOff size={16}/> เลิกซ่อนคะแนน</> : <><Eye size={16}/> ซ่อนคะแนนน้อง</>}
        </button>
      </div>

      <div style={{ 
        background: '#fff', 
        borderRadius: '16px', 
        padding: '1.5rem', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0'
      }}>
        {loading ? (
          <p className="text-center" style={{ padding: '2rem' }}>กำลังโหลดข้อมูล...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Header Row */}
            <div style={{ 
              display: 'flex', 
              padding: '0.8rem 1rem', 
              borderBottom: '2px solid #f1f5f9',
              color: 'var(--text-sub)',
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              <div style={{ width: '60px', textAlign: 'center' }}>Rank</div>
              <div style={{ flex: 1 }}>Team Name</div>
              <div style={{ width: '120px', textAlign: 'center' }}>Total Score</div>
            </div>

            {/* Data Rows */}
            {teams.map((t, index) => {
              const isTop3 = index < 3;
              let bgColor = '#f8fafc';
              let borderColor = '#f1f5f9';
              let rankColor = 'var(--text-sub)';
              let scoreColor = 'var(--accent-pink)';

              if (index === 0) { bgColor = 'rgba(255, 190, 11, 0.1)'; borderColor = '#ffbe0b'; rankColor = '#ffbe0b'; scoreColor = '#d97706'; }
              if (index === 1) { bgColor = 'rgba(0, 210, 255, 0.1)'; borderColor = '#00d2ff'; rankColor = '#00d2ff'; scoreColor = '#0284c7'; }
              if (index === 2) { bgColor = 'rgba(157, 78, 221, 0.1)'; borderColor = '#9d4edd'; rankColor = '#9d4edd'; scoreColor = '#7e22ce'; }

              return (
                <div key={t.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '1rem', 
                  background: bgColor,
                  borderRadius: '12px',
                  border: `1px solid ${borderColor}`,
                  transition: 'all 0.2s',
                  boxShadow: index === 0 ? '0 4px 15px rgba(255,190,11,0.1)' : 'none'
                }}>
                  <div style={{ 
                    width: '60px', 
                    textAlign: 'center', 
                    fontWeight: 900, 
                    fontSize: isTop3 ? '1.5rem' : '1.2rem',
                    color: rankColor
                  }}>
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </div>
                  
                  <div style={{ flex: 1, paddingLeft: '1rem' }}>
                    <h4 style={{ 
                      fontWeight: 800, 
                      color: 'var(--text-main)', 
                      fontSize: isTop3 ? '1.2rem' : '1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {t.name}
                      {index === 0 && <span style={{ fontSize: '1rem' }}>👑</span>}
                    </h4>
                  </div>
                  
                  <div style={{ 
                    width: '120px',
                    textAlign: 'center',
                    fontSize: '1.5rem', 
                    fontWeight: 800, 
                    color: scoreColor,
                    background: '#fff',
                    padding: '0.3rem 0',
                    borderRadius: '8px',
                    border: `1px solid ${borderColor}`
                  }}>
                    {t.points}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
