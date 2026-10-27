import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { CheckCircle2, Clock, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
import { StatusHistoryItem } from '../types';

interface StatusTimelineProps {
  currentStatus: string;
  statusHistory?: StatusHistoryItem[];
  moduleName?: string;
}

const statusColors: Record<string, string> = {
  BOOKED: 'blue',
  ENTERED: 'teal',
  RATE_NEGOTIATION: 'purple',
  LOADING: 'orange',
  COMPLETED: 'green',
  REJECTED: 'red',
  CANCELLED: 'gray',
  REQUESTED: 'blue',
  ASSIGNED: 'purple',
  ACCEPTED: 'cyan',
  ON_THE_WAY: 'orange',
  REACHED_LOCATION: 'teal',
  REACHED_FARM: 'teal',
  IN_PROGRESS: 'blue',
  CONSULTATION_STARTED: 'blue',
  DOCUMENTS_VERIFIED: 'teal',
  SUBMITTED: 'purple',
  APPROVED: 'green',
};

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  currentStatus,
  statusHistory = [],
  moduleName,
}) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box p={4} bg={bg} borderWidth="1px" borderColor={borderColor} borderRadius="xl" shadow="sm">
      <HStack justify="space-between" mb={3} wrap="wrap">
        <HStack spacing={2}>
          <Icon as={ShieldCheck} color="brand.600" />
          <Text fontWeight="bold" fontSize="sm">
            Status Progression {moduleName ? `(${moduleName})` : ''}
          </Text>
        </HStack>
        <Badge
          colorScheme={statusColors[currentStatus] || 'brand'}
          fontSize="xs"
          px={3}
          py={1}
          borderRadius="full"
        >
          Current: {currentStatus.replace(/_/g, ' ')}
        </Badge>
      </HStack>

      <Divider mb={4} />

      {statusHistory.length === 0 ? (
        <HStack spacing={2} color="gray.500" fontSize="xs">
          <Icon as={Clock} size={14} />
          <Text>Initial status recorded: {currentStatus.replace(/_/g, ' ')}</Text>
        </HStack>
      ) : (
        <VStack align="stretch" spacing={3}>
          {statusHistory.map((item, index) => {
            const isLast = index === statusHistory.length - 1;
            const badgeColor = statusColors[item.toStatus] || 'gray';
            return (
              <Box
                key={index}
                p={3}
                bg={isLast ? 'brand.50' : 'gray.50'}
                borderLeftWidth="4px"
                borderLeftColor={`${badgeColor}.500`}
                borderRadius="md"
              >
                <HStack justify="space-between" wrap="wrap" mb={1}>
                  <HStack spacing={2}>
                    <Icon as={isLast ? CheckCircle2 : Clock} color={`${badgeColor}.600`} size={16} />
                    <Text fontWeight="bold" fontSize="xs" color="gray.800">
                      {item.fromStatus ? `${item.fromStatus.replace(/_/g, ' ')} → ` : ''}
                      {item.toStatus.replace(/_/g, ' ')}
                    </Text>
                  </HStack>
                  <Text fontSize="2xs" color="gray.500">
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
                </HStack>

                {item.actorName && (
                  <HStack spacing={1} fontSize="2xs" color="gray.600" mt={1}>
                    <Icon as={UserCheck} size={12} />
                    <Text>
                      By: {item.actorName} {item.actorRole ? `(${item.actorRole})` : ''}
                    </Text>
                  </HStack>
                )}

                {item.notes && (
                  <Text fontSize="xs" color="gray.700" mt={1} fontStyle="italic">
                    "{item.notes}"
                  </Text>
                )}
              </Box>
            );
          })}
        </VStack>
      )}
    </Box>
  );
};
