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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
  useToast,
  Divider,
  Tag,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  IconButton,
  Tooltip,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerCloseButton,
  RadioGroup,
  Radio,
} from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { translations } from '../../i18n/translations';
import {
  useGetProductsQuery,
  useCreateOrderMutation,
  useGetMyOrdersQuery,
} from './services/marketplaceApi';
import {
  ShoppingBag,
  ShoppingCart,
  ShieldCheck,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Package,
  Truck,
  CreditCard,
  Star,
  Tag as TagIcon,
  Clock,
  Sparkles,
} from 'lucide-react';

interface CartItem {
  product: any;
  quantity: number;
}

export const MarketplacePage: React.FC = () => {
  const { language, user } = useSelector((state: RootState) => state.auth);
  const t = translations[language];
  const toast = useToast();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('RECOMMENDED');

  // Cart state: { [productId]: CartItem }
  const [cart, setCart] = useState<{ [productId: string]: CartItem }>({});
  const [orderedResult, setOrderedResult] = useState<any>(null);

  // Address and payment method
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    user?.village && user?.district
      ? `${user.village}, ${user.mandal || ''}, ${user.district} District, ${user.state || 'Andhra Pradesh'}`
      : 'Ulchala Village, Kurnool Rural Mandal, Kurnool District - 518003'
  );
  const [paymentMethod, setPaymentMethod] = useState<string>('SANDBOX_UPI');

  // Disclosures
  const {
    isOpen: isCartOpen,
    onOpen: onOpenCart,
    onClose: onCloseCart,
  } = useDisclosure();
  const {
    isOpen: isSuccessOpen,
    onOpen: onOpenSuccess,
    onClose: onCloseSuccess,
  } = useDisclosure();

  // Queries & Mutations
  const { data: products, isLoading: productsLoading } = useGetProductsQuery(
    selectedCategory !== 'ALL' ? selectedCategory : undefined
  );
  const { data: myOrders, refetch: refetchOrders } = useGetMyOrdersQuery();
  const [createOrder, { isLoading: isOrdering }] = useCreateOrderMutation();

  // Cart Calculations
  const cartItems = Object.values(cart);
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const itemsSubtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const deliveryCharges = itemsSubtotal === 0 || itemsSubtotal >= 500 ? 0 : 40;
  const grandTotal = itemsSubtotal + deliveryCharges;

  // Cart Handlers
  const handleAddToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev[product.id];
      const newQty = existing ? existing.quantity + 1 : 1;
      return {
        ...prev,
        [product.id]: { product, quantity: newQty },
      };
    });
    toast({
      title: `${product.name} added to cart`,
      status: 'success',
      duration: 1500,
      isClosable: true,
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart((prev) => {
      const existing = prev[productId];
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return {
        ...prev,
        [productId]: { ...existing, quantity: newQty },
      };
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({ title: 'Cart is empty', status: 'warning', duration: 2500 });
      return;
    }

    try {
      // Pick sellerId from first item or products
      const sellerId = cartItems[0].product.sellerId;
      const orderPayload = {
        sellerId,
        items: cartItems.map((ci) => ({
          productId: ci.product.id,
          quantity: ci.quantity,
        })),
        deliveryAddress,
        paymentMethod,
      };

      const res = await createOrder(orderPayload).unwrap();
      setOrderedResult(res);
      setCart({});
      onCloseCart();
      onOpenSuccess();
      refetchOrders();

      toast({
        title: 'Order placed successfully!',
        description: `Order Ref: ${res.orderReference}`,
        status: 'success',
        duration: 5000,
      });
    } catch (err: any) {
      toast({
        title: 'Checkout error',
        description: err?.data?.detail || 'Unable to complete order.',
        status: 'error',
        duration: 5000,
      });
    }
  };

  // Filtered & Sorted Products
  const filteredProducts = (products || []).filter((prod: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      prod.name?.toLowerCase().includes(q) ||
      prod.nameTe?.toLowerCase().includes(q) ||
      prod.brand?.toLowerCase().includes(q) ||
      prod.category?.toLowerCase().includes(q) ||
      prod.description?.toLowerCase().includes(q)
    );
  }).sort((a: any, b: any) => {
    if (sortBy === 'PRICE_LOW') return a.price - b.price;
    if (sortBy === 'PRICE_HIGH') return b.price - a.price;
    if (sortBy === 'RATING') return (b.rating || 0) - (a.rating || 0);
    return 0; // Default recommended
  });

  const categories = [
    { key: 'ALL', label: t.marketplace.categories.ALL || 'All Products' },
    { key: 'PESTICIDES', label: t.marketplace.categories.PESTICIDES || 'Pesticides & Bio-Control' },
    { key: 'SEEDS', label: t.marketplace.categories.SEEDS || 'Certified Seeds' },
    { key: 'FERTILIZERS', label: t.marketplace.categories.FERTILIZERS || 'Fertilizers' },
    { key: 'TOOLS', label: t.marketplace.categories.TOOLS || 'Farm Tools & Sprayers' },
  ];

  return (
    <Container maxW="1400px" py={8}>
      {/* Top Header */}
      <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4} mb={6}>
        <Box>
          <HStack spacing={2} mb={1}>
            <Flex bg="purple.50" color="purple.700" p={2} borderRadius="lg">
              <ShoppingBag size={24} />
            </Flex>
            <Badge colorScheme="purple" px={2.5} py={0.5} borderRadius="full">
              Authorized Krishi Input Dealer Network
            </Badge>
            <Badge colorScheme="green" px={2} py={0.5} borderRadius="full" variant="subtle">
              100% Genuine Quality Guaranteed
            </Badge>
          </HStack>
          <Heading size="lg" color="gray.800" fontWeight="800">
            {t.marketplace.title}
          </Heading>
          <Text color="gray.600" fontSize="sm" mt={1}>
            {t.marketplace.subtitle}
          </Text>
        </Box>

        {/* Floating Cart Button */}
        <Button
          colorScheme="purple"
          size="lg"
          leftIcon={<ShoppingCart size={20} />}
          onClick={onOpenCart}
          borderRadius="xl"
          shadow="md"
          _hover={{ transform: 'translateY(-1px)', shadow: 'lg' }}
        >
          My Cart ({totalCartCount}) • ₹{itemsSubtotal.toLocaleString()}
        </Button>
      </Flex>

      {/* Compliance Advisory Notice */}
      <Alert status="info" borderRadius="xl" mb={6} fontSize="xs" bg="purple.50" color="purple.900" borderWidth="1px" borderColor="purple.200">
        <AlertIcon color="purple.600" />
        <Box>
          <Text fontWeight="bold">Regulatory Compliance & Safe Farming Gate:</Text>
          <Text>
            All listed insecticides, fungicides, and chemical formulations are licensed under the Central Insecticides Board (CIB&RC) and AP Department of Agriculture. Delivered in original sealed containers with batch testing certificates.
          </Text>
        </Box>
      </Alert>

      {/* Tabs: Store vs Orders */}
      <Tabs colorScheme="purple" variant="enclosed" defaultIndex={0}>
        <TabList mb={6}>
          <Tab fontWeight="bold" fontSize="sm">
            <HStack spacing={2}>
              <Package size={16} />
              <Text>Shop Agricultural Inputs ({filteredProducts.length})</Text>
            </HStack>
          </Tab>
          <Tab fontWeight="bold" fontSize="sm">
            <HStack spacing={2}>
              <Clock size={16} />
              <Text>My Order History ({myOrders?.length || 0})</Text>
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          {/* Panel 1: Shopping Store */}
          <TabPanel px={0} pt={0}>
            {/* Search & Filter Toolbar */}
            <Card bg="white" shadow="sm" borderRadius="xl" mb={6} borderWidth="1px" borderColor="gray.100">
              <CardBody p={5}>
                <VStack align="stretch" spacing={4}>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    {/* Search Input */}
                    <Box gridColumn={{ md: 'span 2' }}>
                      <InputGroup size="md">
                        <InputLeftElement pointerEvents="none">
                          <Search size={18} color="#9ca3af" />
                        </InputLeftElement>
                        <Input
                          placeholder="Search pesticides, seeds, fertilizers, brands (e.g. Chlorpyrifos, Neem, IFFCO, Bayer)..."
                          borderRadius="lg"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </InputGroup>
                    </Box>

                    {/* Sort Dropdown */}
                    <Select
                      size="md"
                      borderRadius="lg"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="RECOMMENDED">Featured & Recommended</option>
                      <option value="PRICE_LOW">Price: Low to High</option>
                      <option value="PRICE_HIGH">Price: High to Low</option>
                      <option value="RATING">Highest Customer Rating</option>
                    </Select>
                  </SimpleGrid>

                  {/* Category Pills */}
                  <HStack spacing={2} wrap="wrap">
                    {categories.map((c) => {
                      const isSelected = selectedCategory === c.key;
                      return (
                        <Button
                          key={c.key}
                          size="sm"
                          borderRadius="full"
                          variant={isSelected ? 'solid' : 'outline'}
                          colorScheme="purple"
                          onClick={() => setSelectedCategory(c.key)}
                        >
                          {c.label}
                        </Button>
                      );
                    })}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Products Grid */}
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
              {filteredProducts.map((prod: any) => {
                const inCartItem = cart[prod.id];
                const discountPercent = prod.originalPrice
                  ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)
                  : 15;

                return (
                  <Card
                    key={prod.id}
                    bg="white"
                    borderRadius="2xl"
                    shadow="sm"
                    borderWidth="1px"
                    borderColor="gray.200"
                    overflow="hidden"
                    display="flex"
                    flexDirection="column"
                    transition="all 0.2s"
                    _hover={{ shadow: 'lg', transform: 'translateY(-2px)', borderColor: 'purple.300' }}
                  >
                    {/* Product Image Container */}
                    <Box position="relative" h="190px" bg="gray.100" overflow="hidden">
                      <Image
                        src={prod.imageUrl}
                        alt={prod.name}
                        w="full"
                        h="full"
                        objectFit="cover"
                        fallbackSrc="https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&auto=format&fit=crop&q=80"
                        transition="transform 0.3s"
                        _hover={{ transform: 'scale(1.05)' }}
                      />

                      {/* Discount Tag */}
                      {discountPercent > 0 && (
                        <Badge
                          position="absolute"
                          top={3}
                          left={3}
                          colorScheme="red"
                          fontSize="xs"
                          px={2}
                          py={0.5}
                          borderRadius="md"
                          fontWeight="bold"
                        >
                          {discountPercent}% OFF
                        </Badge>
                      )}

                      {/* Category Tag */}
                      <Badge
                        position="absolute"
                        top={3}
                        right={3}
                        colorScheme={
                          prod.category === 'PESTICIDES'
                            ? 'red'
                            : prod.category === 'SEEDS'
                            ? 'green'
                            : prod.category === 'FERTILIZERS'
                            ? 'blue'
                            : 'orange'
                        }
                        fontSize="2xs"
                        px={2}
                        py={0.5}
                        borderRadius="md"
                      >
                        {prod.category}
                      </Badge>
                    </Box>

                    {/* Product Details */}
                    <CardBody p={4} display="flex" flexDirection="column" flex="1">
                      {/* Brand & Rating */}
                      <Flex justify="space-between" align="center" mb={1}>
                        <Text fontSize="2xs" fontWeight="bold" color="purple.700" textTransform="uppercase">
                          {prod.brand || 'CERTIFIED INPUT'}
                        </Text>
                        <HStack spacing={1} fontSize="xs" color="orange.500" fontWeight="bold">
                          <Star size={12} fill="#f59e0b" color="#f59e0b" />
                          <Text>{prod.rating || 4.8}</Text>
                          <Text color="gray.400" fontSize="2xs">
                            ({prod.reviewsCount || 45})
                          </Text>
                        </HStack>
                      </Flex>

                      {/* Title & Telugu Name */}
                      <Heading size="xs" color="gray.800" lineHeight="1.4" mb={0.5} noOfLines={2}>
                        {prod.name}
                      </Heading>
                      {prod.nameTe && (
                        <Text fontSize="xs" color="gray.500" mb={2} noOfLines={1}>
                          {prod.nameTe}
                        </Text>
                      )}

                      {/* Description snippet */}
                      <Text fontSize="2xs" color="gray.600" mb={3} noOfLines={2} flex="1">
                        {prod.description}
                      </Text>

                      {/* Pricing */}
                      <HStack align="baseline" spacing={2} mb={3}>
                        <Text fontSize="lg" fontWeight="900" color="purple.900">
                          ₹{prod.price?.toLocaleString()}
                        </Text>
                        {prod.originalPrice && (
                          <Text fontSize="xs" color="gray.400" textDecoration="line-through">
                            ₹{prod.originalPrice?.toLocaleString()}
                          </Text>
                        )}
                        <Text fontSize="2xs" color="gray.500">
                          / {prod.unit}
                        </Text>
                      </HStack>

                      {/* Action: Add to Cart or Stepper */}
                      {inCartItem ? (
                        <Flex
                          align="center"
                          justify="space-between"
                          bg="purple.50"
                          p={1.5}
                          borderRadius="lg"
                          borderWidth="1px"
                          borderColor="purple.300"
                        >
                          <IconButton
                            aria-label="Decrease quantity"
                            icon={<Minus size={14} />}
                            size="xs"
                            colorScheme="purple"
                            onClick={() => handleUpdateQty(prod.id, -1)}
                          />
                          <Text fontWeight="bold" fontSize="sm" color="purple.900">
                            {inCartItem.quantity} in Cart
                          </Text>
                          <IconButton
                            aria-label="Increase quantity"
                            icon={<Plus size={14} />}
                            size="xs"
                            colorScheme="purple"
                            onClick={() => handleUpdateQty(prod.id, 1)}
                          />
                        </Flex>
                      ) : (
                        <Button
                          leftIcon={<ShoppingCart size={15} />}
                          colorScheme="purple"
                          size="sm"
                          w="full"
                          borderRadius="lg"
                          fontWeight="bold"
                          onClick={() => handleAddToCart(prod)}
                        >
                          Add to Cart
                        </Button>
                      )}
                    </CardBody>
                  </Card>
                );
              })}
            </SimpleGrid>
          </TabPanel>

          {/* Panel 2: My Order History */}
          <TabPanel px={0} pt={0}>
            {myOrders && myOrders.length > 0 ? (
              <Stack spacing={4}>
                {myOrders.map((ord: any) => (
                  <Card key={ord.id || ord.orderReference} bg="white" shadow="sm" borderRadius="xl" borderWidth="1px">
                    <CardBody p={5}>
                      <Flex justify="space-between" align={{ base: 'start', sm: 'center' }} direction={{ base: 'column', sm: 'row' }} gap={2} mb={3}>
                        <Box>
                          <HStack spacing={2} mb={1}>
                            <Badge colorScheme="purple" fontSize="xs">
                              {ord.orderReference}
                            </Badge>
                            <Badge
                              colorScheme={
                                ord.fulfillmentStatus === 'DELIVERED'
                                  ? 'green'
                                  : ord.fulfillmentStatus === 'CONFIRMED'
                                  ? 'blue'
                                  : 'orange'
                              }
                            >
                              {ord.fulfillmentStatus}
                            </Badge>
                            <Badge colorScheme="teal" variant="subtle">
                              {ord.paymentStatus}
                            </Badge>
                          </HStack>
                          <Text fontSize="2xs" color="gray.500">
                            Ordered On: {new Date(ord.createdAt).toLocaleString()}
                          </Text>
                        </Box>
                        <Text fontSize="xl" fontWeight="900" color="purple.900">
                          ₹{ord.totalAmount?.toLocaleString()}
                        </Text>
                      </Flex>

                      {/* Items list */}
                      <Box bg="gray.50" p={3} borderRadius="lg" mb={3}>
                        <Text fontSize="2xs" fontWeight="bold" color="gray.600" mb={1}>
                          Purchased Inputs:
                        </Text>
                        <VStack align="stretch" spacing={1} fontSize="xs">
                          {ord.items?.map((item: any, idx: number) => (
                            <Flex key={idx} justify="space-between">
                              <Text color="gray.800">
                                • {item.name} ({item.unit}) × <strong>{item.quantity}</strong>
                              </Text>
                              <Text fontWeight="semibold" color="gray.700">
                                ₹{item.lineTotal?.toLocaleString()}
                              </Text>
                            </Flex>
                          ))}
                        </VStack>
                      </Box>

                      {/* Delivery address & payment */}
                      <Flex justify="space-between" fontSize="2xs" color="gray.500" wrap="wrap" gap={2}>
                        <Text>
                          Delivery Destination: <strong>{ord.deliveryAddress}</strong>
                        </Text>
                        <Text>
                          Payment: <strong>{ord.paymentMethod}</strong> (Txn: {ord.paymentTxnId || 'Direct'})
                        </Text>
                      </Flex>
                    </CardBody>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Card bg="gray.50" borderRadius="xl">
                <CardBody p={8} textAlign="center">
                  <Package size={36} color="#9ca3af" style={{ margin: '0 auto 12px auto' }} />
                  <Heading size="sm" color="gray.600">No Orders Yet</Heading>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Browse our certified pesticides, seeds, and fertilizers to place your first order.
                  </Text>
                </CardBody>
              </Card>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Shopping Cart Drawer */}
      <Drawer isOpen={isCartOpen} placement="right" size="md" onClose={onCloseCart}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader bg="purple.700" color="white" borderBottomWidth="1px">
            <HStack spacing={2}>
              <ShoppingCart size={22} />
              <Text>My Krishi Input Cart ({totalCartCount} items)</Text>
            </HStack>
          </DrawerHeader>

          <DrawerBody p={5}>
            {cartItems.length > 0 ? (
              <Stack spacing={4}>
                {/* Cart Items List */}
                {cartItems.map(({ product, quantity }) => (
                  <Card key={product.id} bg="white" shadow="xs" borderWidth="1px" borderRadius="xl">
                    <CardBody p={3}>
                      <Flex gap={3} align="center">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          w="60px"
                          h="60px"
                          objectFit="cover"
                          borderRadius="lg"
                          fallbackSrc="https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&auto=format&fit=crop&q=80"
                        />
                        <Box flex="1">
                          <Heading size="xs" color="gray.800" noOfLines={1}>
                            {product.name}
                          </Heading>
                          <Text fontSize="2xs" color="gray.500">
                            {product.brand} • ₹{product.price} / {product.unit}
                          </Text>
                          <HStack mt={2} spacing={2} align="center">
                            <IconButton
                              aria-label="Decrease"
                              icon={<Minus size={12} />}
                              size="xs"
                              variant="outline"
                              onClick={() => handleUpdateQty(product.id, -1)}
                            />
                            <Text fontSize="xs" fontWeight="bold">
                              {quantity}
                            </Text>
                            <IconButton
                              aria-label="Increase"
                              icon={<Plus size={12} />}
                              size="xs"
                              variant="outline"
                              onClick={() => handleUpdateQty(product.id, 1)}
                            />
                            <IconButton
                              aria-label="Remove"
                              icon={<Trash2 size={12} />}
                              size="xs"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleRemoveFromCart(product.id)}
                            />
                          </HStack>
                        </Box>
                        <Text fontSize="sm" fontWeight="800" color="purple.900">
                          ₹{(product.price * quantity).toLocaleString()}
                        </Text>
                      </Flex>
                    </CardBody>
                  </Card>
                ))}

                <Divider my={2} />

                {/* Delivery Address Input */}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.700" mb={1}>
                    Delivery Destination / Village Address:
                  </Text>
                  <Input
                    size="sm"
                    borderRadius="md"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter village, mandal, district"
                  />
                  <Text fontSize="2xs" color="gray.500" mt={1}>
                    Delivered via Rythu Bharosa Kendra (RBK) agricultural input courier.
                  </Text>
                </Box>

                {/* Payment Options */}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.700" mb={2}>
                    Payment Method:
                  </Text>
                  <RadioGroup value={paymentMethod} onChange={setPaymentMethod}>
                    <Stack spacing={2}>
                      <Radio value="SANDBOX_UPI" colorScheme="purple" fontSize="xs">
                        <HStack spacing={2} fontSize="xs">
                          <CreditCard size={14} color="#7e22ce" />
                          <Text fontWeight="medium">Sandbox UPI / Instant QR Payment</Text>
                        </HStack>
                      </Radio>
                      <Radio value="CASH_ON_DELIVERY" colorScheme="purple" fontSize="xs">
                        <HStack spacing={2} fontSize="xs">
                          <Truck size={14} color="#059669" />
                          <Text fontWeight="medium">Cash on Delivery / RBK Counter Pay</Text>
                        </HStack>
                      </Radio>
                      <Radio value="KISAN_CREDIT_CARD" colorScheme="purple" fontSize="xs">
                        <HStack spacing={2} fontSize="xs">
                          <Sparkles size={14} color="#d97706" />
                          <Text fontWeight="medium">Kisan Credit Card (KCC DBT Auto-Debit)</Text>
                        </HStack>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </Box>

                {/* Bill Details */}
                <Box bg="purple.50" p={4} borderRadius="xl" borderWidth="1px" borderColor="purple.200">
                  <VStack spacing={1.5} fontSize="xs" align="stretch">
                    <Flex justify="space-between">
                      <Text color="gray.600">Items Total:</Text>
                      <Text fontWeight="semibold">₹{itemsSubtotal.toLocaleString()}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="gray.600">Village Delivery Charge:</Text>
                      <Text fontWeight="semibold" color={deliveryCharges === 0 ? 'green.600' : 'gray.700'}>
                        {deliveryCharges === 0 ? 'FREE (Orders over ₹500)' : `₹${deliveryCharges}`}
                      </Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="gray.600">GST / Taxes:</Text>
                      <Text fontWeight="semibold" color="green.600">Included in Price</Text>
                    </Flex>
                    <Divider my={1} />
                    <Flex justify="space-between" fontSize="sm" fontWeight="900" color="purple.950">
                      <Text>Grand Total:</Text>
                      <Text>₹{grandTotal.toLocaleString()}</Text>
                    </Flex>
                  </VStack>
                </Box>
              </Stack>
            ) : (
              <VStack py={12} spacing={3} textAlign="center">
                <ShoppingCart size={48} color="#9ca3af" />
                <Heading size="sm" color="gray.700">Your Cart is Empty</Heading>
                <Text fontSize="xs" color="gray.500">
                  Explore our certified input marketplace to add items to your cart.
                </Text>
                <Button colorScheme="purple" size="sm" onClick={onCloseCart} mt={2}>
                  Start Shopping
                </Button>
              </VStack>
            )}
          </DrawerBody>

          {cartItems.length > 0 && (
            <DrawerFooter borderTopWidth="1px" p={4}>
              <Button
                colorScheme="purple"
                w="full"
                size="lg"
                onClick={handleCheckout}
                isLoading={isOrdering}
                fontWeight="bold"
              >
                Place Order (₹{grandTotal.toLocaleString()})
              </Button>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>

      {/* Order Confirmation Modal */}
      <Modal isOpen={isSuccessOpen} onClose={onCloseSuccess} size="md" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader bg="green.600" color="white" borderTopRadius="2xl">
            <HStack spacing={2}>
              <CheckCircle2 size={24} />
              <Text>Order Placed Successfully!</Text>
            </HStack>
          </ModalHeader>
          <ModalBody p={6} textAlign="center">
            <Box bg="green.50" p={4} borderRadius="xl" borderWidth="2px" borderColor="green.400" mb={4}>
              <Text fontSize="2xs" color="green.800" fontWeight="bold">ORDER REFERENCE NUMBER</Text>
              <Text fontSize="2xl" fontWeight="900" color="green.900" letterSpacing="wider">
                {orderedResult?.orderReference}
              </Text>
            </Box>

            <Alert status="success" borderRadius="lg" fontSize="xs" mb={4}>
              <AlertIcon />
              Your order has been verified and routed to the nearest authorized input dealer. Expected delivery within 24-48 hours.
            </Alert>

            <VStack spacing={2} fontSize="xs" align="stretch" bg="gray.50" p={3} borderRadius="lg">
              <Flex justify="space-between">
                <Text color="gray.500">Total Amount Paid:</Text>
                <Text fontWeight="bold">₹{orderedResult?.totalAmount?.toLocaleString()}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="gray.500">Payment Status:</Text>
                <Text fontWeight="bold" color="green.600">{orderedResult?.paymentStatus}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="gray.500">Transaction Ref:</Text>
                <Text fontWeight="bold">{orderedResult?.paymentTxnId}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="gray.500">Destination:</Text>
                <Text fontWeight="bold" noOfLines={1}>{orderedResult?.deliveryAddress}</Text>
              </Flex>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" onClick={onCloseSuccess} w="full">
              Continue Shopping
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};
