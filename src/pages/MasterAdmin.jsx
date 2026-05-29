import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Settings, Plus, Minus, MonitorPlay, PartyPopper, Lock, Snowflake, BookOpen, GraduationCap } from 'lucide-react';

const majorShortnames = {
  "1. วิทยาศาสตร์สุขภาพ": "🩺 สุขภาพ",
  "2. วิศวกรรมศาสตร์": "⚙️ วิศวะ",
  "3. ศึกษาศาสตร์/ครุศาสตร์": "🍎 ครุศาสตร์",
  "4. วิทยาการและการจัดการ": "💼 จัดการ",
  "5. ศิลปกรรมศาสตร์": "🎨 ศิลปกรรม",
  "6. มนุษยศาสตร์และสังคมศาสตร์": "🗣️ มนุษย์-สังคม",
  "7. รัฐศาสตร์และนิติศาสตร์": "⚖️ นิติ-รัฐ",
  "8. วนศาสตร์": "🌲 วนศาสตร์",
  "9. ไม่รู้จะเรียนที่ไหนดี": "❓ ไม่ระบุ"
};

const majorColors = {
  "1. วิทยาศาสตร์สุขภาพ": "#E63946",
  "2. วิศวกรรมศาสตร์": "#457B9D",
  "3. ศึกษาศาสตร์/ครุศาสตร์": "#D9A014",
  "4. วิทยาการและการจัดการ": "#2A9D8F",
  "5. ศิลปกรรมศาสตร์": "#9D4EDD",
  "6. มนุษยศาสตร์และสังคมศาสตร์": "#F4A261",
  "7. รัฐศาสตร์และนิติศาสตร์": "#1D3557",
  "8. วนศาสตร์": "#40916C",
  "9. ไม่รู้จะเรียนที่ไหนดี": "#6C757D"
};

