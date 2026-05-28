import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Settings, Plus, Minus, MonitorPlay, PartyPopper, Lock, Snowflake } from 'lucide-react';

export default function MasterAdmin() {
  const [teams, setTeams] = useState([]);           // live teams (realtime)
  const [frozenTeams, setFrozenTeams] = useState([]); // snapshot when hidden
  const [frozenTime, setFrozenTime] = useState('');   // timestamp of freeze
  const [hideScores, setHideScores] = useState(null); // null = loading
  const [loading, setLoading] = useState(true);

  // Adjust modal
  const [showAdjust, setShowAdjust] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');

  const navigate = useNavigate();
  const realtimeChannelRef = useRef(null);

  // ─── Subscribe to realtime team updates ───────────────────────────────────
  const subscribeRealtime = useCallback(() => {
    // Avoid duplicate subscriptions
    if (realtimeChannelRef.current) return;

    const ch = supabase
      .channel('master:teams')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'teams' }, () => {
        fetchTeams();
      })
      .subscribe();

    realtimeChannelRef.current = ch;
  }, []);

  const unsubscribeRealtime = useCallback(() => {
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }
  }, []);

  // ─── Fetch teams sorted by points desc ────────────────────────────────────
  const fetchTeams = async () => {
    const { data } = await supabase
      .from('teams')
      .select('*')
      .order('points', { ascending: false });
    if (data) setTeams(data);
  };

  // ─── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);

      // 1. Load teams
      await fetchTeams();

      // 2. Load settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('hide_scores')
        .eq('id', 1)
        .single();

      const hidden = settingsData?.hide_scores ?? false;
      setHideScores(hidden);

      // 3. Subscribe realtime only when scores are visible
      if (!hidden) {
        subscribeRealtime();
      }

      setLoading(false);
    };

    init();

    return () => unsubscribeRealtime();
  }, []);

  // ─── Toggle hide / show scores ────────────────────────────────────────────
  const toggleHideScore = async () => {
    const newVal = !hideScores;

    // Update Supabase settings (affects mobile team screens too)
    await supabase.from('settings').update({ hide_scores: newVal }).eq('id', 1);

    if (newVal) {
      // === HIDING: freeze current snapshot + disconnect realtime ===
      const timeStr = new Date().toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setFrozenTeams([...teams]);   // snapshot of current sorted order
      setFrozenTime(timeStr);
      unsubscribeRealtime();
    } else {
      // === SHOWING: re-fetch fresh data + reconnect realtime ===
      await fetchTeams();
      subscribeRealtime();
    }

    setHideScores(newVal);
  };

  // ─── Adjust points modal handlers ─────────────────────────────────────────
  const handleAdjustPoints = async (type) => {
    if (!selectedTeam || !adjustAmount) return;
    const amount = parseInt(adjustAmount);
    if (isNaN(amount) || amount <= 0) return;

    const newPoints =
      type === 'add' ? selectedTeam.points + amount : selectedTeam.points - amount;

    await supabase.from('teams').update({ points: newPoints }).eq('id', selectedTeam.id);

    setShowAdjust(false);
    setAdjustAmount('');
    setSelectedTeam(null);
  };

  // ─── Render helpers ───────────────────────────────────────────────────────
  const topTeam = teams[0];

  const renderBadge = (rank) => {
    const medals = { 1: { bg: '#f59e0b', border: '#d97706' }, 2: { bg: '#818cf8', border: '#4f46e5' }, 3: { bg: '#c2410c', border: '#9a3412' } };
    if (medals[rank]) {
      const m = medals[rank];
      return (
        <div style={{ width: '32px', height: '32px', background: m.bg, color: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 900, fontSize: '0.9rem', border: `2px solid ${m.border}`, flexShrink: 0 }}>
          {rank}
        </div>
      );
    }
    return (
      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b', width: '42px', paddingLeft: '0.4rem' }}>
        #{rank}
      </div>
    );
  };


  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading || hideScores === null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <p style={{ color: '#64748b', fontWeight: 700 }}>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{ width: '100%', minHeight: '100vh', padding: '1rem 2rem', boxSizing: 'border-box', background: 'var(--bg-color)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* ── Admin control bar ──────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#1e293b', padding: '0.5rem 1rem', borderRadius: '12px',
        marginBottom: '0.8rem', color: '#fff', border: '2px solid #000',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MonitorPlay size={16} color="#ff2e93" />
          <span style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.5px' }}>แผงควบคุมหลัก (แอดมิน)</span>
          {hideScores && (
            <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Snowflake size={11} /> หยุดอัปเดตชั่วคราว
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <button
            onClick={toggleHideScore}
            style={{
              background: hideScores ? '#ef4444' : '#10b981', color: '#fff',
              border: '1.5px solid #000', padding: '0.3rem 0.7rem', borderRadius: '8px',
              fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.1s'
            }}
          >
            {hideScores ? <><EyeOff size={13} /> ซ่อนอยู่</> : <><Eye size={13} /> โชว์ปกติ</>}
          </button>
          <button
            onClick={() => navigate('/reveal')}
            style={{
              background: 'linear-gradient(90deg, #ff2e93, #9d4edd)', color: '#fff',
              border: '1.5px solid #000', padding: '0.3rem 0.7rem', borderRadius: '8px',
              fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              boxShadow: '2px 2px 0px #000', transition: 'all 0.1s'
            }}
          >
            <PartyPopper size={13} /> ประกาศผลรางวัล 🚀
          </button>
        </div>
      </div>

      {/* ── Crown + Title ──────────────────────────────────────────────────── */}
      <div className="text-center" style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '2.2rem', lineHeight: 1, marginBottom: '0.1rem', filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.1))' }}>
          {hideScores ? '🔒' : '👑'}
        </div>
        <h1 style={{
          fontFamily: "'Kanit', sans-serif", fontWeight: 900, fontSize: '2.2rem',
          color: '#1e293b', letterSpacing: '1px', margin: 0, lineHeight: '1.1',
          textShadow: '-1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 1.5px 1.5px 0 #fff, 3px 3px 0px #1e293b',
          textTransform: 'uppercase'
        }}>
          LEADERBOARD
        </h1>
        <p style={{ fontFamily: "'Kanit', sans-serif", color: '#64748b', fontWeight: 700, fontSize: '0.9rem', margin: '0.2rem 0 0' }}>
          {hideScores
            ? `📸 บันทึกล่าสุดก่อนปิด: ${frozenTime} น. — คะแนนถูกซ่อนจากน้องๆ แล้ว`
            : 'สรุปตารางอันดับสะสมลูกอมประจำค่าย... (อัปเดตเรียลไทม์)'}
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODE A — SCORES VISIBLE: single full-width leaderboard table      */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {!hideScores && (
        <div style={{ flex: 1 }}>
          <div style={{
            background: '#ffffff', border: '3px solid #1e293b', borderRadius: '20px',
            boxShadow: '8px 8px 0px #1e293b', overflow: 'hidden',
            width: '100%', maxWidth: '860px', margin: '0 auto'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {teams.map((t, index) => {
                const rank = index + 1;
                const isFirst = rank === 1;
                return (
                  <div key={t.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.7rem 2rem',
                    background: isFirst ? '#fef9c3' : '#ffffff',
                    borderBottom: rank === teams.length ? 'none' : '1px solid #e2e8f0',
                    transition: 'background-color 0.2s, transform 0.15s, box-shadow 0.15s',
                    animation: `slideInRow 0.45s cubic-bezier(0.22,1,0.36,1) both`,
                    animationDelay: `${index * 0.06}s`,
                    cursor: 'default'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                  >
                    {/* Rank badge + name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.4rem' }}>
                      <div style={{ width: '60px', display: 'flex', justifyContent: 'flex-start', flexShrink: 0 }}>
                        {renderBadge(rank)}
                      </div>
                      <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e293b', margin: 0, fontFamily: "'Kanit', sans-serif", lineHeight: '1.2' }}>
                          {t.name}
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0.1rem 0 0', fontWeight: 700, letterSpacing: '0.5px' }}>
                          ID: {t.id}
                        </p>
                      </div>
                    </div>

                    {/* Score + gear */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 900, color: '#ff2e93', fontFamily: "'Kanit', sans-serif", lineHeight: 1, textShadow: '1px 1px 0px #1e293b' }}>
                          {t.points}
                        </span>
                        <span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 800, marginLeft: '0.3rem', fontFamily: "'Kanit', sans-serif" }}>
                          ลูกอม
                        </span>
                      </div>
                      <button
                        onClick={() => { setSelectedTeam(t); setShowAdjust(true); }}
                        style={{ background: 'none', border: 'none', padding: '0.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', borderRadius: '6px', color: '#94a3b8', transition: 'all 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ff2e93'}
                        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                      >
                        <Settings size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODE B — SCORES HIDDEN: full-width frozen name-only table          */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {hideScores && (
        <div style={{ flex: 1 }}>

          {/* Freeze banner */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
            background: 'linear-gradient(90deg, #1e293b 0%, #334155 100%)',
            border: '2px solid #000', borderRadius: '12px',
            padding: '0.6rem 1.2rem', marginBottom: '1.2rem',
            color: '#fff', boxShadow: '4px 4px 0px #000'
          }}>
            <Lock size={16} color="#f59e0b" />
            <span style={{ fontWeight: 800, fontSize: '0.9rem', fontFamily: "'Kanit', sans-serif" }}>
              ซ่อนคะแนนจากน้องๆ แล้ว —
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}>
              📸 บันทึกล่าสุด: {frozenTime} น.
            </span>
          </div>

          {/* Full-width name-only table */}
          <div style={{
            background: '#ffffff', border: '3px solid #1e293b', borderRadius: '16px',
            boxShadow: '8px 8px 0px #1e293b', overflow: 'hidden', width: '100%',
            maxWidth: '860px', margin: '0 auto'
          }}>
            {/* Table header */}
            <div style={{
              background: '#1e293b', color: '#fff', padding: '0.8rem 2rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ fontWeight: 900, fontSize: '1rem', fontFamily: "'Kanit', sans-serif", letterSpacing: '1px' }}>
                ชื่อกลุ่ม
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Snowflake size={13} /> หยุดอัปเดตชั่วคราว
              </span>
            </div>

            {/* Team rows — names only, no rank, no score */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {frozenTeams.map((t, idx) => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.85rem 2rem',
                  background: '#ffffff',
                  borderBottom: idx === frozenTeams.length - 1 ? 'none' : '1px solid #e2e8f0',
                  transition: 'background 0.2s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    {/* Blank circle placeholder instead of rank */}
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '50%',
                      border: '2px dashed #cbd5e1', background: '#f8fafc',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Lock size={14} color="#cbd5e1" />
                    </div>

                    <h2 style={{
                      fontSize: '1.25rem', fontWeight: 900, color: '#1e293b',
                      margin: 0, fontFamily: "'Kanit', sans-serif"
                    }}>
                      {t.name}
                    </h2>
                  </div>

                  {/* Score hidden indicator */}
                  <div style={{
                    background: '#f1f5f9', border: '2px dashed #cbd5e1',
                    borderRadius: '8px', padding: '0.3rem 0.9rem',
                    fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8',
                    fontFamily: "'Kanit', sans-serif",
                    display: 'flex', alignItems: 'center', gap: '0.3rem'
                  }}>
                    <Lock size={13} /> ??? ลูกอม
                  </div>
                </div>
              ))}
            </div>

            {/* Footer note */}
            <div style={{
              background: '#f8fafc', borderTop: '2px dashed #e2e8f0',
              padding: '0.7rem 2rem', textAlign: 'center'
            }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', margin: 0, fontFamily: "'Kanit', sans-serif" }}>
                กดปุ่ม <b>"โชว์ปกติ"</b> ในแถบด้านบนเพื่อเปิดคะแนนและกลับสู่โหมดเรียลไทม์ครับ 🔓
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Adjust points modal ───────────────────────────────────────────── */}
      {showAdjust && selectedTeam && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '380px', background: '#fff', border: '3px solid #1e293b', boxShadow: '8px 8px 0px #1e293b' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '0.8rem', color: '#1e293b', fontFamily: "'Kanit', sans-serif" }}>
              จัดการคะแนน: {selectedTeam.name}
            </h3>
            <p style={{ marginBottom: '1.2rem', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>
              คะแนนปัจจุบัน: <b style={{ color: '#ff2e93', fontSize: '1.1rem' }}>{selectedTeam.points} ลูกอม</b>
            </p>
            <div className="form-group">
              <label className="form-label" style={{ fontFamily: "'Kanit', sans-serif", fontWeight: 800 }}>
                จำนวนลูกอมที่ต้องการปรับ (ตัวเลขเท่านั้น)
              </label>
              <input
                type="number"
                className="form-control"
                value={adjustAmount}
                onChange={e => setAdjustAmount(e.target.value)}
                placeholder="เช่น 10"
                style={{ border: '2px solid #1e293b', borderRadius: '10px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
              <button onClick={() => handleAdjustPoints('add')} className="btn btn-success" style={{ flex: 1, padding: '0.7rem', fontSize: '0.95rem', border: '2px solid #000', boxShadow: '2px 2px 0px #000' }}>
                <Plus size={16} /> เพิ่มแต้ม
              </button>
              <button onClick={() => handleAdjustPoints('sub')} className="btn btn-danger" style={{ flex: 1, padding: '0.7rem', fontSize: '0.95rem', border: '2px solid #000', boxShadow: '2px 2px 0px #000' }}>
                <Minus size={16} /> ลบแต้ม
              </button>
            </div>
            <button onClick={() => setShowAdjust(false)} className="btn btn-secondary mt-3" style={{ width: '100%', padding: '0.7rem', borderRadius: '12px', fontSize: '0.95rem', border: '2px solid #000', boxShadow: '2px 2px 0px #000', background: '#f1f5f9' }}>
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* ── Global keyframes ──────────────────────────────────────────────── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }

        @keyframes slideInRow {
          from {
            opacity: 0;
            transform: translateX(-28px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scorePop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.18); }
          70%  { transform: scale(0.95); }
          100% { transform: scale(1); }
        }

        .score-num {
          display: inline-block;
          animation: scorePop 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }

        .master-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.2rem;
          width: 100%;
        }
        .master-sidebar { order: 1; }
        .master-main    { order: 2; }

        @media (min-width: 900px) {
          .master-grid {
            grid-template-columns: 38% 1fr;
          }
        }
      `}</style>
    </div>
  );
}
