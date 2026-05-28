import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogIn, ShieldAlert, Settings, Check } from 'lucide-react';

const TEAMS = Array.from({ length: 10 }, (_, i) => ({
  id: `TEAM${String(i + 1).padStart(2, '0')}`,
  label: `กลุ่มที่ ${i + 1}`,
}));

export default function Login() {
  const [role, setRole] = useState('team');
  const [teamId, setTeamId] = useState('');
  const [pin, setPin] = useState('');
  const [stationId, setStationId] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState([]);
  const navigate = useNavigate();

  // Fetch station names for staff picker
  useEffect(() => {
    if (role === 'staff' && stations.length === 0) {
      supabase.from('stations').select('id, name').order('id').then(({ data }) => {
        if (data) setStations(data);
      });
    }
  }, [role]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (role === 'team') {
        const tId = teamId.toUpperCase().trim();
        const { data, error } = await supabase
          .from('teams').select('*').eq('id', tId).eq('pin', pin.trim()).single();
        if (error || !data) throw new Error('รหัสทีม หรือ PIN ไม่ถูกต้อง');
        localStorage.setItem('candy_team', JSON.stringify(data));
        navigate('/dashboard');
      } else if (role === 'staff') {
        const sId = stationId.toUpperCase().trim();
        const { data, error } = await supabase
          .from('stations').select('*').eq('id', sId).eq('secret_key', secretKey.trim()).single();
        if (error || !data) throw new Error('รหัสฐาน หรือ รหัสลับ ไม่ถูกต้อง');
        localStorage.setItem('candy_station', JSON.stringify(data));
        navigate(`/admin/${data.id}`);
      } else if (role === 'master') {
        if (secretKey === 'aumkanitta02') {
          localStorage.setItem('candy_master', 'true');
          navigate('/master');
        } else {
          throw new Error('รหัสผ่านผู้คุมค่ายไม่ถูกต้อง');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (r) => { setRole(r); setError(''); setSecretKey(''); setTeamId(''); setStationId(''); setPin(''); };

  return (
    <div className="glass-card mt-4">
      <h1 className="title-main">CANDY ECO</h1>
      <p className="title-sub">ระบบสะสมแต้มกิจกรรมค่าย</p>

      {/* ── Role switcher ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', border: '3px solid var(--text-main)', background: '#f1f5f9', padding: '0.5rem', borderRadius: '16px' }}>
        {[
          { key: 'team', label: 'น้องค่าย' },
          { key: 'staff', label: 'พี่สตาฟฟ์' },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`btn ${role === key ? '' : 'btn-secondary'}`}
            style={{ padding: '0.8rem', flex: 1 }}
            onClick={() => switchRole(key)}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className={`btn ${role === 'master' ? '' : 'btn-secondary'}`}
          style={{ padding: '0.8rem', width: 'auto', flex: 'none' }}
          onClick={() => switchRole('master')}
          title="แอดมินกลาง"
        >
          <Settings size={20} />
        </button>
      </div>

      <form onSubmit={handleLogin}>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TEAM — card grid picker                                            */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {role === 'team' && (
          <>
            <div className="form-group">
              <label className="form-label">เลือกกลุ่มของคุณ</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {TEAMS.map((t, idx) => {
                  const selected = teamId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTeamId(t.id)}
                      style={{
                        position: 'relative',
                        padding: '0.75rem 0.5rem',
                        borderRadius: '14px',
                        border: selected ? '2.5px solid var(--accent-pink)' : '2px solid #e2e8f0',
                        background: selected ? 'var(--accent-pink)' : '#ffffff',
                        color: selected ? '#fff' : 'var(--text-main)',
                        fontWeight: 900,
                        fontSize: '0.95rem',
                        fontFamily: "'Kanit', sans-serif",
                        cursor: 'pointer',
                        boxShadow: selected ? '3px 3px 0px var(--accent-pink)' : 'none',
                        transform: selected ? 'scale(1.04)' : 'scale(1)',
                        transition: 'all 0.15s cubic-bezier(0.22,1,0.36,1)',
                        animation: `popCard 0.3s cubic-bezier(0.22,1,0.36,1) both`,
                        animationDelay: `${idx * 0.04}s`,
                      }}
                      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = 'var(--accent-pink)'; }}
                      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = '#e2e8f0'; }}
                    >
                      {selected && (
                        <span style={{ position: 'absolute', top: '6px', right: '8px', background: 'rgba(255,255,255,0.35)', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={11} color="#fff" strokeWidth={3} />
                        </span>
                      )}
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">รหัส PIN (4 หลัก)</label>
              <input
                type="number"
                className="form-control"
                placeholder="****"
                value={pin}
                onChange={e => setPin(e.target.value)}
                required
              />
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* STAFF — station card grid picker                                   */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {role === 'staff' && (
          <>
            <div className="form-group">
              <label className="form-label">เลือกฐานกิจกรรม</label>
              {stations.length === 0 ? (
                <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', fontWeight: 600 }}>กำลังโหลดรายชื่อฐาน...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {stations.map((st, idx) => {
                    const selected = stationId === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStationId(st.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '0.7rem 1rem',
                          borderRadius: '12px',
                          border: selected ? '2.5px solid var(--accent-pink)' : '2px solid #e2e8f0',
                          background: selected ? 'var(--accent-pink)' : '#ffffff',
                          color: selected ? '#fff' : 'var(--text-main)',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          fontFamily: "'Kanit', sans-serif",
                          cursor: 'pointer',
                          boxShadow: selected ? '3px 3px 0px var(--accent-pink)' : 'none',
                          transform: selected ? 'translateX(4px)' : 'translateX(0)',
                          transition: 'all 0.15s cubic-bezier(0.22,1,0.36,1)',
                          animation: `slideInCard 0.35s cubic-bezier(0.22,1,0.36,1) both`,
                          animationDelay: `${idx * 0.04}s`,
                          textAlign: 'left',
                        }}
                        onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = 'var(--accent-pink)'; e.currentTarget.style.transform = 'translateX(3px)'; } }}
                        onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateX(0)'; } }}
                      >
                        <span>{st.name}</span>
                        {selected && <Check size={16} color="#fff" strokeWidth={3} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">รหัสลับประจำฐาน</label>
              <input
                type="password"
                className="form-control"
                placeholder="****"
                value={secretKey}
                onChange={e => setSecretKey(e.target.value)}
                required
              />
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* MASTER — password only                                             */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {role === 'master' && (
          <div className="form-group">
            <label className="form-label">รหัสผ่านผู้คุมค่าย (Master Admin)</label>
            <input
              type="password"
              className="form-control"
              placeholder="****"
              value={secretKey}
              onChange={e => setSecretKey(e.target.value)}
              required
            />
          </div>
        )}

        {error && <p className="error-msg">{error}</p>}

        <button type="submit" className="btn mt-4" disabled={loading}>
          {loading ? 'กำลังตรวจสอบ...' : (
            role === 'team' ? <><LogIn size={20} /> เข้าสู่ระบบ</> :
            role === 'staff' ? <><ShieldAlert size={20} /> เข้าโหมดจัดการฐาน</> :
            <><Settings size={20} /> เข้าสู่แผงควบคุมหลัก</>
          )}
        </button>
      </form>

      {/* ── How to play link for students before login ────────────────────── */}
      <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '2.5px dotted #e2e8f0', paddingTop: '1.2rem' }}>
        <button
          type="button"
          onClick={() => navigate('/how-to-play')}
          className="btn btn-secondary"
          style={{ width: '100%', padding: '0.8rem', borderRadius: '14px', border: '2px solid #000', boxShadow: '3px 3px 0 #000', background: '#fff', fontWeight: 800 }}
        >
          📖 วิธีการเล่นและกติกาค่าย (น้องค่าย)
        </button>
      </div>

      <style>{`
        @keyframes popCard {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInCard {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
