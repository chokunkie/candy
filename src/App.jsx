import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StationDetail from './pages/StationDetail';
import AdminStation from './pages/AdminStation';
import Leaderboard from './pages/Leaderboard';
import MasterAdmin from './pages/MasterAdmin';
import Reveal from './pages/Reveal';
import HowToPlay from './pages/HowToPlay';
import RankTCAS from './pages/RankTCAS';
import Feedback from './pages/Feedback';
import CrisisSlides from './pages/CrisisSlides';
import CrisisInfo from './pages/CrisisInfo';
import TeachingsSlides from './pages/TeachingsSlides';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<div className="container"><Login /></div>} />
        <Route path="/dashboard" element={<div className="container"><Dashboard /></div>} />
        <Route path="/station/:id" element={<div className="container"><StationDetail /></div>} />
        <Route path="/admin/:id" element={<div className="container container-large"><AdminStation /></div>} />
        <Route path="/leaderboard" element={<div className="container container-large"><Leaderboard /></div>} />
        <Route path="/master" element={<div className="container container-large"><MasterAdmin /></div>} />
        <Route path="/reveal" element={<Reveal />} />
        <Route path="/how-to-play" element={<div className="container"><HowToPlay /></div>} />
        <Route path="/ranktcas" element={<RankTCAS />} />
        <Route path="/feedback" element={<div className="container"><Feedback /></div>} />
        <Route path="/crisis-slides" element={<div className="container container-large"><CrisisSlides /></div>} />
        <Route path="/crisis-info" element={<div className="container"><CrisisInfo /></div>} />
        <Route path="/teachings-slides" element={<div className="container container-large"><TeachingsSlides /></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