export default function MasterAdmin() {
  const [teams, setTeams] = useState([]);           // live teams (realtime)
  const [frozenTeams, setFrozenTeams] = useState([]); // snapshot when hidden
  const [frozenTime, setFrozenTime] = useState('');   // timestamp of freeze
  const [hideScores, setHideScores] = useState(null); // null = loading
  const [loading, setLoading] = useState(true);

  // TCAS allocation states
  const [allocationLoading, setAllocationLoading] = useState(false);
  const [showAllocationSummary, setShowAllocationSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [tcasStats, setTcasStats] = useState(null);

  const fetchTCASStats = async () => {
    try {
      const { data: participants, error } = await supabase
        .from('participants')
        .select('name, team, rank1');
      if (error) throw error;

      if (participants) {
        const total = participants.length;
        const submitted = participants.filter(p => p.rank1 && p.rank1 !== '').length;

        const counts = {};
        participants.forEach(p => {
          if (!p.team) return;
          if (!counts[p.team]) {
            counts[p.team] = { 
              total: 0, 
              submitted: 0,
              majors: {} // major -> count
            };
          }
          counts[p.team].total++;
          if (p.rank1 && p.rank1 !== '') {
            counts[p.team].submitted++;
            const major = p.rank1;
            counts[p.team].majors[major] = (counts[p.team].majors[major] || 0) + 1;
          }
        });

        const teamStats = Object.keys(counts).map(teamName => ({
          name: teamName,
          total: counts[teamName].total,
          submitted: counts[teamName].submitted,
          percent: counts[teamName].total > 0 ? Math.round((counts[teamName].submitted / counts[teamName].total) * 100) : 0,
          majors: counts[teamName].majors
        })).sort((a, b) => b.submitted - a.submitted);

        setTcasStats({
          total,
          submitted,
          teamStats
        });
      }
    } catch (err) {
      console.error('Error fetching TCAS stats:', err);
    }
  };

  // Adjust modal
  const [showAdjust, setShowAdjust] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');

  const navigate = useNavigate();

  const runTCASAllocation = async () => {
    if (!window.confirm('คุณต้องการประมวลผลจัดสรรสาขา/คณะ TCAS สำหรับน้องๆ ทุกคนใช่หรือไม่?')) return;
    setAllocationLoading(true);
    try {
      const { data: participants, error: pErr } = await supabase
        .from('participants')
        .select('*');
      if (pErr) throw pErr;

      const { data: teamsData, error: tErr } = await supabase
        .from('teams')
        .select('*');
      if (tErr) throw tErr;

      const teamScores = {};
      teamsData.forEach(t => {
        teamScores[t.name] = t.points || 0;
      });

      const pList = participants.map(p => {
        const score = teamScores[p.team] || 0;
        return {
          id: p.id,
          name: p.name,
          team: p.team,
          score: score,
          ranks: [p.rank1, p.rank2, p.rank3, p.rank4, p.rank5].filter(r => r && r !== ''),
          extra: p.extra || '',
          results: [null, null, null],
          randomFactor: Math.random()
        };
      }).filter(p => p.name !== '');

      const defaultQuota = [
        "1. วิทยาศาสตร์สุขภาพ",
        "2. วิศวกรรมศาสตร์",
        "3. ศึกษาศาสตร์/ครุศาสตร์",
        "4. วิทยาการและการจัดการ",
        "5. ศิลปกรรมศาสตร์",
        "6. มนุษยศาสตร์และสังคมศาสตร์",
        "7. รัฐศาสตร์และนิติศาสตร์",
        "8. วนศาสตร์",
        "9. ไม่รู้จะเรียนที่ไหนดี"
      ];

      const activities = defaultQuota.map(name => ({
        name,
        totalCap: 30,
        roundCap: 10,
        assigned: [0, 0, 0],
        list: [[], [], []]
      }));

      pList.forEach(p => {
        if (p.extra && p.extra !== '-') {
          const extras = p.extra.split(',').map(s => s.trim());
          extras.forEach(ext => {
            if (ext && !activities.some(a => a.name === ext)) {
              activities.push({
                name: ext,
                totalCap: 30,
                roundCap: 10,
                assigned: [0, 0, 0],
                list: [[], [], []]
              });
            }
          });
        }
      });

      pList.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return b.randomFactor - a.randomFactor;
      });

      for (let r = 0; r < 3; r++) {
        pList.forEach(p => {
          let found = false;
          for (let i = 0; i < p.ranks.length; i++) {
            const pref = p.ranks[i];
            const act = activities.find(a => a.name === pref);
            
            if (act && !p.results.includes(pref) && act.assigned[r] < act.roundCap) {
              p.results[r] = pref;
              act.assigned[r]++;
              act.list[r].push(p.name);
              found = true;
              break;
            }
          }
          if (!found) {
            for (let i = 0; i < p.ranks.length; i++) {
              const pref = p.ranks[i];
              const act = activities.find(a => a.name === pref);
              
              if (act && !p.results.includes(pref) && act.assigned[r] < act.totalCap) {
                p.results[r] = pref;
                act.assigned[r]++;
                act.list[r].push(p.name);
                break;
              }
            }
          }
        });
      }

      // === Apply Hybrid Option for Round 3 (index 2) ===
      pList.forEach(p => {
        if (p.extra && p.extra !== '-') {
          const r3Result = p.results[2];
          if (r3Result && r3Result !== p.extra) {
            p.results[2] = `${r3Result} หรือ ${p.extra}`;
          } else if (!r3Result) {
            p.results[2] = p.extra;
          }
        }
      });

      console.log('Updating participants in Supabase...');
      const chunkSize = 30;
      for (let i = 0; i < pList.length; i += chunkSize) {
        const chunk = pList.slice(i, i + chunkSize);
        const updatePromises = chunk.map(p => 
          supabase
            .from('participants')
            .update({
              r1: p.results[0] || 'รอดำเนินการประกาศผล',
              r2: p.results[1] || 'รอดำเนินการประกาศผล',
              r3: p.results[2] || 'รอดำเนินการประกาศผล'
            })
            .eq('id', p.id)
        );
        await Promise.all(updatePromises);
      }

      const stats = activities.map(act => ({
        name: act.name,
        r1: act.assigned[0],
        r2: act.assigned[1],
        r3: act.assigned[2],
        total: act.assigned[0] + act.assigned[1] + act.assigned[2]
      })).filter(s => s.total > 0);

      setSummaryData({
        totalAllocated: pList.length,
        stats: stats
      });
      setShowAllocationSummary(true);

      await fetchTCASStats();
      alert('🎉 ประมวลผลจัดสรรรอบคณะสำเร็จเรียบร้อยแล้ว!');
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการประมวลผล: ' + err.message);
    } finally {
      setAllocationLoading(false);
    }
  };
  const realtimeChannelRef = useRef(null);

  // ─── Subscribe to realtime team updates ───────────────────────────────────
  const subscribeRealtime = useCallback(() => {
    // Avoid duplicate subscriptions
    if (realtimeChannelRef.current) return;

    const ch = supabase
      .channel('master:teams')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'teams' }, (payload) => {
        const updatedTeam = payload.new;
        setTeams(prevTeams => {
          const newTeams = prevTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t);
          return [...newTeams].sort((a, b) => b.points - a.points);
        });
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
      await fetchTCASStats();

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

    // 1. Update Database
    await supabase.from('teams').update({ points: newPoints }).eq('id', selectedTeam.id);

    // 2. Update local states immediately (both live teams and frozen snapshot)
    const updateArray = (prev) => {
      const updated = prev.map(t => t.id === selectedTeam.id ? { ...t, points: newPoints } : t);
      return hideScores ? updated : [...updated].sort((a, b) => b.points - a.points);
    };
    setTeams(updateArray);
    setFrozenTeams(updateArray);

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
            onClick={() => navigate('/how-to-play')}
            style={{
              background: '#475569', color: '#fff',
              border: '1.5px solid #000', padding: '0.3rem 0.7rem', borderRadius: '8px',
              fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.1s'
            }}
          >
            <BookOpen size={13} /> วิธีการเล่น
          </button>
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
            <PartyPopper size={13} /> ประกาศผลรางวัล
          </button>
          
          <button
            onClick={runTCASAllocation}
            disabled={allocationLoading}
            style={{
              background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)', color: '#fff',
              border: '1.5px solid #000', padding: '0.3rem 0.7rem', borderRadius: '8px',
              fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              boxShadow: '2px 2px 0px #000', transition: 'all 0.1s',
              opacity: allocationLoading ? 0.7 : 1
            }}
          >
            <GraduationCap size={13} /> {allocationLoading ? 'กำลังจัดสรร...' : 'ประมวลผล TCAS'}
          </button>
        </div>
      </div>

      <div className="text-center" style={{ marginBottom: '1rem' }}>
        <h1 style={{
          fontFamily: "'Kanit', sans-serif", fontWeight: 900, fontSize: '2rem',
          color: '#1e293b', letterSpacing: '2px', margin: 0, lineHeight: '1.1',
          textTransform: 'uppercase'
        }}>
          LEADERBOARD
        </h1>
        <p style={{ fontFamily: "'Kanit', sans-serif", color: '#64748b', fontWeight: 600, fontSize: '0.82rem', margin: '0.3rem 0 0' }}>
          {hideScores
            ? `บันทึกล่าสุดก่อนปิด: ${frozenTime} น. — คะแนนถูกซ่อนอยู่`
            : 'อัปเดตแบบเรียลไทม์'}
        </p>
      </div>

      {/* 📊 DOUBLE COLUMN LAYOUT: TCAS DASHBOARD (LEFT) & CANDY LEADERBOARD (RIGHT) */}
      <div className="master-grid" style={{ flex: 1, width: '100%' }}>
        
        {/* ============================================================== */}
        {/* LEFT COLUMN: TCAS DASHBOARD & LEADERBOARD                     */}
        {/* ============================================================== */}
        <div className="master-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            background: '#ffffff', border: '3px solid #1e293b', borderRadius: '20px',
            boxShadow: '6px 6px 0px #1e293b', padding: '1.2rem', display: 'flex', flexDirection: 'column',
            gap: '1rem', height: 'fit-content'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2.5px solid #1e293b', paddingBottom: '0.6rem' }}>
              <GraduationCap size={24} color="#1d4ed8" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e293b', margin: 0, fontFamily: "'Kanit', sans-serif" }}>
                📊 แดชบอร์ดจัดสรร TCAS
              </h2>
            </div>

            {/* Overall Submission Progress */}
            {tcasStats && (
              <div style={{ background: '#f8fafc', border: '2px solid #1e293b', borderRadius: '12px', padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>
                  <span>ความคืบหน้าการส่งอันดับ</span>
                  <span style={{ color: '#ff2e93', fontSize: '1rem', fontWeight: 900 }}>
                    {tcasStats.submitted} / {tcasStats.total} คน ({tcasStats.total > 0 ? Math.round((tcasStats.submitted / tcasStats.total) * 100) : 0}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '14px', background: '#cbd5e1', borderRadius: '999px', border: '2px solid #1e293b', overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    width: `${tcasStats.total > 0 ? (tcasStats.submitted / tcasStats.total) * 100 : 0}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #3b82f6, #ff2e93)',
                    borderRadius: '999px',
                    transition: 'width 0.5s ease-out'
                  }} />
                </div>
              </div>
            )}

            {/* Teams Leaderboard sorted by submitted count */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#64748b', margin: '0.2rem 0 0', fontFamily: "'Kanit', sans-serif", letterSpacing: '0.5px' }}>
                🏆 ลีดเดอร์บอร์ดบ้านส่ง TCAS
              </h3>

              {tcasStats?.teamStats.map((team, idx) => {
                const teamSub = team.submitted;
                const teamTot = team.total;
                const isAllSubmitted = teamSub === teamTot && teamTot > 0;
                
                return (
                  <div key={team.name} style={{
                    background: isAllSubmitted ? '#f0fdf4' : '#ffffff',
                    border: '2px solid #1e293b',
                    borderRadius: '14px',
                    padding: '0.8rem',
                    boxShadow: '3px 3px 0px #1e293b',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    transition: 'transform 0.15s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    {/* Team header status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{
                          width: '20px', height: '20px',
                          borderRadius: '50%',
                          background: idx === 0 ? '#f59e0b' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#b45309' : '#e2e8f0',
                          border: '1.5px solid #1e293b',
                          color: idx < 3 ? '#ffffff' : '#475569',
                          fontSize: '0.7rem',
                          fontWeight: 900,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {idx + 1}
                        </span>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: '#1e293b', fontFamily: "'Kanit', sans-serif" }}>
                          {team.name}
                        </h4>
                      </div>
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: 900,
                        color: isAllSubmitted ? '#15803d' : '#ff2e93',
                        background: isAllSubmitted ? '#dcfce7' : '#fee2e2',
                        border: '1.5px solid #1e293b',
                        padding: '0.1rem 0.5rem',
                        borderRadius: '6px'
                      }}>
                        {teamSub} / {teamTot} คน
                      </span>
                    </div>

                    {/* Progress Bar for team */}
                    <div style={{ width: '100%', height: '8px', background: '#cbd5e1', borderRadius: '999px', border: '1.5px solid #1e293b', overflow: 'hidden' }}>
                      <div style={{
                        width: `${teamTot > 0 ? (teamSub / teamTot) * 100 : 0}%`,
                        height: '100%',
                        background: isAllSubmitted ? '#10b981' : '#ff2e93',
                        transition: 'width 0.4s ease-out'
                      }} />
                    </div>

                    {/* Majors selection breakdown under this team */}
                    {Object.keys(team.majors).length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.2rem', borderTop: '1px dashed #cbd5e1', paddingTop: '0.4rem' }}>
                        {Object.entries(team.majors)
                          .sort((a, b) => b[1] - a[1])
                          .map(([majorName, count]) => {
                            const label = majorShortnames[majorName] || majorName;
                            const color = majorColors[majorName] || '#64748b';
                            return (
                              <span key={majorName} style={{
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                background: '#f8fafc',
                                border: `1.5px solid #1e293b`,
                                borderRadius: '6px',
                                padding: '0.1rem 0.35rem',
                                color: color,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem'
                              }}>
                                {label} <b style={{ color: '#1e293b', marginLeft: '0.1rem' }}>{count}</b>
                              </span>
                            );
                          })}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '0.1rem' }}>
                        ยังไม่มีน้องส่งข้อมูล
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: CANDY LEADERBOARD (LIVE OR SNAPPED)             */}
        {/* ============================================================== */}
        <div className="master-main" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* MODE A — SCORES VISIBLE */}
          {!hideScores && (
            <div style={{
              background: '#ffffff', border: '3px solid #1e293b', borderRadius: '20px',
              boxShadow: '8px 8px 0px #1e293b', overflow: 'hidden',
              width: '100%'
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
          )}

          {/* MODE B — SCORES HIDDEN */}
          {hideScores && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Freeze banner */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                background: 'linear-gradient(90deg, #1e293b 0%, #334155 100%)',
                border: '2px solid #000', borderRadius: '12px',
                padding: '0.6rem 1.2rem',
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
                boxShadow: '8px 8px 0px #1e293b', overflow: 'hidden', width: '100%'
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

                {/* Team rows — names only */}
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

                      {/* Score hidden indicator + Edit button */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div style={{
                          background: '#f1f5f9', border: '2px dashed #cbd5e1',
                          borderRadius: '8px', padding: '0.3rem 0.9rem',
                          fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8',
                          fontFamily: "'Kanit', sans-serif",
                          display: 'flex', alignItems: 'center', gap: '0.3rem'
                        }}>
                          <Lock size={13} /> ??? ลูกอม
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
        </div>
      </div>

      {/* ── Adjust points modal ───────────────────────────────────────────── */}
      {showAdjust && selectedTeam && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '380px', background: '#fff', border: '3px solid #1e293b', boxShadow: '8px 8px 0px #1e293b' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '0.8rem', color: '#1e293b', fontFamily: "'Kanit', sans-serif" }}>
              จัดการคะแนน: {selectedTeam.name}
            </h3>
            <p style={{ marginBottom: '1.2rem', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>
              คะแนนปัจจุบัน: <b style={{ color: '#ff2e93', fontSize: '1.1rem' }}>{hideScores ? '🔒 ถูกซ่อนอยู่' : `${selectedTeam.points} ลูกอม`}</b>
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

      {/* ── TCAS Allocation Summary modal ────────────────────────────────────── */}
      {showAllocationSummary && summaryData && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '500px', background: '#fff', border: '3px solid #1e293b', boxShadow: '8px 8px 0px #1e293b', maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.8rem', color: '#1d4ed8', fontFamily: "'Kanit', sans-serif" }}>
              🎉 สรุปผลการจัดสรรคณะ TCAS สำเร็จ!
            </h3>
            <p style={{ marginBottom: '1.2rem', color: '#64748b', fontWeight: 700, fontSize: '0.95rem' }}>
              ประมวลผลนักเรียนทั้งหมด: <span style={{ color: '#ff2e93', fontSize: '1.1rem', fontWeight: 900 }}>{summaryData.totalAllocated} คน</span>
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', background: '#1e293b', color: 'white', padding: '0.5rem 0.8rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.8rem' }}>
                <span style={{ flex: 1 }}>สาขา/คณะ</span>
                <span style={{ width: '50px', textAlign: 'center' }}>รอบ 1</span>
                <span style={{ width: '50px', textAlign: 'center' }}>รอบ 2</span>
                <span style={{ width: '50px', textAlign: 'center' }}>รอบ 3</span>
                <span style={{ width: '60px', textAlign: 'center' }}>รวม</span>
              </div>
              {summaryData.stats.map((stat, idx) => (
                <div key={idx} style={{ display: 'flex', padding: '0.5rem 0.8rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.88rem', fontWeight: 700 }}>
                  <span style={{ flex: 1, color: '#1e293b' }}>{stat.name}</span>
                  <span style={{ width: '50px', textAlign: 'center', color: '#64748b' }}>{stat.r1}</span>
                  <span style={{ width: '50px', textAlign: 'center', color: '#64748b' }}>{stat.r2}</span>
                  <span style={{ width: '50px', textAlign: 'center', color: '#64748b' }}>{stat.r3}</span>
                  <span style={{ width: '60px', textAlign: 'center', color: '#ff2e93', fontWeight: 900 }}>{stat.total}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setShowAllocationSummary(false)} className="btn btn-secondary" style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', fontSize: '1rem', border: '2px solid #000', boxShadow: '2px 2px 0px #000' }}>
              ปิดหน้าต่างสรุปผล
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
