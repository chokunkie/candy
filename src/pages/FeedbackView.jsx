import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';
import { Heart, MessageSquare, QrCode, ArrowLeft, Search } from 'lucide-react';

export default function FeedbackView() {
  const navigate = useNavigate();

  // States
  const [feedbacksList, setFeedbacksList] = useState([]);
  const [fetchingFeedbacks, setFetchingFeedbacks] = useState(true);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [feedbackTab, setFeedbackTab] = useState('read'); // 'read' | 'qr'
  const [readMode, setReadMode] = useState('individual'); // 'individual' | 'list'
  const [currentIndividualIndex, setCurrentIndividualIndex] = useState(0);
  const [toasts, setToasts] = useState([]);

  const feedbackChannelRef = useRef(null);

  // ─── Fetch feedback messages sorted by created_at desc ────────────────────
  const fetchFeedbacks = async () => {
    setFetchingFeedbacks(true);
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setFeedbacksList(data || []);
      setFeedbackCount(data ? data.length : 0);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    } finally {
      setFetchingFeedbacks(false);
    }
  };

  // ─── Subscribe to realtime feedback updates (INSERT & DELETE) ─────────────
  const subscribeFeedback = useCallback(() => {
    if (feedbackChannelRef.current) return;

    const ch = supabase
      .channel('mentor:feedback')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const newFb = payload.new;
          const studentName = newFb.student_name || 'ผู้ไม่ประสงค์ออกนาม';

          // 1. Update submitted state list and count
          setFeedbacksList(prev => [newFb, ...prev]);
          setFeedbackCount(prev => prev + 1);

          // 2. Confetti burst
          const duration = 2.5 * 1000;
          const end = Date.now() + duration;

          const frame = () => {
            confetti({
              particleCount: 5,
              angle: 60,
              spread: 55,
              origin: { x: 0 }
            });
            confetti({
              particleCount: 5,
              angle: 120,
              spread: 55,
              origin: { x: 1 }
            });

            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          };
          frame();

          // 3. Toast notification
          const toastId = Date.now() + Math.random().toString(36).substr(2, 9);
          const newToast = {
            id: toastId,
            message: `มีข้อความความรู้สึกจาก คุณ ${studentName} ส่งเข้ามาแล้ว!`
          };
          setToasts(prev => [...prev, newToast]);

          // Auto remove toast
          setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== toastId));
          }, 6000);
        } else if (payload.eventType === 'DELETE') {
          const oldFb = payload.old;
          setFeedbacksList(prev => {
            const filtered = prev.filter(fb => fb.id !== oldFb.id);
            setCurrentIndividualIndex(idx => {
              if (idx >= filtered.length) {
                return Math.max(0, filtered.length - 1);
              }
              return idx;
            });
            return filtered;
          });
          setFeedbackCount(prev => Math.max(0, prev - 1));
        }
      })
      .subscribe();

    feedbackChannelRef.current = ch;
  }, []);

  const unsubscribeFeedback = useCallback(() => {
    if (feedbackChannelRef.current) {
      supabase.removeChannel(feedbackChannelRef.current);
      feedbackChannelRef.current = null;
    }
  }, []);

  // ─── Initial Load ──────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      await fetchFeedbacks();
      subscribeFeedback();
    };
    init();
    return () => {
      unsubscribeFeedback();
    };
  }, [subscribeFeedback, unsubscribeFeedback]);

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      padding: '2rem 1.5rem',
      boxSizing: 'border-box',
      background: 'var(--bg-color)',
      fontFamily: "'Kanit', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative'
    }}>
      
      {/* Back Button */}
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
        <button
          onClick={() => navigate('/')}
          className="btn-secondary"
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: '2px solid #000',
            boxShadow: '3px 3px 0px #000',
            background: '#fff',
            color: '#1e293b',
            fontWeight: 800,
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          <ArrowLeft size={16} /> กลับหน้าหลัก
        </button>
      </div>

      {/* Main Glass Board Card */}
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '800px',
        background: '#1e293b',
        border: '4px solid #ff2e93',
        boxShadow: '12px 12px 0px #000',
        textAlign: 'center',
        padding: '2rem 1.5rem',
        color: '#fff',
        borderRadius: '24px',
        animation: 'toastIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) both'
      }}>
        
        {/* Board Header */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', alignItems: 'center', marginBottom: '0.8rem' }}>
          <Heart size={34} color="#ff2e93" fill="#ff2e93" style={{ animation: 'float 2s ease-in-out infinite' }} />
          <h1 style={{ fontSize: '1.8rem', fontWeight: 950, textShadow: '2.5px 2.5px 0px #000', margin: 0 }}>
            บอร์ดความรู้สึกน้องค่าย 💖 (สำหรับพี่บ้าน)
          </h1>
        </div>

        <p style={{ color: '#cbd5e1', fontSize: '0.92rem', fontWeight: 600, maxWidth: '600px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
          ยินดีต้อนรับพี่ๆ ค่ายทุกคนเข้าสู่กระดานแชร์ข้อความความรักและสิ่งดีๆ ที่น้องๆ ส่งมาให้สดๆ เรียลไทม์! สามารถใช้เปิดอ่านร่วมกันเพื่อรับกำลังใจและชื่นใจไปด้วยกันนะ
        </p>

        {/* Tab Controllers */}
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setFeedbackTab('read')}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: '10px',
              border: '2.5px solid #000',
              background: feedbackTab === 'read' ? '#ff2e93' : '#f1f5f9',
              color: feedbackTab === 'read' ? '#fff' : '#1e293b',
              fontWeight: 900,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: feedbackTab === 'read' ? 'none' : '3px 3px 0px #000',
              transform: feedbackTab === 'read' ? 'translate(3px, 3px)' : 'none',
              transition: 'all 0.1s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <MessageSquare size={16} /> อ่านข้อความความรู้สึก ({feedbackCount})
          </button>
          <button
            onClick={() => setFeedbackTab('qr')}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: '10px',
              border: '2.5px solid #000',
              background: feedbackTab === 'qr' ? '#ff2e93' : '#f1f5f9',
              color: feedbackTab === 'qr' ? '#fff' : '#1e293b',
              fontWeight: 900,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: feedbackTab === 'qr' ? 'none' : '3px 3px 0px #000',
              transform: feedbackTab === 'qr' ? 'translate(3px, 3px)' : 'none',
              transition: 'all 0.1s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <QrCode size={16} /> QR Code ให้น้องสแกน
          </button>
        </div>

        {/* Tab Content 1: Read Feedbacks */}
        {feedbackTab === 'read' && (
          <div style={{ animation: 'toastIn 0.2s ease-out both' }}>
            
            {/* Mode Selector and Search Bar */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.8rem',
              background: '#0f172a',
              padding: '0.8rem 1.2rem',
              borderRadius: '14px',
              border: '2px solid #334155',
              marginBottom: '1rem',
              textAlign: 'left'
            }}>
              {/* Mode Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setReadMode('individual')}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    border: '1.5px solid #000',
                    background: readMode === 'individual' ? '#9d4edd' : '#334155',
                    color: '#fff',
                    fontWeight: 850,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    boxShadow: readMode === 'individual' ? 'none' : '2px 2px 0px #000',
                    transform: readMode === 'individual' ? 'translate(2px, 2px)' : 'none',
                    transition: 'all 0.1s'
                  }}
                >
                  📖 อ่านทีละคน (แบบ Google Forms)
                </button>
                <button
                  onClick={() => setReadMode('list')}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    border: '1.5px solid #000',
                    background: readMode === 'list' ? '#9d4edd' : '#334155',
                    color: '#fff',
                    fontWeight: 850,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    boxShadow: readMode === 'list' ? 'none' : '2px 2px 0px #000',
                    transform: readMode === 'list' ? 'translate(2px, 2px)' : 'none',
                    transition: 'all 0.1s'
                  }}
                >
                  📋 รายการทั้งหมด
                </button>
              </div>

              {/* Actions / Search */}
              {readMode === 'list' ? (
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="🔍 ค้นหาชื่อน้อง หรือ ข้อความ..."
                    value={feedbackSearch}
                    onChange={e => setFeedbackSearch(e.target.value)}
                    style={{
                      background: '#1e293b',
                      border: '2px solid #334155',
                      borderRadius: '8px',
                      padding: '0.35rem 0.8rem 0.35rem 1.8rem',
                      color: '#fff',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      fontFamily: "'Kanit', sans-serif",
                      minWidth: '220px',
                      outline: 'none'
                    }}
                  />
                  <Search size={12} color="#94a3b8" style={{ position: 'absolute', left: '8px' }} />
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8' }}>
                  {"* เรียงจากล่าสุด ➡️ เก่าสุด"}
                </div>
              )}
            </div>

            {fetchingFeedbacks ? (
              <div style={{ padding: '3rem', color: '#94a3b8', fontWeight: 700 }}>
                กำลังดึงข้อมูลข้อความความรู้สึกของน้องๆ...
              </div>
            ) : feedbacksList.length === 0 ? (
              <div style={{
                background: '#0f172a',
                border: '2px dashed #334155',
                borderRadius: '16px',
                padding: '3.5rem 1rem',
                color: '#94a3b8',
                fontWeight: 700
              }}>
                ยังไม่มีน้องๆ ส่งข้อความความรู้สึกเข้ามาเลยครับ 🥺<br/>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginTop: '0.5rem', color: '#64748b' }}>
                  (น้องๆ สามารถสแกน QR Code เพื่อส่งกำลังใจมาระเบิดที่จอนี้ได้ทันทีนะ!)
                </span>
              </div>
            ) : (
              <>
                {/* MODE A: INDIVIDUAL VIEW */}
                {readMode === 'individual' && (() => {
                  const idx = Math.min(currentIndividualIndex, feedbacksList.length - 1);
                  const currentFb = feedbacksList[idx];
                  if (!currentFb) return null;
                  
                  const formattedTime = new Date(currentFb.created_at).toLocaleString('th-TH', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {/* Navigation header */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#0f172a',
                        padding: '0.5rem 1.2rem',
                        borderRadius: '10px',
                        border: '2px solid #334155'
                      }}>
                        <button
                          disabled={idx === 0}
                          onClick={() => setCurrentIndividualIndex(idx - 1)}
                          style={{
                            background: idx === 0 ? '#475569' : '#ff2e93',
                            color: '#fff',
                            border: '1.5px solid #000',
                            padding: '0.3rem 0.8rem',
                            borderRadius: '6px',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            cursor: idx === 0 ? 'not-allowed' : 'pointer',
                            opacity: idx === 0 ? 0.4 : 1,
                            boxShadow: idx === 0 ? 'none' : '1.5px 1.5px 0px #000'
                          }}
                        >
                          ◀ ล่าสุดกว่า
                        </button>

                        <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#fff' }}>
                          คนที่ <span style={{ color: '#ff2e93', fontSize: '1.1rem' }}>{idx + 1}</span> จากทั้งหมด <span style={{ color: '#3b82f6' }}>{feedbacksList.length}</span>
                        </div>

                        <button
                          disabled={idx === feedbacksList.length - 1}
                          onClick={() => setCurrentIndividualIndex(idx + 1)}
                          style={{
                            background: idx === feedbacksList.length - 1 ? '#475569' : '#ff2e93',
                            color: '#fff',
                            border: '1.5px solid #000',
                            padding: '0.3rem 0.8rem',
                            borderRadius: '6px',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            cursor: idx === feedbacksList.length - 1 ? 'not-allowed' : 'pointer',
                            opacity: idx === feedbacksList.length - 1 ? 0.4 : 1,
                            boxShadow: idx === feedbacksList.length - 1 ? 'none' : '1.5px 1.5px 0px #000'
                          }}
                        >
                          เก่ากว่า ▶
                        </button>
                      </div>

                      {/* Individual Card */}
                      <div style={{
                        background: '#ffffff',
                        border: '3.5px solid #1e293b',
                        borderRadius: '20px',
                        boxShadow: '6px 6px 0px #000',
                        padding: '1.5rem',
                        textAlign: 'left',
                        color: '#1e293b',
                        position: 'relative',
                        minHeight: '280px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        {/* Card Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2.5px dashed #e2e8f0', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{
                              background: '#fff0f6',
                              borderRadius: '50%',
                              width: '36px',
                              height: '36px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '2px solid #ff2e93'
                            }}>
                              <Heart size={18} color="#ff2e93" fill="#ff2e93" />
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800, display: 'block', textTransform: 'uppercase' }}>
                                น้องค่ายร่วมแชร์ความรู้สึก
                              </span>
                              <span style={{ fontSize: '1.25rem', fontWeight: 950, color: '#1e293b' }}>
                                น้อง {currentFb.student_name}
                              </span>
                            </div>
                          </div>
                          <span style={{ background: '#dcfce7', color: '#15803d', border: '1.5px solid #15803d', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 900 }}>
                            💌 ความคิดเห็นที่ {feedbacksList.length - idx}
                          </span>
                        </div>

                        {/* Card Body Message */}
                        <div style={{
                          background: '#f8fafc',
                          border: '2px solid #cbd5e1',
                          borderRadius: '12px',
                          padding: '1.2rem',
                          fontSize: '1.05rem',
                          fontWeight: 600,
                          lineHeight: '1.6',
                          color: '#334155',
                          whiteSpace: 'pre-wrap',
                          flex: 1,
                          minHeight: '130px',
                          maxHeight: '220px',
                          overflowY: 'auto',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                        }}>
                          {currentFb.message}
                        </div>

                        {/* Card Footer */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8' }}>
                          🗓️ ส่งเมื่อ: {formattedTime} น.
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* MODE B: LIST VIEW */}
                {readMode === 'list' && (() => {
                  const filteredFeedbacks = feedbacksList.filter(fb => 
                    fb.student_name.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
                    fb.message.toLowerCase().includes(feedbackSearch.toLowerCase())
                  );

                  if (filteredFeedbacks.length === 0) {
                    return (
                      <div style={{ padding: '2rem', color: '#94a3b8', fontWeight: 700 }}>
                        ไม่พบข้อความความรู้สึกที่ตรงกับคำค้นหาของคุณครับ 🔍
                      </div>
                    );
                  }

                  return (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.8rem',
                      maxHeight: '380px',
                      overflowY: 'auto',
                      paddingRight: '0.4rem',
                      textAlign: 'left'
                    }}>
                      {filteredFeedbacks.map((fb, fIdx) => {
                        const timeStr = new Date(fb.created_at).toLocaleString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                        return (
                          <div
                            key={fb.id}
                            style={{
                              background: '#ffffff',
                              border: '2.5px solid #1e293b',
                              borderRadius: '14px',
                              padding: '0.9rem 1.2rem',
                              boxShadow: '3px 3px 0px #000',
                              position: 'relative',
                              color: '#1e293b',
                              transition: 'transform 0.15s, box-shadow 0.15s',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.4rem'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Heart size={14} color="#ff2e93" fill="#ff2e93" />
                                <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#1e293b' }}>
                                  น้อง {fb.student_name}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 800, background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '0.05rem 0.35rem', borderRadius: '4px', marginLeft: '0.2rem' }}>
                                  # {filteredFeedbacks.length - fIdx}
                                </span>
                              </div>
                            </div>

                            <div style={{
                              fontSize: '0.92rem',
                              fontWeight: 600,
                              color: '#475569',
                              lineHeight: '1.5',
                              whiteSpace: 'pre-wrap',
                              paddingLeft: '1.2rem',
                              borderLeft: '2px solid #ff2e93'
                            }}>
                              {fb.message}
                            </div>

                            <div style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              color: '#94a3b8',
                              textAlign: 'right',
                              marginTop: '0.2rem'
                            }}>
                              🗓️ {timeStr} น.
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}

        {/* Tab Content 2: QR Code */}
        {feedbackTab === 'qr' && (
          <div style={{ animation: 'toastIn 0.2s ease-out both' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem', marginTop: 0 }}>
              สแกน QR Code ด้านล่างเพื่อเริ่มเขียนแชร์ข้อความและความรู้สึกดีๆ ได้เลยครับ!
            </p>

            <div style={{
              background: '#fff', padding: '1rem', borderRadius: '16px',
              display: 'inline-block', border: '3px solid #000',
              boxShadow: '5px 5px 0px #000', marginBottom: '1.5rem'
            }}>
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://candy-fawn-chi.vercel.app/feedback"
                alt="Feedback QR Code"
                style={{ width: '260px', height: '260px', display: 'block' }}
              />
            </div>

            <div style={{
              background: '#0f172a', padding: '0.8rem 1.2rem', borderRadius: '12px',
              border: '2px solid #334155', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', width: '100%', boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ff2e93', fontWeight: 800, fontSize: '0.95rem' }}>
                <MessageSquare size={16} /> ยอดส่งความรู้สึกเรียลไทม์
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>
                <span style={{ color: '#ff2e93' }}>{feedbackCount}</span> ข้อความ
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Toast notifications ───────────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none'
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#fff',
            border: '2.5px solid #ff2e93',
            boxShadow: '0 8px 30px rgba(255, 46, 147, 0.25), 4px 4px 0px #000',
            padding: '1rem 1.2rem',
            borderRadius: '16px',
            minWidth: '280px',
            maxWidth: '350px',
            fontFamily: "'Kanit', sans-serif",
            fontWeight: 800,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            pointerEvents: 'auto',
            animation: 'toastIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both'
          }}>
            <div style={{
              background: 'rgba(255, 46, 147, 0.15)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Heart size={16} color="#ff2e93" fill="#ff2e93" />
            </div>
            <div style={{ flex: 1 }}>{t.message}</div>
          </div>
        ))}
      </div>

      {/* Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
