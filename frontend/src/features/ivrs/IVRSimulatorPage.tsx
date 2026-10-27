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
  Input,
  IconButton,
  Divider,
  Alert,
  AlertIcon,
  useToast,
  Checkbox,
} from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { translations } from '../../i18n/translations';
import { useIvrSimulatorStepMutation } from './services/ivrApi';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

export const IVRSimulatorPage: React.FC = () => {
  const { language, user } = useSelector((state: RootState) => state.auth);
  const t = translations[language];
  const toast = useToast();

  const [callActive, setCallActive] = useState<boolean>(false);
  const [callerPhone, setCallerPhone] = useState<string>(user?.phone || '9876543210');
  const [sessionId, setSessionId] = useState<string>('');
  const [currentPromptEn, setCurrentPromptEn] = useState<string>('');
  const [currentPromptTe, setCurrentPromptTe] = useState<string>('');
  const [options, setOptions] = useState<Record<string, string>>({});
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);
  const [consentSms, setConsentSms] = useState<boolean>(true);
  const [callLogs, setCallLogs] = useState<Array<{ sender: string; text: string }>>([]);

  const [ivrStep, { isLoading: isStepping }] = useIvrSimulatorStepMutation();

  const speakText = (text: string) => {
    if (!speechEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.lang = text.match(/[\u0C00-\u0C7F]/) ? 'te-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis unavailable:', e);
    }
  };

  const startCall = async () => {
    const newSessionId = `IVR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setSessionId(newSessionId);
    setCallActive(true);
    setBookingReference(null);
    setIsCompleted(false);
    setCallLogs([]);

    const welcomeEn = "Welcome to Kurnool Smart Farmer Phone Booking. For Telugu press 1. For English press 2.";
    const welcomeTe = "కర్నూలు రైతు ఫోన్ సేవకు స్వాగతం. తెలుగు కొరకు 1 నొక్కండి. For English press 2.";

    setCurrentPromptEn(welcomeEn);
    setCurrentPromptTe(welcomeTe);
    setOptions({ "1": "తెలుగు (Telugu)", "2": "English" });
    setCallLogs([
      { sender: "IVR", text: `${welcomeTe}\n${welcomeEn}` }
    ]);
    speakText(welcomeTe);
  };

  const endCall = () => {
    setCallActive(false);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    toast({ title: 'Call terminated', status: 'info', duration: 2000 });
  };

  const handleKeyPress = async (digit: string) => {
    if (!callActive) return;

    setCallLogs(prev => [...prev, { sender: "USER", text: `Pressed: ${digit}` }]);

    try {
      const res = await ivrStep({
        sessionId,
        callerPhone,
        inputDigit: digit,
        consentSms,
      }).unwrap();

      setCurrentPromptEn(res.promptEn);
      setCurrentPromptTe(res.promptTe);
      setOptions(res.options || {});
      setIsCompleted(res.isCompleted || false);

      if (res.bookingReference) {
        setBookingReference(res.bookingReference);
      }

      const activeText = language === 'te' ? res.promptTe : res.promptEn;
      setCallLogs(prev => [...prev, { sender: "IVR", text: `${res.promptTe}\n\n${res.promptEn}` }]);
      speakText(activeText);

    } catch (err: any) {
      toast({
        title: 'IVR Step Error',
        description: err?.data?.detail || 'Call handling error',
        status: 'error',
      });
    }
  };

  const dialPadDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

  return (
    <Container maxW="1200px" py={8}>
      {/* Header */}
      <Box mb={8}>
        <HStack spacing={2} mb={2}>
          <Flex bg="teal.50" color="teal.700" p={2} borderRadius="lg">
            <Phone size={24} />
          </Flex>
          <Badge colorScheme="teal" px={2.5} py={0.5} borderRadius="full">
            Inclusive Feature-Phone Service
          </Badge>
        </HStack>
        <Heading size="lg" color="gray.800" fontWeight="800">
          {t.ivr.title}
        </Heading>
        <Text color="gray.600" mt={1}>
          {t.ivr.subtitle}
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={8}>
        {/* Left: Phone Keypad Simulator (5 columns) */}
        <Box gridColumn={{ lg: 'span 5' }}>
          <Card
            bg="gray.900"
            color="white"
            borderRadius="3xl"
            p={6}
            shadow="2xl"
            borderWidth="4px"
            borderColor="gray.800"
          >
            {/* Phone Screen Display */}
            <Box
              bg="gray.800"
              p={4}
              borderRadius="xl"
              mb={6}
              borderWidth="1px"
              borderColor="gray.700"
              minH="130px"
            >
              <Flex justify="space-between" align="center" mb={2}>
                <HStack spacing={1}>
                  <Box w="8px" h="8px" borderRadius="full" bg={callActive ? 'green.400' : 'red.400'} />
                  <Text fontSize="2xs" color="gray.400">
                    {callActive ? 'CALL CONNECTED' : 'LINE DISCONNECTED'}
                  </Text>
                </HStack>
                <IconButton
                  size="xs"
                  aria-label="Toggle Voice Audio"
                  icon={speechEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  onClick={() => setSpeechEnabled(!speechEnabled)}
                  variant="ghost"
                  color="gray.400"
                />
              </Flex>

              {callActive ? (
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="teal.300" noOfLines={3}>
                    {language === 'te' ? currentPromptTe : currentPromptEn}
                  </Text>
                  {bookingReference && (
                    <Badge colorScheme="green" mt={2} fontSize="xs" px={2} py={1}>
                      TOKEN: {bookingReference}
                    </Badge>
                  )}
                </Box>
              ) : (
                <Text fontSize="xs" color="gray.500" textAlign="center" pt={4}>
                  Enter caller phone number & tap 'Call 1800-425-KURN' to simulate.
                </Text>
              )}
            </Box>

            {/* Caller Number Input */}
            {!callActive ? (
              <Stack spacing={3} mb={6}>
                <Input
                  value={callerPhone}
                  onChange={(e) => setCallerPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  bg="gray.800"
                  borderColor="gray.700"
                  color="white"
                  borderRadius="lg"
                  textAlign="center"
                  fontWeight="bold"
                />
                <Button
                  colorScheme="green"
                  size="lg"
                  onClick={startCall}
                  leftIcon={<PhoneCall size={20} />}
                  fontWeight="bold"
                  h="52px"
                  borderRadius="xl"
                >
                  {t.ivr.startCall}
                </Button>
              </Stack>
            ) : (
              <Button
                colorScheme="red"
                size="md"
                onClick={endCall}
                leftIcon={<PhoneOff size={18} />}
                mb={6}
                borderRadius="xl"
                w="full"
              >
                {t.ivr.endCall}
              </Button>
            )}

            {/* 3x4 Dialpad Matrix */}
            <SimpleGrid columns={3} spacing={3}>
              {dialPadDigits.map((digit) => (
                <Button
                  key={digit}
                  onClick={() => handleKeyPress(digit)}
                  isDisabled={!callActive || isStepping}
                  h="56px"
                  bg="gray.800"
                  color="white"
                  _hover={{ bg: 'gray.700' }}
                  _active={{ bg: 'teal.600' }}
                  fontSize="xl"
                  fontWeight="bold"
                  borderRadius="2xl"
                  shadow="md"
                >
                  {digit}
                </Button>
              ))}
            </SimpleGrid>

            {/* SMS Consent Option */}
            <Box mt={4} pt={4} borderTopWidth="1px" borderColor="gray.800">
              <Checkbox
                isChecked={consentSms}
                onChange={(e) => setConsentSms(e.target.checked)}
                colorScheme="teal"
                size="sm"
                color="gray.400"
              >
                <Text fontSize="2xs">{t.ivr.smsConsent}</Text>
              </Checkbox>
            </Box>
          </Card>
        </Box>

        {/* Right: Audio Transcript & Token Verification Box (7 columns) */}
        <Box gridColumn={{ lg: 'span 7' }}>
          <Stack spacing={6}>
            {/* Live Audio Dialogue Box */}
            <Card bg="white" shadow="sm" borderRadius="2xl">
              <CardBody p={6}>
                <HStack justify="space-between" mb={4}>
                  <Heading size="sm" color="gray.800">
                    Live Call Dialogue & Keypad Options
                  </Heading>
                  {callActive && (
                    <Badge colorScheme="green" variant="subtle">
                      Session: {sessionId}
                    </Badge>
                  )}
                </HStack>

                {callActive ? (
                  <Stack spacing={4}>
                    <Box bg="teal.50" p={4} borderRadius="xl" borderWidth="1px" borderColor="teal.200">
                      <Text fontSize="2xs" fontWeight="bold" color="teal.800" textTransform="uppercase" mb={1}>
                        Telugu Prompt (తెలుగు స్వర సూచన)
                      </Text>
                      <Text fontSize="sm" color="teal.950" fontWeight="semibold">
                        {currentPromptTe}
                      </Text>
                    </Box>

                    <Box bg="gray.50" p={4} borderRadius="xl" borderWidth="1px" borderColor="gray.200">
                      <Text fontSize="2xs" fontWeight="bold" color="gray.600" textTransform="uppercase" mb={1}>
                        English Translation (ఇంగ్లీష్ అనువాదం)
                      </Text>
                      <Text fontSize="sm" color="gray.800">
                        {currentPromptEn}
                      </Text>
                    </Box>

                    {/* Available Keypad Options */}
                    {Object.keys(options).length > 0 && (
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2}>
                          Available Keypad Selections:
                        </Text>
                        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                          {Object.entries(options).map(([key, label]) => (
                            <Button
                              key={key}
                              size="sm"
                              variant="outline"
                              colorScheme="teal"
                              justifyContent="flex-start"
                              onClick={() => handleKeyPress(key)}
                            >
                              <Badge mr={2} colorScheme="teal">{key}</Badge> {label}
                            </Button>
                          ))}
                        </SimpleGrid>
                      </Box>
                    )}
                  </Stack>
                ) : (
                  <Text fontSize="sm" color="gray.500" py={6} textAlign="center">
                    Dial the call on the left to see live conversational IVR dialogs.
                  </Text>
                )}
              </CardBody>
            </Card>

            {/* Generated Token Showcase */}
            {bookingReference && (
              <Card bg="green.50" borderColor="green.300" borderWidth="2px" borderRadius="2xl">
                <CardBody p={6} textAlign="center">
                  <Badge colorScheme="green" px={3} py={1} fontSize="xs" borderRadius="full" mb={2}>
                    BOOKING COMMITTED TO DATABASE
                  </Badge>
                  <Text fontSize="xs" color="green.800" fontWeight="bold">
                    {t.ivr.tokenReadback}
                  </Text>
                  <Text fontSize="3xl" fontWeight="900" color="brand.900" letterSpacing="widest" my={2}>
                    {bookingReference}
                  </Text>
                  <Text fontSize="xs" color="green.700">
                    Spoken aloud twice to the farmer: "{bookingReference.split('').join(' ')}". Saved in MongoDB.
                  </Text>
                </CardBody>
              </Card>
            )}

            {/* Architecture Assurance */}
            <Alert status="info" borderRadius="xl">
              <AlertIcon />
              <Box fontSize="xs">
                <Text fontWeight="bold">Zero Logic Duplication Guarantee:</Text>
                <Text color="gray.700" mt={0.5}>
                  The phone booking runs through the exact same Python FastAPI booking service as the web application. Both use atomic conditional checks on MongoDB to prevent overbooking.
                </Text>
              </Box>
            </Alert>
          </Stack>
        </Box>
      </SimpleGrid>
    </Container>
  );
};
