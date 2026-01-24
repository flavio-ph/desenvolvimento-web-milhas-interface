
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from '../src/pages/app/Dashboard';
import Login from '../src/pages/auth/Login';
import Register from '../src/pages/auth/Register';
import RecoverPassword from '../src/pages/auth/RecoverPassword';
import CardsPage from '../src/pages/app/Cards';
import RegisterPurchase from '../src/pages/app/RegisterPurchase';
import HistoryPage from '../src/pages/app/History';
import ProfilePage from '../src/pages/app/Profile';
import NotificationsPage from '../src/pages/app/Notifications';
import PromotionsPage from '../src/pages/app/Promotions';
import AdminBrands from '../src/pages/admin/Brands';
import AdminPrograms from './pages/admin/Programs';
import AdminPromotions from '../src/pages/admin/Promotions';
import SearchResults from '../src/pages/app/SearchResults';
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recover" element={<RecoverPassword />} />

          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/cards" element={<Layout><CardsPage /></Layout>} />
          <Route path="/new-purchase" element={<Layout><RegisterPurchase /></Layout>} />
          <Route path="/history" element={<Layout><HistoryPage /></Layout>} />
          <Route path="/promotions" element={<Layout><PromotionsPage /></Layout>} />
          <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
          <Route path="/notifications" element={<Layout><NotificationsPage /></Layout>} />
          <Route path="/search" element={<Layout><SearchResults /></Layout>} />
          
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
