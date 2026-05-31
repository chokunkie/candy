import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';
import { ArrowLeft, Gift, Play, RotateCcw, Award, CheckCircle, Flame, Sparkles, X, Check } from 'lucide-react';

// Hardcoded locked list config
const lockMapping = {
  "บ้านมาการอง อุอิ": {
    lockedNames: ["กนกลักษณ์ เพชรอาวุธ"]
  },
  "บ้านครองแครงกะทิสด": {
    lockedNames: ["ธนดล พัฒศรีเรือง"]
  },
  "บ้านบัวลอยไข่หวาน": {
    lockedNames: ["มณิสรา ฟุ้งเฟื้อง"]
  },
  "บ้านขนมเปียกปูน": {
    lockedNames: ["อดิศร เอื้อมพล", "ณัฐธิดา อัคคีสุวรรณ"]
  },
  "บ้านโรตีท้ายบังบ่าว": {
    lockedNames: ["กานต์ธิดา หนูสมแก้ว", "ศุภณัฐ จันทร์ทองแก้ว"]
  },
  "บ้านครองแครง": {
    lockedNames: ["จีรณา จันทร์เจือแก้ว", "นันท์นภัส ภาครัตน์"]
  }
};

export default function ScholarshipDraw() {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [housesOrder, setHousesOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Draw State Machine
  const [currentHouseIdx, setCurrentHouseIdx] = useState(0); // Index in housesOrder
  const [currentSlotIdx, setCurrentSlotIdx] = useState(0); // 0 or 1 for the 2 slots per house
  const [drawnResults, setDrawnResults] = useState({}); // { [houseName]: [name1, name2] }
  
  // Raffle / Draw states
  const [isDrawing, setIsDrawing] = useState(false);
  const [raffleName, setRaffleName] = useState("--- สุ่มผู้รับทุน ---");
  const [showCelebration, setShowCelebration] = useState(false);
  const [justDrawnName, setJustDrawnName] = useState("");
  const [justDrawnHouse, setJustDrawnHouse] = useState("");
  
  // Disqualified / Skipped names list to avoid re-drawing them
  const [disqualifiedNames, setDisqualifiedNames] = useState([]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchParticipants();
      await fetchHousesSortedByPoints();
      setLoading(false);
    };
    init();
  }, []);

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('name, team');
      if (error) throw error;
      if (data) {
        setParticipants(data.filter(p => p.name && p.name.trim() !== ""));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHousesSortedByPoints = async () => {
    try {
      // Fetch teams sorted by points DESC (อันดับ 1 ไป 10)
      const { data, error } = await supabase
        .from('teams')
        .select('name, points')
        .order('points', { ascending: false });
      
      if (error) throw error;
      if (data) {
        // Reverse to get "อันดับ 10 ขึ้นมาหาอันดับ 1" (อันดับสุดท้ายขึ้นก่อน)
        const sortedNames = data.map(t => t.name).reverse();
        setHousesOrder(sortedNames);
      }
    } catch (err) {
      console.error("Error fetching teams order:", err);
      // Fallback in case of database issue
      const fallback = [
        "บ้านมาการอง อุอิ",
        "บ้านsugar",
        "บ้านลอดช่อง",
        "บ้านครองแครงกะทิสด",
        "บ้านท้ายบ้าบิ่น",
        "บ้านโรตีท้ายบังบ่าว",
        "ครองแครงปิ๊นาศ",
        "บ้านครองแครง",
        "บ้านบัวลอยไข่หวาน",
        "บ้านขนมเปียกปูน"
      ];
      setHousesOrder(fallback);
    }
  };

  const currentHouse = housesOrder[currentHouseIdx];

  const handleStartDraw = () => {
    if (isDrawing || currentHouseIdx >= housesOrder.length) return;
    
    setIsDrawing(true);
    setShowCelebration(false);
    
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    // 1. Get eligible participants for the current house
    const houseMembers = participants.filter(p => p.team === currentHouse);
    
    // 2. Identify already drawn + disqualified names to prevent duplicate draws
    const alreadyDrawn = Object.values(drawnResults).flat();
    const excludedNames = [...alreadyDrawn, ...disqualifiedNames];

    // 3. Determine the SECRET winner based on lock rules
    let winner = "";
    
    const lockConfig = lockMapping[currentHouse];
    if (lockConfig) {
      const locks = lockConfig.lockedNames;
      // Find which locked name hasn't been drawn + isn't disqualified
      const remainingLocks = locks.filter(name => !excludedNames.includes(name));
      if (remainingLocks.length > 0) {
        winner = remainingLocks[0];
      }
    }

    // Backup if no lock target matches: Select a random member of this house who is eligible
    if (!winner) {
      const eligibleMembers = houseMembers.filter(m => !excludedNames.includes(m.name));
      if (eligibleMembers.length > 0) {
        const rand = eligibleMembers[Math.floor(Math.random() * eligibleMembers.length)];
        winner = rand.name;
      } else {
        // Ultimate fallback
        winner = "ผู้เข้าร่วมค่าย";
      }
    }

    // 4. Run Slot raffle animation
    let counter = 0;
    const interval = setInterval(() => {
      // Pick randomly from ALL participants to create the "everyone in camp is being drawn" effect
      const randParticipant = participants[Math.floor(Math.random() * participants.length)];
      setRaffleName(randParticipant.name);
      counter++;
      
      if (counter > 25) {
        clearInterval(interval);
        
        // Final winner lands
        setRaffleName(winner);
        setJustDrawnName(winner);
        
        const actualParticipant = participants.find(p => p.name === winner);
        const targetHouse = actualParticipant && actualParticipant.team ? actualParticipant.team : currentHouse;
        setJustDrawnHouse(targetHouse);
        
        setIsDrawing(false);
        setShowCelebration(true);

        // Burst Premium Confetti!
        const duration = 2.5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const intervalConfetti = setInterval(() => {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(intervalConfetti);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
      }
    }, 80);
  };

  // Confirm and Accept Winner
  const handleConfirmWinner = () => {
    // Record results in local state
    setDrawnResults(prev => {
      const houseDrawn = prev[justDrawnHouse] || [];
      const updatedDrawn = [...houseDrawn, justDrawnName];
      return {
        ...prev,
        [justDrawnHouse]: updatedDrawn
      };
    });

    setShowCelebration(false);
    setRaffleName("--- สุ่มผู้รับทุน ---");

    // Move cursor state forward to next slot/house
    if (currentSlotIdx === 0) {
      setCurrentSlotIdx(1);
    } else {
      setCurrentSlotIdx(0);
      setCurrentHouseIdx(prev => prev + 1);
    }
  };

  // Reject / Disqualify Winner (e.g. not present) and redraw
  const handleRejectWinner = () => {
    if (window.confirm(`น้อง ${justDrawnName} ไม่มีสิทธิ์อยู่รับรางวัล? ต้องการสุ่มคนใหม่สำหรับบ้านนี้แทนใช่หรือไม่? (จะไม่สุ่มชื่อนี้ซ้ำอีก)`)) {
      setDisqualifiedNames(prev => [...prev, justDrawnName]);
      setShowCelebration(false);
      setRaffleName("--- รอดำเนินการสุ่มใหม่ ---");
    }
  };

  const handleReset = () => {
    if (window.confirm("คุณต้องการล้างผลการจับรางวัลทุนการศึกษาทั้งหมดเพื่อสุ่มใหม่ใช่หรือไม่?")) {
      setCurrentHouseIdx(0);
      setCurrentSlotIdx(0);
      setDrawnResults({});
      setDisqualifiedNames([]);
      setRaffleName("--- สุ่มผู้รับทุน ---");
      setShowCelebration(false);
      setJustDrawnName("");
      setJustDrawnHouse("");
    }
  };

  if (loading || housesOrder.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a', color: '#64748b' }}>
        <p style={{ fontWeight: 700 }}>กำลังจัดเรียงลำดับบ้านตามคะแนน (อันดับ 10 ถึง 1)...</p>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#0f172a', // Premium cosmic dark blue
      backgroundImage: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 100%)',
      color: '#f8fafc',
      fontFamily: "'Kanit', sans-serif",
      padding: '2rem',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Background soft ambient glowing lights */}
      <div style={{ position: 'absolute', width: '400px', height: '400px', background: '#ff2e93', filter: 'blur(150px)', opacity: 0.08, top: '5%', left: '5%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '500px', height: '500px', background: '#d9a014', filter: 'blur(180px)', opacity: 0.06, bottom: '5%', right: '5%', pointerEvents: 'none' }} />

      {/* Header bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '1200px',
        marginBottom: '2rem',
        zIndex: 10
      }}>
        <button
          onClick={() => navigate('/master')}
          style={{
            background: '#1e293b', color: '#f8fafc',
            border: '2px solid #334155', padding: '0.5rem 1rem', borderRadius: '12px',
            fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            boxShadow: '3px 3px 0px #000', transition: 'all 0.1s'
          }}
        >
          <ArrowLeft size={16} /> กลับแผงควบคุม
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={24} color="#d9a014" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: '#f8fafc', margin: 0 }}>
            ระบบจับรางวัลทุนการศึกษาแคมป์ 🎓
          </h2>
        </div>

        <button
          onClick={handleReset}
          style={{
            background: '#ef4444', color: '#fff',
            border: '2px solid #000', padding: '0.5rem 1rem', borderRadius: '12px',
            fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            boxShadow: '3px 3px 0px #000', transition: 'all 0.1s'
          }}
        >
          <RotateCcw size={14} /> รีเซ็ตผลการสุ่ม
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '2rem',
        width: '100%',
        maxWidth: '1200px',
        zIndex: 5
      }}>
        
        {/* Left Section: Immersive raffle screen */}
        <div style={{
          background: '#1e293b',
          border: '3px solid #000',
          borderRadius: '24px',
          padding: '3rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '8px 8px 0px #000',
          textAlign: 'center',
          position: 'relative'
        }}>
          {currentHouseIdx < housesOrder.length ? (
            <>
              {/* Active house indicator */}
              <div style={{
                background: '#d9a014',
                color: '#000',
                border: '2.5px solid #000',
                boxShadow: '3px 3px 0px #000',
                borderRadius: '50px',
                padding: '0.5rem 2rem',
                fontSize: '1.2rem',
                fontWeight: 900,
                marginBottom: '1.5rem',
                animation: 'pulse 2s infinite'
              }}>
                บ้านอันดับที่ {10 - currentHouseIdx}: {currentHouse}
              </div>

              <div style={{ fontSize: '1.05rem', color: '#94a3b8', fontWeight: 700, marginBottom: '2.5rem' }}>
                กำลังสุ่มเลือกทุนการศึกษา คนที่ {currentSlotIdx + 1} / 2
              </div>

              {/* Immersive Raffle Display Screen */}
              <div style={{
                width: '100%',
                maxWidth: '650px',
                height: '180px',
                background: '#090d16',
                border: '4px solid #d9a014',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'inset 0px 0px 20px rgba(217, 160, 20, 0.4)'
              }}>
                {/* Visual scanning line effect */}
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '4px',
                  background: 'rgba(217, 160, 20, 0.6)',
                  boxShadow: '0 0 10px #d9a014',
                  animation: 'scanLine 3s linear infinite',
                  pointerEvents: 'none'
                }} />

                <h1 style={{
                  fontSize: isDrawing ? '2.8rem' : showCelebration ? '3.8rem' : '2.3rem',
                  fontWeight: 900,
                  color: showCelebration ? '#d9a014' : '#fff',
                  margin: 0,
                  transition: 'font-size 0.15s ease',
                  letterSpacing: '1px',
                  textShadow: showCelebration ? '0 0 15px rgba(217, 160, 20, 0.8)' : 'none'
                }}>
                  {raffleName}
                </h1>
              </div>

              {/* Action Button */}
              <button
                onClick={handleStartDraw}
                disabled={isDrawing}
                style={{
                  marginTop: '3rem',
                  background: isDrawing ? '#475569' : 'linear-gradient(135deg, #d9a014, #f59e0b)',
                  color: isDrawing ? '#94a3b8' : '#000',
                  border: '3px solid #000',
                  padding: '1.2rem 3.5rem',
                  borderRadius: '20px',
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  cursor: isDrawing ? 'not-allowed' : 'pointer',
                  boxShadow: isDrawing ? 'none' : '6px 6px 0px #000',
                  transform: isDrawing ? 'translate(4px, 4px)' : 'none',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem'
                }}
                onMouseDown={(e) => {
                  if (!isDrawing) {
                    e.currentTarget.style.transform = 'translate(4px, 4px)';
                    e.currentTarget.style.boxShadow = '2px 2px 0px #000';
                  }
                }}
                onMouseUp={(e) => {
                  if (!isDrawing) {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '6px 6px 0px #000';
                  }
                }}
              >
                {isDrawing ? (
                  <>หมุนหารางวัล...</>
                ) : (
                  <>
                    <Play fill="#000" size={20} /> กดปุ่มสุ่มผู้รับทุน
                  </>
                )}
              </button>

              {/* Winner overlay celebration card with confirmation */}
              {showCelebration && (
                <div style={{
                  position: 'absolute',
                  top: '5%',
                  left: '5%',
                  right: '5%',
                  bottom: '5%',
                  background: 'rgba(9, 13, 22, 0.96)',
                  border: '3px solid #d9a014',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem',
                  zIndex: 20,
                  animation: 'celebrateIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                }}>
                  <Award size={64} color="#d9a014" style={{ marginBottom: '0.8rem', animation: 'bounce 1s infinite' }} />
                  <h3 style={{ fontSize: '1.3rem', color: '#94a3b8', margin: '0 0 0.5rem' }}>ยินดีด้วยกับผู้รับทุนการศึกษา!</h3>
                  <h2 style={{ fontSize: '3.1rem', fontWeight: 900, color: '#fff', margin: '0 0 0.8rem', textShadow: '0 0 12px #d9a014' }}>
                    {justDrawnName}
                  </h2>
                  <div style={{
                    background: '#1e293b',
                    border: '1.5px solid #d9a014',
                    padding: '0.4rem 1.5rem',
                    borderRadius: '50px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#d9a014',
                    marginBottom: '2rem'
                  }}>
                    บ้าน: {justDrawnHouse}
                  </div>

                  {/* Accept / Reject Buttons for active attendance confirmation */}
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <button
                      onClick={handleRejectWinner}
                      style={{
                        background: '#ef4444',
                        color: '#fff',
                        border: '2.5px solid #000',
                        borderRadius: '14px',
                        padding: '0.6rem 2rem',
                        fontSize: '1rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        boxShadow: '4px 4px 0px #000',
                        transition: 'all 0.1s'
                      }}
                    >
                      <X size={16} /> สุ่มใหม่ (น้องไม่มา)
                    </button>

                    <button
                      onClick={handleConfirmWinner}
                      style={{
                        background: '#10b981',
                        color: '#000',
                        border: '2.5px solid #000',
                        borderRadius: '14px',
                        padding: '0.6rem 2.5rem',
                        fontSize: '1.05rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        boxShadow: '4px 4px 0px #000',
                        transition: 'all 0.1s'
                      }}
                    >
                      <Check size={16} /> ยืนยันรับทุน
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '3rem 1rem' }}>
              <CheckCircle size={80} color="#10b981" style={{ marginBottom: '1.5rem' }} />
              <h2 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 1rem', color: '#10b981' }}>
                การจับรางวัลทุนเสร็จสิ้นเรียบร้อย! 🎉
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
                สุ่มจับรายชื่อน้องๆ ตัวแทนบ้านทั้ง 10 บ้านครบถ้วนเรียบร้อยแล้ว
              </p>
            </div>
          )}
        </div>

        {/* Right Section: Interactive list showing real-time results */}
        <div style={{
          background: '#0f172a',
          border: '3px solid #000',
          borderRadius: '24px',
          padding: '1.5rem',
          boxShadow: '6px 6px 0px #000',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '75vh',
          overflowY: 'auto'
        }}>
          <h3 style={{
            fontSize: '1.15rem',
            fontWeight: 900,
            borderBottom: '2px dashed #334155',
            paddingBottom: '0.8rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#d9a014'
          }}>
            <Flame size={18} /> ผลการจับรางวัลแยกรายบ้าน (อันดับ 10 ถึง 1 ตามคะแนน)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {housesOrder.map((houseName, index) => {
              const draws = drawnResults[houseName] || [];
              const isActive = houseName === currentHouse;
              
              return (
                <div
                  key={houseName}
                  style={{
                    background: isActive ? 'rgba(217, 160, 20, 0.1)' : '#1e293b',
                    border: isActive ? '2px solid #d9a014' : '2px solid #334155',
                    borderRadius: '16px',
                    padding: '0.8rem 1rem',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.4rem'
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isActive ? '#d9a014' : '#94a3b8' }}>
                      อันดับที่ {10 - index}: {houseName}
                    </span>
                    {draws.length === 2 && (
                      <span style={{ background: '#10b981', color: '#000', fontSize: '0.65rem', fontWeight: 900, padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        ครบแล้ว
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: draws[0] ? '#f8fafc' : '#475569'
                    }}>
                      <Gift size={13} color={draws[0] ? '#d9a014' : '#475569'} />
                      <span>{draws[0] || 'รอดำเนินการสุ่มคนที่ 1...'}</span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: draws[1] ? '#f8fafc' : '#475569'
                    }}>
                      <Gift size={13} color={draws[1] ? '#d9a014' : '#475569'} />
                      <span>{draws[1] || 'รอดำเนินการสุ่มคนที่ 2...'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scanLine {
          0% { top: 0px; }
          50% { top: 180px; }
          100% { top: 0px; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes celebrateIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}} />
    </div>
  );
}
