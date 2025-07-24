import { useRouter } from 'expo-router';
import { updatePassword } from "firebase/auth";
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, Paragraph, TextInput, Title, useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { auth } from '../firebaseConfig';

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const user = auth.currentUser;

  const showToast = (type, text1, text2 = '') => {
    Toast.show({ type, text1, text2, position: 'bottom' });
  };

  const handleChangePassword = () => {
    if (newPassword.trim() === '' || confirmPassword.trim() === '') {
      showToast('error', 'Erro', 'Preencha os dois campos de senha.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'Erro', 'As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      showToast('error', 'Erro', 'A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);
    updatePassword(user, newPassword)
      .then(() => {
        showToast('success', 'Sucesso!', 'Sua senha foi alterada.');
        setNewPassword('');
        setConfirmPassword('');
      })
      .catch((error) => {
        console.error("Erro ao alterar senha:", error);
        showToast('error', 'Erro', 'Não foi possível alterar a senha. Tente fazer login novamente.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Meu Perfil" titleStyle={{ fontWeight: 'bold' }} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Informações da Conta</Title>
            <Paragraph>E-mail: {user?.email}</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Alterar Senha</Title>
            <TextInput
              label="Nova Senha"
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.input}
              mode="outlined"
              secureTextEntry
              disabled={isLoading}
            />
            <TextInput
              label="Confirmar Nova Senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              mode="outlined"
              secureTextEntry
              disabled={isLoading}
            />
            <Button 
              mode="contained" 
              onPress={handleChangePassword} 
              style={styles.button}
              loading={isLoading}
              disabled={isLoading}
            >
              Salvar Nova Senha
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16 },
  card: {
    marginBottom: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: '600',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    paddingVertical: 8,
    marginTop: 8,
    borderRadius: 8,
  },
});
