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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  FormControl,
  FormLabel,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tag,
} from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { translations } from '../../i18n/translations';
import {
  useGetAdminKPIsQuery,
  useGetAdminAuditLogsQuery,
  useOverrideCapacityMutation,
  useGetUsersQuery,
  useApproveUserRoleMutation,
  useToggleUserStatusMutation,
} from './services/adminApi';
import {
  useGetFeedbacksQuery,
  useModerateFeedbackMutation,
} from '../feedback/services/feedbackApi';
import { useGetMarketsQuery } from '../markets/services/marketApi';
import {
  Sliders,
  TrendingUp,
  ShieldAlert,
  Building2,
  Warehouse,
  ShoppingBag,
  LifeBuoy,
  FileCheck,
  UserCheck,
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

export const AdminConsolePage: React.FC = () => {
  const { language } = useSelector((state: RootState) => state.auth);
  const t = translations[language];
  const toast = useToast();

  const { data: kpis } = useGetAdminKPIsQuery();
  const { data: auditLogs, refetch: refetchLogs } = useGetAdminAuditLogsQuery();
  const { data: markets } = useGetMarketsQuery();
  const [overrideCapacity, { isLoading: isOverriding }] = useOverrideCapacityMutation();

  // Role approvals & users
  const { data: pendingUsers, refetch: refetchUsers } = useGetUsersQuery({ pendingOnly: true });
  const [approveUserRole, { isLoading: isApproving }] = useApproveUserRoleMutation();
  const [toggleUserStatus] = useToggleUserStatusMutation();

  // Feedback moderation
  const { data: feedbacks, refetch: refetchFeedbacks } = useGetFeedbacksQuery();
  const [moderateFeedback, { isLoading: isModerating }] = useModerateFeedbackMutation();

  const todayStr = new Date().toISOString().split('T')[0];
  const [marketId, setMarketId] = useState<string>('');
  const [slotTime, setSlotTime] = useState<string>('09:00-11:00');
  const [newCapacity, setNewCapacity] = useState<number>(35);
  const [reason, setReason] = useState<string>('High harvest arrival rush reported at gate');

  const effectiveMarketId = marketId || (markets && markets[0]?.id) || '';

  const handleOverride = async () => {
    try {
      await overrideCapacity({
        marketId: effectiveMarketId,
        date: todayStr,
        slotTime,
        newCapacity: Number(newCapacity),
        reason,
      }).unwrap();

      toast({
        title: 'Capacity Overridden Successfully',
        description: `New limit: ${newCapacity} vehicles for slot ${slotTime}`,
        status: 'success',
      });
      refetchLogs();
    } catch (err: any) {
      toast({ title: 'Override failed', description: err?.data?.detail, status: 'error' });
    }
  };

  const handleApproveRole = async (userId: string, role: string, approved: boolean) => {
    try {
      await approveUserRole({
        userId,
        role,
        approved,
        rejectionReason: approved ? undefined : 'Declined by district administrator scrutiny',
      }).unwrap();

      toast({
        title: approved ? 'Role Approved' : 'Role Request Declined',
        description: `User role ${role} has been ${approved ? 'activated' : 'rejected'}.`,
        status: approved ? 'success' : 'info',
      });
      refetchUsers();
      refetchLogs();
    } catch (err: any) {
      toast({
        title: 'Approval action failed',
        description: err?.data?.detail || 'Unable to update user role',
        status: 'error',
      });
    }
  };

  const handleModerate = async (feedbackId: string, status: string) => {
    try {
      await moderateFeedback({
        feedbackId,
        status,
        moderationNotes: `Moderated to ${status} by admin`,
      }).unwrap();

      toast({
        title: 'Review Moderated',
        description: `Status updated to ${status}`,
        status: 'success',
      });
      refetchFeedbacks();
    } catch (err: any) {
      toast({
        title: 'Moderation failed',
        description: err?.data?.detail || 'Could not moderate review',
        status: 'error',
      });
    }
  };

  return (
    <Container maxW="1400px" py={8}>
      {/* Header */}
      <Box mb={8}>
        <HStack spacing={2} mb={2}>
          <Flex bg="gray.100" color="gray.800" p={2} borderRadius="lg">
            <Sliders size={24} />
          </Flex>
          <Badge colorScheme="gray" px={2.5} py={0.5} borderRadius="full">
            Kurnool District Operations
          </Badge>
        </HStack>
        <Heading size="lg" color="gray.800" fontWeight="800">
          {t.admin.title}
        </Heading>
        <Text color="gray.600" mt={1}>
          {t.admin.subtitle}
        </Text>
      </Box>

      {/* KPI Stats Grid */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={8}>
        <Card bg="white" shadow="xs" borderRadius="xl">
          <CardBody p={4}>
            <Stat>
              <StatLabel fontSize="xs" color="gray.500">Bookings Today</StatLabel>
              <StatNumber fontSize="2xl" color="brand.800">{kpis?.totalBookingsToday || 0}</StatNumber>
              <StatHelpText fontSize="2xs" color="gray.500">Checked In: {kpis?.checkedInBookingsToday || 0}</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="white" shadow="xs" borderRadius="xl">
          <CardBody p={4}>
            <Stat>
              <StatLabel fontSize="xs" color="gray.500">Slot Capacity Utilization</StatLabel>
              <StatNumber fontSize="2xl" color="blue.700">{kpis?.slotUtilizationPercent || 0}%</StatNumber>
              <StatHelpText fontSize="2xs" color="gray.500">Kurnool AMC Network</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="white" shadow="xs" borderRadius="xl">
          <CardBody p={4}>
            <Stat>
              <StatLabel fontSize="xs" color="gray.500">Godown Storage</StatLabel>
              <StatNumber fontSize="2xl" color="purple.700">{kpis?.totalGodownReservations || 0}</StatNumber>
              <StatHelpText fontSize="2xs" color="gray.500">Active Warehouse Lots</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="white" shadow="xs" borderRadius="xl">
          <CardBody p={4}>
            <Stat>
              <StatLabel fontSize="xs" color="gray.500">Pending Role Approvals</StatLabel>
              <StatNumber fontSize="2xl" color="orange.700">{pendingUsers?.length || 0}</StatNumber>
              <StatHelpText fontSize="2xs" color="gray.500">Privileged Access Gate</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Admin Tabs */}
      <Tabs variant="enclosed" colorScheme="gray" mb={8}>
        <TabList>
          <Tab fontWeight="bold" fontSize="sm">
            <HStack spacing={2}>
              <UserCheck size={16} />
              <Text>User Role Approvals</Text>
              {pendingUsers && pendingUsers.length > 0 && (
                <Badge colorScheme="red" borderRadius="full">{pendingUsers.length}</Badge>
              )}
            </HStack>
          </Tab>
          <Tab fontWeight="bold" fontSize="sm">
            <HStack spacing={2}>
              <Sliders size={16} />
              <Text>Capacity & Audit Logs</Text>
            </HStack>
          </Tab>
          <Tab fontWeight="bold" fontSize="sm">
            <HStack spacing={2}>
              <Star size={16} />
              <Text>Feedback & Moderation</Text>
              {feedbacks && <Badge colorScheme="blue" borderRadius="full">{feedbacks.length}</Badge>}
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          {/* Tab 1: User Role Approvals */}
          <TabPanel px={0} pt={6}>
            <Card bg="white" shadow="sm" borderRadius="2xl" p={6}>
              <Flex justify="space-between" align="center" mb={4}>
                <Box>
                  <Heading size="sm" color="gray.800">
                    Privileged Role Verification Gate
                  </Heading>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>
                    Only administrators can verify and approve privileged roles (Veterinarians, Market Staff, Godown Operators, Helpdesk Operators).
                  </Text>
                </Box>
                <Button size="xs" onClick={() => refetchUsers()} variant="outline">
                  Refresh List
                </Button>
              </Flex>

              {pendingUsers && pendingUsers.length > 0 ? (
                <Box overflowX="auto">
                  <Table size="sm" variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th fontSize="2xs">Applicant Name</Th>
                        <Th fontSize="2xs">Phone</Th>
                        <Th fontSize="2xs">Requested Role</Th>
                        <Th fontSize="2xs">District / Mandal</Th>
                        <Th fontSize="2xs">Current Roles</Th>
                        <Th fontSize="2xs" textAlign="center">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {pendingUsers.map((u) => {
                        const rolesToApprove = u.pendingRoles && u.pendingRoles.length > 0 ? u.pendingRoles : [u.role];
                        return rolesToApprove.map((reqRole) => (
                          <Tr key={`${u.id}-${reqRole}`}>
                            <Td fontWeight="bold" fontSize="xs">
                              {(u as any).fullName || u.name}
                            </Td>
                            <Td fontSize="xs" color="gray.600">{u.phone}</Td>
                            <Td>
                              <Badge colorScheme="orange" fontSize="xs">
                                {t.roles[reqRole] || reqRole}
                              </Badge>
                            </Td>
                            <Td fontSize="xs" color="gray.600">
                              {u.district || 'Kurnool'} / {u.mandal || 'Kurnool'}
                            </Td>
                            <Td fontSize="2xs">
                              {u.roles?.join(', ') || 'None'}
                            </Td>
                            <Td textAlign="center">
                              <HStack spacing={2} justify="center">
                                <Button
                                  size="xs"
                                  colorScheme="green"
                                  onClick={() => handleApproveRole(u.id, reqRole, true)}
                                  isLoading={isApproving}
                                  leftIcon={<CheckCircle2 size={13} />}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="xs"
                                  colorScheme="red"
                                  variant="outline"
                                  onClick={() => handleApproveRole(u.id, reqRole, false)}
                                  isLoading={isApproving}
                                  leftIcon={<XCircle size={13} />}
                                >
                                  Decline
                                </Button>
                              </HStack>
                            </Td>
                          </Tr>
                        ));
                      })}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <Box bg="green.50" p={6} borderRadius="xl" textAlign="center" borderWidth="1px" borderColor="green.200">
                  <CheckCircle2 color="#2e7d32" size={28} style={{ margin: '0 auto 8px' }} />
                  <Text fontWeight="bold" fontSize="sm" color="green.900">
                    No Pending Role Approval Requests
                  </Text>
                  <Text fontSize="xs" color="green.700" mt={1}>
                    All registered users have been processed or are on self-approved unprivileged tiers.
                  </Text>
                </Box>
              )}
            </Card>
          </TabPanel>

          {/* Tab 2: Capacity Override & Audit Logs */}
          <TabPanel px={0} pt={6}>
            <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={8} mb={6}>
              {/* Capacity Management Override (5 cols) */}
              <Box gridColumn={{ lg: 'span 5' }}>
                <Card bg="white" shadow="sm" borderRadius="2xl" p={6}>
                  <Heading size="sm" mb={4} color="gray.800">
                    {t.admin.capacityManagement}
                  </Heading>

                  <Stack spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="bold">Market Yard</FormLabel>
                      <Select
                        value={effectiveMarketId}
                        onChange={(e) => setMarketId(e.target.value)}
                        size="md"
                      >
                        {markets?.map((m: any) => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="bold">Arrival Slot</FormLabel>
                      <Select value={slotTime} onChange={(e) => setSlotTime(e.target.value)} size="md">
                        <option value="07:00-09:00">07:00 - 09:00 AM</option>
                        <option value="09:00-11:00">09:00 - 11:00 AM</option>
                        <option value="11:00-13:00">11:00 - 01:00 PM</option>
                        <option value="14:00-16:00">02:00 - 04:00 PM</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="bold">New Capacity (Vehicles)</FormLabel>
                      <Input
                        type="number"
                        value={newCapacity}
                        onChange={(e) => setNewCapacity(Number(e.target.value))}
                        size="md"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="bold">Statutory Reason Code</FormLabel>
                      <Input
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Required for audit compliance"
                        size="md"
                      />
                    </FormControl>

                    <Button
                      colorScheme="gray"
                      bg="gray.800"
                      color="white"
                      _hover={{ bg: 'gray.900' }}
                      onClick={handleOverride}
                      isLoading={isOverriding}
                      size="md"
                      fontWeight="bold"
                    >
                      Apply Capacity Override
                    </Button>
                  </Stack>
                </Card>
              </Box>

              {/* Audit Logs Inspection (7 cols) */}
              <Box gridColumn={{ lg: 'span 7' }}>
                <Card bg="white" shadow="sm" borderRadius="2xl" p={6}>
                  <Heading size="sm" mb={4} color="gray.800">
                    {t.admin.auditLogs}
                  </Heading>

                  <Box overflowX="auto" maxH="400px" overflowY="auto">
                    <Table size="sm" variant="simple">
                      <Thead bg="gray.50">
                        <Tr>
                          <Th fontSize="2xs">Action</Th>
                          <Th fontSize="2xs">Resource</Th>
                          <Th fontSize="2xs">Role</Th>
                          <Th fontSize="2xs">Timestamp</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {auditLogs?.map((log: any) => (
                          <Tr key={log.id}>
                            <Td fontWeight="bold" fontSize="xs">
                              <Badge colorScheme="purple" fontSize="2xs">{log.action}</Badge>
                            </Td>
                            <Td fontSize="xs" color="gray.600">{log.resourceId || log.resource}</Td>
                            <Td fontSize="2xs">{log.userRole || 'SYSTEM'}</Td>
                            <Td fontSize="2xs" color="gray.500">{new Date(log.timestamp).toLocaleTimeString()}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </Card>
              </Box>
            </SimpleGrid>
          </TabPanel>

          {/* Tab 3: Feedback & Moderation */}
          <TabPanel px={0} pt={6}>
            <Card bg="white" shadow="sm" borderRadius="2xl" p={6}>
              <Flex justify="space-between" align="center" mb={4}>
                <Box>
                  <Heading size="sm" color="gray.800">
                    Platform Feedback Moderation
                  </Heading>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>
                    Scrutinize participant ratings across markets, veterinary consultations, and godowns to ensure platform trust.
                  </Text>
                </Box>
                <Button size="xs" onClick={() => refetchFeedbacks()} variant="outline">
                  Refresh
                </Button>
              </Flex>

              {feedbacks && feedbacks.length > 0 ? (
                <Box overflowX="auto">
                  <Table size="sm" variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th fontSize="2xs">Module</Th>
                        <Th fontSize="2xs">Rating</Th>
                        <Th fontSize="2xs">Author</Th>
                        <Th fontSize="2xs">Comment / Tags</Th>
                        <Th fontSize="2xs">Status</Th>
                        <Th fontSize="2xs" textAlign="center">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {feedbacks.map((fb) => (
                        <Tr key={fb.id}>
                          <Td fontSize="xs" fontWeight="bold">
                            <Badge colorScheme="purple" fontSize="2xs">{fb.module}</Badge>
                          </Td>
                          <Td>
                            <HStack spacing={1}>
                              <Star size={14} color="#f59e0b" fill="#f59e0b" />
                              <Text fontSize="xs" fontWeight="bold">{fb.rating} / 5</Text>
                            </HStack>
                          </Td>
                          <Td fontSize="xs" color="gray.700">
                            {(fb as any).authorName || fb.raterName}
                            <Text fontSize="2xs" color="gray.500">{(fb as any).authorRole || fb.raterRole}</Text>
                          </Td>
                          <Td fontSize="xs" maxW="300px">
                            <Text noOfLines={2}>{fb.reviewText || (fb as any).comment || 'No written comment'}</Text>
                            {fb.tags && fb.tags.length > 0 && (
                              <HStack spacing={1} mt={1} wrap="wrap">
                                {fb.tags.map((t) => (
                                  <Badge key={t} colorScheme="blue" fontSize="3xs">{t}</Badge>
                                ))}
                              </HStack>
                            )}
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={fb.status === 'PUBLISHED' ? 'green' : fb.status === 'FLAGGED' ? 'red' : 'gray'}
                              fontSize="2xs"
                            >
                              {fb.status}
                            </Badge>
                          </Td>
                          <Td textAlign="center">
                            <HStack spacing={2} justify="center">
                              {fb.status !== 'PUBLISHED' && (
                                <Button
                                  size="xs"
                                  colorScheme="green"
                                  onClick={() => handleModerate(fb.id, 'PUBLISHED')}
                                  isLoading={isModerating}
                                >
                                  Publish
                                </Button>
                              )}
                              {fb.status !== 'FLAGGED' && (
                                <Button
                                  size="xs"
                                  colorScheme="red"
                                  variant="outline"
                                  onClick={() => handleModerate(fb.id, 'FLAGGED')}
                                  isLoading={isModerating}
                                >
                                  Flag
                                </Button>
                              )}
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <Box bg="gray.50" p={8} textAlign="center" borderRadius="xl">
                  <Star size={28} color="#a0aec0" style={{ margin: '0 auto 8px' }} />
                  <Text fontWeight="bold" fontSize="sm" color="gray.700">No Reviews to Moderate</Text>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Submitted feedback will appear here for administrative oversight and quality assurance.
                  </Text>
                </Box>
              )}
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};
