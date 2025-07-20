import { useLocalSearchParams, useRouter } from 'expo-router';
import { deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Button, Paragraph, Title } from 'react-native-paper';
import { auth, db } from '../../firebaseConfig';

export default function AnimalDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !auth.currentUser) return;

    const animalDocRef = doc(db, 'users', auth.currentUser.uid, 'animals', id);
    
    const unsubscribe = onSnapshot(animalDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setAnimal({ ...docSnap.data(), id: docSnap.id });
      } else {
        Alert.alert("Erro", "Animal não encontrado.");
        router.back();
      }
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar detalhes do animal:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados.");
      setLoading(false);
    });

    return () => unsubscribe(); 
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir "${animal.nome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: async () => {
          const animalDocRef = doc(db, 'users', auth.currentUser.uid, 'animals', id);
          await deleteDoc(animalDocRef);
          Alert.alert("Sucesso", "Animal excluído.");
          router.back();
        }}
      ]
    );
  };

  if (loading) {
    return <ActivityIndicator animating={true} size="large" style={styles.loading} />;
  }

  if (!animal) return null;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Detalhes do Animal" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>
        <Title style={styles.title}>Brinco: {animal.brinco}</Title>
        <Paragraph style={styles.paragraph}>Nome: {animal.nome}</Paragraph>
        <Paragraph style={styles.paragraph}>Tipo: {animal.tipo}</Paragraph>
        
        <Button 
          icon="pencil" 
          mode="contained" 
          onPress={() => router.push(`/animal/edit/${id}`)} 
          style={styles.button}
        >
          Editar
        </Button>
        <Button 
          icon="delete" 
          mode="outlined" 
          onPress={handleDelete} 
          style={styles.deleteButton}
          textColor="#d9534f"
        >
          Excluir
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  title: { fontSize: 24, marginBottom: 10 },
  paragraph: { fontSize: 18, marginBottom: 8 },
  button: { marginTop: 20, backgroundColor: '#667eea' },
  deleteButton: { marginTop: 10, borderColor: '#d9534f' }
});
