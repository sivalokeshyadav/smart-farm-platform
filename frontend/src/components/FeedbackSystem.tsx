import React, { useState } from 'react';
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  HStack,
  VStack,
  Text,
  Badge,
  Icon,
  useToast,
  Wrap,
  WrapItem,
  Progress,
  Divider,
} from '@chakra-ui/react';
import { Star, MessageSquare, ThumbsUp, ShieldCheck } from 'lucide-react';
import {
  useSubmitFeedbackMutation,
  useGetFeedbacksQuery,
  useGetFeedbackSummaryQuery,
} from '../services';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: string;
  transactionId: string;
  targetId?: string;
  targetName?: string;
}

const PREDEFINED_TAGS = [
  'ON_TIME',
  'HONEST_WEIGHING',
  'EXCELLENT_QUALITY',
  'PROFESSIONAL',
  'FAIR_PRICE',
  'FAST_GATE_ENTRY',
  'HELPFUL_ADVICE',
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  module,
  transactionId,
  targetId,
  targetName,
}) => {
  const toast = useToast();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['ON_TIME']);
  const [submitFeedback, { isLoading }] = useSubmitFeedbackMutation();

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    try {
      await submitFeedback({
        module,
        transactionId,
        targetId,
        targetName,
        rating,
        reviewText,
        tags: selectedTags,
      }).unwrap();

      toast({
        title: 'Thank you for your rating!',
        description: 'Your feedback helps other farmers and maintains platform standards.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (err: any) {
      toast({
        title: 'Feedback submission failed',
        description: err?.data?.detail || 'An error occurred while saving your review.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="2xl">
        <ModalHeader bg="brand.700" color="white" borderTopRadius="2xl">
          <HStack spacing={2}>
            <Icon as={Star} fill="gold" color="gold" size={20} />
            <Text fontSize="md">Rate Service & Experience</Text>
          </HStack>
          {targetName && (
            <Text fontSize="xs" color="brand.100" fontWeight="normal" mt={1}>
              For: {targetName}
            </Text>
          )}
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody py={6}>
          <VStack spacing={5} align="stretch">
            {/* Star Rating Selector */}
            <Box textAlign="center">
              <FormLabel textAlign="center" fontWeight="bold" fontSize="sm" mb={2}>
                How was your experience?
              </FormLabel>
              <HStack justify="center" spacing={3}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = (hoverRating || rating) >= star;
                  return (
                    <Box
                      key={star}
                      as="button"
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      cursor="pointer"
                      transition="transform 0.1s"
                      _hover={{ transform: 'scale(1.2)' }}
                    >
                      <Icon
                        as={Star}
                        boxSize={8}
                        color={filled ? 'orange.400' : 'gray.300'}
                        fill={filled ? 'orange.400' : 'none'}
                      />
                    </Box>
                  );
                })}
              </HStack>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {rating === 5 && '🌟 Outstanding & Prompt'}
                {rating === 4 && '👍 Very Good'}
                {rating === 3 && '👌 Satisfactory'}
                {rating === 2 && '👎 Needs Improvement'}
                {rating === 1 && '⚠️ Unacceptable'}
              </Text>
            </Box>

            {/* Tags Selection */}
            <Box>
              <FormLabel fontSize="xs" fontWeight="bold" color="gray.700">
                Select Highlights (Tags):
              </FormLabel>
              <Wrap spacing={2}>
                {PREDEFINED_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <WrapItem key={tag}>
                      <Badge
                        as="button"
                        type="button"
                        onClick={() => toggleTag(tag)}
                        colorScheme={isSelected ? 'brand' : 'gray'}
                        variant={isSelected ? 'solid' : 'outline'}
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="2xs"
                        cursor="pointer"
                      >
                        {tag.replace(/_/g, ' ')}
                      </Badge>
                    </WrapItem>
                  );
                })}
              </Wrap>
            </Box>

            {/* Written Comments */}
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="bold" color="gray.700">
                Detailed Comments (Optional):
              </FormLabel>
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your practical experience for other farmers and supervisors..."
                fontSize="sm"
                rows={3}
                borderRadius="lg"
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter bg="gray.50" borderBottomRadius="2xl">
          <Button variant="ghost" mr={3} onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button
            colorScheme="brand"
            onClick={handleSubmit}
            isLoading={isLoading}
            size="sm"
            leftIcon={<ThumbsUp size={16} />}
          >
            Submit Feedback
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

interface ReviewsListProps {
  module: string;
  targetId?: string;
  title?: string;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({ module, targetId, title }) => {
  const { data: reviews = [] } = useGetFeedbacksQuery({ module, targetId });
  const { data: summary } = useGetFeedbackSummaryQuery({ module, targetId });

  return (
    <Box p={5} bg="white" borderRadius="2xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
      <HStack justify="space-between" mb={4} wrap="wrap">
        <HStack spacing={2}>
          <Icon as={Star} fill="orange" color="orange.400" size={20} />
          <Text fontWeight="bold" fontSize="md">
            {title || 'Ratings & Verified Farmer Reviews'}
          </Text>
        </HStack>
        {summary && summary.totalReviews > 0 && (
          <HStack spacing={2}>
            <Badge colorScheme="green" fontSize="sm" px={2} py={0.5} borderRadius="md">
              ★ {summary.averageRating} / 5
            </Badge>
            <Text fontSize="xs" color="gray.500">
              ({summary.totalReviews} reviews)
            </Text>
          </HStack>
        )}
      </HStack>

      {reviews.length === 0 ? (
        <Text fontSize="xs" color="gray.500" py={4} textAlign="center">
          No reviews recorded yet. Reviews will appear here after farmers complete their service.
        </Text>
      ) : (
        <VStack spacing={3} align="stretch">
          {reviews.slice(0, 5).map((r) => (
            <Box key={r.id || r._id} p={3} bg="gray.50" borderRadius="lg">
              <HStack justify="space-between" mb={1} wrap="wrap">
                <HStack spacing={2}>
                  <Text fontWeight="bold" fontSize="xs">
                    {r.raterName}
                  </Text>
                  <HStack spacing={0.5}>
                    {[...Array(5)].map((_, i) => (
                      <Icon
                        key={i}
                        as={Star}
                        size={12}
                        color={i < r.rating ? 'orange.400' : 'gray.300'}
                        fill={i < r.rating ? 'orange.400' : 'none'}
                      />
                    ))}
                  </HStack>
                </HStack>
                <Text fontSize="2xs" color="gray.400">
                  {new Date(r.createdAt).toLocaleDateString()}
                </Text>
              </HStack>

              {r.tags && r.tags.length > 0 && (
                <HStack spacing={1} mb={1} wrap="wrap">
                  {r.tags.map((t) => (
                    <Badge key={t} fontSize="3xs" colorScheme="teal" variant="subtle">
                      {t.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </HStack>
              )}

              {r.reviewText && (
                <Text fontSize="xs" color="gray.700">
                  "{r.reviewText}"
                </Text>
              )}
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};
