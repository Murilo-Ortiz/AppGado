import { useLocalSearchParams, useRouter } from 'expo-router';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, TextInput, Title } from 'react-native-paper';
import { auth, db } from '../../../firebaseConfig';

export default function AddVaccineScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // ID do animal
  const [isSaving, setIsSaving] = useState(false);

  // Estados para os campos da vacina
  const [nomeVacina, setNomeVacina] = useState('');
  const [dataAplicacao, setDataAplicacao] = useState('');
  const [lote, setLote] = useState('');
  const [validade, setValidade] = useState('');
  const [aplicador, setAplicador] = useState('');

  const handleSaveVaccine = async () => {
    if (!nomeVacina || !dataAplicacao) {
      Alert.alert("Erro", "O nome da vacina e a data de aplicação são obrigatórios.");
      return;
    }
    setIsSaving(true);

    const newVaccine = {
      id: new Date().getTime().toString(), // ID único para a vacina
      nome: nomeVacina,
      data: dataAplicacao,
      lote,
      validade,
      aplicacao: aplicador,
    };

    try {
      const animalDocRef = doc(db, 'users', auth.currentUser.uid, 'animals', id);
      await updateDoc(animalDocRef, {
        vacinas: arrayUnion(newVaccine) // Adiciona a nova vacina ao array existente
      });
      Alert.alert("Sucesso", "Vacina registrada!");
      router.back();
    } catch (error) {
      console.error("Erro ao salvar vacina:", error);
      Alert.alert("Erro", "Não foi possível registrar a vacina.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Registrar Nova Vacina" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Title style={styles.title}>Dados da Vacina</Title>
        <TextInput label="Nome da Vacina" value={nomeVacina} onChangeText={setNomeVacina} style={styles.input} mode="outlined" />
        <TextInput label="Data de Aplicação (DD/MM/AAAA)" value={dataAplicacao} onChangeText={setDataAplicacao} style={styles.input} mode="outlined" />
        <TextInput label="Lote" value={lote} onChangeText={setLote} style={styles.input} mode="outlined" />
        <TextInput label="Validade (DD/MM/AAAA)" value={validade} onChangeText={setValidade} style={styles.input} mode="outlined" />
        <TextInput label="Aplicado por" value={aplicador} onChangeText={setAplicador} style={styles.input} mode="outlined" />

        <Button mode="contained" onPress={handleSaveVaccine} style={styles.button} loading={isSaving} disabled={isSaving}>
          Salvar Vacina
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
