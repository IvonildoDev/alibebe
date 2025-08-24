import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    FlatList,
    Modal,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const FeedingScreen = ({ navigation }) => {
    const [feedingType, setFeedingType] = useState('leite_materno');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [feedingHistory, setFeedingHistory] = useState([]);
    const [babyName, setBabyName] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedFeeding, setSelectedFeeding] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadBabyInfo();
        loadFeedingHistory();

        // Add listener for when screen comes into focus
        const unsubscribe = navigation.addListener('focus', () => {
            loadBabyInfo();
            loadFeedingHistory();
        });

        // Cleanup listener
        return unsubscribe;
    }, [navigation]);

    const loadBabyInfo = async () => {
        try {
            const recordsJSON = await AsyncStorage.getItem('userRecords');
            if (recordsJSON) {
                const records = JSON.parse(recordsJSON);
                if (records.length > 0) {
                    // Sort by date and get the latest record
                    const sortedRecords = records.sort((a, b) =>
                        new Date(b.date) - new Date(a.date)
                    );
                    setBabyName(sortedRecords[0].name);
                }
            }
        } catch (error) {
            console.error('Error loading baby info:', error);
        }
    };

    const loadFeedingHistory = async () => {
        try {
            setRefreshing(true);
            const feedingsJSON = await AsyncStorage.getItem('feedingRecords');
            if (feedingsJSON) {
                const feedings = JSON.parse(feedingsJSON);
                // Sort by date (newest first)
                const sortedFeedings = feedings.sort((a, b) =>
                    new Date(b.timestamp) - new Date(a.timestamp)
                );
                setFeedingHistory(sortedFeedings);
            } else {
                setFeedingHistory([]);
            }
        } catch (error) {
            console.error('Error loading feeding history:', error);
            Alert.alert('Erro', 'Falha ao carregar o histórico de alimentação.');
        } finally {
            setRefreshing(false);
        }
    };

    const saveFeeding = async () => {
        if (feedingType === 'formula' && (!amount.trim() || isNaN(Number(amount)))) {
            Alert.alert('Erro', 'Por favor, informe uma quantidade válida em ml.');
            return;
        }

        try {
            // Get existing records
            const existingFeedingsJSON = await AsyncStorage.getItem('feedingRecords');
            let feedings = existingFeedingsJSON ? JSON.parse(existingFeedingsJSON) : [];

            // Add new feeding record
            const newFeeding = {
                id: Date.now().toString(),
                type: feedingType,
                amount: feedingType === 'leite_materno' ? null : Number(amount),
                notes: notes.trim(),
                timestamp: new Date().toISOString()
            };

            feedings.push(newFeeding);

            // Save updated records
            await AsyncStorage.setItem('feedingRecords', JSON.stringify(feedings));

            // Clear form and reload history
            resetForm();
            loadFeedingHistory();

            Alert.alert('Sucesso', 'Registro de alimentação salvo com sucesso!');
        } catch (error) {
            Alert.alert('Erro', 'Falha ao salvar o registro: ' + error.message);
        }
    };

    const resetForm = () => {
        setFeedingType('leite_materno');
        setAmount('');
        setNotes('');
    };

    const deleteFeeding = async (id) => {
        try {
            // Get existing records
            const existingFeedingsJSON = await AsyncStorage.getItem('feedingRecords');
            if (!existingFeedingsJSON) return;

            let feedings = JSON.parse(existingFeedingsJSON);

            // Filter out the record to delete
            const updatedFeedings = feedings.filter(item => item.id !== id);

            // Save updated records
            await AsyncStorage.setItem('feedingRecords', JSON.stringify(updatedFeedings));

            // Close modal and reload history
            setModalVisible(false);
            setSelectedFeeding(null);
            loadFeedingHistory();

            Alert.alert('Sucesso', 'Registro excluído com sucesso!');
        } catch (error) {
            Alert.alert('Erro', 'Falha ao excluir o registro: ' + error.message);
        }
    };

    const confirmDelete = (id) => {
        Alert.alert(
            'Confirmar exclusão',
            'Tem certeza que deseja excluir este registro?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Excluir', onPress: () => deleteFeeding(id), style: 'destructive' }
            ]
        );
    };

    const openFeedingDetails = (feeding) => {
        setSelectedFeeding(feeding);
        setModalVisible(true);
    };

    const formatDateTime = (isoString) => {
        const date = new Date(isoString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} às ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
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

    const renderFeedingItem = ({ item }) => {
        const feedingTime = formatTime(item.timestamp);
        return (
            <TouchableOpacity
                style={styles.feedingItem}
                onPress={() => openFeedingDetails(item)}
            >
                <View style={styles.feedingTimeContainer}>
                    <Text style={styles.feedingTime}>{feedingTime}</Text>
                </View>
                <View style={styles.feedingContent}>
                    <Text style={styles.feedingType}>
                        {getFeedingTypeLabel(item.type)}
                        {item.amount ? ` (${item.amount} ml)` : ''}
                    </Text>
                    {item.notes ? (
                        <Text style={styles.feedingNotes} numberOfLines={1}>
                            {item.notes}
                        </Text>
                    ) : null}
                </View>
                <Ionicons name="chevron-forward" size={24} color="#aaa" />
            </TouchableOpacity>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Alimentação</Text>
                    <Text style={styles.headerSubtitle}>
                        {babyName ? `Registros para ${babyName}` : 'Registre as refeições do bebê'}
                    </Text>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>Nova Alimentação</Text>

                    <Text style={styles.label}>Tipo</Text>
                    <View style={styles.buttonGroup}>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                feedingType === 'leite_materno' && styles.typeButtonActive
                            ]}
                            onPress={() => setFeedingType('leite_materno')}
                        >
                            <Ionicons
                                name="water-outline"
                                size={20}
                                color={feedingType === 'leite_materno' ? '#fff' : '#4CAF50'}
                            />
                            <Text
                                style={[
                                    styles.typeButtonText,
                                    feedingType === 'leite_materno' && styles.typeButtonTextActive
                                ]}
                            >
                                Leite Materno
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                feedingType === 'formula' && styles.typeButtonActive
                            ]}
                            onPress={() => setFeedingType('formula')}
                        >
                            <Ionicons
                                name="cafe-outline"
                                size={20}
                                color={feedingType === 'formula' ? '#fff' : '#4CAF50'}
                            />
                            <Text
                                style={[
                                    styles.typeButtonText,
                                    feedingType === 'formula' && styles.typeButtonTextActive
                                ]}
                            >
                                Fórmula
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                feedingType === 'alimento' && styles.typeButtonActive
                            ]}
                            onPress={() => setFeedingType('alimento')}
                        >
                            <Ionicons
                                name="nutrition-outline"
                                size={20}
                                color={feedingType === 'alimento' ? '#fff' : '#4CAF50'}
                            />
                            <Text
                                style={[
                                    styles.typeButtonText,
                                    feedingType === 'alimento' && styles.typeButtonTextActive
                                ]}
                            >
                                Alimento
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {feedingType === 'formula' && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Quantidade (ml)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 120"
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                            />
                            <View style={styles.amountButtonsContainer}>
                                {[30, 60, 90, 120, 150, 180, 210].map((value) => (
                                    <TouchableOpacity
                                        key={value}
                                        style={[
                                            styles.amountButton,
                                            parseInt(amount) === value && styles.amountButtonActive
                                        ]}
                                        onPress={() => setAmount(value.toString())}
                                    >
                                        <Text
                                            style={[
                                                styles.amountButtonText,
                                                parseInt(amount) === value && styles.amountButtonTextActive
                                            ]}
                                        >
                                            {value}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Observações</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Informações adicionais..."
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={resetForm}
                        >
                            <Text style={styles.cancelButtonText}>Limpar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={saveFeeding}
                        >
                            <Text style={styles.saveButtonText}>Salvar</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.historyContainer}>
                    <Text style={styles.historyTitle}>Histórico de Hoje</Text>

                    {feedingHistory.length === 0 ? (
                        <View style={styles.emptyHistory}>
                            <Ionicons name="calendar-outline" size={40} color="#999" />
                            <Text style={styles.emptyHistoryText}>
                                Nenhum registro para hoje
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={feedingHistory.filter(feeding => {
                                const today = new Date();
                                const feedingDate = new Date(feeding.timestamp);
                                return (
                                    feedingDate.getDate() === today.getDate() &&
                                    feedingDate.getMonth() === today.getMonth() &&
                                    feedingDate.getFullYear() === today.getFullYear()
                                );
                            })}
                            renderItem={renderFeedingItem}
                            keyExtractor={item => item.id}
                            scrollEnabled={false}
                            ListEmptyComponent={
                                <View style={styles.emptyHistory}>
                                    <Ionicons name="calendar-outline" size={40} color="#999" />
                                    <Text style={styles.emptyHistoryText}>
                                        Nenhum registro para hoje
                                    </Text>
                                </View>
                            }
                        />
                    )}

                    <TouchableOpacity
                        style={styles.viewAllButton}
                        onPress={() => navigation.navigate('Histórico')}
                    >
                        <Text style={styles.viewAllButtonText}>
                            Ver Histórico Completo
                        </Text>
                        <Ionicons name="arrow-forward" size={16} color="#4CAF50" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Detalhes da Alimentação</Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                            >
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {selectedFeeding && (
                            <View style={styles.modalBody}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Tipo:</Text>
                                    <Text style={styles.detailValue}>
                                        {getFeedingTypeLabel(selectedFeeding.type)}
                                    </Text>
                                </View>

                                {selectedFeeding.amount && (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Quantidade:</Text>
                                        <Text style={styles.detailValue}>{selectedFeeding.amount} ml</Text>
                                    </View>
                                )}

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Data/Hora:</Text>
                                    <Text style={styles.detailValue}>
                                        {formatDateTime(selectedFeeding.timestamp)}
                                    </Text>
                                </View>

                                {selectedFeeding.notes && (
                                    <View style={styles.notesContainer}>
                                        <Text style={styles.notesLabel}>Observações:</Text>
                                        <Text style={styles.notesValue}>{selectedFeeding.notes}</Text>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => confirmDelete(selectedFeeding.id)}
                                >
                                    <Ionicons name="trash-outline" size={18} color="#fff" />
                                    <Text style={styles.deleteButtonText}>Excluir Registro</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
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
    formCard: {
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
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 10,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    typeButtonActive: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    typeButtonText: {
        color: '#333',
        fontSize: 12,
        marginLeft: 5,
        textAlign: 'center',
    },
    typeButtonTextActive: {
        color: '#fff',
    },
    inputContainer: {
        marginBottom: 15,
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    amountButtonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    amountButton: {
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 0,
        marginBottom: 8,
        width: '13%',
        alignItems: 'center',
    },
    amountButtonActive: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    amountButtonText: {
        color: '#333',
        fontSize: 12,
        fontWeight: 'bold',
    },
    amountButtonTextActive: {
        color: '#fff',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
        marginRight: 8,
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        marginLeft: 8,
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: 'bold',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    historyContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        margin: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 30,
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    emptyHistory: {
        alignItems: 'center',
        padding: 20,
    },
    emptyHistoryText: {
        color: '#999',
        marginTop: 10,
        fontSize: 16,
    },
    feedingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    feedingTimeContainer: {
        backgroundColor: '#e8f5e9',
        padding: 8,
        borderRadius: 6,
        marginRight: 10,
        minWidth: 60,
        alignItems: 'center',
    },
    feedingTime: {
        color: '#4CAF50',
        fontWeight: 'bold',
        fontSize: 14,
    },
    feedingContent: {
        flex: 1,
    },
    feedingType: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    feedingNotes: {
        fontSize: 14,
        color: '#999',
        marginTop: 2,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        padding: 10,
    },
    viewAllButtonText: {
        color: '#4CAF50',
        fontWeight: 'bold',
        marginRight: 5,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        width: '100%',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalBody: {
        paddingVertical: 10,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    detailLabel: {
        fontSize: 16,
        color: '#666',
        width: 100,
    },
    detailValue: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        fontWeight: '500',
    },
    notesContainer: {
        marginTop: 5,
        marginBottom: 15,
    },
    notesLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    notesValue: {
        fontSize: 16,
        color: '#333',
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 6,
    },
    deleteButton: {
        backgroundColor: '#FF6B6B',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        marginTop: 15,
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default FeedingScreen;
