import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';
import { Crown, ListOrdered, RotateCcw } from 'lucide-react';
import './GrandReveal.css'; // We'll create this for specific grand reveal styles

const soundEngine = {
  ctx: null,
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  playFlip() {
    try {
      this.init();
      if(this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      
      const drumroll = this.ctx.createOscillator();
      const drumGain = this.ctx.createGain();
      drumroll.type = 'triangle';
      drumroll.frequency.setValueAtTime(65, now);
      drumroll.connect(drumGain);
      drumGain.connect(this.ctx.destination);
      
      drumGain.gain.setValueAtTime(0.01, now);
      drumGain.gain.linearRampToValueAtTime(0.25, now + 0.1);
      drumGain.gain.setValueAtTime(0.25, now + 0.2);
      for (let t = now; t < now + 0.5; t += 0.05) {
          drumGain.gain.setValueAtTime(0.25, t);
          drumGain.gain.exponentialRampToValueAtTime(0.05, t + 0.025);
      }
      drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      
      drumroll.start(now);
      drumroll.stop(now + 0.55);

      setTimeout(() => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1300, this.ctx.currentTime + 0.25);
          
          gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.55);
          
          osc.start();
          osc.stop(this.ctx.currentTime + 0.55);
      }, 480);
      
    } catch (e) { console.error(e); }
  },
  playVictory() {
    try {
      this.init();
      if(this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      
      const playNote = (freq, start, duration, volume = 0.15) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, start);
          
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(250, start);
          filter.frequency.exponentialRampToValueAtTime(1800, start + 0.18);
          
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          
          gain.gain.setValueAtTime(0.01, start);
          gain.gain.linearRampToValueAtTime(volume, start + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
          
          osc.start(start);
          osc.stop(start + duration);
      };

      playNote(261.63, now, 0.25); // C4
      playNote(329.63, now + 0.15, 0.25); // E4
      playNote(392.00, now + 0.3, 0.25); // G4
      playNote(523.25, now + 0.45, 0.3); // C5
      
      playNote(261.63 * 2, now + 0.6, 2.0, 0.08); // C5
      playNote(329.63 * 2, now + 0.6, 2.0, 0.08); // E5
      playNote(392.00 * 2, now + 0.6, 2.0, 0.08); // G5
      playNote(523.25 * 2, now + 0.6, 2.5, 0.1);  // C6
    } catch (e) { console.error(e); }
  }
};

