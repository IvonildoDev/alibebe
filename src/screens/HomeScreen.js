import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        loadLatestRecord();

        // Add listener for when screen comes into focus
        const unsubscribe = navigation.addListener('focus', () => {
            loadLatestRecord();
        });

        // Cleanup listener
        return unsubscribe;
    }, [navigation]);

    const loadLatestRecord = async () => {
        try {
            const recordsJSON = await AsyncStorage.getItem('userRecords');
            if (recordsJSON) {
                const records = JSON.parse(recordsJSON);
                if (records.length > 0) {
                    // Sort by date and get the latest record
                    const sortedRecords = records.sort((a, b) =>
                        new Date(b.date) - new Date(a.date)
                    );
                    setUserData(sortedRecords[0]);
                } else {
                    setUserData(null);
                }
            } else {
                setUserData(null);
            }
        } catch (error) {
            console.error('Error loading latest record:', error);
            setUserData(null);
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Alibeby</Text>
                <Text style={styles.headerSubtitle}>Controle de Alimentação do Bebê</Text>
            </View>

            {userData ? (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Dados do Bebê</Text>
                    <View style={styles.infoRow}>
                        <Ionicons name="person" size={20} color="#4CAF50" />
                        <Text style={styles.infoLabel}>Nome:</Text>
                        <Text style={styles.infoValue}>{userData.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar" size={20} color="#4CAF50" />
                        <Text style={styles.infoLabel}>Idade:</Text>
                        <Text style={styles.infoValue}>{userData.age} {userData.age === 1 ? 'mês' : 'meses'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="fitness" size={20} color="#4CAF50" />
                        <Text style={styles.infoLabel}>Peso:</Text>
                        <Text style={styles.infoValue}>{userData.weight} kg</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="resize" size={20} color="#4CAF50" />
                        <Text style={styles.infoLabel}>Altura:</Text>
                        <Text style={styles.infoValue}>{userData.height} cm</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="time" size={20} color="#4CAF50" />
                        <Text style={styles.infoLabel}>Atualizado em:</Text>
                        <Text style={styles.infoValue}>{formatDate(userData.date)}</Text>
                    </View>
                </View>
            ) : (
                <View style={styles.emptyCard}>
                    <Ionicons name="information-circle-outline" size={50} color="#999" />
                    <Text style={styles.emptyText}>Nenhum registro encontrado</Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('Cadastro')}
                    >
                        <Text style={styles.buttonText}>Fazer Cadastro</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('Cadastro')}
                >
                    <Ionicons name="create-outline" size={24} color="#fff" />
                    <Text style={styles.actionButtonText}>Atualizar Dados</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('Alimentação')}
                >
                    <Ionicons name="nutrition-outline" size={24} color="#fff" />
                    <Text style={styles.actionButtonText}>Alimentação</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('Estatísticas')}
                >
                    <Ionicons name="bar-chart-outline" size={24} color="#fff" />
                    <Text style={styles.actionButtonText}>Estatísticas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('Histórico')}
                >
                    <Ionicons name="list-outline" size={24} color="#fff" />
                    <Text style={styles.actionButtonText}>Histórico</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#4CAF50',
        padding: 20,
        paddingTop: 40,
        marginBottom: 20,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    headerSubtitle: {
        color: '#e8f5e9',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 5,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        margin: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 16,
        color: '#666',
        marginLeft: 10,
        width: 80,
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
        flex: 1,
    },
    emptyCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        margin: 16,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 10,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 20,
        paddingHorizontal: 16,
    },
    actionButton: {
        backgroundColor: '#4CAF50',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        minWidth: 150,
        justifyContent: 'center',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    fullWidthButton: {
        marginHorizontal: 16,
        marginBottom: 20,
        justifyContent: 'center',
    },
});

export default HomeScreen;
