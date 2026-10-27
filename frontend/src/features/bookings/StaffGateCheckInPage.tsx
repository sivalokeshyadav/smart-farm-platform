import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  Button,
  Card,
  CardBody,
  Stack,
  Flex,
  Badge,
  HStack,
  VStack,
  Divider,
  useToast,
  Alert,
  AlertIcon,
  Tag,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Tooltip,
  Spinner,
} from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { translations } from '../../i18n/translations';
import {
  useGetAllBookingsQuery,
  useUpdateBookingStatusMutation,
  useLazyLookupBookingByTokenQuery,
} from './services/bookingApi';
import {
  useGetAllGodownReservationsQuery,
  useUpdateGodownStatusMutation,
  useLazyLookupGodownReservationByTokenQuery,
} from '../godowns/services/godownApi';
import {
  UserCheck,
  Search,
  CheckCircle,
  Truck,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  Camera,
  CameraOff,
  QrCode,
  Upload,
  RefreshCw,
  Warehouse,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import jsQR from 'jsqr';
import { StatusTimeline } from '../../components/StatusTimeline';

export const StaffGateCheckInPage: React.FC = () => {
  const { language, activeRole } = useSelector((state: RootState) => state.auth);
  const t = translations[language];
  const toast = useToast();

  // Search and Verification state
  const [searchToken, setSearchToken] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [recordType, setRecordType] = useState<'MARKET' | 'GODOWN'>('MARKET');
  const [statusNotes, setStatusNotes] = useState<string>('Verified and validated at checkpoint.');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Camera scanner state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<any>(null);

  // RTK Query endpoints
  const { data: allBookings, refetch: refetchBookings, isLoading: loadingBookings } = useGetAllBookingsQuery();
  const { data: allGodownRes, refetch: refetchGodowns, isLoading: loadingGodowns } = useGetAllGodownReservationsQuery();

  const [lookupBooking] = useLazyLookupBookingByTokenQuery();
  const [lookupGodown] = useLazyLookupGodownReservationByTokenQuery();

  const [updateBookingStatus, { isLoading: isUpdatingBooking }] = useUpdateBookingStatusMutation();
  const [updateGodownStatus, { isLoading: isUpdatingGodown }] = useUpdateGodownStatusMutation();

  const isUpdating = isUpdatingBooking || isUpdatingGodown || isSearching;

  // Handle camera start/stop using offscreen canvas + jsQR
  const startCamera = async () => {
    setCameraError(null);
    setLastScannedCode(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access is not supported by your browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
      setIsCameraActive(true);

      // Canvas for frame extraction
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      // Periodic frame scanning every 250ms
      scanIntervalRef.current = setInterval(() => {
        if (videoRef.current && videoRef.current.readyState >= 2 && ctx) {
          const video = videoRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          if (canvas.width > 0 && canvas.height > 0) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });

            if (code && code.data && code.data.trim()) {
              handleCodeDetected(code.data.trim());
            }
          }
        }
      }, 250);
    } catch (err: any) {
      setCameraError(err?.message || 'Unable to access camera device. You can search by token or upload QR photo.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle scanned or detected code
  const handleCodeDetected = (code: string) => {
    let token = code.trim();
    if (token === lastScannedCode) return; // avoid duplicate triggers within interval

    setLastScannedCode(token);

    // If QR payload was JSON string, parse reference
    if (token.startsWith('{') && token.endsWith('}')) {
      try {
        const parsed = JSON.parse(token);
        token = parsed.reference || token;
      } catch (e) {
        // use raw
      }
    }

    setSearchToken(token.toUpperCase());
    performLookup(token.toUpperCase());
    stopCamera();
  };

  // Perform lookup directly using backend API
  const performLookup = async (tokenToFind: string) => {
    const cleanToken = tokenToFind.trim().toUpperCase();
    if (!cleanToken) {
      toast({ title: 'Please enter or scan a token', status: 'warning', duration: 2500 });
      return;
    }

    setIsSearching(true);

    try {
      // 1. Try Market Booking lookup API directly
      const marketRes = await lookupBooking(cleanToken).unwrap();
      if (marketRes) {
        setSelectedRecord(marketRes);
        setRecordType('MARKET');
        setIsSearching(false);
        toast({
          title: 'APMC Market Booking Verified!',
          description: `Token: ${marketRes.bookingReference} | Farmer: ${marketRes.farmerName}`,
          status: 'success',
          duration: 3500,
        });
        return;
      }
    } catch (errMarket) {
      // Not a market booking, check godown
    }

    try {
      // 2. Try Godown Storage lookup API directly
      const godownRes = await lookupGodown(cleanToken).unwrap();
      if (godownRes) {
        setSelectedRecord(godownRes);
        setRecordType('GODOWN');
        setIsSearching(false);
        toast({
          title: 'Godown Reservation Verified!',
          description: `Token: ${godownRes.reservationReference} | Farmer: ${godownRes.farmerName}`,
          status: 'success',
          duration: 3500,
        });
        return;
      }
    } catch (errGodown) {
      // Not a godown reservation either
    }

    // 3. Fallback: check cached list
    const marketLocal = allBookings?.find(
      (b: any) =>
        b.bookingReference?.toUpperCase() === cleanToken ||
        b.id === cleanToken ||
        b._id === cleanToken
    );

    if (marketLocal) {
      setSelectedRecord(marketLocal);
      setRecordType('MARKET');
      setIsSearching(false);
      toast({ title: 'Market Booking Found in Queue', status: 'info', duration: 2000 });
      return;
    }

    const godownLocal = allGodownRes?.find(
      (g: any) =>
        g.reservationReference?.toUpperCase() === cleanToken ||
        g.id === cleanToken ||
        g._id === cleanToken
    );

    if (godownLocal) {
      setSelectedRecord(godownLocal);
      setRecordType('GODOWN');
      setIsSearching(false);
      toast({ title: 'Godown Reservation Found in Queue', status: 'info', duration: 2000 });
      return;
    }

    setIsSearching(false);
    toast({
      title: 'Token Not Found',
      description: `No active record matches token "${cleanToken}". Please verify the code.`,
      status: 'warning',
      duration: 4000,
    });
  };

  // Image Upload Scanner using jsQR
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (qrCode && qrCode.data) {
            handleCodeDetected(qrCode.data);
          } else {
            toast({
              title: 'No QR Code Detected',
              description: 'Could not decode QR code in image. Please enter token number directly.',
              status: 'warning',
              duration: 4000,
            });
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Change Status Handler
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedRecord) return;

    const ref = selectedRecord.bookingReference || selectedRecord.reservationReference || selectedRecord.id;

    try {
      if (recordType === 'MARKET') {
        const res = await updateBookingStatus({
          bookingId: ref,
          newStatus,
          notes: statusNotes,
        }).unwrap();

        setSelectedRecord(res);
        refetchBookings();
        toast({
          title: `Status Changed to ${newStatus}!`,
          description: `APMC Yard Pass: ${ref}`,
          status: 'success',
          duration: 4000,
        });
      } else {
        const res = await updateGodownStatus({
          reservationRef: ref,
          newStatus,
          notes: statusNotes,
        }).unwrap();

        setSelectedRecord(res);
        refetchGodowns();
        toast({
          title: `Status Changed to ${newStatus}!`,
          description: `Godown Storage Pass: ${ref}`,
          status: 'success',
          duration: 4000,
        });
      }
    } catch (err: any) {
      toast({
        title: 'Status Update Failed',
        description: err?.data?.detail || 'Error recording transition',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'BOOKED':
        return 'blue';
      case 'ARRIVED':
      case 'ENTERED':
        return 'teal';
      case 'WAITING':
        return 'orange';
      case 'STORED':
        return 'purple';
      case 'SELLED':
      case 'SOLD':
        return 'green';
      case 'COMPLETED':
        return 'green';
      case 'CANCELLED':
      case 'REJECTED':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Container maxW="1350px" py={8}>
      {/* Header */}
      <Box mb={8}>
        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={3}>
          <Box>
            <HStack spacing={2} mb={1}>
              <Flex bg="orange.50" color="orange.600" p={2} borderRadius="xl">
                <UserCheck size={26} />
              </Flex>
              <Badge colorScheme="orange" px={3} py={1} borderRadius="full" fontSize="xs">
                Staff & Operator QR Checkpoint
              </Badge>
              <Badge colorScheme="purple" px={2.5} py={0.5} borderRadius="full" fontSize="2xs">
                Role: {activeRole || 'STAFF'}
              </Badge>
            </HStack>
            <Heading size="lg" color="gray.800" fontWeight="900">
              Gate & Warehouse QR Pass Validation
            </Heading>
            <Text color="gray.600" fontSize="sm" mt={1}>
              Scan farmer QR passes at APMC Mandi gates, APSWC godowns, or Helpdesk kiosks to authenticate tokens and transition statuses.
            </Text>
          </Box>

          <HStack spacing={2}>
            <Button
              size="sm"
              leftIcon={<RefreshCw size={15} />}
              variant="outline"
              onClick={() => {
                refetchBookings();
                refetchGodowns();
                toast({ title: 'Queues Refreshed', status: 'info', duration: 1500 });
              }}
            >
              Refresh Lists
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* QR Scanner & Lookup Controls */}
      <Card bg="white" shadow="sm" borderRadius="2xl" mb={8} borderWidth="1px" borderColor="gray.100">
        <CardBody p={6}>
          <Tabs variant="soft-rounded" colorScheme="brand">
            <TabList mb={4} flexWrap="wrap">
              <Tab fontSize="xs" fontWeight="bold">
                <HStack spacing={1.5}>
                  <Camera size={16} />
                  <Text>Live Camera Scanner (jsQR)</Text>
                </HStack>
              </Tab>
              <Tab fontSize="xs" fontWeight="bold">
                <HStack spacing={1.5}>
                  <Upload size={16} />
                  <Text>Upload QR Photo / File</Text>
                </HStack>
              </Tab>
              <Tab fontSize="xs" fontWeight="bold">
                <HStack spacing={1.5}>
                  <Search size={16} />
                  <Text>Search / Enter Token</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Tab 1: Live Camera Stream */}
              <TabPanel px={0}>
                <VStack spacing={4} align="center">
                  <Box
                    w={{ base: '100%', sm: '440px' }}
                    h="270px"
                    bg="gray.900"
                    borderRadius="2xl"
                    overflow="hidden"
                    position="relative"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderWidth="2px"
                    borderColor="brand.400"
                  >
                    <video
                      ref={videoRef}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: isCameraActive ? 'block' : 'none',
                      }}
                      playsInline
                      muted
                    />

                    {!isCameraActive && (
                      <VStack spacing={2} color="whiteAlpha.800" p={4} textAlign="center">
                        <QrCode size={48} color="#48bb78" />
                        <Text fontSize="sm" fontWeight="bold">
                          Camera Scanner is Standby
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          Click "Start Camera Scanner" to point at farmer's pass on their phone screen or paper ticket
                        </Text>
                      </VStack>
                    )}

                    {isCameraActive && (
                      <Box
                        position="absolute"
                        w="190px"
                        h="190px"
                        borderWidth="2px"
                        borderColor="green.400"
                        borderRadius="xl"
                        boxShadow="0 0 0 9999px rgba(0, 0, 0, 0.45)"
                        pointerEvents="none"
                      />
                    )}
                  </Box>

                  {cameraError && (
                    <Alert status="warning" borderRadius="lg" fontSize="xs" maxW="440px">
                      <AlertIcon />
                      {cameraError}
                    </Alert>
                  )}

                  <HStack spacing={3}>
                    {!isCameraActive ? (
                      <Button
                        colorScheme="brand"
                        size="md"
                        leftIcon={<Camera size={18} />}
                        onClick={startCamera}
                      >
                        Start Camera Scanner
                      </Button>
                    ) : (
                      <Button
                        colorScheme="red"
                        variant="outline"
                        size="md"
                        leftIcon={<CameraOff size={18} />}
                        onClick={stopCamera}
                      >
                        Stop Camera
                      </Button>
                    )}
                  </HStack>
                </VStack>
              </TabPanel>

              {/* Tab 2: Upload Image */}
              <TabPanel px={0}>
                <VStack spacing={4} align="center" py={4}>
                  <Box
                    borderWidth="2px"
                    borderStyle="dashed"
                    borderColor="brand.300"
                    borderRadius="2xl"
                    p={8}
                    textAlign="center"
                    bg="brand.50"
                    w={{ base: '100%', sm: '440px' }}
                  >
                    <Upload size={36} color="#2e7d32" style={{ margin: '0 auto 12px' }} />
                    <Text fontSize="sm" fontWeight="bold" color="brand.900" mb={1}>
                      Select QR Code Screenshot or Photo
                    </Text>
                    <Text fontSize="xs" color="gray.600" mb={4}>
                      Capture with camera or upload farmer's pass image
                    </Text>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      display="none"
                      id="qr-file-input"
                    />
                    <Button
                      as="label"
                      htmlFor="qr-file-input"
                      colorScheme="brand"
                      size="sm"
                      cursor="pointer"
                    >
                      Browse Image
                    </Button>
                  </Box>
                </VStack>
              </TabPanel>

              {/* Tab 3: Direct Token Input */}
              <TabPanel px={0}>
                <Stack spacing={3}>
                  <HStack>
                    <Input
                      placeholder="e.g. KNL-MKT-RFAFJ or IND-GDN-LLGWM"
                      value={searchToken}
                      onChange={(e) => setSearchToken(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && performLookup(searchToken)}
                      size="lg"
                      borderRadius="xl"
                      fontWeight="bold"
                      letterSpacing="wider"
                      bg="gray.50"
                    />
                    <Button
                      colorScheme="brand"
                      size="lg"
                      px={8}
                      leftIcon={<Search size={18} />}
                      isLoading={isSearching}
                      onClick={() => performLookup(searchToken)}
                    >
                      Validate Token
                    </Button>
                  </HStack>
                </Stack>
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* Quick Demo Scan Pills */}
          <Divider my={4} />
          <Box>
            <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2}>
              QUICK ONE-CLICK TEST SCAN (Pilot Active Records):
            </Text>
            <HStack spacing={2} wrap="wrap">
              {allBookings?.slice(0, 4).map((b: any) => (
                <Tag
                  key={b.id || b.bookingReference}
                  size="md"
                  colorScheme="green"
                  cursor="pointer"
                  borderRadius="full"
                  onClick={() => {
                    setSearchToken(b.bookingReference);
                    performLookup(b.bookingReference);
                  }}
                  _hover={{ opacity: 0.8, transform: 'scale(1.03)' }}
                >
                  Mandi: {b.bookingReference} ({b.commodity})
                </Tag>
              ))}

              {allGodownRes?.slice(0, 3).map((g: any) => (
                <Tag
                  key={g.id || g.reservationReference}
                  size="md"
                  colorScheme="blue"
                  cursor="pointer"
                  borderRadius="full"
                  onClick={() => {
                    setSearchToken(g.reservationReference);
                    performLookup(g.reservationReference);
                  }}
                  _hover={{ opacity: 0.8, transform: 'scale(1.03)' }}
                >
                  Godown: {g.reservationReference} ({g.commodity})
                </Tag>
              ))}
            </HStack>
          </Box>
        </CardBody>
      </Card>

      {/* Validated Pass Card & Status Action Console */}
      {selectedRecord && (
        <Card
          bg="white"
          borderWidth="2px"
          borderColor={recordType === 'MARKET' ? 'brand.400' : 'blue.400'}
          borderRadius="2xl"
          mb={8}
          shadow="lg"
          overflow="hidden"
        >
          {/* Top Banner */}
          <Box bg={recordType === 'MARKET' ? 'brand.50' : 'blue.50'} p={6} borderBottomWidth="1px" borderColor="gray.100">
            <Flex
              justify="space-between"
              align={{ base: 'start', md: 'center' }}
              direction={{ base: 'column', md: 'row' }}
              gap={3}
            >
              <Box>
                <HStack spacing={2} mb={1}>
                  <Badge colorScheme={recordType === 'MARKET' ? 'brand' : 'blue'} fontSize="xs" px={2.5} py={0.5}>
                    {recordType === 'MARKET' ? 'APMC Mandi Entry Pass' : 'Godown Inward Storage Pass'}
                  </Badge>
                  <Badge colorScheme={getStatusColor(selectedRecord.status)} fontSize="xs" px={3} py={0.5} borderRadius="full">
                    Current Status: {selectedRecord.status}
                  </Badge>
                </HStack>
                <Heading size="lg" color={recordType === 'MARKET' ? 'brand.900' : 'blue.900'} letterSpacing="wider">
                  {selectedRecord.bookingReference || selectedRecord.reservationReference}
                </Heading>
              </Box>

              <HStack spacing={2}>
                <CheckCircle2 size={24} color="#2e7d32" />
                <Text fontSize="sm" fontWeight="bold" color="green.700">
                  Authentication Verified
                </Text>
              </HStack>
            </Flex>

            {/* Information Grid */}
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4} mt={5} fontSize="xs">
              <Box bg="white" p={3} borderRadius="xl" shadow="xs">
                <Text color="gray.500" fontSize="2xs">REGISTERED FARMER</Text>
                <Text fontWeight="bold" fontSize="sm" color="gray.800">
                  {selectedRecord.farmerName || 'Farmer'}
                </Text>
                <Text color="gray.600">{selectedRecord.farmerPhone}</Text>
              </Box>

              <Box bg="white" p={3} borderRadius="xl" shadow="xs">
                <Text color="gray.500" fontSize="2xs">FACILITY / LOCATION</Text>
                <Text fontWeight="bold" fontSize="sm" color="gray.800">
                  {selectedRecord.marketName || selectedRecord.godownName || 'Facility'}
                </Text>
                <Text color="gray.600">{selectedRecord.district || 'Kurnool'}</Text>
              </Box>

              <Box bg="white" p={3} borderRadius="xl" shadow="xs">
                <Text color="gray.500" fontSize="2xs">COMMODITY & VOLUME</Text>
                <Text fontWeight="bold" fontSize="sm" color="gray.800">
                  {selectedRecord.commodity}
                </Text>
                <Text color="gray.600">
                  {selectedRecord.estimatedQuantityQuintals
                    ? `${selectedRecord.estimatedQuantityQuintals} Quintals`
                    : `${selectedRecord.bagsCount || 0} Bags`}
                </Text>
              </Box>

              <Box bg="white" p={3} borderRadius="xl" shadow="xs">
                <Text color="gray.500" fontSize="2xs">WINDOW & VEHICLE</Text>
                <Text fontWeight="bold" fontSize="sm" color="gray.800">
                  {selectedRecord.date || selectedRecord.startDate}
                </Text>
                <Text color="gray.600">
                  {selectedRecord.slotTime || selectedRecord.inwardSlot || selectedRecord.vehicleType || 'Standard'}
                </Text>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Interactive Status Transition Console */}
          <CardBody p={6}>
            <Heading size="xs" color="gray.700" textTransform="uppercase" letterSpacing="wider" mb={3}>
              Change Booking Status (Action Controls)
            </Heading>

            <Text fontSize="xs" color="gray.600" mb={4}>
              Select the appropriate stage for this delivery. The change will immediately update the database, log an audit entry, and notify the farmer.
            </Text>

            {/* Status Change Buttons */}
            <SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} spacing={3} mb={5}>
              <Button
                colorScheme="teal"
                variant={selectedRecord.status === 'ARRIVED' ? 'solid' : 'outline'}
                onClick={() => handleStatusChange('ARRIVED')}
                isLoading={isUpdating}
                h="48px"
                leftIcon={<Truck size={16} />}
              >
                Mark ARRIVED
              </Button>

              <Button
                colorScheme="orange"
                variant={selectedRecord.status === 'WAITING' ? 'solid' : 'outline'}
                onClick={() => handleStatusChange('WAITING')}
                isLoading={isUpdating}
                h="48px"
                leftIcon={<Clock size={16} />}
              >
                Set WAITING
              </Button>

              <Button
                colorScheme="purple"
                variant={selectedRecord.status === 'STORED' ? 'solid' : 'outline'}
                onClick={() => handleStatusChange('STORED')}
                isLoading={isUpdating}
                h="48px"
                leftIcon={<Warehouse size={16} />}
              >
                Mark STORED
              </Button>

              <Button
                colorScheme="green"
                variant={selectedRecord.status === 'SELLED' ? 'solid' : 'outline'}
                onClick={() => handleStatusChange('SELLED')}
                isLoading={isUpdating}
                h="48px"
                leftIcon={<Sparkles size={16} />}
              >
                Mark SELLED
              </Button>

              <Button
                colorScheme="blue"
                variant={selectedRecord.status === 'COMPLETED' ? 'solid' : 'outline'}
                onClick={() => handleStatusChange('COMPLETED')}
                isLoading={isUpdating}
                h="48px"
                leftIcon={<CheckCircle size={16} />}
              >
                COMPLETED
              </Button>
            </SimpleGrid>

            {/* Remarks Input */}
            <Box bg="gray.50" p={4} borderRadius="xl" borderWidth="1px" borderColor="gray.200">
              <Text fontSize="xs" fontWeight="bold" color="gray.700" mb={1}>
                Verification & Inspection Remarks (Optional):
              </Text>
              <Input
                size="sm"
                bg="white"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="e.g. Weighbridge weight verified 14.8 Qtl, stored in Bay 2, or traded at Mandi rate."
                borderRadius="lg"
              />
              <HStack spacing={2} mt={2} wrap="wrap">
                <Text fontSize="2xs" color="gray.500">Presets:</Text>
                {['Weighed at gate', 'In queue for auction', 'Stacked in Bay B', 'Auction sold to trader'].map((preset) => (
                  <Tag
                    key={preset}
                    size="sm"
                    cursor="pointer"
                    variant="subtle"
                    onClick={() => setStatusNotes(preset)}
                  >
                    {preset}
                  </Tag>
                ))}
              </HStack>
            </Box>

            {/* Status History Timeline */}
            <Box mt={6} pt={4} borderTopWidth="1px" borderColor="gray.100">
              <Text fontSize="xs" fontWeight="bold" color="gray.700" mb={3}>
                Status History & Audit Trail:
              </Text>
              <StatusTimeline
                currentStatus={selectedRecord.status}
                statusHistory={selectedRecord.statusHistory}
                moduleName={recordType === 'MARKET' ? 'Market Booking' : 'Godown Storage'}
              />
            </Box>
          </CardBody>
        </Card>
      )}

      {/* Active Reconciliation Queue Table */}
      <Card bg="white" shadow="sm" borderRadius="2xl" borderWidth="1px" borderColor="gray.100">
        <CardBody p={6}>
          <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={2}>
            <Heading size="md" color="gray.800">
              Active Facility Inward Queue & Reconciliation Record
            </Heading>
            <Badge colorScheme="brand" px={2.5} py={0.5} borderRadius="full">
              Total Active: {(allBookings?.length || 0) + (allGodownRes?.length || 0)}
            </Badge>
          </Flex>

          <Tabs variant="enclosed" colorScheme="brand">
            <TabList mb={4} flexWrap="wrap">
              <Tab fontSize="xs" fontWeight="bold">
                APMC Mandi Yard Bookings ({allBookings?.length || 0})
              </Tab>
              <Tab fontSize="xs" fontWeight="bold">
                Godown Storage Reservations ({allGodownRes?.length || 0})
              </Tab>
            </TabList>

            <TabPanels>
              {/* Market Yard Queue */}
              <TabPanel px={0}>
                <Stack spacing={3}>
                  {allBookings && allBookings.length > 0 ? (
                    allBookings.map((b: any) => (
                      <Flex
                        key={b.id || b.bookingReference}
                        p={4}
                        bg="gray.50"
                        borderRadius="xl"
                        justify="space-between"
                        align="center"
                        direction={{ base: 'column', sm: 'row' }}
                        gap={3}
                        borderWidth="1px"
                        borderColor="gray.200"
                        _hover={{ bg: 'green.50', borderColor: 'brand.300' }}
                        transition="all 0.15s"
                      >
                        <Box>
                          <HStack spacing={2} mb={1}>
                            <Text fontWeight="800" fontSize="sm" color="brand.800" letterSpacing="wider">
                              {b.bookingReference}
                            </Text>
                            <Badge colorScheme={getStatusColor(b.status)} fontSize="2xs">
                              {b.status}
                            </Badge>
                            <Text fontSize="2xs" color="gray.500">{b.date}</Text>
                          </HStack>
                          <Text fontSize="xs" color="gray.600">
                            {b.farmerName} ({b.farmerPhone}) ? {b.commodity} ({b.estimatedQuantityQuintals} Qtl) ? {b.vehicleType}
                          </Text>
                        </Box>

                        <HStack spacing={2}>
                          <Button
                            size="xs"
                            colorScheme="brand"
                            variant="solid"
                            onClick={() => {
                              setSelectedRecord(b);
                              setRecordType('MARKET');
                              setSearchToken(b.bookingReference);
                              window.scrollTo({ top: 380, behavior: 'smooth' });
                            }}
                          >
                            Manage Status
                          </Button>
                        </HStack>
                      </Flex>
                    ))
                  ) : (
                    <Text fontSize="xs" color="gray.500">No market bookings recorded today.</Text>
                  )}
                </Stack>
              </TabPanel>

              {/* Godown Warehouse Queue */}
              <TabPanel px={0}>
                <Stack spacing={3}>
                  {allGodownRes && allGodownRes.length > 0 ? (
                    allGodownRes.map((g: any) => (
                      <Flex
                        key={g.id || g.reservationReference}
                        p={4}
                        bg="gray.50"
                        borderRadius="xl"
                        justify="space-between"
                        align="center"
                        direction={{ base: 'column', sm: 'row' }}
                        gap={3}
                        borderWidth="1px"
                        borderColor="gray.200"
                        _hover={{ bg: 'blue.50', borderColor: 'blue.300' }}
                        transition="all 0.15s"
                      >
                        <Box>
                          <HStack spacing={2} mb={1}>
                            <Text fontWeight="800" fontSize="sm" color="blue.800" letterSpacing="wider">
                              {g.reservationReference}
                            </Text>
                            <Badge colorScheme={getStatusColor(g.status)} fontSize="2xs">
                              {g.status}
                            </Badge>
                            <Text fontSize="2xs" color="gray.500">{g.startDate}</Text>
                          </HStack>
                          <Text fontSize="xs" color="gray.600">
                            {g.farmerName} ? {g.commodity} ({g.bagsCount} Bags) ? {g.godownName}
                          </Text>
                        </Box>

                        <HStack spacing={2}>
                          <Button
                            size="xs"
                            colorScheme="blue"
                            variant="solid"
                            onClick={() => {
                              setSelectedRecord(g);
                              setRecordType('GODOWN');
                              setSearchToken(g.reservationReference);
                              window.scrollTo({ top: 380, behavior: 'smooth' });
                            }}
                          >
                            Manage Status
                          </Button>
                        </HStack>
                      </Flex>
                    ))
                  ) : (
                    <Text fontSize="xs" color="gray.500">No godown storage reservations recorded.</Text>
                  )}
                </Stack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </Container>
  );
};
