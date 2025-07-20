import { useRouter } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, RadioButton, Text, TextInput } from 'react-native-paper';
import { auth, db } from '../firebaseConfig';

export default function AddAnimalScreen() {
  const router = useRouter();
  const [brinco, setBrinco] = useState('');
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('Vaca'); 
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveAnimal = async () => {
    if (!brinco || !nome) {
      Alert.alert("Erro", "Por favor, preencha o Brinco e o Nome.");
      return;
    }
    if (!auth.currentUser) {
      Alert.alert("Erro de Autenticação", "Você não está logado.");
      return;
    }

    setIsLoading(true);

    try {
      const userAnimalsCollection = collection(db, 'users', auth.currentUser.uid, 'animals');
      
      await addDoc(userAnimalsCollection, {
        brinco: brinco,
        nome: nome,
        tipo: tipo,
        createdAt: new Date(), 
      });

      setIsLoading(false);
      Alert.alert("Sucesso", "Animal salvo no seu rebanho!");
      router.back(); 
    } catch (error) {
      console.error("Erro ao salvar o animal: ", error);
      setIsLoading(false);
      Alert.alert("Erro", "Não foi possível salvar o animal no banco de dados.");
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Adicionar Animal" />
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
          onPress={handleSaveAnimal}
          style={styles.button}
          loading={isLoading}
          disabled={isLoading}
        >
          Salvar Animal
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  scroll: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333'
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 8,
    backgroundColor: '#667eea',
  },
});
