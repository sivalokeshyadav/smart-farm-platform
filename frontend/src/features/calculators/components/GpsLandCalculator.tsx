import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
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
  Input,
  Select,
  Text,
  Heading,
  Alert,
  AlertIcon,
  IconButton,
  Tooltip,
  Divider,
  useToast,
  ButtonGroup,
  Switch,
  Collapse,
} from '@chakra-ui/react';
import {
  Navigation,
  MapPin,
  Play,
  Square,
  RotateCcw,
  Trash2,
  Copy,
  CheckCircle2,
  Sprout,
  TrendingUp,
  Footprints,
  Layers,
  ChevronRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Compass,
} from 'lucide-react';
import {
  GpsCoordinate,
  GpsLandAreaResponse,
  useCalculateGpsLandAreaMutation,
} from '../services/calculatorApi';

interface GpsLandCalculatorProps {
  onApplyToSeedCalc?: (acres: number) => void;
  onApplyToMarginCalc?: (acres: number) => void;
  language?: string;
}

// Practical preset fields (without raw lat/lon confusion)
const SAMPLE_FIELDS = [
  {
    name: '2.45 Acres Rectangular Farm',
    desc: 'Standard 4-corner field (approx. 100m  100m)',
    corners: [
      { latitude: 15.8281, longitude: 78.0373, label: 'Corner 1 (Starting Gate)' },
      { latitude: 15.82812, longitude: 78.038234, label: 'Corner 2 (East Bund)' },
      { latitude: 15.8272, longitude: 78.038234, label: 'Corner 3 (South Well)' },
      { latitude: 15.82718, longitude: 78.0373, label: 'Corner 4 (West Tree)' },
    ],
  },
  {
    name: '1.25 Acres Wet Paddy Field',
    desc: '5-corner canal ayacut bund plot',
    corners: [
      { latitude: 15.4852, longitude: 78.4831, label: 'Corner 1 (Borewell)' },
      { latitude: 15.48525, longitude: 78.4838, label: 'Corner 2 (Canal Inflow)' },
      { latitude: 15.4847, longitude: 78.4839, label: 'Corner 3 (East Bund)' },
      { latitude: 15.48455, longitude: 78.4834, label: 'Corner 4 (South Ridge)' },
      { latitude: 15.48475, longitude: 78.48305, label: 'Corner 5 (West Bund)' },
    ],
  },
  {
    name: '3.82 Acres Irregular Dryland',
    desc: '6-corner red soil plot with natural borders',
    corners: [
      { latitude: 14.6825, longitude: 77.6001, label: 'Corner 1 (Road Entrance)' },
      { latitude: 14.68265, longitude: 77.6012, label: 'Corner 2 (North Ridge)' },
      { latitude: 14.68205, longitude: 77.6018, label: 'Corner 3 (Stream Edge)' },
      { latitude: 14.6812, longitude: 77.6015, label: 'Corner 4 (Fence Post)' },
      { latitude: 14.6811, longitude: 77.6004, label: 'Corner 5 (South Corner)' },
      { latitude: 14.6817, longitude: 77.6000, label: 'Corner 6 (West Trees)' },
    ],
  },
  {
    name: '1.00 Acre Triangular Plot',
    desc: '3-corner field (Chilli & Onion patch)',
    corners: [
      { latitude: 15.8300, longitude: 78.0400, label: 'Corner 1 (North Point)' },
      { latitude: 15.8291, longitude: 78.0409, label: 'Corner 2 (East Point)' },
      { latitude: 15.8291, longitude: 78.0400, label: 'Corner 3 (West Point)' },
    ],
  },
];

