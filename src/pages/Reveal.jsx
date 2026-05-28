import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Award, ListOrdered, RefreshCw, Volume2, Crown, Play, Sparkles, ChevronRight, Zap } from 'lucide-react';

export default function Reveal() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState('start'); // 'start', 'reveal-list', 'podium', 'leaderboard'
  const [currentIndex, setCurrentIndex] = useState(0); // Index of team currently revealing (0 = lowest points)
  const [isRevealed, setIsRevealed] = useState(false);
  const [stars, setStars] = useState([]);

  // Podium specific states
  const [ceremonyMode, setCeremonyMode] = useState(null); // null, 'auto', 'manual'
  const [podiumStep, setPodiumStep] = useState('idle'); // 'idle', 'counting-bronze', 'bronze', 'counting-silver', 'silver', 'counting-gold', 'gold'
  const [podiumLoading, setPodiumLoading] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('teams')
      .select('*')
      .order('points', { ascending: true }); // Lower points first
    if (data) setTeams(data);
    setLoading(false);
  };

  const playSound = (type) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      if (type === 'drumroll') {
        const drum = ctx.createOscillator();
        const gain = ctx.createGain();
        drum.type = 'triangle';
        drum.frequency.setValueAtTime(65, now);
        drum.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
        for (let t = now + 0.1; t < now + 0.7; t += 0.05) {
          gain.gain.setValueAtTime(0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.05, t + 0.025);
        }
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
        drum.start(now);
        drum.stop(now + 0.75);
      } else if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'reveal') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.25);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'victory') {
        const playNote = (freq, start, duration, vol = 0.12) => {
          const oscNode = ctx.createOscillator();
          const gainNode = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          oscNode.type = 'sawtooth';
          oscNode.frequency.setValueAtTime(freq, start);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(300, start);
          filter.frequency.exponentialRampToValueAtTime(1800, start + 0.18);

          oscNode.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(ctx.destination);

          gainNode.gain.setValueAtTime(0.01, start);
          gainNode.gain.linearRampToValueAtTime(vol, start + 0.04);
          gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);
          oscNode.start(start);
          oscNode.stop(start + duration);
        };

        playNote(261.63, now, 0.35); // C4
        playNote(329.63, now + 0.15, 0.35); // E4
        playNote(392.00, now + 0.3, 0.35); // G4
        playNote(523.25, now + 0.45, 0.45); // C5

        playNote(261.63 * 2, now + 0.6, 2.2, 0.08); // C5
        playNote(329.63 * 2, now + 0.6, 2.2, 0.08); // E5
        playNote(392.00 * 2, now + 0.6, 2.2, 0.08); // G5
        playNote(523.25 * 2, now + 0.6, 2.8, 0.12); // C6
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderStarShape = (color) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ fill: color || "var(--accent-amber)" }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );

  const renderSparkleShape = (color) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ fill: color || "var(--accent-pink)" }}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  );

  const renderDotShape = (color) => (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" style={{ display: 'block' }}>
      <circle cx="8" cy="8" r="6" fill={color || "var(--accent-blue)"} stroke="var(--text-main)" strokeWidth="3" />
    </svg>
  );

  const triggerStarBurst = (intensity = 35) => {
    const types = ['star', 'sparkle', 'dot'];
    const colors = ['var(--accent-pink)', 'var(--accent-blue)', 'var(--accent-amber)', 'var(--accent-green)', 'var(--accent-purple)'];
    const newStars = Array.from({ length: intensity }).map((_, i) => ({
      id: Math.random() + i,
      left: Math.random() * 85 + 7.5,
      top: Math.random() * 45 + 25,
      type: types[Math.floor(Math.random() * types.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.3
    }));
    setStars(prev => [...prev, ...newStars]);
    setTimeout(() => {
      setStars(prev => prev.filter(s => !newStars.find(ns => ns.id === s.id)));
    }, 2000);
  };

  const handleStart = () => {
    playSound('reveal');
    setStage('reveal-list');
    setCurrentIndex(0);
    setIsRevealed(false);
  };

  const handleReveal = () => {
    playSound('drumroll');
    setTimeout(() => {
      playSound('reveal');
      setIsRevealed(true);
      triggerStarBurst();
    }, 600);
  };

  const handleNext = () => {
    if (currentIndex + 1 < teams.length - 3) {
      setCurrentIndex(prev => prev + 1);
      setIsRevealed(false);
      playSound('reveal');
    } else {
      setStage('podium');
      setCeremonyMode(null);
      setPodiumStep('idle');
    }
  };

  // Cinematic Automated 3-1-2 Ceremony Execution
  const startAutomatedCeremony = () => {
    if (podiumLoading) return;
    setPodiumLoading(true);
    setPodiumStep('counting-bronze');
    playSound('drumroll');

    // 1. Bronze Reveal (after 2.2s)
    setTimeout(() => {
      playSound('reveal');
      setPodiumStep('bronze');
      triggerStarBurst(30);

      // 2. Pause -> start Gold suspense countdown
      setTimeout(() => {
        setPodiumStep('counting-gold');
        playSound('drumroll');
        
        // Pulse ticking sounds to escalate anxiety!
        let ticksCount = 0;
        const ticksInterval = setInterval(() => {
          if (ticksCount < 5) {
            playSound('tick');
            ticksCount++;
          } else {
            clearInterval(ticksInterval);
          }
        }, 350);

        // 3. Grand Champion Crown Reveal!
        setTimeout(() => {
          playSound('victory');
          setPodiumStep('gold');
          triggerStarBurst(60);

          // Celebration waves!
          let wavesCount = 0;
          const celebrationInterval = setInterval(() => {
            triggerStarBurst(40);
            wavesCount++;
            if (wavesCount >= 3) clearInterval(celebrationInterval);
          }, 450);

          // 4. Pause -> start Silver counting
          setTimeout(() => {
            setPodiumStep('counting-silver');
            playSound('drumroll');

            // 5. Silver Reveal (after 2.2s)
            setTimeout(() => {
              playSound('reveal');
              setPodiumStep('silver');
              setPodiumLoading(false);
              triggerStarBurst(35);
            }, 2200); // Silver drumroll duration

          }, 3500); // Pause before Silver drumroll

        }, 2600); // Gold drumroll duration

      }, 1800); // Pause before Gold drumroll

    }, 2200); // Bronze drumroll duration
  };

  // Presenter Manual Triggers
  const handleRevealBronze = () => {
    setPodiumLoading(true);
    playSound('drumroll');
    setPodiumStep('counting-bronze');
    setTimeout(() => {
      playSound('reveal');
      setPodiumStep('bronze');
      setPodiumLoading(false);
      triggerStarBurst(30);
    }, 800);
  };

  const handleRevealSilver = () => {
    setPodiumLoading(true);
    playSound('drumroll');
    setPodiumStep('counting-silver');
    setTimeout(() => {
      playSound('reveal');
      setPodiumStep('silver');
      setPodiumLoading(false);
      triggerStarBurst(35);
    }, 800);
  };

  const handleRevealGold = () => {
    setPodiumLoading(true);
    playSound('drumroll');
    setPodiumStep('counting-gold');
    
    let ticks = 0;
    const ticksInterval = setInterval(() => {
      if (ticks < 3) {
        playSound('tick');
        ticks++;
      } else {
        clearInterval(ticksInterval);
      }
    }, 300);

    setTimeout(() => {
      playSound('victory');
      setPodiumStep('gold');
      setPodiumLoading(false);
      triggerStarBurst(60);

      let waves = 0;
      const interval = setInterval(() => {
        triggerStarBurst(45);
        waves++;
        if (waves >= 4) clearInterval(interval);
      }, 500);
    }, 1200);
  };

  // Determine lane visual spotlight focus styles
  const getLaneStyle = (lane) => {
    const inactiveStyle = {
      opacity: 0.3,
      filter: 'grayscale(70%) blur(1px)',
      transform: 'scale(0.96)',
      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
    };
    
    const spotlightStyle = {
      opacity: 1,
      transform: 'scale(1.05) translateY(-8px)',
      filter: 'none',
      zIndex: 10,
      transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    };

    const normalStyle = {
      opacity: 1,
      filter: 'none',
      transform: 'none',
      transition: 'all 0.5s ease'
    };

    if (podiumStep === 'idle') return normalStyle;
    if (podiumStep === 'silver') return normalStyle; // when ceremony completes (Silver is last), light up entire stage!

    if (podiumStep === 'counting-bronze' || podiumStep === 'bronze') {
      return lane === 'bronze' ? spotlightStyle : inactiveStyle;
    }
    if (podiumStep === 'counting-silver' || podiumStep === 'silver') {
      return lane === 'silver' ? spotlightStyle : inactiveStyle;
    }
    if (podiumStep === 'counting-gold' || podiumStep === 'gold') {
      return lane === 'gold' ? spotlightStyle : inactiveStyle;
    }

    return normalStyle;
  };

  // Custom visual speech bubbles above each podium pedestal
  const renderSpeechBubble = (lane) => {
    const bubbleWrapperStyle = {
      height: '75px',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      width: '100%',
      marginBottom: '1rem'
    };

    const bubbleBaseStyle = {
      padding: '0.6rem 1.1rem',
      borderRadius: '14px',
      fontWeight: 800,
      fontSize: '0.9rem',
      border: '3px solid var(--text-main)',
      position: 'relative',
      boxShadow: '4px 4px 0 var(--text-main)',
      textAlign: 'center',
      display: 'inline-block',
    };

    const arrowStyle = {
      position: 'absolute',
      bottom: '-8px',
      left: '50%',
      transform: 'translateX(-50%) rotate(45deg)',
      width: '12px',
      height: '12px',
      borderBottom: '3px solid var(--text-main)',
      borderRight: '3px solid var(--text-main)'
    };

    let content = null;

    if (lane === 'bronze') {
      if (podiumStep === 'counting-bronze') {
        content = (
          <div className="pulse" style={{ ...bubbleBaseStyle, background: 'var(--accent-purple)', color: '#ffffff' }}>
            ใครจะได้อันดับ 3?
            <div style={{ ...arrowStyle, background: 'var(--accent-purple)' }} />
          </div>
        );
      } else if (podiumStep === 'bronze' || podiumStep === 'silver' || podiumStep === 'gold') {
        content = (
          <div style={{ ...bubbleBaseStyle, background: '#f3e8ff', color: 'var(--text-main)' }}>
            อันดับ 3 ยอดเยี่ยม!
            <div style={{ ...arrowStyle, background: '#f3e8ff' }} />
          </div>
        );
      }
    }

    if (lane === 'silver') {
      if (podiumStep === 'counting-silver') {
        content = (
          <div className="pulse" style={{ ...bubbleBaseStyle, background: 'var(--accent-blue)', color: '#ffffff' }}>
            ลุ้นรองชนะเลิศอันดับ 2!
            <div style={{ ...arrowStyle, background: 'var(--accent-blue)' }} />
          </div>
        );
      } else if (podiumStep === 'silver') {
        content = (
          <div style={{ ...bubbleBaseStyle, background: '#e0f8ff', color: 'var(--text-main)' }}>
            รองแชมป์สุดเก่ง!
            <div style={{ ...arrowStyle, background: '#e0f8ff' }} />
          </div>
        );
      }
    }

    if (lane === 'gold') {
      if (podiumStep === 'counting-gold') {
        content = (
          <div className="pulse" style={{ ...bubbleBaseStyle, background: 'var(--accent-amber)', color: '#ffffff', fontWeight: 900 }}>
            ใครครองอันดับ 1?
            <div style={{ ...arrowStyle, background: 'var(--accent-amber)' }} />
          </div>
        );
      } else if (podiumStep === 'gold' || podiumStep === 'silver') {
        content = (
          <div className="bounce-anim" style={{ ...bubbleBaseStyle, background: 'var(--accent-amber-light)', color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 900, boxShadow: '5px 5px 0 var(--text-main)' }}>
            แชมป์เปี้ยนค่ายประวัติศาสตร์!
            <div style={{ ...arrowStyle, background: 'var(--accent-amber-light)' }} />
          </div>
        );
      }
    }

    return (
      <div style={bubbleWrapperStyle}>
        {content}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-main)' }}>
        <RefreshCw size={48} className="spin" style={{ marginBottom: '1rem', color: 'var(--accent-pink)' }} />
        <h3 style={{ fontWeight: 800 }}>กำลังดึงข้อมูลทีมสะสมแต้มเรียบร้อยแล้ว...</h3>
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
          .spin { animation: spin 1s linear infinite; }
        `}</style>
      </div>
    );
  }

  const totalTeams = teams.length;
  const currentRank = totalTeams - currentIndex;
  const currentTeam = teams[currentIndex];

  // Top 3 Podium Teams
  const bronzeTeam = teams[totalTeams - 3]; // Rank 3
  const silverTeam = teams[totalTeams - 2]; // Rank 2
  const goldTeam = teams[totalTeams - 1];   // Rank 1 (Champion)

  return (
    <div style={{ width: '100vw', minHeight: '100vh', margin: 0, padding: '2rem 1.5rem', boxSizing: 'border-box', background: 'var(--bg-color)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Floating Sparkle Particles */}
      {stars.map(s => (
        <span
          key={s.id}
          className="reveal-star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            animationDelay: `${s.delay}s`
          }}
        >
          {s.type === 'star' && renderStarShape(s.color)}
          {s.type === 'sparkle' && renderSparkleShape(s.color)}
          {s.type === 'dot' && renderDotShape(s.color)}
        </span>
      ))}

      {/* STAGE 1: START SCREEN */}
      {stage === 'start' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div className="glass-card highlighted-card" style={{ padding: '3.5rem 2rem', borderColor: 'var(--accent-amber)', width: '100%' }}>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                background: 'var(--accent-amber-light)',
                border: '3px solid var(--text-main)',
                borderRadius: '50%',
                padding: '1.5rem',
                boxShadow: '4px 4px 0px var(--text-main)',
                animation: 'float 3s ease-in-out infinite'
              }}>
                <Crown size={80} color="var(--accent-amber)" style={{ stroke: 'var(--text-main)', strokeWidth: 2.5 }} />
              </div>
            </div>

            <h1 className="title-main" style={{ fontSize: '3rem', marginBottom: '1rem' }}>พร้อมกันหรือยัง?</h1>
            <p className="title-sub" style={{ fontSize: '1.25rem', marginBottom: '2.5rem', color: 'var(--text-sub)' }}>ร่วมลุ้นตื่นเต้นและเปิดถ้วยรางวัลของแต่ละกลุ่มสะสมแต้ม!</p>
            
            <button onClick={handleStart} className="btn btn-amber mt-4" style={{ padding: '1.2rem 2.5rem', fontSize: '1.4rem', margin: '0 auto', maxWidth: '350px' }}>
              <Play size={22} style={{ fill: 'currentColor' }} /> เริ่มประกาศผลรางวัล
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: LIST REVEAL LOOP (RANK N DOWN TO 4) */}
      {stage === 'reveal-list' && currentTeam && (
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '85vh' }}>
          
          <div className="glass-card highlighted-card" style={{ width: '100%', padding: '3.5rem 2rem', textAlign: 'center', position: 'relative', borderColor: 'var(--text-main)' }}>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="badge badge-gray" style={{ fontSize: '1rem', padding: '0.5rem 1.2rem', letterSpacing: '1px' }}>
                ประกาศลำดับผลการแข่งขัน
              </span>
              <h2 className="title-main" style={{ fontSize: '6rem', margin: '1rem 0 0', textShadow: '-3px -3px 0 var(--text-main), 3px -3px 0 var(--text-main), -3px 3px 0 var(--text-main), 3px 3px 0 var(--text-main), 6px 6px 0 var(--text-main)' }}>
                อันดับที่ {currentRank}
              </h2>
            </div>

            {/* Suspense box */}
            <div style={{ minHeight: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '2rem 0' }}>
              {!isRevealed ? (
                <div 
                  style={{ border: '3px dashed var(--text-main)', borderRadius: '16px', background: '#f8fafc', padding: '2.5rem', width: '100%', maxWidth: '500px', cursor: 'pointer', textAlign: 'center' }} 
                  onClick={handleReveal}
                >
                  <Volume2 size={48} className="pulse-slow" style={{ margin: '0 auto 1rem', color: 'var(--text-sub)' }} />
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-sub)' }}>กดเพื่อเปิดลุ้นผลอันดับ {currentRank}</h3>
                </div>
              ) : (
                <div style={{ animation: 'slideUp 0.5s ease-out forwards' }}>
                  <p style={{ color: 'var(--accent-pink)', fontSize: '1.3rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                    <Sparkles size={18} color="var(--accent-pink)" /> ยินดีด้วยกับทีมงานคุณ <Sparkles size={18} color="var(--accent-pink)" />
                  </p>
                  <h3 style={{ fontSize: '4.2rem', fontWeight: 900, color: 'var(--text-main)', wordBreak: 'break-word', textShadow: '2px 2px 0px #ffe4f0' }}>{currentTeam.name}</h3>
                  <div className="badge badge-green" style={{ fontSize: '1.4rem', padding: '0.6rem 1.5rem', marginTop: '1.5rem' }}>
                    คะแนนสะสม: {currentTeam.points} แต้ม
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '400px', marginTop: '1.5rem' }}>
            {!isRevealed ? (
              <button onClick={handleReveal} className="btn" style={{ padding: '1.1rem', fontSize: '1.2rem' }}>
                <Volume2 size={20}/> เปิดเผยรายชื่อทีม
              </button>
            ) : (
              <button onClick={handleNext} className="btn btn-amber" style={{ padding: '1.1rem', fontSize: '1.2rem' }}>
                {currentIndex + 1 >= totalTeams - 3 ? <><Trophy size={20}/> เข้าสู่โพเดียมผู้ชนะเลิศ (Top 3)</> : <><ChevronRight size={20}/> ไปอันดับถัดไป</>}
              </button>
            )}
          </div>
        </div>
      )}

      {/* STAGE 3: PODIUM CEREMONY */}
      {stage === 'podium' && ceremonyMode === null && (
        <div style={{ maxWidth: '750px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <div className="glass-card highlighted-card" style={{ padding: '3.5rem 2rem', borderColor: 'var(--accent-amber)', width: '100%', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                background: 'var(--accent-amber-light)',
                border: '3px solid var(--text-main)',
                borderRadius: '50%',
                padding: '1.2rem',
                boxShadow: '4px 4px 0px var(--text-main)',
                animation: 'float 3s ease-in-out infinite'
              }}>
                <Trophy size={60} color="var(--accent-amber)" style={{ stroke: 'var(--text-main)', strokeWidth: 2.5 }} />
              </div>
            </div>
            <h2 className="title-main" style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>เข้าสู่ช่วง 3 อันดับสุดท้าย!</h2>
            <p className="title-sub" style={{ fontSize: '1.1rem', marginBottom: '2.5rem', color: 'var(--text-sub)' }}>
              เลือกรูปแบบที่คุณต้องการเพื่อประกาศผลรางวัลอันทรงเกียรติ
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
              <button 
                onClick={() => {
                  setCeremonyMode('auto');
                  startAutomatedCeremony();
                }} 
                className="btn btn-amber" 
                style={{ padding: '1.2rem', fontSize: '1.25rem', background: 'var(--accent-amber)' }}
              >
                <Sparkles size={20} /> เริ่มประกาศอัตโนมัติแบบภาพยนตร์ (3 - 1 - 2)
              </button>
              
              <button 
                onClick={() => {
                  setCeremonyMode('manual');
                  setPodiumStep('idle');
                }} 
                className="btn btn-secondary" 
                style={{ padding: '1.2rem', fontSize: '1.25rem' }}
              >
                <Volume2 size={20} /> ประกาศทีละลำดับ (ควบคุมแบบแมนนวลเอง)
              </button>
            </div>
          </div>
        </div>
      )}

      {stage === 'podium' && ceremonyMode !== null && (
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '90vh' }}>
          
          <div className="text-center" style={{ marginBottom: '1.5rem' }}>
            <span className="badge badge-amber" style={{ fontSize: '0.95rem', padding: '0.4rem 1.5rem', marginBottom: '0.5rem' }}>
              {ceremonyMode === 'auto' ? 'พิธีประกาศผลแบบอัตโนมัติ' : 'ผู้ดำเนินรายการกดควบคุมเอง'}
            </span>
            <h1 className="title-main" style={{ fontSize: '3rem', color: 'var(--text-main)', textShadow: '-1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 1.5px 1.5px 0 #fff, 3.5px 3.5px 0px var(--text-main)' }}>
              แท่นผู้ชนะเลิศ (TOP 3 PODIUM)
            </h1>

            {/* Tension status messages */}
            <div style={{ height: '30px', margin: '0.5rem 0 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {podiumStep === 'counting-bronze' && <span className="pulse" style={{ color: 'var(--accent-purple)', fontWeight: 800, fontSize: '1.1rem' }}>กำลังรวบรวมข้อมูลรางวัลอันดับ 3...</span>}
              {podiumStep === 'counting-silver' && <span className="pulse" style={{ color: 'var(--accent-blue)', fontWeight: 800, fontSize: '1.1rem' }}>กำลังลุ้นผลผู้คว้ารองชนะเลิศอันดับ 2...</span>}
              {podiumStep === 'counting-gold' && <span className="pulse" style={{ color: 'var(--accent-amber)', fontWeight: 900, fontSize: '1.2rem' }}>ระทึก! ใครคือแชมป์เปี้ยนค่ายคนใหม่...</span>}
              {podiumStep === 'gold' && <span style={{ color: 'var(--accent-pink)', fontWeight: 900, fontSize: '1.25rem', letterSpacing: '1px' }}>ขอแสดงความยินดีกับแชมป์เปี้ยนและผู้ชนะรางวัลทุกกลุ่ม!</span>}
            </div>
          </div>

          {/* Epic Flex Pedestals */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '1.5rem',
            width: '100%',
            minHeight: '440px',
            margin: '1.5rem 0 2rem 0',
            flexWrap: 'wrap'
          }}>
            
            {/* LEFT PEDESTAL: SILVER (RANK 2) */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: '1 1 250px',
              maxWidth: '300px',
              minWidth: '220px',
              ...getLaneStyle('silver')
            }}>
              {renderSpeechBubble('silver')}

              {(podiumStep === 'silver') ? (
                <div className="glass-card" style={{
                  padding: '1.8rem 1.2rem',
                  borderColor: 'var(--accent-blue)',
                  background: '#ffffff',
                  textAlign: 'center',
                  width: '100%',
                  animation: 'slideUp 0.6s ease-out forwards',
                  boxShadow: '6px 6px 0px var(--text-main)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' }}>
                    <div className="badge badge-blue" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', border: '2px solid var(--text-main)', background: '#e0f8ff', padding: '0.3rem 0.8rem', fontWeight: 800 }}>
                      <Award size={16} /> 2nd Place
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1.7rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: "'Kanit', sans-serif", letterSpacing: '0.5px' }}>
                    {silverTeam.name}
                  </h3>
                  <p style={{ color: 'var(--accent-pink)', fontWeight: 950, fontSize: '1.35rem', marginTop: '0.6rem' }}>
                    {silverTeam.points} แต้ม
                  </p>
                </div>
              ) : (
                <div style={{
                  border: '3.5px dashed var(--accent-blue)',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.7)',
                  padding: '2.5rem 1rem',
                  textAlign: 'center',
                  width: '100%',
                  minHeight: '160px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '4px 4px 0 var(--text-main)',
                  animation: podiumStep === 'counting-silver' ? 'shake 0.4s infinite' : 'none'
                }}>
                  <Award size={44} style={{ color: 'var(--accent-blue)', opacity: 0.5 }} />
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-blue)', marginTop: '0.6rem' }}>รองชนะเลิศอันดับ 2</span>
                </div>
              )}

              {/* Pedestal Stand Column */}
              <div style={{
                background: 'repeating-linear-gradient(45deg, #cbd5e1, #cbd5e1 10px, #e2e8f0 10px, #e2e8f0 20px)',
                border: '3px solid var(--text-main)',
                width: '100%',
                height: '150px',
                marginTop: '1rem',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
                boxShadow: '4px 4px 0 var(--text-main)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '2.6rem', fontWeight: 950, color: 'var(--text-main)', textShadow: '2px 2px 0 #fff' }}>SILVER</span>
              </div>
            </div>

            {/* CENTER PEDESTAL: GOLD (RANK 1 - CHAMPION) */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: '1 1 270px',
              maxWidth: '320px',
              minWidth: '240px',
              transform: 'translateY(-15px)',
              ...getLaneStyle('gold')
            }}>
              {renderSpeechBubble('gold')}

              {(podiumStep === 'gold' || podiumStep === 'silver') ? (
                <div className="glass-card highlighted-card pulse-ring-gold" style={{
                  padding: '2.2rem 1.2rem',
                  borderColor: 'var(--accent-amber)',
                  background: 'linear-gradient(135deg, var(--accent-amber-light) 0%, #ffffff 100%)',
                  textAlign: 'center',
                  width: '100%',
                  animation: 'slideUp 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <Crown size={24} color="var(--accent-amber)" style={{ stroke: 'var(--text-main)', strokeWidth: 2 }} />
                    <div className="badge badge-amber" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', border: '2px solid var(--text-main)', padding: '0.3rem 0.8rem', fontWeight: 900 }}>
                      <Award size={16} /> 1st Place
                    </div>
                  </div>
                  <h3 style={{ fontSize: '2.1rem', fontWeight: 950, color: 'var(--text-main)', fontFamily: "'Kanit', sans-serif", letterSpacing: '0.5px' }}>
                    {goldTeam.name}
                  </h3>
                  <p style={{ color: 'var(--accent-pink)', fontWeight: 950, fontSize: '1.6rem', marginTop: '0.6rem', textShadow: '1px 1px 0 var(--text-main)' }}>
                    {goldTeam.points} แต้ม
                  </p>
                </div>
              ) : (
                <div style={{
                  border: '3.5px dashed var(--accent-amber)',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.7)',
                  padding: '3rem 1rem',
                  textAlign: 'center',
                  width: '100%',
                  minHeight: '190px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '4px 4px 0 var(--text-main)',
                  animation: podiumStep === 'counting-gold' ? 'shake 0.4s infinite' : 'none'
                }}>
                  <Crown size={48} style={{ color: 'var(--accent-amber)', animation: 'float 2s infinite' }} />
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '0.6rem' }}>แชมเปี้ยนอันดับ 1</span>
                </div>
              )}

              {/* Pedestal Stand Column */}
              <div style={{
                background: 'repeating-linear-gradient(45deg, var(--accent-amber-light), var(--accent-amber-light) 10px, #f59e0b 10px, #f59e0b 20px)',
                border: '3px solid var(--text-main)',
                width: '100%',
                height: '210px',
                marginTop: '1rem',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
                boxShadow: '4px 4px 0 var(--text-main)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <span style={{ fontSize: '3.2rem', fontWeight: 950, color: 'var(--text-main)', textShadow: '2px 2px 0 #fff' }}>GOLD</span>
              </div>
            </div>

            {/* RIGHT PEDESTAL: BRONZE (RANK 3) */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: '1 1 250px',
              maxWidth: '300px',
              minWidth: '220px',
              ...getLaneStyle('bronze')
            }}>
              {renderSpeechBubble('bronze')}

              {(podiumStep === 'bronze' || podiumStep === 'silver' || podiumStep === 'gold') ? (
                <div className="glass-card" style={{
                  padding: '1.6rem 1.2rem',
                  borderColor: 'var(--accent-purple)',
                  background: '#ffffff',
                  textAlign: 'center',
                  width: '100%',
                  animation: 'slideUp 0.5s ease-out forwards',
                  boxShadow: '6px 6px 0px var(--text-main)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' }}>
                    <div className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', border: '2px solid var(--text-main)', background: '#f3e8ff', padding: '0.3rem 0.8rem', fontWeight: 800 }}>
                      <Award size={16} /> 3rd Place
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: "'Kanit', sans-serif", letterSpacing: '0.5px' }}>
                    {bronzeTeam.name}
                  </h3>
                  <p style={{ color: 'var(--accent-pink)', fontWeight: 950, fontSize: '1.3rem', marginTop: '0.6rem' }}>
                    {bronzeTeam.points} แต้ม
                  </p>
                </div>
              ) : (
                <div style={{
                  border: '3.5px dashed var(--accent-purple)',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.7)',
                  padding: '2.5rem 1rem',
                  textAlign: 'center',
                  width: '100%',
                  minHeight: '130px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '4px 4px 0 var(--text-main)',
                  animation: podiumStep === 'counting-bronze' ? 'shake 0.4s infinite' : 'none'
                }}>
                  <Award size={40} style={{ color: 'var(--accent-purple)', opacity: 0.5 }} />
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-purple)', marginTop: '0.6rem' }}>อันดับ 3</span>
                </div>
              )}

              {/* Pedestal Stand Column */}
              <div style={{
                background: 'repeating-linear-gradient(45deg, #edd6c0, #edd6c0 10px, #d97706 10px, #d97706 20px)',
                border: '3px solid var(--text-main)',
                width: '100%',
                height: '110px',
                marginTop: '1rem',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
                boxShadow: '4px 4px 0 var(--text-main)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 950, color: 'var(--text-main)', textShadow: '2px 2px 0 #fff' }}>BRONZE</span>
              </div>
            </div>

          </div>

          {/* Ceremony Mode Action Panel */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', width: '100%', maxWidth: '480px', marginTop: '1rem' }}>
            {ceremonyMode === 'manual' && (
              <>
                {podiumStep === 'idle' && (
                  <button onClick={handleRevealBronze} disabled={podiumLoading} className="btn btn-purple" style={{ padding: '1.2rem', fontSize: '1.25rem' }}>
                    <Volume2 size={20}/> เปิดเผยอันดับ 3
                  </button>
                )}
                {podiumStep === 'bronze' && (
                  <button onClick={handleRevealGold} disabled={podiumLoading} className="btn btn-amber" style={{ padding: '1.2rem', fontSize: '1.25rem' }}>
                    <Crown size={20} /> ประกาศแชมป์เปี้ยน!
                  </button>
                )}
                {podiumStep === 'gold' && (
                  <button onClick={handleRevealSilver} disabled={podiumLoading} className="btn btn-blue" style={{ padding: '1.2rem', fontSize: '1.25rem' }}>
                    <Volume2 size={20}/> เปิดเผยอันดับ 2
                  </button>
                )}
              </>
            )}

            {podiumStep === 'silver' && (
              <button onClick={() => setStage('leaderboard')} className="btn btn-success" style={{ padding: '1.2rem', fontSize: '1.3rem', width: '100%' }}>
                <ListOrdered size={20}/> แสดงตารางสรุปบอร์ดคะแนนรวมทั้งหมด
              </button>
            )}
          </div>

        </div>
      )}

      {/* STAGE 4: LEADERBOARD SCREEN */}
      {stage === 'leaderboard' && (
        <div style={{ maxWidth: '850px', margin: '0 auto', paddingBottom: '4rem' }}>
          
          <div className="text-center" style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
              <div style={{ background: '#fffbeb', border: '3px solid var(--text-main)', borderRadius: '50%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={48} color="var(--accent-amber)" />
              </div>
            </div>
            <h1 className="title-main" style={{ fontSize: '3.5rem', color: 'var(--text-main)' }}>Leaderboard</h1>
            <p className="title-sub" style={{ fontSize: '1.2rem' }}>สรุปตารางอันดับสะสมลูกอมประจำค่าย</p>
          </div>

          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[...teams].reverse().map((t, index) => {
                const rank = index + 1;
                const isFirst = rank === 1;
                const isSecond = rank === 2;
                const isThird = rank === 3;

                return (
                  <div key={t.id} className={`leaderboard-row ${isFirst ? 'leaderboard-row-first' : ''}`} style={{ padding: '1.2rem 2rem' }}>
                    <div style={{ width: '110px', display: 'flex', alignItems: 'center' }}>
                      {isFirst ? (
                        <div className="badge badge-amber" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.6rem', border: '2px solid var(--text-main)', fontWeight: 800 }}>
                          <Award size={16} /> 1st
                        </div>
                      ) : isSecond ? (
                        <div className="badge badge-blue" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.6rem', border: '2px solid var(--text-main)', background: '#e0f8ff', fontWeight: 800 }}>
                          <Award size={16} /> 2nd
                        </div>
                      ) : isThird ? (
                        <div className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.6rem', border: '2px solid var(--text-main)', background: '#f3e8ff', fontWeight: 800 }}>
                          <Award size={16} /> 3rd
                        </div>
                      ) : (
                        <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.2rem', paddingLeft: '0.5rem' }}>
                          #{rank}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.3rem' }}>{t.name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: 600 }}>ID: {t.id}</p>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-pink)', textShadow: '1.5px 1.5px 0 var(--text-main)' }}>
                      {t.points} <span style={{ fontSize: '0.9rem', color: 'var(--text-sub)', textShadow: 'none' }}>ลูกอม</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
            <button onClick={() => { setStage('start'); setIsRevealed(false); setCeremonyMode(null); }} className="btn btn-secondary" style={{ width: 'auto', padding: '1rem 2rem', fontSize: '1.1rem' }}>
              <RefreshCw size={18} /> เริ่มต้นการประกาศผลอีกรอบ
            </button>
          </div>
        </div>
      )}

      {/* Embedded Animations and Keyframes */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shake {
          0%, 100% { transform: rotate(0deg) translate(0, 0); }
          20% { transform: rotate(-2deg) translate(-2px, 1px); }
          40% { transform: rotate(2deg) translate(2px, -1px); }
          60% { transform: rotate(-1deg) translate(-1px, 2px); }
          80% { transform: rotate(1deg) translate(1px, -2px); }
        }
        .bounce-anim {
          animation: bounce 1.2s infinite ease-in-out;
        }
        .pulse {
          animation: pulseSlow 1.5s infinite ease-in-out;
        }
        .pulse-slow {
          animation: pulseSlow 2.2s infinite ease-in-out;
        }
        @keyframes pulseSlow {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>

    </div>
  );
}
