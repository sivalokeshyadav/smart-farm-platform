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
  Tooltip,
} from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { translations } from '../../i18n/translations';
import {
  useGetGodownsQuery,
  useGetGodownLocationsQuery,
  useReserveGodownMutation,
  useCancelGodownReservationMutation,
  useGetMyGodownReservationsQuery,
} from './services/godownApi';
import { ALL_INDIA_LOCATIONS } from '../../constants/allIndiaLocations';
import {
  Warehouse,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Calendar,
  Clock,
  DollarSign,
  Search,
  MapPin,
  Filter,
  RotateCcw,
  Truck,
  Copy,
  FileCheck,
  PackageCheck,
  QrCode,
} from 'lucide-react';
import { StatusTimeline } from '../../components/StatusTimeline';
import { FeedbackModal, ReviewsList } from '../../components/FeedbackSystem';

export const GodownStoragePage: React.FC = () => {
  const { language, user } = useSelector((state: RootState) => state.auth);
  const t = translations[language];
  const toast = useToast();

  const todayStr = new Date().toISOString().split('T')[0];

  // Cascading Location & Search filters
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Facility and Booking form state
  const [selectedGodownId, setSelectedGodownId] = useState<string>('');
  const [commodity, setCommodity] = useState<string>('Paddy');
  const [bagsCount, setBagsCount] = useState<number>(100);
  const [durationMonths, setDurationMonths] = useState<number>(3);
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [inwardSlot, setInwardSlot] = useState<string>('08:00 AM - 11:00 AM');
  const [vehicleType, setVehicleType] = useState<string>('Tractor Trolley');

  // Modals & expansions
  const [reservationResult, setReservationResult] = useState<any>(null);
  const [expandedReservationId, setExpandedReservationId] = useState<string | null>(null);
  const [feedbackReservation, setFeedbackReservation] = useState<any | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Queries
  const { data: serverLocations } = useGetGodownLocationsQuery();
  const effectiveLocations = serverLocations && Object.keys(serverLocations).length > 0
    ? serverLocations
    : ALL_INDIA_LOCATIONS;

  const { data: godowns, isLoading: godownsLoading } = useGetGodownsQuery({
    state: selectedState || undefined,
    district: selectedDistrict || undefined,
    search: searchQuery || undefined,
  });

  const { data: myReservations } = useGetMyGodownReservationsQuery();
  const [reserveGodown, { isLoading: isReserving }] = useReserveGodownMutation();
  const [cancelReservation, { isLoading: isCancelling }] = useCancelGodownReservationMutation();

  // Calculate effective facility
  const effectiveGodownId =
    (selectedGodownId && godowns?.some((g: any) => g.id === selectedGodownId)
      ? selectedGodownId
      : godowns?.[0]?.id) || '';

  const selectedFacility = godowns?.find((g: any) => g.id === effectiveGodownId);

  // Available districts for chosen state across all 22 states
  const availableDistricts =
    selectedState && effectiveLocations[selectedState]
      ? effectiveLocations[selectedState]
      : selectedState && ALL_INDIA_LOCATIONS[selectedState]
      ? ALL_INDIA_LOCATIONS[selectedState]
      : [];

  // Update default commodity if facility changes
  React.useEffect(() => {
    if (selectedFacility?.eligibleCommodities?.length) {
      if (!selectedFacility.eligibleCommodities.includes(commodity)) {
        setCommodity(selectedFacility.eligibleCommodities[0]);
      }
    }
  }, [selectedFacility]);

  const handleStateChange = (stateVal: string) => {
    setSelectedState(stateVal);
    setSelectedDistrict('');
    setSelectedGodownId('');
  };

  const handleDistrictChange = (distVal: string) => {
    setSelectedDistrict(distVal);
    setSelectedGodownId('');
  };

  const handleResetFilters = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setSearchQuery('');
    setSelectedGodownId('');
  };

  const unitRate = selectedFacility?.unitPricePerMonthPerBag || 6.50;
  const estimatedCost = Math.round(bagsCount * unitRate * durationMonths);

  const handleReserve = async () => {
    if (!selectedFacility) {
      toast({ title: 'Please select a warehouse facility', status: 'warning', duration: 3000 });
      return;
    }
    if (bagsCount <= 0) {
      toast({ title: 'Please enter a valid bags count', status: 'warning', duration: 3000 });
      return;
    }

    try {
      const res = await reserveGodown({
        godownId: selectedFacility.id,
        commodity,
        bagsCount: Number(bagsCount),
        durationMonths: Number(durationMonths),
        startDate,
        inwardSlot,
        vehicleType,
        idempotencyKey: `GDN_${user?.id}_${Date.now()}`,
      }).unwrap();

      setReservationResult(res);
      onOpen();
      toast({
        title: language === 'te' ? 'స్టోరేజ్ స్థలం విజయవంతంగా రిజర్వ్ అయింది!' : 'Storage Space Reserved Successfully!',
        description: `Token: ${res.reservationReference}`,
        status: 'success',
        duration: 5000,
      });
    } catch (err: any) {
      toast({
        title: 'Reservation failed',
        description: err?.data?.detail || 'Capacity error or unavailable slots',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleCancel = async (resId: string) => {
    if (window.confirm('Are you sure you want to cancel this warehouse reservation? Reserved bags will be restored.')) {
      try {
        await cancelReservation(resId).unwrap();
        toast({ title: 'Reservation cancelled successfully', status: 'info', duration: 3000 });
      } catch (err: any) {
        toast({ title: 'Cancellation failed', description: err?.data?.detail, status: 'error' });
      }
    }
  };

  const handleCopyToken = () => {
    if (reservationResult?.reservationReference) {
      navigator.clipboard.writeText(reservationResult.reservationReference);
      toast({ title: 'Storage Token copied to clipboard', status: 'info', duration: 2000 });
    }
  };

  return (
    <Container maxW="1400px" py={8}>
      {/* Header */}
      <Box mb={8}>
        <HStack spacing={2} mb={2}>
          <Flex bg="blue.50" color="blue.700" p={2} borderRadius="lg">
            <Warehouse size={24} />
          </Flex>
          <Badge colorScheme="blue" px={2.5} py={0.5} borderRadius="full">
            All-India CWC / State Warehousing Corp (APSWC & SWC)
          </Badge>
          <Badge colorScheme="purple" px={2} py={0.5} borderRadius="full" variant="subtle">
            13+ Verified Godowns Across India
          </Badge>
        </HStack>
        <Heading size="lg" color="gray.800" fontWeight="800">
          {t.godowns.title}
        </Heading>
        <Text color="gray.600" mt={1}>
          {t.godowns.subtitle}
        </Text>
      </Box>

      {/* Location Filter & Search Toolbar */}
      <Card bg="white" shadow="sm" borderRadius="xl" mb={6} borderWidth="1px" borderColor="gray.100">
        <CardBody p={5}>
          <VStack align="stretch" spacing={4}>
            <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
              <HStack spacing={2}>
                <Filter size={18} color="#1d4ed8" />
                <Text fontWeight="bold" fontSize="sm" color="gray.800">
                  {language === 'te' ? 'భారతదేశ వేర్‌హౌస్ & గోడౌన్ శోధన' : 'All-India Godown Search & Cascading Filter'}
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
                  size="sm"
                  borderRadius="md"
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                >
                  <option value="">{language === 'te' ? 'అన్ని రాష్ట్రాలు (All India)' : 'All States (All India)'}</option>
                  {Object.keys(effectiveLocations).sort().map((st) => (
                    <option key={st} value={st}>
                      {st} ({effectiveLocations[st]?.length || 0} Districts)
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* 2. Select District */}
              <FormControl isDisabled={!selectedState}>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.600" mb={1}>
                  2. {language === 'te' ? 'జిల్లా ఎంచుకోండి' : 'Select District'}
                </FormLabel>
                <Select
                  size="sm"
                  borderRadius="md"
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                >
                  <option value="">{language === 'te' ? 'అన్ని జిల్లాలు (All Districts)' : 'All Districts'}</option>
                  {availableDistricts.map((d: string) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* 3. Text Search */}
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.600" mb={1}>
                  3. {language === 'te' ? 'గోడౌన్ పేరు / ప్రదేశం శోధించండి' : 'Search by Name or Location'}
                </FormLabel>
                <InputGroup size="sm">
                  <InputLeftElement pointerEvents="none">
                    <Search size={14} color="#9ca3af" />
                  </InputLeftElement>
                  <Input
                    placeholder="e.g. APSWC Kurnool, Narela, Khanna..."
                    borderRadius="md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
              </FormControl>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
        {/* Left: Facilities & Booking Form (2 cols) */}
        <Box gridColumn={{ lg: 'span 2' }}>
          <Stack spacing={6}>
            <Card bg="white" shadow="sm" borderRadius="xl">
              <CardBody p={6}>
                <Stack spacing={6}>
                  {/* 1. Facility Selection Dropdown */}
                  <FormControl isRequired>
                    <FormLabel fontWeight="bold" fontSize="sm">
                      Select Storage Facility ({godowns?.length || 0} Facilities Available)
                    </FormLabel>
                    <Select
                      value={effectiveGodownId}
                      onChange={(e) => setSelectedGodownId(e.target.value)}
                      size="lg"
                      borderRadius="lg"
                      borderColor="blue.400"
                      borderWidth="2px"
                      focusBorderColor="blue.600"
                    >
                      {godowns?.map((g: any) => (
                        <option key={g.id} value={g.id}>
                          {g.name} {g.nameTe ? `(${g.nameTe})` : ''} — {g.district}, {g.state} (₹{g.unitPricePerMonthPerBag}/bag/mo)
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Selected Facility Details Card */}
                  {selectedFacility && (
                    <Card bg="blue.50" borderWidth="1px" borderColor="blue.200" borderRadius="xl">
                      <CardBody p={5}>
                        <Flex justify="space-between" align={{ base: 'start', sm: 'center' }} mb={3} wrap="wrap" gap={2}>
                          <Box>
                            <Heading size="sm" color="blue.900">
                              {selectedFacility.name}
                            </Heading>
                            <Text fontSize="xs" color="gray.600">
                              {selectedFacility.nameTe} • {selectedFacility.address}
                            </Text>
                          </Box>
                          <Badge colorScheme="green" fontSize="xs" px={2.5} py={1} borderRadius="full">
                            ₹{selectedFacility.unitPricePerMonthPerBag} / bag / month
                          </Badge>
                        </Flex>

                        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3} fontSize="xs" mb={3}>
                          <HStack align="start">
                            <MapPin size={16} color="#1d4ed8" />
                            <Box>
                              <Text fontWeight="bold" color="blue.950">Location</Text>
                              <Text color="gray.600">{selectedFacility.district}, {selectedFacility.state}</Text>
                            </Box>
                          </HStack>
                          <HStack align="start">
                            <Clock size={16} color="#1d4ed8" />
                            <Box>
                              <Text fontWeight="bold" color="blue.950">Inward Hours</Text>
                              <Text color="gray.600">{selectedFacility.operatingHours || '07:00 AM - 07:00 PM'}</Text>
                            </Box>
                          </HStack>
                          <HStack align="start">
                            <Phone size={16} color="#1d4ed8" />
                            <Box>
                              <Text fontWeight="bold" color="blue.950">Warehouse Contact</Text>
                              <Text color="gray.600">{selectedFacility.contactPhone || '08518-220412'}</Text>
                            </Box>
                          </HStack>
                        </SimpleGrid>

                        {/* Capacity Progress */}
                        <Box mb={3} bg="white" p={3} borderRadius="lg" borderWidth="1px" borderColor="blue.100">
                          <Flex justify="space-between" fontSize="xs" color="gray.700" mb={1} fontWeight="medium">
                            <Text>
                              Available Capacity: <strong>{selectedFacility.availableCapacityBags.toLocaleString()} bags</strong>
                            </Text>
                            <Text>
                              Total Capacity: {selectedFacility.totalCapacityBags.toLocaleString()} bags
                            </Text>
                          </Flex>
                          <Progress
                            value={Math.round(
                              ((selectedFacility.totalCapacityBags - selectedFacility.availableCapacityBags) /
                                selectedFacility.totalCapacityBags) *
                                100
                            )}
                            size="sm"
                            colorScheme="blue"
                            borderRadius="full"
                          />
                        </Box>

                        {/* Eligible Commodities Tags */}
                        {selectedFacility.eligibleCommodities && selectedFacility.eligibleCommodities.length > 0 && (
                          <HStack spacing={1.5} wrap="wrap">
                            <Text fontSize="2xs" fontWeight="bold" color="gray.600">
                              Accepted Commodities:
                            </Text>
                            {selectedFacility.eligibleCommodities.map((c: string) => (
                              <Tag size="sm" colorScheme="blue" key={c} fontSize="2xs" variant="solid">
                                {c}
                              </Tag>
                            ))}
                          </HStack>
                        )}
                      </CardBody>
                    </Card>
                  )}

                  {/* 2. Reservation Parameters Form */}
                  <Heading size="xs" textTransform="uppercase" color="gray.500" letterSpacing="wider">
                    Storage Reservation Details (నిల్వ వివరాలు)
                  </Heading>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {/* Commodity Dropdown */}
                    <FormControl isRequired>
                      <FormLabel fontWeight="bold" fontSize="sm">
                        Commodity to Store
                      </FormLabel>
                      <Select
                        value={commodity}
                        onChange={(e) => setCommodity(e.target.value)}
                        size="lg"
                        borderRadius="lg"
                      >
                        {selectedFacility?.eligibleCommodities?.map((c: string) => (
                          <option key={c} value={c}>{c}</option>
                        )) || (
                          <>
                            <option value="Paddy">Paddy / వరి</option>
                            <option value="Cotton">Cotton / పత్తి</option>
                            <option value="Bengal Gram">Bengal Gram / శనగలు</option>
                            <option value="Wheat">Wheat / గోధుమలు</option>
                          </>
                        )}
                      </Select>
                    </FormControl>

                    {/* Start Date */}
                    <FormControl isRequired>
                      <FormLabel fontWeight="bold" fontSize="sm">
                        Arrival / Inward Date
                      </FormLabel>
                      <Input
                        type="date"
                        value={startDate}
                        min={todayStr}
                        onChange={(e) => setStartDate(e.target.value)}
                        size="lg"
                        borderRadius="lg"
                      />
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    {/* Duration in Months */}
                    <FormControl isRequired>
                      <FormLabel fontWeight="bold" fontSize="sm">
                        Storage Duration
                      </FormLabel>
                      <Select
                        value={durationMonths}
                        onChange={(e) => setDurationMonths(Number(e.target.value))}
                        size="lg"
                        borderRadius="lg"
                      >
                        {[1, 2, 3, 4, 5, 6, 9, 12].map((m) => (
                          <option key={m} value={m}>{m} Months ({m * 30} Days)</option>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Bags Count */}
                    <FormControl isRequired>
                      <FormLabel fontWeight="bold" fontSize="sm">
                        Quantity ({t.godowns.bagsCount})
                      </FormLabel>
                      <Input
                        type="number"
                        value={bagsCount}
                        min={10}
                        max={selectedFacility?.availableCapacityBags || 10000}
                        onChange={(e) => setBagsCount(Number(e.target.value))}
                        size="lg"
                        borderRadius="lg"
                      />
                    </FormControl>

                    {/* Arrival Window Slot */}
                    <FormControl isRequired>
                      <FormLabel fontWeight="bold" fontSize="sm">
                        Inward Window
                      </FormLabel>
                      <Select
                        value={inwardSlot}
                        onChange={(e) => setInwardSlot(e.target.value)}
                        size="lg"
                        borderRadius="lg"
                      >
                        <option value="08:00 AM - 11:00 AM">08:00 AM - 11:00 AM (Morning)</option>
                        <option value="11:00 AM - 02:00 PM">11:00 AM - 02:00 PM (Midday)</option>
                        <option value="02:00 PM - 05:00 PM">02:00 PM - 05:00 PM (Afternoon)</option>
                        <option value="05:00 PM - 07:00 PM">05:00 PM - 07:00 PM (Evening)</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>

                  {/* Bags Count Quick Presets */}
                  <HStack spacing={2} wrap="wrap">
                    <Text fontSize="2xs" color="gray.500" fontWeight="bold">Quick Presets:</Text>
                    {[50, 100, 200, 500, 1000].map((preset) => (
                      <Button
                        key={preset}
                        size="xs"
                        variant={bagsCount === preset ? 'solid' : 'outline'}
                        colorScheme="blue"
                        onClick={() => setBagsCount(preset)}
                      >
                        {preset} Bags
                      </Button>
                    ))}
                  </HStack>

                  {/* Inward Vehicle Type */}
                  <FormControl isRequired>
                    <FormLabel fontWeight="bold" fontSize="sm">
                      Inward Transportation Vehicle Mode
                    </FormLabel>
                    <Select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      size="lg"
                      borderRadius="lg"
                    >
                      <option value="Tractor Trolley">Tractor Trolley (ట్రాక్టర్)</option>
                      <option value="Mini Truck / Tata Ace">Mini Commercial Vehicle / Tata Ace (మినీ ట్రక్)</option>
                      <option value="Heavy Lorry 10-Tyre">Heavy Lorry 10-Tyre (భారీ లారీ)</option>
                      <option value="Bullock Cart">Bullock Cart (ఎడ్ల బండి)</option>
                    </Select>
                  </FormControl>

                  {/* Live Cost Calculation Card */}
                  <Box bg="blue.50" p={5} borderRadius="xl" borderWidth="1px" borderColor="blue.200">
                    <Flex justify="space-between" align={{ base: 'start', sm: 'center' }} direction={{ base: 'column', sm: 'row' }} gap={3}>
                      <Box>
                        <Text fontSize="xs" color="gray.600">Storage Charges Breakdown:</Text>
                        <Text fontSize="xs" color="blue.900" fontWeight="medium">
                          ₹{unitRate}/bag/mo × {bagsCount} bags × {durationMonths} months
                        </Text>
                        <Text fontSize="2xl" fontWeight="900" color="blue.800" mt={1}>
                          Total Estimated: ₹{estimatedCost.toLocaleString()}
                        </Text>
                      </Box>
                      <Button
                        colorScheme="blue"
                        size="lg"
                        onClick={handleReserve}
                        isLoading={isReserving}
                        fontWeight="bold"
                        px={8}
                        shadow="md"
                        _hover={{ transform: 'translateY(-1px)', shadow: 'lg' }}
                      >
                        {t.godowns.reserveStorage}
                      </Button>
                    </Flex>
                  </Box>
                </Stack>
              </CardBody>
            </Card>

            {/* Verified Warehouse Feedback & Reviews */}
            <Box mt={4}>
              <ReviewsList
                module="GODOWN"
                title={
                  language === 'te'
                    ? 'రైతుల గోడౌన్ & వేర్‌హౌస్ నిల్వ సమీక్షలు'
                    : 'Verified Farmer Warehouse Storage & Weightment Reviews'
                }
              />
            </Box>
          </Stack>
        </Box>

        {/* Right: Existing Reservations */}
        <Box>
          <Heading size="sm" mb={4} color="gray.800">
            My Storage Reservations ({myReservations?.length || 0})
          </Heading>

          <Stack spacing={4}>
            {myReservations && myReservations.length > 0 ? (
              myReservations.map((r: any) => {
                const isExpanded = expandedReservationId === (r.id || r.reservationReference);
                return (
                  <Card key={r.id || r.reservationReference} bg="white" shadow="xs" borderWidth="1px" borderRadius="xl">
                    <CardBody p={4}>
                      <Flex justify="space-between" align="center" mb={2}>
                        <Badge
                          colorScheme={
                            r.status === 'STORED'
                              ? 'green'
                              : r.status === 'CONFIRMED'
                              ? 'blue'
                              : r.status === 'CANCELLED'
                              ? 'red'
                              : 'teal'
                          }
                          fontSize="2xs"
                        >
                          {r.status}
                        </Badge>
                        <Text fontSize="2xs" color="gray.500">
                          {r.durationMonths} Months ({r.startDate})
                        </Text>
                      </Flex>

                      <Text fontSize="sm" fontWeight="800" color="blue.900" letterSpacing="wider">
                        {r.reservationReference}
                      </Text>
                      <Text fontSize="xs" fontWeight="semibold" color="gray.800" mt={0.5}>
                        {r.godownName}
                      </Text>
                      <Text fontSize="2xs" color="gray.500">
                        {r.godownAddress}
                      </Text>

                      <Divider my={2.5} />

                      <HStack justify="space-between" fontSize="xs" mb={3}>
                        <Text color="gray.600">
                          {r.commodity}: <strong>{r.bagsCount} bags</strong>
                        </Text>
                        <Text fontWeight="bold" color="blue.800">
                          ₹{r.totalEstimatedCost?.toLocaleString()}
                        </Text>
                      </HStack>

                      {/* Action buttons */}
                      <HStack spacing={2} wrap="wrap">
                        <Button
                          size="xs"
                          variant="outline"
                          colorScheme="blue"
                          onClick={() =>
                            setExpandedReservationId(isExpanded ? null : (r.id || r.reservationReference))
                          }
                        >
                          {isExpanded ? 'Hide Status History' : 'Track Status History'}
                        </Button>

                        {r.status === 'STORED' && (
                          <Button
                            size="xs"
                            colorScheme="orange"
                            onClick={() => setFeedbackReservation(r)}
                          >
                            Review Storage
                          </Button>
                        )}

                        {['CONFIRMED', 'INITIATED'].includes(r.status) && (
                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleCancel(r.id || r.reservationReference)}
                            isLoading={isCancelling}
                          >
                            Cancel Slot
                          </Button>
                        )}
                      </HStack>

                      {/* Status Timeline Expansion */}
                      {isExpanded && (
                        <Box mt={4} pt={3} borderTopWidth="1px" borderColor="gray.100">
                          <StatusTimeline
                            currentStatus={r.status}
                            statusHistory={r.statusHistory}
                            moduleName="Godown Storage Reservation"
                          />
                        </Box>
                      )}
                    </CardBody>
                  </Card>
                );
              })
            ) : (
              <Card bg="gray.50" borderRadius="xl">
                <CardBody p={5} textAlign="center">
                  <PackageCheck size={28} color="#9ca3af" style={{ margin: '0 auto 8px auto' }} />
                  <Text fontSize="xs" color="gray.500">
                    No active godown reservations yet. Select a facility on the left to reserve storage space.
                  </Text>
                </CardBody>
              </Card>
            )}
          </Stack>
        </Box>
      </SimpleGrid>

      {/* Post-Completion Feedback Modal */}
      {feedbackReservation && (
        <FeedbackModal
          isOpen={!!feedbackReservation}
          onClose={() => setFeedbackReservation(null)}
          module="GODOWN"
          transactionId={feedbackReservation.id || feedbackReservation.reservationReference}
          targetId={feedbackReservation.godownId}
          targetName={feedbackReservation.godownName || 'APSWC Storage Facility'}
        />
      )}

      {/* Confirmation Token Modal */}
      {/* Godown Inward Pass QR Modal */}
      <BookingQRCodeModal
        isOpen={isOpen}
        onClose={onClose}
        booking={reservationResult}
        moduleType="GODOWN"
      />
    </Container>
  );
};
