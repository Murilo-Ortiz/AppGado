import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Appbar, Button, RadioButton, TextInput, Title } from 'react-native-paper';
import { auth, db } from '../../../firebaseConfig';

export default function EditAnimalScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Estados dos campos
  const [brinco, setBrinco] = useState('');
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [raca, setRaca] = useState('');
  const [sexo, setSexo] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [dataInseminacao, setDataInseminacao] = useState('');
  const [dataParicaoEsperada, setDataParicaoEsperada] = useState('');
  const [dataSecagem, setDataSecagem] = useState('');
  const [touro, setTouro] = useState('');
  const [pesoNascimento, setPesoNascimento] = useState('');
  const [dataDesmame, setDataDesmame] = useState('');

  useEffect(() => {
    if (!id || !auth.currentUser) return;
    const animalDocRef = doc(db, 'users', auth.currentUser.uid, 'animals', id);
    getDoc(animalDocRef).then(docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBrinco(data.brinco || '');
        setNome(data.nome || '');
        setTipo(data.tipo || 'Vaca');
        setRaca(data.raca || '');
        setSexo(data.sexo || 'Fêmea');
        setDataNascimento(data.dataNascimento || '');
        setDataInseminacao(data.dataInseminacao || '');
        setDataParicaoEsperada(data.dataParicaoEsperada || '');
        setDataSecagem(data.dataSecagem || '');
        setTouro(data.touro || '');
        setPesoNascimento(data.pesoNascimento || '');
        setDataDesmame(data.dataDesmame || '');
      }
    }).finally(() => setIsLoading(false));
  }, [id]);

  const handleUpdateAnimal = async () => {
    if (!brinco || !nome) {
      Alert.alert("Erro", "Brinco e Nome são obrigatórios.");
      return;
    }
    setIsSaving(true);
    const animalDocRef = doc(db, 'users', auth.currentUser.uid, 'animals', id);
    
    let animalData = {
      brinco, nome, tipo, raca, sexo, dataNascimento,
    };

    if (tipo === 'Vaca') {
      animalData = { ...animalData, dataInseminacao, dataParicaoEsperada, dataSecagem, touro };
    } else {
      animalData = { ...animalData, pesoNascimento, dataDesmame };
    }

    try {
      await updateDoc(animalDocRef, animalData);
      Alert.alert("Sucesso", "Dados atualizados!");
      router.back();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <ActivityIndicator animating={true} size="large" style={styles.loading} />;
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Editar Animal" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Title style={styles.title}>Tipo de Animal</Title>
        <RadioButton.Group onValueChange={setTipo} value={tipo}>
          <View style={styles.radioItem}><RadioButton value="Vaca" /><Text>Vaca</Text></View>
          <View style={styles.radioItem}><RadioButton value="Bezerro" /><Text>Bezerro/Bezerra</Text></View>
        </RadioButton.Group>

        <Title style={styles.title}>Dados de Identificação</Title>
        <TextInput label="Nº do Brinco" value={brinco} onChangeText={setBrinco} style={styles.input} mode="outlined" keyboardType="numeric" />
        <TextInput label="Nome do Animal" value={nome} onChangeText={setNome} style={styles.input} mode="outlined" />
        <TextInput label="Raça" value={raca} onChangeText={setRaca} style={styles.input} mode="outlined" />
        <TextInput label="Data de Nascimento (DD/MM/AAAA)" value={dataNascimento} onChangeText={setDataNascimento} style={styles.input} mode="outlined" />
        <Text style={styles.radioLabel}>Sexo:</Text>
        <RadioButton.Group onValueChange={setSexo} value={sexo}>
            <View style={styles.radioItem}><RadioButton value="Fêmea" /><Text>Fêmea</Text></View>
            <View style={styles.radioItem}><RadioButton value="Macho" /><Text>Macho</Text></View>
        </RadioButton.Group>

        {/* Campos específicos para VACA */}
        {tipo === 'Vaca' && (
          <>
            <Title style={styles.title}>Dados de Vaca</Title>
            <TextInput label="Data de Inseminação (DD/MM/AAAA)" value={dataInseminacao} onChangeText={setDataInseminacao} style={styles.input} mode="outlined" />
            <TextInput label="Data de Parição Esperada (DD/MM/AAAA)" value={dataParicaoEsperada} onChangeText={setDataParicaoEsperada} style={styles.input} mode="outlined" />
            <TextInput label="Data de Secagem (DD/MM/AAAA)" value={dataSecagem} onChangeText={setDataSecagem} style={styles.input} mode="outlined" />
            <TextInput label="Touro (Pai)" value={touro} onChangeText={setTouro} style={styles.input} mode="outlined" />
          </>
        )}

        {/* Campos específicos para BEZERRO */}
        {tipo === 'Bezerro' && (
          <>
            <Title style={styles.title}>Dados de Bezerro/Bezerra</Title>
            <TextInput label="Peso ao Nascer (kg)" value={pesoNascimento} onChangeText={setPesoNascimento} style={styles.input} mode="outlined" keyboardType="numeric" />
            <TextInput label="Data de Desmame (DD/MM/AAAA)" value={dataDesmame} onChangeText={setDataDesmame} style={styles.input} mode="outlined" />
          </>
        )}
        
        <Button mode="contained" onPress={handleUpdateAnimal} style={styles.button} loading={isSaving} disabled={isSaving}>
          Salvar Alterações
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16 },
  title: { fontSize: 18, marginTop: 20, marginBottom: 10, color: '#4a5568' },
  input: { marginBottom: 16 },
  radioItem: { flexDirection: 'row', alignItems: 'center' },
  radioLabel: { fontSize: 16, marginBottom: 8, color: '#333' },
  button: { paddingVertical: 8, backgroundColor: '#667eea', marginTop: 20 },
});
