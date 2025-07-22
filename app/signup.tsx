import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Appbar, Button, Paragraph, TextInput, Title, useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { auth } from '../firebaseConfig';

export default function SignUpScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (type, text1, text2 = '') => {
    Toast.show({ type, text1, text2, position: 'bottom' });
  };

  const handleSignUp = () => {
    if (email === '' || password === '') {
      showToast('error', 'Erro', 'Preencha e-mail e senha para se cadastrar.');
      return;
    }
    setIsLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        showToast('success', 'Sucesso!', 'Sua conta foi criada. Você será logado automaticamente.');
        router.replace('/home');
      })
      .catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
          showToast('error', 'Erro de Cadastro', 'Este e-mail já está em uso.');
        } else {
          showToast('error', 'Erro de Cadastro', 'Não foi possível criar a conta.');
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Criar Nova Conta" titleStyle={{ fontWeight: 'bold' }} />
      </Appbar.Header>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={[styles.innerContainer, { backgroundColor: theme.colors.surface }]}>
            <Image 
              source={{ uri: 'https://placehold.co/150x150/2d6a4f/ffffff?text=AppGado' }}
              style={styles.logo}
              resizeMode="contain"
            />
            <Title style={[styles.title, { color: theme.colors.text }]}>Crie sua conta</Title>
            <Paragraph style={[styles.paragraph, { color: theme.colors.placeholder }]}>Insira seus dados para começar.</Paragraph>

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
              onPress={handleSignUp} 
              style={styles.button}
              labelStyle={styles.buttonLabel}
              loading={isLoading}
              disabled={isLoading}
            >
              Cadastrar
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  innerContainer: {
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
