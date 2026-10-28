import React, { useState } from 'react';
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
  Input,
  InputGroup,
  InputRightElement,
  useToast,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  Sliders,
  CloudSun,
  TrendingUp,
  ArrowRight,
  HeartPulse,
  QrCode,
  ShieldAlert,
  Search,
} from 'lucide-react';

export const FarmerDashboard: React.FC = () => {
  const { language, user, activeRole } = useSelector((state: RootState) => state.auth);
  const t = translations[language];
  const navigate = useNavigate();
  const toast = useToast();

  const [quickToken, setQuickToken] = useState('');

  const { data: weather, isLoading: weatherLoading } = useGetWeatherQuery('Kurnool');
  const { data: prices, isLoading: pricesLoading } = useGetMandiPricesQuery();
  const { data: myBookings, isLoading: bookingsLoading } = useGetMyBookingsQuery(undefined, {
    skip: activeRole !== 'FARMER' && activeRole !== 'CROP_SELLER',
  });

  const handleQuickTokenSearch = () => {
    if (!quickToken.trim()) {
      toast({ title: 'Please enter a valid token number', status: 'warning' });
      return;
    }
    navigate(`${ROUTES.STAFF}?token=${encodeURIComponent(quickToken.trim().toUpperCase())}`);
  };

  const actionCards = [
    {
      title: 'Daily Mandi Prices',
      desc: 'Live APMC market prices, modal rates & MSP tracking across 25+ crops',
      icon: TrendingUp,
      path: ROUTES.PRICES,
      colorScheme: 'green',
      badge: 'data.gov.in Live',
    },
    {
      title: 'Slot Booking',
      desc: 'Reserve market yard arrival slot atomically to avoid queues',
      icon: Building2,
      path: ROUTES.MARKETS,
      colorScheme: 'green',
      badge: 'APMC Market',
    },
    {
      title: 'Staff Gate Pass & Scanner',
      desc: 'Verify farmer QR codes and tokens at market or godown gate',
      icon: UserCheck,
      path: ROUTES.STAFF,
      colorScheme: 'amber',
      badge: 'Gate Scanner',
    },
    {
      title: 'Godown Storage',
      desc: 'Reserve warehouse space for grains with e-NWR eligibility',
      icon: Warehouse,
      path: ROUTES.GODOWNS,
      colorScheme: 'blue',
      badge: 'APSWC Storage',
    },
    {
      title: 'Government Schemes',
      desc: 'PM-KISAN, Rythu Bharosa, Solar & Dairy subsidy assistance',
      icon: FileText,
      path: ROUTES.SCHEMES,
      colorScheme: 'orange',
      badge: 'Welfare Schemes',
    },
    {
      title: 'Field Services & Vet Visits',
      desc: 'Request farm visits from veterinarians & equipment technicians',
      icon: HeartPulse,
      path: ROUTES.FIELD_SERVICES,
      colorScheme: 'red',
      badge: 'Veterinary & Field',
    },
    {
      title: 'Crop Marketplace',
      desc: 'Buy certified seeds & fertilizers from licensed dealers',
      icon: ShoppingBag,
      path: ROUTES.MARKETPLACE,
      colorScheme: 'purple',
      badge: 'Verified Dealers',
    },
    {
      title: 'Crop Health AI',
      desc: 'Screen crop diseases early from leaf photos with KVK advice',
      icon: Activity,
      path: ROUTES.CROP_HEALTH,
      colorScheme: 'red',
      badge: 'AI Screening',
    },
    {
      title: 'Agri Calculators',
      desc: 'GPS Land Area (Walk & Pin), ANGRAU dosages & gross margins',
      icon: Calculator,
      path: ROUTES.CALCULATORS,
      colorScheme: 'cyan',
      badge: 'Regional Standards',
    },
    {
      title: 'Phone / IVR',
      desc: 'Dial-in voice service for basic keypad phones',
      icon: Phone,
      path: ROUTES.IVR,
      colorScheme: 'teal',
      badge: 'Inclusive Voice',
    },
    {
      title: 'Admin Console',
      desc: 'User role approvals, feedback moderation & audit trail',
      icon: Sliders,
      path: ROUTES.ADMIN,
      colorScheme: 'gray',
      badge: 'District Admin',
    },
  ];

  // Helper to determine Hero Title and Subtitle based on role
  const getHeroDetails = () => {
    const userName = user?.name || 'User';
    switch (activeRole) {
      case 'MARKET_STAFF':
        return {
          title: `APMC Mandi Gate & Check-in Portal`,
          subtitle: `Logged in as: ${userName} | Kurnool APMC Market Yard Staff`,
          badgeText: 'APMC Market Staff Operations',
        };
      case 'GODOWN_OPERATOR':
        return {
          title: `APSWC State Warehouse Storage Portal`,
          subtitle: `Logged in as: ${userName} | Warehouse Manager`,
          badgeText: 'APSWC Godown Operations',
        };
      case 'HELP_DESK_OPERATOR':
        return {
          title: `Rythu Bharosa Kendra (RBK) Citizen Assistance Desk`,
          subtitle: `Logged in as: ${userName} | Scheme & Help-Desk Operator`,
          badgeText: 'RBK Helpdesk Desk',
        };
      case 'ADMIN':
        return {
          title: `District Administration & Oversight Console`,
          subtitle: `Logged in as: ${userName} | District Collectorate Admin`,
          badgeText: 'District Administration',
        };
      case 'VETERINARIAN':
        return {
          title: `Veterinary Care & Farm Health Portal`,
          subtitle: `Logged in as: ${userName} | Senior Veterinarian`,
          badgeText: 'Veterinary Healthcare',
        };
      case 'CROP_BUYER':
      case 'CROP_SELLER':
        return {
          title: `Agricultural Produce Trading Portal`,
          subtitle: `Logged in as: ${userName} | APMC Grain Trader`,
          badgeText: 'Commodity Trading',
        };
      case 'LIVESTOCK_BUYER':
      case 'LIVESTOCK_SELLER':
        return {
          title: `Livestock & Dairy Breeding Portal`,
          subtitle: `Logged in as: ${userName} | Livestock Producer`,
          badgeText: 'Dairy & Cattle Hub',
        };
      case 'EQUIPMENT_BUYER':
      case 'EQUIPMENT_SELLER':
        return {
          title: `Agri Machinery & Equipment Rental Console`,
          subtitle: `Logged in as: ${userName} | Machinery Provider`,
          badgeText: 'Machinery Hub',
        };
      case 'DELIVERY_WORKER':
        return {
          title: `Agri Logistics & Field Delivery Portal`,
          subtitle: `Logged in as: ${userName} | Field Logistics Assistant`,
          badgeText: 'Logistics Operations',
        };
      case 'FARMER':
      default:
        return {
          title: t.dashboard.welcome,
          subtitle: `${userName} | ${t.dashboard.districtSubtitle}`,
          badgeText: t.pilotBadge,
        };
    }
  };

  const hero = getHeroDetails();

  return (
    <Container maxW="1400px" py={6}>
      {/* Dynamic Role-Aware Hero Header */}
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
                {hero.badgeText}
              </Badge>
              <Text fontSize="xs" color="brand.100">
                Active Perspective: {t.roles[activeRole] || activeRole}
              </Text>
            </HStack>
            <Heading size="lg" fontWeight="800">
              {hero.title}
            </Heading>
            <Text color="brand.100" mt={1} fontSize="sm">
              {hero.subtitle}
            </Text>
          </Box>

          {/* Role-Specific Action Buttons in Header */}
          <HStack spacing={3} wrap="wrap">
            {activeRole === 'FARMER' && (
              <>
                <Button
                  as={RouterLink}
                  to={ROUTES.MARKETS}
                  size="md"
                  bg="white"
                  color="brand.800"
                  _hover={{ bg: 'brand.50' }}
                  leftIcon={<Building2 size={18} />}
                  shadow="md"
                  fontWeight="bold"
                >
                  Book Market Slot
                </Button>
                <Button
                  as={RouterLink}
                  to={ROUTES.IVR}
                  size="md"
                  variant="outline"
                  color="white"
                  borderColor="whiteAlpha.400"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  leftIcon={<Phone size={18} />}
                >
                  Phone / IVR
                </Button>
              </>
            )}

            {activeRole === 'MARKET_STAFF' && (
              <>
                <Button
                  as={RouterLink}
                  to={ROUTES.STAFF}
                  size="md"
                  bg="white"
                  color="brand.800"
                  _hover={{ bg: 'brand.50' }}
                  leftIcon={<QrCode size={18} />}
                  shadow="md"
                  fontWeight="bold"
                >
                  Open QR Gate Scanner
                </Button>
                <Button
                  as={RouterLink}
                  to={ROUTES.PRICES}
                  size="md"
                  variant="outline"
                  color="white"
                  borderColor="whiteAlpha.400"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  leftIcon={<TrendingUp size={18} />}
                >
                  Today's Mandi Rates
                </Button>
              </>
            )}

            {activeRole === 'GODOWN_OPERATOR' && (
              <>
                <Button
                  as={RouterLink}
                  to={ROUTES.GODOWNS}
                  size="md"
                  bg="white"
                  color="brand.800"
                  _hover={{ bg: 'brand.50' }}
                  leftIcon={<Warehouse size={18} />}
                  shadow="md"
                  fontWeight="bold"
                >
                  Manage Warehouses
                </Button>
                <Button
                  as={RouterLink}
                  to={ROUTES.STAFF}
                  size="md"
                  variant="outline"
                  color="white"
                  borderColor="whiteAlpha.400"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  leftIcon={<QrCode size={18} />}
                >
                  Verify Storage Pass
                </Button>
              </>
            )}

            {activeRole === 'HELP_DESK_OPERATOR' && (
              <>
                <Button
                  as={RouterLink}
                  to={ROUTES.SCHEMES}
                  size="md"
                  bg="white"
                  color="brand.800"
                  _hover={{ bg: 'brand.50' }}
                  leftIcon={<FileText size={18} />}
                  shadow="md"
                  fontWeight="bold"
                >
                  Review Schemes & Subsidies
                </Button>
                <Button
                  as={RouterLink}
                  to={ROUTES.STAFF}
                  size="md"
                  variant="outline"
                  color="white"
                  borderColor="whiteAlpha.400"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  leftIcon={<QrCode size={18} />}
                >
                  Verify Citizen Pass
                </Button>
              </>
            )}

            {activeRole === 'ADMIN' && (
              <>
                <Button
                  as={RouterLink}
                  to={ROUTES.ADMIN}
                  size="md"
                  bg="white"
                  color="brand.800"
                  _hover={{ bg: 'brand.50' }}
                  leftIcon={<Sliders size={18} />}
                  shadow="md"
                  fontWeight="bold"
                >
                  District Admin Console
                </Button>
                <Button
                  as={RouterLink}
                  to={ROUTES.PRICES}
                  size="md"
                  variant="outline"
                  color="white"
                  borderColor="whiteAlpha.400"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  leftIcon={<TrendingUp size={18} />}
                >
                  Mandi Price Radar
                </Button>
              </>
            )}

            {activeRole === 'VETERINARIAN' && (
              <>
                <Button
                  as={RouterLink}
                  to={ROUTES.FIELD_SERVICES}
                  size="md"
                  bg="white"
                  color="brand.800"
                  _hover={{ bg: 'brand.50' }}
                  leftIcon={<HeartPulse size={18} />}
                  shadow="md"
                  fontWeight="bold"
                >
                  Farm Visits & Cattle Care
                </Button>
                <Button
                  as={RouterLink}
                  to={ROUTES.MARKETPLACE}
                  size="md"
                  variant="outline"
                  color="white"
                  borderColor="whiteAlpha.400"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  leftIcon={<ShoppingBag size={18} />}
                >
                  Livestock Market
                </Button>
              </>
            )}

            {(activeRole.includes('BUYER') || activeRole.includes('SELLER')) && (
              <>
                <Button
                  as={RouterLink}
                  to={ROUTES.MARKETPLACE}
                  size="md"
                  bg="white"
                  color="brand.800"
                  _hover={{ bg: 'brand.50' }}
                  leftIcon={<ShoppingBag size={18} />}
                  shadow="md"
                  fontWeight="bold"
                >
                  Agri Marketplace
                </Button>
                <Button
                  as={RouterLink}
                  to={ROUTES.PRICES}
                  size="md"
                  variant="outline"
                  color="white"
                  borderColor="whiteAlpha.400"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  leftIcon={<TrendingUp size={18} />}
                >
                  Daily Mandi Prices
                </Button>
              </>
            )}
          </HStack>
        </Flex>
      </Box>

      {/* Staff / Operator Fast Token Verification Box */}
      {['MARKET_STAFF', 'GODOWN_OPERATOR', 'HELP_DESK_OPERATOR', 'ADMIN'].includes(activeRole) && (
        <Card bg="white" shadow="sm" borderRadius="2xl" borderWidth="1px" borderColor="blue.200" mb={8} p={1}>
          <CardBody>
            <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
              <Box>
                <HStack spacing={2} mb={1}>
                  <QrCode size={20} color="#2B6CB0" />
                  <Heading size="sm" color="blue.900">
                    Quick Pass & Token Verification
                  </Heading>
                  <Badge colorScheme="blue">Gatekeeper</Badge>
                </HStack>
                <Text fontSize="xs" color="gray.600">
                  Enter farmer booking or godown storage token to validate status, weighment, and issue arrival passes.
                </Text>
              </Box>

              <HStack spacing={2} w={{ base: '100%', md: 'auto' }}>
                <InputGroup size="md" maxW={{ base: '100%', md: '320px' }}>
                  <Input
                    placeholder="e.g. KNL-MKT-XXXXX"
                    value={quickToken}
                    onChange={(e) => setQuickToken(e.target.value)}
                    borderRadius="xl"
                    textTransform="uppercase"
                  />
                  <InputRightElement>
                    <Search size={16} color="gray" />
                  </InputRightElement>
                </InputGroup>
                <Button colorScheme="blue" borderRadius="xl" onClick={handleQuickTokenSearch}>
                  Verify
                </Button>
                <Button as={RouterLink} to={ROUTES.STAFF} variant="outline" colorScheme="blue" borderRadius="xl">
                  Camera
                </Button>
              </HStack>
            </Flex>
          </CardBody>
        </Card>
      )}

      {/* Grid: Real-time Weather & Mandi Prices Radar */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
        {/* Weather Card */}
        <Card bg="white" shadow="sm" borderWidth="1px" borderColor="blue.100" borderRadius="2xl">
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
                {weather?.mandal || 'Kurnool'} Area
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
                      {weather?.current?.condition}
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
                        {f.day}
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
        <Card bg="white" shadow="sm" borderWidth="1px" borderColor="green.100" borderRadius="2xl">
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
                          {item.commodity}
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
                    Explore All 25+ Crops & Mandis
                  </Button>
                </Flex>
              </Box>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Role-Specific Action Modules Grid */}
      <Box mb={10}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md" color="gray.800">
            {activeRole === 'FARMER' ? 'Farmer Services & Tools' : `${hero.title} — Quick Actions`}
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
                  borderRadius="2xl"
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
                      <Text>Open Module</Text>
                      <ArrowRight size={14} />
                    </HStack>
                  </CardBody>
                </Card>
              );
            })}
        </SimpleGrid>
      </Box>

      {/* My Active Bookings Section (Only for Farmers and Crop Sellers) */}
      {(activeRole === 'FARMER' || activeRole === 'CROP_SELLER') && (
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
                <Card key={b.id || b.bookingReference} bg="white" borderWidth="1px" borderColor="brand.200" borderRadius="2xl">
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
                      <Text fontSize="2xs" color="gray.500">BOOKING TOKEN</Text>
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
                  Avoid waiting in long queues at APMC market yards. Generate your arrival pass in 30 seconds.
                </Text>
              </Box>
            </Alert>
          )}
        </Box>
      )}
    </Container>
  );
};

export default FarmerDashboard;
