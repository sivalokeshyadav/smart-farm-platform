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
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { setCredentials, switchRole, UserRole } from '../../app/authSlice';
import { translations } from '../../i18n/translations';
import {
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useLoginWithPasswordMutation,
  useRegisterUserMutation,
} from './services/authApi';
import { ROUTES } from '../../routes';
import { Sprout, Phone, ShieldCheck, Key, UserPlus } from 'lucide-react';

const ALL_ROLES_OPTIONS: { role: UserRole; label: string; privileged: boolean }[] = [
  { role: 'FARMER', label: 'Farmer ', privileged: false },
  { role: 'CROP_BUYER', label: 'Crop Buyer ', privileged: false },
  { role: 'CROP_SELLER', label: 'Crop Seller ', privileged: false },
  { role: 'LIVESTOCK_BUYER', label: 'Livestock Buyer ', privileged: false },
  { role: 'LIVESTOCK_SELLER', label: 'Livestock Seller ', privileged: false },
  { role: 'EQUIPMENT_BUYER', label: 'Equipment Buyer ', privileged: false },
  { role: 'EQUIPMENT_SELLER', label: 'Equipment Rental Provider ', privileged: false },
  { role: 'VETERINARIAN', label: 'Veterinarian ', privileged: true },
  { role: 'MARKET_STAFF', label: 'Market Yard Staff ', privileged: true },
  { role: 'GODOWN_OPERATOR', label: 'Godown Operator ', privileged: true },
  { role: 'DELIVERY_WORKER', label: 'Delivery & Field Logistics', privileged: false },
  { role: 'HELP_DESK_OPERATOR', label: 'Govt Scheme Operator ', privileged: true },
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
  const [regLang, setRegLang] = useState<string>('te');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['FARMER']);

  const [requestOtp, { isLoading: isSendingOtp }] = useRequestOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [loginWithPassword, { isLoading: isLoggingIn }] = useLoginWithPasswordMutation();
  const [registerUser, { isLoading: isRegistering }] = useRegisterUserMutation();

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
        description: res.message,
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
      toast({ title: 'Welcome!', status: 'success', duration: 2000 });
      navigate(ROUTES.HOME);
    } catch (err: any) {
      toast({ title: 'Invalid OTP', description: err?.data?.detail, status: 'error' });
    }
  };

  const handlePasswordLogin = async () => {
    try {
      const res = await loginWithPassword({ phone, password }).unwrap();
      dispatch(setCredentials({ token: res.access_token, user: res.user }));
      toast({ title: 'Logged in successfully', status: 'success', duration: 2000 });
      navigate(ROUTES.HOME);
    } catch (err: any) {
      toast({ title: 'Login Failed', description: err?.data?.detail, status: 'error' });
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
    <Container maxW="700px" py={10}>
      <Card bg="white" shadow="lg" borderRadius="3xl" borderWidth="1px" borderColor="brand.100" p={2}>
        <CardBody p={{ base: 6, md: 8 }}>
          <VStack spacing={6} align="stretch">
            <Box textAlign="center">
              <Flex justify="center" mb={3}>
                <Flex bg="brand.50" color="brand.700" p={3} borderRadius="2xl">
                  <Sprout size={36} />
                </Flex>
              </Flex>
              <Heading size="lg" color="brand.900" fontWeight="800">
                {t.appName}
              </Heading>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Andhra Pradesh & Regional Agricultural Portal Gateway
              </Text>
            </Box>

            <Tabs isFitted variant="soft-rounded" colorScheme="brand">
              <TabList mb={4} flexWrap="wrap" gap={1}>
                <Tab fontSize="xs" fontWeight="bold">OTP Flow</Tab>
                <Tab fontSize="xs" fontWeight="bold">Password</Tab>
                <Tab fontSize="xs" fontWeight="bold">Register New</Tab>
              </TabList>

              <TabPanels>
                {/* 1. OTP Tab */}
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

                {/* 2. Password Tab */}
                <TabPanel p={0}>
                  <Stack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="bold">{t.phone}</FormLabel>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Mobile Number"
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
                        placeholder="Default pilot: farm1234"
                        size="md"
                        borderRadius="xl"
                      />
                    </FormControl>

                    <Button
                      colorScheme="brand"
                      onClick={handlePasswordLogin}
                      isLoading={isLoggingIn}
                      size="md"
                      borderRadius="xl"
                    >
                      Login with Password
                    </Button>
                  </Stack>
                </TabPanel>

                {/* 3. Register New Account Tab */}
                <TabPanel p={0}>
                  <form onSubmit={handleRegister}>
                    <VStack spacing={3} align="stretch">
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        <FormControl isRequired>
                          <FormLabel fontSize="xs" fontWeight="bold">Full Name</FormLabel>
                          <Input
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="e.g. Ramesh Reddy"
                            size="sm"
                            borderRadius="lg"
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel fontSize="xs" fontWeight="bold">Mobile Number</FormLabel>
                          <Input
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="10-digit number"
                            size="sm"
                            borderRadius="lg"
                          />
                        </FormControl>
                      </SimpleGrid>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="bold">Email (Optional)</FormLabel>
                          <Input
                            type="email"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="name@example.com"
                            size="sm"
                            borderRadius="lg"
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel fontSize="xs" fontWeight="bold">Password</FormLabel>
                          <Input
                            type="password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            size="sm"
                            borderRadius="lg"
                          />
                        </FormControl>
                      </SimpleGrid>

                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={2}>
                        <FormControl isRequired>
                          <FormLabel fontSize="xs" fontWeight="bold">State</FormLabel>
                          <Select
                            value={regState}
                            onChange={(e) => setRegState(e.target.value)}
                            size="sm"
                            borderRadius="lg"
                          >
                            <option value="Andhra Pradesh">Andhra Pradesh</option>
                            <option value="Telangana">Telangana</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Tamil Nadu">Tamil Nadu</option>
                          </Select>
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel fontSize="xs" fontWeight="bold">District</FormLabel>
                          <Input
                            value={regDistrict}
                            onChange={(e) => setRegDistrict(e.target.value)}
                            size="sm"
                            borderRadius="lg"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="bold">Mandal</FormLabel>
                          <Input
                            value={regMandal}
                            onChange={(e) => setRegMandal(e.target.value)}
                            size="sm"
                            borderRadius="lg"
                          />
                        </FormControl>
                      </SimpleGrid>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="bold">Village</FormLabel>
                          <Input
                            value={regVillage}
                            onChange={(e) => setRegVillage(e.target.value)}
                            size="sm"
                            borderRadius="lg"
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel fontSize="xs" fontWeight="bold">Preferred Language</FormLabel>
                          <Select
                            value={regLang}
                            onChange={(e) => setRegLang(e.target.value)}
                            size="sm"
                            borderRadius="lg"
                          >
                            <option value="te">తెలుగు (Telugu)</option>
                            <option value="en">English</option>
                            <option value="hi">हिन्दी (Hindi)</option>
                          </Select>
                        </FormControl>
                      </SimpleGrid>

                      {/* Role Selection */}
                      <Box borderTopWidth="1px" pt={2}>
                        <FormLabel fontSize="xs" fontWeight="bold">Select Role(s) to Perform:</FormLabel>
                        <CheckboxGroup
                          value={selectedRoles}
                          onChange={(vals) => setSelectedRoles(vals as string[])}
                        >
                          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                            {ALL_ROLES_OPTIONS.map((opt) => (
                              <Checkbox key={opt.role} value={opt.role} size="sm" colorScheme="brand">
                                <Text fontSize="xs">
                                  {opt.label} {opt.privileged ? '🔒' : ''}
                                </Text>
                              </Checkbox>
                            ))}
                          </SimpleGrid>
                        </CheckboxGroup>
                      </Box>

                      <Alert status="info" fontSize="2xs" borderRadius="md" py={1.5}>
                        <AlertIcon boxSize={3} />
                        Roles marked with 🔒 (Admin, Staff, Veterinarian, Help-Desk) require verification by the district administrator before activation.
                      </Alert>

                      <Button
                        type="submit"
                        colorScheme="brand"
                        isLoading={isRegistering}
                        size="sm"
                        borderRadius="xl"
                        mt={1}
                        leftIcon={<UserPlus size={16} />}
                      >
                        Complete Registration & Enter
                      </Button>
                    </VStack>
                  </form>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
};
