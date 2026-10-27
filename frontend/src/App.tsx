import React from 'react';
import { Box } from '@chakra-ui/react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AppRoutes } from './routes';

export const App: React.FC = () => {
  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg="gray.50">
      <Navbar />
      <Box as="main" flex="1">
        <AppRoutes />
      </Box>
      <Footer />
    </Box>
  );
};

export default App;
