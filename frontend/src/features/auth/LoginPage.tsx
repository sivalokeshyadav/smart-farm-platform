import React, { useState, useEffect } from 'react';
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
import { Sprout, Phone, Key, UserPlus, ShieldCheck, ArrowRight } from 'lucide-react';

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
  { role: 'CROP_BUYER', label: 'Crop Buyer / Mandi Trader', privileged: false },
  { role: 'CROP_SELLER', label: 'Crop Seller / Input Dealer', privileged: false },
  { role: 'LIVESTOCK_BUYER', label: 'Livestock Buyer', privileged: false },
  { role: 'LIVESTOCK_SELLER', label: 'Livestock Seller', privileged: false },
  { role: 'EQUIPMENT_BUYER', label: 'Equipment Rental Buyer', privileged: false },
  { role: 'EQUIPMENT_SELLER', label: 'Equipment Rental Provider', privileged: false },
  { role: 'VETERINARIAN', label: 'Veterinarian (Doctor)', privileged: true },
  { role: 'MARKET_STAFF', label: 'Market Yard Staff (APMC Gate)', privileged: true },
  { role: 'GODOWN_OPERATOR', label: 'Godown Operator (Warehouse)', privileged: true },
  { role: 'DELIVERY_WORKER', label: 'Delivery & Field Logistics', privileged: false },
  { role: 'HELP_DESK_OPERATOR', label: 'Help Desk / Scheme Operator', privileged: true },
  { role: 'ADMIN', label: 'District Admin / Collectorate', privileged: true },
];

interface LoginPageProps {
  defaultTab?: 'login' | 'register';
}

