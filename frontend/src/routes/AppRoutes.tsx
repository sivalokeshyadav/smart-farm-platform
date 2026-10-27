import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { appRoutesConfig } from './routeConfig';
import { ROUTES } from './paths';

export const AppRoutes: React.FC = () => {
  const { activeRole, token } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = Boolean(token);

  return (
    <Routes>
      {appRoutesConfig.map((route) => {
        // Login route is always accessible
        if (route.path === ROUTES.LOGIN) {
          return <Route key={route.path} path={route.path} element={route.element} />;
        }

        // Catch-all or not-found
        if (route.path === '*') {
          return <Route key={route.path} path={route.path} element={route.element} />;
        }

        // If not logged in, redirect to login page
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
    </Routes>
  );
};

export default AppRoutes;
