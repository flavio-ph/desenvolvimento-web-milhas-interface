
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import CardsPage from './pages/CardsPage';
import RegisterPurchase from './pages/RegisterPurchase';
import HistoryPage from './pages/HisotoryPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import NotificationsPage from './pages/NotificationsPage.tsx';
import AdminBrands from './pages/AdminBrands.tsx';
import AdminPrograms from './pages/AdminPrograms.tsx';
import AdminPromotions from './pages/AdminPromotions.tsx';
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recover" element={<Login />} /> {/* Placeholder for recover */}
          <Route path="/reset-password" element={<Login />} /> {/* Placeholder for reset */}

          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/cards" element={<Layout><CardsPage /></Layout>} />
          <Route path="/new-purchase" element={<Layout><RegisterPurchase /></Layout>} />
          <Route path="/history" element={<Layout><HistoryPage /></Layout>} />
          <Route path="/promotions" element={<Layout><Dashboard /></Layout>} /> {/* Using Dashboard as placeholder */}
          <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
          <Route path="/notifications" element={<Layout><NotificationsPage /></Layout>} />
          
          <Route path="/admin/brands" element={<Layout><AdminBrands /></Layout>} />
          <Route path="/admin/programs" element={<Layout><AdminPrograms /></Layout>} />
          <Route path="/admin/new-promotion" element={<Layout><AdminPromotions /></Layout>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