export const LoginPage: React.FC<LoginPageProps> = ({ defaultTab = 'login' }) => {
  const { language } = useSelector((state: RootState) => state.auth);
  const t = translations[language] || translations.en;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const [tabIndex, setTabIndex] = useState<number>(defaultTab === 'register' ? 1 : 0);

  useEffect(() => {
    if (defaultTab === 'register') {
      setTabIndex(1);
    } else {
      setTabIndex(0);
    }
  }, [defaultTab]);

  // Login State
  const [phone, setPhone] = useState<string>('9876543210');
  const [password, setPassword] = useState<string>('farm1234');
  const [otp, setOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);

  // Registration State
  const [regName, setRegName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('farm1234');
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
      toast({ title: `Welcome, ${res.user.name}!`, status: 'success', duration: 2500 });
      navigate(ROUTES.HOME);
    } catch (err: any) {
      toast({
        title: 'Login Failed',
        description: err?.data?.detail || 'Invalid phone or password. Default password is farm1234.',
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
      toast({ title: `Welcome, ${res.user.name}!`, status: 'success', duration: 2500 });
      navigate(ROUTES.HOME);
    } catch (err: any) {
      toast({ title: 'Invalid OTP', description: err?.data?.detail, status: 'error' });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone || regPhone.length < 10 || !regName || !regPassword) {
      toast({ title: 'Please fill in Full Name, 10-digit Mobile, and Password', status: 'warning' });
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
          ? `Account created. Role(s) ${res.user.pendingRoles.join(', ')} require admin approval.`
          : `Welcome to Smart Farmer Platform, ${res.user.name}!`,
        status: 'success',
        duration: 4000,
      });
      navigate(ROUTES.HOME);
    } catch (err: any) {
      toast({
        title: 'Registration Failed',
        description: err?.data?.detail || 'An error occurred during registration. User may already exist.',
        status: 'error',
      });
    }
  };

  return (
    <Box minH="100vh" bgGradient="linear(to-b, gray.50, brand.50)" py={{ base: 6, md: 10 }} px={4} display="flex" alignItems="center">
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
              Smart Farmer Platform
            </Heading>
            <Text fontSize="xs" color="gray.500" mt={1} fontWeight="medium">
              National Agricultural Gateway • All-India APMC Markets & Farmer Services
            </Text>
          </Box>

          <CardBody px={{ base: 6, md: 8 }} pt={2} pb={8}>
            <VStack spacing={5} align="stretch">
              {/* Primary Tabs: Sign In / Register / OTP */}
              <Tabs
                isFitted
                variant="solid-rounded"
                colorScheme="brand"
                index={tabIndex}
                onChange={(idx) => setTabIndex(idx)}
              >
                <TabList mb={5} bg="gray.100" p={1.5} borderRadius="2xl">
                  <Tab fontSize="xs" fontWeight="bold" borderRadius="xl">
                    <Key size={14} style={{ marginRight: '6px' }} />
                    Sign In
                  </Tab>
                  <Tab fontSize="xs" fontWeight="bold" borderRadius="xl">
                    <UserPlus size={14} style={{ marginRight: '6px' }} />
                    Register
                  </Tab>
                  <Tab fontSize="xs" fontWeight="bold" borderRadius="xl">
                    <Phone size={14} style={{ marginRight: '6px' }} />
                    OTP Login
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* 1. SIGN IN (PASSWORD) */}
                  <TabPanel p={0}>
                    <Stack spacing={4}>
                      {/* 1-Click Pilot Demo Badges */}
                      <Box bg="gray.50" p={3.5} borderRadius="2xl" borderWidth="1px" borderColor="gray.200">
                        <Text fontSize="xs" fontWeight="bold" color="gray.700" mb={2}>
                          1-Click Pilot Demo Login (Click any role to test):
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
                          Default password for all seeded pilot accounts: <b>farm1234</b>
                        </Text>
                      </Box>

                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Mobile Number</FormLabel>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          size="md"
                          borderRadius="xl"
                          type="tel"
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
                        Sign In
                      </Button>

                      <Flex justify="center" pt={2}>
                        <Button
                          variant="link"
                          colorScheme="brand"
                          fontSize="xs"
                          fontWeight="bold"
                          onClick={() => setTabIndex(1)}
                        >
                          New to Smart Farmer Platform? Register here →
                        </Button>
                      </Flex>
                    </Stack>
                  </TabPanel>

                  {/* 2. REGISTER NEW ACCOUNT */}
                  <TabPanel p={0}>
                    <form onSubmit={handleRegister}>
                      <Stack spacing={3.5}>
                        <Alert status="info" borderRadius="xl" py={2} px={3} fontSize="xs">
                          <AlertIcon boxSize="14px" />
                          Register to access APMC market slot booking, godown storage, veterinary visits, and agri calculators.
                        </Alert>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                          <FormControl isRequired>
                            <FormLabel fontSize="xs" fontWeight="bold">Full Name</FormLabel>
                            <Input
                              size="sm"
                              borderRadius="lg"
                              value={regName}
                              onChange={(e) => setRegName(e.target.value)}
                              placeholder="e.g. Siva Lokesh"
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel fontSize="xs" fontWeight="bold">10-Digit Mobile Number</FormLabel>
                            <Input
                              size="sm"
                              borderRadius="lg"
                              value={regPhone}
                              onChange={(e) => setRegPhone(e.target.value)}
                              placeholder="e.g. 9988776655"
                              type="tel"
                            />
                          </FormControl>
                        </SimpleGrid>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                          <FormControl isRequired>
                            <FormLabel fontSize="xs" fontWeight="bold">Password</FormLabel>
                            <Input
                              type="password"
                              size="sm"
                              borderRadius="lg"
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              placeholder="Minimum 6 characters"
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="xs" fontWeight="bold">Email (Optional)</FormLabel>
                            <Input
                              type="email"
                              size="sm"
                              borderRadius="lg"
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              placeholder="farmer@example.com"
                            />
                          </FormControl>
                        </SimpleGrid>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                          <FormControl isRequired>
                            <FormLabel fontSize="xs" fontWeight="bold">State</FormLabel>
                            <Select
                              size="sm"
                              borderRadius="lg"
                              value={regState}
                              onChange={(e) => setRegState(e.target.value)}
                            >
                              <option value="Andhra Pradesh">Andhra Pradesh</option>
                              <option value="Telangana">Telangana</option>
                              <option value="Karnataka">Karnataka</option>
                              <option value="Tamil Nadu">Tamil Nadu</option>
                              <option value="Maharashtra">Maharashtra</option>
                            </Select>
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel fontSize="xs" fontWeight="bold">District</FormLabel>
                            <Input
                              size="sm"
                              borderRadius="lg"
                              value={regDistrict}
                              onChange={(e) => setRegDistrict(e.target.value)}
                              placeholder="e.g. Kurnool, Nandyal"
                            />
                          </FormControl>
                        </SimpleGrid>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                          <FormControl>
                            <FormLabel fontSize="xs" fontWeight="bold">Mandal</FormLabel>
                            <Input
                              size="sm"
                              borderRadius="lg"
                              value={regMandal}
                              onChange={(e) => setRegMandal(e.target.value)}
                              placeholder="e.g. Kurnool Rural"
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="xs" fontWeight="bold">Village</FormLabel>
                            <Input
                              size="sm"
                              borderRadius="lg"
                              value={regVillage}
                              onChange={(e) => setRegVillage(e.target.value)}
                              placeholder="e.g. Ulchala"
                            />
                          </FormControl>
                        </SimpleGrid>

                        <FormControl isRequired>
                          <FormLabel fontSize="xs" fontWeight="bold">Select Role(s)</FormLabel>
                          <CheckboxGroup
                            value={selectedRoles}
                            onChange={(vals) => setSelectedRoles(vals.length > 0 ? (vals as string[]) : ['FARMER'])}
                          >
                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2} bg="gray.50" p={3} borderRadius="xl" borderWidth="1px" borderColor="gray.200">
                              {ALL_ROLES_OPTIONS.map((r) => (
                                <Checkbox key={r.role} value={r.role} colorScheme="brand" size="sm">
                                  <Text fontSize="xs">
                                    {r.label}
                                    {r.privileged && (
                                      <Badge ml={1} colorScheme="purple" fontSize="3xs">Approval Req.</Badge>
                                    )}
                                  </Text>
                                </Checkbox>
                              ))}
                            </SimpleGrid>
                          </CheckboxGroup>
                        </FormControl>

                        <Button
                          type="submit"
                          colorScheme="brand"
                          size="md"
                          borderRadius="xl"
                          fontWeight="bold"
                          isLoading={isRegistering}
                          shadow="md"
                          mt={2}
                        >
                          Complete Registration & Sign In
                        </Button>

                        <Flex justify="center" pt={1}>
                          <Button
                            variant="link"
                            colorScheme="brand"
                            fontSize="xs"
                            fontWeight="bold"
                            onClick={() => setTabIndex(0)}
                          >
                            Already registered? Sign In with Phone & Password →
                          </Button>
                        </Flex>
                      </Stack>
                    </form>
                  </TabPanel>

                  {/* 3. OTP VERIFICATION */}
                  <TabPanel p={0}>
                    <Stack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Mobile Number</FormLabel>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g., 9876543210"
                          size="md"
                          borderRadius="xl"
                          type="tel"
                        />
                      </FormControl>

                      {otpSent && (
                        <FormControl isRequired>
                          <FormLabel fontSize="xs" fontWeight="bold">6-Digit OTP</FormLabel>
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
                          Send OTP
                        </Button>
                      ) : (
                        <Button
                          colorScheme="brand"
                          onClick={handleVerifyOtp}
                          isLoading={isVerifying}
                          size="md"
                          borderRadius="xl"
                        >
                          Verify OTP & Sign In
                        </Button>
                      )}

                      <Flex justify="center" pt={1}>
                        <Button
                          variant="link"
                          colorScheme="brand"
                          fontSize="xs"
                          fontWeight="bold"
                          onClick={() => setTabIndex(0)}
                        >
                          Back to Password Login →
                        </Button>
                      </Flex>
                    </Stack>
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
