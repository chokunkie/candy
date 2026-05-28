import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function AdminStation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [pendings, setPendings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    const localSt = localStorage.getItem('candy_station');
    if (!localSt) {
      navigate('/login');
      return;
    }
    const parsedSt = JSON.parse(localSt);
    if (parsedSt.id !== id) {
      navigate('/login');
      return;
    }
    setStation(parsedSt);
    fetchPendings(parsedSt.id);

    // Setup real-time subscription for new pendings
    const subscription = supabase
      .channel('public:transactions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions', filter: `station_id=eq.${parsedSt.id}` }, payload => {
        fetchPendings(parsedSt.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [id, navigate]);

  const fetchPendings = async (stationId) => {
    setLoading(true);
    const { data } = await supabase
      .from('transactions')
      .select('*, teams(name)')
      .eq('station_id', stationId)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true });
    
    if (data) setPendings(data);
    setLoading(false);
  };

  const handleConfirmWin = async (txn) => {
    try {
      // 1. Update transaction status
      await supabase.from('transactions').update({ status: 'CONFIRMED' }).eq('id', txn.id);
      
      // 2. Add reward to team (fetch fresh points first to avoid race overrides!)
      const { data: teamData } = await supabase.from('teams').select('points').eq('id', txn.team_id).single();
      const newPoints = (teamData?.points || 0) + station.reward;
      await supabase.from('teams').update({ points: newPoints }).eq('id', txn.team_id);
      
      // 3. Create reward transaction
      const rewId = `REW-${Date.now()}`;
      await supabase.from('transactions').insert({
        id: rewId,
        team_id: txn.team_id,
        station_id: station.id,
        action_type: 'REWARD',
        amount: station.reward,
        status: 'CONFIRMED'
      });

      // Prepare professional mobile-banking transfer slip proof (หลักฐาน)
      const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
      
      setReceiptData({
        refId: rewId,
        teamName: txn.teams?.name || txn.team_id,
        stationName: station.name,
        amount: station.reward,
        time: timeStr,
        date: dateStr,
        status: 'SUCCESS'
      });
      setShowReceipt(true);
      
      fetchPendings(station.id);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleConfirmLoss = async (txn) => {
    try {
      // Just update to CONFIRMED without reward
      await supabase.from('transactions').update({ status: 'CONFIRMED' }).eq('id', txn.id);
      
      // Prepare Loss receipt proof
      const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
      
      setReceiptData({
        refId: txn.id,
        teamName: txn.teams?.name || txn.team_id,
        stationName: station.name,
        amount: 0,
        time: timeStr,
        date: dateStr,
        status: 'LOSS'
      });
      setShowReceipt(true);

      fetchPendings(station.id);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('candy_station');
    navigate('/login');
  };

  if (!station) return null;

  return (
    <div className="mt-2" style={{ fontFamily: "'Kanit', 'Prompt', sans-serif" }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-blue)', textShadow: '1px 1px 0px var(--text-main)', fontFamily: "'Kanit', sans-serif" }}>โหมดจัดการฐาน (Admin Dashboard)</h2>
        <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto' }}>
          <LogOut size={18} color="#ef4444" /> ออกจากระบบ
        </button>
      </div>

      <div className="admin-grid">
        {/* Left Side: Station Info sidebar */}
        <div className="admin-sidebar">
          <div className="glass-card highlighted-card" style={{ borderColor: 'var(--accent-blue)', background: '#e0f8ff', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.3rem', color: 'var(--text-main)' }}>{station.name}</h2>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.5rem' }}>ผู้ดูแล: {station.staff}</p>
            
            <div className="doodle-card-inner" style={{ background: '#ffffff', margin: 0, padding: '1rem', border: '2px solid #000' }}>
              <h4 style={{ fontWeight: 800, marginBottom: '0.5rem', borderBottom: '2px dashed var(--text-main)', paddingBottom: '0.3rem' }}>ข้อมูลฐาน</h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: 600 }}><b>ค่าเล่น:</b> {station.cost} ลูกอม</p>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: 600 }}><b>รางวัล:</b> {station.reward} ลูกอม</p>
              <p style={{ fontSize: '0.9rem', marginBottom: 0, fontWeight: 600 }}><b>ประเภทฐาน:</b> {station.base_type === 'ghost' ? 'แจกแต้มพิเศษ' : station.base_type === 'lottery' ? 'สุ่มล็อตเตอรี่' : 'เกมฐานปกติ'}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Pending logs */}
        <div className="admin-main">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>รายการรอดำเนินการ ({pendings.length} คิว)</h3>
            <button onClick={() => fetchPendings(station.id)} className="btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto' }}>
              <RefreshCw size={16} className={loading ? "spin" : ""} /> รีเฟรช
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendings.length === 0 ? (
              <div className="glass-card text-center" style={{ padding: '3rem 1rem' }}>
                <p style={{ color: 'var(--text-sub)', fontWeight: 700, fontSize: '1.1rem' }}>ไม่มีคิวรอยืนยันในขณะนี้ 🎉</p>
              </div>
            ) : (
              pendings.map(txn => (
                <div key={txn.id} className="glass-card" style={{ padding: '1.5rem', marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-pink)', textShadow: '1px 1px 0px var(--text-main)' }}>{txn.teams?.name || txn.team_id}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: 600 }}>เวลา: {new Date(txn.created_at).toLocaleTimeString('th-TH')}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-amber">รอตัดสินผล</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => handleConfirmWin(txn)} className="btn btn-success" style={{ flex: 1, padding: '0.9rem', border: '2px solid #000', boxShadow: '3px 3px 0 #000' }}>
                      <CheckCircle size={18}/> ชนะ (+{station.reward})
                    </button>
                    <button onClick={() => handleConfirmLoss(txn)} className="btn btn-secondary" style={{ flex: 1, padding: '0.9rem', border: '2px solid #000', boxShadow: '3px 3px 0 #000' }}>
                      <XCircle size={18}/> แพ้
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Transaction slip proof modal (หลักฐาน) */}
      {showReceipt && receiptData && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{
            width: '90%',
            maxWidth: '350px',
            background: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 20px 45px rgba(0,0,0,0.25)',
            border: '3px solid #1e293b',
            overflow: 'hidden',
            fontFamily: "'Kanit', sans-serif",
            animation: 'scaleIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            {/* Slip Header Banner */}
            <div style={{
              background: receiptData.status === 'SUCCESS' ? '#10b981' : '#64748b',
              padding: '1.2rem',
              color: '#ffffff',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <CheckCircle size={32} color="#ffffff" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                {receiptData.status === 'SUCCESS' ? 'ทำรายการโอนคะแนนสำเร็จ' : 'ทำรายการเสร็จสิ้น (แพ้เกม)'}
              </h3>
            </div>
            
            {/* Slip Body Content */}
            <div style={{ padding: '1.5rem', background: '#f8fafc', color: '#1e293b' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                
                {/* Station Name */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>ฐานกิจกรรม:</span>
                  <span style={{ fontWeight: 800, color: '#1e293b' }}>{receiptData.stationName}</span>
                </div>

                {/* Team Name */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>กลุ่มผู้รับ:</span>
                  <span style={{ fontWeight: 800, color: 'var(--accent-pink)' }}>{receiptData.teamName}</span>
                </div>

                {/* Date & Time */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>เวลาทำรายการ:</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{receiptData.date} - {receiptData.time} น.</span>
                </div>

                {/* Dotted Divider */}
                <div style={{ borderTop: '2.5px dotted #cbd5e1', margin: '0.4rem 0' }}></div>

                {/* Transfer Amount */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontWeight: 800, fontSize: '0.95rem' }}>จำนวนคะแนน:</span>
                  <span style={{ 
                    fontSize: '1.8rem', 
                    fontWeight: 900, 
                    color: receiptData.status === 'SUCCESS' ? '#10b981' : '#64748b', 
                    lineHeight: 1 
                  }}>
                    {receiptData.status === 'SUCCESS' ? `+${receiptData.amount}` : '0'}
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b', marginLeft: '0.2rem' }}>ลูกอม</span>
                  </span>
                </div>

                {/* Dotted Divider */}
                <div style={{ borderTop: '2.5px dotted #cbd5e1', margin: '0.4rem 0' }}></div>

                {/* Reference ID */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                  <span style={{ fontWeight: 600 }}>รหัสธุรกรรม (Ref):</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{receiptData.refId}</span>
                </div>

              </div>
            </div>

            {/* Slip Footer Watermark & Close Button */}
            <div style={{
              padding: '1.2rem',
              textAlign: 'center',
              background: '#ffffff',
              borderTop: '1.5px solid #e2e8f0'
            }}>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, margin: '0 0 1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                🛡️ หลักฐานยืนยันคะแนน Candy Camp
              </p>
              
              <button 
                onClick={() => setShowReceipt(false)} 
                style={{
                  width: '100%',
                  background: '#1e293b',
                  color: '#ffffff',
                  border: '2px solid #000',
                  borderRadius: '12px',
                  padding: '0.7rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '3px 3px 0px #000',
                  transition: 'all 0.1s'
                }}
              >
                เสร็จสิ้น
              </button>
            </div>

          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
