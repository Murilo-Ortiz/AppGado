import { useRouter } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Appbar, Button, RadioButton, TextInput, Title } from 'react-native-paper';
import { auth, db } from '../firebaseConfig';

export default function AddAnimalScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [brinco, setBrinco] = useState('');
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('Vaca');
  const [raca, setRaca] = useState('');
  const [sexo, setSexo] = useState('Fêmea');
  const [dataNascimento, setDataNascimento] = useState('');

  const [dataInseminacao, setDataInseminacao] = useState('');
  const [dataParicaoEsperada, setDataParicaoEsperada] = useState('');
  const [dataSecagem, setDataSecagem] = useState('');
  const [touro, setTouro] = useState('');

  const [pesoNascimento, setPesoNascimento] = useState('');
  const [dataDesmame, setDataDesmame] = useState('');

  const handleSaveAnimal = async () => {
    if (!brinco || !nome) {
      Alert.alert("Erro", "Por favor, preencha pelo menos o Brinco e o Nome.");
      return;
    }
    if (!auth.currentUser) {
      Alert.alert("Erro de Autenticação", "Você não está logado.");
      return;
    }

    setIsLoading(true);

    let animalData = {
      brinco,
      nome,
      tipo,
      raca,
      sexo,
      dataNascimento,
      historicoDoencas: [],
      vacinas: [],
      vermifugacao: [],
      createdAt: new Date(),
    };

    if (tipo === 'Vaca') {
      animalData = {
        ...animalData,
        dataInseminacao,
        dataParicaoEsperada,
        dataSecagem,
        touro,
        numPartos: 0,
      };
    } else { 
      animalData = {
        ...animalData,
        pesoNascimento,
        dataDesmame,
        pesosMensais: [],
      };
    }

    try {
      const userAnimalsCollection = collection(db, 'users', auth.currentUser.uid, 'animals');
      await addDoc(userAnimalsCollection, animalData);
      
      setIsLoading(false);
      Alert.alert("Sucesso", "Animal salvo no seu rebanho!");
      router.back();
    } catch (error) {
      console.error("Erro ao salvar o animal: ", error);
      setIsLoading(false);
      Alert.alert("Erro", "Não foi possível salvar o animal.");
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
        <RadioButton.Group onValueChange={newValue => setTipo(newValue)} value={tipo}>
          <View style={styles.radioItem}><RadioButton value="Vaca" /><Text>Vaca</Text></View>
          <View style={styles.radioItem}><RadioButton value="Bezerro" /><Text>Bezerro/Bezerra</Text></View>
        </RadioButton.Group>

        <Title style={styles.title}>Dados de Identificação</Title>
        <TextInput label="Nº do Brinco" value={brinco} onChangeText={setBrinco} style={styles.input} mode="outlined" keyboardType="numeric" />
        <TextInput label="Nome do Animal" value={nome} onChangeText={setNome} style={styles.input} mode="outlined" />
        <TextInput label="Raça" value={raca} onChangeText={setRaca} style={styles.input} mode="outlined" />
        <TextInput label="Data de Nascimento (DD/MM/AAAA)" value={dataNascimento} onChangeText={setDataNascimento} style={styles.input} mode="outlined" />
        <Text style={styles.radioLabel}>Sexo:</Text>
        <RadioButton.Group onValueChange={newValue => setSexo(newValue)} value={sexo}>
            <View style={styles.radioItem}><RadioButton value="Fêmea" /><Text>Fêmea</Text></View>
            <View style={styles.radioItem}><RadioButton value="Macho" /><Text>Macho</Text></View>
        </RadioButton.Group>

        {tipo === 'Vaca' && (
          <>
            <Title style={styles.title}>Dados de Vaca</Title>
            <TextInput label="Data de Inseminação (DD/MM/AAAA)" value={dataInseminacao} onChangeText={setDataInseminacao} style={styles.input} mode="outlined" />
            <TextInput label="Data de Parição Esperada (DD/MM/AAAA)" value={dataParicaoEsperada} onChangeText={setDataParicaoEsperada} style={styles.input} mode="outlined" />
            <TextInput label="Data de Secagem (DD/MM/AAAA)" value={dataSecagem} onChangeText={setDataSecagem} style={styles.input} mode="outlined" />
            <TextInput label="Touro (Pai)" value={touro} onChangeText={setTouro} style={styles.input} mode="outlined" />
          </>
        )}

        {tipo === 'Bezerro' && (
          <>
            <Title style={styles.title}>Dados de Bezerro/Bezerra</Title>
            <TextInput label="Peso ao Nascer (kg)" value={pesoNascimento} onChangeText={setPesoNascimento} style={styles.input} mode="outlined" keyboardType="numeric" />
            <TextInput label="Data de Desmame (DD/MM/AAAA)" value={dataDesmame} onChangeText={setDataDesmame} style={styles.input} mode="outlined" />
          </>
        )}

        <Button mode="contained" onPress={handleSaveAnimal} style={styles.button} loading={isLoading} disabled={isLoading}>
          Salvar Animal
        </Button>
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
  button: { paddingVertical: 8, backgroundColor: '#667eea', marginTop: 20 },
});
