import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Sparkles, Ticket, Ghost, Zap, Trophy, Lock, ChevronRight, ChevronLeft } from 'lucide-react';

export default function HowToPlay() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  // สไลด์คำอธิบายแต่ละหน้า
  const slides = [
    {
      title: "ยินดีต้อนรับสู่ Candy Camp!",
      subtitle: "ยินดีต้อนรับน้องๆ เข้าสู่แคมป์ลูกอมสุดหรรษา",
      icon: <BookOpen size={48} color="var(--accent-pink)" style={{ filter: 'drop-shadow(0 2px 8px rgba(255, 46, 147, 0.3))' }} />,
      color: "var(--accent-pink)",
      bg: "linear-gradient(135deg, rgba(255, 46, 147, 0.1) 0%, rgba(157, 78, 221, 0.1) 100%)",
      content: (
        <div style={{ textAlign: 'center', lineHeight: '1.6' }}>
          <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
            นี่คือระบบกระเป๋าสะสมแต้มดิจิทัลที่จะพาน้องๆ ไปสนุกกับการผจญภัยไขภารกิจรอบค่าย!
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', marginTop: '1rem', fontWeight: 500 }}>
            กติกาง่ายๆ เพียงกดศึกษาไปทีละหน้า (ใช้เวลาเพียง 1 นาที) เพื่อเตรียมพร้อมรับแต้มไปเป็นราชาลูกอมกันเลยครับ! 🍬✨
          </p>
        </div>
      )
    },
    {
      title: "เริ่มต้นการผจญภัย",
      subtitle: "🎒 รับกระเป๋าสะสมแต้มดิจิทัล",
      icon: <Sparkles size={48} color="var(--accent-blue)" style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 210, 255, 0.3))' }} />,
      color: "var(--accent-blue)",
      bg: "linear-gradient(135deg, rgba(0, 210, 255, 0.1) 0%, rgba(157, 78, 221, 0.1) 100%)",
      content: (
        <div style={{ textAlign: 'center', lineHeight: '1.6' }}>
          <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
            น้องๆ ทุกกลุ่มจะได้รับ **"ลูกอมเริ่มต้น"** บรรจุอยู่ในกระเป๋าเงินดิจิทัลของกลุ่มตั้งแต่เข้าแคมป์!
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', marginTop: '1rem', fontWeight: 500 }}>
            ลูกอมนี้เปรียบเหมือนพลังงานชีวิตที่น้องๆ ต้องใช้เดินทางจ่ายเพื่อเข้าร่วมทำกิจกรรมในแต่ละฐาน และสะสมรางวัลกลับมาให้ได้มากที่สุดเมื่อจบค่าย!
          </p>
        </div>
      )
    },
    {
      title: "ฐานกิจกรรมปกติ",
      subtitle: "⚡ ภารกิจประลองพลังฐานปกติ",
      icon: <Zap size={48} color="var(--accent-pink)" style={{ filter: 'drop-shadow(0 2px 8px rgba(255, 46, 147, 0.3))' }} />,
      color: "var(--accent-pink)",
      bg: "linear-gradient(135deg, rgba(255, 46, 147, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%)",
      content: (
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <span style={{ background: 'var(--accent-pink)', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900, flexShrink: 0 }}>1</span>
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>เมื่อไปถึงฐาน ให้สแกนหรือกดเลือกชื่อฐานนั้นในมือถือ</p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <span style={{ background: 'var(--accent-pink)', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900, flexShrink: 0 }}>2</span>
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>กดปุ่ม <span style={{ color: 'var(--accent-pink)', fontWeight: 800 }}>"จ่ายลูกอมเพื่อเล่น"</span> (แต้มจะหักออกทันที)</p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <span style={{ background: 'var(--accent-green)', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900, flexShrink: 0 }}>3</span>
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>ตั้งใจเล่นเกมให้ชนะ! พี่สตาฟฟ์จะกดยืนยันผ่านมือถือเพื่อบวกแต้มรางวัลกลับคืนเข้ากระเป๋าของน้องทันที!</p>
          </div>
        </div>
      )
    },
    {
      title: "ฐานล็อตเตอรี่เสี่ยงโชค",
      subtitle: "🎟️ สุ่มดวงลุ้นรางวัลใหญ่ (ฐาน 9)",
      icon: <Ticket size={48} color="var(--accent-blue)" style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 210, 255, 0.3))' }} />,
      color: "var(--accent-blue)",
      bg: "linear-gradient(135deg, rgba(0, 210, 255, 0.1) 0%, rgba(157, 78, 221, 0.1) 100%)",
      content: (
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <span style={{ background: 'var(--accent-blue)', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900, flexShrink: 0 }}>1</span>
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>เมื่อผ่านฐาน 9 สามารถกดจ่ายลูกอมซื้อตั๋วเสี่ยงดวงได้ทันที</p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <span style={{ background: 'var(--accent-blue)', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900, flexShrink: 0 }}>2</span>
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>จ่ายแต้มเสร็จแล้ว เดินไปเล่นฐานอื่นๆ ต่อได้เลยโดยไม่ต้องยืนทำกิจกรรม</p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <span style={{ background: 'var(--accent-purple)', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900, flexShrink: 0 }}>3</span>
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>รอฟังผลลุ้นผู้โชคดีที่จะได้รับรางวัลคูณ **x5 เท่า** ตามเวลาที่กำหนดจบค่ายครับ!</p>
          </div>
        </div>
      )
    },
    {
      title: "ฐานลับกู้ชีพพี่พีช",
      subtitle: "👻 ฐานลับเสกแต้มฟรี (ฐานผี - ฐาน 4)",
      icon: <Ghost size={48} color="var(--accent-purple)" style={{ filter: 'drop-shadow(0 2px 8px rgba(157, 78, 221, 0.3))' }} />,
      color: "var(--accent-purple)",
      bg: "linear-gradient(135deg, rgba(157, 78, 221, 0.1) 0%, rgba(255, 46, 147, 0.1) 100%)",
      content: (
        <div style={{ textAlign: 'center', lineHeight: '1.6' }}>
          <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
            หากน้องๆ บังเอิญเจอกิจกรรมลับกับพี่สตาฟฟ์พี่พีช น้องๆ สามารถกู้แต้มคืนได้!
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', marginTop: '1rem', fontWeight: 500 }}>
            เพียงแค่ยื่นมือถือให้พี่พีชป้อน **"รหัสลับประจำฐาน"** พี่พีชจะสามารถเลือกมอบแต้มเศษพิเศษตั้งแต่ **2 ถึง 10 ลูกอม** เข้ากลุ่มของน้องได้แบบฟรีๆ โดยไม่มีค่าใช้จ่ายเลยครับ!
          </p>
        </div>
      )
    },
    {
      title: "เช็คอันดับและการลุ้นระทึก",
      subtitle: "🏆 ตารางคะแนนรวมและศึกซ่อนแต้ม",
      icon: <Trophy size={48} color="var(--accent-gold)" style={{ filter: 'drop-shadow(0 2px 8px rgba(255, 190, 11, 0.3))' }} />,
      color: "var(--accent-gold)",
      bg: "linear-gradient(135deg, rgba(255, 190, 11, 0.1) 0%, rgba(255, 46, 147, 0.1) 100%)",
      content: (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center' }}>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: '1.5' }}>
            น้องๆ สามารถกดเช็คแต้มปัจจุบันได้ที่หน้าแรก (Dashboard) และสามารถดูอันดับของทั้ง 10 กลุ่มได้ที่ปุ่ม **Leaderboard**
          </p>
          
          <div style={{ 
            background: 'rgba(255, 190, 11, 0.08)', 
            border: '1.5px dashed var(--accent-gold)', 
            padding: '0.8rem', 
            borderRadius: '12px',
            display: 'flex',
            gap: '0.6rem',
            alignItems: 'center',
            marginTop: '0.5rem',
            textAlign: 'left'
          }}>
            <Lock color="var(--accent-gold)" size={20} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.8rem', color: '#ffbe0b', fontWeight: 600, lineHeight: '1.4' }}>
              <b>ช่วงเวลาสุดระทึก:</b> ท้ายกิจกรรมแคมป์ แอดมินอาจเปิดระบบ "ซ่อนแต้มรวม" ทุกทีมจะเห็นเป็น `🔒 ???` เพื่อให้รอลุ้นเซอร์ไพรส์เฉลยผู้ชนะตอนประกาศรางวัลจบค่ายครับ!
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < slides.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const activeSlide = slides[currentStep];

  return (
    <div className="mt-2" style={{ fontFamily: "'Kanit', sans-serif", paddingBottom: '2.5rem', maxWidth: '500px', margin: '0 auto' }}>
      
      {/* Top Back Arrow */}
      <button 
        onClick={() => navigate(-1)} 
        className="btn-secondary mb-3" 
        style={{ padding: '0.5rem 0.9rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', width: 'auto', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={16} /> ย้อนกลับ
      </button>

      {/* Main Slide Card Container */}
      <div 
        key={currentStep} // Ensures key re-renders to trigger animation
        className="glass-card" 
        style={{ 
          background: activeSlide.bg,
          borderColor: activeSlide.color,
          padding: '2rem 1.5rem',
          minHeight: '380px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: `0 15px 35px ${activeSlide.color}15`,
          borderWidth: '2.5px',
          animation: 'popIn 0.35s cubic-bezier(0.22,1,0.36,1) both'
        }}
      >
        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={{ marginBottom: '1rem' }}>
            {activeSlide.icon}
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
            {activeSlide.title}
          </h2>
          <p style={{ color: activeSlide.color, fontSize: '0.85rem', fontWeight: 800, marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {activeSlide.subtitle}
          </p>
          
          {/* Divider */}
          <div style={{ borderTop: '2px solid rgba(255, 255, 255, 0.08)', margin: '1.2rem 0' }}></div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0 0.5rem' }}>
          {activeSlide.content}
        </div>

        {/* Progress Dot Indicators */}
        <div style={{ display: 'flex', gap: '0.5rem', margin: '1.5rem 0 0.5rem' }}>
          {slides.map((_, idx) => (
            <div 
              key={idx}
              onClick={() => setCurrentStep(idx)}
              style={{
                width: currentStep === idx ? '24px' : '8px',
                height: '8px',
                borderRadius: '999px',
                background: currentStep === idx ? activeSlide.color : 'rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)'
              }}
            />
          ))}
        </div>

      </div>

      {/* Navigation Buttons Row */}
      <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem' }}>
        
        {/* Back button */}
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="btn btn-secondary"
          style={{ 
            flex: 1, 
            padding: '0.9rem', 
            borderRadius: '16px', 
            border: '2px solid #000', 
            boxShadow: currentStep === 0 ? 'none' : '3px 3px 0 #000',
            opacity: currentStep === 0 ? 0.35 : 1,
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem',
            fontWeight: 800,
            background: '#fff'
          }}
        >
          <ChevronLeft size={18} /> ย้อนกลับ
        </button>

        {/* Next/Finish button */}
        <button
          onClick={handleNext}
          className="btn"
          style={{ 
            flex: 1.5, 
            padding: '0.9rem', 
            borderRadius: '16px', 
            border: '2px solid #000', 
            boxShadow: '3px 3px 0 #000',
            background: currentStep === slides.length - 1 ? 'var(--accent-green)' : activeSlide.color,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem',
            fontWeight: 800
          }}
        >
          {currentStep === slides.length - 1 ? (
            <>เข้าใจกติกาแล้ว! 🍬</>
          ) : (
            <>ถัดไป <ChevronRight size={18} /></>
          )}
        </button>

      </div>

      {/* PopIn Keyframe Animation */}
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

    </div>
  );
}
