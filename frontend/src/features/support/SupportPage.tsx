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
  Textarea,
  Select,
  useToast,
  Divider,
} from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { translations } from '../../i18n/translations';
import { useCreateSupportCaseMutation, useGetMySupportCasesQuery } from './services/supportApi';
import { LifeBuoy, CheckCircle2, Clock, Phone, AlertCircle } from 'lucide-react';

export const SupportPage: React.FC = () => {
  const { language } = useSelector((state: RootState) => state.auth);
  const t = translations[language];
  const toast = useToast();

  const [category, setCategory] = useState<string>('BOOKING_ISSUE');
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<string>('MEDIUM');

  const { data: myCases, refetch } = useGetMySupportCasesQuery();
  const [createCase, { isLoading: isCreating }] = useCreateSupportCaseMutation();

  const handleCreateCase = async () => {
    if (!subject || !description) {
      toast({ title: 'Please provide subject and description', status: 'warning' });
      return;
    }

    try {
      const res = await createCase({
        category,
        subject,
        description,
        priority,
      }).unwrap();

      toast({
        title: 'Support Case Registered',
        description: `Case Number: ${res.caseNumber}`,
        status: 'success',
      });
      setSubject('');
      setDescription('');
      refetch();
    } catch (err: any) {
      toast({ title: 'Failed to create case', description: err?.data?.detail, status: 'error' });
    }
  };

  return (
    <Container maxW="1200px" py={8}>
      {/* Header */}
      <Box mb={8}>
        <HStack spacing={2} mb={2}>
          <Flex bg="indigo.50" color="indigo.700" p={2} borderRadius="lg">
            <LifeBuoy size={24} />
          </Flex>
          <Badge colorScheme="purple" px={2.5} py={0.5} borderRadius="full">
            Kurnool Farmer Helpdesk & RBK Escalations
          </Badge>
        </HStack>
        <Heading size="lg" color="gray.800" fontWeight="800">
          {t.nav.support}
        </Heading>
        <Text color="gray.600" mt={1}>
          Direct resolution queue for market-yard slots, IVR phone bookings, seed inputs or scheme guidance.
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={8}>
        {/* Left: Create Ticket (5 cols) */}
        <Box gridColumn={{ lg: 'span 5' }}>
          <Card bg="white" shadow="sm" borderRadius="2xl" p={6}>
            <Heading size="sm" mb={4} color="gray.800">
              Submit Support Request
            </Heading>

            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">Category</FormLabel>
                <Select value={category} onChange={(e) => setCategory(e.target.value)} size="md">
                  <option value="BOOKING_ISSUE">Market Booking Issue</option>
                  <option value="IVR_HELP">Phone / IVR Assistance</option>
                  <option value="SCHEME_HELP">Government Scheme Guidance</option>
                  <option value="MARKETPLACE">Agri Inputs & Delivery</option>
                  <option value="GENERAL">General Feedback / Complaint</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">Subject</FormLabel>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Lost token or slot timing query"
                  size="md"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">Details</FormLabel>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain your issue clearly..."
                  rows={4}
                  size="md"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold">Priority</FormLabel>
                <Select value={priority} onChange={(e) => setPriority(e.target.value)} size="md">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High (Urgent Gate Entry)</option>
                </Select>
              </FormControl>

              <Button
                colorScheme="brand"
                size="lg"
                onClick={handleCreateCase}
                isLoading={isCreating}
                fontWeight="bold"
              >
                Submit Helpdesk Case
              </Button>
            </Stack>
          </Card>
        </Box>

        {/* Right: Existing Cases (7 cols) */}
        <Box gridColumn={{ lg: 'span 7' }}>
          <Heading size="sm" mb={4} color="gray.800">
            My Helpdesk Cases & Operator Responses
          </Heading>

          <Stack spacing={4}>
            {myCases && myCases.length > 0 ? (
              myCases.map((c: any) => (
                <Card key={c.id || c.caseNumber} bg="white" shadow="xs" borderRadius="xl">
                  <CardBody p={5}>
                    <Flex justify="space-between" align="center" mb={2}>
                      <Badge colorScheme={c.status === 'RESOLVED' ? 'green' : 'orange'}>
                        {c.status}
                      </Badge>
                      <Text fontSize="2xs" color="gray.500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </Text>
                    </Flex>

                    <Heading size="xs" color="gray.800" mb={1}>
                      {c.caseNumber}: {c.subject}
                    </Heading>
                    <Text fontSize="xs" color="gray.600" mb={3}>
                      {c.description}
                    </Text>

                    {c.resolutionNotes && (
                      <Box bg="green.50" p={3} borderRadius="lg" borderWidth="1px" borderColor="green.200">
                        <Text fontSize="2xs" fontWeight="bold" color="green.800">
                          Operator Resolution Notes:
                        </Text>
                        <Text fontSize="xs" color="green.900">
                          {c.resolutionNotes}
                        </Text>
                      </Box>
                    )}
                  </CardBody>
                </Card>
              ))
            ) : (
              <Text fontSize="sm" color="gray.500">No support cases filed yet.</Text>
            )}
          </Stack>
        </Box>
      </SimpleGrid>
    </Container>
  );
};
