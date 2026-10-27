import React from 'react';
import { Box, Container, Text, Stack, HStack, Link, Badge, Divider } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { translations } from '../i18n/translations';
import { ShieldCheck, PhoneCall, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language } = useSelector((state: RootState) => state.auth);
  const t = translations[language];

  return (
    <Box bg="gray.900" color="gray.300" mt={16} py={10} borderTopWidth="4px" borderColor="brand.500">
      <Container maxW="1400px">
        <Stack spacing={6}>
          <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }}>
            <Box>
              <HStack spacing={2} mb={1}>
                <Text fontSize="lg" fontWeight="bold" color="white">
                  {t.appName}
                </Text>
                <Badge colorScheme="green" variant="subtle" fontSize="xs">
                  Pilot v1.0
                </Badge>
              </HStack>
              <Text fontSize="sm" color="gray.400">
                {t.tagline}
              </Text>
            </Box>

            <HStack spacing={4} wrap="wrap">
              <HStack spacing={1} color="brand.300" fontSize="sm">
                <PhoneCall size={16} />
                <Text fontWeight="semibold">Toll-Free Helpline: 1800-425-3536</Text>
              </HStack>
              <HStack spacing={1} color="accent.400" fontSize="sm">
                <Info size={16} />
                <Text>Kisan Call Centre: 1800-180-1551</Text>
              </HStack>
            </HStack>
          </Stack>

          <Divider borderColor="gray.800" />

          {/* Statutory and Ethical Disclaimers */}
          <Box bg="gray.800" p={4} borderRadius="lg" fontSize="xs" color="gray.400" lineHeight="1.6">
            <HStack align="start" spacing={2}>
              <Box color="accent.400" mt={0.5}>
                <ShieldCheck size={16} />
              </Box>
              <Text>
                <strong>STATUTORY NOTICE & NATIONAL APMC PORTAL:</strong> This platform is designed for agricultural facilitation, nationwide APMC slot booking, and digitized farm services across India. Market-yard slot allocations operate under respective State Agricultural Produce Market Committee rules. Government scheme pre-checks are indicative guidance only and do not constitute official sanctions, which remain solely within the purview of respective State Governments and Central Ministries. AI crop-health screenings provide non-prescriptive advisory benchmarks; always consult your local Krishi Vigyan Kendra (KVK) or extension officer for chemical plant protection.
              </Text>
            </HStack>
          </Box>

          <Text fontSize="xs" color="gray.500" textAlign="center">
            © 2026 Smart Farmer Platform | All-India Agricultural & APMC Portal. Developed for farmer convenience, fair queue management, and digital transparency.
          </Text>
        </Stack>
      </Container>
    </Box>
  );
};
