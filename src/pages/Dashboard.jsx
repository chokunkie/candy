import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, Lock, ChevronRight, Sparkles, Zap, Ticket } from 'lucide-react';

// ─── Station type config ──────────────────────────────────────────────────────
const TYPE_CONFIG = {
  ghost: {
    label: 'ฟรี! ลุ้นรับแต้ม',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    border: '#7c3aed',
    badgeBg: '#f3e8ff',
    badgeColor: '#7c3aed',
    icon: <Sparkles size={20} />,
    glow: '0 0 18px rgba(168,85,247,0.35)',
  },
  lottery: {
    label: 'เสี่ยงดวง',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
    border: '#0ea5e9',
    badgeBg: '#e0f2fe',
    badgeColor: '#0369a1',
    icon: <Ticket size={20} />,
    glow: '0 0 18px rgba(14,165,233,0.35)',
  },
  normal: {
    label: 'ฐานปกติ',
    gradient: 'linear-gradient(135deg, #ff2e93 0%, #f97316 100%)',
    border: '#ff2e93',
    badgeBg: '#fce7f3',
    badgeColor: '#be185d',
    icon: <Zap size={20} />,
    glow: '0 0 18px rgba(255,46,147,0.3)',
  },
};

export default function Dashboard() {
  const [team, setTeam] = useState(null);
  const [points, setPoints] = useState(0);
  const [stations, setStations] = useState([]);
  const [hideScores, setHideScores] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const localTeam = localStorage.getItem('candy_team');
    if (!localTeam) { navigate('/login'); return; }
    const parsedTeam = JSON.parse(localTeam);
    setTeam(parsedTeam);
    setPoints(parsedTeam.points);
    fetchData(parsedTeam.id);
  }, [navigate]);

  const fetchData = async (teamId) => {
    const { data: teamData } = await supabase.from('teams').select('points, name').eq('id', teamId).single();
    if (teamData) {
      setPoints(teamData.points);
      const localTeam = localStorage.getItem('candy_team');
      if (localTeam) {
        const parsed = JSON.parse(localTeam);
        localStorage.setItem('candy_team', JSON.stringify({ ...parsed, points: teamData.points, name: teamData.name }));
      }
    }
    const { data: stData } = await supabase.from('stations').select('*').order('id');
    if (stData) setStations(stData);
    const { data: settingsData } = await supabase.from('settings').select('hide_scores').eq('id', 1).single();
    if (settingsData) setHideScores(settingsData.hide_scores);
  };

  const handleLogout = () => {
    localStorage.removeItem('candy_team');
    navigate('/login');
  };

  if (!team) return null;

  return (
    <div style={{ paddingBottom: '2rem' }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-sub)', margin: 0, letterSpacing: '0.5px' }}>กลุ่มของคุณ</p>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: 'var(--text-main)', fontFamily: "'Kanit', sans-serif" }}>{team.name}</h2>
        </div>
        <button
          onClick={handleLogout}
          style={{ background: '#fff0f5', border: '2px solid var(--accent-pink)', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#ffe4ef'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff0f5'}
        >
          <LogOut size={18} color="var(--accent-pink)" />
        </button>
      </div>

      {/* ── Candy score card ─────────────────────────────────────────────────── */}
      <div style={{ padding: '1.8rem 1rem', border: '1.5px solid var(--accent-pink)', borderRadius: '16px', background: '#fff', textAlign: 'center', marginBottom: '1.5rem' }}>
        <p style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '0.4rem', textTransform: 'uppercase' }}>ลูกอมคงเหลือ</p>
        <h1 style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1, minHeight: '68px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Kanit', sans-serif" }}>
          {hideScores === null ? (
            <span style={{ fontSize: '2rem', color: 'var(--text-sub)' }}>...</span>
          ) : hideScores ? (
            <span style={{ fontSize: '1.8rem', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Lock size={28} /> ซ่อนคะแนน
            </span>
          ) : (
            <span style={{ animation: 'popIn 0.4s cubic-bezier(0.22,1,0.36,1) both' }}>{points}</span>
          )}
        </h1>
      </div>

      {/* ── Section title ────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, fontFamily: "'Kanit', sans-serif", letterSpacing: '0.3px' }}>
          เลือกฐานกิจกรรม
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600, margin: '0.2rem 0 0' }}>
          {stations.length} ฐานให้เลือก — กดเพื่อดูรายละเอียด
        </p>
      </div>

      {/* ── Station grid ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {stations.map((st, idx) => {
          const type = st.base_type === 'ghost' ? 'ghost' : st.base_type === 'lottery' ? 'lottery' : 'normal';
          const cfg = TYPE_CONFIG[type];
          const isHovered = hoveredId === st.id;

          return (
            <div
              key={st.id}
              onClick={() => navigate(`/station/${st.id}`)}
              onMouseEnter={() => setHoveredId(st.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                background: '#ffffff',
                border: isHovered ? `1.5px solid ${cfg.border}` : '1.5px solid #e2e8f0',
                borderRadius: '16px',
                padding: '0',
                cursor: 'pointer',
                overflow: 'hidden',
                boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.06)',
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'all 0.18s cubic-bezier(0.22,1,0.36,1)',
                animation: `slideInCard 0.4s cubic-bezier(0.22,1,0.36,1) both`,
                animationDelay: `${idx * 0.05}s`,
              }}
            >

              <div style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                {/* Icon circle */}
                <div style={{
                  width: '42px', height: '42px', borderRadius: '12px',
                  background: cfg.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', flexShrink: 0,
                  boxShadow: `2px 2px 0px rgba(0,0,0,0.12)`
                }}>
                  {cfg.icon}
                </div>

                {/* Name + staff */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{
                    fontSize: '1rem', fontWeight: 900, margin: 0,
                    color: 'var(--text-main)', fontFamily: "'Kanit', sans-serif",
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {st.name}
                  </h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-sub)', margin: '0.1rem 0 0', fontWeight: 600 }}>
                    {st.staff}
                  </p>
                </div>

                {/* Badge + arrow */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  {type === 'ghost' ? (
                    <span style={{ background: cfg.badgeBg, color: cfg.badgeColor, fontSize: '0.7rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '999px', border: `1.5px solid ${cfg.border}`, whiteSpace: 'nowrap' }}>
                      ฟรี! ลุ้นรับแต้ม
                    </span>
                  ) : type === 'lottery' ? (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ background: cfg.badgeBg, color: cfg.badgeColor, fontSize: '0.7rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '999px', border: `1.5px solid ${cfg.border}`, whiteSpace: 'nowrap' }}>
                        เสี่ยงดวง
                      </span>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-sub)', margin: '0.2rem 0 0', fontWeight: 700 }}>จ่าย {st.cost} ลูกอม</p>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end' }}>
                        <span style={{ background: '#fef9c3', color: '#92400e', fontSize: '0.68rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '999px', border: '1.5px solid #f59e0b', whiteSpace: 'nowrap' }}>
                           -{st.cost}
                        </span>
                        <span style={{ background: '#dcfce7', color: '#166534', fontSize: '0.68rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '999px', border: '1.5px solid #22c55e', whiteSpace: 'nowrap' }}>
                           +{st.reward}
                        </span>
                      </div>
                    </div>
                  )}
                  <ChevronRight size={18} color={cfg.border} style={{ transition: 'transform 0.15s', transform: isHovered ? 'translateX(3px)' : 'translateX(0)' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Keyframes ──────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes slideInCard {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
