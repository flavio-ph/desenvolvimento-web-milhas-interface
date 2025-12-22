
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import CardsPage from './pages/CardsPage';
import RegisterPurchase from './pages/RegisterPurchase';
import HistoryPage from './pages/HisotoryPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import PromotionsPage from './pages/PromotionsPage';
import AdminBrands from './pages/AdminBrands';
import AdminPrograms from './pages/AdminPrograms';
import AdminPromotions from './pages/AdminPromotions';
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
          <Route path="/promotions" element={<Layout><PromotionsPage /></Layout>} />
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
