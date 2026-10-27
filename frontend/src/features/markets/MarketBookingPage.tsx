import { BookingQRCodeModal } from '../../components/BookingQRCodeModal';
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
  FormControl,
  FormLabel,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Progress,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Divider,
  Alert,
  AlertIcon,
  Tag,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { translations } from '../../i18n/translations';
import {
  useGetMarketsQuery,
  useGetMarketLocationsQuery,
  useGetMarketAvailabilityQuery,
} from './services/marketApi';
import { ALL_INDIA_LOCATIONS } from '../../constants/allIndiaLocations';
import {
  useCreateBookingMutation,
  useGetMyBookingsQuery,
  useCancelBookingMutation,
} from '../bookings/services/bookingApi';
import {
  Building2,
  Calendar,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Copy,
  AlertTriangle,
  FileCheck,
  Search,
  MapPin,
  Filter,
  RotateCcw,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { StatusTimeline } from '../../components/StatusTimeline';
import { FeedbackModal, ReviewsList } from '../../components/FeedbackSystem';

export const MarketBookingPage: React.FC = () => {
  const { language, user } = useSelector((state: RootState) => state.auth);
  const t = translations[language];
  const toast = useToast();

  const todayStr = new Date().toISOString().split('T')[0];

  // Cascading Location & Search filters
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedMarketId, setSelectedMarketId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('Cotton');
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>('09:00-11:00');
  const [vehicleType, setVehicleType] = useState<string>('Tractor');
  const [quantity, setQuantity] = useState<number>(15);

  const [bookingResult, setBookingResult] = useState<any>(null);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [feedbackBooking, setFeedbackBooking] = useState<any | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Query location hierarchy { State: [Districts...] }
  const { data: serverLocations, isLoading: locationsLoading } = useGetMarketLocationsQuery();
  const locations = serverLocations && Object.keys(serverLocations).length > 0 ? serverLocations : ALL_INDIA_LOCATIONS;

  // Query markets based on cascading filters and search
  const { data: markets, isLoading: marketsLoading } = useGetMarketsQuery({
    state: selectedState || undefined,
    district: selectedDistrict || undefined,
    search: searchQuery || undefined,
  });

  // Calculate effective selected market
  const effectiveMarketId =
    (selectedMarketId && markets?.some((m: any) => m.id === selectedMarketId)
      ? selectedMarketId
      : markets?.[0]?.id) || '';

  const activeMarket = markets?.find((m: any) => m.id === effectiveMarketId);

  const { data: slots, isLoading: slotsLoading } = useGetMarketAvailabilityQuery(
    { marketId: effectiveMarketId, date: selectedDate, commodity: selectedCommodity },
    { skip: !effectiveMarketId }
  );

  const { data: myBookings } = useGetMyBookingsQuery();
  const [createBooking, { isLoading: isBooking }] = useCreateBookingMutation();
  const [cancelBooking] = useCancelBookingMutation();

  const handleStateChange = (stateVal: string) => {
    setSelectedState(stateVal);
    setSelectedDistrict('');
    setSelectedMarketId('');
  };

  const handleDistrictChange = (distVal: string) => {
    setSelectedDistrict(distVal);
    setSelectedMarketId('');
  };

  const handleResetFilters = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setSearchQuery('');
    setSelectedMarketId('');
  };

  const handleBookSlot = async () => {
    if (!effectiveMarketId) {
      toast({ title: 'Please select a market yard', status: 'warning', duration: 3000 });
      return;
    }

    try {
      const idempotencyKey = `WEB_${user?.id}_${Date.now()}`;
      const res = await createBooking({
        marketId: effectiveMarketId,
        date: selectedDate,
        slotTime: selectedSlotTime,
        commodity: selectedCommodity,
        vehicleType,
        estimatedQuantityQuintals: Number(quantity),
        idempotencyKey,
        channel: 'WEB',
        farmerName: user?.name,
        farmerPhone: user?.phone,
      }).unwrap();

      setBookingResult(res);
      onOpen();
      toast({
        title: language === 'te' ? 'స్లాట్ విజయవంతంగా బుక్ అయింది!' : 'Slot booked successfully!',
        description: `Token: ${res.bookingReference}`,
        status: 'success',
        duration: 5000,
      });
    } catch (err: any) {
      toast({
        title: 'Booking failed',
        description: err?.data?.detail || 'Capacity exhausted or error reserving slot',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleCopyToken = () => {
    if (bookingResult?.bookingReference) {
      navigator.clipboard.writeText(bookingResult.bookingReference);
      toast({ title: 'Token copied to clipboard', status: 'info', duration: 2000 });
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(id).unwrap();
        toast({ title: 'Booking cancelled', status: 'info', duration: 3000 });
      } catch (err: any) {
        toast({ title: 'Cancellation failed', description: err?.data?.detail, status: 'error' });
      }
    }
  };

  // Available districts for chosen state
  const availableDistricts = selectedState && locations?.[selectedState] ? locations[selectedState] : [];

  return (
    <Container maxW="1400px" py={8}>
      {/* Header */}
      <Box mb={8}>
        <HStack spacing={2} mb={2}>
          <Flex bg="brand.50" color="brand.700" p={2} borderRadius="lg">
            <Building2 size={24} />
          </Flex>
          <Badge colorScheme="green" px={2.5} py={0.5} borderRadius="full">
            All-India APMC Network
          </Badge>
          <Badge colorScheme="purple" px={2} py={0.5} borderRadius="full" variant="subtle">
            25+ Mandis Across 10 States
          </Badge>
        </HStack>
        <Heading size="lg" color="gray.800" fontWeight="800">
          {t.markets.title}
        </Heading>
        <Text color="gray.600" mt={1}>
          {t.markets.subtitle}
        </Text>
      </Box>

      {/* Location Filter & Search Toolbar */}
      <Card bg="white" shadow="sm" borderRadius="xl" mb={6} borderWidth="1px" borderColor="gray.100">
        <CardBody p={5}>
          <VStack align="stretch" spacing={4}>
            <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
              <HStack spacing={2}>
                <Filter size={18} color="#2e7d32" />
                <Text fontWeight="bold" fontSize="sm" color="gray.800">
                  {language === 'te' ? 'భారతదేశ మార్కెట్ శోధన & ఫిల్టర్లు' : 'All-India Market Search & Cascading Filter'}
                </Text>
              </HStack>
              {(selectedState || selectedDistrict || searchQuery) && (
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="gray"
                  leftIcon={<RotateCcw size={14} />}
                  onClick={handleResetFilters}
                >
                  {language === 'te' ? 'ఫిల్టర్లు క్లియర్ చేయి' : 'Reset Filters'}
                </Button>
              )}
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              {/* 1. Select State */}
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.600" mb={1}>
                  1. {language === 'te' ? 'రాష్ట్రం ఎంచుకోండి' : 'Select State'}
                </FormLabel>
                <Select
                  placeholder="All States (అన్ని రాష్ట్రాలు)"
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  size="md"
                  borderRadius="lg"
                  bg="gray.50"
                  borderColor="gray.200"
                >
                  {locations &&
                    Object.keys(locations)
                      .sort()
                      .map((st) => (
                        <option key={st} value={st}>
                          {st} ({locations[st].length} Districts)
                        </option>
                      ))}
                </Select>
              </FormControl>

              {/* 2. Select District */}
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.600" mb={1}>
                  2. {language === 'te' ? 'జిల్లా ఎంచుకోండి' : 'Select District'}
                </FormLabel>
                <Select
                  placeholder={
                    selectedState
                      ? 'All Districts in ' + selectedState
                      : 'Select a State First'
                  }
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  isDisabled={!selectedState}
                  size="md"
                  borderRadius="lg"
                  bg="gray.50"
                  borderColor="gray.200"
                >
                  {availableDistricts.map((dst) => (
                    <option key={dst} value={dst}>
                      {dst}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* 3. Search Bar */}
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.600" mb={1}>
                  3. {language === 'te' ? 'పేరు లేదా కోడ్‌తో శోధించండి' : 'Search by Name / City / Code'}
                </FormLabel>
                <InputGroup size="md">
                  <InputLeftElement pointerEvents="none">
                    <Search size={16} color="#718096" />
                  </InputLeftElement>
                  <Input
                    placeholder="e.g. Vashi, Azadpur, Adoni, Cotton..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    borderRadius="lg"
                    bg="gray.50"
                    borderColor="gray.200"
                  />
                </InputGroup>
              </FormControl>
            </SimpleGrid>

            {/* Filter Results Summary */}
            <Flex justify="space-between" align="center" fontSize="xs" color="gray.600" pt={1}>
              <HStack spacing={2} wrap="wrap">
                <Text fontWeight="600">
                  {marketsLoading ? 'Loading mandis...' : `Found ${markets?.length || 0} APMC Market Yards`}
                </Text>
                {selectedState && (
                  <Tag size="sm" colorScheme="blue" borderRadius="full">
                    State: {selectedState}
                  </Tag>
                )}
                {selectedDistrict && (
                  <Tag size="sm" colorScheme="teal" borderRadius="full">
                    District: {selectedDistrict}
                  </Tag>
                )}
                {searchQuery && (
                  <Tag size="sm" colorScheme="orange" borderRadius="full">
                    Keyword: "{searchQuery}"
                  </Tag>
                )}
              </HStack>
            </Flex>
          </VStack>
        </CardBody>
      </Card>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
        {/* Booking Form (2 Columns) */}
        <Box gridColumn={{ lg: 'span 2' }}>
          <Card bg="white" shadow="sm" borderRadius="xl">
            <CardBody p={6}>
              <Stack spacing={6}>
                {/* 1. Market Selection Dropdown */}
                <FormControl isRequired>
                  <FormLabel fontWeight="bold" fontSize="sm">
                    {t.markets.selectMarket} ({markets?.length || 0} Mandis Available)
                  </FormLabel>
                  <Select
                    value={effectiveMarketId}
                    onChange={(e) => setSelectedMarketId(e.target.value)}
                    size="lg"
                    borderRadius="lg"
                    borderColor="brand.400"
                    borderWidth="2px"
                    focusBorderColor="brand.600"
                  >
                    {markets?.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.name} - {m.district}, {m.state}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* Selected Market Info Card */}
                {activeMarket && (
                  <Card bg="brand.50" borderWidth="1px" borderColor="brand.200" borderRadius="lg">
                    <CardBody p={4}>
                      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3} fontSize="xs">
                        <HStack align="start">
                          <MapPin size={16} color="#2e7d32" />
                          <Box>
                            <Text fontWeight="bold" color="brand.900">
                              {activeMarket.location || activeMarket.name}
                            </Text>
                            <Text color="gray.600">{activeMarket.district}, {activeMarket.state}</Text>
                          </Box>
                        </HStack>
                        <HStack align="start">
                          <Clock size={16} color="#2e7d32" />
                          <Box>
                            <Text fontWeight="bold" color="brand.900">Operating Hours</Text>
                            <Text color="gray.600">{activeMarket.operatingHours || '06:00 - 18:00'}</Text>
                          </Box>
                        </HStack>
                        <HStack align="start">
                          <Truck size={16} color="#2e7d32" />
                          <Box>
                            <Text fontWeight="bold" color="brand.900">Daily Capacity</Text>
                            <Text color="gray.600">{activeMarket.totalDailyCapacityVehicles || 300} Vehicles/Day</Text>
                          </Box>
                        </HStack>
                      </SimpleGrid>
                      {activeMarket.commoditiesSupported && activeMarket.commoditiesSupported.length > 0 && (
                        <HStack spacing={1.5} mt={3} wrap="wrap">
                          <Text fontSize="2xs" fontWeight="bold" color="gray.600">
                            Commodities:
                          </Text>
                          {activeMarket.commoditiesSupported.map((c: string) => (
                            <Tag size="sm" colorScheme="green" key={c} fontSize="2xs">
                              {c}
                            </Tag>
                          ))}
                        </HStack>
                      )}
                    </CardBody>
                  </Card>
                )}

                {/* 2. Date and Commodity */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="bold" fontSize="sm">
                      {t.markets.selectDate}
                    </FormLabel>
                    <Input
                      type="date"
                      value={selectedDate}
                      min={todayStr}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      size="lg"
                      borderRadius="lg"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="bold" fontSize="sm">
                      {t.markets.selectCrop}
                    </FormLabel>
                    <Select
                      value={selectedCommodity}
                      onChange={(e) => setSelectedCommodity(e.target.value)}
                      size="lg"
                      borderRadius="lg"
                    >
                      <option value="Cotton">Cotton</option>
                      <option value="Paddy">Paddy / వరి (BPT 5204)</option>
                      <option value="Groundnut">Groundnut / వేరుశనగ</option>
                      <option value="Chili">Red Chili</option>
                      <option value="Bengal Gram">Bengal Gram</option>
                      <option value="Maize">Maize</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>

                {/* 3. Slot Availability Cards */}
                <Box>
                  <FormLabel fontWeight="bold" fontSize="sm" mb={3}>
                    {t.markets.selectSlot} (Capacity Availability)
                  </FormLabel>
                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                    {slotsLoading ? (
                      <Text fontSize="sm" color="gray.500">Loading slot capacity...</Text>
                    ) : slots && slots.length > 0 ? (
                      slots.map((s: any) => {
                        const isSelected = selectedSlotTime === s.slotTime;
                        const booked = s.bookedVehicles || 0;
                        const total = s.totalCapacityVehicles || 25;
                        const available = Math.max(0, total - booked);
                        const isFull = available <= 0;
                        const percent = Math.min(100, Math.round((booked / total) * 100));

                        return (
                          <Card
                            key={s.slotTime}
                            cursor={isFull ? 'not-allowed' : 'pointer'}
                            onClick={() => !isFull && setSelectedSlotTime(s.slotTime)}
                            borderWidth="2px"
                            borderColor={isSelected ? 'brand.500' : 'gray.200'}
                            bg={isFull ? 'gray.100' : isSelected ? 'green.50' : 'white'}
                            opacity={isFull ? 0.6 : 1}
                            transition="all 0.15s"
                          >
                            <CardBody p={4}>
                              <Flex justify="space-between" align="center" mb={2}>
                                <HStack spacing={1.5}>
                                  <Clock size={16} />
                                  <Text fontWeight="bold" fontSize="sm">
                                    {s.slotTime}
                                  </Text>
                                </HStack>
                                <Badge colorScheme={isFull ? 'red' : available < 5 ? 'orange' : 'green'} fontSize="2xs">
                                  {isFull ? 'FULL' : `${available} Left`}
                                </Badge>
                              </Flex>

                              <Progress
                                value={percent}
                                size="xs"
                                colorScheme={percent > 80 ? 'orange' : 'green'}
                                borderRadius="full"
                                mb={2}
                              />

                              <Text fontSize="2xs" color="gray.500">
                                {booked} / {total} vehicles booked
                              </Text>
                            </CardBody>
                          </Card>
                        );
                      })
                    ) : (
                      <Text fontSize="sm" color="gray.500">No slots defined for this day.</Text>
                    )}
                  </SimpleGrid>
                </Box>

                {/* 4. Vehicle & Quantity */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontWeight="bold" fontSize="sm">
                      {t.markets.vehicleType}
                    </FormLabel>
                    <Select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      size="lg"
                    >
                      <option value="Tractor">Tractor Trolley</option>
                      <option value="Mini Truck">Mini Truck</option>
                      <option value="Auto">Goods Auto</option>
                      <option value="Bullock Cart">Bullock Cart</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="bold" fontSize="sm">
                      {t.markets.estQuantity}
                    </FormLabel>
                    <Input
                      type="number"
                      value={quantity}
                      min={1}
                      max={200}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      size="lg"
                    />
                  </FormControl>
                </SimpleGrid>

                {/* Submit Action */}
                <Button
                  size="lg"
                  colorScheme="brand"
                  onClick={handleBookSlot}
                  isLoading={isBooking}
                  loadingText="Reserving atomically..."
                  fontWeight="bold"
                  h="56px"
                >
                  {t.markets.bookNow}
                </Button>
              </Stack>
            </CardBody>
          </Card>
        </Box>

        {/* Right Column: Active Tokens & Rules */}
        <Box>
          <Stack spacing={6}>
            {/* Rules card */}
            <Card bg="brand.50" borderWidth="1px" borderColor="brand.200">
              <CardBody p={5}>
                <Heading size="xs" color="brand.800" textTransform="uppercase" mb={3}>
                  All-India APMC Gate Entry Rules & Guidelines
                </Heading>
                <VStack align="stretch" spacing={2} fontSize="xs" color="brand.900">
                  <HStack align="start">
                    <CheckCircle2 size={16} color="#1b5e20" />
                    <Text>Arrival within designated 2-hour window ensures priority weighing bridge access.</Text>
                  </HStack>
                  <HStack align="start">
                    <CheckCircle2 size={16} color="#1b5e20" />
                    <Text>Show booking token on your phone or say the reference code at the security gate.</Text>
                  </HStack>
                  <HStack align="start">
                    <CheckCircle2 size={16} color="#1b5e20" />
                    <Text>No Aadhaar or smartphone mandatory; SMS token or handwritten note is fully accepted.</Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* My Existing Bookings List */}
            <Box>
              <Heading size="sm" mb={3} color="gray.800">
                {language === 'te' ? 'మీ నమోదిత టోకెన్లు' : 'Your Booked Tokens'}
              </Heading>

              {myBookings && myBookings.length > 0 ? (
                <Stack spacing={4}>
                  {myBookings.map((b: any) => {
                    const isExpanded = expandedBookingId === (b.id || b.bookingReference);
                    return (
                      <Card key={b.id || b.bookingReference} bg="white" shadow="xs" borderWidth="1px" borderRadius="xl">
                        <CardBody p={4}>
                          <Flex justify="space-between" align="center" mb={2}>
                            <Badge colorScheme={b.status === 'COMPLETED' ? 'green' : b.status === 'ENTERED' ? 'teal' : b.status === 'BOOKED' ? 'blue' : 'gray'}>
                              {b.status}
                            </Badge>
                            <Text fontSize="2xs" color="gray.500">{b.date}</Text>
                          </Flex>

                          <Text fontSize="sm" fontWeight="800" color="brand.800" letterSpacing="wider">
                            {b.bookingReference}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            {b.commodity} ({b.estimatedQuantityQuintals} Qtl) • {b.slotTime}
                          </Text>

                          {/* Toggle Status Timeline */}
                          <HStack spacing={2} mt={3} wrap="wrap">
                            <Button
                              size="xs"
                              leftIcon={<QrCode size={13} />}
                              colorScheme="brand"
                              variant="solid"
                              onClick={() => {
                                setBookingResult(b);
                                onOpen();
                              }}
                            >
                              View QR Pass
                            </Button>

                            <Button
                              size="xs"
                              variant="outline"
                              colorScheme="brand"
                              onClick={() => setExpandedBookingId(isExpanded ? null : (b.id || b.bookingReference))}
                            >
                              {isExpanded ? 'Hide Status History' : 'Track Status History'}
                            </Button>

                            {b.status === 'COMPLETED' && (
                              <Button
                                size="xs"
                                colorScheme="orange"
                                onClick={() => setFeedbackBooking(b)}
                              >
                                Review Experience
                              </Button>
                            )}

                            {['BOOKED', 'CONFIRMED'].includes(b.status) && (
                              <Button
                                size="xs"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleCancelBooking(b.id || b.bookingReference)}
                              >
                                Cancel Slot
                              </Button>
                            )}
                          </HStack>

                          {/* Status Timeline Expansion */}
                          {isExpanded && (
                            <Box mt={4} pt={3} borderTopWidth="1px" borderColor="gray.100">
                              <StatusTimeline
                                currentStatus={b.status}
                                statusHistory={b.statusHistory}
                                moduleName="Market-Yard Booking"
                              />
                            </Box>
                          )}
                        </CardBody>
                      </Card>
                    );
                  })}
                </Stack>
              ) : (
                <Text fontSize="xs" color="gray.500">No active bookings yet.</Text>
              )}
            </Box>
          </Stack>
        </Box>
      </SimpleGrid>

      {/* Verified Market Yard Reviews */}
      <Box mt={10}>
        <ReviewsList
          module="MARKET_BOOKING"
          title={
            language === 'te'
              ? 'రైతుల మార్కెట్ యార్డ్ సమీక్షలు (అన్ని భారతీయ మార్కెట్లు)'
              : 'Verified Farmer Weighbridge & Gate Entry Reviews (All-India APMCs)'
          }
        />
      </Box>

      {/* Post-Completion Feedback Modal */}
      {feedbackBooking && (
        <FeedbackModal
          isOpen={!!feedbackBooking}
          onClose={() => setFeedbackBooking(null)}
          module="MARKET_BOOKING"
          transactionId={feedbackBooking.id || feedbackBooking.bookingReference}
          targetId={feedbackBooking.marketId}
          targetName={feedbackBooking.marketName || 'APMC Agricultural Market Yard'}
        />
      )}

      {/* Booking Confirmation QR Pass Modal */}
      <BookingQRCodeModal
        isOpen={isOpen}
        onClose={onClose}
        booking={bookingResult}
        moduleType="MARKET"
      />
    </Container>
  );
};

// Helper option component to avoid chakra typing noise
const OptionValue: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => (
  <option value={value}>{children}</option>
);
