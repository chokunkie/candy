import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, BookOpen, AlertTriangle, ChevronDown, ChevronUp, Shield, Map, Wrench, MessageSquare } from 'lucide-react';

export default function CrisisInfo() {
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState(null);

  // ข้อมูล 15 สถานการณ์
  const scenarios = [
    {
      id: 1,
      title: "1. วิกฤตไฟป่าลุกลามเข้าใกล้ชุมชนและโรงเรียน",
      description: "ลมเปลี่ยนทิศพัดไฟป่าเข้าใกล้หมู่บ้านอย่างรวดเร็ว มีควันพิษพุ่งสูงจนมองไม่เห็นทาง และทัศนวิสัยเป็นศูนย์"
    },
    {
      id: 2,
      title: "2. ปัญหาภัยแล้งขั้นวิกฤตจนแหล่งน้ำชุมชนแห้งขอด",
      description: "ฝนไม่ตกมา 6 เดือน น้ำประปาไม่ไหล เกิดการแย่งชิงน้ำดิบเพื่อการเกษตรและการบริโภค เกิดความขัดแย้งรุนแรงในชุมชน"
    },
    {
      id: 3,
      title: "3. เหตุการณ์ลิฟต์ค้างและระบบไฟดับในตึก",
      description: "ระบบไฟสำรองไม่ทำงาน มีคนติดอยู่ในลิฟต์หลายตัวพร้อมกัน อากาศเริ่มหมด และมีคนเป็นโรคกลัวที่แคบเริ่มหมดสติ"
    },
    {
      id: 4,
      title: "4. คนเบียดกันหน้าเวทีคอนเสิร์ตจนขาดอากาศ",
      description: "ในงานคอนเสิร์ตเฟสติวัลวัยรุ่น คนดูด้านหลังดันเข้ามาข้างหน้าเพื่อดูศิลปินโปรด ทำให้คนแถวหน้าติดรั้วกั้น โดนอัดแน่นจนเริ่มหายใจไม่ออกและสลบไปหลายคน"
    },
    {
      id: 5,
      title: "5. สุนัขจรจัดดุร้ายหลุดไล่กัดคนในตลาดนัด",
      description: "สุนัขขนาดใหญ่ที่มีอาการคล้ายโรคพิษสุนัขบ้า หลุดเข้ามาไล่กัดคนในตลาดนัดตอนเย็นที่คนกำลังพลุกพล่าน ผู้คนวิ่งหนีแตกกระเจิง ทำข้าวของพังเสียหาย"
    },
    {
      id: 6,
      title: "6. วิกฤตน้ำป่าไหลหลากล้อมรอบหมู่บ้านกลางหุบเขา",
      description: "ดินโคลนถล่มปิดทางเข้า-ออกหมู่บ้าน กระแสน้ำพัดสะพานขาด มีผู้ป่วยติดเตียงและเด็กเล็กต้องการการอพยพด่วน"
    },
    {
      id: 7,
      title: "7. รถทัศนศึกษาเบรกแตกกลางป่า",
      description: "รถบัสทัศนศึกษาของโรงเรียนเสียหลักเบรกแตก พลิกคว่ำข้างทางบนถนนสายเปลี่ยวกลางหุบเขา ไม่มีสัญญาณมือถือ มีนักเรียนบาดเจ็บหลายคนแต่ไม่มีผู้เสียชีวิต และน้ำมันรถกำลังรั่วไหลออกมาใกล้กับห้องเครื่องที่ร้อนจัด ขณะนั้นเป็นเวลาใกล้ค่ำและฝนกำลังเริ่มตกหนัก"
    },
    {
      id: 8,
      title: "8. แผ่นดินไหวขนาดใหญ่ขณะเดินห้าง",
      description: "เกิดแรงสั่นสะเทือนรุนแรง โครงสร้างห้างร้าว กระจกแตกพังทลายลงมา มีผู้บาดเจ็บจากเศษกระจกอิฐหิน สัญญาณมือถือล่ม และระบบประปาฉีกขาดจนน้ำเริ่มท่วมชั้นใต้ดิน"
    },
    {
      id: 9,
      title: "9. อัฒจันทร์คอนเสิร์ตพังทลาย",
      description: "ระหว่างงานคอนเสิร์ตเคป็อปสุดยิ่งใหญ่ในฮอลล์ปิด อัฒจันทร์ชั้นลอยรองรับน้ำหนักแฟนคลับไม่ไหวพังถล่มลงมาทับผู้คนด้านล่าง เกิดความโกลาหล แฟนคลับนับพันรุมแย่งกันวิ่งหนีออกทางประตูทางออกเบียดกันจนบาดเจ็บ และไฟในฮอลล์ดับลง"
    },
    {
      id: 10,
      title: "10. เครื่องเล่นบ้านลม/สไลเดอร์ยักษ์ยุบตัวพังลงมา",
      description: "ในงานกาชาดหรือตลาดนัดแถวบ้าน เครื่องเล่นลมขนาดใหญ่เกิดรอยรั่วและยุบตัวลงอย่างรวดเร็วทับเด็กๆ และวัยรุ่นที่อยู่ภายใน มีคนติดอยู่ใต้ผืนผ้าใบหนา ขาดอากาศหายใจ"
    },
    {
      id: 11,
      title: "11. กระแสไฟฟ้าสลับวงจรช็อตคนในสระว่ายน้ำ",
      description: "เกิดไฟรั่วจากไฟส่องสว่างใต้น้ำของสระว่ายน้ำสาธารณะ คนที่กำลังเล่นน้ำอยู่เกิดอาการไฟช็อต ขยับตัวไม่ได้ และกำลังจะจมน้ำ เพื่อนที่อยู่บนฝั่งต้องหาวิธีช่วยโดยไม่ให้โดนไฟช็อตไปด้วย"
    },
    {
      id: 12,
      title: "12. ภัยพิบัติคลื่นยักษ์สึนามิถล่มชายฝั่ง",
      description: "คลื่นซัดเข้าหาดอย่างรวดเร็ว ไฟฟ้าดับ นักท่องเที่ยวตื่นตระหนกวิ่งหนีหาทางขึ้นเขาแบบไร้ทิศทาง มีคนเจ็บและติดค้างจำนวนมาก"
    },
    {
      id: 13,
      title: "13. หม้อแปลงโรงเรียนระเบิดลามไหม้ทุ่งหญ้าจากอากาศร้อนจัด",
      description: "หม้อแปลงไฟฟ้าหลักของโรงเรียนรับโหลดไม่ไหวระเบิดเสียงดังสนิท สะเก็ดไฟตกใส่ทุ่งหญ้าแห้งแล้งหลังตึกเรียน ไฟลุกลามอย่างรวดเร็วพุ่งเข้าหาอาคารเรียน และมีควันพิษหนาทึบพัดเข้าห้องเรียนขณะกำลังศึกษา"
    },
    {
      id: 14,
      title: "14. บอลลูนยักษ์ในงานเทศกาลตกใส่เสาไฟแรงสูงหน้าห้าง",
      description: "บอลลูนลมร้อนเสียการควบคุม ลอยมาเกี่ยวเสาไฟจนเกิดไฟช็อตระเบิดสนิท บอลลูนขาดตกลงมาทับรถยนต์บนถนน เกิดไฟลุกไหม้ถังแก๊สของบอลลูน เสี่ยงระเบิดซ้ำใกล้ผู้คน"
    }
  ];

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="mt-2" style={{ fontFamily: "'Kanit', sans-serif", paddingBottom: '4rem', maxWidth: '650px', margin: '0 auto' }}>
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')} 
        className="btn-secondary mb-3" 
        style={{ padding: '0.6rem 1rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: 'auto' }}
      >
        <ArrowLeft size={18} /> กลับหน้าแรก
      </button>

      {/* Main Header Card */}
      <div className="glass-card" style={{ padding: '2rem 1.5rem', marginBottom: '1.5rem', borderLeft: '5px solid var(--accent-pink)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <BookOpen size={30} color="var(--accent-pink)" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white' }}>กิจกรรมสถานการณ์วิกฤต</h2>
        </div>
        <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', fontWeight: 600, lineHeight: '1.6' }}>
          ให้น้องๆ ในแต่ละกลุ่มร่วมมือกันคิดแผนเอาชีวิตรอด ออกแบบสิ่งประดิษฐ์ และกำหนดบทบาทหน้าที่ของสมาชิกเพื่อเขียนนำเสนอลงในกระดาษฟลิปชาร์ท
        </p>
      </div>

      {/* Guidelines Accordion */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', marginBottom: '0.8rem' }}>แนวทางหัวข้อที่ต้องเขียนนำเสนอ</h3>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.2rem', color: 'var(--text-sub)', fontWeight: 600, fontSize: '0.95rem' }}>
          <li>การเอาตัวรอดขณะเกิดเหตุ</li>
          <li>การเตรียมตัวและป้องกันภัยล่วงหน้า</li>
          <li>สิ่งประดิษฐ์หรือเทคโนโลยีที่อยากสร้างเพื่อช่วยลดความเสียหาย</li>
          <li>การสวมบทบาทอาชีพของสมาชิกแต่ละคนเพื่อช่วยเหลือสถานการณ์</li>
        </ul>
      </div>

      {/* NEW Example Scenario 15 */}
      <div className="glass-card" style={{ padding: '1.8rem 1.5rem', marginBottom: '1.5rem', border: '2.5px solid var(--accent-pink)', boxShadow: '0 8px 25px rgba(255,46,147,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
          <AlertTriangle size={24} color="var(--accent-pink)" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white' }}>กรณีตัวอย่างที่ 15: วิกฤตเพลิงไหม้อาคารสูง</h3>
        </div>
        <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.2rem', lineHeight: '1.6' }}>
          ตัวอย่างแผนการแบ่งงานของสมาชิก 16 คนในกลุ่ม เพื่อเอาตัวรอดจากไฟไหม้ชั้น 4 และควันพิษอัดแน่นในทางเดินหลัก
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1.5px solid #3b82f6', borderRadius: '12px', padding: '1rem' }}>
            <h4 style={{ fontWeight: 900, color: '#60a5fa', fontSize: '0.95rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Shield size={16} /> 1. ทีมกู้ชีพและการแพทย์ (4 คน)
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: 600, lineHeight: '1.4' }}>
              จัดเตรียมการปฐมพยาบาลเบื้องต้น รวบรวมผ้าชุบน้ำสำหรับปิดจมูก และดูแลประคองเพื่อนที่ตื่นตระหนกอย่างใกล้ชิด
            </p>
          </div>

          <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1.5px solid #22c55e', borderRadius: '12px', padding: '1rem' }}>
            <h4 style={{ fontWeight: 900, color: '#4ade80', fontSize: '0.95rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Map size={16} /> 2. ทีมสำรวจทางหนีและตรวจสอบภัย (4 คน)
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: 600, lineHeight: '1.4' }}>
              ตรวจสอบความร้อนของบานประตูก่อนเปิด เคลียร์ทางเดิน และใช้บันไดหนีไฟฝั่งตะวันออกที่ควันยังพัดเข้าไปไม่ถึง
            </p>
          </div>

          <div style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1.5px solid #ec4899', borderRadius: '12px', padding: '1rem' }}>
            <h4 style={{ fontWeight: 900, color: '#f472b6', fontSize: '0.95rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Wrench size={16} /> 3. ทีมนวัตกรรมสร้างสิ่งประดิษฐ์ (4 คน)
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: 600, lineHeight: '1.4' }}>
              ดัดแปลงแผงชิ้นส่วนประกอบทำสะท้อนแสงสำหรับเป็นเครื่องระบุพิกัดชี้เป้าแก่เจ้าหน้าที่กู้ภัยภายนอก
            </p>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1.5px solid #f59e0b', borderRadius: '12px', padding: '1rem' }}>
            <h4 style={{ fontWeight: 900, color: '#fbbf24', fontSize: '0.95rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <MessageSquare size={16} /> 4. ทีมควบคุมความสงบและการสื่อสาร (4 คน)
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: 600, lineHeight: '1.4' }}>
              จัดระเบียบเดินเรียงเดี่ยวห้ามดันกัน ตะโกนนำทางเป็นจังหวะ และใช้โทรศัพท์ติดต่อส่งอัปเดตข้อมูลพิกัดแก่กู้ภัย
            </p>
          </div>

        </div>
      </div>

      {/* Accordion List for Scenarios 1 to 14 */}
      <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>รายชื่อสถานการณ์กิจกรรมทั้งหมด</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {scenarios.map((item, idx) => (
          <div 
            key={item.id} 
            className="glass-card" 
            style={{ 
              padding: '1rem 1.2rem', 
              cursor: 'pointer',
              borderColor: expandedIndex === idx ? 'var(--accent-pink)' : 'rgba(255,255,255,0.08)',
              transition: 'all 0.2s'
            }}
            onClick={() => toggleExpand(idx)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: expandedIndex === idx ? 'var(--accent-pink)' : 'white' }}>
                {item.title}
              </span>
              {expandedIndex === idx ? <ChevronUp size={18} color="#ff2e93" /> : <ChevronDown size={18} color="#94a3b8" />}
            </div>
            
            {expandedIndex === idx && (
              <div style={{ marginTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.8rem', color: 'var(--text-sub)', fontSize: '0.9rem', fontWeight: 600, lineHeight: '1.6' }}>
                {item.description}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
