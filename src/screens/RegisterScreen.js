import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');

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

            Alert.alert('Sucesso', 'Dados salvos com sucesso!', [
                { text: 'OK', onPress: () => navigation.navigate('Home') }
            ]);

            // Clear form
            setName('');
            setAge('');
            setWeight('');
            setHeight('');
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
                <Text style={styles.title}>Cadastro do Bebê</Text>

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

                <TouchableOpacity style={styles.button} onPress={saveData}>
                    <Text style={styles.buttonText}>Salvar</Text>
                </TouchableOpacity>
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
    button: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default RegisterScreen;
