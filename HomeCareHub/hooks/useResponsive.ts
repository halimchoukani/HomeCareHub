import { useWindowDimensions } from 'react-native';

const BREAKPOINTS = {
  TABLET: 768,
  DESKTOP: 1024,
};

export function useResponsive() {
  const { width } = useWindowDimensions();

  const isDesktop = width >= BREAKPOINTS.DESKTOP;
  const isTablet = width >= BREAKPOINTS.TABLET && width < BREAKPOINTS.DESKTOP;
  const columnCount = isDesktop ? 4 : isTablet ? 2 : 1;
  const contentMaxWidth = isDesktop ? 1200 : width;

  return { isDesktop, isTablet, columnCount, contentMaxWidth };
}
