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

export default function AddDiseaseScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const [isSaving, setIsSaving] = useState(false);

  const [nomeDoenca, setNomeDoenca] = useState('');
  const [dataOcorrencia, setDataOcorrencia] = useState('');
  const [tratamento, setTratamento] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showToast = (type, text1, text2 = '') => {
    Toast.show({ type, text1, text2, position: 'bottom' });
  };

  const handleSave = async () => {
    if (!nomeDoenca.trim() || !dataOcorrencia.trim()) {
      showToast('error', 'Campos Obrigatórios', 'O nome da doença e a data devem ser preenchidos.');
      return;
    }
    setIsSaving(true);
    const newDiseaseRecord = {
      id: new Date().getTime().toString(),
      nome: nomeDoenca.trim(),
      data: dataOcorrencia,
      tratamento: tratamento.trim(),
    };
    try {
      const animalDocRef = doc(db, 'users', auth.currentUser.uid, 'animals', id);
      await updateDoc(animalDocRef, { historicoDoencas: arrayUnion(newDiseaseRecord) });
      showToast('success', 'Sucesso', 'Doença registrada!');
      router.back();
    } catch (error) {
      showToast('error', 'Erro', 'Não foi possível registrar a doença.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Registrar Doença" titleStyle={{ fontWeight: 'bold' }} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Title style={styles.title}>Dados da Doença</Title>
        <TextInput label="Nome da Doença *" value={nomeDoenca} onChangeText={setNomeDoenca} style={styles.input} mode="outlined" />
        <DateInput label="Data da Ocorrência *" value={dataOcorrencia} onShowPicker={() => setDatePickerVisibility(true)} />
        <TextInput label="Tratamento/Observações" value={tratamento} onChangeText={setTratamento} style={styles.input} mode="outlined" multiline numberOfLines={4} />

        <Button mode="contained" onPress={handleSave} style={styles.button} loading={isSaving} disabled={isSaving}>
          Salvar Registro
        </Button>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={(date) => {
            setDataOcorrencia(date.toLocaleDateString('pt-BR'));
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
