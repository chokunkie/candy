-- 1. Create Teams Table
CREATE TABLE public.teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pin TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Stations Table
CREATE TABLE public.stations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  staff TEXT NOT NULL,
  cost INTEGER NOT NULL,
  reward INTEGER NOT NULL,
  secret_key TEXT NOT NULL,
  base_type TEXT NOT NULL DEFAULT 'normal' -- 'normal', 'ghost', 'lottery'
);

-- 3. Create Transactions Table
CREATE TABLE public.transactions (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES public.teams(id),
  station_id TEXT NOT NULL REFERENCES public.stations(id),
  action_type TEXT NOT NULL, -- 'PLAY' (จ่ายแต้ม), 'REWARD' (ได้แต้ม)
  amount INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'PENDING', 'CONFIRMED'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Settings Table (For Hide Score feature)
CREATE TABLE public.settings (
  id INTEGER PRIMARY KEY,
  hide_scores BOOLEAN NOT NULL DEFAULT FALSE
);

-- 5. Insert Default Teams
INSERT INTO public.teams (id, name, pin, points) VALUES
('TEAM01', 'ครองแครงปิ๊นาศ', '5938', 280),
('TEAM02', 'บ้านท้ายบ้าบิ่น', '8417', 260),
('TEAM03', 'บ้านครองแครงกะทิสด', '2693', 180),
('TEAM04', 'บ้านขนมเปียกปูน', '7351', 250),
('TEAM05', 'บ้านบัวลอยไข่หวาน', '4826', 270),
('TEAM06', 'บ้านโรตีท้ายบังบ่าว', '9164', 240),
('TEAM07', 'บ้านsugar', '3572', 240),
('TEAM08', 'บ้านมาการอง อุอิ', '6209', 280),
('TEAM09', 'บ้านครองแครง', '1785', 250),
('TEAM10', 'บ้านลอดช่อง', '4931', 260);

-- 6. Insert Stations with Specific Types
INSERT INTO public.stations (id, name, staff, cost, reward, secret_key, base_type) VALUES
('ST01', 'ฐาน 1 : TARGET 24 (เกม 24)', 'อุ๋ม, ปังปอน', 2, 5, '9385', 'normal'),
('ST02', 'ฐาน 2 : SYSTEM SYNC (ย้ายขวดน้ำ)', 'ชมพู, พัดชา, หลิน, เนตร', 5, 15, '2749', 'normal'),
('ST03', 'ฐาน 3 : DATA LEAK (ส่งข้อมูลลับ)', 'ปืน, นิว, พลอย', 3, 10, '6183', 'normal'),
('ST04', 'ฐาน 4 : รับจ๊อบกู้ชีพ (ฐานผี)', 'พีช', 0, 0, '4827', 'ghost'),
('ST05', 'ฐาน 5 : หนังสือพิมพ์สื่อรัก', 'ซีมอล, เมสส์ซมุก', 2, 5, '7501', 'normal'),
('ST06', 'ฐาน 6 : ตีโป่งนุ่งไป', 'แก้ม, จ๋า', 2, 6, '3946', 'normal'),
('ST07', 'ฐาน 7 : XO วิ่งไว', 'อิงอร, แก้ม', 2, 6, '8162', 'normal'),
('ST08', 'ฐาน 8 : จะรอดหรือจะร่วง', 'ยูง, หวาน, โบว์, จูมุก', 1, 3, '5093', 'normal'),
('ST09', 'ฐาน 9 : ล็อตเตอร์รี่เสี่ยงดวง', 'โชกุน, มิ้น', 1, 0, '2674', 'lottery'),
('ST10', 'ฐาน 10 : เด้งดึ้งดันลูก', 'แพรว, นิว', 2, 5, '8430', 'normal'),
('ST11', 'ฐาน 11 : ส่งปิงปองด้วยช้อน', 'ปาล์ม, สายน้ำ, เอแคลร์, เบส', 5, 15, '1596', 'normal'),
('ST12', 'ฐาน 12 : ศึกชิงเก้าอี้สายฟ้า', 'เปรี้ยว, น้ำอิง, เอิร์น', 2, 10, '7248', 'normal');

-- 7. Insert Default Setting
INSERT INTO public.settings (id, hide_scores) VALUES (1, FALSE);

-- 8. Setup RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON public.teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.stations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.settings FOR ALL USING (true) WITH CHECK (true);

-- 9. Create Indexes for optimization
CREATE INDEX IF NOT EXISTS idx_transactions_team_id ON public.transactions(team_id);
CREATE INDEX IF NOT EXISTS idx_transactions_station_id ON public.transactions(station_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- 10. Create Feedback Table for camp feelings
CREATE TABLE IF NOT EXISTS public.feedback (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES public.teams(id),
  pros TEXT NOT NULL,
  cons TEXT NOT NULL,
  gained TEXT NOT NULL,
  message_to_staff TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON public.feedback FOR ALL USING (true) WITH CHECK (true);
