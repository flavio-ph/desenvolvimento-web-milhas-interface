import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ToastContext';
import { UserProvider } from './context/UserContext';

// Lazy loading de todas as páginas para melhor performance
const Dashboard = lazy(() => import('./pages/app/Dashboard'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const RecoverPassword = lazy(() => import('./pages/auth/RecoverPassword'));
const CardsPage = lazy(() => import('./pages/app/Cards'));
const RegisterPurchase = lazy(() => import('./pages/app/RegisterPurchase'));
const HistoryPage = lazy(() => import('./pages/app/History'));
const ProfilePage = lazy(() => import('./pages/app/Profile'));
const NotificationsPage = lazy(() => import('./pages/app/Notifications'));
const PromotionsPage = lazy(() => import('./pages/app/Promotions'));
const AdminBrands = lazy(() => import('./pages/admin/Brands'));
const AdminPrograms = lazy(() => import('./pages/admin/Programs'));
const AdminPromotions = lazy(() => import('./pages/admin/Promotions'));
const SearchResults = lazy(() => import('./pages/app/SearchResults'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));

// Decodifica o payload do JWT para checar expiração
const isTokenValid = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp está em segundos, Date.now() em milissegundos
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');

  if (!token || !isTokenValid(token)) {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Fallback de carregamento reutilizável
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" />
  </div>
);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <UserProvider>
          <Router>
            <Suspense fallback={<PageLoader />}>
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

                {/* Rota 404 */}
                <Route path="*" element={<NotFoundPage />} />

              </Routes>
            </Suspense>
          </Router>
        </UserProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;