import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  fonts: {
    heading: `'Plus Jakarta Sans', 'Noto Sans Telugu', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
    body: `'Plus Jakarta Sans', 'Noto Sans Telugu', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
  },
  colors: {
    brand: {
      50: '#e8f5e9',
      100: '#c8e6c9',
      200: '#a5d6a7',
      300: '#81c784',
      400: '#66bb6a',
      500: '#2e7d32', // Primary Agri Green
      600: '#256b29',
      700: '#1b5e20', // Deep Forest Green
      800: '#154a1a',
      900: '#0d3311',
    },
    soil: {
      50: '#efebe9',
      100: '#d7ccc8',
      500: '#795548',
      700: '#4e342e',
      900: '#271711',
    },
    accent: {
      50: '#fff8e1',
      100: '#ffecb3',
      400: '#ffd54f',
      500: '#ffb300', // Mustard / Crop Harvest Yellow
      600: '#f57c00',
    }
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'lg',
      },
      sizes: {
        lg: {
          minH: '48px', // Large touch target for mobile farmers
          fontSize: 'md',
        }
      }
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          boxShadow: 'sm',
          borderWidth: '1px',
          borderColor: 'gray.100',
          _hover: {
            boxShadow: 'md',
          },
          transition: 'all 0.2s ease-in-out',
        }
      }
    },
    Badge: {
      baseStyle: {
        borderRadius: 'full',
        px: 2.5,
        py: 0.5,
        fontWeight: '600',
      }
    }
  }
});
