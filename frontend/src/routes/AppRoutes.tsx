import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { appRoutesConfig } from './routeConfig';
import { ROUTES } from './paths';
import { LoginPage } from '../features/auth/LoginPage';
import { NotFoundPage } from './NotFoundPage';

export const AppRoutes: React.FC = () => {
  const { activeRole, token } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = Boolean(token);

  // When unauthenticated, show Login or Register directly on all landing URLs
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage defaultTab="login" />} />
        <Route path={ROUTES.REGISTER} element={<LoginPage defaultTab="register" />} />
        <Route path="/" element={<LoginPage defaultTab="login" />} />
        <Route path="/login/" element={<LoginPage defaultTab="login" />} />
        <Route path="/register/" element={<LoginPage defaultTab="register" />} />
        <Route path="*" element={<LoginPage defaultTab="login" />} />
      </Routes>
    );
  }

  // When logged in, provide role-authenticated routing
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<Navigate to={ROUTES.HOME} replace />} />
      <Route path={ROUTES.REGISTER} element={<Navigate to={ROUTES.HOME} replace />} />
      <Route path="/login/" element={<Navigate to={ROUTES.HOME} replace />} />
      <Route path="/register/" element={<Navigate to={ROUTES.HOME} replace />} />

      {appRoutesConfig
        .filter((r) => r.path !== ROUTES.LOGIN && r.path !== '*' && (r.path as string) !== ROUTES.REGISTER)
        .map((route) => {
          const isAllowed = !route.allowedRoles || route.allowedRoles.includes(activeRole);
          return (
            <Route
              key={route.path}
              path={route.path}
              element={isAllowed ? route.element : <Navigate to={ROUTES.HOME} replace />}
            />
          );
        })}

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
