import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, BookOpen, AlertTriangle, ChevronDown, ChevronUp, Shield, Map, Wrench, MessageSquare } from 'lucide-react';

export default function CrisisInfo() {
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState(null);

  // ข้อมูล 14 สถานการณ์หลัก
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
    <div className="mt-2" style={{ fontFamily: "'Kanit', sans-serif", paddingBottom: '4rem', maxWidth: '600px', margin: '0 auto' }}>
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')} 
        className="btn-secondary mb-3" 
        style={{ padding: '0.6rem 1rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: 'auto' }}
      >
        <ArrowLeft size={18} /> กลับหน้าแรก
      </button>

      {/* Main Header Card */}
      <div className="glass-card" style={{ padding: '2rem 1.5rem', marginBottom: '1.2rem', borderLeft: '6px solid var(--accent-pink)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <BookOpen size={30} color="var(--accent-pink)" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)' }}>กิจกรรมสถานการณ์วิกฤต</h2>
        </div>
        <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', fontWeight: 600, lineHeight: '1.6' }}>
          ให้น้องๆ ในแต่ละกลุ่มร่วมมือกันคิดแผนเอาชีวิตรอด ออกแบบสิ่งประดิษฐ์ และกำหนดบทบาทหน้าที่ของสมาชิกเพื่อเขียนนำเสนอลงในกระดาษฟลิปชาร์ท
        </p>
      </div>

      {/* Guidelines Card */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.2rem', borderLeft: '6px solid var(--accent-blue)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.8rem' }}>แนวทางหัวข้อที่ต้องเขียนนำเสนอ</h3>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.2rem', color: 'var(--text-sub)', fontWeight: 600, fontSize: '0.95rem' }}>
          <li>การเอาตัวรอดขณะเกิดเหตุ</li>
          <li>การเตรียมตัวและป้องกันภัยล่วงหน้า</li>
          <li>สิ่งประดิษฐ์หรือเทคโนโลยีที่อยากสร้างเพื่อช่วยลดความเสียหาย</li>
          <li>การสวมบทบาทอาชีพของสมาชิกแต่ละคนเพื่อช่วยเหลือสถานการณ์</li>
        </ul>
      </div>

      {/* NEW Example Scenario 15 */}
      <div className="glass-card" style={{ padding: '2rem 1.5rem', marginBottom: '1.5rem', border: '3px solid var(--accent-pink)', boxShadow: '6px 6px 0px var(--text-main)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
          <AlertTriangle size={24} color="var(--accent-pink)" />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main)' }}>กรณีตัวอย่างที่ 15 (แนวทางเขียนละเอียด): วิกฤตเพลิงไหม้อาคารสูง</h3>
        </div>
        
        <div style={{ background: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '14px', padding: '1rem', marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--accent-pink)', marginBottom: '0.4rem' }}>รายละเอียดสถานการณ์วิกฤตสมมติ</h4>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', fontWeight: 600, lineHeight: '1.7' }}>
            เกิดเหตุไฟฟ้าลัดวงจรบริเวณห้องวิจัยสารเคมีชั้น 4 ของตึกเรียน เปลวไฟโหมไหม้ตู้เก็บสารทำละลายส่งผลให้ควันพิษหนาทึบสีดำเขม่าหนืดพวยพุ่งและลอยขึ้นปิดกั้นโถงทางเดินหลักและบันไดหลักทั้งหมดอย่างรวดเร็ว ระบบพัดลมดูดระบายอากาศขัดข้อง สปริงเกอร์ไม่ทำงาน มีกลุ่มผู้ประสบภัยติดค้างอยู่ที่บริเวณชั้น 6 และเริ่มมีอาการสำลักควัน ตื่นตระหนก วิ่งสับสนอย่างไร้ทิศทาง
          </p>
        </div>

        <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '1rem' }}>พิมพ์เขียวตัวอย่างแผนงานแบ่งหน้าที่สมาชิก 16 คน (ทีมละ 4 คน):</h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '2px solid #3b82f6', borderRadius: '16px', padding: '1.2rem' }}>
            <h5 style={{ fontWeight: 900, color: '#2563eb', fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Shield size={18} /> 1. ทีมแพทย์สนามและกู้ชีพฉุกเฉิน (4 คน)
            </h5>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: 600, lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <p style={{ color: 'var(--text-main)' }}>• <b>หน้าที่หลัก:</b> รักษาชีวิต คัดแยกผู้ป่วย และสร้างความปลอดภัยทางกายภาพชั่วคราว</p>
              <p>• <b>ขั้นตอนปฏิบัติงาน:</b></p>
              <p style={{ paddingLeft: '0.8rem' }}>1. ค้นหาและรวบรวมขวดน้ำดื่มและผ้าสะอาดในบริเวณชั้นมาทำความสะอาด ชุบน้ำให้เปียกพอหมาด แจกจ่ายเพื่อใช้เป็นเครื่องกรองควันปิดปากและจมูกฉุกเฉิน</p>
              <p style={{ paddingLeft: '0.8rem' }}>2. จัดตั้งจุดปลอดภัยชั่วคราว (Safe Zone) ในห้องปิดฝั่งตะวันออกที่ควันยังเข้าไม่ถึง ใช้ผ้าชุบน้ำอุดตามซอกใต้ประตูเพื่อบล็อคควันพิษไม่ให้เล็ดลอด</p>
              <p style={{ paddingLeft: '0.8rem' }}>3. เข้าควบคุมและปฐมพยาบาลเบื้องต้นแก่เพื่อนที่เริ่มสำลักควันหรือสำลักเขม่าไฟ คอยปลอบประโลมและใช้ทักษะจิตวิทยาป้องกันการเกิดความตระหนก เพื่อไม่ให้วิ่งหนีชนกันจนเกิดอุบัติเหตุซ้ำซ้อน</p>
            </div>
          </div>

          <div style={{ background: 'rgba(34, 197, 94, 0.05)', border: '2px solid #22c55e', borderRadius: '16px', padding: '1.2rem' }}>
            <h5 style={{ fontWeight: 900, color: '#16a34a', fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Map size={18} /> 2. ทีมสำรวจ เส้นทางหนีไฟ และประเมินภัย (4 คน)
            </h5>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: 600, lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <p style={{ color: 'var(--text-main)' }}>• <b>หน้าที่หลัก:</b> ค้นหาและเคลียร์ทางเดินหนีไฟ ตรวจจับสิ่งกีดขวาง และนำทิศทางลม</p>
              <p>• <b>ขั้นตอนปฏิบัติงาน:</b></p>
              <p style={{ paddingLeft: '0.8rem' }}>1. สำรวจเส้นทางหนีไฟสำรองภายนอกตึก หรือบันไดหนีไฟฝั่งตรงข้ามลมพัด หลีกเลี่ยงโถงบันไดหลักที่มีระดับควันดำหนาแน่นมากที่สุด</p>
              <p style={{ paddingLeft: '0.8rem' }}>2. ใช้หลังมือสัมผัสบานประตูและลูกบิดโลหะทุกบานก่อนเปิดเพื่อตรวจสอบความร้อน หากร้อนจัดแสดงว่าด้านหลังมีไฟโหม ห้ามเปิดโดยเด็ดขาด</p>
              <p style={{ paddingLeft: '0.8rem' }}>3. นำทางสมาชิกทุกคนเคลื่อนย้ายหลบหนีด้วยวิธีการ "ก้มตัวต่ำขนานไปกับพื้น (Crawl)" ให้ระดับใบหน้าสูงไม่เกิน 30 เซนติเมตรจากระดับพื้น เนื่องจากออกซิเจนจะลอยอยู่ต่ำสุด ส่วนควันพิษจะลอยตัวสะสมอยู่ด้านบน</p>
            </div>
          </div>

          <div style={{ background: 'rgba(236, 72, 153, 0.05)', border: '2px solid #ec4899', borderRadius: '16px', padding: '1.2rem' }}>
            <h5 style={{ fontWeight: 900, color: '#db2777', fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Wrench size={18} /> 3. ทีมนวัตกรรมประยุกต์และประดิษฐ์พยุงชีพ (4 คน)
            </h5>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: 600, lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <p style={{ color: 'var(--text-main)' }}>• <b>หน้าที่หลัก:</b> สร้างสัญญาณระบุตำแหน่ง และดัดแปลงสิ่งของเฉพาะหน้าพยุงชีวิต</p>
              <p>• <b>ขั้นตอนปฏิบัติงาน:</b></p>
              <p style={{ paddingLeft: '0.8rem' }}>1. รวบรวมแผ่นกระจกพลาสติกใส แฟลชโทรศัพท์มือถือ หรือวัสดุสะท้อนแสงในห้องเรียนมาดัดแปลงทำเป็นอุปกรณ์ยิงสัญญาณสะท้อนแสงชี้เป้าพิกัดผ่านทางหน้าต่างตึก เพื่อส่งสัญญาณขอความช่วยเหลือฉุกเฉิน (SOS) ให้ทีมนักดับเพลิงภายนอกสังเกตเห็น</p>
              <p style={{ paddingLeft: '0.8rem' }}>2. ประดิษฐ์หน้ากากกรองคาร์บอนฉุกเฉินเฉพาะกิจ โดยรวบรวมเศษผงถ่านกัมมันต์จากห้องวิทยาศาสตร์มาบรรจุห่อชั้นในร่วมกับผ้าขนหนูชุบน้ำหนาๆ เพื่อช่วยกรองเขม่าก๊าซพิษเบื้องต้น ยืดระยะเวลาหายใจรอความช่วยเหลือได้เพิ่มขึ้นอีก 10-15 นาที</p>
            </div>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '2px solid #f59e0b', borderRadius: '16px', padding: '1.2rem' }}>
            <h5 style={{ fontWeight: 900, color: '#d97706', fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MessageSquare size={18} /> 4. ทีมควบคุมระเบียบและการสื่อสาร (4 คน)
            </h5>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: 600, lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <p style={{ color: 'var(--text-main)' }}>• <b>หน้าที่หลัก:</b> ประสานสายด่วนแจ้งข้อมูล ควบคุมแถวในการเคลื่อนย้าย และนับยอดคน</p>
              <p>• <b>ขั้นตอนปฏิบัติงาน:</b></p>
              <p style={{ paddingLeft: '0.8rem' }}>1. โทรศัพท์ประสานสายด่วนกู้ภัย 199 ทันทีเพื่อแจ้งข้อมูลเชิงเทคนิคที่เป็นประโยชน์ เช่น ยอดจำนวนคน พิกัดชั้นที่ติดค้างอยู่ และจุดเริ่มต้นของไฟ เพื่อความกู้ภัยที่รวดเร็ว</p>
              <p style={{ paddingLeft: '0.8rem' }}>2. จัดระเบียบควบคุมกลุ่มให้เดินหลบหนีเรียงเดี่ยวแถวตอนทีละคนตามสายนำทางอย่างสม่ำเสมอ ห้ามแซง ห้ามวิ่ง และคอยตะโกนส่งสัญญาณคำสั่งหนีอย่างเป็นระเบียบ</p>
              <p style={{ paddingLeft: '0.8rem' }}>3. ทำการตรวจนับยอดคน (Roll Call) และเรียกชื่อสมาชิกทุกคนก่อนและหลังเคลื่อนที่ผ่านควันไฟ เพื่อป้องกันไม่ให้มีสมาชิกพลัดหลงหรือถูกทิ้งไว้ข้างหลัง</p>
            </div>
          </div>

        </div>
      </div>

      {/* Accordion List for Scenarios 1 to 14 */}
      <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '1rem' }}>รายชื่อสถานการณ์กิจกรรมทั้งหมด</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {scenarios.map((item, idx) => (
          <div 
            key={item.id} 
            className="glass-card" 
            style={{ 
              padding: '1.2rem', 
              cursor: 'pointer',
              marginBottom: '0.2rem',
              borderColor: expandedIndex === idx ? 'var(--accent-pink)' : 'var(--text-main)',
              background: expandedIndex === idx ? '#fff5f9' : '#ffffff',
              transition: 'all 0.15s ease-in-out'
            }}
            onClick={() => toggleExpand(idx)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: expandedIndex === idx ? 'var(--accent-pink)' : 'var(--text-main)' }}>
                {item.title}
              </span>
              {expandedIndex === idx ? <ChevronUp size={18} color="var(--accent-pink)" /> : <ChevronDown size={18} color="var(--text-sub)" />}
            </div>
            
            {expandedIndex === idx && (
              <div style={{ marginTop: '0.8rem', borderTop: '2.5px solid var(--text-main)', paddingTop: '0.8rem', color: 'var(--text-sub)', fontSize: '0.9rem', fontWeight: 600, lineHeight: '1.6' }}>
                {item.description}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
