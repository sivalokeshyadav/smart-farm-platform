import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Card,
  CardBody,
  Stack,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  HStack,
  Badge,
  useToast,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  Checkbox,
  CheckboxGroup,
  SimpleGrid,
  Alert,
  AlertIcon,
  Tag,
  TagLabel,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { setCredentials, UserRole } from '../../app/authSlice';
import { translations } from '../../i18n/translations';
import {
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useLoginWithPasswordMutation,
  useRegisterUserMutation,
} from './services/authApi';
import { ROUTES } from '../../routes';
import { Sprout, Phone, Key, UserPlus, ShieldCheck } from 'lucide-react';

const QUICK_DEMO_USERS = [
  { phone: '9876543210', name: 'Ramesh Reddy', role: 'FARMER', colorScheme: 'green', desc: 'Farmer' },
  { phone: '9876543211', name: 'Srinivasulu', role: 'MARKET_STAFF', colorScheme: 'blue', desc: 'Market Gate Staff' },
  { phone: '9876543212', name: 'Venkatesh', role: 'GODOWN_OPERATOR', colorScheme: 'cyan', desc: 'Warehouse Manager' },
  { phone: '9876543214', name: 'Padmavathi', role: 'HELP_DESK_OPERATOR', colorScheme: 'orange', desc: 'RBK Helpdesk Operator' },
  { phone: '9876543215', name: 'Admin Officer', role: 'ADMIN', colorScheme: 'purple', desc: 'District Admin' },
  { phone: '9876543226', name: 'Dr. Chandrasekhar', role: 'VETERINARIAN', colorScheme: 'red', desc: 'Veterinarian' },
  { phone: '9876543220', name: 'Suresh Grain Traders', role: 'CROP_BUYER', colorScheme: 'teal', desc: 'Grain Buyer' },
];

const ALL_ROLES_OPTIONS: { role: UserRole; label: string; privileged: boolean }[] = [
  { role: 'FARMER', label: 'Farmer', privileged: false },
  { role: 'CROP_BUYER', label: 'Crop Buyer', privileged: false },
  { role: 'CROP_SELLER', label: 'Crop Seller', privileged: false },
  { role: 'LIVESTOCK_BUYER', label: 'Livestock Buyer', privileged: false },
  { role: 'LIVESTOCK_SELLER', label: 'Livestock Seller', privileged: false },
  { role: 'EQUIPMENT_BUYER', label: 'Equipment Buyer', privileged: false },
  { role: 'EQUIPMENT_SELLER', label: 'Equipment Rental Provider', privileged: false },
  { role: 'VETERINARIAN', label: 'Veterinarian', privileged: true },
  { role: 'MARKET_STAFF', label: 'Market Yard Staff', privileged: true },
  { role: 'GODOWN_OPERATOR', label: 'Godown Operator', privileged: true },
  { role: 'DELIVERY_WORKER', label: 'Delivery & Field Logistics', privileged: false },
  { role: 'HELP_DESK_OPERATOR', label: 'Govt Scheme Operator', privileged: true },
  { role: 'ADMIN', label: 'District Admin / Collectorate', privileged: true },
];

