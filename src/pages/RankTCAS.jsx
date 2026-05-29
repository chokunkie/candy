import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';
import { 
  GraduationCap, Search, Users, ChevronDown, CheckCircle2, 
  Award, Clock, X, HeartPulse, Cpu, BookOpen, Briefcase, 
  Palette, Scale, TreePine, HelpCircle, Heart, User, Loader2, ArrowLeft
} from 'lucide-react';

const activitiesData = [
  { name: "1. วิทยาศาสตร์สุขภาพ", icon: HeartPulse, color: "#E63946", bg: "#fce8ea" },
  { name: "2. วิศวกรรมศาสตร์", icon: Cpu, color: "#457B9D", bg: "#e8f0f4" },
  { name: "3. ศึกษาศาสตร์/ครุศาสตร์", icon: BookOpen, color: "#D9A014", bg: "#fdf8ec" },
  { name: "4. วิทยาการและการจัดการ", icon: Briefcase, color: "#2A9D8F", bg: "#e6f4f2" },
  { name: "5. ศิลปกรรมศาสตร์", icon: Palette, color: "#9D4EDD", bg: "#f3e8fc" },
  { name: "6. มนุษยศาสตร์และสังคมศาสตร์", icon: Users, color: "#F4A261", bg: "#fef3ea" },
  { name: "7. รัฐศาสตร์และนิติศาสตร์", icon: Scale, color: "#1D3557", bg: "#e5e9ef" },
  { name: "8. วนศาสตร์", icon: TreePine, color: "#40916C", bg: "#ebf3ef" },
  { name: "9. ไม่รู้จะเรียนที่ไหนดี", icon: HelpCircle, color: "#6C757D", bg: "#f0f1f2" }
];