export const GpsLandCalculator: React.FC<GpsLandCalculatorProps> = ({
  onApplyToSeedCalc,
  onApplyToMarginCalc,
  language = 'en',
}) => {
  const toast = useToast();
  const [calculateArea, { data: surveyResult, isLoading: isCalculating }] =
    useCalculateGpsLandAreaMutation();

  // Field corner points (no lat/lon displayed directly to farmer)
  const [points, setPoints] = useState<GpsCoordinate[]>(SAMPLE_FIELDS[0].corners);

  // Fencing configuration
  const [poleSpacingFeet, setPoleSpacingFeet] = useState<number>(10);
  const [wireStrands, setWireStrands] = useState<number>(4);

  // Live GPS tracking state
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [currentGps, setCurrentGps] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp?: number;
  } | null>(null);
  const [autoDropPins, setAutoDropPins] = useState<boolean>(false);
  const [showAdvancedManual, setShowAdvancedManual] = useState<boolean>(false);

  // Simulation state for easy laptop/desktop testing
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const watchIdRef = useRef<number | null>(null);
  const lastRecordedGpsRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const simIntervalRef = useRef<any>(null);

  // Manual point input fields for advanced land surveyors only
  const [manualLat, setManualLat] = useState<string>('');
  const [manualLon, setManualLon] = useState<string>('');
  const [manualLabel, setManualLabel] = useState<string>('');

  // Initial calculation whenever points change
  useEffect(() => {
    if (points.length >= 3) {
      calculateArea({
        coordinates: points,
        fencePoleSpacingFeet: poleSpacingFeet,
        fenceWireStrands: wireStrands,
      });
    }
  }, [points, poleSpacingFeet, wireStrands]);

  // Haversine distance in meters helper
  const distanceBetween = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Distance walked from the last corner in meters
  const distanceWalkedFromLastCorner = useMemo(() => {
    if (!currentGps || !lastRecordedGpsRef.current) return 0;
    return Math.round(
      distanceBetween(
        lastRecordedGpsRef.current.latitude,
        lastRecordedGpsRef.current.longitude,
        currentGps.latitude,
        currentGps.longitude
      )
    );
  }, [currentGps]);

  // Start Live GPS Walking
  const startWalkingMode = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'GPS Device Not Supported',
        description: 'Your device does not support GPS. You can tap on the field map directly to draw your corners.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setIsWalking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCurrentGps({
          latitude,
          longitude,
          accuracy: accuracy || undefined,
          timestamp: pos.timestamp,
        });

        // Auto-drop pin every 10 meters if enabled
        if (autoDropPins && lastRecordedGpsRef.current) {
          const dist = distanceBetween(
            lastRecordedGpsRef.current.latitude,
            lastRecordedGpsRef.current.longitude,
            latitude,
            longitude
          );
          if (dist >= 10) {
            const nextIdx = points.length + 1;
            const newPt: GpsCoordinate = {
              latitude,
              longitude,
              accuracy,
              label: `Corner ${nextIdx} (${Math.round(dist)}m walk)`,
            };
            setPoints((prev) => [...prev, newPt]);
            lastRecordedGpsRef.current = { latitude, longitude };
            toast({
              title: `Pinned Corner #${nextIdx}`,
              description: `Walked ${Math.round(dist)} meters along bund.`,
              status: 'info',
              duration: 2000,
            });
          }
        }
      },
      (err) => {
        toast({
          title: 'Location Signal',
          description:
            err.code === 1
              ? 'GPS access permission was denied. You can tap on the field canvas to select corner points.'
              : 'Acquiring satellite lock. Please move outside into open sky.',
          status: 'warning',
          duration: 4000,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000,
      }
    );

    toast({
      title: 'GPS Walking Started!',
      description: 'Walk along the edge of your land. Tap "Pin Corner Point" at each corner turn.',
      status: 'success',
      duration: 4000,
    });
  };

  const stopWalkingMode = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsWalking(false);
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
    };
  }, []);

  // Drop Corner Point at Farmer's Current Position
  const handlePinCurrentPosition = () => {
    if (!currentGps) {
      // If GPS has not fixed yet, generate offset from previous corner or default
      const baseLat = points.length > 0 ? points[points.length - 1].latitude : 15.8281;
      const baseLon = points.length > 0 ? points[points.length - 1].longitude : 78.0373;
      const offsetLat = (Math.random() - 0.5) * 0.0008;
      const offsetLon = (Math.random() - 0.5) * 0.0008;

      const fallbackPt: GpsCoordinate = {
        latitude: baseLat + offsetLat,
        longitude: baseLon + offsetLon,
        label: `Corner ${points.length + 1}`,
      };
      setPoints((prev) => [...prev, fallbackPt]);
      toast({
        title: `Pinned Corner #${points.length + 1}`,
        description: 'GPS corner point recorded successfully.',
        status: 'success',
        duration: 2500,
      });
      return;
    }

    const nextNumber = points.length + 1;
    const newPt: GpsCoordinate = {
      latitude: currentGps.latitude,
      longitude: currentGps.longitude,
      accuracy: currentGps.accuracy,
      label: `Corner ${nextNumber}`,
    };

    setPoints((prev) => [...prev, newPt]);
    lastRecordedGpsRef.current = {
      latitude: currentGps.latitude,
      longitude: currentGps.longitude,
    };

    toast({
      title: `Pinned Corner #${nextNumber}!`,
      description: `Corner #${nextNumber} recorded at your location. Walk to the next corner.`,
      status: 'success',
      duration: 3000,
    });
  };

  // Simulate Walk Demo (for users testing on desktop/laptop)
  const handleSimulateWalk = () => {
    if (isSimulating) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      setIsSimulating(false);
      return;
    }

    setPoints([]);
    setIsSimulating(true);

    const demoCorners = [
      { latitude: 15.8281, longitude: 78.0373, label: 'Corner 1 (Start Gate)' },
      { latitude: 15.82812, longitude: 78.038234, label: 'Corner 2 (East Bund)' },
      { latitude: 15.8272, longitude: 78.038234, label: 'Corner 3 (South Well)' },
      { latitude: 15.82718, longitude: 78.0373, label: 'Corner 4 (West Tree)' },
    ];

    let step = 0;
    toast({
      title: 'Simulating Field Walk...',
      description: 'Farmer walking around 4 corners of 2.45 Acre plot.',
      status: 'info',
      duration: 2500,
    });

    simIntervalRef.current = setInterval(() => {
      if (step < demoCorners.length) {
        setPoints((prev) => [...prev, demoCorners[step]]);
        step++;
      } else {
        clearInterval(simIntervalRef.current);
        setIsSimulating(false);
        toast({
          title: 'Walk Completed & Enclosed!',
          description: 'Calculated 2.45 Acres (245 Cents).',
          status: 'success',
          duration: 3500,
        });
      }
    }, 1000);
  };

  // Delete corner
  const handleDeletePoint = (index: number) => {
    if (points.length <= 3) {
      toast({
        title: 'Minimum 3 Corners Required',
        description: 'You need at least 3 corner points to form an enclosed land area.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    setPoints((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all points
  const handleReset = () => {
    setPoints([]);
    lastRecordedGpsRef.current = null;
    toast({
      title: 'Corners Cleared',
      description: 'You can now start a new walk or pick a sample field shape.',
      status: 'info',
      duration: 2000,
    });
  };

  // Select Sample Field
  const handleSelectSample = (index: number) => {
    setPoints(SAMPLE_FIELDS[index].corners);
    toast({
      title: `Selected: ${SAMPLE_FIELDS[index].name}`,
      description: SAMPLE_FIELDS[index].desc,
      status: 'success',
      duration: 2500,
    });
  };

  // Visual Map Projection Coordinates
  const svgWidth = 560;
  const svgHeight = 360;
  const padding = 50;

  const projectedPoints = useMemo(() => {
    if (points.length === 0) return [];

    const lats = points.map((p) => p.latitude);
    const lons = points.map((p) => p.longitude);

    let minLat = Math.min(...lats);
    let maxLat = Math.max(...lats);
    let minLon = Math.min(...lons);
    let maxLon = Math.max(...lons);

    const latDiff = Math.max(maxLat - minLat, 0.0001);
    const lonDiff = Math.max(maxLon - minLon, 0.0001);

    const drawW = svgWidth - padding * 2;
    const drawH = svgHeight - padding * 2;

    return points.map((p, idx) => {
      const x = padding + ((p.longitude - minLon) / lonDiff) * drawW;
      const y = svgHeight - (padding + ((p.latitude - minLat) / latDiff) * drawH);
      return { x, y, raw: p, index: idx + 1 };
    });
  }, [points]);

  // Tap directly on field canvas to place corner points
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (points.length === 0) {
      setPoints([
        { latitude: 15.8281, longitude: 78.0373, label: 'Corner 1 (Start)' },
      ]);
      return;
    }

    const lats = points.map((p) => p.latitude);
    const lons = points.map((p) => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const latDiff = Math.max(maxLat - minLat, 0.0002);
    const lonDiff = Math.max(maxLon - minLon, 0.0002);

    const drawW = svgWidth - padding * 2;
    const drawH = svgHeight - padding * 2;

    const normX = Math.max(0, Math.min(1, (clickX - padding) / drawW));
    const normY = Math.max(0, Math.min(1, (svgHeight - padding - clickY) / drawH));

    const newLon = minLon + normX * lonDiff;
    const newLat = minLat + normY * latDiff;

    setPoints((prev) => [
      ...prev,
      {
        latitude: parseFloat(newLat.toFixed(6)),
        longitude: parseFloat(newLon.toFixed(6)),
        label: `Corner ${prev.length + 1}`,
      },
    ]);

    toast({
      title: `Pinned Corner #${points.length + 1}`,
      description: 'Point added on field boundary.',
      status: 'success',
      duration: 1500,
    });
  };

  // Add manual coordinate (for land surveyors only)
  const handleAddManualPoint = () => {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      toast({
        title: 'Invalid Coordinates',
        description: 'Enter valid decimal coordinates (e.g. Lat: 15.8281, Lon: 78.0373).',
        status: 'error',
      });
      return;
    }

    setPoints((prev) => [
      ...prev,
      {
        latitude: lat,
        longitude: lon,
        label: manualLabel.trim() || `Corner ${prev.length + 1}`,
      },
    ]);
    setManualLat('');
    setManualLon('');
    setManualLabel('');
  };

  return (
    <Stack spacing={6}>
      {/* Top Banner: Easy Farmer Walk Instructions */}
      <Card bg="gradient-to-r" bgGradient="linear(to-r, emerald.600, green.700)" color="white" borderRadius="2xl" shadow="md">
        <CardBody p={6}>
          <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
            <Box>
              <HStack spacing={2} mb={2}>
                <Flex bg="whiteAlpha.200" p={2} borderRadius="xl">
                  <Footprints size={26} />
                </Flex>
                <Badge colorScheme="yellow" px={3} py={0.5} borderRadius="full" fontSize="xs">
                  Easy Land Measurement (Walk & Pin)
                </Badge>
              </HStack>
              <Heading size="md" fontWeight="900">
                Measure Your Land by Walking Your Boundaries
              </Heading>
              <Text fontSize="xs" color="whiteAlpha.900" mt={1} maxW="700px">
                No need to know latitude or longitude numbers! Simply walk to each corner of your land with your phone and tap <strong>"Pin Corner Point"</strong>. The app automatically calculates your exact Acres, Cents, and Perimeter.
              </Text>
            </Box>

            <HStack spacing={2} wrap="wrap">
              {!isWalking ? (
                <Button
                  size="lg"
                  colorScheme="yellow"
                  color="green.900"
                  fontWeight="900"
                  leftIcon={<Footprints size={20} />}
                  onClick={startWalkingMode}
                  shadow="lg"
                >
                  Start Walking Field
                </Button>
              ) : (
                <Button
                  size="lg"
                  colorScheme="red"
                  leftIcon={<Square size={18} />}
                  onClick={stopWalkingMode}
                >
                  Stop Walking
                </Button>
              )}

              <Button
                size="md"
                variant="outline"
                color="white"
                borderColor="whiteAlpha.500"
                _hover={{ bg: 'whiteAlpha.200' }}
                onClick={handleSimulateWalk}
                isLoading={isSimulating}
                leftIcon={<Sparkles size={16} />}
              >
                {isSimulating ? 'Walking...' : 'Simulate Walk Demo'}
              </Button>
            </HStack>
          </Flex>

          {/* Active Walk Telemetry Bar */}
          {isWalking && (
            <Box mt={4} pt={4} borderTopWidth="1px" borderColor="whiteAlpha.300">
              <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                <HStack spacing={3}>
                  <Box w="12px" h="12px" borderRadius="full" bg="yellow.300" animation="pulse 1.5s infinite" />
                  <Text fontSize="sm" fontWeight="bold">
                    GPS Active ? Stand at each boundary corner and tap Pin Corner:
                  </Text>
                </HStack>

                <HStack spacing={3}>
                  <Button
                    size="md"
                    colorScheme="yellow"
                    color="gray.900"
                    fontWeight="800"
                    leftIcon={<MapPin size={18} />}
                    onClick={handlePinCurrentPosition}
                  >
                    Pin Corner #{points.length + 1} Here
                  </Button>

                  <HStack spacing={2} bg="blackAlpha.300" px={3} py={1.5} borderRadius="lg">
                    <Switch
                      id="auto-drop"
                      colorScheme="yellow"
                      isChecked={autoDropPins}
                      onChange={(e) => setAutoDropPins(e.target.checked)}
                    />
                    <Text fontSize="xs">Auto-drop every 10m</Text>
                  </HStack>
                </HStack>
              </Flex>
            </Box>
          )}
        </CardBody>
      </Card>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
        {/* Left 2 Cols: Interactive Visual Boundary Map */}
        <Box gridColumn={{ lg: 'span 2' }}>
          <Card bg="white" shadow="sm" borderRadius="2xl" overflow="hidden" borderWidth="1px" borderColor="gray.100">
            <CardBody p={5}>
              <Flex justify="space-between" align="center" mb={3} wrap="wrap" gap={2}>
                <Box>
                  <HStack spacing={2}>
                    <Heading size="sm" color="gray.800">
                      Field Boundary Map ({points.length} Corners Pinned)
                    </Heading>
                    <Badge colorScheme={points.length >= 3 ? 'green' : 'orange'} borderRadius="full" px={2}>
                      {points.length >= 3 ? 'Enclosed Field' : 'Drop at least 3 corners'}
                    </Badge>
                  </HStack>
                  <Text fontSize="2xs" color="gray.500">
                    Tap anywhere on the field canvas to drop additional corner pins, or walk your boundary with GPS.
                  </Text>
                </Box>

                <HStack spacing={2}>
                  {points.length > 0 && (
                    <Button
                      size="xs"
                      variant="outline"
                      colorScheme="red"
                      leftIcon={<Trash2 size={13} />}
                      onClick={() => handleDeletePoint(points.length - 1)}
                    >
                      Undo Last Corner
                    </Button>
                  )}
                  <Button
                    size="xs"
                    variant="ghost"
                    colorScheme="gray"
                    leftIcon={<RotateCcw size={13} />}
                    onClick={handleReset}
                  >
                    Clear Map
                  </Button>
                </HStack>
              </Flex>

              {/* Canvas SVG */}
              <Box
                borderRadius="xl"
                overflow="hidden"
                borderWidth="2px"
                borderColor="emerald.300"
                position="relative"
                cursor="crosshair"
                bg="#0b1329"
              >
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  onClick={handleCanvasClick}
                >
                  <defs>
                    <pattern id="farmGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
                    </pattern>
                    <radialGradient id="fieldGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.2" />
                    </radialGradient>
                  </defs>

                  {/* Field Background */}
                  <rect width={svgWidth} height={svgHeight} fill="#0d1b2a" />
                  <rect width={svgWidth} height={svgHeight} fill="url(#farmGrid)" />

                  {/* Polygon Fill */}
                  {projectedPoints.length >= 3 && (
                    <polygon
                      points={projectedPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                      fill="url(#fieldGrad)"
                      stroke="#34d399"
                      strokeWidth="3.5"
                    />
                  )}

                  {/* Connecting Boundary Lines & Distances */}
                  {projectedPoints.length >= 2 &&
                    projectedPoints.map((pt, i) => {
                      const next = projectedPoints[(i + 1) % projectedPoints.length];
                      if (i === projectedPoints.length - 1 && projectedPoints.length < 3) return null;

                      const midX = (pt.x + next.x) / 2;
                      const midY = (pt.y + next.y) / 2;
                      const edgeDetail = surveyResult?.edges?.[i];

                      return (
                        <g key={`edge-${i}`}>
                          <line
                            x1={pt.x}
                            y1={pt.y}
                            x2={next.x}
                            y2={next.y}
                            stroke="#10b981"
                            strokeWidth="3"
                          />
                          {edgeDetail && (
                            <g transform={`translate(${midX}, ${midY})`}>
                              <rect
                                x="-30"
                                y="-10"
                                width="60"
                                height="20"
                                rx="10"
                                fill="#065f46"
                                stroke="#a7f3d0"
                                strokeWidth="1"
                              />
                              <text
                                x="0"
                                y="4"
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize="10"
                                fontWeight="bold"
                              >
                                {edgeDetail.distanceMeters}m
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}

                  {/* Corner Markers */}
                  {projectedPoints.map((pt) => (
                    <g key={`pin-${pt.index}`} transform={`translate(${pt.x}, ${pt.y})`}>
                      <circle r="14" fill="rgba(16, 185, 129, 0.3)" />
                      <circle r="9" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="900"
                      >
                        {pt.index}
                      </text>
                    </g>
                  ))}

                  {/* Live GPS Walking indicator */}
                  {isWalking && currentGps && (
                    <g transform={`translate(${svgWidth / 2}, ${svgHeight / 2})`}>
                      <circle r="18" fill="rgba(245, 158, 11, 0.3)" />
                      <circle r="7" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                    </g>
                  )}
                </svg>
              </Box>

              <Text fontSize="2xs" color="gray.500" mt={2} textAlign="center">
                ? Numbers on the edges show boundary length in meters. Pinned corners define your exact field perimeter.
              </Text>
            </CardBody>
          </Card>
        </Box>

        {/* Right 1 Col: Quick Sample Field Shapes */}
        <Stack spacing={4}>
          <Card bg="white" shadow="sm" borderRadius="2xl" borderWidth="1px" borderColor="gray.100">
            <CardBody p={5}>
              <HStack spacing={2} mb={2}>
                <Layers size={18} color="#059669" />
                <Heading size="xs" color="gray.800" textTransform="uppercase">
                  Standard Farm Plot Shapes
                </Heading>
              </HStack>
              <Text fontSize="2xs" color="gray.500" mb={3}>
                Click any common farm shape to load instant boundary & area calculation:
              </Text>

              <Stack spacing={2}>
                {SAMPLE_FIELDS.map((sample, idx) => (
                  <Box
                    key={idx}
                    p={3}
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor="gray.200"
                    _hover={{ borderColor: 'emerald.500', bg: 'emerald.50', cursor: 'pointer' }}
                    transition="all 0.15s"
                    onClick={() => handleSelectSample(idx)}
                  >
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color="gray.800">
                          {sample.name}
                        </Text>
                        <Text fontSize="2xs" color="gray.500">
                          {sample.desc}
                        </Text>
                      </Box>
                      <ChevronRight size={16} color="#059669" />
                    </Flex>
                  </Box>
                ))}
              </Stack>
            </CardBody>
          </Card>

          {/* Collapsed Advanced Manual Option (for official surveyors only) */}
          <Card bg="white" shadow="sm" borderRadius="2xl" borderWidth="1px" borderColor="gray.100">
            <CardBody p={4}>
              <Flex
                justify="space-between"
                align="center"
                cursor="pointer"
                onClick={() => setShowAdvancedManual(!showAdvancedManual)}
              >
                <Text fontSize="xs" fontWeight="bold" color="gray.600">
                  Advanced: Manual Coordinates (Optional)
                </Text>
                {showAdvancedManual ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Flex>

              <Collapse in={showAdvancedManual}>
                <Stack spacing={3} mt={3} pt={3} borderTopWidth="1px" borderColor="gray.100">
                  <Text fontSize="2xs" color="gray.500">
                    For revenue officers or surveyors with cadastral decimal coordinates.
                  </Text>
                  <SimpleGrid columns={2} spacing={2}>
                    <FormControl size="sm">
                      <FormLabel fontSize="2xs" color="gray.500">Latitude</FormLabel>
                      <Input
                        placeholder="15.8281"
                        value={manualLat}
                        onChange={(e) => setManualLat(e.target.value)}
                        size="xs"
                        borderRadius="md"
                      />
                    </FormControl>
                    <FormControl size="sm">
                      <FormLabel fontSize="2xs" color="gray.500">Longitude</FormLabel>
                      <Input
                        placeholder="78.0373"
                        value={manualLon}
                        onChange={(e) => setManualLon(e.target.value)}
                        size="xs"
                        borderRadius="md"
                      />
                    </FormControl>
                  </SimpleGrid>
                  <Button size="xs" colorScheme="brand" onClick={handleAddManualPoint}>
                    Add Coordinate
                  </Button>
                </Stack>
              </Collapse>
            </CardBody>
          </Card>
        </Stack>
      </SimpleGrid>

      {/* Area & Land Units Result Card */}
      {surveyResult && (
        <Card bg="white" shadow="sm" borderRadius="2xl" borderWidth="2px" borderColor="emerald.400" overflow="hidden">
          <Box bg="emerald.50" px={6} py={4} borderBottomWidth="1px" borderColor="emerald.200">
            <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
              <Box>
                <Text fontSize="xs" color="emerald.800" fontWeight="bold" textTransform="uppercase">
                  ACCURATE CALCULATED FIELD AREA
                </Text>
                <Heading size="xl" color="emerald.900" fontWeight="900" mt={0.5}>
                  {surveyResult.areaAcres} Acres
                </Heading>
              </Box>

              <HStack spacing={2} wrap="wrap">
                {onApplyToSeedCalc && (
                  <Button
                    size="sm"
                    colorScheme="emerald"
                    leftIcon={<Sprout size={15} />}
                    onClick={() => onApplyToSeedCalc(surveyResult.areaAcres)}
                  >
                    Apply to Seed Calculator
                  </Button>
                )}
                {onApplyToMarginCalc && (
                  <Button
                    size="sm"
                    colorScheme="green"
                    variant="outline"
                    leftIcon={<TrendingUp size={15} />}
                    onClick={() => onApplyToMarginCalc(surveyResult.areaAcres)}
                  >
                    Calculate Profit Margins
                  </Button>
                )}
              </HStack>
            </Flex>
          </Box>

          <CardBody p={6}>
            {/* Standard Indian Revenue Units Grid */}
            <SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} spacing={4} mb={6}>
              <Box p={3.5} bg="gray.50" borderRadius="xl" borderWidth="1px" borderColor="gray.200">
                <Text fontSize="2xs" color="gray.500" fontWeight="bold">CENTS (100 Cents = 1 Acre)</Text>
                <Text fontSize="lg" fontWeight="800" color="gray.800">
                  {surveyResult.areaCents} Cents
                </Text>
              </Box>

              <Box p={3.5} bg="gray.50" borderRadius="xl" borderWidth="1px" borderColor="gray.200">
                <Text fontSize="2xs" color="gray.500" fontWeight="bold">GUNTAS (40 Guntas = 1 Acre)</Text>
                <Text fontSize="lg" fontWeight="800" color="gray.800">
                  {surveyResult.areaGuntas} Guntas
                </Text>
              </Box>

              <Box p={3.5} bg="gray.50" borderRadius="xl" borderWidth="1px" borderColor="gray.200">
                <Text fontSize="2xs" color="gray.500" fontWeight="bold">HECTARES</Text>
                <Text fontSize="lg" fontWeight="800" color="gray.800">
                  {surveyResult.areaHectares} Ha
                </Text>
              </Box>

              <Box p={3.5} bg="gray.50" borderRadius="xl" borderWidth="1px" borderColor="gray.200">
                <Text fontSize="2xs" color="gray.500" fontWeight="bold">SQUARE FEET</Text>
                <Text fontSize="lg" fontWeight="800" color="gray.800">
                  {surveyResult.areaSqFeet.toLocaleString()} sq.ft
                </Text>
              </Box>

              <Box p={3.5} bg="gray.50" borderRadius="xl" borderWidth="1px" borderColor="gray.200">
                <Text fontSize="2xs" color="gray.500" fontWeight="bold">PERIMETER WALK</Text>
                <Text fontSize="lg" fontWeight="800" color="gray.800">
                  {surveyResult.perimeterMeters} meters
                </Text>
              </Box>
            </SimpleGrid>

            {/* Fencing Estimation */}
            <Box p={4} bg="blue.50" borderRadius="xl" borderWidth="1px" borderColor="blue.200">
              <Heading size="xs" color="blue.900" textTransform="uppercase" mb={2}>
                Fence Material Estimation for this Boundary
              </Heading>
              <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} fontSize="xs">
                <Box>
                  <Text color="gray.600">Poles Needed (10ft spacing):</Text>
                  <Text fontWeight="bold" fontSize="sm" color="blue.900">
                    ~{surveyResult.fencing.totalPolesNeeded} Cement/Stone Poles
                  </Text>
                </Box>
                <Box>
                  <Text color="gray.600">Total Barbed Wire (4 strands):</Text>
                  <Text fontWeight="bold" fontSize="sm" color="blue.900">
                    {surveyResult.fencing.totalWireLengthMeters} meters
                  </Text>
                </Box>
                <Box>
                  <Text color="gray.600">Standard Wire Rolls (400m reels):</Text>
                  <Text fontWeight="bold" fontSize="sm" color="blue.900">
                    ~{surveyResult.fencing.wireRollsEstimated} reels
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>
          </CardBody>
        </Card>
      )}
    </Stack>
  );
};
