import { useLocalSearchParams, useRouter } from 'expo-router';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Appbar, Button, TextInput, Title, TouchableRipple, useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { auth, db } from '../../../firebaseConfig';

const DateInput = ({ label, value, onShowPicker }) => (
  <TouchableRipple onPress={onShowPicker}>
    <View>
      <TextInput label={label} value={value} style={styles.input} mode="outlined" editable={false} right={<TextInput.Icon icon="calendar" />} />
    </View>
  </TouchableRipple>
);

export default function AddWeightScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const [isSaving, setIsSaving] = useState(false);

  const [peso, setPeso] = useState('');
  const [dataPesagem, setDataPesagem] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showToast = (type, text1, text2 = '') => {
    Toast.show({ type, text1, text2, position: 'bottom' });
  };

  const handleSave = async () => {
    if (!peso.trim() || !dataPesagem.trim()) {
      showToast('error', 'Campos Obrigatórios', 'O peso e a data devem ser preenchidos.');
      return;
    }
    if (isNaN(Number(peso))) {
      showToast('error', 'Dado Inválido', 'O peso deve ser um número.');
      return;
    }
    setIsSaving(true);
    const newWeightRecord = {
      id: new Date().getTime().toString(),
      peso: peso.trim(),
      data: dataPesagem,
    };
    try {
      const animalDocRef = doc(db, 'users', auth.currentUser.uid, 'animals', id);
      await updateDoc(animalDocRef, { pesosMensais: arrayUnion(newWeightRecord) });
      showToast('success', 'Sucesso', 'Peso registrado!');
      router.back();
    } catch (error) {
      showToast('error', 'Erro', 'Não foi possível registrar o peso.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Registrar Novo Peso" titleStyle={{ fontWeight: 'bold' }} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Title style={styles.title}>Dados da Pesagem</Title>
        <TextInput label="Peso (kg) *" value={peso} onChangeText={setPeso} style={styles.input} mode="outlined" keyboardType="numeric" />
        <DateInput label="Data da Pesagem *" value={dataPesagem} onShowPicker={() => setDatePickerVisibility(true)} />

        <Button mode="contained" onPress={handleSave} style={styles.button} loading={isSaving} disabled={isSaving}>
          Salvar Registro
        </Button>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={(date) => {
            setDataPesagem(date.toLocaleDateString('pt-BR'));
            setDatePickerVisibility(false);
          }}
          onCancel={() => setDatePickerVisibility(false)}
          locale="pt_BR"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16 },
  title: { 
    fontSize: 18, 
    marginTop: 20, 
    marginBottom: 10, 
    fontWeight: '600' 
  },
  input: { 
    marginBottom: 16 
  },
  button: { 
    paddingVertical: 8, 
    marginTop: 20,
    borderRadius: 8,
  },
});