export default function RankTCAS() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [ranks, setRanks] = useState(['', '', '', '', '']);
  const [activeTab, setActiveTab] = useState('selection'); // 'selection' | 'result'
  
  // Custom dropdowns states
  const [openDropdownIdx, setOpenDropdownIdx] = useState(null); // null or 0-4
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);

  // Modal alert state
  const [alertConfig, setAlertConfig] = useState({ show: false, title: '', message: '', type: 'success' });

  const autocompleteRef = useRef(null);
  const groupDropdownRef = useRef(null);
  const rankDropdownRefs = useRef([]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setInitialLoading(true);
        // Load all participants
        const { data: partData, error: partErr } = await supabase
          .from('participants')
          .select('name, team')
          .order('name');
        if (partErr) throw partErr;
        setParticipants(partData || []);

        // Load teams
        const { data: teamData, error: teamErr } = await supabase
          .from('teams')
          .select('name')
          .order('name');
        if (teamErr) throw teamErr;
        setTeams(teamData || []);
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setInitialLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleOutsideClick(e) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target)) {
        setShowAutocomplete(false);
      }
      if (groupDropdownRef.current && !groupDropdownRef.current.contains(e.target)) {
        setGroupDropdownOpen(false);
      }
      if (openDropdownIdx !== null) {
        const ref = rankDropdownRefs.current[openDropdownIdx];
        if (ref && !ref.contains(e.target)) {
          setOpenDropdownIdx(null);
        }
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [openDropdownIdx]);

  const showAlert = (title, message, type = 'success') => {
    setAlertConfig({ show: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertConfig({ ...alertConfig, show: false });
  };

  const selectStudent = async (name) => {
    setLoading(true);
    setSearchQuery(name);
    setShowAutocomplete(false);
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('name', name)
        .single();

      if (error) throw error;

      if (data) {
        setSelectedStudent(data);
        setSelectedGroup(data.team || '');
        setRanks([
          data.rank1 || '',
          data.rank2 || '',
          data.rank3 || '',
          data.rank4 || '',
          data.rank5 || ''
        ]);

        // Auto-switch tabs based on mobile screen & results status
        const hasResult = (data.r1 && data.r1 !== 'รอดำเนินการ...') ||
                          (data.r2 && data.r2 !== 'รอดำเนินการ...') ||
                          (data.r3 && data.r3 !== 'รอดำเนินการ...');
        if (window.innerWidth < 992) {
          setActiveTab(hasResult ? 'result' : 'selection');
        }
      }
    } catch (err) {
      showAlert('เกิดข้อผิดพลาด', 'ไม่พบรายชื่อในระบบ: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const submitForm = async () => {
    if (!selectedStudent) return;
    if (ranks.some(r => r === "")) {
      showAlert("เลือกอันดับไม่ครบ", "กรุณาเลือกสาขา/คณะให้ครบทั้ง 5 ลำดับเพื่อทำการบันทึก", "error");
      return;
    }
    if (!selectedGroup) {
      showAlert("กรุณาเลือกกลุ่ม", "กรุณาเลือกกลุ่ม/ชั้นเรียนของคุณก่อนทำการบันทึก", "error");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('participants')
        .update({
          team: selectedGroup,
          rank1: ranks[0],
          rank2: ranks[1],
          rank3: ranks[2],
          rank4: ranks[3],
          rank5: ranks[4],
          updated_at: new Date()
        })
        .eq('name', selectedStudent.name);

      if (error) throw error;

      // Local state update
      setSelectedStudent(prev => ({
        ...prev,
        team: selectedGroup,
        rank1: ranks[0],
        rank2: ranks[1],
        rank3: ranks[2],
        rank4: ranks[3],
        rank5: ranks[4]
      }));

      // Celebration Confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#d97e7e', '#fce8ea', '#9d4edd', '#00d2ff', '#28a745']
      });

      showAlert("บันทึกสำเร็จ!", "บันทึกอันดับและความสนใจของคุณเรียบร้อยแล้ว", "success");
    } catch (err) {
      showAlert("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Compile list of activities (adding standard majors + special majors from student's extra field)
  const getStudentActivities = () => {
    let list = [...activitiesData];
    if (selectedStudent && selectedStudent.extra && selectedStudent.extra !== '-') {
      const extras = selectedStudent.extra.split(',').map(s => s.trim());
      extras.forEach(ext => {
        if (ext && !list.some(a => a.name === ext)) {
          list.push({
            name: ext,
            icon: Heart,
            color: "#D97E7E",
            bg: "#fce8ea"
          });
        }
      });
    }
    return list;
  };

  const studentActivities = getStudentActivities();

  // Autocomplete matching
  const filteredAutocomplete = searchQuery.trim() === '' 
    ? [] 
    : participants.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8);

  return (
    <div className="container">
      {/* Loading Overlay */}
      {(loading || initialLoading) && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(252,249,249,0.85)',
          backdropFilter: 'blur(5px)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <Loader2 className="animate-spin" size={48} color="var(--accent-pink)" />
          <p style={{ marginTop: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>กำลังโหลดข้อมูล...</p>
        </div>
      )}

      {/* Navigation Back Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'white', border: '3px solid var(--card-border)', borderRadius: '12px',
            padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer',
            boxShadow: '3px 3px 0px var(--card-border)', transition: 'all 0.1s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translate(-1px, -1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          <ArrowLeft size={16} /> กลับหน้าหลัก Candy
        </button>
      </div>

      {/* Header */}
      <header className="glass-card text-center" style={{ marginBottom: '2.5rem', borderBottomWidth: '6px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-pink), #f8c3c3)',
            color: 'white', width: '70px', height: '70px', borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 15px rgba(217, 126, 126, 0.3)',
            transform: 'rotate(-5deg)', transition: 'transform 0.3s'
          }}>
            <GraduationCap size={40} />
          </div>
          <h1 className="title-main">Sanfan Camp Dashboard</h1>
          <p className="title-sub" style={{ margin: 0 }}>ระบบจัดการอันดับและประกาศผลกิจกรรมจำลอง TCAS ที่เร็วที่สุดด้วย Supabase</p>
        </div>
      </header>

      {/* Identity Search Bar */}
      <div className="glass-card" style={{ padding: '1.2rem', marginBottom: '2rem' }}>
        <div className="form-group" style={{ margin: 0 }} ref={autocompleteRef}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={18} /> พิมพ์ชื่อเพื่อค้นหาประวัติของคุณ:
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="พิมพ์ชื่อ-นามสกุล..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowAutocomplete(true);
            }}
            onFocus={() => setShowAutocomplete(true)}
          />
          {showAutocomplete && filteredAutocomplete.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: 'white', border: '3px solid var(--card-border)',
              borderRadius: '14px', zIndex: 1000, marginTop: '8px',
              boxShadow: '5px 5px 0px var(--card-border)', maxHeight: '250px',
              overflowY: 'auto'
            }}>
              {filteredAutocomplete.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => selectStudent(p.name)}
                  style={{
                    padding: '1rem 1.4rem', borderBottom: idx !== filteredAutocomplete.length - 1 ? '2px solid #f1ecec' : 'none',
                    cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-pink-light)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{p.name}</span>
                  {p.team && <span className="badge badge-pink">{p.team}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation for Mobile View */}
      <div style={{
        display: 'flex', gap: '0.8rem', marginBottom: '1.5rem'
      }} className="tab-container-mobile">
        <button 
          className={`btn ${activeTab === 'selection' ? '' : 'btn-secondary'}`}
          onClick={() => setActiveTab('selection')}
          style={{ flex: 1 }}
          disabled={!selectedStudent}
        >
          เลือกอันดับ
        </button>
        <button 
          className={`btn ${activeTab === 'result' ? '' : 'btn-secondary'}`}
          onClick={() => setActiveTab('result')}
          style={{ flex: 1 }}
          disabled={!selectedStudent}
        >
          ประกาศผลจัดสรร
        </button>
      </div>

      {/* Desktop side-by-side grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '2.5rem',
        marginTop: '1rem'
      }}>
        {/* Selection Area */}
        <div className={`glass-card ${activeTab !== 'selection' ? 'hidden-tab-mobile' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', borderBottom: '3px solid var(--card-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--accent-pink-light)', padding: '0.5rem', borderRadius: '10px', display: 'flex', color: 'var(--accent-pink)' }}>
              <Users size={22} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900 }}>เลือกอันดับกิจกรรม</h2>
          </div>

          {!selectedStudent ? (
            <div className="text-center" style={{ padding: '3.5rem 1rem', color: 'var(--text-sub)' }}>
              <Search size={48} strokeWidth={1.5} style={{ marginBottom: '1rem', color: 'var(--accent-pink)' }} />
              <p style={{ fontWeight: 700 }}>กรุณาค้นหารายชื่อของคุณที่แถบค้นหาด้านบน</p>
              <p style={{ fontSize: '0.9rem' }}>ระบบจะโหลดอันดับและประวัติกิจกรรมแบบเรียลไทม์</p>
            </div>
          ) : (
            <div>
              {/* Group Selection */}
              <div style={{ marginBottom: '2rem' }} ref={groupDropdownRef}>
                <label className="form-label">🏫 เลือกกลุ่ม/ชั้นเรียนของคุณ:</label>
                <div style={{ position: 'relative' }}>
                  <button 
                    type="button" 
                    className="form-control text-left" 
                    onClick={() => setGroupDropdownOpen(!groupDropdownOpen)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}
                  >
                    <span style={{ fontWeight: 700, color: selectedGroup ? 'var(--accent-pink)' : 'var(--text-sub)' }}>
                      {selectedGroup || '-- กรุณาเลือกกลุ่ม/ชั้นเรียนของคุณ --'}
                    </span>
                    <ChevronDown size={20} />
                  </button>
                  {groupDropdownOpen && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0,
                      background: 'white', border: '3px solid var(--card-border)',
                      borderRadius: '14px', zIndex: 1000, marginTop: '8px',
                      boxShadow: '4px 4px 0px var(--card-border)', maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {teams.map((team, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedGroup(team.name);
                            setGroupDropdownOpen(false);
                          }}
                          style={{
                            padding: '0.85rem 1.2rem', cursor: 'pointer',
                            fontWeight: 600, borderBottom: '1px solid #f1ecec'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-pink-light)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          {team.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Ranks selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {ranks.map((currentVal, index) => {
                  const rankIdx = index + 1;
                  const matchedAct = studentActivities.find(a => a.name === currentVal);
                  const IconComponent = matchedAct ? matchedAct.icon : null;

                  return (
                    <div 
                      key={index} 
                      className="category-card" 
                      style={{
                        display: 'flex', alignItems: 'center', background: matchedAct ? matchedAct.bg : 'white',
                        border: '3px solid var(--card-border)', borderRadius: '14px',
                        position: 'relative'
                      }}
                      ref={el => rankDropdownRefs.current[index] = el}
                    >
                      {/* Rank tag badge */}
                      <div style={{
                        width: '65px', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch',
                        borderRight: '3px solid var(--card-border)', background: '#fff9f9',
                        borderRadius: '11px 0 0 11px', flexShrink: 0
                      }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-sub)' }}>อันดับ</span>
                        <span style={{ fontSize: '1.6rem', fontWeight: 900, color: matchedAct ? matchedAct.color : 'var(--text-main)' }}>{rankIdx}</span>
                      </div>

                      {/* Dropdown Container */}
                      <div style={{ flex: 1, position: 'relative' }}>
                        <button
                          type="button"
                          className="custom-select-trigger"
                          onClick={() => setOpenDropdownIdx(openDropdownIdx === index ? null : index)}
                          style={{
                            display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between',
                            padding: '1rem', border: 'none', background: 'transparent', cursor: 'pointer',
                            fontFamily: 'inherit', textAlign: 'left'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            {matchedAct ? (
                              <>
                                <div style={{
                                  background: 'white', color: matchedAct.color, width: '32px', height: '32px',
                                  borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
                                }}>
                                  {IconComponent && <IconComponent size={18} />}
                                </div>
                                <span style={{ color: matchedAct.color, fontWeight: 900, fontSize: '1.05rem' }}>{matchedAct.name}</span>
                              </>
                            ) : (
                              <span style={{ color: 'var(--text-sub)', fontWeight: 600 }}>-- กรุณาเลือกสาขา/คณะ --</span>
                            )}
                          </div>
                          <ChevronDown size={18} color="var(--text-sub)" />
                        </button>

                        {/* Options panel */}
                        {openDropdownIdx === index && (
                          <div style={{
                            position: 'absolute', top: '100%', left: 0, right: 0,
                            background: 'white', border: '3px solid var(--card-border)',
                            borderRadius: '14px', zIndex: 1000, marginTop: '8px',
                            boxShadow: '5px 5px 0px var(--card-border)', maxHeight: '250px',
                            overflowY: 'auto'
                          }}>
                            {/* Reset Option */}
                            <div
                              onClick={() => {
                                const newRanks = [...ranks];
                                newRanks[index] = '';
                                setRanks(newRanks);
                                setOpenDropdownIdx(null);
                              }}
                              style={{
                                padding: '0.8rem 1.2rem', cursor: 'pointer', borderBottom: '2px solid #f1ecec',
                                display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-sub)',
                                fontWeight: 700
                              }}
                            >
                              <div style={{ background: '#f5eded', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={16} />
                              </div>
                              -- ยกเลิกการเลือกอันดับนี้ --
                            </div>

                            {/* Standard & Custom Options */}
                            {studentActivities.map((act, actIdx) => {
                              const isTaken = ranks.includes(act.name) && ranks[index] !== act.name;
                              if (isTaken) return null; // Hide already taken ranks from options list
                              const ActIcon = act.icon;

                              return (
                                <div
                                  key={actIdx}
                                  onClick={() => {
                                    const newRanks = [...ranks];
                                    newRanks[index] = act.name;
                                    setRanks(newRanks);
                                    setOpenDropdownIdx(null);
                                  }}
                                  style={{
                                    padding: '0.8rem 1.2rem', cursor: 'pointer', borderBottom: '1px solid #f1ecec',
                                    display: 'flex', alignItems: 'center', gap: '0.8rem'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-pink-light)'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                  <div style={{ background: act.bg, color: act.color, width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ActIcon size={16} />
                                  </div>
                                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{act.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit Button */}
              <button 
                type="button" 
                className="btn" 
                onClick={submitForm}
                disabled={loading}
              >
                <CheckCircle2 size={20} /> ยืนยันการเลือกอันดับ
              </button>
            </div>
          )}
        </div>

        {/* Results / Allocation Area */}
        <div className={`glass-card ${activeTab !== 'result' ? 'hidden-tab-mobile' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', borderBottom: '3px solid var(--card-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--accent-pink-light)', padding: '0.5rem', borderRadius: '10px', display: 'flex', color: 'var(--accent-pink)' }}>
              <Award size={22} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900 }}>ประกาศผลการจัดสรร</h2>
          </div>

          {!selectedStudent ? (
            <div className="text-center" style={{ padding: '3.5rem 1rem', color: 'var(--text-sub)' }}>
              <Award size={48} strokeWidth={1.5} style={{ marginBottom: '1rem', color: 'var(--accent-pink)' }} />
              <p style={{ fontWeight: 700 }}>กรุณาค้นหารายชื่อของคุณเพื่อดูผลการประกาศจัดสรร</p>
              <p style={{ fontSize: '0.9rem' }}>ข้อมูลจะอัปเดตแบบ Real-time ทันทีที่ฝ่ายทะเบียนประมวลผลสำเร็จ</p>
            </div>
          ) : (
            <div>
              {/* Profile Card */}
              <div style={{
                background: 'var(--bg-color)', border: '2px dashed var(--card-border)',
                borderRadius: '16px', padding: '1.5rem', textTab: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
                marginBottom: '2rem'
              }}>
                <div className="badge badge-pink" style={{ padding: '0.5rem 1.2rem', borderRadius: '30px' }}>
                  <User size={16} /> <span style={{ fontWeight: 800 }}>{selectedStudent.name}</span>
                </div>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-sub)', fontSize: '0.95rem' }}>
                  ทีม/กลุ่ม: {selectedStudent.team || '-'}
                </p>
              </div>

              {/* Rounds results display */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {[
                  { round: 1, val: selectedStudent.r1 },
                  { round: 2, val: selectedStudent.r2 },
                  { round: 3, val: selectedStudent.r3 }
                ].map((item, idx) => {
                  const isAssigned = item.val && item.val !== 'รอดำเนินการ...' && item.val !== '';

                  return (
                    <div 
                      key={idx} 
                      className="glass-card" 
                      style={{
                        padding: '1.2rem 1.5rem', margin: 0, display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-pink)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          รอบที่ {item.round}
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                          {isAssigned ? item.val : 'รอดำเนินการประกาศผล'}
                        </div>
                      </div>

                      {isAssigned ? (
                        <div className="badge badge-success">
                          <CheckCircle2 size={16} /> จัดสรรสำเร็จ
                        </div>
                      ) : (
                        <div className="badge badge-pending">
                          <Clock size={16} /> กำลังจัดสรร
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Styled alert modal popup */}
      {alertConfig.show && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(44,37,37,0.4)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 99999, transition: 'all 0.3s'
        }}>
          <div style={{
            background: 'white', padding: '2.5rem', borderRadius: '28px',
            border: '3px solid var(--card-border)', width: '90%', maxWidth: '400px',
            textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both'
          }}>
            <div style={{
              width: '70px', height: '70px',
              background: alertConfig.type === 'success' ? 'var(--accent-green-light)' : 'var(--accent-pink-light)',
              color: alertConfig.type === 'success' ? 'var(--accent-green)' : 'var(--accent-pink)',
              borderRadius: '20px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 1.5rem', transform: 'rotate(-8deg)',
              border: '2px solid var(--card-border)'
            }}>
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.6rem' }}>{alertConfig.title}</h3>
            <p style={{ color: 'var(--text-sub)', fontWeight: 600, marginBottom: '1.8rem', fontSize: '1.05rem' }}>{alertConfig.message}</p>
            <button className="btn" onClick={closeAlert} style={{ width: '100%' }}>ตกลง</button>
          </div>
        </div>
      )}

      {/* CSS Utility for Mobile Tabs visibility */}
      <style>{`
        .tab-container-mobile {
          display: none !important;
        }
        @media (max-width: 991px) {
          .tab-container-mobile {
            display: flex !important;
          }
          .hidden-tab-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
