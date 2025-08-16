import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { Appbar, TextInput, Button, RadioButton, Title, TouchableRipple, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, query, getDocs } from 'firebase/firestore';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';

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
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  
  const [animalList, setAnimalList] = useState([]);

  // Estados dos campos
  const [brinco, setBrinco] = useState('');
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('Vaca');
  const [raca, setRaca] = useState('');
  const [sexo, setSexo] = useState('Fêmea');
  const [numPartos, setNumPartos] = useState('');
  const [rendimentoProducao, setRendimentoProducao] = useState('');
  const [touro, setTouro] = useState('');
  const [pesoNascimento, setPesoNascimento] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [dataInseminacao, setDataInseminacao] = useState('');
  const [dataParicaoEsperada, setDataParicaoEsperada] = useState('');
  const [dataSecagem, setDataSecagem] = useState('');
  const [dataDesmame, setDataDesmame] = useState('');
  const [dataPrimeiroCio, setDataPrimeiroCio] = useState('');
  const [dataInseminacaoBezerra, setDataInseminacaoBezerra] = useState('');
  const [datePickerTarget, setDatePickerTarget] = useState(null);
  const [idMae, setIdMae] = useState(null);
  const [idTouroPai, setIdTouroPai] = useState(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const fetchAnimals = async () => {
      const userAnimalsCollection = collection(db, 'users', auth.currentUser.uid, 'animals');
      const q = query(userAnimalsCollection);
      const querySnapshot = await getDocs(q);
      const animals = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAnimalList(animals);
    };

    fetchAnimals();
  }, []);

  const showToast = (type, text1, text2 = '') => {
    Toast.show({ type, text1, text2, position: 'bottom' });
  };

  const showDatePicker = (target) => setDatePickerTarget(target);
  const hideDatePicker = () => setDatePickerTarget(null);

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

  const validateFields = () => {
    const brincoRegex = /^\d{5}$/; // Regex para exatamente 5 dígitos numéricos
    if (!brinco.trim() || !nome.trim()) {
      showToast('error', 'Campos Obrigatórios', 'Brinco e Nome devem ser preenchidos.');
      return false;
    }
    if (!brincoRegex.test(brinco.trim())) {
      showToast('error', 'Dado Inválido', 'O Nº do brinco deve conter exatamente 5 dígitos.');
      return false;
    }
    if (tipo === 'Vaca' && numPartos && isNaN(Number(numPartos))) {
      showToast('error', 'Dado Inválido', 'Nº de Partos deve ser um número.');
      return false;
    }
    if (tipo === 'Bezerro' && pesoNascimento && isNaN(Number(pesoNascimento))) {
      showToast('error', 'Dado Inválido', 'Peso ao Nascer deve ser um número.');
      return false;
    }
    return true;
  };

  const handleSaveAnimal = async () => {
    if (!validateFields()) {
      return;
    }
    if (!auth.currentUser) {
      showToast('error', 'Erro de Autenticação', 'Você não está logado.');
      return;
    }

    setIsLoading(true);

    let animalData = {
      brinco: brinco.trim(),
      nome: nome.trim(),
      tipo, raca, sexo, dataNascimento,
      historicoDoencas: [], vacinas: [], vermifugacao: [], pesosMensais: [], createdAt: new Date(),
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
        pesoNascimento, dataDesmame,
        dataPrimeiroCio, dataInseminacaoBezerra,
        idMae, idTouroPai,
      };
    }

    try {
      const userAnimalsCollection = collection(db, 'users', auth.currentUser.uid, 'animals');
      await addDoc(userAnimalsCollection, animalData);
      showToast('success', 'Sucesso', 'Animal salvo no seu rebanho!');
      router.back();
    } catch (error) {
      showToast('error', 'Erro', 'Não foi possível salvar o animal.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const potentialMothers = animalList.filter(animal => animal.sexo === 'Fêmea');
  const potentialFathers = animalList.filter(animal => animal.sexo === 'Macho');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Adicionar Novo Animal" titleStyle={{ fontWeight: 'bold' }} />
      </Appbar.Header>
      
      <ScrollView contentContainerStyle={styles.scroll}>
        <Title style={styles.title}>Tipo de Animal</Title>
        <RadioButton.Group onValueChange={setTipo} value={tipo}>
          <View style={styles.radioContainer}>
            <View style={styles.radioItem}><RadioButton value="Vaca" /><Text>Vaca</Text></View>
            <View style={styles.radioItem}><RadioButton value="Bezerro" /><Text>Bezerro/Bezerra</Text></View>
          </View>
        </RadioButton.Group>

        <Title style={styles.title}>Dados de Identificação</Title>
        <TextInput label="Nº do Brinco *" value={brinco} onChangeText={setBrinco} style={styles.input} mode="outlined" keyboardType="numeric" maxLength={5} />
        <TextInput label="Nome do Animal *" value={nome} onChangeText={setNome} style={styles.input} mode="outlined" />
        <TextInput label="Raça" value={raca} onChangeText={setRaca} style={styles.input} mode="outlined" />
        <DateInput label="Data de Nascimento" value={dataNascimento} onShowPicker={() => showDatePicker('nascimento')} />
        <Text style={styles.radioLabel}>Sexo:</Text>
        <RadioButton.Group onValueChange={setSexo} value={sexo}>
          <View style={styles.radioContainer}>
            <View style={styles.radioItem}><RadioButton value="Fêmea" /><Text>Fêmea</Text></View>
            <View style={styles.radioItem}><RadioButton value="Macho" /><Text>Macho</Text></View>
          </View>
        </RadioButton.Group>

        {tipo === 'Vaca' && sexo === 'Fêmea' && (
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
            
            <Title style={styles.title}>Filiação</Title>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={idMae} onValueChange={(itemValue) => setIdMae(itemValue)}>
                <Picker.Item label="Selecione a Mãe" value={null} />
                {potentialMothers.map(animal => (
                  <Picker.Item key={animal.id} label={`${animal.nome} (Brinco: ${animal.brinco})`} value={animal.id} />
                ))}
              </Picker>
            </View>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={idTouroPai} onValueChange={(itemValue) => setIdTouroPai(itemValue)}>
                <Picker.Item label="Selecione o Pai" value={null} />
                {potentialFathers.map(animal => (
                  <Picker.Item key={animal.id} label={`${animal.nome} (Brinco: ${animal.brinco})`} value={animal.id} />
                ))}
              </Picker>
            </View>

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
            locale="pt-BR"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16 },
  title: { fontSize: 18, marginTop: 20, marginBottom: 10, fontWeight: '600' },
  input: { marginBottom: 16 },
  radioContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  radioItem: { flexDirection: 'row', alignItems: 'center' },
  radioLabel: { fontSize: 16, marginBottom: 8, marginLeft: 8 },
  button: { paddingVertical: 8, marginTop: 20, marginBottom: 40, borderRadius: 8 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 4,
    marginBottom: 16,
    justifyContent: 'center',
  },
});
