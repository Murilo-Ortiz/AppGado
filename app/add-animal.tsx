import { useRouter } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Appbar, Button, RadioButton, TextInput, Title, TouchableRipple } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { auth, db } from '../firebaseConfig';

const DateInput = ({ label, value, onShowPicker }) => (
  <TouchableRipple onPress={onShowPicker}>
    <View>
      <TextInput
        label={label}
        value={value}
        style={styles.input}
        mode="outlined"
        editable={false}
        right={<TextInput.Icon icon="calendar" />}
      />
    </View>
  </TouchableRipple>
);

export default function AddAnimalScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [brinco, setBrinco] = useState('');
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('Vaca');
  const [raca, setRaca] = useState('');
  const [sexo, setSexo] = useState('Fêmea');
  const [numPartos, setNumPartos] = useState('');
  const [rendimentoProducao, setRendimentoProducao] = useState('');
  const [touro, setTouro] = useState('');
  const [pesoNascimento, setPesoNascimento] = useState('');
  const [datePickerTarget, setDatePickerTarget] = useState(null);
  const [dataNascimento, setDataNascimento] = useState('');
  const [dataInseminacao, setDataInseminacao] = useState('');
  const [dataParicaoEsperada, setDataParicaoEsperada] = useState('');
  const [dataSecagem, setDataSecagem] = useState('');
  const [dataDesmame, setDataDesmame] = useState('');
  const [dataPrimeiroCio, setDataPrimeiroCio] = useState('');
  const [dataInseminacaoBezerra, setDataInseminacaoBezerra] = useState('');

  const showToast = (type, text1, text2 = '') => {
    Toast.show({ type, text1, text2, position: 'bottom' });
  };

  const showDatePicker = (target) => {
    setDatePickerTarget(target);
  };

  const hideDatePicker = () => {
    setDatePickerTarget(null);
  };

  const handleConfirmDate = (date) => {
    const formattedDate = date.toLocaleDateString('pt-BR');
    const dateSetters = {
      nascimento: setDataNascimento,
      inseminacao: setDataInseminacao,
      paricao: setDataParicaoEsperada,
      secagem: setDataSecagem,
      desmame: setDataDesmame,
      cio: setDataPrimeiroCio,
      inseminacaoBezerra: setDataInseminacaoBezerra,
    };

    if (dateSetters[datePickerTarget]) {
      dateSetters[datePickerTarget](formattedDate);
    }
    
    hideDatePicker();
  };

  const handleSaveAnimal = async () => {
    if (!brinco || !nome) {
      showToast('error','Erro', 'Por favor, preencha pelo menos o Brinco e o Nome.');
      return;
    }
    if (!auth.currentUser) {
      showToast('error',"Erro de Autenticação", "Você não está logado.");
      return;
    }

    setIsLoading(true);

    let animalData = {
      brinco, nome, tipo, raca, sexo, dataNascimento,
      historicoDoencas: [], vacinas: [], vermifugacao: [], createdAt: new Date(),
    };

    if (tipo === 'Vaca') {
      animalData = {
        ...animalData,
        dataInseminacao, dataParicaoEsperada, dataSecagem, touro,
        numPartos: Number(numPartos) || 0,
        rendimentoProducao,
      };
    } else { // Bezerro
      animalData = {
        ...animalData,
        pesoNascimento, dataDesmame, pesosMensais: [],
        dataPrimeiroCio, dataInseminacaoBezerra,
      };
    }

    try {
      const userAnimalsCollection = collection(db, 'users', auth.currentUser.uid, 'animals');
      await addDoc(userAnimalsCollection, animalData);
      showToast('success',"Sucesso", "Animal salvo no seu rebanho!");
      router.back();
    } catch (error) {
      showToast('error',"Erro", "Não foi possível salvar o animal.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Adicionar Novo Animal" />
      </Appbar.Header>
      
      <ScrollView contentContainerStyle={styles.scroll}>
        <Title style={styles.title}>Tipo de Animal</Title>
        <RadioButton.Group onValueChange={setTipo} value={tipo}>
          <View style={styles.radioItem}><RadioButton value="Vaca" /><Text>Vaca</Text></View>
          <View style={styles.radioItem}><RadioButton value="Bezerro" /><Text>Bezerro/Bezerra</Text></View>
        </RadioButton.Group>

        <Title style={styles.title}>Dados de Identificação</Title>
        <TextInput label="Nº do Brinco" value={brinco} onChangeText={setBrinco} style={styles.input} mode="outlined" />
        <TextInput label="Nome do Animal" value={nome} onChangeText={setNome} style={styles.input} mode="outlined" />
        <TextInput label="Raça" value={raca} onChangeText={setRaca} style={styles.input} mode="outlined" />
        <DateInput label="Data de Nascimento" value={dataNascimento} onShowPicker={() => showDatePicker('nascimento')} />
        <Text style={styles.radioLabel}>Sexo:</Text>
        <RadioButton.Group onValueChange={setSexo} value={sexo}>
            <View style={styles.radioItem}><RadioButton value="Fêmea" /><Text>Fêmea</Text></View>
            <View style={styles.radioItem}><RadioButton value="Macho" /><Text>Macho</Text></View>
        </RadioButton.Group>

        {tipo === 'Vaca' && (
          <>
            <Title style={styles.title}>Dados de Vaca</Title>
            <TextInput label="Nº de Partos" value={numPartos} onChangeText={setNumPartos} style={styles.input} mode="outlined" keyboardType="numeric" />
            <TextInput label="Rendimento da Produção" value={rendimentoProducao} onChangeText={setRendimentoProducao} style={styles.input} mode="outlined" multiline />
            <DateInput label="Data de Inseminação" value={dataInseminacao} onShowPicker={() => showDatePicker('inseminacao')} />
            <DateInput label="Data de Parição Esperada" value={dataParicaoEsperada} onShowPicker={() => showDatePicker('paricao')} />
            <DateInput label="Data de Secagem" value={dataSecagem} onShowPicker={() => showDatePicker('secagem')} />
            <TextInput label="Touro (Pai)" value={touro} onChangeText={setTouro} style={styles.input} mode="outlined" />
          </>
        )}

        {tipo === 'Bezerro' && (
          <>
            <Title style={styles.title}>Dados de Bezerro/Bezerra</Title>
            <TextInput label="Peso ao Nascer (kg)" value={pesoNascimento} onChangeText={setPesoNascimento} style={styles.input} mode="outlined" keyboardType="numeric" />
            <DateInput label="Data de Desmame" value={dataDesmame} onShowPicker={() => showDatePicker('desmame')} />
            {sexo === 'Fêmea' && (
              <>
                <DateInput label="Data do 1º Cio" value={dataPrimeiroCio} onShowPicker={() => showDatePicker('cio')} />
                <DateInput label="Data da 1ª Inseminação" value={dataInseminacaoBezerra} onShowPicker={() => showDatePicker('inseminacaoBezerra')} />
              </>
            )}
          </>
        )}

        <Button mode="contained" onPress={handleSaveAnimal} style={styles.button} loading={isLoading} disabled={isLoading}>
          Salvar Animal
        </Button>

        <DateTimePickerModal
            isVisible={!!datePickerTarget}
            mode="date"
            onConfirm={handleConfirmDate}
            onCancel={hideDatePicker}
            locale="pt_BR"
            headerTextIOS="Escolha uma data"
            cancelTextIOS="Cancelar"
            confirmTextIOS="Confirmar"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  scroll: { padding: 16 },
  title: { fontSize: 18, marginTop: 20, marginBottom: 10, color: '#4a5568' },
  input: { marginBottom: 16 },
  radioItem: { flexDirection: 'row', alignItems: 'center' },
  radioLabel: { fontSize: 16, marginBottom: 8, color: '#333' },
  button: { paddingVertical: 8, backgroundColor: '#667eea', marginTop: 20, marginBottom: 40 },
});
