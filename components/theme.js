import { DefaultTheme } from 'react-native-paper';

export default {
  ...DefaultTheme,
  roundness: 3,
  colors: {
    ...DefaultTheme.colors,
    primary: 'green',
    secondary: 'orange',
  },
  fonts: {
    regular: {
      fontFamily: 'Body',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'Body-Bold',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'Body-Bold',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'Body',
      fontWeight: 'normal',
    },
  },
};
