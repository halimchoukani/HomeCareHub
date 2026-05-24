import { useColorScheme as useRNColorScheme } from 'react-native';

function useColorScheme(): 'light' | 'dark' {
  return useRNColorScheme() ?? 'light';
}

export { useColorScheme };
