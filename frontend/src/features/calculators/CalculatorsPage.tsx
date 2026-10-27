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
  Input,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
} from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { translations } from '../../i18n/translations';
import {
  useConvertLandMutation,
  useCalculateSeedFertilizerMutation,
  useCalculateYieldMarginMutation,
} from './services/calculatorApi';
import { Calculator, ArrowRightLeft, Navigation, Sprout, TrendingUp, HelpCircle } from 'lucide-react';
import { GpsLandCalculator } from './components/GpsLandCalculator';

export const CalculatorsPage: React.FC = () => {
  const { language } = useSelector((state: RootState) => state.auth);
  const t = translations[language];
  const toast = useToast();

  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  // Tab 1: Land Converter
  const [landValue, setLandValue] = useState<number>(1);
  const [landUnit, setLandUnit] = useState<string>('acres');
  const [convertLand, { data: landResult, isLoading: isConverting }] = useConvertLandMutation();

  // Tab 3: Seed & Nutrients
  const [crop, setCrop] = useState<string>('Paddy');
  const [cropAcres, setCropAcres] = useState<number>(2.5);
  const [method, setMethod] = useState<string>('Traditional');
  const [calculateSeed, { data: seedResult, isLoading: isSeedCalc }] = useCalculateSeedFertilizerMutation();

  // Tab 4: Economics & Margins
  const [econCrop, setEconCrop] = useState<string>('Cotton');
  const [econAcres, setEconAcres] = useState<number>(3);
  const [expectedYield, setExpectedYield] = useState<number>(10);
  const [expectedPrice, setExpectedPrice] = useState<number>(7200);
  const [seedCost, setSeedCost] = useState<number>(1700);
  const [fertCost, setFertCost] = useState<number>(6500);
  const [laborCost, setLaborCost] = useState<number>(12000);
  const [irrigationCost, setIrrigationCost] = useState<number>(2500);
  const [calculateMargin, { data: marginResult, isLoading: isMarginCalc }] = useCalculateYieldMarginMutation();

  const handleLandConvert = () => {
    convertLand({ value: Number(landValue), fromUnit: landUnit });
  };

  const handleSeedCalc = () => {
    calculateSeed({ crop, acres: Number(cropAcres), farmingMethod: method });
  };

  const handleMarginCalc = () => {
    calculateMargin({
      crop: econCrop,
      acres: Number(econAcres),
      expectedYieldPerAcreQuintals: Number(expectedYield),
      expectedPricePerQuintal: Number(expectedPrice),
      seedCostPerAcre: Number(seedCost),
      fertilizerPesticideCostPerAcre: Number(fertCost),
      laborMachineryCostPerAcre: Number(laborCost),
      irrigationCostPerAcre: Number(irrigationCost),
      otherCostPerAcre: 0,
    });
  };

  const handleApplyGpsToSeedCalc = (acres: number) => {
    setCropAcres(acres);
    setActiveTabIndex(2);
    calculateSeed({ crop, acres, farmingMethod: method });
    toast({
      title: 'GPS Area Applied',
      description: `Populated ${acres} Acres into Seed & Nutrient Calculator.`,
      status: 'success',
      duration: 3000,
    });
  };

  const handleApplyGpsToMarginCalc = (acres: number) => {
    setEconAcres(acres);
    setActiveTabIndex(3);
    calculateMargin({
      crop: econCrop,
      acres,
      expectedYieldPerAcreQuintals: Number(expectedYield),
      expectedPricePerQuintal: Number(expectedPrice),
      seedCostPerAcre: Number(seedCost),
      fertilizerPesticideCostPerAcre: Number(fertCost),
      laborMachineryCostPerAcre: Number(laborCost),
      irrigationCostPerAcre: Number(irrigationCost),
      otherCostPerAcre: 0,
    });
    toast({
      title: 'GPS Area Applied',
      description: `Populated ${acres} Acres into Economics & Margin Calculator.`,
      status: 'success',
      duration: 3000,
    });
  };

  // Run default conversions on initial mount
  React.useEffect(() => {
    handleLandConvert();
    handleSeedCalc();
    handleMarginCalc();
  }, []);

  return (
    <Container maxW="1200px" py={8}>
      {/* Header */}
      <Box mb={8}>
        <HStack spacing={2} mb={2}>
          <Flex bg="cyan.50" color="cyan.700" p={2} borderRadius="lg">
            <Calculator size={24} />
          </Flex>
          <Badge colorScheme="cyan" px={2.5} py={0.5} borderRadius="full">
            ANGRAU Agronomic Benchmarks
          </Badge>
        </HStack>
        <Heading size="lg" color="gray.800" fontWeight="800">
          {t.calculators.title}
        </Heading>
        <Text color="gray.600" mt={1}>
          {t.calculators.subtitle}
        </Text>
      </Box>

      {/* Tabs */}
      <Tabs index={activeTabIndex} onChange={setActiveTabIndex} variant="enclosed" colorScheme="cyan" isLazy>
        <TabList mb={6}>
          <Tab fontWeight="bold" fontSize="sm" gap={2}>
            <ArrowRightLeft size={16} /> {t.calculators.tabs.land}
          </Tab>
          <Tab fontWeight="bold" fontSize="sm" gap={2}>
            <Navigation size={16} /> {t.calculators.tabs.gpsSurvey}
          </Tab>
          <Tab fontWeight="bold" fontSize="sm" gap={2}>
            <Sprout size={16} /> {t.calculators.tabs.seedFert}
          </Tab>
          <Tab fontWeight="bold" fontSize="sm" gap={2}>
            <TrendingUp size={16} /> {t.calculators.tabs.margin}
          </Tab>
        </TabList>

        <TabPanels>
          {/* TAB 1: LAND CONVERSION */}
          <TabPanel p={0}>

            <Card bg="white" shadow="sm" borderRadius="2xl">
              <CardBody p={6}>
                <Stack spacing={6}>
                <Alert status="info" borderRadius="xl" fontSize="xs">
                  <AlertIcon />
                  {t.calculators.landNote}
                </Alert>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} alignItems="end">
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold">Area Value</FormLabel>
                    <Input
                      type="number"
                      value={landValue}
                      min={0.01}
                      step={0.1}
                      onChange={(e) => setLandValue(Number(e.target.value))}
                      size="lg"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold">From Unit</FormLabel>
                    <Select
                      value={landUnit}
                      onChange={(e) => setLandUnit(e.target.value)}
                      size="lg"
                    >
                      <option value="acres">Acres</option>
                      <option value="cents">Cents (100 per acre)</option>
                      <option value="guntas">Guntas (40 per acre)</option>
                      <option value="hectares">Hectares (2.47 acres)</option>
                      <option value="sq_feet">Square Feet (చదరపు అడుగులు)</option>
                      <option value="sq_meters">Square Metres (చదరపు మీటర్లు)</option>
                    </Select>
                  </FormControl>

                  <Button
                    colorScheme="cyan"
                    size="lg"
                    onClick={handleLandConvert}
                    isLoading={isConverting}
                    fontWeight="bold"
                  >
                    Convert Units
                  </Button>
                </SimpleGrid>

                {landResult && (
                  <Box mt={4} p={5} bg="cyan.50" borderRadius="xl" borderWidth="1px" borderColor="cyan.200">
                    <Heading size="xs" color="cyan.900" textTransform="uppercase" mb={3}>
                      Equivalent Regional Conversions
                    </Heading>
                    <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                      <Box bg="white" p={3} borderRadius="lg" shadow="xs">
                        <Text fontSize="2xs" color="gray.500">ACRES (ఎకరాలు)</Text>
                        <Text fontSize="lg" fontWeight="bold" color="cyan.800">
                          {landResult.conversions.acres}
                        </Text>
                      </Box>
                      <Box bg="white" p={3} borderRadius="lg" shadow="xs">
                        <Text fontSize="2xs" color="gray.500">CENTS (సెంట్లు)</Text>
                        <Text fontSize="lg" fontWeight="bold" color="cyan.800">
                          {landResult.conversions.cents}
                        </Text>
                      </Box>
                      <Box bg="white" p={3} borderRadius="lg" shadow="xs">
                        <Text fontSize="2xs" color="gray.500">GUNTAS (గుంటలు)</Text>
                        <Text fontSize="lg" fontWeight="bold" color="cyan.800">
                          {landResult.conversions.guntas}
                        </Text>
                      </Box>
                      <Box bg="white" p={3} borderRadius="lg" shadow="xs">
                        <Text fontSize="2xs" color="gray.500">HECTARES</Text>
                        <Text fontSize="lg" fontWeight="bold" color="cyan.800">
                          {landResult.conversions.hectares}
                        </Text>
                      </Box>
                      <Box bg="white" p={3} borderRadius="lg" shadow="xs">
                        <Text fontSize="2xs" color="gray.500">SQ FEET</Text>
                        <Text fontSize="lg" fontWeight="bold" color="cyan.800">
                          {landResult.conversions.sq_feet.toLocaleString()}
                        </Text>
                      </Box>
                      <Box bg="white" p={3} borderRadius="lg" shadow="xs">
                        <Text fontSize="2xs" color="gray.500">SQ METRES</Text>
                        <Text fontSize="lg" fontWeight="bold" color="cyan.800">
                          {landResult.conversions.sq_meters.toLocaleString()}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Box>
                )}
              </Stack>
            </CardBody>
          </Card>
        </TabPanel>

        {/* TAB 2: GPS LAND SURVEY & BOUNDARY MEASUREMENT */}
        <TabPanel p={0}>
          <GpsLandCalculator
            onApplyToSeedCalc={handleApplyGpsToSeedCalc}
            onApplyToMarginCalc={handleApplyGpsToMarginCalc}
            language={language}
          />
        </TabPanel>

        {/* TAB 3: SEED & NUTRIENT DOSAGE */}
        <TabPanel p={0}>
          <Card bg="white" shadow="sm" borderRadius="2xl">
            <CardBody p={6}>
              <Stack spacing={6}>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} alignItems="end">
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold">Crop Type</FormLabel>
                  <Select value={crop} onChange={(e) => setCrop(e.target.value)} size="lg">
                    <option value="Paddy">Paddy / వరి</option>
                    <option value="Cotton">Cotton / పత్తి</option>
                    <option value="Groundnut">Groundnut / వేరుశనగ</option>
                    <option value="Chili">Chili / మిర్చి</option>
                    <option value="Bengal Gram">Bengal Gram / శనగలు</option>
                    <option value="Maize">Maize / మొక్కజొన్న</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold">Field Area (Acres)</FormLabel>
                  <Input
                    type="number"
                    value={cropAcres}
                    min={0.1}
                    step={0.5}
                    onChange={(e) => setCropAcres(Number(e.target.value))}
                    size="lg"
                  />
                </FormControl>

                <Button
                  colorScheme="cyan"
                  size="lg"
                  onClick={handleSeedCalc}
                  isLoading={isSeedCalc}
                  fontWeight="bold"
                >
                  Calculate Dosages
                </Button>
              </SimpleGrid>

              {seedResult && (
                <Box p={5} bg="gray.50" borderRadius="xl">
                  <Heading size="xs" color="gray.800" mb={3}>
                    {seedResult.title}
                  </Heading>
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4} mb={4}>
                    <Box bg="white" p={4} borderRadius="lg" shadow="xs">
                      <Text fontSize="2xs" color="gray.500">RECOMMENDED SEED</Text>
                      <Text fontSize="xl" fontWeight="bold" color="brand.800">
                        {seedResult.metrics.recommendedSeedKg} Kg
                      </Text>
                    </Box>
                    <Box bg="white" p={4} borderRadius="lg" shadow="xs">
                      <Text fontSize="2xs" color="gray.500">UREA (45KG BAGS)</Text>
                      <Text fontSize="xl" fontWeight="bold" color="brand.800">
                        {seedResult.metrics.estimatedUreaBags45Kg} Bags
                      </Text>
                    </Box>
                    <Box bg="white" p={4} borderRadius="lg" shadow="xs">
                      <Text fontSize="2xs" color="gray.500">DAP (50KG BAGS)</Text>
                      <Text fontSize="xl" fontWeight="bold" color="brand.800">
                        {seedResult.metrics.estimatedDAPBags50Kg} Bags
                      </Text>
                    </Box>
                    <Box bg="white" p={4} borderRadius="lg" shadow="xs">
                      <Text fontSize="2xs" color="gray.500">MOP POTASH (50KG)</Text>
                      <Text fontSize="xl" fontWeight="bold" color="brand.800">
                        {seedResult.metrics.estimatedMOPBags50Kg} Bags
                      </Text>
                    </Box>
                  </SimpleGrid>
                  <Text fontSize="2xs" color="gray.500">
                    {seedResult.disclaimer}
                  </Text>
                </Box>
              )}
            </Stack>
          </CardBody>
        </Card>
      </TabPanel>

        {/* TAB 3: YIELD & MARGIN BREAK-EVEN */}
        <TabPanel p={0}>
          <Card bg="white" shadow="sm" borderRadius="2xl">
            <CardBody p={6}>
              <Stack spacing={6}>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold">Crop</FormLabel>
                  <Select value={econCrop} onChange={(e) => setEconCrop(e.target.value)}>
                    <option value="Cotton">Cotton (పత్తి)</option>
                    <option value="Paddy">Paddy (వరి)</option>
                    <option value="Groundnut">Groundnut (వేరుశనగ)</option>
                    <option value="Chili">Chili (మిర్చి)</option>
                    <option value="Bengal Gram">Bengal Gram (శనగలు)</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold">Acres</FormLabel>
                  <Input type="number" value={econAcres} onChange={(e) => setEconAcres(Number(e.target.value))} />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold">Expected Yield / Acre (Qtl)</FormLabel>
                  <Input type="number" value={expectedYield} onChange={(e) => setExpectedYield(Number(e.target.value))} />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold">Expected Mandi Price / Qtl (₹)</FormLabel>
                  <Input type="number" value={expectedPrice} onChange={(e) => setExpectedPrice(Number(e.target.value))} />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold">Seed Cost / Acre (₹)</FormLabel>
                  <Input type="number" value={seedCost} onChange={(e) => setSeedCost(Number(e.target.value))} />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold">Fertilizer/Nutrient Cost / Acre (₹)</FormLabel>
                  <Input type="number" value={fertCost} onChange={(e) => setFertCost(Number(e.target.value))} />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold">Labor & Machinery / Acre (₹)</FormLabel>
                  <Input type="number" value={laborCost} onChange={(e) => setLaborCost(Number(e.target.value))} />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold">Irrigation / Electricity / Acre (₹)</FormLabel>
                  <Input type="number" value={irrigationCost} onChange={(e) => setIrrigationCost(Number(e.target.value))} />
                </FormControl>
              </SimpleGrid>

              <Button
                colorScheme="cyan"
                size="lg"
                onClick={handleMarginCalc}
                isLoading={isMarginCalc}
                fontWeight="bold"
              >
                Compute Economics & Break-Even
              </Button>

              {marginResult && (
                <Box p={5} bg="gray.50" borderRadius="xl">
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4} mb={4}>
                    <Box bg="white" p={4} borderRadius="lg" shadow="xs">
                      <Text fontSize="2xs" color="gray.500">{t.calculators.grossRevenue}</Text>
                      <Text fontSize="2xl" fontWeight="900" color="green.700">
                        ₹{marginResult.metrics.grossRevenueRs.toLocaleString()}
                      </Text>
                    </Box>

                    <Box bg="white" p={4} borderRadius="lg" shadow="xs">
                      <Text fontSize="2xs" color="gray.500">{t.calculators.totalCost}</Text>
                      <Text fontSize="2xl" fontWeight="900" color="red.700">
                        ₹{marginResult.metrics.totalInputCostRs.toLocaleString()}
                      </Text>
                    </Box>

                    <Box bg="white" p={4} borderRadius="lg" shadow="xs">
                      <Text fontSize="2xs" color="gray.500">{t.calculators.netProfit}</Text>
                      <Text fontSize="2xl" fontWeight="900" color="brand.800">
                        ₹{marginResult.metrics.netProfitOrLossRs.toLocaleString()}
                      </Text>
                      <Badge colorScheme="green" fontSize="2xs">{marginResult.metrics.profitMarginPercent}% Margin</Badge>
                    </Box>

                    <Box bg="white" p={4} borderRadius="lg" shadow="xs">
                      <Text fontSize="2xs" color="gray.500">{t.calculators.costPerQuintal}</Text>
                      <Text fontSize="lg" fontWeight="bold" color="gray.800">
                        ₹{marginResult.metrics.costOfProductionPerQuintalRs} / Qtl
                      </Text>
                    </Box>

                    <Box bg="white" p={4} borderRadius="lg" shadow="xs">
                      <Text fontSize="2xs" color="gray.500">{t.calculators.breakEven}</Text>
                      <Text fontSize="lg" fontWeight="bold" color="gray.800">
                        {marginResult.metrics.breakevenYieldQuintals} Quintals
                      </Text>
                    </Box>
                  </SimpleGrid>
                  <Text fontSize="2xs" color="gray.500">
                    {marginResult.disclaimer}
                  </Text>
                </Box>
              )}
            </Stack>
          </CardBody>
        </Card>
      </TabPanel>
    </TabPanels>
  </Tabs>
</Container>
);
};
