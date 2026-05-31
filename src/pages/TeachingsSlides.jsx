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
      width: '100vw',
      height: '100vh',
      background: '#1e1b18', // Underlay color if any glitch
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      fontFamily: "'Kanit', sans-serif",
      overflow: 'hidden',
      padding: '0'
    }}>
      {/* 
        The primary slide container itself.
        It is stretched to occupy 100% width and height of the viewport,
        incorporating a thick black border and a stunning gold neon inset border effect.
      */}
      <div style={{
        width: '100%',
        height: '100%',
        background: '#fcfbf7', // Canvas color
        color: '#1c1917',
        border: '12px solid #000', // Thick solid black border at the screen edge
        boxShadow: 'inset 0 0 0 10px #d9a014', // Elegant gold inner border inside the card
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '3rem 4rem',
        boxSizing: 'border-box',
        position: 'relative'
      }}>
        
        {/* Top Header Actions (Absolute positioned inside the full card boundary) */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          zIndex: 10
        }}>
          {/* Badge */}
          <div style={{
            background: '#d9a014',
            color: '#000',
            padding: '0.4rem 1rem',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 800,
            border: '2px solid #000',
            boxShadow: '3px 3px 0px #000'
          }}>
            ตกผลึกคำสอนแคมป์
          </div>

          {/* Return Button */}
          <button
            onClick={() => navigate('/master')}
            style={{
              background: '#1e293b',
              color: '#f7f4ef',
              border: '2px solid #000',
              padding: '0.5rem 1.2rem',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '4px 4px 0px #000',
              transition: 'transform 0.1s, box-shadow 0.1s'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translate(2px, 2px)';
              e.currentTarget.style.boxShadow = '2px 2px 0px #000';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translate(0px, 0px)';
              e.currentTarget.style.boxShadow = '4px 4px 0px #000';
            }}
          >
            <Home size={15} /> กลับแผงควบคุม
          </button>
        </div>

        {/* Decorative Quote Icon */}
        <div style={{
          position: 'absolute',
          top: '90px',
          left: '50px',
          color: '#d9a014',
          opacity: 0.8
        }}>
          <Quote size={50} />
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
          padding: '0 3rem'
        }}>
          {(() => {
            const text = teachings[currentIdx];
            // Large premium font scaling optimized for a complete immersive screen width
            let fontSize = '4.6rem';
            if (text.length > 40) {
              fontSize = '2.8rem';
            } else if (text.length > 30) {
              fontSize = '3.3rem';
            } else if (text.length > 20) {
              fontSize = '4.0rem';
            }

            return (
              <p style={{
                fontSize: fontSize,
                fontWeight: 900,
                lineHeight: '1.4',
                color: '#1e293b',
                margin: '0',
                textShadow: '0.5px 0.5px 0px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap',
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                letterSpacing: '-1.5px'
              }}>
                {text}
              </p>
            );
          })()}
        </div>

        {/* Bottom Interactive Area */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          width: '100%'
        }}>
          
          {/* Navigation Controls (Prev/Next buttons in the center) */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            zIndex: 5
          }}>
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              style={{
                background: currentIdx === 0 ? '#e2e8f0' : '#ffffff',
                color: currentIdx === 0 ? '#94a3b8' : '#1c1917',
                border: '3px solid #000',
                padding: '0.8rem 2.2rem',
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '1.05rem',
                cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                boxShadow: currentIdx === 0 ? 'none' : '5px 5px 0px #000',
                transform: currentIdx === 0 ? 'translate(5px, 5px)' : 'none',
                transition: 'transform 0.1s, box-shadow 0.1s'
              }}
              onMouseDown={(e) => {
                if (currentIdx !== 0) {
                  e.currentTarget.style.transform = 'translate(3px, 3px)';
                  e.currentTarget.style.boxShadow = '2px 2px 0px #000';
                }
              }}
              onMouseUp={(e) => {
                if (currentIdx !== 0) {
                  e.currentTarget.style.transform = 'translate(0px, 0px)';
                  e.currentTarget.style.boxShadow = '5px 5px 0px #000';
                }
              }}
            >
              <ArrowLeft size={20} /> ก่อนหน้า
            </button>

            <button
              onClick={handleNext}
              disabled={currentIdx === teachings.length - 1}
              style={{
                background: currentIdx === teachings.length - 1 ? '#e2e8f0' : '#d9a014',
                color: currentIdx === teachings.length - 1 ? '#94a3b8' : '#000',
                border: '3px solid #000',
                padding: '0.8rem 2.2rem',
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '1.05rem',
                cursor: currentIdx === teachings.length - 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                boxShadow: currentIdx === teachings.length - 1 ? 'none' : '5px 5px 0px #000',
                transform: currentIdx === teachings.length - 1 ? 'translate(5px, 5px)' : 'none',
                transition: 'transform 0.1s, box-shadow 0.1s'
              }}
              onMouseDown={(e) => {
                if (currentIdx !== teachings.length - 1) {
                  e.currentTarget.style.transform = 'translate(3px, 3px)';
                  e.currentTarget.style.boxShadow = '2px 2px 0px #000';
                }
              }}
              onMouseUp={(e) => {
                if (currentIdx !== teachings.length - 1) {
                  e.currentTarget.style.transform = 'translate(0px, 0px)';
                  e.currentTarget.style.boxShadow = '5px 5px 0px #000';
                }
              }}
            >
              ถัดไป <ArrowRight size={20} />
            </button>
          </div>

          {/* Progress Footer indicator */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '2.5px dashed #cbd5e1',
            paddingTop: '1.2rem',
            fontFamily: "'Kanit', sans-serif"
          }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#475569', letterSpacing: '1px' }}>
              CANDY CAMP TEACHING
            </span>
            <span style={{
              background: '#1e293b',
              color: '#fff',
              padding: '0.4rem 1.4rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 800
            }}>
              {currentIdx + 1} / {teachings.length}
            </span>
          </div>
        </div>

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
