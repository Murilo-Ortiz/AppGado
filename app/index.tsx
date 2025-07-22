import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Paragraph, TextInput, Title, useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { auth } from '../firebaseConfig';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  const showToast = (type, text1, text2) => {
    Toast.show({ type, text1, text2, position: 'bottom' });
  };

  const handleLogin = () => {
    if (email === '' || password === '') {
      showToast('error', 'Erro', 'Por favor, preencha e-mail e senha.');
      return;
    }
    setIsLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        router.replace('/home');
      })
      .catch(() => {
        showToast('error', 'Erro de Login', 'E-mail ou senha inválidos.');
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.innerContainer, { backgroundColor: theme.colors.surface }]}>
        <Image 
          source={{ uri: 'https://placehold.co/150x150/2d6a4f/ffffff?text=AppGado' }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Title style={[styles.title, { color: theme.colors.text }]}>Bem-vindo!</Title>
        <Paragraph style={[styles.paragraph, { color: theme.colors.placeholder }]}>Acesse para gerenciar seu rebanho.</Paragraph>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          disabled={isLoading}
        />

        <TextInput
          label="Senha"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          mode="outlined"
          secureTextEntry
          disabled={isLoading}
        />

        <Button 
          mode="contained" 
          onPress={handleLogin}
          style={styles.button}
          labelStyle={styles.buttonLabel}
          loading={isLoading}
          disabled={isLoading}
        >
          Entrar
        </Button>

        <Button 
          mode="text" 
          onPress={() => router.push('/signup')} // Navega para a nova tela de cadastro
          textColor={theme.colors.primary}
          disabled={isLoading}
        >
          Ainda não tem uma conta? Cadastre-se
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContainer: {
    width: '90%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 24,
    borderRadius: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    paddingVertical: 8,
    marginTop: 8,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
