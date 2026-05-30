import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Send, CheckCircle, Heart, Edit3 } from 'lucide-react';

export default function Feedback() {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ฟอร์มส่งความรู้สึก
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [gained, setGained] = useState('');
  const [messageToStaff, setMessageToStaff] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const localTeam = localStorage.getItem('candy_team');
    if (!localTeam) {
      navigate('/login');
      return;
    }
    const parsed = JSON.parse(localTeam);
    setTeam(parsed);
    checkAlreadySubmitted(parsed.id);
  }, [navigate]);

  // ตรวจสอบว่าเคยส่งไปแล้วหรือยัง
  const checkAlreadySubmitted = async (teamId) => {
    try {
      const { data } = await supabase
        .from('feedback')
        .select('id')
        .eq('team_id', teamId)
        .limit(1);
      if (data && data.length > 0) {
        setSuccess(true);
      }
    } catch (err) {
      console.error('Error checking submission:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pros.trim() || !cons.trim() || !gained.trim() || !messageToStaff.trim()) {
      setError('กรุณากรอกคำตอบให้ครบถ้วนทุกข้อนะครับ');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const feedbackId = `FB-${team.id}-${Date.now()}`;
      const { error: insertError } = await supabase
        .from('feedback')
        .insert({
          id: feedbackId,
          team_id: team.id,
          pros: pros.trim(),
          cons: cons.trim(),
          gained: gained.trim(),
          message_to_staff: messageToStaff.trim()
        });

      if (insertError) throw insertError;
      setSuccess(true);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการส่งข้อมูล: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!team) return null;

  return (
    <div className="mt-2" style={{ fontFamily: "'Kanit', sans-serif", paddingBottom: '3rem', maxWidth: '600px', margin: '0 auto' }}>
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/dashboard')} 
        className="btn-secondary mb-3" 
        style={{ padding: '0.6rem 1rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: 'auto' }}
      >
        <ArrowLeft size={18} /> กลับแดชบอร์ด
      </button>

      {success ? (
        /* SUCCESS SCREEN */
        <div className="glass-card text-center" style={{ padding: '3rem 1.5rem', animation: 'popIn 0.4s cubic-bezier(0.22,1,0.36,1) both' }}>
          <CheckCircle size={72} color="var(--accent-green)" style={{ margin: '0 auto 1.2rem', filter: 'drop-shadow(0 2px 10px rgba(16,185,129,0.3))' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>
            ส่งความรู้สึกสำเร็จแล้ว!
          </h2>
          <p style={{ color: 'var(--text-sub)', fontSize: '1rem', fontWeight: 600, lineHeight: '1.6' }}>
            ระบบได้รับความรู้สึกดีๆ จากทีม <span style={{ color: 'var(--accent-pink)', fontWeight: 800 }}>{team.name}</span> เรียบร้อยแล้วครับ<br />
            ขอบคุณน้องๆ ทุกคนที่เข้ามาร่วมเขียนแชร์ความสุขร่วมกันนะ!
          </p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn mt-4"
            style={{ width: 'auto', padding: '0.8rem 2rem', background: 'var(--accent-pink)', border: '2px solid #000', boxShadow: '3px 3px 0 #000' }}
          >
            กลับหน้าแดชบอร์ด
          </button>
        </div>
      ) : (
        /* FORM SCREEN */
        <div className="glass-card" style={{ padding: '2rem 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Heart size={44} color="var(--accent-pink)" style={{ margin: '0 auto 0.5rem', filter: 'drop-shadow(0 2px 8px rgba(255,46,147,0.3))' }} />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white' }}>แบบฟอร์มส่งความรู้สึกค่าย</h2>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', fontWeight: 600 }}>
              แชร์ความรู้สึกของทีม <span style={{ color: 'var(--accent-pink)', fontWeight: 800 }}>{team.name}</span> ฝากไปถึงหัวใจพี่ๆ ค่ายกันนะ
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Question 1: Pros */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Edit3 size={16} color="var(--accent-pink)" /> ข้อดี หรือสิ่งประทับใจสุดๆ ในค่ายครั้งนี้คืออะไร?
              </label>
              <textarea
                className="form-control"
                style={{ minHeight: '100px', border: '2px solid #e2e8f0', borderRadius: '12px', resize: 'vertical' }}
                placeholder="เขียนสิ่งที่ชอบ กิจกรรมที่ฟิน พี่ๆ ที่ประทับใจ..."
                value={pros}
                onChange={e => setPros(e.target.value)}
                required
              />
            </div>

            {/* Question 2: Cons */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Edit3 size={16} color="var(--accent-blue)" /> ข้อเสีย หรือจุดที่คิดว่าอยากให้ค่ายปรับปรุงในครั้งต่อไป?
              </label>
              <textarea
                className="form-control"
                style={{ minHeight: '100px', border: '2px solid #e2e8f0', borderRadius: '12px', resize: 'vertical' }}
                placeholder="เขียนสิ่งที่อยากให้พัฒนา อาหาร เวลา กิจกรรม หรือจุดติดขัด..."
                value={cons}
                onChange={e => setCons(e.target.value)}
                required
              />
            </div>

            {/* Question 3: Gained */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Edit3 size={16} color="var(--accent-purple)" /> สิ่งที่น้องๆ ได้เรียนรู้หรือได้รับกลับบ้านจากค่ายนี้?
              </label>
              <textarea
                className="form-control"
                style={{ minHeight: '100px', border: '2px solid #e2e8f0', borderRadius: '12px', resize: 'vertical' }}
                placeholder="มิตรภาพ ประสบการณ์ ความรู้ หรือการทำงานร่วมกับเพื่อน..."
                value={gained}
                onChange={e => setGained(e.target.value)}
                required
              />
            </div>

            {/* Question 4: Message to Staff */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Heart size={16} color="var(--accent-pink)" /> สิ่งที่อยากบอกเป็นพิเศษกับพี่ๆ ทีมงานค่ายทุกคน?
              </label>
              <textarea
                className="form-control"
                style={{ minHeight: '100px', border: '2px solid #e2e8f0', borderRadius: '12px', resize: 'vertical' }}
                placeholder="ฝากคำขอบคุณ คำซึ้งๆ หรือบอกความรักความประทับใจไปถึงหัวใจพี่ค่ายได้เต็มที่เลย!"
                value={messageToStaff}
                onChange={e => setMessageToStaff(e.target.value)}
                required
              />
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button 
              type="submit" 
              className="btn mt-3" 
              disabled={loading}
              style={{ padding: '1rem', border: '2px solid #000', boxShadow: '3px 3px 0 #000', background: 'var(--accent-pink)' }}
            >
              {loading ? 'กำลังส่งความรู้สึก...' : <><Send size={18} /> ส่งความรู้สึกค่าย</>}
            </button>

          </form>
        </div>
      )}

      {/* PopIn CSS */}
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

    </div>
  );
}
