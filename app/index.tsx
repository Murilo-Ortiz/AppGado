import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Paragraph, TextInput, Title, useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message'; // Importe o Toast
import { auth } from '../firebaseConfig';


export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type, // 'success', 'error', 'info'
      text1: text1,
      text2: text2,
      position: 'bottom',
    });
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

  const handleSignUp = () => {
    if (email === '' || password === '') {
      showToast('error', 'Erro', 'Preencha e-mail e senha para se cadastrar.');
      return;
    }
    setIsLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        showToast('success', 'Sucesso!', 'Sua conta foi criada.');
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, {backgroundColor: theme.colors.background}]}
    >
      <View style={[styles.innerContainer,{backgroundColor: theme.colors.surface}]}>
        <Image 
          source={{ uri: 'https://placehold.co/150x150/2d6a4f/ffffff?text=AppGado' }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Title style={[styles.title,{color:theme.colors.text}]}>Bem-vindo!</Title>
        <Paragraph style={[styles.paragraph, { color: theme.colors.placeholder }]}>Acesse ou crie sua conta para gerenciar seu rebanho.</Paragraph>

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
          onPress={handleSignUp}
          textColor="#667eea"
          disabled={isLoading}
        >
          Criar uma nova conta
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContainer: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 24,
    color: '#718096',
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
    backgroundColor: '#667eea',
  },
  buttonLabel: {
    fontSize: 16,
  },
});
