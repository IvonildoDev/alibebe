import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Alert,
    ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const HistoryScreen = () => {
    const [records, setRecords] = useState([]);
    const [feedingRecords, setFeedingRecords] = useState([]);
    const [activeTab, setActiveTab] = useState('baby'); // 'baby' or 'feeding'

    useEffect(() => {
        loadRecords();
        loadFeedingRecords();
    }, []);

    const loadRecords = async () => {
        try {
            const recordsJSON = await AsyncStorage.getItem('userRecords');
            if (recordsJSON) {
                const parsedRecords = JSON.parse(recordsJSON);
                // Sort records by date (newest first)
                const sortedRecords = parsedRecords.sort((a, b) =>
                    new Date(b.date) - new Date(a.date)
                );
                setRecords(sortedRecords);
            }
        } catch (error) {
            Alert.alert('Erro', 'Falha ao carregar o histórico: ' + error.message);
        }
    };

    const loadFeedingRecords = async () => {
        try {
            const feedingsJSON = await AsyncStorage.getItem('feedingRecords');
            if (feedingsJSON) {
                const feedings = JSON.parse(feedingsJSON);
                // Sort by date (newest first)
                const sortedFeedings = feedings.sort((a, b) =>
                    new Date(b.timestamp) - new Date(a.timestamp)
                );
                setFeedingRecords(sortedFeedings);
            }
        } catch (error) {
            console.error('Error loading feeding history:', error);
            Alert.alert('Erro', 'Falha ao carregar o histórico de alimentação.');
        }
    };

    const deleteRecord = async (id) => {
        try {
            // Filter out the record to delete
            const updatedRecords = records.filter(record => record.id !== id);

            // Save updated records
            await AsyncStorage.setItem('userRecords', JSON.stringify(updatedRecords));

            // Update state
            setRecords(updatedRecords);

            Alert.alert('Sucesso', 'Registro excluído com sucesso!');
        } catch (error) {
            Alert.alert('Erro', 'Falha ao excluir o registro: ' + error.message);
        }
    };

    const deleteFeedingRecord = async (id) => {
        try {
            // Filter out the record to delete
            const updatedRecords = feedingRecords.filter(record => record.id !== id);

            // Save updated records
            await AsyncStorage.setItem('feedingRecords', JSON.stringify(updatedRecords));

            // Update state
            setFeedingRecords(updatedRecords);

            Alert.alert('Sucesso', 'Registro de alimentação excluído com sucesso!');
        } catch (error) {
            Alert.alert('Erro', 'Falha ao excluir o registro: ' + error.message);
        }
    };

    const confirmDelete = (id, type) => {
        Alert.alert(
            'Confirmar exclusão',
            'Tem certeza que deseja excluir este registro?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    onPress: () => type === 'baby' ? deleteRecord(id) : deleteFeedingRecord(id),
                    style: 'destructive'
                }
            ]
        );
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    const getFeedingTypeLabel = (type) => {
        switch (type) {
            case 'leite_materno':
                return 'Leite Materno';
            case 'formula':
                return 'Fórmula';
            case 'alimento':
                return 'Alimento Sólido';
            default:
                return 'Outro';
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.info}>Idade: {item.age} {item.age === 1 ? 'mês' : 'meses'}</Text>
                <Text style={styles.info}>Peso: {item.weight} kg</Text>
                {item.height && (
                    <Text style={styles.info}>Altura: {item.height} cm</Text>
                )}
                <Text style={styles.date}>Data: {formatDate(item.date)}</Text>
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => confirmDelete(item.id, 'baby')}
            >
                <Text style={styles.deleteButtonText}>Excluir</Text>
            </TouchableOpacity>
        </View>
    );

    const renderFeedingItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <Text style={styles.name}>{getFeedingTypeLabel(item.type)}</Text>
                {item.amount && (
                    <Text style={styles.info}>Quantidade: {item.amount} ml</Text>
                )}
                {item.notes && (
                    <Text style={styles.info}>Obs: {item.notes}</Text>
                )}
                <Text style={styles.date}>Data: {formatDate(item.timestamp)}</Text>
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => confirmDelete(item.id, 'feeding')}
            >
                <Text style={styles.deleteButtonText}>Excluir</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Histórico de Registros do Bebê</Text>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === 'baby' && styles.activeTabButton
                    ]}
                    onPress={() => setActiveTab('baby')}
                >
                    <Ionicons
                        name="person"
                        size={18}
                        color={activeTab === 'baby' ? '#4CAF50' : '#999'}
                    />
                    <Text
                        style={[
                            styles.tabButtonText,
                            activeTab === 'baby' && styles.activeTabText
                        ]}
                    >
                        Dados do Bebê
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === 'feeding' && styles.activeTabButton
                    ]}
                    onPress={() => setActiveTab('feeding')}
                >
                    <Ionicons
                        name="nutrition"
                        size={18}
                        color={activeTab === 'feeding' ? '#4CAF50' : '#999'}
                    />
                    <Text
                        style={[
                            styles.tabButtonText,
                            activeTab === 'feeding' && styles.activeTabText
                        ]}
                    >
                        Alimentação
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'baby' ? (
                records.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Nenhum registro encontrado</Text>
                    </View>
                ) : (
                    <FlatList
                        data={records}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.list}
                    />
                )
            ) : (
                feedingRecords.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Nenhum registro de alimentação encontrado</Text>
                    </View>
                ) : (
                    <FlatList
                        data={feedingRecords}
                        renderItem={renderFeedingItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.list}
                    />
                )
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
        overflow: 'hidden',
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: '#f0f0f0',
    },
    activeTabButton: {
        backgroundColor: '#e8f5e9',
    },
    tabButtonText: {
        color: '#999',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    activeTabText: {
        color: '#4CAF50',
    },
    list: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flexDirection: 'row',
    },
    cardContent: {
        flex: 1,
        padding: 16,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    info: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    date: {
        fontSize: 14,
        color: '#999',
        marginTop: 4,
    },
    deleteButton: {
        backgroundColor: '#ff6b6b',
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
    }
});

export default HistoryScreen;
