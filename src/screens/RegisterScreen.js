import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = ({ navigation, route }) => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [loading, setLoading] = useState(true);
    const [isUpdate, setIsUpdate] = useState(false);

    useEffect(() => {
        loadLatestRecord();

        // Adicionar listener para quando a tela entrar em foco
        const unsubscribe = navigation.addListener('focus', () => {
            loadLatestRecord();
        });

        // Limpar listener
        return unsubscribe;
    }, [navigation]);

    const loadLatestRecord = async () => {
        setLoading(true);
        try {
            const recordsJSON = await AsyncStorage.getItem('userRecords');
            if (recordsJSON) {
                const records = JSON.parse(recordsJSON);
                if (records.length > 0) {
                    // Ordenar por data e obter o registro mais recente
                    const sortedRecords = records.sort((a, b) =>
                        new Date(b.date) - new Date(a.date)
                    );
                    const latestRecord = sortedRecords[0];

                    // Preencher os campos com os dados mais recentes
                    setName(latestRecord.name || '');
                    setAge(latestRecord.age?.toString() || '');
                    setWeight(latestRecord.weight?.toString() || '');
                    setHeight(latestRecord.height?.toString() || '');
                    setIsUpdate(true);
                } else {
                    clearForm();
                }
            } else {
                clearForm();
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            Alert.alert('Erro', 'Falha ao carregar os dados existentes.');
            clearForm();
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setName('');
        setAge('');
        setWeight('');
        setHeight('');
        setIsUpdate(false);
    };

    const saveData = async () => {
        // Validate inputs
        if (!name.trim() || !age.trim() || !weight.trim() || !height.trim()) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        // Validate age, weight and height are numbers
        if (isNaN(Number(age)) || isNaN(Number(weight)) || isNaN(Number(height))) {
            Alert.alert('Erro', 'Idade, peso e altura devem ser números');
            return;
        }

        try {
            // Get existing records
            const existingRecordsJSON = await AsyncStorage.getItem('userRecords');
            let records = existingRecordsJSON ? JSON.parse(existingRecordsJSON) : [];

            // Add new record with timestamp
            const newRecord = {
                id: Date.now().toString(),
                name,
                age: Number(age),
                weight: Number(weight),
                height: Number(height),
                date: new Date().toISOString()
            };

            records.push(newRecord);

            // Save records
            await AsyncStorage.setItem('userRecords', JSON.stringify(records));

            const message = isUpdate ? 'Dados atualizados com sucesso!' : 'Dados salvos com sucesso!';
            Alert.alert('Sucesso', message, [
                { text: 'OK', onPress: () => navigation.navigate('Home') }
            ]);

            // Clear form
            clearForm();
        } catch (error) {
            Alert.alert('Erro', 'Falha ao salvar os dados: ' + error.message);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>{isUpdate ? 'Atualizar Dados do Bebê' : 'Cadastro do Bebê'}</Text>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#4CAF50" />
                        <Text style={styles.loadingText}>Carregando dados...</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Nome do Bebê</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite o nome do bebê"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Idade (meses)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite a idade em meses"
                                value={age}
                                onChangeText={setAge}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Peso (kg)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite o peso do bebê"
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Altura (cm)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite a altura do bebê"
                                value={height}
                                onChangeText={setHeight}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={saveData}
                            >
                                <Text style={styles.buttonText}>
                                    {isUpdate ? 'Atualizar' : 'Salvar'}
                                </Text>
                            </TouchableOpacity>

                            {isUpdate && (
                                <TouchableOpacity
                                    style={[styles.button, styles.clearButton]}
                                    onPress={clearForm}
                                >
                                    <Text style={styles.buttonText}>Novo Cadastro</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    buttonContainer: {
        marginTop: 10,
        flexDirection: 'column',
        gap: 10,
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    clearButton: {
        backgroundColor: '#ff9800',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default RegisterScreen;
