import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, CheckCircle, Ticket, Ghost, Zap } from 'lucide-react';

export default function StationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // For Ghost Base
  const [staffPassword, setStaffPassword] = useState('');
  const [ghostPoints, setGhostPoints] = useState(2);
  const [ghostSuccess, setGhostSuccess] = useState(false);

  useEffect(() => {
    const localTeam = localStorage.getItem('candy_team');
    if (!localTeam) {
      navigate('/login');
      return;
    }
    const parsed = JSON.parse(localTeam);
    setTeam(parsed);
    fetchStation();
    fetchFreshPoints(parsed.id, parsed);
  }, [id, navigate]);

  const fetchFreshPoints = async (teamId, currentTeamObj) => {
    const { data } = await supabase.from('teams').select('points, name').eq('id', teamId).single();
    if (data) {
      const updatedTeam = { ...currentTeamObj, points: data.points, name: data.name };
      localStorage.setItem('candy_team', JSON.stringify(updatedTeam));
      setTeam(updatedTeam);
    }
  };

  const fetchStation = async () => {
    const { data } = await supabase.from('stations').select('*').eq('id', id).single();
    if (data) setStation(data);
  };

  const handleNormalPay = async () => {
    setLoading(true);
    setMessage('');
    try {
      // 1. Fetch fresh points first to avoid race conditions overriding staff rewards!
      const { data: freshTeam } = await supabase.from('teams').select('points').eq('id', team.id).single();
      if (!freshTeam) {
        setMessage('ไม่พบข้อมูลกลุ่มนี้ในระบบ');
        return;
      }

      if (freshTeam.points < station.cost) {
        setMessage('ลูกอมไม่พอจ่ายค่าเล่นครับ!');
        return;
      }

      const newPoints = freshTeam.points - station.cost;
      await supabase.from('teams').update({ points: newPoints }).eq('id', team.id);
      
      // 2. Create Transaction
      const txnId = `TXN-${Date.now()}`;
      await supabase.from('transactions').insert({
        id: txnId,
        team_id: team.id,
        station_id: station.id,
        action_type: 'PLAY',
        amount: -station.cost,
        status: 'PENDING'
      });

      // Update local storage and local state
      const updatedTeam = { ...team, points: newPoints };
      localStorage.setItem('candy_team', JSON.stringify(updatedTeam));
      setTeam(updatedTeam);
      
      const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setMessage(`✅ จ่ายลูกอมสำเร็จเวลา ${timeStr}! รอรอบเล่นได้เลยครับ`);
    } catch (err) {
      setMessage('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLotteryPay = async () => {
    setLoading(true);
    setMessage('');
    try {
      // 1. Fetch fresh points first to avoid race conditions overriding staff rewards!
      const { data: freshTeam } = await supabase.from('teams').select('points').eq('id', team.id).single();
      if (!freshTeam) {
        setMessage('ไม่พบข้อมูลกลุ่มนี้ในระบบ');
        return;
      }

      if (freshTeam.points < station.cost) {
        setMessage('ลูกอมไม่พอซื้อครับ!');
        return;
      }

      const newPoints = freshTeam.points - station.cost;
      await supabase.from('teams').update({ points: newPoints }).eq('id', team.id);
      
      const txnId = `LOT-${Date.now()}`;
      await supabase.from('transactions').insert({
        id: txnId,
        team_id: team.id,
        station_id: station.id,
        action_type: 'PLAY',
        amount: -station.cost,
        status: 'CONFIRMED' // Auto confirm for lottery
      });

      const updatedTeam = { ...team, points: newPoints };
      localStorage.setItem('candy_team', JSON.stringify(updatedTeam));
      setTeam(updatedTeam);
      
      const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setMessage(`🎟️ ซื้อล็อตเตอรี่สำเร็จเวลา ${timeStr}! โปรดรอฟังผลตามเวลาที่กำหนดนะครับ`);
    } catch (err) {
      setMessage('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGhostScore = async () => {
    if (staffPassword !== station.secret_key) {
      setMessage('❌ รหัสลับพี่สตาฟฟ์ไม่ถูกต้อง');
      return;
    }
    setLoading(true);
    try {
      // Refresh points first to avoid overriding
      const { data: currentTeam } = await supabase.from('teams').select('points').eq('id', team.id).single();
      const newPoints = currentTeam.points + parseInt(ghostPoints);
      
      await supabase.from('teams').update({ points: newPoints }).eq('id', team.id);
      
      const txnId = `GHOST-${Date.now()}`;
      await supabase.from('transactions').insert({
        id: txnId,
        team_id: team.id,
        station_id: station.id,
        action_type: 'REWARD',
        amount: parseInt(ghostPoints),
        status: 'CONFIRMED'
      });

      const updatedTeam = { ...team, points: newPoints };
      localStorage.setItem('candy_team', JSON.stringify(updatedTeam));
      setTeam(updatedTeam);
      
      setGhostSuccess(true);
    } catch (err) {
      setMessage('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!station || !team) return null;

  return (
    <div className="mt-2">
      <button onClick={() => navigate('/dashboard')} className="btn-secondary mb-3" style={{ padding: '0.6rem 1rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: 'auto' }}>
        <ArrowLeft size={18} /> กลับ
      </button>

      <div className="glass-card">
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: station.base_type === 'ghost' ? 'var(--accent-purple)' : 'white' }}>{station.name}</h2>
        <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>สตาฟฟ์: {station.staff}</p>

        {station.base_type === 'normal' && (
          <>
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-text">กดปุ่มด้านล่างเพื่อจ่ายค่าเล่น <b>{station.cost} ลูกอม</b></div>
            </div>
            <div className="process-step">
              <div className="step-number" style={{ background: 'var(--accent-amber)' }}>2</div>
              <div className="step-text">เล่นเกมให้ชนะเพื่อรับ <b>{station.reward} ลูกอม</b></div>
            </div>
            <div className="process-step">
              <div className="step-number" style={{ background: 'var(--accent-green)' }}>3</div>
              <div className="step-text">พี่สตาฟฟ์กดยืนยันให้แต้มเข้ากระเป๋า</div>
            </div>
            
            {message && <div className="success-msg" style={{ margin: '1.5rem 0' }}>{message}</div>}
            
            {!message && (
              <button onClick={handleNormalPay} disabled={loading} className="btn btn-amber mt-4">
                {loading ? 'กำลังดำเนินการ...' : <><Zap size={20}/> จ่าย {station.cost} ลูกอม เพื่อเล่น</>}
              </button>
            )}
          </>
        )}

        {station.base_type === 'lottery' && (
          <>
            <div className="process-step" style={{ borderLeftColor: 'var(--accent-blue)' }}>
              <div className="step-number" style={{ background: 'var(--accent-blue)' }}><Ticket size={18}/></div>
              <div className="step-text">ซื้อล็อตเตอรี่ราคา <b>{station.cost} ลูกอม</b> หักทันที</div>
            </div>
            <div className="process-step" style={{ borderLeftColor: 'var(--accent-purple)' }}>
              <div className="step-number" style={{ background: 'var(--accent-purple)' }}>⌛</div>
              <div className="step-text">ไปเล่นฐานอื่นต่อได้เลย แล้วรอลุ้นรางวัลใหญ่ท้ายค่ายจากทีมงาน!</div>
            </div>

            {message && <div className="success-msg" style={{ margin: '1.5rem 0', borderColor: 'var(--accent-blue)', background: 'var(--accent-blue-light)' }}>{message}</div>}
            
            {!message && (
              <button onClick={handleLotteryPay} disabled={loading} className="btn btn-blue mt-4">
                {loading ? 'กำลังทำรายการ...' : <><Ticket size={20}/> ซื้อล็อตเตอรี่ ({station.cost} ลูกอม)</>}
              </button>
            )}
          </>
        )}

        {station.base_type === 'ghost' && (
          <>
            {ghostSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <CheckCircle size={60} color="var(--accent-green)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ color: 'var(--accent-green)', fontSize: '1.5rem', fontWeight: 800 }}>รับ {ghostPoints} แต้ม สำเร็จ!</h3>
                <p style={{ color: 'var(--text-sub)', marginTop: '0.5rem' }}>แต้มเข้ากลุ่มเรียบร้อยแล้ว ยอดปัจจุบัน: {team.points}</p>
                <button onClick={() => navigate('/dashboard')} className="btn mt-4">กลับหน้าหลัก</button>
              </div>
            ) : (
              <div className="doodle-card-inner" style={{ background: '#f3e8ff' }}>
                <h3 style={{ textAlign: 'center', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 800 }}><Ghost size={24}/> สำหรับพี่สตาฟฟ์ (พี่พีช)</h3>
                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '1.5rem', fontWeight: 600 }}>น้องๆ ยื่นมือถือให้พี่สตาฟฟ์กดให้คะแนนได้เลย!</p>
                
                <div className="form-group">
                  <label className="form-label">เลือกคะแนนที่จะมอบให้ (2-10)</label>
                  <select className="form-control" value={ghostPoints} onChange={(e) => setGhostPoints(e.target.value)}>
                    {[2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} ลูกอม</option>)}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">รหัสลับพี่พีช</label>
                  <input type="password" placeholder="****" className="form-control" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} />
                </div>
                
                {message && <p className="error-msg">{message}</p>}
                
                <button onClick={handleGhostScore} disabled={loading || !staffPassword} className="btn btn-purple mt-3">
                  {loading ? 'กำลังมอบแต้ม...' : 'ยืนยันมอบลูกอมฟรี!'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
