import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

const AppColors = {
  primary: '#2d6a4f',    // Verde escuro, para botões principais e cabeçalhos
  accent: '#f4a261',     // Laranja/marrom claro para detalhes
  background: '#f8f9fa', // Fundo principal, um cinza bem claro
  surface: '#ffffff',    // Cor dos cards e inputs
  text: '#1b263b',       // Cor do texto principal
  placeholder: '#778da9',// Cor para placeholders e textos secundários
  error: '#e63946',      // Vermelho para erros
};

export const theme = {
  ...DefaultTheme, 
  colors: {
    ...DefaultTheme.colors, 
    primary: AppColors.primary,
    accent: AppColors.accent,
    background: AppColors.background,
    surface: AppColors.surface,
    text: AppColors.text,
    placeholder: AppColors.placeholder,
    error: AppColors.error,
    // Cores específicas do Paper
    onSurface: AppColors.text,
    primaryContainer: AppColors.primary,
    onPrimaryContainer: '#ffffff',
    secondaryContainer: AppColors.accent,
    onSecondaryContainer: '#ffffff',
    elevation: {
      ...DefaultTheme.colors.elevation,
      level2: AppColors.surface,
    }
  },
};
