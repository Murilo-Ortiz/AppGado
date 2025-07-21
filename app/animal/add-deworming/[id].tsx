import { useLocalSearchParams, useRouter } from 'expo-router';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, TextInput, Title } from 'react-native-paper';
import { auth, db } from '../../../firebaseConfig';

export default function AddDewormingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // ID do animal
  const [isSaving, setIsSaving] = useState(false);

  // Estados para os campos
  const [produto, setProduto] = useState('');
  const [dataAplicacao, setDataAplicacao] = useState('');

  const handleSave = async () => {
    if (!produto || !dataAplicacao) {
      Alert.alert("Erro", "O nome do produto e a data são obrigatórios.");
      return;
    }
    setIsSaving(true);

    const newDewormingRecord = {
      id: new Date().getTime().toString(), // ID único
      produto: produto,
      data: dataAplicacao,
    };

    try {
      const animalDocRef = doc(db, 'users', auth.currentUser.uid, 'animals', id);
      await updateDoc(animalDocRef, {
        vermifugacao: arrayUnion(newDewormingRecord)
      });
      Alert.alert("Sucesso", "Vermifugação registrada!");
      router.back();
    } catch (error) {
      console.error("Erro ao salvar vermifugação:", error);
      Alert.alert("Erro", "Não foi possível registrar a vermifugação.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Registrar Vermifugação" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Title style={styles.title}>Dados da Vermifugação</Title>
        <TextInput label="Nome do Produto" value={produto} onChangeText={setProduto} style={styles.input} mode="outlined" />
        <TextInput label="Data de Aplicação (DD/MM/AAAA)" value={dataAplicacao} onChangeText={setDataAplicacao} style={styles.input} mode="outlined" />

        <Button mode="contained" onPress={handleSave} style={styles.button} loading={isSaving} disabled={isSaving}>
          Salvar Registro
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  scroll: { padding: 16 },
  title: { fontSize: 18, marginBottom: 10, color: '#4a5568' },
  input: { marginBottom: 16 },
  button: { paddingVertical: 8, backgroundColor: '#667eea', marginTop: 20 },
});
