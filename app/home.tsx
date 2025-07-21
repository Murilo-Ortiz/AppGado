import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Appbar, Card, FAB, Paragraph, Searchbar, Title } from 'react-native-paper';
import { auth, db } from '../firebaseConfig';

export default function HomeScreen() {
  const router = useRouter();
  const [allAnimals, setAllAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Busca os dados do Firestore em tempo real
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
      setAllAnimals(animalsData);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar animais: ", error);
      Alert.alert("Erro", "Não foi possível carregar os dados do rebanho.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtra os animais com base na busca.
  // useMemo garante que o filtro só rode quando a lista ou a busca mudarem.
  const filteredAnimals = useMemo(() => {
    if (!searchQuery) {
      return allAnimals;
    }
    return allAnimals.filter(animal => {
      const queryLower = searchQuery.toLowerCase();
      const nomeLower = animal.nome?.toLowerCase() || '';
      const brincoLower = animal.brinco?.toLowerCase() || '';
      return nomeLower.includes(queryLower) || brincoLower.includes(queryLower);
    });
  }, [allAnimals, searchQuery]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => router.replace('/'))
      .catch((error) => {
        console.error("Erro ao fazer logout: ", error);
        Alert.alert("Erro", "Não foi possível sair.");
      });
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

      {/* Barra de Busca */}
      <Searchbar
        placeholder="Buscar por nome ou brinco"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {filteredAnimals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum animal encontrado.</Text>
          {searchQuery ? 
            <Text style={styles.emptySubText}>Tente uma busca diferente.</Text> :
            <Text style={styles.emptySubText}>Clique no + para começar.</Text>
          }
        </View>
      ) : (
        <FlatList
          data={filteredAnimals}
          renderItem={renderAnimal}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => router.push('/add-animal')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  searchbar: {
    margin: 16,
    marginBottom: 0,
  },
  list: { padding: 16 },
  card: { marginBottom: 16 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#667eea' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7fafc' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  emptyText: { fontSize: 18, color: '#718096', textAlign: 'center' },
  emptySubText: { fontSize: 14, color: '#a0aec0', marginTop: 8, textAlign: 'center' }
});
