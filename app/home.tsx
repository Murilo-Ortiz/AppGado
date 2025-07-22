import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Appbar, Card, FAB, Paragraph, Searchbar, Title, useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { auth, db } from '../firebaseConfig';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme(); // Acessa o nosso tema personalizado
  const [allAnimals, setAllAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível carregar os dados.' });
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredAnimals = useMemo(() => {
    if (!searchQuery) return allAnimals;
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
        Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível sair.' });
      });
  };

  const renderAnimal = ({ item }) => (
    <Pressable onPress={() => router.push(`/animal/${item.id}`)}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={{ color: theme.colors.primary }}>Brinco: {item.brinco}</Title>
          <Paragraph>Nome: {item.nome} ({item.tipo})</Paragraph>
        </Card.Content>
      </Card>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Content title="Meu Rebanho" titleStyle={{ fontWeight: 'bold' }} />
        <Appbar.Action icon="logout" onPress={handleLogout} />
      </Appbar.Header>

      <Searchbar
        placeholder="Buscar por nome ou brinco"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        elevation={2}
      />

      {filteredAnimals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.placeholder }]}>Nenhum animal encontrado.</Text>
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
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        color="#ffffff"
        onPress={() => router.push('/add-animal')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchbar: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  card: { 
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  fab: { 
    position: 'absolute', 
    margin: 16, 
    right: 0, 
    bottom: 0,
    borderRadius: 28,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 20 
  },
  emptyText: { 
    fontSize: 18, 
    textAlign: 'center' 
  },
  emptySubText: { 
    fontSize: 14, 
    color: '#a0aec0', 
    marginTop: 8, 
    textAlign: 'center' 
  }
});
