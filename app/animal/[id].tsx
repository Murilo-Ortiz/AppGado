import { useLocalSearchParams, useRouter } from 'expo-router';
import { deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Button, Card, Divider, List, Paragraph, Title, useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { auth, db } from '../../firebaseConfig';

const DetailRow = ({ label, value }) => {
  const theme = useTheme();
  if (!value && value !== 0) return null;
  return (
    <Paragraph style={styles.paragraph}>
      <Paragraph style={[styles.label, { color: theme.colors.text }]}>{label}:</Paragraph> 
      {' '}{value}
    </Paragraph>
  );
};

export default function AnimalDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const showToast = (type, text1, text2 = '') => {
    Toast.show({ type, text1, text2, position: 'bottom' });
  };

  useEffect(() => {
    if (!id || !auth.currentUser) return;
    const animalDocRef = doc(db, 'users', auth.currentUser.uid, 'animals', id);
    const unsubscribe = onSnapshot(animalDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setAnimal({ ...docSnap.data(), id: docSnap.id });
      }
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar detalhes:", error);
      showToast('error', 'Erro', 'Não foi possível carregar os dados.');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  const handleDelete = () => {
    Alert.alert("Confirmar Exclusão", `Excluir "${animal.nome}"?`, [
      { text: "Cancelar", style: 'cancel' },
      { 
        text: "Excluir", 
        style: "destructive", 
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'animals', id));
            showToast('success', 'Sucesso', 'Animal excluído do rebanho.');
            router.back();
          } catch (error) {
            console.error("Erro ao excluir:", error);
            showToast('error', 'Erro', 'Não foi possível excluir o animal.');
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!animal) return <Paragraph>Animal não encontrado.</Paragraph>;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={animal.nome || "Detalhes"} titleStyle={{ fontWeight: 'bold' }} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={[styles.cardTitle, { color: theme.colors.primary }]}>Brinco: {animal.brinco}</Title>
            <Divider style={styles.divider} />
            <DetailRow label="Raça" value={animal.raca} />
            <DetailRow label="Sexo" value={animal.sexo} />
            <DetailRow label="Nascimento" value={animal.dataNascimento} />
            
            {animal.tipo === 'Vaca' && (
              <>
                <Title style={styles.sectionTitle}>Dados Reprodutivos e de Produção</Title>
                <DetailRow label="Nº de Partos" value={animal.numPartos} />
                <DetailRow label="Rendimento" value={animal.rendimentoProducao} />
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
                {animal.sexo === 'Fêmea' && (
                  <>
                    <DetailRow label="1º Cio" value={animal.dataPrimeiroCio} />
                    <DetailRow label="1ª Inseminação" value={animal.dataInseminacaoBezerra} />
                  </>
                )}
              </>
            )}
          </Card.Content>
        </Card>

        {/* Seção de Histórico de Doenças */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Histórico de Doenças</Title>
            {animal.historicoDoencas && animal.historicoDoencas.length > 0 ? (
              animal.historicoDoencas.map((doenca) => (
                <List.Item
                  key={doenca.id}
                  title={doenca.nome}
                  description={`Data: ${doenca.data}\nTratamento: ${doenca.tratamento || 'N/A'}`}
                  descriptionNumberOfLines={4}
                  left={props => <List.Icon {...props} icon="medical-bag" />}
                />
              ))
            ) : (
              <Paragraph>Nenhuma doença registrada.</Paragraph>
            )}
            <Button icon="plus" mode="contained-tonal" onPress={() => router.push(`/animal/add-disease/${id}`)} style={styles.addButton}>
              Adicionar Doença
            </Button>
          </Card.Content>
        </Card>

        {/* Seção de Pesos Mensais (Apenas para Bezerros) */}
        {animal.tipo === 'Bezerro' && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Histórico de Pesagem</Title>
              {animal.pesosMensais && animal.pesosMensais.length > 0 ? (
                animal.pesosMensais.map((peso) => (
                  <List.Item
                    key={peso.id}
                    title={`${peso.peso} kg`}
                    description={`Data: ${peso.data}`}
                    left={props => <List.Icon {...props} icon="scale-balance" />}
                  />
                ))
              ) : (
                <Paragraph>Nenhum peso registrado.</Paragraph>
              )}
              <Button icon="plus" mode="contained-tonal" onPress={() => router.push(`/animal/add-weight/${id}`)} style={styles.addButton}>
                Adicionar Pesagem
              </Button>
            </Card.Content>
          </Card>
        )}

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
        <Button icon="delete" mode="outlined" onPress={handleDelete} style={styles.deleteButton} textColor={theme.colors.error}>
          Excluir Animal
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  card: { 
    backgroundColor: 'white', 
    borderRadius: 8, 
    elevation: 2, 
    marginBottom: 16 
  },
  cardTitle: { 
    fontSize: 24, 
    fontWeight: 'bold',
    marginBottom: 12 
  },
  sectionTitle: { 
    fontSize: 18, 
    marginTop: 16, 
    marginBottom: 10, 
    fontWeight: '600'
  },
  paragraph: { 
    fontSize: 16, 
    marginBottom: 8, 
    lineHeight: 24 
  },
  label: { 
    fontWeight: 'bold', 
  },
  divider: { 
    marginVertical: 12 
  },
  button: { 
    marginTop: 16, 
    borderRadius: 8, 
    paddingVertical: 6 
  },
  deleteButton: { 
    marginTop: 12, 
    borderRadius: 8, 
    borderWidth: 1.5 
  },
});

