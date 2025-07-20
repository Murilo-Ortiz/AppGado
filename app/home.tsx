import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Appbar, Card, FAB, Paragraph, Title } from 'react-native-paper';
import { auth, db } from '../firebaseConfig';

export default function HomeScreen() {
  const router = useRouter();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const userAnimalsCollection = collection(db, 'users', auth.currentUser.uid, 'animals');
    const q = query(userAnimalsCollection);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const animalsData = [];
      querySnapshot.forEach((doc) => {
        animalsData.push({ ...doc.data(), id: doc.id });
      });
      setAnimals(animalsData);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar animais: ", error);
      Alert.alert("Erro", "Não foi possível carregar os dados do rebanho.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => router.replace('/'))
      .catch((error) => {
        console.error("Erro ao fazer logout: ", error);
        Alert.alert("Erro", "Não foi possível sair.");
      });
  };

  const handleAddAnimal = () => {
    router.push('/add-animal');
  };

  const renderAnimal = ({ item }) => (
    <Pressable onPress={() => router.push(`/animal/${item.id}`)}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Brinco: {item.brinco}</Title>
          <Paragraph>Nome: {item.nome} ({item.tipo})</Paragraph>
        </Card.Content>
      </Card>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Meu Rebanho" />
        <Appbar.Action icon="logout" onPress={handleLogout} />
      </Appbar.Header>

      {animals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum animal cadastrado.</Text>
          <Text style={styles.emptySubText}>Clique no + para começar.</Text>
        </View>
      ) : (
        <FlatList
          data={animals}
          renderItem={renderAnimal}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleAddAnimal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  list: { padding: 16 },
  card: { marginBottom: 16 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#667eea' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7fafc' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#718096' },
  emptySubText: { fontSize: 14, color: '#a0aec0', marginTop: 8 }
});
