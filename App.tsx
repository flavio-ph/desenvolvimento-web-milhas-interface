
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import CardsPage from './pages/CardsPage';
import RegisterPurchase from './pages/RegisterPurchase';
import { ThemeProvider } from './context/ThemeContext';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
      <h2 className="text-2xl font-bold">Soon</h2>
    </div>
    <h1 className="text-2xl font-bold dark:text-white">{title}</h1>
    <p className="text-slate-500 dark:text-slate-400">Esta página está em desenvolvimento como parte do protótipo.</p>
  </div>
);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/recover" element={<Login />} />
          <Route path="/reset-password" element={<Login />} />

          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/cards" element={<Layout><CardsPage /></Layout>} />
          <Route path="/new-purchase" element={<Layout><RegisterPurchase /></Layout>} />
          <Route path="/history" element={<Layout><PlaceholderPage title="Extrato de Pontos" /></Layout>} />
          <Route path="/promotions" element={<Layout><PlaceholderPage title="Promoções Disponíveis" /></Layout>} />
          <Route path="/profile" element={<Layout><PlaceholderPage title="Perfil do Usuário" /></Layout>} />
          <Route path="/notifications" element={<Layout><PlaceholderPage title="Central de Notificações" /></Layout>} />
          
          <Route path="/admin/brands" element={<Layout><PlaceholderPage title="Gestão de Bandeiras" /></Layout>} />
          <Route path="/admin/programs" element={<Layout><PlaceholderPage title="Gestão de Programas" /></Layout>} />
          <Route path="/admin/new-promotion" element={<Layout><PlaceholderPage title="Cadastro de Promoções" /></Layout>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
