import { useLocalSearchParams, useRouter } from 'expo-router';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Appbar, Button, TextInput, Title, TouchableRipple } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { auth, db } from '../../../firebaseConfig';

const DateInput = ({ label, value, onShowPicker }) => (
  <TouchableRipple onPress={onShowPicker}>
    <View>
      <TextInput label={label} value={value} style={styles.input} mode="outlined" editable={false} right={<TextInput.Icon icon="calendar" />} />
    </View>
  </TouchableRipple>
);

export default function AddVaccineScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isSaving, setIsSaving] = useState(false);
  const [nomeVacina, setNomeVacina] = useState('');
  const [lote, setLote] = useState('');
  const [aplicador, setAplicador] = useState('');
  const [dataAplicacao, setDataAplicacao] = useState('');
  const [validade, setValidade] = useState('');
  const [datePickerTarget, setDatePickerTarget] = useState(null);
  const showDatePicker = (target) => setDatePickerTarget(target);
  const hideDatePicker = () => setDatePickerTarget(null);

  const showToast = (type, text1, text2 = '') => {
    Toast.show({ type, text1, text2, position: 'bottom' });
  };

  const handleConfirmDate = (date) => {
    const formattedDate = date.toLocaleDateString('pt-BR');
    if (datePickerTarget === 'aplicacao') {
      setDataAplicacao(formattedDate);
    } else if (datePickerTarget === 'validade') {
      setValidade(formattedDate);
    }
    hideDatePicker();
  };

  const handleSaveVaccine = async () => {
    if (!nomeVacina || !dataAplicacao) {
      Alert.alert("Erro", "O nome da vacina e a data de aplicação são obrigatórios.");
      return;
    }
    setIsSaving(true);
    const newVaccine = {
      id: new Date().getTime().toString(),
      nome: nomeVacina,
      data: dataAplicacao,
      lote,
      validade,
      aplicacao: aplicador,
    };
    try {
      const animalDocRef = doc(db, 'users', auth.currentUser.uid, 'animals', id);
      await updateDoc(animalDocRef, { vacinas: arrayUnion(newVaccine) });
      showToast('success',"Sucesso", "Vacina registrada!");
      router.back();
    } catch (error) {
      showToast('error',"Erro", "Não foi possível registrar a vacina.");
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
        <DateInput label="Data de Aplicação" value={dataAplicacao} onShowPicker={() => showDatePicker('aplicacao')} />
        <TextInput label="Lote" value={lote} onChangeText={setLote} style={styles.input} mode="outlined" />
        <DateInput label="Validade" value={validade} onShowPicker={() => showDatePicker('validade')} />
        <TextInput label="Aplicado por" value={aplicador} onChangeText={setAplicador} style={styles.input} mode="outlined" />

        <Button mode="contained" onPress={handleSaveVaccine} style={styles.button} loading={isSaving} disabled={isSaving}>
          Salvar Vacina
        </Button>

        <DateTimePickerModal isVisible={!!datePickerTarget} mode="date" onConfirm={handleConfirmDate} onCancel={hideDatePicker} locale="pt_BR" />
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
