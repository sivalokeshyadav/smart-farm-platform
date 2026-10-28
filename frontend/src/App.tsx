import React from 'react';
import { Box } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AppRoutes } from './routes';
import { ROUTES } from './routes/paths';

export const App: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === ROUTES.LOGIN || location.pathname === '/login/';

  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg="gray.50">
      {!isLoginPage && <Navbar />}
      <Box as="main" flex="1">
        <AppRoutes />
      </Box>
      {!isLoginPage && <Footer />}
    </Box>
  );
};

export default App;
