import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Send, CheckCircle, Heart, Edit3, User } from 'lucide-react';

export default function Feedback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ฟอร์มส่งความรู้สึก
  const [studentName, setStudentName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentName.trim() || !message.trim()) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วนนะครับ');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const feedbackId = `FB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const { error: insertError } = await supabase
        .from('feedback')
        .insert({
          id: feedbackId,
          student_name: studentName.trim(),
          message: message.trim()
        });

      if (insertError) throw insertError;
      setSuccess(true);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการส่งข้อมูล: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2" style={{ fontFamily: "'Kanit', sans-serif", paddingBottom: '3rem', maxWidth: '600px', margin: '0 auto' }}>
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')} 
        className="btn-secondary mb-3" 
        style={{ padding: '0.6rem 1rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: 'auto' }}
      >
        <ArrowLeft size={18} /> กลับหน้าแรก
      </button>

      {success ? (
        /* SUCCESS SCREEN */
        <div className="glass-card text-center" style={{ padding: '3rem 1.5rem', animation: 'popIn 0.4s cubic-bezier(0.22,1,0.36,1) both' }}>
          <CheckCircle size={72} color="var(--accent-green)" style={{ margin: '0 auto 1.2rem', filter: 'drop-shadow(0 2px 10px rgba(16,185,129,0.3))' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>
            ส่งความรู้สึกสำเร็จแล้ว!
          </h2>
          <p style={{ color: 'var(--text-sub)', fontSize: '1rem', fontWeight: 600, lineHeight: '1.6' }}>
            ขอบคุณน้อง <span style={{ color: 'var(--accent-pink)', fontWeight: 800 }}>{studentName}</span> มากๆ เลยครับ<br />
            ความรู้สึกดีๆ และข้อความชื่นใจได้ถูกส่งไปถึงพี่ค่ายเรียบร้อยแล้วนะ!
          </p>
          <button 
            onClick={() => {
              setSuccess(false);
              setStudentName('');
              setMessage('');
            }} 
            className="btn mt-4"
            style={{ width: 'auto', padding: '0.8rem 2rem', background: 'var(--accent-pink)', border: '2px solid #000', boxShadow: '3px 3px 0 #000' }}
          >
            ส่งความรู้สึกเพิ่มอีก
          </button>
        </div>
      ) : (
        /* FORM SCREEN */
        <div className="glass-card" style={{ padding: '2rem 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Heart size={44} color="var(--accent-pink)" style={{ margin: '0 auto 0.5rem', filter: 'drop-shadow(0 2px 8px rgba(255,46,147,0.3))' }} />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white' }}>แบบฟอร์มส่งความรู้สึกค่าย</h2>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', fontWeight: 600 }}>
              เขียนความในใจ ฝากไปถึงหัวใจพี่ๆ ค่ายทุกคนกันนะ
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Student Name */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={16} color="var(--accent-pink)" /> ชื่อจริงของน้อง
              </label>
              <input
                type="text"
                className="form-control"
                style={{ border: '2px solid #e2e8f0', borderRadius: '12px' }}
                placeholder="กรอกชื่อจริงของน้อง..."
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                required
              />
            </div>

            {/* Message */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Edit3 size={16} color="var(--accent-blue)" /> ความรู้สึกหรือความในใจที่อยากบอกพี่ค่าย
              </label>
              <textarea
                className="form-control"
                style={{ minHeight: '180px', border: '2px solid #e2e8f0', borderRadius: '12px', resize: 'vertical' }}
                placeholder="ฝากคำขอบคุณ คำซึ้งๆ บอกความรัก ความประทับใจ หรือข้อแนะแนวไปถึงพี่ทีมงานค่ายได้เต็มที่เลยนะ!"
                value={message}
                onChange={e => setMessage(e.target.value)}
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
