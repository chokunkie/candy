import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Home, Quote } from 'lucide-react';

const teachings = [
  "ก่อนจะทุ่มให้คนอื่น เคยทุ่มให้อนาคตตัวเองรึยัง",
  "อย่าเอาเวลาทั้งชีวิต ไปพิสูจน์คุณค่าให้คนที่ไม่เห็นค่า",
  "เงินหายยังหาใหม่ได้ แต่เวลาที่เสียไป เอาคืนไม่ได้",
  "ความใจดี ถ้าใช้ผิดคน มันจะกลายเป็นความโง่",
  "บางอย่างต้องปล่อย ไม่ใช่เพราะไม่รัก แต่เพราะรักตัวเอง",
  "บางคนเข้ามา แค่สอนบทเรียน ไม่ได้อยู่ตลอดไป",
  "อย่าเสียเวลาอธิบายตัวเอง ให้คนที่ตั้งใจไม่เข้าใจ",
  "อย่าลืมว่า คนที่อยู่กับเรานานที่สุด คือตัวเราเอง"
];

export default function TeachingsSlides() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentIdx < teachings.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#1e1b18', // Warm deep dark background
      backgroundImage: 'radial-gradient(circle, #2d2621 10%, #171412 100%)',
      color: '#f7f4ef',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      boxSizing: 'border-box',
      position: 'relative',
      fontFamily: "'Kanit', sans-serif",
      overflow: 'hidden'
    }}>
      {/* Decorative Warm Soft Ambient Lights */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: '#e07a5f',
        filter: 'blur(100px)',
        opacity: 0.1,
        top: '10%',
        left: '10%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        background: '#f2cc8f',
        filter: 'blur(120px)',
        opacity: 0.08,
        bottom: '10%',
        right: '10%',
        pointerEvents: 'none'
      }} />

      {/* Header Info */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        left: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        zIndex: 10
      }}>
        <div style={{
          background: '#d9a014',
          color: '#000',
          padding: '0.3rem 0.8rem',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 800,
          border: '1.5px solid #000',
          boxShadow: '2px 2px 0px #000'
        }}>
          ตกผลึกคำสอนแคมป์
        </div>
      </div>

      {/* Navigation Actions */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        right: '2rem',
        display: 'flex',
        gap: '0.8rem',
        zIndex: 10
      }}>
        <button
          onClick={() => navigate('/master')}
          style={{
            background: '#3d342e',
            color: '#f7f4ef',
            border: '2px solid #000',
            padding: '0.5rem 1rem',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '3px 3px 0px #000',
            transition: 'transform 0.1s, box-shadow 0.1s'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translate(2px, 2px)';
            e.currentTarget.style.boxShadow = '1px 1px 0px #000';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translate(0px, 0px)';
            e.currentTarget.style.boxShadow = '3px 3px 0px #000';
          }}
        >
          <Home size={14} /> กลับแผงควบคุม
        </button>
      </div>

      {/* Slide Container (Polaroid/Framed Canvas Style) */}
      <div style={{
        width: '100%',
        flexGrow: 1,
        minHeight: '65vh',
        background: '#fcfbf7', // Premium high-quality canvas color
        color: '#1c1917',
        borderRadius: '24px',
        border: '3px solid #000',
        boxShadow: '10px 10px 0px #d9a014, 10px 10px 0px 3px #000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '2.5rem 3rem',
        boxSizing: 'border-box',
        position: 'relative',
        transform: 'rotate(-0.2deg)',
        transition: 'all 0.3s ease',
        marginTop: '4.5rem'
      }}>
        {/* Artistic Corner Accents */}
        <div style={{
          position: 'absolute',
          top: '25px',
          left: '25px',
          color: '#d9a014',
          opacity: 0.8
        }}>
          <Quote size={40} />
        </div>

        {/* Teaching Content Slide */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          flexGrow: 1,
          animation: 'fadeIn 0.5s ease-out',
          width: '100%',
          overflow: 'hidden',
          padding: '0 2rem'
        }}>
          {(() => {
            const text = teachings[currentIdx];
            // Fully optimized scale for true fullscreen viewing
            let fontSize = '4.2rem';
            if (text.length > 40) {
              fontSize = '2.5rem';
            } else if (text.length > 30) {
              fontSize = '3.0rem';
            } else if (text.length > 20) {
              fontSize = '3.6rem';
            }

            return (
              <p style={{
                fontSize: fontSize,
                fontWeight: 900,
                lineHeight: '1.4',
                color: '#1e293b',
                margin: '1.5rem 0',
                textShadow: '0.5px 0.5px 0px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap',
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                letterSpacing: '-1px'
              }}>
                {text}
              </p>
            );
          })()}
        </div>

        {/* Progress Footer indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '2px dashed #e2e8f0',
          paddingTop: '1.2rem',
          fontFamily: "'Kanit', sans-serif"
        }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748b', letterSpacing: '1px' }}>
            CANDY CAMP TEACHING
          </span>
          <span style={{
            background: '#1e293b',
            color: '#fff',
            padding: '0.3rem 1.2rem',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontWeight: 800
          }}>
            {currentIdx + 1} / {teachings.length}
          </span>
        </div>
      </div>

      {/* Control Buttons (Next / Prev) */}
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        marginTop: '3rem',
        zIndex: 5
      }}>
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          style={{
            background: currentIdx === 0 ? '#3f3935' : '#fcfbf7',
            color: currentIdx === 0 ? '#78716c' : '#1c1917',
            border: '2.5px solid #000',
            padding: '0.8rem 1.8rem',
            borderRadius: '16px',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: currentIdx === 0 ? 'none' : '4px 4px 0px #000',
            transform: currentIdx === 0 ? 'translate(4px, 4px)' : 'none',
            transition: 'transform 0.1s, box-shadow 0.1s'
          }}
          onMouseDown={(e) => {
            if (currentIdx !== 0) {
              e.currentTarget.style.transform = 'translate(3px, 3px)';
              e.currentTarget.style.boxShadow = '1px 1px 0px #000';
            }
          }}
          onMouseUp={(e) => {
            if (currentIdx !== 0) {
              e.currentTarget.style.transform = 'translate(0px, 0px)';
              e.currentTarget.style.boxShadow = '4px 4px 0px #000';
            }
          }}
        >
          <ArrowLeft size={18} /> ก่อนหน้า
        </button>

        <button
          onClick={handleNext}
          disabled={currentIdx === teachings.length - 1}
          style={{
            background: currentIdx === teachings.length - 1 ? '#3f3935' : '#d9a014',
            color: currentIdx === teachings.length - 1 ? '#78716c' : '#000',
            border: '2.5px solid #000',
            padding: '0.8rem 1.8rem',
            borderRadius: '16px',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: currentIdx === teachings.length - 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: currentIdx === teachings.length - 1 ? 'none' : '4px 4px 0px #000',
            transform: currentIdx === teachings.length - 1 ? 'translate(4px, 4px)' : 'none',
            transition: 'transform 0.1s, box-shadow 0.1s'
          }}
          onMouseDown={(e) => {
            if (currentIdx !== teachings.length - 1) {
              e.currentTarget.style.transform = 'translate(3px, 3px)';
              e.currentTarget.style.boxShadow = '1px 1px 0px #000';
            }
          }}
          onMouseUp={(e) => {
            if (currentIdx !== teachings.length - 1) {
              e.currentTarget.style.transform = 'translate(0px, 0px)';
              e.currentTarget.style.boxShadow = '4px 4px 0px #000';
            }
          }}
        >
          ถัดไป <ArrowRight size={18} />
        </button>
      </div>

      {/* Embedded CSS animation in JS style component helper */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
