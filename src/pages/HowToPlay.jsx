import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Sparkles, Ticket, Ghost, Zap, Trophy, Lock } from 'lucide-react';

export default function HowToPlay() {
  const navigate = useNavigate();

  return (
    <div className="mt-2" style={{ fontFamily: "'Kanit', sans-serif", paddingBottom: '3rem' }}>
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="btn-secondary mb-3" 
        style={{ padding: '0.6rem 1rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: 'auto' }}
      >
        <ArrowLeft size={18} /> ย้อนกลับ
      </button>

      {/* Header Panel */}
      <div className="glass-card text-center mb-4" style={{ 
        background: 'linear-gradient(135deg, rgba(255, 46, 147, 0.15) 0%, rgba(157, 78, 221, 0.15) 100%)',
        borderColor: 'var(--accent-pink)',
        padding: '2.5rem 1rem'
      }}>
        <BookOpen size={48} color="var(--accent-pink)" style={{ margin: '0 auto 0.5rem', filter: 'drop-shadow(0 2px 8px rgba(255, 46, 147, 0.3))' }} />
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 900, 
          color: 'var(--text-main)', 
          letterSpacing: '1px',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          fontFamily: "'Kanit', sans-serif"
        }}>
          📖 วิธีการเล่นและกติกาค่าย
        </h1>
        <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 600 }}>
          ยินดีต้อนรับสู่อาณาจักรสะสมแต้ม Candy Camp! มาทำความเข้าใจกติกาง่ายๆ เพื่อเป็นราชาลูกอมกันเถอะน้องๆ! 🍬✨
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* SECTION 1: STARTING INFO */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Sparkles size={20} /> 1. เริ่มต้นการผจญภัย
          </h3>
          <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-main)', fontWeight: 500 }}>
            น้องๆ ทุกกลุ่ม (กลุ่มที่ 1 - 10) จะได้รับกระเป๋าสะสมแต้มดิจิทัล พร้อมกับ <b style={{ color: 'var(--accent-pink)', fontSize: '1.1rem' }}>ลูกอมเริ่มต้น 50 ลูกอม</b> สำหรับใช้ในการจ่ายเดินทางเข้าทำกิจกรรมตามฐานต่างๆ! เป้าหมายคือช่วยกันทำภารกิจฐานเพื่อเก็บสะสมลูกอมให้ได้มากที่สุดเมื่อจบค่าย! 🏆
          </p>
        </div>

        {/* SECTION 2: STATION TYPES */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-pink)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem' }}>
            <Zap size={20} /> 2. การพิชิตฐานกิจกรรม (มีทั้งหมด 3 ประเภท)
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Type A: Normal Station */}
            <div className="doodle-card-inner" style={{ background: '#fff9fb', border: '1.5px solid #ffccd5', padding: '1.2rem', borderRadius: '14px', margin: 0 }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-pink)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <Zap size={16} /> ประเภทที่ 1: ฐานเกมปกติ (Normal Bases)
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: '1.5', fontWeight: 600 }}>
                1. เมื่อเดินทางไปถึงฐานเกม ให้กดเลือกฐานนั้นในมือถือของน้อง<br />
                2. กดปุ่ม <span style={{ color: 'var(--accent-pink)', fontWeight: 800 }}>"จ่ายลูกอม"</span> (เช่น -2 ลูกอม) แต้มจะหักออกเพื่อเริ่มเกมทันที!<br />
                3. ตั้งใจเล่นภารกิจให้ชนะ! หากกลุ่มน้องชนะ พี่ๆ สตาฟฟ์ประจำฐานจะกดยืนยันผลผ่านมือถือพี่ๆ เพื่อมอบรางวัล <span style={{ color: 'var(--accent-green)', fontWeight: 800 }}>"แต้มบวกกลับคืน"</span> (เช่น +5 ลูกอม) เข้ากระเป๋าให้น้องทันที!
              </p>
            </div>

            {/* Type B: Lottery Station */}
            <div className="doodle-card-inner" style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', padding: '1.2rem', borderRadius: '14px', margin: 0 }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <Ticket size={16} /> ประเภทที่ 2: ฐานเสี่ยงโชคล็อตเตอร์รี่ (ฐาน 9)
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: '1.5', fontWeight: 600 }}>
                1. หากน้องเดินผ่านฐาน 9 สามารถเลือกกดจ่าย <span style={{ color: 'var(--accent-blue)', fontWeight: 800 }}>2 ลูกอม</span> เพื่อสั่งซื้อตั๋วล็อตเตอร์รี่เสี่ยงดวงแบบออโต้!<br />
                2. จ่ายแต้มปุ๊บ แต้มจะหักออกทันที ไม่ต้องเสียเวลาเล่นเกม สามารถเดินทางไปเล่นฐานอื่นๆ ต่อได้เลย!<br />
                3. รอฟังประกาศลุ้นผลรางวัลใหญ่ผู้โชคดี (รับรางวัลคูณ x5 เท่า!) ตามช่วงเวลาที่กำหนดตอนจบค่ายครับ! 🎟️
              </p>
            </div>

            {/* Type C: Ghost Station */}
            <div className="doodle-card-inner" style={{ background: '#f5f3ff', border: '1.5px solid #ddd6fe', padding: '1.2rem', borderRadius: '14px', margin: 0 }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <Ghost size={16} /> ประเภทที่ 3: ฐานพิเศษพี่พีชกู้ชีพ (ฐานผี - ฐาน 4)
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: '1.5', fontWeight: 600 }}>
                1. ในระว่างค่าย หากน้องเจอพี่พีชหรือแวะเข้าฐานผี น้องสามารถเล่นกิจกรรมพิเศษหรือท้าทายเพื่อรับคะแนนฟรี!<br />
                2. ยื่นมือถือให้น้องให้พี่พีชทำการป้อน <span style={{ color: 'var(--accent-purple)', fontWeight: 800 }}>"รหัสลับพี่สตาฟฟ์"</span><br />
                3. พี่พีชจะสามารถเลือกมอบแต้มพิเศษให้น้องๆ ฟรี ได้ตั้งแต่ <span style={{ color: 'var(--accent-purple)', fontWeight: 800 }}>2 ถึง 10 ลูกอม</span> เข้าสู่กลุ่มได้เลยโดยไม่ต้องมีค่าใช้จ่ายใดๆ! 👻
              </p>
            </div>

          </div>
        </div>

        {/* SECTION 3: CHECK POINTS */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Trophy size={20} /> 3. ตรวจสอบคะแนนและตารางอันดับ
          </h3>
          <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-main)', fontWeight: 500, marginBottom: '1rem' }}>
            น้องๆ สามารถกดดูคะแนนคงเหลือของกลุ่มตัวเองได้แบบสดๆ ที่หน้าหลัก (Dashboard) และดูตารางสรุปคะแนนของเพื่อนๆ ทั้ง 10 กลุ่มได้ที่ปุ่ม Leaderboard!
          </p>
          <div className="doodle-card-inner" style={{ background: '#fef3c7', border: '1.5px solid #fde68a', padding: '1rem', borderRadius: '12px', margin: 0, display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <Lock color="#b45309" size={24} style={{ flexShrink: 0 }} />
            <div>
              <h5 style={{ color: '#b45309', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.1rem' }}>⚠️ ช่วงเวลาพิเศษสุดระทึก!</h5>
              <p style={{ fontSize: '0.82rem', color: '#78350f', fontWeight: 600, lineHeight: '1.4' }}>
                เมื่อถึงช่วงท้ายกิจกรรมค่าย ทีมงานแอดมินหลังบ้านอาจเปิดระบบ **"ซ่อนคะแนนตารางรวม"** ซึ่งคะแนนของทุกกลุ่มจะขึ้นเป็น `🔒 ???` เพื่อให้ลุ้นระทึกและเซอร์ไพรส์กับผลรางวัลในพิธีประกาศรางวัลใหญ่จบค่ายครับ! 
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Action Footer */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button 
          onClick={() => navigate(-1)} 
          className="btn" 
          style={{ width: 'auto', padding: '0.8rem 2.5rem', background: 'var(--accent-pink)', border: '2px solid #000', boxShadow: '4px 4px 0 #000' }}
        >
          รับทราบกติกาแล้ว! 🍬
        </button>
      </div>

    </div>
  );
}
