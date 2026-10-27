import React from 'react';
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from './paths';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const lang = useSelector((state: any) => state.auth?.language || 'te');

  return (
    <Box maxW="600px" mx="auto" py={16} px={4} textAlign="center">
      <VStack spacing={6}>
        <Heading size="2xl" color="brand.600">404</Heading>
        <Heading size="md" color="gray.700">
          {lang === 'te' ? 'పేజీ కనుగొనబడలేదు' : 'Page Not Found'}
        </Heading>
        <Text color="gray.500">
          {lang === 'te'
            ? 'మీరు కోరిన పేజీ అందుబాటులో లేదు లేదా మార్చబడింది.'
            : 'The page you requested does not exist or has been moved.'}
        </Text>
        <Button
          colorScheme="brand"
          size="lg"
          onClick={() => navigate(ROUTES.HOME)}
        >
          {lang === 'te' ? 'హోమ్‌పేజీకి తిరిగి వెళ్లండి' : 'Return to Home'}
        </Button>
      </VStack>
    </Box>
  );
};
