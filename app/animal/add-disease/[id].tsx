import { useLocalSearchParams, useRouter } from 'expo-router';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, TextInput, Title } from 'react-native-paper';
import { auth, db } from '../../../firebaseConfig';

export default function AddDiseaseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // ID do animal
  const [isSaving, setIsSaving] = useState(false);

  // Estados para os campos
  const [nomeDoenca, setNomeDoenca] = useState('');
  const [dataOcorrencia, setDataOcorrencia] = useState('');
  const [tratamento, setTratamento] = useState('');

  const handleSave = async () => {
    if (!nomeDoenca || !dataOcorrencia) {
      Alert.alert("Erro", "O nome da doença e a data são obrigatórios.");
      return;
    }
    setIsSaving(true);

    const newDiseaseRecord = {
      id: new Date().getTime().toString(), // ID único
      nome: nomeDoenca,
      data: dataOcorrencia,
      tratamento: tratamento,
    };

    try {
      const animalDocRef = doc(db, 'users', auth.currentUser.uid, 'animals', id);
      await updateDoc(animalDocRef, {
        historicoDoencas: arrayUnion(newDiseaseRecord)
      });
      Alert.alert("Sucesso", "Doença registrada!");
      router.back();
    } catch (error) {
      console.error("Erro ao salvar doença:", error);
      Alert.alert("Erro", "Não foi possível registrar a doença.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Registrar Doença" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Title style={styles.title}>Dados da Doença</Title>
        <TextInput label="Nome da Doença" value={nomeDoenca} onChangeText={setNomeDoenca} style={styles.input} mode="outlined" />
        <TextInput label="Data da Ocorrência (DD/MM/AAAA)" value={dataOcorrencia} onChangeText={setDataOcorrencia} style={styles.input} mode="outlined" />
        <TextInput label="Tratamento/Observações" value={tratamento} onChangeText={setTratamento} style={styles.input} mode="outlined" multiline numberOfLines={4} />

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
