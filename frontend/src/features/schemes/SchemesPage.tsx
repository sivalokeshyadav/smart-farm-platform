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
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  Checkbox,
  Link,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { translations } from '../../i18n/translations';
import {
  useGetSchemesQuery,
  useRunSchemePreCheckMutation,
  useCreateSchemeCaseMutation,
  useGetMySchemeCasesQuery,
  useUpdateCaseStatusMutation,
} from './services/schemeApi';
import {
  FileText,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  UserCheck,
  Clock,
  Landmark,
  Copy,
  Globe,
  Info,
} from 'lucide-react';
import { StatusTimeline } from '../../components/StatusTimeline';

export const SchemesPage: React.FC = () => {
  const { language, activeRole } = useSelector((state: RootState) => state.auth);
  const t = translations[language];
  const toast = useToast();

  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: schemes, isLoading: isLoadingSchemes } = useGetSchemesQuery({
    state: selectedState !== 'ALL' ? selectedState : undefined,
    category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
    search: searchQuery ? searchQuery : undefined,
  });

  const { data: myCases, refetch: refetchMyCases } = useGetMySchemeCasesQuery();
  const [runPreCheck, { isLoading: isChecking }] = useRunSchemePreCheckMutation();
  const [createSchemeCase, { isLoading: isFilingCase }] = useCreateSchemeCaseMutation();
  const [updateCaseStatus, { isLoading: isUpdatingStatus }] = useUpdateCaseStatusMutation();

  const [activeScheme, setActiveScheme] = useState<any>(null);
  const [landAcres, setLandAcres] = useState<number>(3.5);
  const [hasAadhaar, setHasAadhaar] = useState<boolean>(true);
  const [isTenant, setIsTenant] = useState<boolean>(false);
  const [preCheckResult, setPreCheckResult] = useState<any>(null);

  const [consentGranted, setConsentGranted] = useState<boolean>(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isAssistOpen,
    onOpen: onAssistOpen,
    onClose: onAssistClose,
  } = useDisclosure();

  const openPreCheck = (scheme: any) => {
    setActiveScheme(scheme);
    setPreCheckResult(null);
    onOpen();
  };

  const handleRunPreCheck = async () => {
    if (!activeScheme) return;
    try {
      const res = await runPreCheck({
        schemeId: activeScheme.id || activeScheme.schemeCode,
        landHoldingAcres: Number(landAcres),
        ownsAadhaar: hasAadhaar,
        isTenantFarmer: isTenant,
      }).unwrap();
      setPreCheckResult(res);
    } catch (err: any) {
      toast({ title: 'Pre-check failed', description: err?.data?.detail, status: 'error' });
    }
  };

  const handleRequestAssistance = async () => {
    if (!consentGranted) {
      toast({
        title: 'Consent required',
        description: 'Please tick the consent box to authorize RBK field assistant document guidance.',
        status: 'warning',
      });
      return;
    }

    try {
      const docList = activeScheme?.requiredDocuments?.map((d: string) => ({
        name: d,
        submitted: false,
      })) || [];

      const res = await createSchemeCase({
        schemeId: activeScheme.id || activeScheme.schemeCode,
        consentRecorded: true,
        documentChecklist: docList,
        notes: `Assisted guidance requested by farmer. Land: ${landAcres} acres.`,
      }).unwrap();

      toast({
        title: 'Assisted Case Created',
        description: `Case Reference: ${res.caseReference}`,
        status: 'success',
      });
      onAssistClose();
      refetchMyCases();
    } catch (err: any) {
      toast({ title: 'Unable to file case', description: err?.data?.detail, status: 'error' });
    }
  };

  const handleAdvanceCaseStatus = async (caseId: string, currentStatus: string) => {
    const nextStatusMap: Record<string, string> = {
      ASSISTANCE_REQUESTED: 'DOCUMENTS_VERIFIED',
      DOCUMENTS_VERIFIED: 'READY_FOR_APPLICANT_SUBMISSION',
      READY_FOR_APPLICANT_SUBMISSION: 'SUBMITTED',
      SUBMITTED: 'UNDER_REVIEW',
      UNDER_REVIEW: 'APPROVED',
    };
    const nextStatus = nextStatusMap[currentStatus] || 'ASSISTANCE_COMPLETED';
    try {
      await updateCaseStatus({
        caseId,
        newStatus: nextStatus,
        notes: `Progressed by operator (${activeRole}) to ${nextStatus}`,
      }).unwrap();
      toast({
        title: 'Case Status Updated',
        description: `Status changed to ${nextStatus}`,
        status: 'success',
      });
      refetchMyCases();
    } catch (err: any) {
      toast({
        title: 'Update Failed',
        description: err?.data?.detail || 'Could not update status',
        status: 'error',
      });
    }
  };

  return (
    <Container maxW="1400px" py={8}>
      {/* Header */}
      <Box mb={8}>
        <HStack spacing={2} mb={2}>
          <Flex bg="orange.50" color="orange.700" p={2} borderRadius="lg">
            <Landmark size={24} />
          </Flex>
          <Badge colorScheme="orange" px={2.5} py={0.5} borderRadius="full">
            Government Welfare & Subsidy Portal
          </Badge>
        </HStack>
        <Heading size="lg" color="gray.800" fontWeight="800">
          {t.schemes.title}
        </Heading>
        <Text color="gray.600" mt={1}>
          {t.schemes.subtitle}
        </Text>
      </Box>

      {/* Statutory Disclaimer Alert */}
      <Alert status="warning" borderRadius="2xl" mb={8} bg="orange.50" borderColor="orange.300" borderWidth="1px">
        <AlertIcon color="orange.600" />
        <Box fontSize="xs" color="orange.950" lineHeight="1.6">
          <Text fontWeight="bold">IMPORTANT STATUTORY NOTICE & LEGAL DISCLAIMER:</Text>
          <Text mt={0.5}>{t.schemes.disclaimerBox}</Text>
        </Box>
      </Alert>

      {/* Tabs: Directory & Assisted Cases */}
      <Tabs variant="enclosed" colorScheme="orange" mb={8}>
        <TabList>
          <Tab fontWeight="bold" fontSize="sm">
            <HStack spacing={2}>
              <FileText size={16} />
              <Text>Scheme Directory & Subsidies</Text>
              {schemes && <Badge colorScheme="orange" borderRadius="full">{schemes.length}</Badge>}
            </HStack>
          </Tab>
          <Tab fontWeight="bold" fontSize="sm">
            <HStack spacing={2}>
              <ShieldCheck size={16} />
              <Text>My Assisted Cases</Text>
              {myCases && myCases.length > 0 && (
                <Badge colorScheme="green" borderRadius="full">{myCases.length}</Badge>
              )}
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          {/* Panel 1: Scheme Directory */}
          <TabPanel px={0} pt={6}>
            {/* Filter Bar */}
            <Card bg="white" shadow="sm" borderRadius="2xl" mb={6} borderWidth="1px">
              <CardBody p={4}>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} alignContent="center">
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                      State / Region Filter
                    </FormLabel>
                    <Select
                      size="sm"
                      borderRadius="lg"
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                    >
                      <option value="ALL">All Jurisdictions (AP, Telangana & Central)</option>
                      <option value="Andhra Pradesh">Andhra Pradesh (ఆంధ్రప్రదేశ్)</option>
                      <option value="Telangana">Telangana (తెలంగాణ)</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                      Sector / Category
                    </FormLabel>
                    <Select
                      size="sm"
                      borderRadius="lg"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="ALL">All Categories</option>
                      <option value="AGRICULTURE">Agriculture & Crop Farming</option>
                      <option value="LIVESTOCK">Livestock, Dairy & Poultry</option>
                      <option value="IRRIGATION">Irrigation & Water Conservation</option>
                      <option value="CREDIT">Farmer Credit & Insurance</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                      Search by Keyword
                    </FormLabel>
                    <Input
                      size="sm"
                      borderRadius="lg"
                      placeholder="e.g., Rythu Bharosa, Solar, Dairy, Drip..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </FormControl>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Schemes Grid */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {schemes?.map((s: any) => (
                <Card
                  key={s.id || s.schemeCode}
                  bg="white"
                  shadow="sm"
                  borderRadius="2xl"
                  borderWidth="1px"
                  borderColor="gray.200"
                  transition="all 0.2s"
                  _hover={{ shadow: 'md', borderColor: 'orange.300' }}
                >
                  <CardBody p={6}>
                    <Flex justify="space-between" align="start" mb={2}>
                      <HStack spacing={2}>
                        <Badge
                          colorScheme={s.jurisdiction === 'STATE' ? 'green' : 'blue'}
                          fontSize="xs"
                          px={2}
                          py={0.5}
                          borderRadius="md"
                        >
                          {s.jurisdiction === 'STATE' ? 'STATE GOVT' : 'CENTRAL GOVT'}
                        </Badge>
                        <Badge colorScheme="purple" fontSize="2xs" px={2} py={0.5} borderRadius="md">
                          {s.category}
                        </Badge>
                      </HStack>

                      <Badge colorScheme="teal" variant="subtle" fontSize="2xs" px={2} py={0.5} borderRadius="full">
                        {s.verificationStatus || 'DEPT VERIFIED'}
                      </Badge>
                    </Flex>

                    <Heading size="md" color="gray.900" mt={2} mb={1}>
                      {language === 'te' ? s.titleTe : language === 'hi' && s.titleHi ? s.titleHi : s.title}
                    </Heading>

                    {s.officialName && s.officialName !== s.title && (
                      <Text fontSize="xs" color="gray.500" mb={2} fontStyle="italic">
                        Official: {s.officialName}
                      </Text>
                    )}

                    <Text fontSize="sm" color="gray.700" mb={4} lineHeight="1.6">
                      {language === 'te' ? s.eligibilitySummaryTe : s.eligibilitySummary}
                    </Text>

                    {/* Benefits Container */}
                    <Box bg="orange.50" p={3.5} borderRadius="xl" mb={4} borderWidth="1px" borderColor="orange.100">
                      <HStack justify="space-between" align="center" mb={1}>
                        <Text fontSize="xs" fontWeight="bold" color="orange.900">
                          Assistance & Benefits (ప్రయోజనాలు):
                        </Text>
                        {s.subsidyPercent && (
                          <Badge colorScheme="orange" fontSize="2xs">{s.subsidyPercent}</Badge>
                        )}
                      </HStack>
                      <Text fontSize="xs" color="gray.800" fontWeight="medium">
                        {language === 'te' ? s.benefitsTe : s.benefits}
                      </Text>
                    </Box>

                    {/* Metadata & Verification Source */}
                    <HStack justify="space-between" fontSize="2xs" color="gray.500" mb={4}>
                      <Text>Applicable: {s.applicableStates?.join(', ') || 'All India'}</Text>
                      <Text>Verified: {s.lastVerifiedDate || '2026-10'}</Text>
                    </HStack>

                    <Divider mb={4} />

                    <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                      <HStack spacing={2} wrap="wrap">
                        <Link
                          href={s.officialSourceUrl}
                          isExternal
                          target="_blank"
                          rel="noopener noreferrer"
                          fontSize="xs"
                          color="blue.600"
                          fontWeight="bold"
                          display="inline-flex"
                          alignItems="center"
                          gap={1}
                          bg="blue.50"
                          px={2.5}
                          py={1.5}
                          borderRadius="md"
                          borderWidth="1px"
                          borderColor="blue.200"
                          _hover={{ textDecoration: 'none', bg: 'blue.100', color: 'blue.800' }}
                        >
                          <Globe size={13} /> Official Portal <ExternalLink size={12} />
                        </Link>

                        {s.backupSourceUrl && (
                          <Link
                            href={s.backupSourceUrl}
                            isExternal
                            target="_blank"
                            rel="noopener noreferrer"
                            fontSize="xs"
                            color="teal.700"
                            fontWeight="medium"
                            display="inline-flex"
                            alignItems="center"
                            gap={1}
                            bg="teal.50"
                            px={2}
                            py={1.5}
                            borderRadius="md"
                            borderWidth="1px"
                            borderColor="teal.200"
                            _hover={{ textDecoration: 'none', bg: 'teal.100', color: 'teal.900' }}
                          >
                            Mirror Portal <ExternalLink size={11} />
                          </Link>
                        )}

                        <Tooltip label="Copy website URL" fontSize="2xs" placement="top">
                          <IconButton
                            aria-label="Copy portal link"
                            icon={<Copy size={13} />}
                            size="xs"
                            variant="outline"
                            colorScheme="gray"
                            onClick={() => {
                              navigator.clipboard.writeText(s.officialSourceUrl);
                              toast({
                                title: 'Portal link copied',
                                description: s.officialSourceUrl,
                                status: 'info',
                                duration: 2500,
                              });
                            }}
                          />
                        </Tooltip>
                      </HStack>

                      <Button
                        colorScheme="brand"
                        size="sm"
                        onClick={() => openPreCheck(s)}
                        fontWeight="bold"
                      >
                        {t.schemes.checkEligibility}
                      </Button>
                    </Flex>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </TabPanel>

          {/* Panel 2: Assisted Applications Tracker */}
          <TabPanel px={0} pt={4}>
            {myCases && myCases.length > 0 ? (
              <VStack spacing={6} align="stretch">
                {myCases.map((c) => (
                  <Card key={c.id || c.caseReference} bg="white" shadow="sm" borderRadius="2xl" borderWidth="1px">
                    <CardBody p={6}>
                      <Flex justify="space-between" align="start" wrap="wrap" gap={2} mb={4}>
                        <Box>
                          <HStack spacing={2} mb={1}>
                            <Badge colorScheme="orange" fontSize="xs" px={2} py={0.5} borderRadius="md">
                              {c.caseReference}
                            </Badge>
                            <Badge colorScheme="blue" fontSize="xs">
                              {c.status}
                            </Badge>
                          </HStack>
                          <Heading size="sm" color="gray.800">
                            {c.schemeTitle}
                          </Heading>
                          <Text fontSize="xs" color="gray.500" mt={0.5}>
                            Filing Date: {new Date(c.createdAt).toLocaleDateString()}
                          </Text>
                        </Box>

                        {/* Operator / Staff Action if Privileged */}
                        {['ADMIN', 'HELP_DESK_OPERATOR'].includes(activeRole) && (
                          <Button
                            size="xs"
                            colorScheme="purple"
                            onClick={() => handleAdvanceCaseStatus(c.id, c.status)}
                            isLoading={isUpdatingStatus}
                          >
                            Advance Status (Operator)
                          </Button>
                        )}
                      </Flex>

                      {/* Status Timeline */}
                      <Box my={4}>
                        <StatusTimeline
                          currentStatus={c.status}
                          statusHistory={c.statusHistory}
                          moduleName="Government Scheme Assistance"
                        />
                      </Box>

                      {/* Required Documents Checklist */}
                      {c.documentChecklist && c.documentChecklist.length > 0 && (
                        <Box bg="gray.50" p={4} borderRadius="xl" mt={4}>
                          <Text fontSize="xs" fontWeight="bold" color="gray.700" mb={2}>
                            Required Documents Checklist:
                          </Text>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                            {c.documentChecklist.map((doc, idx) => (
                              <HStack key={idx} spacing={2} fontSize="xs">
                                {doc.submitted ? (
                                  <CheckCircle2 size={16} color="#2e7d32" />
                                ) : (
                                  <Clock size={16} color="#d97706" />
                                )}
                                <Text color={doc.submitted ? 'green.800' : 'gray.700'}>
                                  {doc.name} {doc.submitted ? '(Verified)' : '(Pending Collection)'}
                                </Text>
                              </HStack>
                            ))}
                          </SimpleGrid>
                        </Box>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            ) : (
              <Card bg="gray.50" p={8} textAlign="center" borderRadius="2xl">
                <VStack spacing={3}>
                  <FileText size={32} color="#718096" />
                  <Heading size="sm" color="gray.700">No Assisted Applications Yet</Heading>
                  <Text fontSize="xs" color="gray.500" maxW="400px">
                    Explore government schemes, run the indicative pre-check, and click "Request RBK Assistance" to receive operator guidance.
                  </Text>
                </VStack>
              </Card>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Pre-Check Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader bg="brand.700" color="white" borderTopRadius="2xl">
            Indicative Eligibility Pre-Check: {activeScheme?.title}
          </ModalHeader>
          <ModalBody p={6}>
            <Stack spacing={4}>
              <Alert status="info" borderRadius="lg" fontSize="xs">
                <AlertIcon />
                This calculator evaluates basic demographic parameters. Official approval requires statutory government scrutiny.
              </Alert>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">{t.schemes.landHolding}</FormLabel>
                <Input
                  type="number"
                  value={landAcres}
                  onChange={(e) => setLandAcres(Number(e.target.value))}
                />
              </FormControl>

              <Checkbox isChecked={hasAadhaar} onChange={(e) => setHasAadhaar(e.target.checked)}>
                <Text fontSize="xs">{t.schemes.ownsAadhaar}</Text>
              </Checkbox>

              <Checkbox isChecked={isTenant} onChange={(e) => setIsTenant(e.target.checked)}>
                <Text fontSize="xs">{t.schemes.isTenant}</Text>
              </Checkbox>

              <Button
                colorScheme="brand"
                onClick={handleRunPreCheck}
                isLoading={isChecking}
                w="full"
                fontWeight="bold"
              >
                Run Assessment
              </Button>

              {preCheckResult && (
                <Box
                  mt={4}
                  p={4}
                  borderRadius="xl"
                  bg={preCheckResult.indicativeEligibility ? 'green.50' : 'red.50'}
                  borderWidth="1px"
                  borderColor={preCheckResult.indicativeEligibility ? 'green.300' : 'red.300'}
                >
                  <HStack spacing={2} mb={2}>
                    {preCheckResult.indicativeEligibility ? (
                      <CheckCircle2 color="#2e7d32" size={20} />
                    ) : (
                      <XCircle color="#d32f2f" size={20} />
                    )}
                    <Text fontWeight="bold" fontSize="sm">
                      {preCheckResult.indicativeEligibility ? t.schemes.eligible : t.schemes.notEligible}
                    </Text>
                  </HStack>

                  {preCheckResult.unmetCriteria?.length > 0 && (
                    <VStack align="start" fontSize="xs" color="red.800" pl={6}>
                      {preCheckResult.unmetCriteria.map((c: string, idx: number) => (
                        <Text key={idx}>• {c}</Text>
                      ))}
                    </VStack>
                  )}

                  <Text fontSize="2xs" color="gray.600" mt={3} fontStyle="italic">
                    {preCheckResult.disclaimer}
                  </Text>

                  {preCheckResult.indicativeEligibility && (
                    <Button
                      size="xs"
                      colorScheme="orange"
                      mt={3}
                      onClick={() => {
                        onClose();
                        onAssistOpen();
                      }}
                    >
                      {t.schemes.requestAssistance}
                    </Button>
                  )}
                </Box>
              )}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Assisted Case Modal with Explicit Consent */}
      <Modal isOpen={isAssistOpen} onClose={onAssistClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader bg="orange.600" color="white" borderTopRadius="2xl">
            RBK Assisted Guidance & Document Checklist
          </ModalHeader>
          <ModalBody p={6}>
            <Stack spacing={4}>
              <Text fontSize="sm" color="gray.700">
                A Rythu Bharosa Kendra (RBK) village agriculture assistant will help assemble statutory documents for: <strong>{activeScheme?.title}</strong>
              </Text>

              <Box bg="gray.50" p={4} borderRadius="xl">
                <Text fontSize="xs" fontWeight="bold" color="gray.700" mb={2}>
                  Required Document Checklist:
                </Text>
                <VStack align="start" spacing={1} fontSize="xs" color="gray.600">
                  {activeScheme?.requiredDocuments?.map((d: string) => (
                    <Text key={d}>• {d}</Text>
                  ))}
                </VStack>
              </Box>

              <Box bg="orange.50" p={4} borderRadius="xl" borderWidth="1px" borderColor="orange.300">
                <Checkbox
                  isChecked={consentGranted}
                  onChange={(e) => setConsentGranted(e.target.checked)}
                  colorScheme="orange"
                >
                  <Text fontSize="xs" fontWeight="bold" color="orange.950">
                    MANDATORY CONSENT: I give explicit authorization for the local RBK assistant to record and review my document checklist for this scheme.
                  </Text>
                </Checkbox>
              </Box>

              <Button
                colorScheme="orange"
                onClick={handleRequestAssistance}
                isLoading={isFilingCase}
                w="full"
                fontWeight="bold"
              >
                Submit Assisted Request
              </Button>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onAssistClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};
