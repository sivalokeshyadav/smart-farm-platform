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
  Checkbox,
  Alert,
  AlertIcon,
  Divider,
  useToast,
  Progress,
  Tag,
} from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { translations } from '../../i18n/translations';
import { useAnalyzeCropHealthMutation } from './services/cropHealthApi';
import {
  Activity,
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  PhoneCall,
  Sparkles,
} from 'lucide-react';

export const CropHealthPage: React.FC = () => {
  const { language } = useSelector((state: RootState) => state.auth);
  const t = translations[language];
  const toast = useToast();

  const [cropType, setCropType] = useState<string>('Cotton');
  const [growthStage, setGrowthStage] = useState<string>('Flowering');
  const [symptoms, setSymptoms] = useState<string>('Leaves showing rosetted flowers and curling');
  const [consent, setConsent] = useState<boolean>(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [analyzeCrop, { data: diagnosisResult, isLoading: isAnalyzing }] = useAnalyzeCropHealthMutation();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAnalysis = async () => {
    if (!consent) {
      toast({
        title: 'Consent required',
        description: 'Please grant consent for AI image analysis.',
        status: 'warning',
      });
      return;
    }

    try {
      await analyzeCrop({
        cropType,
        growthStage,
        observedSymptoms: symptoms,
        consentRecorded: true,
        imageBase64: imagePreview || 'mock-image-data-kurnool',
      }).unwrap();

      toast({
        title: 'Screening Complete',
        description: 'Findings and agronomist guidance loaded.',
        status: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Screening failed',
        description: err?.data?.detail || 'Error processing crop image',
        status: 'error',
      });
    }
  };

  return (
    <Container maxW="1200px" py={8}>
      {/* Header */}
      <Box mb={8}>
        <HStack spacing={2} mb={2}>
          <Flex bg="red.50" color="red.700" p={2} borderRadius="lg">
            <Activity size={24} />
          </Flex>
          <Badge colorScheme="red" px={2.5} py={0.5} borderRadius="full">
            Assistive Agro-Diagnostic Screening
          </Badge>
        </HStack>
        <Heading size="lg" color="gray.800" fontWeight="800">
          {t.cropHealth.title}
        </Heading>
        <Text color="gray.600" mt={1}>
          {t.cropHealth.subtitle}
        </Text>
      </Box>

      {/* Ethical Guardrail Alert */}
      <Alert status="warning" borderRadius="2xl" mb={8} bg="red.50" borderColor="red.200" borderWidth="1px">
        <AlertIcon color="red.600" />
        <Box fontSize="xs" color="red.950" lineHeight="1.6">
          <Text fontWeight="bold">AI ASSISTIVE SCREENING PILOT ADVISORY:</Text>
          <Text mt={0.5}>
            {t.cropHealth.disclaimer} Definite prescriptions require certified inspection by your Mandal Agricultural Officer.
          </Text>
        </Box>
      </Alert>

      <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={8}>
        {/* Left: Input & Image Upload (5 cols) */}
        <Box gridColumn={{ lg: 'span 5' }}>
          <Card bg="white" shadow="sm" borderRadius="2xl" p={6}>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">{t.cropHealth.cropType}</FormLabel>
                <Select value={cropType} onChange={(e) => setCropType(e.target.value)} size="lg">
                  <option value="Cotton">Cotton</option>
                  <option value="Paddy">Paddy</option>
                  <option value="Groundnut">Groundnut</option>
                  <option value="Chili">Chili</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">{t.cropHealth.growthStage}</FormLabel>
                <Select value={growthStage} onChange={(e) => setGrowthStage(e.target.value)} size="lg">
                  <option value="Seedling">Seedling (మొలక దశ)</option>
                  <option value="Vegetative">Vegetative (పైరు ఎదుగుదల దశ)</option>
                  <option value="Flowering">Flowering (పూత దశ)</option>
                  <option value="Fruiting">Fruiting</option>
                  <option value="Maturity">Maturity (కోత దశ)</option>
                </Select>
              </FormControl>

              {/* Upload Leaf Box */}
              <Box>
                <FormLabel fontSize="xs" fontWeight="bold">{t.cropHealth.uploadPrompt}</FormLabel>
                <Box
                  borderWidth="2px"
                  borderStyle="dashed"
                  borderColor="gray.300"
                  borderRadius="xl"
                  p={6}
                  textAlign="center"
                  bg="gray.50"
                  cursor="pointer"
                  position="relative"
                >
                  <Input
                    type="file"
                    accept="image/*"
                    opacity={0}
                    position="absolute"
                    top={0}
                    left={0}
                    w="full"
                    h="full"
                    cursor="pointer"
                    onChange={handleImageUpload}
                  />
                  <VStack spacing={2}>
                    <Flex bg="brand.50" color="brand.700" p={3} borderRadius="full">
                      <Camera size={24} />
                    </Flex>
                    <Text fontSize="xs" fontWeight="bold" color="gray.700">
                      {imagePreview ? 'Photo Selected! Tap to change' : 'Tap to Take Photo or Browse'}
                    </Text>
                    <Text fontSize="2xs" color="gray.500">
                      Supports JPG, PNG up to 10MB
                    </Text>
                  </VStack>
                </Box>
              </Box>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">{t.cropHealth.symptoms}</FormLabel>
                <Input
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. White powder, brown spots, curled tips"
                />
              </FormControl>

              <Checkbox isChecked={consent} onChange={(e) => setConsent(e.target.checked)} colorScheme="red">
                <Text fontSize="xs" color="gray.700">{t.cropHealth.consentLabel}</Text>
              </Checkbox>

              <Button
                colorScheme="red"
                size="lg"
                onClick={handleRunAnalysis}
                isLoading={isAnalyzing}
                leftIcon={<Sparkles size={18} />}
                fontWeight="bold"
                h="52px"
              >
                {t.cropHealth.analyzeButton}
              </Button>
            </Stack>
          </Card>
        </Box>

        {/* Right: AI Diagnosis Results (7 cols) */}
        <Box gridColumn={{ lg: 'span 7' }}>
          {diagnosisResult ? (
            <Stack spacing={6}>
              {/* Findings Card */}
              <Card bg="white" shadow="sm" borderRadius="2xl" borderWidth="1px" borderColor="red.100">
                <CardBody p={6}>
                  <Flex justify="space-between" align="center" mb={4}>
                    <HStack spacing={2}>
                      <Badge colorScheme="red" fontSize="xs">
                        Screening Output
                      </Badge>
                      <Text fontSize="xs" color="gray.500">
                        {diagnosisResult.modelVersion}
                      </Text>
                    </HStack>
                    <Badge colorScheme={diagnosisResult.isMockInference ? 'orange' : 'green'} variant="subtle">
                      {diagnosisResult.isMockInference ? 'Sandbox AI' : 'Live ML'}
                    </Badge>
                  </Flex>

                  <Stack spacing={4}>
                    {diagnosisResult.findings?.map((issue: any, idx: number) => (
                      <Box key={idx} p={4} borderRadius="xl" bg="gray.50" borderWidth="1px" borderColor="gray.200">
                        <Flex justify="space-between" align="start" mb={2}>
                          <Box>
                            <Heading size="xs" color="gray.900">
                              {issue.issueName}
                            </Heading>
                            <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                              {issue.issueNameTe}
                            </Text>
                          </Box>
                          <Badge colorScheme={issue.severity === 'HIGH' ? 'red' : 'orange'}>
                            {Math.round(issue.confidenceScore * 100)}% Confidence
                          </Badge>
                        </Flex>

                        <Text fontSize="xs" color="gray.600" mb={3}>
                          {issue.description}
                        </Text>

                        <Box bg="white" p={3} borderRadius="lg" mb={2}>
                          <Text fontSize="2xs" fontWeight="bold" color="brand.800" textTransform="uppercase" mb={1}>
                            Safe Agronomic Next Steps:
                          </Text>
                          <VStack align="start" spacing={1} fontSize="xs" color="gray.700">
                            {issue.recommendedSafeSteps?.map((st: string, sIdx: number) => (
                              <Text key={sIdx}>• {st}</Text>
                            ))}
                          </VStack>
                        </Box>

                        <Box bg="green.50" p={2.5} borderRadius="lg">
                          <Text fontSize="2xs" fontWeight="bold" color="green.800">
                            Organic / Non-chemical Alternatives:
                          </Text>
                          <Text fontSize="xs" color="green.900">
                            {issue.organicAlternatives?.join(', ')}
                          </Text>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </CardBody>
              </Card>

              {/* KVK Expert Referral Box */}
              {diagnosisResult.expertReferralRecommended && (
                <Card bg="orange.50" borderWidth="2px" borderColor="orange.300" borderRadius="2xl">
                  <CardBody p={5}>
                    <HStack spacing={2} mb={2}>
                      <ShieldAlert color="#c05621" size={20} />
                      <Heading size="xs" color="orange.900" textTransform="uppercase">
                        Ground Inspection Recommended
                      </Heading>
                    </HStack>
                    <Text fontSize="xs" color="orange.950" mb={3} lineHeight="1.6">
                      {diagnosisResult.referralReason}
                    </Text>
                    <HStack spacing={2} color="orange.900" fontSize="xs" fontWeight="bold">
                      <PhoneCall size={16} />
                      <Text>{diagnosisResult.kurnoolKVKContact}</Text>
                    </HStack>
                  </CardBody>
                </Card>
              )}
            </Stack>
          ) : (
            <Card bg="white" shadow="sm" borderRadius="2xl" p={12} textAlign="center">
              <VStack spacing={3}>
                <Flex bg="gray.100" color="gray.400" p={4} borderRadius="full">
                  <Camera size={36} />
                </Flex>
                <Heading size="sm" color="gray.700">
                  Ready for Diagnostic Screening
                </Heading>
                <Text fontSize="xs" color="gray.500" maxW="400px">
                  Choose a crop on the left and upload a photo of the affected plant or leaves to inspect potential fungal, bacterial or pest stress.
                </Text>
              </VStack>
            </Card>
          )}
        </Box>
      </SimpleGrid>
    </Container>
  );
};
