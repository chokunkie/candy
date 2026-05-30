import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, HelpCircle, Shield, Map, Wrench, MessageSquare, AlertTriangle, Play } from 'lucide-react';

export default function CrisisSlides() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  // สไลด์นำเสนอสถานการณ์วิกฤต (ไม่มีอิโมจิในเนื้อหาตัวหนังสือเลยตามระบุ)
  const slides = [
    {
      title: "กิจกรรมสถานการณ์วิกฤต",
      subtitle: "รายละเอียดกติกาและการดำเนินกิจกรรม",
      color: "#f59e0b",
      bg: "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.2) 100%)",
      content: (
        <div style={{ paddingLeft: '50px', textAlign: 'left', width: '100%' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.2rem', lineHeight: '1.8' }}>
            รายละเอียด : เป็นกิจกรรมที่ให้น้องๆ ในแต่ละกลุ่มช่วยกันแก้ไขปัญหาสถานการณ์ที่น้องๆ สุ่มได้ โดยนำมาเขียนลงในกระดาษฟลิปชาร์ทเพื่อแก้ไขสถานการณ์เหล่านั้น
          </p>
          <div style={{ background: 'rgba(0,0,0,0.03)', border: '2.5px solid #1e293b', borderRadius: '16px', padding: '1.2rem', boxShadow: '4px 4px 0 #1e293b' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.8rem' }}>แนวทางหัวข้อที่ให้น้องเขียนเพื่อแก้ไขปัญหา</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '1.05rem', fontWeight: 700, color: '#475569' }}>
              <p>1. การเอาตัวรอดขณะเกิดเหตุ</p>
              <p>2. การเตรียมตัวและป้องกัน</p>
              <p>3. สิ่งประดิษฐ์หรือเทคโนโลยีที่อยากสร้างเพื่อช่วยลดความเสียหาย</p>
              <p>4. ถ้าน้องอยู่ในสถานการณ์นั้น น้องๆ จะสวมบทบาทเป็นอาชีพอะไรแล้วจะทำอะไรบ้าง</p>
              <p style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '0.4rem' }}>(น้องๆ สามารถเขียนหัวข้อเพิ่มเติมมากกว่านี้ได้)</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "สถานการณ์ที่ 1",
      subtitle: "วิกฤตไฟป่าลุกลามเข้าใกล้ชุมชนและโรงเรียน",
      color: "#ef4444",
      bg: "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(15, 23, 42, 0.2) 100%)",
      content: (
        <div style={{ paddingLeft: '50px', textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ borderLeft: '5px solid #ef4444', paddingLeft: '1.2rem' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ef4444', marginBottom: '0.5rem' }}>หัวข้อสำหรับสุ่ม</h4>
            <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>วิกฤตไฟป่าลุกลามเข้าใกล้ชุมชนและโรงเรียน</p>
          </div>
          <div style={{ background: 'rgba(239, 68, 68, 0.03)', border: '2.5px solid #1e293b', borderRadius: '16px', padding: '1.5rem', boxShadow: '4px 4px 0 #1e293b' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' }}>สถานการณ์สมมติ</h4>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#475569', lineHeight: '1.8' }}>
              ลมเปลี่ยนทิศพัดไฟป่าเข้าใกล้หมู่บ้านอย่างรวดเร็ว มีควันพิษพุ่งสูงจนมองไม่เห็นทาง และทัศนวิสัยเป็นศูนย์
            </p>
          </div>
        </div>
      )
    },
    {
      title: "สถานการณ์ที่ 2",
      subtitle: "ปัญหาภัยแล้งขั้นวิกฤตจนแหล่งน้ำชุมชนแห้งขอด",
      color: "#f59e0b",
      bg: "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.2) 100%)",
      content: (
        <div style={{ paddingLeft: '50px', textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ borderLeft: '5px solid #f59e0b', paddingLeft: '1.2rem' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f59e0b', marginBottom: '0.5rem' }}>หัวข้อสำหรับสุ่ม</h4>
            <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>ปัญหาภัยแล้งขั้นวิกฤตจนแหล่งน้ำชุมชนแห้งขอด</p>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.03)', border: '2.5px solid #1e293b', borderRadius: '16px', padding: '1.5rem', boxShadow: '4px 4px 0 #1e293b' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' }}>สถานการณ์สมมติ</h4>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#475569', lineHeight: '1.8' }}>
              ฝนไม่ตกมา 6 เดือน น้ำประปาไม่ไหล เกิดการแย่งชิงน้ำดิบเพื่อการเกษตรและการบริโภค เกิดความขัดแย้งรุนแรงในชุมชน
            </p>
          </div>
        </div>
      )
    },
    {
      title: "สถานการณ์ที่ 3",
      subtitle: "เหตุการณ์ลิฟต์ค้างและระบบไฟดับในตึก",
      color: "#3b82f6",
      bg: "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(15, 23, 42, 0.2) 100%)",
      content: (
        <div style={{ paddingLeft: '50px', textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ borderLeft: '5px solid #3b82f6', paddingLeft: '1.2rem' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#3b82f6', marginBottom: '0.5rem' }}>หัวข้อสำหรับสุ่ม</h4>
            <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>เหตุการณ์ลิฟต์ค้างและระบบไฟดับในตึก</p>
          </div>
          <div style={{ background: 'rgba(59, 130, 246, 0.03)', border: '2.5px solid #1e293b', borderRadius: '16px', padding: '1.5rem', boxShadow: '4px 4px 0 #1e293b' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' }}>สถานการณ์สมมติ</h4>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#475569', lineHeight: '1.8' }}>
              ระบบไฟสำรองไม่ทำงาน มีคนติดอยู่ในลิฟต์หลายตัวพร้อมกัน อากาศเริ่มหมด และมีคนเป็นโรคกลัวที่แคบเริ่มหมดสติ
            </p>
          </div>
        </div>
      )
    },
    {
      title: "สถานการณ์ที่ 4",
      subtitle: "คนเบียดกันหน้าเวทีคอนเสิร์ตจนขาดอากาศ",
      color: "#ec4899",
      bg: "linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(15, 23, 42, 0.2) 100%)",
      content: (
        <div style={{ paddingLeft: '50px', textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ borderLeft: '5px solid #ec4899', paddingLeft: '1.2rem' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ec4899', marginBottom: '0.5rem' }}>หัวข้อสำหรับสุ่ม</h4>
            <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>คนเบียดกันหน้าเวทีคอนเสิร์ตจนขาดอากาศ</p>
          </div>
          <div style={{ background: 'rgba(236, 72, 153, 0.03)', border: '2.5px solid #1e293b', borderRadius: '16px', padding: '1.5rem', boxShadow: '4px 4px 0 #1e293b' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' }}>สถานการณ์สมมติ</h4>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#475569', lineHeight: '1.8' }}>
              ในงานคอนเสิร์ตเฟสติวัลวัยรุ่น คนดูด้านหลังดันเข้ามาข้างหน้าเพื่อดูศิลปินโปรด ทำให้คนแถวหน้าติดรั้วกั้น โดนอัดแน่นจนเริ่มหายใจไม่ออกและสลบไปหลายคน
            </p>
          </div>
        </div>
      )
    },
    {
      title: "สถานการณ์ที่ 5",
      subtitle: "สุนัขจรจัดดุร้ายหลุดไล่กัดคนในตลาดนัด",
      color: "#ef4444",
      bg: "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(15, 23, 42, 0.2) 100%)",
      content: (
        <div style={{ paddingLeft: '50px', textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ borderLeft: '5px solid #ef4444', paddingLeft: '1.2rem' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ef4444', marginBottom: '0.5rem' }}>หัวข้อสำหรับสุ่ม</h4>
            <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>สุนัขจรจัดดุร้ายหลุดไล่กัดคนในตลาดนัด</p>
          </div>
          <div style={{ background: 'rgba(239, 68, 68, 0.03)', border: '2.5px solid #1e293b', borderRadius: '16px', padding: '1.5rem', boxShadow: '4px 4px 0 #1e293b' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' }}>สถานการณ์สมมติ</h4>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#475569', lineHeight: '1.8' }}>
              สุนัขขนาดใหญ่ที่มีอาการคล้ายโรคพิษสุนัขบ้า หลุดเข้ามาไล่กัดคนในตลาดนัดตอนเย็นที่คนกำลังพลุกพล่าน ผู้คนวิ่งหนีแตกกระเจิง ทำข้าวของพังเสียหาย
            </p>
          </div>
        </div>
      )
    },
    {
      title: "สถานการณ์ที่ 6",
      subtitle: "วิกฤตน้ำป่าไหลหลากล้อมรอบหมู่บ้านกลางหุบเขา",
      color: "#3b82f6",
      bg: "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(15, 23, 42, 0.2) 100%)",
      content: (
        <div style={{ paddingLeft: '50px', textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ borderLeft: '5px solid #3b82f6', paddingLeft: '1.2rem' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#3b82f6', marginBottom: '0.5rem' }}>หัวข้อสำหรับสุ่ม</h4>
            <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>วิกฤตน้ำป่าไหลหลากล้อมรอบหมู่บ้านกลางหุบเขา</p>
          </div>
          <div style={{ background: 'rgba(59, 130, 246, 0.03)', border: '2.5px solid #1e293b', borderRadius: '16px', padding: '1.5rem', boxShadow: '4px 4px 0 #1e293b' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' }}>สถานการณ์สมมติ</h4>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#475569', lineHeight: '1.8' }}>
              ดินโคลนถล่มปิดทางเข้า-ออกหมู่บ้าน กระแสน้ำพัดสะพานขาด มีผู้ป่วยติดเตียงและเด็กเล็กต้องการการอพยพด่วน
            </p>
          </div>
        </div>
      )
    },
    {
      title: "สถานการณ์ที่ 7",
      subtitle: "รถทัศนศึกษาเบรกแตกกลางป่า",
      color: "#f59e0b",
      bg: "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.2) 100%)",
      content: (
        <div style={{ paddingLeft: '50px', textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ borderLeft: '5px solid #f59e0b', paddingLeft: '1.2rem' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f59e0b', marginBottom: '0.4rem' }}>หัวข้อสำหรับสุ่ม</h4>
            <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>รถทัศนศึกษาเบรกแตกกลางป่า</p>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.03)', border: '2.5px solid #1e293b', borderRadius: '16px', padding: '1.2rem', boxShadow: '4px 4px 0 #1e293b' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.4rem' }}>สถานการณ์สมมติ</h4>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#475569', lineHeight: '1.7' }}>
              รถบัสทัศนศึกษาของโรงเรียนเสียหลักเบรกแตก พลิกคว่ำข้างทางบนถนนสายเปลี่ยวกลางหุบเขา ไม่มีสัญญาณมือถือ มีนักเรียนบาดเจ็บหลายคนแต่ไม่มีผู้เสียชีวิต และน้ำมันรถกำลังรั่วไหลออกมาใกล้กับห้องเครื่องที่ร้อนจัด ขณะนั้นเป็นเวลาใกล้ค่ำและฝนกำลังเริ่มตกหนัก
            </p>
          </div>
        </div>
      )
    },
    {
      title: "สถานการณ์ที่ 8",
      subtitle: "แผ่นดินไหวขนาดใหญ่ขณะเดินห้าง",
      color: "#8b5cf6",
      bg: "linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(15, 23, 42, 0.2) 100%)",
      content: (
        <div style={{ paddingLeft: '50px', textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ borderLeft: '5px solid #8b5cf6', paddingLeft: '1.2rem' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#8b5cf6', marginBottom: '0.4rem' }}>หัวข้อสำหรับสุ่ม</h4>
            <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>แผ่นดินไหวขนาดใหญ่ขณะเดินห้าง</p>
          </div>
          <div style={{ background: 'rgba(139, 92, 246, 0.03)', border: '2.5px solid #1e293b', borderRadius: '16px', padding: '1.2rem', boxShadow: '4px 4px 0 #1e293b' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.4rem' }}>สถานการณ์สมมติ</h4>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#475569', lineHeight: '1.7' }}>
              เกิดแรงสั่นสะเทือนรุนแรง โครงสร้างห้างร้าว กระจกแตกพังทลายลงมา มีผู้บาดเจ็บจากเศษกระจกอิฐหิน สัญญาณมือถือล่ม และระบบประปาฉีกขาดจนน้ำเริ่มท่วมชั้นใต้ดิน
            </p>
          </div>
        </div>
      )
    },
    {
      title: "สถานการณ์ที่ 9",
      subtitle: "อัฒจันทร์คอนเสิร์ตพังทลาย",
      color: "#ec4899",
      bg: "linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(15, 23, 42, 0.2) 100%)",
      content: (
        <div style={{ paddingLeft: '50px', textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ borderLeft: '5px solid #ec4899', paddingLeft: '1.2rem' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ec4899', marginBottom: '0.4rem' }}>หัวข้อสำหรับสุ่ม</h4>
            <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>อัฒจันทร์คอนเสิร์ตพังทลาย</p>
          </div>
          <div style={{ background: 'rgba(236, 72, 153, 0.03)', border: '2.5px solid #1e293b', borderRadius: '16px', padding: '1.2rem', boxShadow: '4px 4px 0 #1e293b' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.4rem' }}>สถานการณ์สมมติ</h4>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#475569', lineHeight: '1.7' }}>
              ระหว่างงานคอนเสิร์ตเคป็อปสุดยิ่งใหญ่ในฮอลล์ปิด อัฒจันทร์ชั้นลอยรองรับน้ำหนักแฟนคลับไม่ไหวพังถล่มลงมาทับผู้คนด้านล่าง เกิดความโกลาหล แฟนคลับนับพันรุมแย่งกันวิ่งหนีออกทางประตูทางออกเบียดกันจนบาดเจ็บ และไฟในฮอลล์ดับลง
            </p>
          </div>
        </div>
      )
    },
    {
      title: "สถานการณ์ที่ 10",
      subtitle: "เครื่องเล่นบ้านลม/สไลเดอร์ยักษ์ยุบตัวพังลงมา",
      color: "#f59e0b",
      bg: "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.2) 100%)",
      content: (
        <div style={{ paddingLeft: '50px', textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ borderLeft: '5px solid #f59e0b', paddingLeft: '1.2rem' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f59e0b', marginBottom: '0.5rem' }}>หัวข้อสำหรับสุ่ม</h4>
            <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>เครื่องเล่นบ้านลม/สไลเดอร์ยักษ์ยุบตัวพังลงมา</p>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.03)', border: '2.5px solid #1e293b', borderRadius: '16px', padding: '1.5rem', boxShadow: '4px 4px 0 #1e293b' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' }}>สถานการณ์สมมติ</h4>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#475569', lineHeight: '1.8' }}>
              ในงานกาชาดหรือตลาดนัดแถวบ้าน เครื่องเล่นลมขนาดใหญ่เกิดรอยรั่วและยุบตัวลงอย่างรวดเร็วทับเด็กๆ และวัยรุ่นที่อยู่ภายใน มีคนติดอยู่ใต้ผืนผ้าใบหนา ขาดอากาศหายใจ
            </p>
          </div>
        </div>
      )
    },
    {
      title: "สถานการณ์ที่ 11",
      subtitle: "กระแสไฟฟ้าสลับวงจรช็อตคนในสระว่ายน้ำ",
      color: "#3b82f6",
      bg: "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(15, 23, 42, 0.2) 100%)",
      content: (
        <div style={{ paddingLeft: '50px', textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ borderLeft: '5px solid #3b82f6', paddingLeft: '1.2rem' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#3b82f6', marginBottom: '0.5rem' }}>หัวข้อสำหรับสุ่ม</h4>
            <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>กระแสไฟฟ้าสลับวงจรช็อตคนในสระว่ายน้ำ</p>
          </div>
          <div style={{ background: 'rgba(59, 130, 246, 0.03)', border: '2.5px solid #1e293b', borderRadius: '16px', padding: '1.5rem', boxShadow: '4px 4px 0 #1e293b' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' }}>สถานการณ์สมมติ</h4>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#475569', lineHeight: '1.8' }}>
              เกิดไฟรั่วจากไฟส่องสว่างใต้น้ำของสระว่ายน้ำสาธารณะ คนที่กำลังเล่นน้ำอยู่เกิดอาการไฟช็อต ขยับตัวไม่ได้ และกำลังจะจมน้ำ เพื่อนที่อยู่บนฝั่งต้องหาวิธีช่วยโดยไม่ให้โดนไฟช็อตไปด้วย
            </p>
          </div>
        </div>
      )
    },
    {
      title: "สถานการณ์ที่ 12",
      subtitle: "ภัยพิบัติคลื่นยักษ์สึนามิถล่มชายฝั่ง",
      color: "#3b82f6",
      bg: "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(15, 23, 42, 0.2) 100%)",
      content: (
        <div style={{ paddingLeft: '50px', textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ borderLeft: '5px solid #3b82f6', paddingLeft: '1.2rem' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#3b82f6', marginBottom: '0.5rem' }}>หัวข้อสำหรับสุ่ม</h4>
            <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>ภัยพิบัติคลื่นยักษ์สึนามิถล่มชายฝั่ง</p>
          </div>
          <div style={{ background: 'rgba(59, 130, 246, 0.03)', border: '2.5px solid #1e293b', borderRadius: '16px', padding: '1.5rem', boxShadow: '4px 4px 0 #1e293b' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' }}>สถานการณ์สมมติ</h4>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#475569', lineHeight: '1.8' }}>
              คลื่นซัดเข้าหาดอย่างรวดเร็ว ไฟฟ้าดับ นักท่องเที่ยวตื่นตระหนกวิ่งหนีหาทางขึ้นเขาแบบไร้ทิศทาง มีคนเจ็บและติดค้างจำนวนมาก
            </p>
          </div>
        </div>
      )
    },
    {
      title: "สถานการณ์ที่ 13",
      subtitle: "หม้อแปลงโรงเรียนระเบิดลามไหม้ทุ่งหญ้าจากอากาศร้อนจัด",
      color: "#ef4444",
      bg: "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(15, 23, 42, 0.2) 100%)",
      content: (
        <div style={{ paddingLeft: '50px', textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ borderLeft: '5px solid #ef4444', paddingLeft: '1.2rem' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ef4444', marginBottom: '0.4rem' }}>หัวข้อสำหรับสุ่ม</h4>
            <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>หม้อแปลงโรงเรียนระเบิดลามไหม้ทุ่งหญ้าจากอากาศร้อนจัด</p>
          </div>
          <div style={{ background: 'rgba(239, 68, 68, 0.03)', border: '2.5px solid #1e293b', borderRadius: '16px', padding: '1.2rem', boxShadow: '4px 4px 0 #1e293b' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.4rem' }}>สถานการณ์สมมติ</h4>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#475569', lineHeight: '1.7' }}>
              หม้อแปลงไฟฟ้าหลักของโรงเรียนรับโหลดไม่ไหวระเบิดเสียงดังสนิท สะเก็ดไฟตกใส่ทุ่งหญ้าแห้งแล้งหลังตึกเรียน ไฟลุกลามอย่างรวดเร็วพุ่งเข้าหาอาคารเรียน และมีควันพิษหนาทึบพัดเข้าห้องเรียนขณะกำลังศึกษา
            </p>
          </div>
        </div>
      )
    },
    {
      title: "สถานการณ์ที่ 14",
      subtitle: "บอลลูนยักษ์ในงานเทศกาลตกใส่เสาไฟแรงสูงหน้าห้าง",
      color: "#8b5cf6",
      bg: "linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(15, 23, 42, 0.2) 100%)",
      content: (
        <div style={{ paddingLeft: '50px', textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ borderLeft: '5px solid #8b5cf6', paddingLeft: '1.2rem' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#8b5cf6', marginBottom: '0.4rem' }}>หัวข้อสำหรับสุ่ม</h4>
            <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>บอลลูนยักษ์ในงานเทศกาลตกใส่เสาไฟแรงสูงหน้าห้าง</p>
          </div>
          <div style={{ background: 'rgba(139, 92, 246, 0.03)', border: '2.5px solid #1e293b', borderRadius: '16px', padding: '1.2rem', boxShadow: '4px 4px 0 #1e293b' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.4rem' }}>สถานการณ์สมมติ</h4>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#475569', lineHeight: '1.7' }}>
              บอลลูนลมร้อนเสียการควบคุม ลอยมาเกี่ยวเสาไฟจนเกิดไฟช็อตระเบิดสนิท บอลลูนขาดตกลงมาทับรถยนต์บนถนน เกิดไฟลุกไหม้ถังแก๊สของบอลลูน เสี่ยงระเบิดซ้ำใกล้ผู้คน
            </p>
          </div>
        </div>
      )
    },
  {
      title: "สถานการณ์ที่ 15 (ตัวอย่างสาธิต)",
      subtitle: "วิกฤตเพลิงไหม้อาคารสูงและระบบระบายควันขัดข้อง",
      color: "#ff2e93",
      bg: "linear-gradient(135deg, rgba(255, 46, 147, 0.08) 0%, rgba(15, 23, 42, 0.2) 100%)",
      content: (
        <div style={{ paddingLeft: '50px', textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ borderLeft: '5px solid #ff2e93', paddingLeft: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#ff2e93', marginBottom: '0.2rem' }}>กรณีศึกษา: การแบ่งบทบาทหน้าที่ของสมาชิกกลุ่ม 16 คน เพื่อเอาชีวิตรอดร่วมกันอย่างเป็นระบบ</h4>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', lineHeight: '1.5' }}>
              เหตุการณ์: ไฟไหม้รุนแรงที่ห้องวิเคราะห์เคมีชั้น 4 ควันดำพิษจากพลาสติกและสารเคมีลอยสะสมอัดแน่นในโถงทางเดินหลักเนื่องจากพัดลมระบายอากาศขัดข้อง มีนักเรียนชั้น 5-8 ติดค้างอยู่ด้านบนจำนวนมากท่ามกลางความตื่นตระหนก
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.2rem' }}>
            <div style={{ background: '#eff6ff', border: '1.5px solid #3b82f6', borderRadius: '12px', padding: '0.6rem' }}>
              <h5 style={{ fontWeight: 900, color: '#1e40af', fontSize: '0.85rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Shield size={13} /> 1. ทีมกู้ชีพและการแพทย์ฉุกเฉิน (4 คน)</h5>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', lineHeight: '1.4' }}>จัดตั้งจุดคัดกรองปฐมพยาบาลเบื้องต้น รวบรวมผ้าสะอาดชุบน้ำทำหน้ากากกรองควัน คอยประคองผู้บาดเจ็บ และทำหน้าที่ควบคุมสติ (Anti-Panic) ป้องกันการเหยียบกัน</p>
            </div>
            <div style={{ background: '#f0fdf4', border: '1.5px solid #22c55e', borderRadius: '12px', padding: '0.6rem' }}>
              <h5 style={{ fontWeight: 900, color: '#166534', fontSize: '0.85rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Map size={13} /> 2. ทีมสำรวจและประเมินเส้นทางหนี (4 คน)</h5>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', lineHeight: '1.4' }}>ตรวจสอบความปลอดภัยประตูก่อนเปิด (สัมผัสหลังมือ) ค้นหาบันไดหนีไฟฝั่งตะวันออกที่เป็นเขตปลอดควัน และนำทางกลุ่มโดยจัดระเบียบให้หมอบคลานต่ำหลบก๊าซพิษ</p>
            </div>
            <div style={{ background: '#fdf2f8', border: '1.5px solid #ec4899', borderRadius: '12px', padding: '0.6rem' }}>
              <h5 style={{ fontWeight: 900, color: '#9d174d', fontSize: '0.85rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Wrench size={13} /> 3. ทีมนวัตกรรมสร้างสิ่งประดิษฐ์ (4 คน)</h5>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', lineHeight: '1.4' }}>ประดิษฐ์หน้ากากกรองคาร์บอนชั่วคราวจากผงถ่านและผ้า รวบรวมอุปกรณ์มาทำสัญญาณไฟแฟลชหรือใช้กระจกสะท้อนหน้าต่างเพื่อแจ้งพิกัดแก่กู้ภัยด้านนอกอาคาร</p>
            </div>
            <div style={{ background: '#fffbeb', border: '1.5px solid #f59e0b', borderRadius: '12px', padding: '0.6rem' }}>
              <h5 style={{ fontWeight: 900, color: '#9a3412', fontSize: '0.85rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MessageSquare size={13} /> 4. ทีมควบคุมระเบียบและการสื่อสาร (4 คน)</h5>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', lineHeight: '1.4' }}>โทรประสานสายด่วนกู้ภัย 199 เพื่อแจ้งพิกัดและจำนวนยอดคน จัดระเบียบแถวเรียงเดี่ยวห้ามแซงกัน และทำการนับยอดคน (Roll Call) ทุกครั้งที่ผ่านอุปสรรค</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "สแกนเพื่ออ่านคู่มือและรายละเอียด",
      subtitle: "สแกน QR Code เพื่อดูลายละเอียดหัวข้อและตัวอย่าง",
      color: "#10b981",
      bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.2) 100%)",
      content: (
        <div style={{ paddingLeft: '50px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center', width: '100%' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>
            หยิบโทรศัพท์มือถือขึ้นมาสแกน QR Code นี้เพื่อเข้าดูรายชื่อหัวข้อคำอธิบาย และตัวอย่างแผนงานได้ทันที!
          </p>
          
          <div style={{ 
            background: '#ffffff', 
            padding: '1rem', 
            borderRadius: '20px', 
            border: '3px solid #1e293b',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '190px',
            height: '190px'
          }}>
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://candy-fawn-chi.vercel.app/crisis-info" 
              alt="Scan for Crisis Info" 
              style={{ width: '150px', height: '150px' }}
            />
          </div>
          
          <p style={{ fontSize: '1rem', color: '#475569', fontWeight: 700 }}>
            ลิงก์ข้อมูลกิจกรรม: candy-fawn-chi.vercel.app/crisis-info
          </p>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < slides.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/master');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const activeSlide = slides[currentStep];

  return (
    <div className="mt-2" style={{ fontFamily: "'Kanit', sans-serif", paddingBottom: '3rem', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Top Back Arrow */}
      <button 
        onClick={() => navigate('/master')} 
        className="btn-secondary mb-3" 
        style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: 'auto', fontSize: '0.95rem' }}
      >
        <ArrowLeft size={18} /> ย้อนกลับแอดมิน
      </button>

      {/* Main Slide Card Container - GRID PAPER STYLE */}
      <div 
        key={currentStep}
        style={{ 
          background: activeSlide.bg,
          borderColor: activeSlide.color,
          boxShadow: `0 20px 45px ${activeSlide.color}15`,
          borderWidth: '3px',
          borderRadius: '24px',
          borderStyle: 'solid',
          padding: '1.5rem',
          animation: 'popIn 0.35s cubic-bezier(0.22,1,0.36,1) both',
          position: 'relative'
        }}
      >
        <div style={{
          backgroundColor: '#fdfcf7',
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.04) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          border: '3px solid #1e293b',
          boxShadow: '6px 6px 0px #1e293b',
          borderRadius: '20px',
          padding: '2.5rem 1.5rem',
          minHeight: '520px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Binder Holes (Left margin) */}
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '0',
            bottom: '0',
            width: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '1.5rem 0',
            zIndex: 2
          }}>
            {[...Array(11)].map((_, i) => (
              <div key={i} style={{
                width: '12px',
                height: '12px',
                background: '#0f172a',
                borderRadius: '50%',
                border: '2px solid #94a3b8',
                boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.6)'
              }} />
            ))}
          </div>

          {/* Red line margin */}
          <div style={{
            position: 'absolute',
            left: '42px',
            top: '0',
            bottom: '0',
            width: '2px',
            background: 'rgba(239, 68, 68, 0.25)',
            zIndex: 1
          }} />

          {/* Header Title */}
          <div style={{ textAlign: 'center', width: '100%', paddingLeft: '40px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b', textShadow: '1px 1px 0px #fff', fontFamily: "'Kanit', sans-serif", letterSpacing: '0.5px' }}>
              {activeSlide.title}
            </h2>
            <p style={{ color: activeSlide.color, fontSize: '1.05rem', fontWeight: 900, marginTop: '0.3rem', letterSpacing: '0.5px' }}>
              {activeSlide.subtitle}
            </p>
            
            {/* Divider */}
            <div style={{ borderTop: '2px solid rgba(30, 41, 59, 0.08)', margin: '1.2rem 0' }}></div>
          </div>

          {/* Content Area */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            {activeSlide.content}
          </div>

          {/* Progress Dot Indicators */}
          <div style={{ display: 'flex', gap: '0.5rem', margin: '1.5rem 0 0.5rem', paddingLeft: '40px' }}>
            {slides.map((_, idx) => (
              <div 
                key={idx}
                onClick={() => setCurrentStep(idx)}
                style={{
                  width: currentStep === idx ? '26px' : '9px',
                  height: '9px',
                  borderRadius: '999px',
                  background: currentStep === idx ? activeSlide.color : 'rgba(30, 41, 59, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)'
                }}
              />
            ))}
          </div>

        </div>

      </div>

      {/* Navigation Buttons Row */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        
        {/* Back button */}
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="btn btn-secondary"
          style={{ 
            flex: 1, 
            padding: '1.1rem', 
            borderRadius: '18px', 
            border: '2px solid #000', 
            boxShadow: currentStep === 0 ? 'none' : '4px 4px 0 #000',
            opacity: currentStep === 0 ? 0.35 : 1,
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            fontWeight: 800,
            background: '#fff',
            fontSize: '1rem'
          }}
        >
          <ChevronLeft size={20} /> ย้อนกลับ
        </button>

        {/* Next/Finish button */}
        <button
          onClick={handleNext}
          className="btn"
          style={{ 
            flex: 1.5, 
            padding: '1.1rem', 
            borderRadius: '18px', 
            border: '2px solid #000', 
            boxShadow: '4px 4px 0 #000',
            background: currentStep === slides.length - 1 ? 'var(--accent-green)' : activeSlide.color,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            fontWeight: 800,
            fontSize: '1rem'
          }}
        >
          {currentStep === slides.length - 1 ? (
            <>เสร็จสิ้นการนำเสนอ</>
          ) : (
            <>หน้าถัดไป <ChevronRight size={20} /></>
          )}
        </button>

      </div>

      {/* PopIn Keyframe Animation */}
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.97) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

    </div>
  );
}
