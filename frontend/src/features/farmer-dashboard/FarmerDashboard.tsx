import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Stack,
  Flex,
  Badge,
  Button,
  HStack,
  VStack,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { translations } from '../../i18n/translations';
import {
  useGetWeatherQuery,
  useGetMandiPricesQuery,
} from './services/dashboardApi';
import { useGetMyBookingsQuery } from '../bookings/services/bookingApi';
import { ROUTES } from '../../routes';
import { ROLE_ROUTE_PERMISSIONS } from '../../routes/routeConfig';
import {
  Building2,
  Phone,
  Warehouse,
  ShoppingBag,
  FileText,
  Calculator,
  Activity,
  UserCheck,
  LifeBuoy,
  Sliders,
  CloudSun,
  TrendingUp,
  ArrowRight,
  Clock,
  Calendar,
  CheckCircle,
  HeartPulse,
} from 'lucide-react';

export const FarmerDashboard: React.FC = () => {
  const { language, user, activeRole } = useSelector((state: RootState) => state.auth);
  const t = translations[language];

  const { data: weather, isLoading: weatherLoading } = useGetWeatherQuery('Kurnool');
  const { data: prices, isLoading: pricesLoading } = useGetMandiPricesQuery();
  const { data: myBookings, isLoading: bookingsLoading } = useGetMyBookingsQuery();

  const actionCards = [
    {
      title: language === 'te' ? 'రోజువారీ మార్కెట్ ధరలు (data.gov.in)' : 'Daily Mandi Prices (data.gov.in)',
      desc: language === 'te' ? 'data.gov.in నుండి అన్ని పంటల రోజువారీ లైవ్ మార్కెట్ ధరలు & మద్దతు ధరలు' : 'data.gov.in daily live APMC market prices, modal rates & MSP tracking across 25+ crops',
      icon: TrendingUp,
      path: ROUTES.PRICES,
      colorScheme: 'green',
      badge: 'data.gov.in Live',
    },
    {
      title: t.nav.markets,
      desc: language === 'te' ? 'కర్నూలు AMC లో ట్రాక్టర్ స్లాట్ బుకింగ్ చేసుకోండి' : 'Reserve market yard arrival slot atomically to avoid queues',
      icon: Building2,
      path: ROUTES.MARKETS,
      colorScheme: 'green',
      badge: language === 'te' ? 'ముఖ్యం' : 'High Priority',
    },
    {
      title: t.nav.fieldServices,
      desc: language === 'te' ? 'పశువైద్యుడు మరియు క్షేత్ర సాంకేతిక సహాయకుల సందర్శన' : 'Request farm visits from veterinarians & equipment technicians',
      icon: HeartPulse,
      path: ROUTES.FIELD_SERVICES,
      colorScheme: 'red',
      badge: 'Veterinary & Field',
    },
    {
      title: t.nav.godowns,
      desc: language === 'te' ? 'రాష్ట్ర గిడ్డంగులలో పంట నిల్వ బస్తాల స్థలం బుక్ చేయండి' : 'Reserve warehouse space for grains with e-NWR eligibility',
      icon: Warehouse,
      path: ROUTES.GODOWNS,
      colorScheme: 'blue',
      badge: 'APSWC Storage',
    },
    {
      title: t.nav.schemes,
      desc: language === 'te' ? 'రైతు భరోసా, పిఎం-కిసాన్ ముందస్తు అర్హత & సహాయం' : 'PM-KISAN, Rythu Bharosa, Solar & Dairy subsidy assistance',
      icon: FileText,
      path: ROUTES.SCHEMES,
      colorScheme: 'orange',
      badge: 'Welfare Schemes',
    },
    {
      title: t.nav.marketplace,
      desc: language === 'te' ? 'లైసెన్స్ పొందిన డీలర్ల నుండి నాణ్యమైన విత్తనాలు, ఎరువులు' : 'Buy certified seeds & fertilizers from licensed dealers',
      icon: ShoppingBag,
      path: ROUTES.MARKETPLACE,
      colorScheme: 'purple',
      badge: 'Verified Dealers',
    },
    {
      title: t.nav.cropHealth,
      desc: language === 'te' ? 'ఆకు ఫోటోతో పంట తెగులు గుర్తింపు & సేంద్రీయ పరిష్కారాలు' : 'Screen crop diseases early from leaf photos with KVK advice',
      icon: Activity,
      path: ROUTES.CROP_HEALTH,
      colorScheme: 'red',
      badge: 'AI Screening',
    },
    {
      title: t.nav.ivrSimulator,
      desc: language === 'te' ? 'స్మార్ట్‌ఫోన్ లేకుండా బటన్ల ఫోన్‌తో స్లాట్ బుక్ చేయండి' : 'Dial-in voice service for basic keypad phones',
      icon: Phone,
      path: ROUTES.IVR,
      colorScheme: 'teal',
      badge: 'Inclusive Voice',
    },
    {
      title: t.nav.calculators,
      desc: language === 'te' ? 'ఎకరాలు, సెంట్లు మార్పిడి & సాగు లాభనష్టాల లెక్కలు' : 'Acres-Cents conversion, ANGRAU dosages & gross margins',
      icon: Calculator,
      path: ROUTES.CALCULATORS,
      colorScheme: 'cyan',
      badge: 'Regional Standards',
    },
    {
      title: t.nav.staffPortal,
      desc: language === 'te' ? 'మార్కెట్ గేటు వద్ద రైతుల టోకెన్ల తనిఖీ మరియు నమోదు' : 'Verify farmer booking tokens at market gate for arrival check-in',
      icon: UserCheck,
      path: ROUTES.STAFF,
      colorScheme: 'amber',
      badge: 'Market Staff Gate',
    },
    {
      title: t.nav.admin,
      desc: language === 'te' ? 'జిల్లా కార్యకలాపాల గణాంకాలు & ఆడిట్ రికార్డులు' : 'User role approvals, feedback moderation & audit trail',
      icon: Sliders,
      path: ROUTES.ADMIN,
      colorScheme: 'gray',
      badge: 'District Admin',
    },
  ];

  return (
    <Container maxW="1400px" py={6}>
      {/* Welcome Greeting & Active Pilot District Header */}
      <Box
        bgGradient="linear(to-r, brand.800, brand.600)"
        color="white"
        p={{ base: 6, md: 8 }}
        borderRadius="2xl"
        shadow="lg"
        mb={8}
      >
        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
          <Box>
            <HStack spacing={2} mb={2}>
              <Badge bg="accent.400" color="gray.900" px={3} py={1} fontSize="xs" fontWeight="bold">
                {t.pilotBadge}
              </Badge>
              <Text fontSize="xs" color="brand.100">
                All-India APMC Network: 25+ Mandis Across 10 States
              </Text>
            </HStack>
            <Heading size="lg" fontWeight="800">
              {t.dashboard.welcome}
            </Heading>
            <Text color="brand.100" mt={1} fontSize="sm">
              {t.dashboard.districtSubtitle}
            </Text>
          </Box>

          <HStack spacing={3} wrap="wrap">
            <Button
              as={RouterLink}
              to="/markets"
              size="lg"
              bg="white"
              color="brand.800"
              _hover={{ bg: 'brand.50' }}
              leftIcon={<Building2 size={20} />}
              shadow="md"
            >
              {language === 'te' ? 'స్లాట్ బుక్ చేయండి' : 'Book Market Slot'}
            </Button>
            <Button
              as={RouterLink}
              to="/ivr"
              size="lg"
              variant="outline"
              color="white"
              borderColor="whiteAlpha.400"
              _hover={{ bg: 'whiteAlpha.200' }}
              leftIcon={<Phone size={20} />}
            >
              {language === 'te' ? 'ఫోన్ బుకింగ్ (IVR)' : 'Phone / IVR'}
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Role-Adaptive Quick Action Banner */}
      {activeRole !== 'FARMER' && (
        <Alert
          status="info"
          borderRadius="2xl"
          mb={8}
          bg="blue.50"
          borderWidth="1px"
          borderColor="blue.300"
          p={4}
        >
          <AlertIcon color="blue.600" />
          <Box flex="1">
            <HStack justify="space-between" wrap="wrap" gap={2}>
              <Box>
                <Text fontWeight="bold" fontSize="sm" color="blue.950">
                  Active Role Perspective: {t.roles[activeRole] || activeRole}
                </Text>
                <Text fontSize="xs" color="blue.800" mt={0.5}>
                  {activeRole === 'VETERINARIAN' && 'You have provider permissions to manage farm visits, arrival logs, and medical consultation notes.'}
                  {activeRole === 'MARKET_STAFF' && 'You have gatekeeper permissions to scan QR tokens and check in tractor arrivals at APMC gates.'}
                  {activeRole === 'GODOWN_OPERATOR' && 'You have warehouse permissions to verify grain storage allocations and bag capacity.'}
                  {activeRole === 'HELP_DESK_OPERATOR' && 'You have operator permissions to review applicant documents and advance scheme assistance cases.'}
                  {activeRole === 'ADMIN' && 'You have district administrator permissions to approve user role requests and audit operations.'}
                  {(activeRole.includes('BUYER') || activeRole.includes('SELLER')) && 'You have commercial trading permissions to publish listings, respond to offers, and confirm deliveries.'}
                </Text>
              </Box>

              <Button
                as={RouterLink}
                to={
                  activeRole === 'VETERINARIAN' ? ROUTES.FIELD_SERVICES :
                  activeRole === 'MARKET_STAFF' ? ROUTES.STAFF :
                  activeRole === 'HELP_DESK_OPERATOR' ? ROUTES.SCHEMES :
                  activeRole === 'ADMIN' ? ROUTES.ADMIN :
                  ROUTES.MARKETPLACE
                }
                colorScheme="blue"
                size="sm"
                fontWeight="bold"
              >
                Go to {activeRole === 'VETERINARIAN' ? 'Field Services' : activeRole === 'MARKET_STAFF' ? 'Gate Scanner' : activeRole === 'HELP_DESK_OPERATOR' ? 'Schemes Desk' : activeRole === 'ADMIN' ? 'Admin Console' : 'Marketplace'}
              </Button>
            </HStack>
          </Box>
        </Alert>
      )}

      {/* Grid: Real-time Weather & Mandi Prices Sandbox */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
        {/* Weather Card */}
        <Card bg="white" shadow="sm" borderWidth="1px" borderColor="blue.100">
          <CardBody>
            <Flex justify="space-between" align="center" mb={4}>
              <HStack spacing={2}>
                <Flex bg="blue.50" color="blue.600" p={2} borderRadius="lg">
                  <CloudSun size={22} />
                </Flex>
                <Box>
                  <Heading size="xs" textTransform="uppercase" color="blue.700">
                    {t.dashboard.weatherTitle}
                  </Heading>
                  <Text fontSize="xs" color="gray.500">
                    Source: {weather?.source || 'IMD National Agrometeorology'}
                  </Text>
                </Box>
              </HStack>
              <Badge colorScheme="blue" variant="subtle">
                {weather?.mandal || 'Local'} Area
              </Badge>
            </Flex>

            {weatherLoading ? (
              <Flex justify="center" p={4}><Spinner color="blue.500" /></Flex>
            ) : (
              <Stack spacing={4}>
                <Flex justify="space-between" align="center" bg="blue.50" p={4} borderRadius="xl">
                  <Box>
                    <Text fontSize="3xl" fontWeight="800" color="blue.900">
                      {weather?.current?.temperatureC}°C
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color="blue.700">
                      {language === 'te' ? weather?.current?.conditionTe : weather?.current?.condition}
                    </Text>
                  </Box>
                  <VStack align="end" spacing={0.5} fontSize="xs" color="blue.800">
                    <Text>Humidity: {weather?.current?.humidityPercent}%</Text>
                    <Text>Wind: {weather?.current?.windSpeedKmh} km/h</Text>
                    <Text>Rainfall: {weather?.current?.rainfallMm} mm</Text>
                  </VStack>
                </Flex>

                <HStack justify="space-between" spacing={2} overflowX="auto" pt={1}>
                  {weather?.forecast?.map((f: any, idx: number) => (
                    <Box key={idx} flex="1" textAlign="center" bg="gray.50" p={2} borderRadius="lg" minW="80px">
                      <Text fontSize="xs" fontWeight="bold" color="gray.700">
                        {language === 'te' ? f.dayTe : f.day}
                      </Text>
                      <Text fontSize="sm" fontWeight="bold" color="blue.600">
                        {f.tempMax}° / {f.tempMin}°
                      </Text>
                      <Text fontSize="2xs" color="gray.500">
                        Rain: {f.rainChance}
                      </Text>
                    </Box>
                  ))}
                </HStack>

                <Text fontSize="xs" color="gray.600" fontStyle="italic">
                  Advisory: {weather?.advisory}
                </Text>
              </Stack>
            )}
          </CardBody>
        </Card>

        {/* Mandi Prices Card */}
        <Card bg="white" shadow="sm" borderWidth="1px" borderColor="green.100">
          <CardBody>
            <Flex justify="space-between" align="center" mb={4}>
              <HStack spacing={2}>
                <Flex bg="green.50" color="green.600" p={2} borderRadius="lg">
                  <TrendingUp size={22} />
                </Flex>
                <Box>
                  <Heading size="xs" textTransform="uppercase" color="green.700">
                    {t.dashboard.mandiTitle}
                  </Heading>
                  <Text fontSize="xs" color="gray.500">
                    Source: data.gov.in (Agmarknet Live Gateway)
                  </Text>
                </Box>
              </HStack>
              <HStack spacing={1}>
                <Badge colorScheme="green" variant="subtle" fontSize="2xs">
                  data.gov.in
                </Badge>
                <Badge colorScheme="purple" variant="outline" fontSize="2xs">
                  {prices?.totalRecords || 25}+ Crops
                </Badge>
              </HStack>
            </Flex>

            {pricesLoading ? (
              <Flex justify="center" p={4}><Spinner color="green.500" /></Flex>
            ) : (
              <Box overflowX="auto">
                <Table size="sm" variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th fontSize="2xs">Commodity</Th>
                      <Th fontSize="2xs" isNumeric>Modal Price</Th>
                      <Th fontSize="2xs" isNumeric>MSP</Th>
                      <Th fontSize="2xs">Trend</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {prices?.commodities?.slice(0, 5).map((item: any, idx: number) => (
                      <Tr key={idx} _hover={{ bg: 'green.50' }}>
                        <Td fontWeight="semibold" fontSize="xs">
                          {language === 'te' ? item.commodityTe : item.commodity}
                          <Text fontSize="2xs" color="gray.500">{item.variety || item.market}</Text>
                        </Td>
                        <Td isNumeric fontWeight="bold" fontSize="xs" color="green.700">
                          ₹{item.modalPrice}
                          <Text fontSize="2xs" color="gray.500">/ Qtl</Text>
                        </Td>
                        <Td isNumeric fontSize="xs" color="gray.600">
                          {item.msp ? `₹${item.msp}` : '—'}
                        </Td>
                        <Td>
                          <Badge
                            fontSize="2xs"
                            colorScheme={item.trend === 'UP' ? 'green' : item.trend === 'STEADY' ? 'blue' : 'orange'}
                          >
                            {item.trend}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                <Flex justify="space-between" align="center" mt={3} pt={2} borderTopWidth="1px" borderColor="gray.100">
                  <Text fontSize="xs" color="gray.500">
                    Arrival Date: {prices?.date || 'Today'}
                  </Text>
                  <Button
                    as={RouterLink}
                    to={ROUTES.PRICES}
                    size="xs"
                    colorScheme="green"
                    variant="ghost"
                    rightIcon={<ArrowRight size={12} />}
                  >
                    {language === 'te' ? 'అన్ని 25+ పంటల ధరలు చూడండి' : 'Explore All 25+ Crops & Mandis'}
                  </Button>
                </Flex>
              </Box>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Action Modules Grid */}
      <Box mb={10}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md" color="gray.800">
            {t.dashboard.quickActions}
          </Heading>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
          {actionCards
            .filter((card) => {
              const permitted = ROLE_ROUTE_PERMISSIONS[card.path];
              return !permitted || permitted.includes(activeRole);
            })
            .map((card, idx) => {
              const CardIcon = card.icon;
            return (
              <Card
                key={idx}
                as={RouterLink}
                to={card.path}
                cursor="pointer"
                transition="all 0.2s"
                _hover={{ transform: 'translateY(-3px)', shadow: 'md', borderColor: 'brand.500' }}
              >
                <CardBody p={5}>
                  <Flex justify="space-between" align="start" mb={3}>
                    <Flex bg="brand.50" color="brand.700" p={3} borderRadius="xl">
                      <CardIcon size={24} />
                    </Flex>
                    <Badge colorScheme="brand" variant="subtle" fontSize="2xs">
                      {card.badge}
                    </Badge>
                  </Flex>

                  <Heading size="sm" mb={1} color="gray.800">
                    {card.title}
                  </Heading>
                  <Text fontSize="xs" color="gray.600" lineHeight="1.5" mb={4}>
                    {card.desc}
                  </Text>

                  <HStack spacing={1} color="brand.600" fontSize="xs" fontWeight="bold">
                    <Text>{language === 'te' ? 'ప్రారంభించండి' : 'Open Module'}</Text>
                    <ArrowRight size={14} />
                  </HStack>
                </CardBody>
              </Card>
            );
          })}
        </SimpleGrid>
      </Box>

      {/* My Active Bookings Section */}
      <Box>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md" color="gray.800">
            {t.dashboard.activeBookings}
          </Heading>
          <Button as={RouterLink} to="/markets" size="sm" variant="outline" colorScheme="brand">
            {t.dashboard.viewAll}
          </Button>
        </Flex>

        {bookingsLoading ? (
          <Flex justify="center" p={8}><Spinner color="brand.500" /></Flex>
        ) : myBookings && myBookings.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {myBookings.slice(0, 3).map((b: any) => (
              <Card key={b.id || b.bookingReference} bg="white" borderWidth="1px" borderColor="brand.200">
                <CardBody p={4}>
                  <Flex justify="space-between" align="center" mb={2}>
                    <Badge colorScheme="green" fontSize="xs" px={2} py={0.5}>
                      {b.status}
                    </Badge>
                    <Text fontSize="2xs" color="gray.500">
                      Channel: {b.channel}
                    </Text>
                  </Flex>

                  <Box bg="gray.50" p={2} borderRadius="md" my={2} textAlign="center" borderWidth="1px" borderStyle="dashed" borderColor="brand.300">
                    <Text fontSize="2xs" color="gray.500">BOOKING TOKEN / టోకెన్</Text>
                    <Text fontSize="md" fontWeight="800" color="brand.800" letterSpacing="widest">
                      {b.bookingReference}
                    </Text>
                  </Box>

                  <VStack align="stretch" spacing={1} fontSize="xs" color="gray.700">
                    <HStack justify="space-between">
                      <Text color="gray.500">Market:</Text>
                      <Text fontWeight="semibold">{b.marketName}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.500">Commodity:</Text>
                      <Text fontWeight="semibold">{b.commodity} ({b.estimatedQuantityQuintals} Qtl)</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.500">Slot & Date:</Text>
                      <Text fontWeight="semibold">{b.date} | {b.slotTime}</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Alert status="info" borderRadius="xl" bg="green.50" borderColor="green.200" borderWidth="1px">
            <AlertIcon color="green.600" />
            <Box fontSize="sm">
              <Text fontWeight="bold">{t.dashboard.noBookings}</Text>
              <Text fontSize="xs" color="gray.600" mt={0.5}>
                {language === 'te' 
                  ? 'మార్కెట్ యార్డ్‌కు పంటను తీసుకురావడానికి ముందుగా స్లాట్ బుక్ చేసుకోండి.'
                  : 'Avoid waiting in long queues at APMC market yards. Generate your arrival pass in 30 seconds.'}
              </Text>
            </Box>
          </Alert>
        )}
      </Box>
    </Container>
  );
};
