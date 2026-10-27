import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  VStack,
  Divider,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../app/store';
import { setLanguage, switchRole, logout, UserRole } from '../app/authSlice';
import { Language, translations } from '../i18n/translations';
import {
  Sprout,
  Menu as MenuIcon,
  Phone,
  ShieldCheck,
  Building2,
  ShoppingBag,
  FileText,
  Calculator,
  Activity,
  UserCheck,
  Globe,
  Sliders,
  HeartPulse,
  TrendingUp,
  LogOut,
  LogIn,
} from 'lucide-react';
import { ROUTES } from '../routes';
import { ROLE_ROUTE_PERMISSIONS } from '../routes/routeConfig';

const ALL_ROLES: UserRole[] = [
  'FARMER',
  'CROP_BUYER',
  'CROP_SELLER',
  'LIVESTOCK_BUYER',
  'LIVESTOCK_SELLER',
  'EQUIPMENT_BUYER',
  'EQUIPMENT_SELLER',
  'VETERINARIAN',
  'MARKET_STAFF',
  'GODOWN_OPERATOR',
  'DELIVERY_WORKER',
  'HELP_DESK_OPERATOR',
  'ADMIN',
];

export const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { language, activeRole, user, token } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = Boolean(token);
  const t = translations[language];
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLanguageChange = (lang: Language) => {
    dispatch(setLanguage(lang));
  };

  const handleRoleChange = (newRole: UserRole) => {
    dispatch(switchRole(newRole));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  const allNavLinks = [
    { label: t.nav.dashboard, path: ROUTES.HOME, icon: Sprout },
    { label: t.nav.markets, path: ROUTES.MARKETS, icon: Building2 },
    { label: language === 'te' ? 'మార్కెట్ ధరలు (MSP)' : 'Mandi Prices', path: ROUTES.PRICES, icon: TrendingUp },
    { label: t.nav.godowns, path: ROUTES.GODOWNS, icon: Building2 },
    { label: t.nav.marketplace, path: ROUTES.MARKETPLACE, icon: ShoppingBag },
    { label: t.nav.schemes, path: ROUTES.SCHEMES, icon: FileText },
    { label: t.nav.fieldServices, path: ROUTES.FIELD_SERVICES, icon: HeartPulse },
    { label: t.nav.cropHealth, path: ROUTES.CROP_HEALTH, icon: Activity },
    { label: t.nav.calculators, path: ROUTES.CALCULATORS, icon: Calculator },
    { label: t.nav.ivrSimulator, path: ROUTES.IVR, icon: Phone },
    { label: t.nav.staffPortal, path: ROUTES.STAFF, icon: UserCheck },
    { label: t.nav.admin, path: ROUTES.ADMIN, icon: Sliders },
  ];

  // Only show modules/tabs permitted for the user's active role when authenticated
  const navLinks = isAuthenticated
    ? allNavLinks.filter((item) => {
        const permittedRoles = ROLE_ROUTE_PERMISSIONS[item.path];
        return !permittedRoles || permittedRoles.includes(activeRole);
      })
    : [];

  return (
    <Box bg="brand.700" color="white" px={4} py={3} shadow="md" position="sticky" top={0} zIndex={100}>
      <Flex maxW="1400px" mx="auto" align="center" justify="space-between">
        {/* Brand Logo & Pilot District Badge */}
        <HStack spacing={3} as={RouterLink} to={isAuthenticated ? ROUTES.HOME : ROUTES.LOGIN}>
          <Flex bg="white" color="brand.700" p={2} borderRadius="xl" shadow="inner">
            <Sprout size={24} />
          </Flex>
          <Box>
            <HStack spacing={2} align="center">
              <Text fontSize="lg" fontWeight="800" letterSpacing="tight" lineHeight="1.1">
                {t.appName}
              </Text>
              <Badge bg="accent.400" color="gray.900" fontSize="2xs" px={2} py={0.5} borderRadius="full">
                {t.pilotBadge}
              </Badge>
            </HStack>
            <Text fontSize="xs" color="brand.100" display={{ base: 'none', md: 'block' }}>
              {t.tagline}
            </Text>
          </Box>
        </HStack>

        {/* Right Action Controls: Language Menu & Role Switcher */}
        <HStack spacing={2.5}>
          {/* Trilingual Language Dropdown */}
          <Menu>
            <MenuButton
              as={Button}
              size="sm"
              variant="solid"
              bg="whiteAlpha.200"
              color="white"
              _hover={{ bg: 'whiteAlpha.300' }}
              leftIcon={<Globe size={15} />}
              fontWeight="bold"
            >
              {language === 'en' ? 'English' : language === 'te' ? 'తెలుగు' : 'हिन्दी'}
            </MenuButton>
            <MenuList color="gray.800" zIndex={200} shadow="xl" borderRadius="lg">
              <MenuItem
                onClick={() => handleLanguageChange('en')}
                fontWeight={language === 'en' ? 'bold' : 'normal'}
                bg={language === 'en' ? 'green.50' : 'transparent'}
              >
                English
              </MenuItem>
              <MenuItem
                onClick={() => handleLanguageChange('te')}
                fontWeight={language === 'te' ? 'bold' : 'normal'}
                bg={language === 'te' ? 'green.50' : 'transparent'}
              >
                తెలుగు (Telugu)
              </MenuItem>
              <MenuItem
                onClick={() => handleLanguageChange('hi')}
                fontWeight={language === 'hi' ? 'bold' : 'normal'}
                bg={language === 'hi' ? 'green.50' : 'transparent'}
              >
                हिन्दी (Hindi)
              </MenuItem>
            </MenuList>
          </Menu>

          {/* Interactive Role Switcher across all 13 Roles (Only visible when logged in) */}
          {isAuthenticated && (
            <Menu>
              <MenuButton
                as={Button}
                size="sm"
                bg="accent.500"
                color="gray.900"
                _hover={{ bg: 'accent.400' }}
                fontWeight="bold"
                leftIcon={<ShieldCheck size={15} />}
                maxW={{ base: '120px', md: '200px' }}
                isTruncated
              >
                {t.roles[activeRole] || activeRole}
              </MenuButton>
              <MenuList color="gray.800" zIndex={200} shadow="xl" borderRadius="lg" maxH="380px" overflowY="auto">
                <Box px={3} py={1} fontSize="xs" fontWeight="bold" color="gray.500">
                  {t.switchRole}:
                </Box>
                <Divider my={1} />
                {ALL_ROLES.map((role) => (
                  <MenuItem
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    fontWeight={activeRole === role ? 'bold' : 'normal'}
                    bg={activeRole === role ? 'green.50' : 'transparent'}
                    fontSize="xs"
                  >
                    <HStack justify="space-between" width="100%">
                      <Text>{t.roles[role] || role}</Text>
                      {user?.roles?.includes(role) && (
                        <Badge colorScheme="green" fontSize="2xs">Assigned</Badge>
                      )}
                    </HStack>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          )}

          {/* User Auth indicator / Logout */}
          {isAuthenticated ? (
            <Button
              size="sm"
              variant="outline"
              colorScheme="whiteAlpha"
              color="white"
              onClick={handleLogout}
              leftIcon={<LogOut size={14} />}
              display={{ base: 'none', md: 'inline-flex' }}
            >
              {t.logout}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="solid"
              colorScheme="brand"
              bg="brand.600"
              color="white"
              as={RouterLink}
              to={ROUTES.LOGIN}
              leftIcon={<LogIn size={14} />}
            >
              {t.login}
            </Button>
          )}

          {/* Mobile Menu Hamburger (Only when authenticated) */}
          {isAuthenticated && (
            <IconButton
              display={{ base: 'flex', lg: 'none' }}
              aria-label="Open Navigation"
              icon={<MenuIcon size={20} />}
              variant="ghost"
              color="white"
              onClick={onOpen}
            />
          )}
        </HStack>
      </Flex>

      {/* Desktop Navigation Bar (Only visible when logged in) */}
      {isAuthenticated && navLinks.length > 0 && (
        <Box display={{ base: 'none', lg: 'block' }} borderTopWidth="1px" borderColor="whiteAlpha.200" mt={3} pt={2}>
          <Flex maxW="1400px" mx="auto" gap={1} overflowX="auto" py={1}>
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  as={RouterLink}
                  to={item.path}
                  size="sm"
                  variant="ghost"
                  color={isActive ? 'accent.400' : 'whiteAlpha.900'}
                  bg={isActive ? 'whiteAlpha.200' : 'transparent'}
                  _hover={{ bg: 'whiteAlpha.200', color: 'accent.400' }}
                  leftIcon={<Icon size={15} />}
                  fontSize="xs"
                  fontWeight={isActive ? 'bold' : 'medium'}
                  px={3}
                >
                  {item.label}
                </Button>
              );
            })}
          </Flex>
        </Box>
      )}

      {/* Mobile Drawer Navigation */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="gray.50">
          <DrawerHeader bg="brand.700" color="white" display="flex" alignItems="center" gap={2}>
            <Sprout size={24} />
            <Text fontSize="md" fontWeight="bold">{t.appName}</Text>
          </DrawerHeader>
          <DrawerBody p={4}>
            {isAuthenticated ? (
              <VStack align="stretch" spacing={2}>
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Button
                      key={item.path}
                      as={RouterLink}
                      to={item.path}
                      onClick={onClose}
                      justifyContent="flex-start"
                      variant={isActive ? 'solid' : 'ghost'}
                      colorScheme="brand"
                      leftIcon={<Icon size={18} />}
                    >
                      {item.label}
                    </Button>
                  );
                })}
                <Divider my={3} />
                <Button
                  onClick={() => {
                    onClose();
                    handleLogout();
                  }}
                  variant="outline"
                  colorScheme="red"
                  leftIcon={<LogOut size={16} />}
                >
                  {t.logout}
                </Button>
              </VStack>
            ) : (
              <VStack align="stretch" spacing={3} pt={4}>
                <Text fontSize="sm" color="gray.600">Please sign in to access market services.</Text>
                <Button as={RouterLink} to={ROUTES.LOGIN} onClick={onClose} colorScheme="brand" leftIcon={<LogIn size={16} />}>
                  {t.login}
                </Button>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};