export const LoginPage: React.FC = () => {
  const { language } = useSelector((state: RootState) => state.auth);
  const t = translations[language];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const [phone, setPhone] = useState<string>('9876543210');
  const [otp, setOtp] = useState<string>('');
  const [password, setPassword] = useState<string>('farm1234');
  const [otpSent, setOtpSent] = useState<boolean>(false);

  // Registration Form State
  const [regName, setRegName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regState, setRegState] = useState<string>('Andhra Pradesh');
  const [regDistrict, setRegDistrict] = useState<string>('Kurnool');
  const [regMandal, setRegMandal] = useState<string>('Kurnool Rural');
  const [regVillage, setRegVillage] = useState<string>('Ulchala');
  const [regLang, setRegLang] = useState<string>('en');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['FARMER']);

  const [requestOtp, { isLoading: isSendingOtp }] = useRequestOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [loginWithPassword, { isLoading: isLoggingIn }] = useLoginWithPasswordMutation();
  const [registerUser, { isLoading: isRegistering }] = useRegisterUserMutation();

  const handlePasswordLogin = async (loginPhone?: string, loginPass?: string) => {
    const targetPhone = loginPhone || phone;
    const targetPass = loginPass || password;

    if (!targetPhone || targetPhone.length < 10) {
      toast({ title: 'Enter a valid 10-digit mobile number', status: 'warning' });
      return;
    }

    try {
      const res = await loginWithPassword({ phone: targetPhone, password: targetPass }).unwrap();
      dispatch(setCredentials({ token: res.access_token, user: res.user }));
      toast({ title: `Welcome, ${res.user.name}!`, status: 'success', duration: 2000 });
      navigate(ROUTES.HOME);
    } catch (err: any) {
      toast({
        title: 'Login Failed',
        description: err?.data?.detail || 'Invalid phone or password. Default is farm1234.',
        status: 'error',
      });
    }
  };

  const handleQuickDemoClick = (demoUser: typeof QUICK_DEMO_USERS[0]) => {
    setPhone(demoUser.phone);
    setPassword('farm1234');
    handlePasswordLogin(demoUser.phone, 'farm1234');
  };

  const handleRequestOtp = async () => {
    if (!phone || phone.length < 10) {
      toast({ title: 'Enter a valid 10-digit mobile number', status: 'warning' });
      return;
    }
    try {
      const res = await requestOtp({ phone }).unwrap();
      setOtpSent(true);
      toast({
        title: 'OTP Sent',
        description: res.message || 'OTP sent successfully (123456 in pilot)',
        status: 'info',
        duration: 4000,
      });
    } catch (err: any) {
      toast({ title: 'OTP Request Failed', description: err?.data?.detail, status: 'error' });
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await verifyOtp({ phone, otp }).unwrap();
      dispatch(setCredentials({ token: res.access_token, user: res.user }));
      toast({ title: `Welcome, ${res.user.name}!`, status: 'success', duration: 2000 });
      navigate(ROUTES.HOME);
    } catch (err: any) {
      toast({ title: 'Invalid OTP', description: err?.data?.detail, status: 'error' });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone || regPhone.length < 10 || !regName || !regPassword) {
      toast({ title: 'Please fill in all mandatory fields', status: 'warning' });
      return;
    }

    try {
      const res = await registerUser({
        phone: regPhone,
        name: regName,
        email: regEmail || undefined,
        password: regPassword,
        state: regState,
        district: regDistrict,
        mandal: regMandal,
        village: regVillage,
        preferredLanguage: regLang,
        requestedRoles: selectedRoles,
      }).unwrap();

      dispatch(setCredentials({ token: res.access_token, user: res.user }));
      toast({
        title: 'Registration Successful!',
        description: res.user.pendingRoles?.length
          ? `Account created. Note: Role(s) ${res.user.pendingRoles.join(', ')} require admin approval.`
          : 'Welcome to Smart Farmer Platform!',
        status: 'success',
        duration: 4000,
      });
      navigate(ROUTES.HOME);
    } catch (err: any) {
      toast({
        title: 'Registration Failed',
        description: err?.data?.detail || 'An error occurred during registration.',
        status: 'error',
      });
    }
  };

  return (
    <Box minH="100vh" bgGradient="linear(to-b, gray.50, brand.50)" py={{ base: 6, md: 12 }} px={4} display="flex" alignItems="center">
      <Container maxW="680px">
        <Card bg="white" shadow="2xl" borderRadius="3xl" borderWidth="1px" borderColor="brand.100" overflow="hidden">
          {/* Header branding */}
          <Box bg="white" pt={8} pb={4} px={{ base: 6, md: 8 }} textAlign="center">
            <Flex justify="center" mb={3}>
              <Flex bg="brand.50" color="brand.600" p={3.5} borderRadius="2xl" shadow="sm">
                <Sprout size={40} />
              </Flex>
            </Flex>
            <Heading size="lg" color="brand.900" fontWeight="900" letterSpacing="-0.5px">
              {t.appName}
            </Heading>
            <Text fontSize="xs" color="gray.500" mt={1} fontWeight="medium">
              Andhra Pradesh & Regional Agricultural Unified Gateway (Kurnool Pilot)
            </Text>
          </Box>

          <CardBody px={{ base: 6, md: 8 }} pt={2} pb={8}>
            <VStack spacing={6} align="stretch">
              {/* 1-Click Quick Demo Accounts Selector */}
              <Box bg="gray.50" p={4} borderRadius="2xl" borderWidth="1px" borderColor="gray.200">
                <Text fontSize="xs" fontWeight="bold" color="gray.700" mb={2}>
                  1-Click Pilot Login (Click any role to test):
                </Text>
                <Flex wrap="wrap" gap={2}>
                  {QUICK_DEMO_USERS.map((u) => (
                    <Tag
                      key={u.phone}
                      size="md"
                      colorScheme={u.colorScheme}
                      borderRadius="full"
                      cursor="pointer"
                      transition="all 0.15s"
                      _hover={{ transform: 'scale(1.05)', shadow: 'sm' }}
                      onClick={() => handleQuickDemoClick(u)}
                      py={1}
                      px={3}
                    >
                      <TagLabel fontWeight="bold" fontSize="2xs">
                        {u.name} ({u.desc})
                      </TagLabel>
                    </Tag>
                  ))}
                </Flex>
                <Text fontSize="2xs" color="gray.500" mt={2}>
                  Default password for all pilot accounts: <b>farm1234</b>
                </Text>
              </Box>

              <Tabs isFitted variant="soft-rounded" colorScheme="brand" defaultIndex={0}>
                <TabList mb={4} bg="gray.100" p={1} borderRadius="2xl">
                  <Tab fontSize="xs" fontWeight="bold" borderRadius="xl">
                    <Key size={14} style={{ marginRight: '6px' }} />
                    Password Login
                  </Tab>
                  <Tab fontSize="xs" fontWeight="bold" borderRadius="xl">
                    <Phone size={14} style={{ marginRight: '6px' }} />
                    OTP Flow
                  </Tab>
                  <Tab fontSize="xs" fontWeight="bold" borderRadius="xl">
                    <UserPlus size={14} style={{ marginRight: '6px' }} />
                    Register New
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* 1. Password Tab (Primary) */}
                  <TabPanel p={0}>
                    <Stack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">{t.phone}</FormLabel>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          size="md"
                          borderRadius="xl"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Password</FormLabel>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password (default: farm1234)"
                          size="md"
                          borderRadius="xl"
                        />
                      </FormControl>

                      <Button
                        colorScheme="brand"
                        onClick={() => handlePasswordLogin()}
                        isLoading={isLoggingIn}
                        size="md"
                        borderRadius="xl"
                        fontWeight="bold"
                        shadow="md"
                        mt={2}
                      >
                        Login with Password
                      </Button>
                    </Stack>
                  </TabPanel>

                  {/* 2. OTP Tab */}
                  <TabPanel p={0}>
                    <Stack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">{t.phone}</FormLabel>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g., 9876543210"
                          size="md"
                          borderRadius="xl"
                        />
                      </FormControl>

                      {otpSent && (
                        <FormControl isRequired>
                          <FormLabel fontSize="xs" fontWeight="bold">{t.otp}</FormLabel>
                          <Input
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP (123456 in pilot)"
                            size="md"
                            borderRadius="xl"
                          />
                        </FormControl>
                      )}

                      {!otpSent ? (
                        <Button
                          colorScheme="brand"
                          onClick={handleRequestOtp}
                          isLoading={isSendingOtp}
                          size="md"
                          borderRadius="xl"
                        >
                          {t.sendOtp}
                        </Button>
                      ) : (
                        <Button
                          colorScheme="brand"
                          onClick={handleVerifyOtp}
                          isLoading={isVerifying}
                          size="md"
                          borderRadius="xl"
                        >
                          {t.verifyOtp}
                        </Button>
                      )}
                    </Stack>
                  </TabPanel>

                  {/* 3. Register Tab */}
                  <TabPanel p={0}>
                    <form onSubmit={handleRegister}>
                      <Stack spacing={3}>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                          <FormControl isRequired>
                            <FormLabel fontSize="xs" fontWeight="bold">Full Name</FormLabel>
                            <Input
                              size="sm"
                              borderRadius="lg"
                              value={regName}
                              onChange={(e) => setRegName(e.target.value)}
                              placeholder="e.g. Ramesh Reddy"
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel fontSize="xs" fontWeight="bold">{t.phone}</FormLabel>
                            <Input
                              size="sm"
                              borderRadius="lg"
                              value={regPhone}
                              onChange={(e) => setRegPhone(e.target.value)}
                              placeholder="10-digit mobile"
                            />
                          </FormControl>
                        </SimpleGrid>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                          <FormControl>
                            <FormLabel fontSize="xs" fontWeight="bold">Email (Optional)</FormLabel>
                            <Input
                              size="sm"
                              borderRadius="lg"
                              type="email"
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              placeholder="farmer@example.com"
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel fontSize="xs" fontWeight="bold">Create Password</FormLabel>
                            <Input
                              size="sm"
                              borderRadius="lg"
                              type="password"
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              placeholder="Min 6 characters"
                            />
                          </FormControl>
                        </SimpleGrid>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                          <FormControl isRequired>
                            <FormLabel fontSize="xs" fontWeight="bold">State</FormLabel>
                            <Select size="sm" borderRadius="lg" value={regState} onChange={(e) => setRegState(e.target.value)}>
                              <option value="Andhra Pradesh">Andhra Pradesh</option>
                              <option value="Telangana">Telangana</option>
                              <option value="Karnataka">Karnataka</option>
                            </Select>
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel fontSize="xs" fontWeight="bold">District</FormLabel>
                            <Input size="sm" borderRadius="lg" value={regDistrict} onChange={(e) => setRegDistrict(e.target.value)} />
                          </FormControl>
                        </SimpleGrid>

                        <FormControl isRequired>
                          <FormLabel fontSize="xs" fontWeight="bold">Select Role(s)</FormLabel>
                          <CheckboxGroup value={selectedRoles} onChange={(vals) => setSelectedRoles(vals as string[])}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2} maxH="160px" overflowY="auto" p={2} bg="gray.50" borderRadius="lg">
                              {ALL_ROLES_OPTIONS.map((r) => (
                                <Checkbox key={r.role} value={r.role} size="sm">
                                  <Text fontSize="2xs">
                                    {r.label}
                                    {r.privileged && <Badge ml={1} colorScheme="orange" fontSize="3xs">Admin Approval</Badge>}
                                  </Text>
                                </Checkbox>
                              ))}
                            </SimpleGrid>
                          </CheckboxGroup>
                        </FormControl>

                        <Button
                          type="submit"
                          colorScheme="brand"
                          isLoading={isRegistering}
                          size="md"
                          borderRadius="xl"
                          mt={2}
                          fontWeight="bold"
                        >
                          Create Account
                        </Button>
                      </Stack>
                    </form>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;
