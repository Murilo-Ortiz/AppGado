import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Button, RadioButton, Text, TextInput } from 'react-native-paper';
import { auth, db } from '../../../firebaseConfig';

export default function EditAnimalScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 

  const [brinco, setBrinco] = useState('');
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('Vaca');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id || !auth.currentUser) {
      setIsLoading(false);
      return;
    };

    const animalDocRef = doc(db, 'users', auth.currentUser.uid, 'animals', id);
    getDoc(animalDocRef).then(docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBrinco(data.brinco);
        setNome(data.nome);
        setTipo(data.tipo);
      } else {
        Alert.alert("Erro", "Animal não encontrado.");
        router.back();
      }
    }).catch(error => {
      console.error("Erro ao buscar animal:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados para edição.");
    }).finally(() => {
      setIsLoading(false);
    });
  }, [id]);

  const handleUpdateAnimal = async () => {
    if (!brinco || !nome) {
      Alert.alert("Erro", "Por favor, preencha o Brinco e o Nome.");
      return;
    }
    setIsSaving(true);
    const animalDocRef = doc(db, 'users', auth.currentUser.uid, 'animals', id);
    try {
      await updateDoc(animalDocRef, {
        brinco: brinco,
        nome: nome,
        tipo: tipo,
      });
      setIsSaving(false);
      Alert.alert("Sucesso", "Dados do animal atualizados!");
      router.back(); 
    } catch (error) {
      console.error("Erro ao atualizar animal:", error);
      setIsSaving(false);
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
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
        <TextInput
          label="Nº do Brinco"
          value={brinco}
          onChangeText={setBrinco}
          style={styles.input}
          mode="outlined"
          keyboardType="numeric"
        />
        <TextInput
          label="Nome do Animal"
          value={nome}
          onChangeText={setNome}
          style={styles.input}
          mode="outlined"
        />
        
        <View style={styles.radioGroup}>
          <Text style={styles.radioLabel}>Tipo:</Text>
          <RadioButton.Group onValueChange={newValue => setTipo(newValue)} value={tipo}>
            <View style={styles.radioItem}>
              <RadioButton value="Vaca" />
              <Text>Vaca</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="Bezerro" />
              <Text>Bezerro</Text>
            </View>
          </RadioButton.Group>
        </View>

        <Button
          mode="contained"
          onPress={handleUpdateAnimal}
          style={styles.button}
          loading={isSaving}
          disabled={isSaving}
        >
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
  input: { marginBottom: 16 },
  radioGroup: { marginBottom: 16 },
  radioLabel: { fontSize: 16, marginBottom: 8, color: '#333' },
  radioItem: { flexDirection: 'row', alignItems: 'center' },
  button: { paddingVertical: 8, backgroundColor: '#667eea' },
});