class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
  }
  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = Math.random() * 0.15 - 0.075;
    this.speedY = Math.random() * 0.15 - 0.075;
    this.alpha = Math.random() * 0.5 + 0.1;
    this.decay = Math.random() * 0.002 + 0.0005;
  }
  update() {
    this.x += this.x > this.canvas.width ? -this.canvas.width : this.x < 0 ? this.canvas.width : this.speedX;
    this.y += this.y > this.canvas.height ? -this.canvas.height : this.y < 0 ? this.canvas.height : this.speedY;
    
    this.alpha += this.decay * (Math.random() > 0.5 ? 1 : -1);
    if (this.alpha <= 0) this.alpha = 0.05;
    if (this.alpha >= 0.8) this.alpha = 0.7;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    if (this.size > 1.8) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = Math.random() > 0.5 ? "#00d2ff" : "#ff2e93";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size + 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export default function GrandReveal() {
  const [screen, setScreen] = useState('start'); // start, reveal, champion
  const [loading, setLoading] = useState(false);
  const [winnersData, setWinnersData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // 0 = rank 10
  const [isRevealed, setIsRevealed] = useState(false);
  const [showTable, setShowTable] = useState(false);
  
  const canvasRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      let particles = [];
      
      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', resize);
      resize();
      
      for (let i = 0; i < 70; i++) particles.push(new Particle(canvas));
      
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(ctx); });
        animationFrameId = requestAnimationFrame(render);
      };
      render();
      
      return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, []);

  const shootConfettiSmall = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#ff2e93', '#9d4edd', '#00d2ff', '#05f2c7', '#ffbe0b'] });
  };

  const shootConfettiGrand = () => {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    
    const randomInRange = (min, max) => Math.random() * (max - min) + min;
    
    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#ffbe0b', '#ff4500', '#ffffff'] }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#ffbe0b', '#ff4500', '#ffffff'] }));
    }, 250);
    
    confetti({ particleCount: 300, spread: 120, origin: { y: 0.75 }, colors: ['#ffbe0b', '#ff2e93', '#00d2ff'] });
  };

  const fetchScores = async () => {
    setLoading(true);
    soundEngine.playFlip();
    const { data } = await supabase.from('teams').select('*').order('points', { ascending: false });
    
    if (data) {
      const formatted = [];
      for (let i = data.length - 1; i >= 0; i--) {
        formatted.push({ rank: i + 1, name: data[i].name, prize: `${data[i].points} แต้ม` });
      }
      setWinnersData(formatted);
      setCurrentIndex(0);
      setIsRevealed(false);
      setScreen('reveal');
    }
    setLoading(false);
  };

  const handleReveal = () => {
    soundEngine.playFlip();
    setIsRevealed(true);
    if (winnersData[currentIndex].rank !== 1) {
      shootConfettiSmall();
    }
  };

  const handleNext = () => {
    if (currentIndex >= winnersData.length - 1) {
      setScreen('champion');
      setTimeout(() => {
        soundEngine.playVictory();
        shootConfettiGrand();
      }, 500);
    } else {
      setCurrentIndex(currentIndex + 1);
      setIsRevealed(false);
    }
  };

  const currentData = winnersData[currentIndex] || {};

  return (
    <div className="reveal-body">
      <canvas ref={canvasRef} id="spaceBackdrop"></canvas>
      <div className="ambient-orb orb-pink"></div>
      <div className="ambient-orb orb-blue"></div>
      <div className="ambient-orb orb-purple"></div>

      {loading && (
        <div className="loading-spinner active">
          <div className="spinner"></div>
          <p style={{ color: '#ff2e93', fontWeight: 'bold' }}>กำลังดึงข้อมูลจากระบบ...</p>
        </div>
      )}

      <div className="reveal-container">
        {screen === 'start' && (
          <div className="start-screen">
            <Crown size={80} color="#ffbe0b" style={{ filter: 'drop-shadow(0 0 20px rgba(255,190,11,0.5))', marginBottom: '2rem' }} className="animate-bounce" />
            <h1 className="reveal-title">พร้อมกันหรือยัง?</h1>
            <p className="reveal-subtitle">เข้าสู่ช่วงเวลาที่ตื่นเต้นที่สุดของค่าย! ร่วมลุ้นระทึกเปิดแชมป์และตารางคะแนนรวมไปพร้อมกัน</p>
            <button onClick={fetchScores} className="btn-premium reveal-btn">เริ่มประกาศผล 🚀</button>
          </div>
        )}

        {screen === 'reveal' && (
          <div className="reveal-screen">
            <div className={`glass-panel glow-card-pulse rank-container ${currentData.rank === 1 ? 'rank-glow-gold' : currentData.rank === 2 ? 'rank-glow-silver' : currentData.rank === 3 ? 'rank-glow-bronze' : ''}`}>
              <div style={{ textAlign: 'center' }}>
                <span className="rank-label">รางวัลอันดับที่</span>
                <h2 className={`rank-number ${currentData.rank === 1 ? 'neon-text-gold' : currentData.rank === 2 ? 'neon-text-silver' : currentData.rank === 3 ? 'neon-text-bronze' : 'text-white'}`}>
                  {currentData.rank}
                </h2>
              </div>

              {isRevealed && (
                <div className="winner-area reveal-anim">
                  <p className="winner-congrats">🎉 ขอแสดงความยินดีกับ 🎉</p>
                  <h3 className="winner-name">{currentData.name}</h3>
                  <p className="winner-prize">คะแนนรวม: {currentData.prize}</p>
                </div>
              )}
            </div>

            <div className="reveal-actions">
              {!isRevealed ? (
                <button onClick={handleReveal} className="btn-premium reveal-btn w-full">เปิดเผยชื่อ! 🥁</button>
              ) : (
                <button onClick={handleNext} className={`btn-premium reveal-btn w-full ${currentData.rank === 2 ? 'animate-pulse' : ''}`}>
                  {currentData.rank === 2 ? '🏆 เตรียมพบกับผู้ชนะเลิศอันดับ 1 🏆' : 'ไปอันดับต่อไป ➡️'}
                </button>
              )}
            </div>
          </div>
        )}

        {screen === 'champion' && (
          <div className="champion-screen">
            <h2 className="champion-title">🏆 แชมเปี้ยนอันดับที่ 1 🏆</h2>
            
            <div className="glass-panel champion-glass-card group">
              <div className="shimmer-effect"></div>
              <p className="champion-subtitle">สุดยอดแชมป์เปี้ยนผู้ชนะเลิศค่ายในวันนี้ ได้แก่...</p>
              <h3 className="champion-name reveal-anim">{winnersData[winnersData.length - 1]?.name}</h3>
              <div style={{ marginTop: '2rem' }}>
                <span className="champion-prize-label">ครองคะแนนรวมสูงสุดในกิจกรรม</span>
                <p className="champion-prize-value">{winnersData[winnersData.length - 1]?.prize}</p>
              </div>
            </div>

            {showTable && (
              <div className="leaderboard-stack-container">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <Crown size={40} color="#ffbe0b" />
                  <h2 className="stack-title">LEADERBOARD</h2>
                  <Crown size={40} color="#ffbe0b" />
                </div>
                <div className="leaderboard-stack">
                  {[...winnersData].reverse().map((team, idx) => (
                    <div key={idx} className={`stack-row ${idx === 0 ? 'stack-row-gold' : idx === 1 ? 'stack-row-silver' : idx === 2 ? 'stack-row-bronze' : 'stack-row-normal'}`} style={{ animationDelay: `${idx * 0.12}s` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className="stack-rank">{idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : team.rank < 10 ? `0${team.rank}` : team.rank}</span>
                        <span className="stack-name">{team.name}</span>
                      </div>
                      <div className={`stack-score ${idx === 0 ? 'score-gold' : idx === 1 ? 'score-silver' : idx === 2 ? 'score-bronze' : 'score-normal'}`}>
                        {team.prize}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="champion-actions">
              {!showTable && (
                <button onClick={() => { soundEngine.playFlip(); setShowTable(true); shootConfettiSmall(); }} className="btn-premium reveal-btn w-full">
                  <ListOrdered size={24} style={{ display: 'inline', marginRight: '0.5rem' }} /> แสดงตารางสรุปคะแนนรวมทั้งหมด
                </button>
              )}
              <button onClick={() => { soundEngine.playFlip(); setScreen('start'); setShowTable(false); }} className="btn-secondary-premium reveal-btn w-full">
                <RotateCcw size={24} style={{ display: 'inline', marginRight: '0.5rem' }} /> เริ่มต้นใหม่
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
