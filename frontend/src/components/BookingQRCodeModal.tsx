import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Alert,
  AlertIcon,
  Divider,
  useToast,
  SimpleGrid,
  Flex,
} from '@chakra-ui/react';
import { QRCodeSVG } from 'qrcode.react';
import { FileCheck, Copy, Printer, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';

export interface BookingQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    bookingReference?: string;
    reservationReference?: string;
    marketName?: string;
    godownName?: string;
    date?: string;
    startDate?: string;
    slotTime?: string;
    inwardSlot?: string;
    commodity?: string;
    estimatedQuantityQuintals?: number;
    bagsCount?: number;
    vehicleType?: string;
    channel?: string;
    farmerName?: string;
    farmerPhone?: string;
    status?: string;
  } | null;
  moduleType?: 'MARKET' | 'GODOWN';
}

export const BookingQRCodeModal: React.FC<BookingQRCodeModalProps> = ({
  isOpen,
  onClose,
  booking,
  moduleType = 'MARKET',
}) => {
  const toast = useToast();

  if (!booking) return null;

  const reference = booking.bookingReference || booking.reservationReference || '';
  const facilityName = booking.marketName || booking.godownName || (moduleType === 'MARKET' ? 'APMC Market Yard' : 'State Warehouse');
  const dateStr = booking.date || booking.startDate || '';
  const timeSlot = booking.slotTime || booking.inwardSlot || 'Day Slot';
  const qtyStr = booking.estimatedQuantityQuintals
    ? `${booking.estimatedQuantityQuintals} Quintals`
    : booking.bagsCount
    ? `${booking.bagsCount} Bags`
    : '';

  // Standardized structured QR payload string
  const qrPayload = JSON.stringify({
    type: moduleType === 'MARKET' ? 'MARKET_BOOKING' : 'GODOWN_STORAGE',
    reference,
    facility: facilityName,
    commodity: booking.commodity,
    quantity: qtyStr,
    date: dateStr,
    phone: booking.farmerPhone,
  });

  const handleCopy = () => {
    if (reference) {
      navigator.clipboard.writeText(reference);
      toast({
        title: 'Token Copied!',
        description: reference,
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'BOOKED':
        return 'blue';
      case 'ARRIVED':
      case 'ENTERED':
        return 'teal';
      case 'WAITING':
        return 'orange';
      case 'STORED':
        return 'purple';
      case 'SELLED':
      case 'SOLD':
        return 'green';
      case 'COMPLETED':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
      <ModalContent borderRadius="2xl" overflow="hidden" shadow="2xl">
        <ModalHeader
          bg={moduleType === 'MARKET' ? 'brand.700' : 'blue.700'}
          color="white"
          py={4}
          px={6}
        >
          <Flex justify="space-between" align="center">
            <HStack spacing={2}>
              <QrCode size={22} />
              <Text fontSize="md" fontWeight="bold">
                {moduleType === 'MARKET'
                  ? 'Official APMC Gate Entry Pass'
                  : 'Official Godown Inward Pass'}
              </Text>
            </HStack>
            <Badge
              colorScheme={getStatusColor(booking.status)}
              variant="solid"
              px={2.5}
              py={1}
              borderRadius="full"
              fontSize="xs"
            >
              {booking.status || 'CONFIRMED'}
            </Badge>
          </Flex>
        </ModalHeader>

        <ModalBody p={6} bg="gray.50">
          <VStack spacing={5} align="center">
            {/* Scannable QR Code Card */}
            <Box
              bg="white"
              p={5}
              borderRadius="2xl"
              shadow="md"
              borderWidth="2px"
              borderColor={moduleType === 'MARKET' ? 'brand.200' : 'blue.200'}
              textAlign="center"
            >
              <Box mx="auto" p={2} bg="white" display="inline-block" borderRadius="xl">
                <QRCodeSVG
                  value={reference || qrPayload}
                  size={190}
                  level="H"
                  includeMargin={true}
                />
              </Box>

              <Text fontSize="2xs" color="gray.500" mt={2} letterSpacing="wide" textTransform="uppercase">
                Scan via Staff Gate Reader or Camera
              </Text>

              {/* Prominent Reference Code */}
              <Box
                mt={3}
                py={2}
                px={4}
                bg={moduleType === 'MARKET' ? 'brand.50' : 'blue.50'}
                borderWidth="1px"
                borderColor={moduleType === 'MARKET' ? 'brand.300' : 'blue.300'}
                borderRadius="xl"
              >
                <Text
                  fontSize="2xl"
                  fontWeight="900"
                  color={moduleType === 'MARKET' ? 'brand.800' : 'blue.800'}
                  letterSpacing="widest"
                >
                  {reference}
                </Text>
              </Box>

              <HStack justify="center" mt={3} spacing={3}>
                <Button
                  size="xs"
                  leftIcon={<Copy size={13} />}
                  onClick={handleCopy}
                  variant="outline"
                  colorScheme={moduleType === 'MARKET' ? 'brand' : 'blue'}
                >
                  Copy Token
                </Button>
                <Button
                  size="xs"
                  leftIcon={<Printer size={13} />}
                  onClick={handlePrint}
                  variant="ghost"
                  colorScheme="gray"
                >
                  Print Pass
                </Button>
              </HStack>
            </Box>

            {/* Instruction Notice */}
            <Alert
              status="info"
              borderRadius="xl"
              fontSize="xs"
              bg={moduleType === 'MARKET' ? 'green.50' : 'blue.50'}
              color={moduleType === 'MARKET' ? 'green.800' : 'blue.800'}
              borderWidth="1px"
              borderColor={moduleType === 'MARKET' ? 'green.200' : 'blue.200'}
            >
              <AlertIcon />
              Present this QR Code or Token at the facility gate. Market staff / Godown operator will scan to verify your slot and update arrival status.
            </Alert>

            {/* Structured Details Grid */}
            <Box w="full" bg="white" p={4} borderRadius="xl" shadow="xs" borderWidth="1px" borderColor="gray.100">
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} fontSize="xs">
                <Box>
                  <Text color="gray.500" fontSize="2xs">FACILITY / YARD:</Text>
                  <Text fontWeight="bold" color="gray.800">{facilityName}</Text>
                </Box>
                <Box>
                  <Text color="gray.500" fontSize="2xs">SCHEDULED WINDOW:</Text>
                  <Text fontWeight="bold" color="gray.800">{dateStr} ? {timeSlot}</Text>
                </Box>
                <Box>
                  <Text color="gray.500" fontSize="2xs">COMMODITY & VOLUME:</Text>
                  <Text fontWeight="bold" color="gray.800">
                    {booking.commodity || 'Produce'} {qtyStr ? `(${qtyStr})` : ''}
                  </Text>
                </Box>
                <Box>
                  <Text color="gray.500" fontSize="2xs">VEHICLE TYPE:</Text>
                  <Text fontWeight="bold" color="gray.800">{booking.vehicleType || 'Tractor'}</Text>
                </Box>
                {booking.farmerName && (
                  <Box>
                    <Text color="gray.500" fontSize="2xs">REGISTERED FARMER:</Text>
                    <Text fontWeight="bold" color="gray.800">
                      {booking.farmerName} {booking.farmerPhone ? `(${booking.farmerPhone})` : ''}
                    </Text>
                  </Box>
                )}
                {booking.channel && (
                  <Box>
                    <Text color="gray.500" fontSize="2xs">BOOKING CHANNEL:</Text>
                    <Badge colorScheme="gray" fontSize="2xs">{booking.channel}</Badge>
                  </Box>
                )}
              </SimpleGrid>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter bg="white" borderTopWidth="1px" borderColor="gray.100" py={3}>
          <Button
            colorScheme={moduleType === 'MARKET' ? 'brand' : 'blue'}
            onClick={onClose}
            w="full"
            borderRadius="xl"
          >
            Done (Close Pass)
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
