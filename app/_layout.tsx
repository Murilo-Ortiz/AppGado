import { Stack } from 'expo-router';
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  return (
    <PaperProvider>
      <Stack
        screenOptions={{
          headerShown: false, 
        }}
      >
        <Stack.Screen name="home" />
        <Stack.Screen name="add-animal" />
        <Stack.Screen name="animal/[id]" />
      </Stack>
    </PaperProvider>
  );
}
