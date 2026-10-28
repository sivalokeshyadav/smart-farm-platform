import React from 'react';
import { Box } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './app/store';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AppRoutes } from './routes';
import { ROUTES } from './routes/paths';

export const App: React.FC = () => {
  const location = useLocation();
  const { token } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = Boolean(token);

  // Hide Navbar & Footer on auth pages or when user is not logged in
  const isAuthPage =
    !isAuthenticated ||
    location.pathname === ROUTES.LOGIN ||
    location.pathname === ROUTES.REGISTER ||
    location.pathname === '/login/' ||
    location.pathname === '/register/';

  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg="gray.50">
      {!isAuthPage && <Navbar />}
      <Box as="main" flex="1">
        <AppRoutes />
      </Box>
      {!isAuthPage && <Footer />}
    </Box>
  );
};

export default App;
