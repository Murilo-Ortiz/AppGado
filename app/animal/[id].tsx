import { useLocalSearchParams, useRouter } from 'expo-router';
import { deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Button, Card, Divider, List, Paragraph, Title } from 'react-native-paper';
import { auth, db } from '../../firebaseConfig';

const DetailRow = ({ label, value }) => (
  value ? <Paragraph style={styles.paragraph}><Paragraph style={styles.label}>{label}:</Paragraph> {value}</Paragraph> : null
);

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
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  const handleDelete = () => {
    Alert.alert("Confirmar Exclusão", `Excluir "${animal.nome}"?`, [
      { text: "Cancelar" },
      { text: "Excluir", style: "destructive", onPress: async () => {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'animals', id));
        router.back();
      }}
    ]);
  };

  if (loading) {
    return <ActivityIndicator animating={true} size="large" style={styles.loading} />;
  }

  if (!animal) return <Paragraph>Animal não encontrado.</Paragraph>;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={animal.nome || "Detalhes"} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Brinco: {animal.brinco}</Title>
            <Divider style={styles.divider} />
            <DetailRow label="Raça" value={animal.raca} />
            <DetailRow label="Sexo" value={animal.sexo} />
            <DetailRow label="Nascimento" value={animal.dataNascimento} />
            
            {animal.tipo === 'Vaca' && (
              <>
                <Title style={styles.sectionTitle}>Dados Reprodutivos</Title>
                <DetailRow label="Touro" value={animal.touro} />
                <DetailRow label="Inseminação" value={animal.dataInseminacao} />
                <DetailRow label="Parição Esperada" value={animal.dataParicaoEsperada} />
                <DetailRow label="Secagem" value={animal.dataSecagem} />
              </>
            )}

            {animal.tipo === 'Bezerro' && (
              <>
                <Title style={styles.sectionTitle}>Dados de Desenvolvimento</Title>
                <DetailRow label="Peso ao Nascer" value={animal.pesoNascimento ? `${animal.pesoNascimento} kg` : ''} />
                <DetailRow label="Desmame" value={animal.dataDesmame} />
              </>
            )}
          </Card.Content>
        </Card>

        {/* Seção de Vacinas */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Histórico de Vacinas</Title>
            {animal.vacinas && animal.vacinas.length > 0 ? (
              animal.vacinas.map((vacina) => (
                <List.Item
                  key={vacina.id}
                  title={vacina.nome}
                  description={`Data: ${vacina.data} | Lote: ${vacina.lote || 'N/A'}`}
                  left={props => <List.Icon {...props} icon="needle" />}
                />
              ))
            ) : (
              <Paragraph>Nenhuma vacina registrada.</Paragraph>
            )}
            <Button icon="plus" mode="contained-tonal" onPress={() => router.push(`/animal/add-vaccine/${id}`)} style={styles.addButton}>
              Adicionar Vacina
            </Button>
          </Card.Content>
        </Card>
        
        {/* Seção de Vermifugação */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Histórico de Vermifugação</Title>
            {animal.vermifugacao && animal.vermifugacao.length > 0 ? (
              animal.vermifugacao.map((verm) => (
                <List.Item
                  key={verm.id}
                  title={verm.produto}
                  description={`Data: ${verm.data}`}
                  left={props => <List.Icon {...props} icon="pill" />}
                />
              ))
            ) : (
              <Paragraph>Nenhum registro de vermífugo.</Paragraph>
            )}
            <Button icon="plus" mode="contained-tonal" onPress={() => router.push(`/animal/add-deworming/${id}`)} style={styles.addButton}>
              Adicionar Vermífugo
            </Button>
          </Card.Content>
        </Card>
        
        <Button icon="pencil" mode="contained" onPress={() => router.push(`/animal/edit/${id}`)} style={styles.button}>
          Editar Dados Principais
        </Button>
        <Button icon="delete" mode="outlined" onPress={handleDelete} style={styles.deleteButton} textColor="#d9534f">
          Excluir Animal
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  card: { backgroundColor: 'white', borderRadius: 8, elevation: 2, marginBottom: 16 },
  cardTitle: { fontSize: 22, color: '#1a202c', marginBottom: 12 },
  sectionTitle: { fontSize: 18, marginBottom: 10, color: '#4a5568' },
  paragraph: { fontSize: 16, marginBottom: 8, lineHeight: 24 },
  label: { fontWeight: 'bold', color: '#2d3748' },
  divider: { marginVertical: 12 },
  addButton: { marginTop: 16 },
  button: { marginTop: 16, backgroundColor: '#667eea', borderRadius: 8, paddingVertical: 6 },
  deleteButton: { marginTop: 12, borderColor: '#d9534f', borderRadius: 8, borderWidth: 1.5 },
});
