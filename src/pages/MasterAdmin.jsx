import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';
import { Eye, EyeOff, Settings, Plus, Minus, MonitorPlay, PartyPopper, Lock, Snowflake, BookOpen, GraduationCap, Database, Trash2, Heart, MessageSquare, QrCode, X, AlertTriangle } from 'lucide-react';

const majorShortnames = {
  "วิทยาศาสตร์สุขภาพ": "สุขภาพ",
  "วิศวกรรมศาสตร์": "วิศวะ",
  "ศึกษาศาสตร์/ครุศาสตร์": "ครุศาสตร์",
  "วิทยาการและการจัดการ": "จัดการ",
  "พยาบาลศาสตร์": "พยาบาล",
  "มนุษยศาสตร์และสังคมศาสตร์": "มนุษย์-สังคม",
  "รัฐศาสตร์และนิติศาสตร์": "นิติ-รัฐ",
  "วนศาสตร์": "วนศาสตร์",
  "ไม่รู้จะเรียนที่ไหนดี": "ไม่ระบุ"
};

const majorColors = {
  "วิทยาศาสตร์สุขภาพ": "#E63946",
  "วิศวกรรมศาสตร์": "#457B9D",
  "ศึกษาศาสตร์/ครุศาสตร์": "#D9A014",
  "วิทยาการและการจัดการ": "#2A9D8F",
  "พยาบาลศาสตร์": "#9D4EDD",
  "มนุษยศาสตร์และสังคมศาสตร์": "#F4A261",
  "รัฐศาสตร์และนิติศาสตร์": "#1D3557",
  "วนศาสตร์": "#40916C",
  "ไม่รู้จะเรียนที่ไหนดี": "#6C757D"
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
  const [showPreAllocation, setShowPreAllocation] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [tcasStats, setTcasStats] = useState(null);
  const [selectedTeamForModal, setSelectedTeamForModal] = useState(null);
  const [mocking, setMocking] = useState(false);

  const handleMockTCAS = async () => {
    if (!window.confirm("คุณต้องการจำลองอันดับคณะ (Mock) ให้น้องๆ ทุกคนในระบบสุ่ม (รวมถึงสุ่มสังกัดบ้าน) เพื่อใช้ในการทดสอบใช่หรือไม่?")) return;
    setMocking(true);
    try {
      const { data: participants, error } = await supabase
        .from('participants')
        .select('id');
      if (error) throw error;

      const teamNames = teams.map(t => t.name);
      if (teamNames.length === 0) {
        throw new Error("ไม่พบข้อมูลกลุ่ม/บ้านในระบบ");
      }

      const defaultMajors = [
        "1. วิทยาศาสตร์สุขภาพ",
        "2. วิศวกรรมศาสตร์",
        "3. ศึกษาศาสตร์/ครุศาสตร์",
        "4. วิทยาการและการจัดการ",
        "5. พยาบาลศาสตร์",
        "6. มนุษยศาสตร์และสังคมศาสตร์",
        "7. รัฐศาสตร์และนิติศาสตร์",
        "8. วนศาสตร์",
        "9. ไม่รู้จะเรียนที่ไหนดี"
      ];

      const updates = participants.map(p => {
        const shuffled = [...defaultMajors].sort(() => 0.5 - Math.random());
        const randomTeam = teamNames[Math.floor(Math.random() * teamNames.length)];
        return supabase
          .from('participants')
          .update({
            team: randomTeam,
            rank1: shuffled[0],
            rank2: shuffled[1],
            rank3: shuffled[2],
            rank4: shuffled[3],
            rank5: shuffled[4]
          })
          .eq('id', p.id);
      });

      await Promise.all(updates);
      alert("จำลองสถิติเลือกอันดับ TCAS และสุ่มสังกัดบ้านให้น้องๆ ทุกคนสำเร็จ!");
      await fetchTCASStats();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการจำลองข้อมูล: " + err.message);
    } finally {
      setMocking(false);
    }
  };

  const handleClearTCAS = async () => {
    if (!window.confirm("⚠️ คำเตือน: คุณต้องการล้างข้อมูลอันดับคณะ สังกัดบ้าน และผลลัพธ์ทั้งหมดของน้องทุกคนให้เป็นค่าเริ่มต้นใช่หรือไม่?")) return;
    setMocking(true);
    try {
      const { error } = await supabase
        .from('participants')
        .update({
          team: null,
          rank1: null,
          rank2: null,
          rank3: null,
          rank4: null,
          rank5: null,
          r1: null,
          r2: null,
          r3: null
        })
        .not('name', 'is', null);

      if (error) throw error;
      alert("ล้างข้อมูลการเลือกคณะ ผลการจัดสรร และสังกัดบ้านเรียบร้อยแล้ว!");
      await fetchTCASStats();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการล้างข้อมูล: " + err.message);
    } finally {
      setMocking(false);
    }
  };

  const fetchTCASStats = async () => {
    try {
      const { data: participants, error } = await supabase
        .from('participants')
        .select('name, team, rank1');
      if (error) throw error;

      if (participants) {
        // Filter out participants without a team
        const filteredParticipants = participants.filter(p => p.team && p.team !== '');
        const total = filteredParticipants.length;
        const submitted = filteredParticipants.filter(p => p.rank1 && p.rank1 !== '').length;

        const counts = {};
        filteredParticipants.forEach(p => {
          const teamName = p.team;
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
            let major = p.rank1.replace(/^\d+\.\s*/, '').trim();
            counts[teamName].majors[major] = (counts[teamName].majors[major] || 0) + 1;
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
          teamStats,
          rawParticipants: filteredParticipants
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

  // Feedback states
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [showFeedbackQR, setShowFeedbackQR] = useState(false);

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
      }).filter(p => p.name !== '' && p.ranks.length > 0);

      const defaultQuota = [
        "1. วิทยาศาสตร์สุขภาพ",
        "2. วิศวกรรมศาสตร์",
        "3. ศึกษาศาสตร์/ครุศาสตร์",
        "4. วิทยาการและการจัดการ",
        "5. พยาบาลศาสตร์",
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
  const feedbackChannelRef = useRef(null);

  // ─── Subscribe to realtime feedback updates ───────────────────────────────────
  const subscribeFeedback = useCallback(() => {
    if (feedbackChannelRef.current) return;

    const ch = supabase
      .channel('master:feedback')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feedback' }, async (payload) => {
        const newFb = payload.new;
        const studentName = newFb.student_name || 'ผู้ไม่ประสงค์ออกนาม';

        // 1. Update submitted state count
        setFeedbackCount(prev => prev + 1);

        // 2. Confetti burst
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();

        // 3. Toast notification
        const toastId = Date.now() + Math.random().toString(36).substr(2, 9);
        const newToast = {
          id: toastId,
          message: `มีข้อความความรู้สึกจาก คุณ ${studentName} ส่งเข้ามาแล้ว!`
        };
        setToasts(prev => [...prev, newToast]);

        // Auto remove toast
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toastId));
        }, 6000);
      })
      .subscribe();

    feedbackChannelRef.current = ch;
  }, []);

  const unsubscribeFeedback = useCallback(() => {
    if (feedbackChannelRef.current) {
      supabase.removeChannel(feedbackChannelRef.current);
      feedbackChannelRef.current = null;
    }
  }, []);

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

      // 1.5 Load existing feedbacks to populate submitted count
      const { data: existingFeedbacks } = await supabase
        .from('feedback')
        .select('id');
      if (existingFeedbacks) {
        setFeedbackCount(existingFeedbacks.length);
      }

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

      // Subscribe to feedback realtime (always active)
      subscribeFeedback();

      setLoading(false);
    };

    init();

    return () => {
      unsubscribeRealtime();
      unsubscribeFeedback();
    };
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
            onClick={() => navigate('/crisis-slides')}
            style={{
              background: '#f59e0b', color: '#fff',
              border: '1.5px solid #000', padding: '0.3rem 0.7rem', borderRadius: '8px',
              fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              boxShadow: '2px 2px 0px #000', transition: 'all 0.1s'
            }}
          >
            <AlertTriangle size={13} /> สไลด์กิจกรรมวิกฤต
          </button>
          <button
            onClick={() => setShowFeedbackQR(true)}
            style={{
              background: '#ff2e93', color: '#fff',
              border: '1.5px solid #000', padding: '0.3rem 0.7rem', borderRadius: '8px',
              fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              boxShadow: '2px 2px 0px #000', transition: 'all 0.1s'
            }}
          >
            <Heart size={13} fill="#fff" /> ฟอร์มความรู้สึก ({feedbackCount} ข้อความ)
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
            onClick={() => setShowPreAllocation(true)}
            disabled={allocationLoading || mocking}
            style={{
              background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)', color: '#fff',
              border: '1.5px solid #000', padding: '0.3rem 0.7rem', borderRadius: '8px',
              fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              boxShadow: '2px 2px 0px #000', transition: 'all 0.1s',
              opacity: (allocationLoading || mocking) ? 0.7 : 1
            }}
          >
            <GraduationCap size={13} /> {allocationLoading ? 'กำลังจัดสรร...' : 'ประมวลผล TCAS'}
          </button>

          <button
            onClick={handleMockTCAS}
            disabled={allocationLoading || mocking}
            style={{
              background: 'linear-gradient(90deg, #f59e0b, #d97706)', color: '#fff',
              border: '1.5px solid #000', padding: '0.3rem 0.7rem', borderRadius: '8px',
              fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              boxShadow: '2px 2px 0px #000', transition: 'all 0.1s',
              opacity: (allocationLoading || mocking) ? 0.7 : 1
            }}
          >
            <Database size={13} /> {mocking ? 'กำลังจำลอง...' : 'ม๊อกสถิติ'}
          </button>

          <button
            onClick={handleClearTCAS}
            disabled={allocationLoading || mocking}
            style={{
              background: 'linear-gradient(90deg, #ef4444, #dc2626)', color: '#fff',
              border: '1.5px solid #000', padding: '0.3rem 0.7rem', borderRadius: '8px',
              fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              boxShadow: '2px 2px 0px #000', transition: 'all 0.1s',
              opacity: (allocationLoading || mocking) ? 0.7 : 1
            }}
          >
            <Trash2 size={13} /> ล้างสถิติ
          </button>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        width: '100%',
        maxWidth: '860px',
        margin: '0 auto 1.5rem',
      }}>
        {/* Title & subtitle */}
        <div style={{ flex: 1, minWidth: '240px' }}>
          <h1 style={{
            fontFamily: "'Kanit', sans-serif", fontWeight: 900, fontSize: '2.2rem',
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

        {/* Overall TCAS progress box on the right */}
        {tcasStats && (
          <div style={{
            background: '#ffffff',
            border: '3px solid #1e293b',
            borderRadius: '16px',
            boxShadow: '4px 4px 0px #1e293b',
            padding: '0.7rem 1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            minWidth: '260px',
            background: '#fef9c3' // yellow background matching leaderboard rank #1
          }}>
            <GraduationCap size={28} color="#ff2e93" />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', fontFamily: "'Kanit', sans-serif", textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                ความคืบหน้าการส่ง TCAS
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 950, color: '#ff2e93', fontFamily: "'Kanit', sans-serif", lineHeight: 1 }}>
                  {tcasStats.submitted}
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', fontFamily: "'Kanit', sans-serif" }}>
                  / 165 คน
                </span>
              </div>
              {/* Mini progress bar */}
              <div style={{ width: '100%', height: '6px', background: '#cbd5e1', borderRadius: '999px', border: '1.5px solid #1e293b', overflow: 'hidden', marginTop: '0.2rem' }}>
                <div style={{
                  width: `${Math.min(100, Math.round((tcasStats.submitted / 165) * 100))}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #3b82f6, #ff2e93)',
                }} />
              </div>
            </div>
          </div>
        )}
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
                const tStat = tcasStats?.teamStats.find(ts => ts.name === t.name);
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
                        <h2 
                          onClick={() => setSelectedTeamForModal(t.name)}
                          onMouseEnter={e => { e.currentTarget.style.color = '#ff2e93'; e.currentTarget.style.textDecoration = 'underline'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#1e293b'; e.currentTarget.style.textDecoration = 'none'; }}
                          style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e293b', margin: 0, fontFamily: "'Kanit', sans-serif", lineHeight: '1.2', cursor: 'pointer', transition: 'color 0.2s' }}
                        >
                          {t.name}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.15rem' }}>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                            ID: {t.id}
                          </span>
                          {tStat && (
                            <span 
                              onClick={() => setSelectedTeamForModal(t.name)}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff2e93'; e.currentTarget.style.background = '#fff0f6'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.background = tStat.submitted === tStat.total ? '#dcfce7' : '#f1f5f9'; }}
                              style={{
                                background: tStat.submitted === tStat.total ? '#dcfce7' : '#f1f5f9',
                                color: tStat.submitted === tStat.total ? '#15803d' : '#475569',
                                border: '1.5px solid #1e293b',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '0.15rem 0.45rem',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              {tStat.submitted} คน
                            </span>
                          )}
                        </div>
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
            color: '#fff', boxShadow: '4px 4px 0px #000',
            maxWidth: '860px', margin: '0 auto 1.2rem'
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

            {/* Team rows — names only */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {frozenTeams.map((t, idx) => {
                const tStat = tcasStats?.teamStats.find(ts => ts.name === t.name);
                return (
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

                      <div>
                        <h2 
                          onClick={() => setSelectedTeamForModal(t.name)}
                          onMouseEnter={e => { e.currentTarget.style.color = '#ff2e93'; e.currentTarget.style.textDecoration = 'underline'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#1e293b'; e.currentTarget.style.textDecoration = 'none'; }}
                          style={{
                            fontSize: '1.25rem', fontWeight: 900, color: '#1e293b',
                            margin: 0, fontFamily: "'Kanit', sans-serif", cursor: 'pointer', transition: 'color 0.2s'
                          }}
                        >
                          {t.name}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.15rem' }}>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                            ID: {t.id}
                          </span>
                          {tStat && (
                            <span 
                              onClick={() => setSelectedTeamForModal(t.name)}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff2e93'; e.currentTarget.style.background = '#fff0f6'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.background = tStat.submitted === tStat.total ? '#dcfce7' : '#f1f5f9'; }}
                              style={{
                                background: tStat.submitted === tStat.total ? '#dcfce7' : '#f1f5f9',
                                color: tStat.submitted === tStat.total ? '#15803d' : '#475569',
                                border: '1.5px solid #1e293b',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '0.15rem 0.45rem',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              {tStat.submitted} คน
                            </span>
                          )}
                        </div>
                      </div>
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
                );
              })}
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
              <div style={{ display: 'flex', background: '#1e293b', color: 'white', padding: '0.5rem 0.8rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.75rem', alignItems: 'center' }}>
                <span style={{ flex: 1 }}>สาขา/คณะ</span>
                <span style={{ width: '65px', textAlign: 'center', lineHeight: 1.1 }}>รอบ 1<br/><span style={{ fontSize: '0.55rem', opacity: 0.8 }}>09:30-10:05</span></span>
                <span style={{ width: '65px', textAlign: 'center', lineHeight: 1.1 }}>รอบ 2<br/><span style={{ fontSize: '0.55rem', opacity: 0.8 }}>10:15-11:00</span></span>
                <span style={{ width: '65px', textAlign: 'center', lineHeight: 1.1 }}>รอบ 3<br/><span style={{ fontSize: '0.55rem', opacity: 0.8 }}>11:15-12:00</span></span>
                <span style={{ width: '60px', textAlign: 'center' }}>รวม</span>
              </div>
              {summaryData.stats.map((stat, idx) => (
                <div key={idx} style={{ display: 'flex', padding: '0.5rem 0.8rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.88rem', fontWeight: 700, alignItems: 'center' }}>
                  <span style={{ flex: 1, color: '#1e293b' }}>{stat.name}</span>
                  <span style={{ width: '65px', textAlign: 'center', color: '#64748b' }}>{stat.r1}</span>
                  <span style={{ width: '65px', textAlign: 'center', color: '#64748b' }}>{stat.r2}</span>
                  <span style={{ width: '65px', textAlign: 'center', color: '#64748b' }}>{stat.r3}</span>
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

      {/* ── TCAS Pre-Allocation Summary Modal (Matrix Table) ────────────────────────────────── */}
      {showPreAllocation && tcasStats && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="glass-card" style={{ width: '95%', maxWidth: '1050px', background: '#fff', border: '3.5px solid #1e293b', boxShadow: '12px 12px 0px #1e293b', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #1e293b', paddingBottom: '0.8rem', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GraduationCap size={28} color="#1d4ed8" />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', margin: 0, fontFamily: "'Kanit', sans-serif" }}>
                  ตารางวิเคราะห์อันดับตัวเลือก (สถิติก่อนการจัดสรรรอบคณะ)
                </h3>
              </div>
              <button 
                onClick={() => setShowPreAllocation(false)}
                style={{ background: '#f1f5f9', border: '2.5px solid #1e293b', borderRadius: '8px', cursor: 'pointer', padding: '0.3rem 0.6rem', fontWeight: 900, fontSize: '0.85rem', boxShadow: '2px 2px 0px #1e293b', transition: 'all 0.1s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; e.currentTarget.style.boxShadow = '3px 3px 0px #1e293b'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '2px 2px 0px #1e293b'; }}
              >
                ✕ ปิด
              </button>
            </div>
            
            <p style={{ color: '#64748b', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.2rem', marginTop: 0 }}>
              * ตารางแสดงข้อมูลจำนวนน้องๆ ใน<b>แต่ละบ้าน (แถว)</b> ที่เลือกคณะต่างๆ เป็น<b>อันดับที่ 1 (คอลัมน์)</b> เพื่อสรุปความต้องการเข้าเรียนก่อนรันระบบจัดสรรอัตโนมัติ
            </p>

            <div style={{ overflowX: 'auto', marginBottom: '1.5rem', border: '3px solid #1e293b', borderRadius: '16px', boxShadow: '4px 4px 0px #1e293b' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', fontFamily: "'Kanit', sans-serif", background: '#ffffff', minWidth: '850px' }}>
                <thead>
                  <tr style={{ background: '#1e293b', color: '#ffffff', textAlign: 'center' }}>
                    <th style={{ padding: '0.8rem 1rem', borderRight: '2.5px solid #1e293b', borderBottom: '2.5px solid #1e293b', textAlign: 'left', fontWeight: 900, fontSize: '0.9rem', width: '220px', background: '#1e293b', position: 'sticky', left: 0, zIndex: 10 }}>บ้าน / กลุ่ม</th>
                    {Object.values(majorShortnames).map(name => (
                      <th key={name} style={{ padding: '0.8rem 0.5rem', borderRight: '2px solid #cbd5e1', borderBottom: '2.5px solid #1e293b', fontSize: '0.78rem', fontWeight: 900 }}>{name}</th>
                    ))}
                    <th style={{ padding: '0.8rem 0.5rem', borderBottom: '2.5px solid #1e293b', background: '#ff2e93', color: '#fff', fontWeight: 900, fontSize: '0.82rem', width: '70px' }}>ส่งแล้ว</th>
                  </tr>
                </thead>
                <tbody>
                  {tcasStats.teamStats.map((team, idx) => {
                    let teamRowTotal = 0;
                    return (
                      <tr key={team.name} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc', textAlign: 'center', fontWeight: 700, borderBottom: '1px solid #cbd5e1' }}>
                        <td 
                          onClick={() => setSelectedTeamForModal(team.name)}
                          onMouseEnter={e => { e.currentTarget.style.color = '#ff2e93'; e.currentTarget.style.textDecoration = 'underline'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#1e293b'; e.currentTarget.style.textDecoration = 'none'; }}
                          style={{ 
                            padding: '0.7rem 1rem', 
                            borderRight: '2.5px solid #1e293b', 
                            textAlign: 'left', 
                            fontWeight: 900, 
                            color: '#1e293b', 
                            background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                            position: 'sticky', 
                            left: 0, 
                            zIndex: 5,
                            boxShadow: '2px 0px 4px rgba(0,0,0,0.05)',
                            cursor: 'pointer',
                            transition: 'color 0.2s'
                          }}
                        >
                          {team.name} 🔍
                        </td>
                        {Object.keys(majorShortnames).map(majorKey => {
                          const count = team.majors[majorKey] || 0;
                          teamRowTotal += count;
                          return (
                            <td key={majorKey} style={{ 
                              padding: '0.7rem 0.5rem', 
                              borderRight: '1.5px solid #e2e8f0',
                              background: count > 0 ? '#fef9c3' : 'transparent',
                              color: count > 0 ? '#ff2e93' : '#cbd5e1',
                              fontSize: count > 0 ? '1rem' : '0.8rem',
                              fontWeight: count > 0 ? 900 : 500
                            }}>
                              {count > 0 ? count : '-'}
                            </td>
                          );
                        })}
                        <td style={{ padding: '0.7rem 0.5rem', background: '#fee2e2', fontWeight: 900, color: '#ef4444', fontSize: '0.95rem', borderLeft: '1.5px solid #cbd5e1' }}>
                          {teamRowTotal} คน
                        </td>
                      </tr>
                    );
                  })}
                  {/* Column totals */}
                  <tr style={{ background: '#e2e8f0', textAlign: 'center', fontWeight: 900, borderTop: '2.5px solid #1e293b' }}>
                    <td style={{ padding: '0.8rem 1rem', borderRight: '2.5px solid #1e293b', textAlign: 'left', background: '#cbd5e1', color: '#1e293b', position: 'sticky', left: 0, zIndex: 10 }}>รวมทั้งหมด</td>
                    {Object.keys(majorShortnames).map(majorKey => {
                      let colSum = 0;
                      tcasStats.teamStats.forEach(team => {
                        colSum += (team.majors[majorKey] || 0);
                      });
                      return (
                        <td key={majorKey} style={{ padding: '0.8rem 0.5rem', borderRight: '1.5px solid #cbd5e1', color: '#1d4ed8', fontSize: '1rem', fontWeight: 900 }}>
                          {colSum}
                        </td>
                      );
                    })}
                    <td style={{ padding: '0.8rem 0.5rem', background: '#1e293b', color: '#fff', fontSize: '1.05rem', fontWeight: 950 }}>
                      {tcasStats.submitted} / 165 คน
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowPreAllocation(false)} 
                className="btn btn-secondary" 
                style={{ padding: '0.8rem 1.8rem', borderRadius: '14px', fontSize: '1rem', border: '2.5px solid #1e293b', boxShadow: '4px 4px 0px #1e293b', background: '#f1f5f9', fontWeight: 800 }}
              >
                ✕ ปิดหน้าต่างตรวจสอบ
              </button>
              <button 
                onClick={() => {
                  setShowPreAllocation(false);
                  runTCASAllocation();
                }} 
                className="btn btn-primary" 
                style={{
                  background: 'linear-gradient(90deg, #10b981, #059669)', 
                  color: '#fff',
                  border: '2.5px solid #000', 
                  padding: '0.8rem 2rem', 
                  borderRadius: '14px', 
                  fontSize: '1rem', 
                  fontWeight: 900,
                  boxShadow: '4px 4px 0px #000',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <GraduationCap size={20} /> เริ่มระบบประมวลผลจัดสรร TCAS ทันที
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TCAS Team Participants Modal ────────────────────────────────────── */}
      {selectedTeamForModal && tcasStats && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, backdropFilter: 'blur(4px)' }}>
          <div className="glass-card" style={{ width: '95%', maxWidth: '450px', background: '#fff', border: '3.5px solid #1e293b', boxShadow: '12px 12px 0px #1e293b', maxHeight: '85vh', overflowY: 'auto', padding: '1.5rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #1e293b', paddingBottom: '0.8rem', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={24} color="#1d4ed8" />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1e293b', margin: 0, fontFamily: "'Kanit', sans-serif" }}>
                  รายชื่อน้องที่ลงทะเบียนแล้ว
                </h3>
              </div>
              <button 
                onClick={() => setSelectedTeamForModal(null)}
                style={{ background: '#f1f5f9', border: '2.5px solid #1e293b', borderRadius: '8px', cursor: 'pointer', padding: '0.3rem 0.6rem', fontWeight: 900, fontSize: '0.85rem', boxShadow: '2px 2px 0px #1e293b' }}
              >
                ✕ ปิด
              </button>
            </div>

            <div style={{ marginBottom: '1.2rem', padding: '0.6rem 1rem', background: '#f1f5f9', border: '2px solid #cbd5e1', borderRadius: '12px', fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>
              🏠 กลุ่ม/บ้าน: {selectedTeamForModal}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '50vh', overflowY: 'auto', paddingRight: '0.3rem' }}>
              {tcasStats.rawParticipants
                .filter(p => p.team === selectedTeamForModal && p.rank1 && p.rank1 !== '')
                .map((student, sIdx) => (
                  <div key={student.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '14px', transition: 'all 0.2s' }}>
                    <div style={{ fontWeight: 800, color: '#1e293b' }}>
                      {sIdx + 1}. {student.name}
                    </div>
                    <div style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', fontWeight: 900, padding: '0.25rem 0.6rem', borderRadius: '999px', border: '1.5px solid #3b82f6' }}>
                      {student.rank1.replace(/^\d+\.\s*/, '').trim()}
                    </div>
                  </div>
                ))}
              {tcasStats.rawParticipants.filter(p => p.team === selectedTeamForModal && p.rank1 && p.rank1 !== '').length === 0 && (
                <div style={{ padding: '2rem 1rem', color: '#64748b', fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' }}>
                  ยังไม่มีน้องในบ้านนี้ลงทะเบียนเลือกคณะ
                </div>
              )}
            </div>

            <button 
              onClick={() => setSelectedTeamForModal(null)} 
              className="btn btn-secondary" 
              style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem', borderRadius: '12px', fontSize: '1rem', border: '2.5px solid #1e293b', boxShadow: '4px 4px 0px #1e293b', background: '#f1f5f9', fontWeight: 800 }}
            >
              ✕ ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* ── Toast notifications ───────────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none'
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#fff',
            border: '2.5px solid #ff2e93',
            boxShadow: '0 8px 30px rgba(255, 46, 147, 0.25), 4px 4px 0px #000',
            padding: '1rem 1.2rem',
            borderRadius: '16px',
            minWidth: '280px',
            maxWidth: '350px',
            fontFamily: "'Kanit', sans-serif",
            fontWeight: 800,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            pointerEvents: 'auto',
            animation: 'toastIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both'
          }}>
            <div style={{
              background: 'rgba(255, 46, 147, 0.15)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Heart size={16} color="#ff2e93" fill="#ff2e93" />
            </div>
            <div style={{ flex: 1 }}>{t.message}</div>
            <button
              onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s'
              }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* ── Feedback QR Code Modal ────────────────────────────────────────── */}
      {showFeedbackQR && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(15, 23, 42, 0.85)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)',
          fontFamily: "'Kanit', sans-serif"
        }}>
          <div className="glass-card" style={{
            width: '90%', maxWidth: '500px', background: '#1e293b',
            border: '4px solid #ff2e93', boxShadow: '12px 12px 0px #000',
            textAlign: 'center', padding: '2rem 1.5rem', color: '#fff',
            position: 'relative', animation: 'toastIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both'
          }}>
            <button
              onClick={() => setShowFeedbackQR(false)}
              style={{
                position: 'absolute', top: '15px', right: '15px',
                background: 'rgba(255,255,255,0.1)', border: '2.5px solid #000',
                color: '#fff', borderRadius: '50%', width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.1s'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', marginBottom: '0.8rem' }}>
              <Heart size={28} color="#ff2e93" fill="#ff2e93" style={{ animation: 'float 2s ease-in-out infinite' }} />
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, textShadow: '2px 2px 0px #000' }}>แบบฟอร์มส่งความรู้สึกค่าย</h2>
            </div>
            
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              สแกน QR Code เพื่อบอกสิ่งดีๆ สิ่งที่ได้รับ และข้อคิดเห็นให้พี่ๆ ทีมงานค่ายชื่นใจกันนะ!
            </p>

            <div style={{
              background: '#fff', padding: '1rem', borderRadius: '16px',
              display: 'inline-block', border: '3px solid #000',
              boxShadow: '5px 5px 0px #000', marginBottom: '1.5rem'
            }}>
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://candy-fawn-chi.vercel.app/feedback"
                alt="Feedback QR Code"
                style={{ width: '260px', height: '260px', display: 'block' }}
              />
            </div>

            <div style={{
              background: '#0f172a', padding: '0.8rem 1.2rem', borderRadius: '12px',
              border: '2px solid #334155', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', width: '100%'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ff2e93', fontWeight: 800, fontSize: '0.95rem' }}>
                <MessageSquare size={16} /> ยอดส่งเรียลไทม์
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>
                <span style={{ color: '#ff2e93' }}>{feedbackCount}</span> ข้อความ
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Global keyframes ──────────────────────────────────────────────── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }

        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
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
