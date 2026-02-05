import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';import Layout from './components/Layout';
import Dashboard from './pages/app/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RecoverPassword from './pages/auth/RecoverPassword';
import CardsPage from './pages/app/Cards';
import RegisterPurchase from './pages/app/RegisterPurchase';
import HistoryPage from './pages/app/History';
import ProfilePage from './pages/app/Profile';
import NotificationsPage from './pages/app/Notifications';
import PromotionsPage from './pages/app/Promotions';
import AdminBrands from './pages/admin/Brands';
import AdminPrograms from './pages/admin/Programs';
import AdminPromotions from './pages/admin/Promotions';
import SearchResults from './pages/app/SearchResults';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ToastContext';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
 return (
    <ThemeProvider>
      <ToastProvider> {/* <--- 2. ADICIONE O PROVIDER AQUI */}
        <Router>
          <Routes>
            {/* ROTAS PÚBLICAS */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/recover" element={<RecoverPassword />} />

            {/* ROTAS PRIVADAS */}
            <Route path="/" element={
              <PrivateRoute>
                <Layout><Dashboard /></Layout>
              </PrivateRoute>
            } />

            <Route path="/cards" element={
              <PrivateRoute>
                <Layout><CardsPage /></Layout>
              </PrivateRoute>
            } />

            <Route path="/new-purchase" element={
              <PrivateRoute>
                <Layout><RegisterPurchase /></Layout>
              </PrivateRoute>
            } />

            <Route path="/history" element={
              <PrivateRoute>
                <Layout><HistoryPage /></Layout>
              </PrivateRoute>
            } />

            <Route path="/promotions" element={
              <PrivateRoute>
                <Layout><PromotionsPage /></Layout>
              </PrivateRoute>
            } />

            <Route path="/profile" element={
              <PrivateRoute>
                <Layout><ProfilePage /></Layout>
              </PrivateRoute>
            } />

            <Route path="/notifications" element={
              <PrivateRoute>
                <Layout><NotificationsPage /></Layout>
              </PrivateRoute>
            } />
            
            <Route path="/search" element={
              <PrivateRoute>
                <Layout><SearchResults /></Layout>
              </PrivateRoute>
            } />

            {/* ROTAS DE ADMIN */}
            <Route path="/admin/brands" element={
              <PrivateRoute>
                <Layout><AdminBrands /></Layout>
              </PrivateRoute>
            } />

            <Route path="/admin/programs" element={
              <PrivateRoute>
                <Layout><AdminPrograms /></Layout>
              </PrivateRoute>
            } />

            <Route path="/admin/new-promotion" element={
              <PrivateRoute>
                <Layout><AdminPromotions /></Layout>
              </PrivateRoute>
            } />

            {/* Rota curinga */}
            <Route path="*" element={<Navigate to="/" replace />} />
            
          </Routes>
        </Router>
      </ToastProvider> {/* <--- FECHA O PROVIDER AQUI */}
    </ThemeProvider>
  );
};

export default App;