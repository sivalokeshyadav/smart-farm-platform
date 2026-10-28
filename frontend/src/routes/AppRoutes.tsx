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

  return (
    <Routes>
      {/* Explicit Login Routes */}
      <Route
        path={ROUTES.LOGIN}
        element={!isAuthenticated ? <LoginPage /> : <Navigate to={ROUTES.HOME} replace />}
      />
      <Route
        path="/login/"
        element={<Navigate to={ROUTES.LOGIN} replace />}
      />

      {/* Authenticated application routes */}
      {appRoutesConfig
        .filter((r) => r.path !== ROUTES.LOGIN && r.path !== '*')
        .map((route) => {
          if (!isAuthenticated) {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={<Navigate to={ROUTES.LOGIN} replace />}
              />
            );
          }

          // If logged in, check role permissions
          const isAllowed = !route.allowedRoles || route.allowedRoles.includes(activeRole);
          return (
            <Route
              key={route.path}
              path={route.path}
              element={isAllowed ? route.element : <Navigate to={ROUTES.HOME} replace />}
            />
          );
        })}

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
