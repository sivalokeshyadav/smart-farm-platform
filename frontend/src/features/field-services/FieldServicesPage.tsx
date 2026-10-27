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
  Textarea,
  useToast,
  Divider,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { translations } from '../../i18n/translations';
import {
  useGetFieldServicesQuery,
  useCreateFieldServiceMutation,
  useUpdateFieldServiceStatusMutation,
} from '../../services';
import {
  Stethoscope,
  Truck,
  ClipboardCheck,
  Phone,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Navigation,
  ThumbsUp,
  AlertCircle,
} from 'lucide-react';
import { StatusTimeline } from '../../components/StatusTimeline';
import { FeedbackModal } from '../../components/FeedbackSystem';

export const FieldServicesPage: React.FC = () => {
  const { language, activeRole, user } = useSelector((state: RootState) => state.auth);
  const t = translations[language];
  const toast = useToast();

  const [serviceType, setServiceType] = useState<string>('VETERINARY');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [farmLocation, setFarmLocation] = useState<string>(
    'Survey No 142/B, Ulchala Village, Kurnool'
  );
  const [contactPhone, setContactPhone] = useState<string>(user?.phone || '9876543210');

  // Review modal state
  const { isOpen: isReviewOpen, onOpen: onReviewOpen, onClose: onReviewClose } = useDisclosure();
  const [reviewTxId, setReviewTxId] = useState<string>('');
  const [reviewTargetName, setReviewTargetName] = useState<string>('');

  const { data: services = [], isLoading } = useGetFieldServicesQuery();
  const [createService, { isLoading: isCreating }] = useCreateFieldServiceMutation();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateFieldServiceStatusMutation();

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !farmLocation) {
      toast({ title: 'Please fill all required fields', status: 'warning' });
      return;
    }

    try {
      await createService({
        serviceType: serviceType as any,
        title,
        description,
        scheduledDate,
        farmLocation,
        contactPhone,
        mandal: 'Kurnool Rural',
        district: 'Kurnool',
        state: 'Andhra Pradesh',
      }).unwrap();

      toast({
        title: 'Field Service Request Submitted!',
        description: 'An authorized district provider has been notified for assignment.',
        status: 'success',
      });
      setTitle('');
      setDescription('');
    } catch (err: any) {
      toast({
        title: 'Submission Failed',
        description: err?.data?.detail || 'An error occurred',
        status: 'error',
      });
    }
  };

  const handleTransition = async (id: string, newStatus: string, notes?: string) => {
    try {
      await updateStatus({
        id,
        newStatus,
        notes: notes || `Status updated to ${newStatus}`,
      }).unwrap();

      toast({
        title: `Status Updated to ${newStatus.replace(/_/g, ' ')}`,
        status: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Status Update Failed',
        description: err?.data?.detail || 'Invalid transition',
        status: 'error',
      });
    }
  };

  const isProvider =
    activeRole === 'VETERINARIAN' ||
    activeRole === 'DELIVERY_WORKER' ||
    activeRole === 'ADMIN';

  return (
    <Container maxW="1400px" py={8}>
      <VStack align="stretch" spacing={6}>
        {/* Header */}
        <Box>
          <HStack spacing={3} mb={1}>
            <Flex bg="teal.100" color="teal.800" p={2} borderRadius="lg">
              <Stethoscope size={24} />
            </Flex>
            <Heading size="lg" color="gray.800">
              {language === 'te'
                ? 'పశువైద్యం & క్షేత్ర సేవల విభాగం'
                : language === 'hi'
                ? 'पशु चिकित्सा एवं फील्ड सेवाएं'
                : 'Field Services & Veterinary Visits'}
            </Heading>
          </HStack>
          <Text fontSize="sm" color="gray.600">
            {language === 'te'
              ? 'పశువుల వైద్య పరీక్షలు, వ్యాక్సినేషన్, వ్యవసాయ యంత్రాల డెలివరీ మరియు క్షేత్ర తనిఖీ సేవలు'
              : language === 'hi'
              ? 'पशु स्वास्थ्य जांच, टीकाकरण, कृषि उपकरण डिलीवरी एवं फील्ड सेवा अनुरोध'
              : 'Request on-farm veterinary visits, equipment delivery dispatch, and verified field consultations with arrival tracking.'}
          </Text>
        </Box>

        <Tabs variant="soft-rounded" colorScheme="teal">
          <TabList>
            <Tab fontSize="xs" fontWeight="bold">
              {language === 'te' ? 'సేవా అభ్యర్థనలు' : language === 'hi' ? 'सेवा अनुरोध' : 'Active Appointments'} ({services.length})
            </Tab>
            <Tab fontSize="xs" fontWeight="bold">
              {language === 'te' ? '+ కొత్త అభ్యర్థన' : language === 'hi' ? '+ नया अनुरोध' : '+ Book Farm Visit'}
            </Tab>
          </TabList>

          <TabPanels mt={4}>
            {/* Panel 1: List of Active Appointments & Arrival Tracking */}
            <TabPanel p={0}>
              {services.length === 0 ? (
                <Card p={8} textAlign="center" borderRadius="2xl" bg="white">
                  <Text color="gray.500">
                    No field service visits logged yet. Click "+ Book Farm Visit" to schedule a veterinarian or delivery.
                  </Text>
                </Card>
              ) : (
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  {services.map((item) => (
                    <Card key={item.id || item._id} borderRadius="2xl" shadow="md" bg="white" overflow="hidden">
                      <CardBody p={5}>
                        <VStack align="stretch" spacing={4}>
                          <Flex justify="space-between" align="start">
                            <Box>
                              <Badge colorScheme="teal" mb={1} fontSize="2xs">
                                {item.serviceType.replace(/_/g, ' ')}
                              </Badge>
                              <Heading size="sm" color="gray.800">
                                {item.title}
                              </Heading>
                              <Text fontSize="xs" color="gray.500" mt={1}>
                                {item.description}
                              </Text>
                            </Box>
                            <Badge
                              colorScheme={
                                item.status === 'COMPLETED'
                                  ? 'green'
                                  : item.status === 'ON_THE_WAY'
                                  ? 'orange'
                                  : item.status === 'REACHED_LOCATION'
                                  ? 'cyan'
                                  : 'blue'
                              }
                              fontSize="xs"
                              px={2}
                              py={1}
                              borderRadius="md"
                            >
                              {item.status.replace(/_/g, ' ')}
                            </Badge>
                          </Flex>

                          <Divider />

                          <SimpleGrid columns={2} spacing={3} fontSize="xs" color="gray.600">
                            <HStack>
                              <Calendar size={14} />
                              <Text>{item.scheduledDate}</Text>
                            </HStack>
                            <HStack>
                              <Clock size={14} />
                              <Text>{item.scheduledTime || 'Morning Slot'}</Text>
                            </HStack>
                            <HStack gridColumn="span 2">
                              <MapPin size={14} />
                              <Text noOfLines={1}>{item.farmLocation}</Text>
                            </HStack>
                            <HStack>
                              <Phone size={14} />
                              <Text>{item.contactPhone}</Text>
                            </HStack>
                            <HStack>
                              <Text fontWeight="semibold">Provider:</Text>
                              <Text>{item.assignedProviderName || 'Awaiting Assignment'}</Text>
                            </HStack>
                          </SimpleGrid>

                          {/* Status Timeline Component */}
                          <StatusTimeline
                            currentStatus={item.status}
                            statusHistory={item.statusHistory}
                            moduleName={item.serviceType}
                          />

                          {/* Action Buttons for Provider & Farmer */}
                          <HStack spacing={2} pt={2} wrap="wrap">
                            {/* Provider Controls: On the Way -> Reached -> Completed */}
                            {isProvider && item.status === 'ACCEPTED' && (
                              <Button
                                size="xs"
                                colorScheme="orange"
                                leftIcon={<Navigation size={14} />}
                                onClick={() => handleTransition(item.id || item._id!, 'ON_THE_WAY', 'Doctor dispatched and travelling to farm.')}
                              >
                                Mark On the Way
                              </Button>
                            )}
                            {isProvider && item.status === 'ON_THE_WAY' && (
                              <Button
                                size="xs"
                                colorScheme="teal"
                                leftIcon={<MapPin size={14} />}
                                onClick={() => handleTransition(item.id || item._id!, 'REACHED_LOCATION', 'Arrived at farmer farm location.')}
                              >
                                Mark Reached Location
                              </Button>
                            )}
                            {isProvider && item.status === 'REACHED_LOCATION' && (
                              <Button
                                size="xs"
                                colorScheme="green"
                                leftIcon={<CheckCircle2 size={14} />}
                                onClick={() => handleTransition(item.id || item._id!, 'COMPLETED', 'Consultation & medical treatment completed.')}
                              >
                                Mark Completed
                              </Button>
                            )}

                            {/* Farmer Review Button upon completion */}
                            {item.status === 'COMPLETED' && (
                              <Button
                                size="xs"
                                colorScheme="purple"
                                variant="outline"
                                leftIcon={<ThumbsUp size={14} />}
                                onClick={() => {
                                  setReviewTxId(item.id || item._id!);
                                  setReviewTargetName(item.assignedProviderName || 'Field Veterinarian');
                                  onReviewOpen();
                                }}
                              >
                                Rate Experience
                              </Button>
                            )}
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>

            {/* Panel 2: Book Farm Visit Form */}
            <TabPanel p={0}>
              <Card maxW="700px" mx="auto" borderRadius="2xl" shadow="md" bg="white">
                <CardBody p={6}>
                  <form onSubmit={handleCreateRequest}>
                    <VStack spacing={4} align="stretch">
                      <Heading size="md" color="gray.800">
                        {language === 'te' ? 'రైతు క్షేత్ర సేవా బుకింగ్' : 'Request On-Farm Field Service'}
                      </Heading>
                      <Text fontSize="xs" color="gray.500">
                        Select whether you require an animal doctor, equipment delivery, or agricultural field inspection.
                      </Text>

                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Service Category</FormLabel>
                        <Select
                          value={serviceType}
                          onChange={(e) => setServiceType(e.target.value)}
                          size="sm"
                          borderRadius="md"
                        >
                          <option value="VETERINARY">Veterinarian Farm Visit (పశువైద్యుడు)</option>
                          <option value="EQUIPMENT_DELIVERY">Farm Machinery Dispatch (యంత్రాల డెలివరీ)</option>
                          <option value="FIELD_INSPECTION">Soil & Crop Health Inspection (క్షేత్ర తనిఖీ)</option>
                          <option value="SCHEME_ASSISTANCE">Govt Scheme Doorstep Assistance (పథకాల సాయం)</option>
                        </Select>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Issue / Service Title</FormLabel>
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g., Murrah Buffalo Vaccination / Harvester Dispatch"
                          size="sm"
                          borderRadius="md"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Detailed Symptoms / Instructions</FormLabel>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Provide details about animal symptoms, machinery requirements, or assistance needed..."
                          size="sm"
                          borderRadius="md"
                          rows={3}
                        />
                      </FormControl>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        <FormControl isRequired>
                          <FormLabel fontSize="xs" fontWeight="bold">Scheduled Date</FormLabel>
                          <Input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            size="sm"
                            borderRadius="md"
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel fontSize="xs" fontWeight="bold">Contact Phone</FormLabel>
                          <Input
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            size="sm"
                            borderRadius="md"
                          />
                        </FormControl>
                      </SimpleGrid>

                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Farm Land / Doorstep Location</FormLabel>
                        <Input
                          value={farmLocation}
                          onChange={(e) => setFarmLocation(e.target.value)}
                          placeholder="e.g., Survey No 142/B, Ulchala Village, Kurnool Rural"
                          size="sm"
                          borderRadius="md"
                        />
                      </FormControl>

                      <Alert status="info" borderRadius="md" fontSize="xs">
                        <AlertIcon />
                        Location evidence and timestamps are recorded transparently upon provider arrival.
                      </Alert>

                      <Button
                        type="submit"
                        colorScheme="teal"
                        isLoading={isCreating}
                        size="md"
                        mt={2}
                      >
                        Submit Field Service Request
                      </Button>
                    </VStack>
                  </form>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Feedback Modal */}
        <FeedbackModal
          isOpen={isReviewOpen}
          onClose={onReviewClose}
          module="VETERINARY"
          transactionId={reviewTxId}
          targetName={reviewTargetName}
        />
      </VStack>
    </Container>
  );
};
