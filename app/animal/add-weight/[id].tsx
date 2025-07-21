import { useLocalSearchParams, useRouter } from 'expo-router';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, TextInput, Title } from 'react-native-paper';
import { auth, db } from '../../../firebaseConfig';

export default function AddWeightScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // ID do animal
  const [isSaving, setIsSaving] = useState(false);

  // Estados para os campos
  const [peso, setPeso] = useState('');
  const [dataPesagem, setDataPesagem] = useState('');

  const handleSave = async () => {
    if (!peso || !dataPesagem) {
      Alert.alert("Erro", "O peso e a data são obrigatórios.");
      return;
    }
    setIsSaving(true);

    const newWeightRecord = {
      id: new Date().getTime().toString(), // ID único
      peso: peso,
      data: dataPesagem,
    };

    try {
      const animalDocRef = doc(db, 'users', auth.currentUser.uid, 'animals', id);
      await updateDoc(animalDocRef, {
        pesosMensais: arrayUnion(newWeightRecord)
      });
      Alert.alert("Sucesso", "Peso registrado!");
      router.back();
    } catch (error) {
      console.error("Erro ao salvar peso:", error);
      Alert.alert("Erro", "Não foi possível registrar o peso.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Registrar Novo Peso" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Title style={styles.title}>Dados da Pesagem</Title>
        <TextInput label="Peso (kg)" value={peso} onChangeText={setPeso} style={styles.input} mode="outlined" keyboardType="numeric" />
        <TextInput label="Data da Pesagem (DD/MM/AAAA)" value={dataPesagem} onChangeText={setDataPesagem} style={styles.input} mode="outlined" />

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
