import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Ordem das rotas de autenticação.
 * Navegação para uma rota de índice maior → slide para a esquerda (forward).
 * Navegação para uma rota de índice menor → slide para a direita (backward).
 */
const AUTH_ROUTE_ORDER: Record<string, number> = {
  '/login': 0,
  '/register': 1,
  '/recover': 2,
};

type Direction = 'forward' | 'backward';

interface AuthTransitionProps {
  children: React.ReactNode;
}

const AuthTransition: React.FC<AuthTransitionProps> = ({ children }) => {
  const location = useLocation();
  const prevPathRef = useRef<string>(location.pathname);
  const [direction, setDirection] = useState<Direction>('forward');
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const prev = prevPathRef.current;
    const current = location.pathname;

    if (prev !== current) {
      const prevIndex = AUTH_ROUTE_ORDER[prev] ?? 0;
      const currentIndex = AUTH_ROUTE_ORDER[current] ?? 0;
      setDirection(currentIndex >= prevIndex ? 'forward' : 'backward');
      setAnimKey(k => k + 1);
      prevPathRef.current = current;
    }
  }, [location.pathname]);

  const animClass =
    direction === 'forward' ? 'auth-transition-forward' : 'auth-transition-backward';

  return (
    <div key={animKey} className={`auth-transition-wrapper ${animClass}`}>
      {children}
    </div>
  );
};

export default AuthTransition;
