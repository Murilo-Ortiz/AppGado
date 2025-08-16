import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Appbar, TextInput, Button, Title, Paragraph, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { auth } from '../firebaseConfig';
import { sendPasswordResetEmail } from "firebase/auth";
import Toast from 'react-native-toast-message';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (type, text1, text2 = '') => {
    Toast.show({ type, text1, text2, position: 'bottom' });
  };

  const handleSendResetEmail = () => {
    if (email.trim() === '') {
      showToast('error', 'Erro', 'Por favor, insira o seu e-mail.');
      return;
    }
    setIsLoading(true);
    sendPasswordResetEmail(auth, email)
      .then(() => {
        showToast('success', 'E-mail Enviado', 'Verifique a sua caixa de entrada para redefinir a senha.');
        router.back();
      })
      .catch((error) => {
        console.error(error);
        showToast('error', 'Erro', 'Não foi possível enviar o e-mail. Verifique se o e-mail está correto.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Recuperar Senha" titleStyle={{ fontWeight: 'bold' }} />
      </Appbar.Header>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={[styles.innerContainer, { backgroundColor: theme.colors.surface }]}>
            <Title style={[styles.title, { color: theme.colors.text }]}>Esqueceu a sua senha?</Title>
            <Paragraph style={[styles.paragraph, { color: theme.colors.placeholder }]}>
              Insira o seu e-mail abaixo para receber um link de redefinição de senha.
            </Paragraph>

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

            <Button
              mode="contained"
              onPress={handleSendResetEmail}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              loading={isLoading}
              disabled={isLoading}
            >
              Enviar E-mail de Recuperação
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
