import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    Linking,
    TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AboutScreen = () => {
    const appVersion = "1.0.0";

    const openEmail = () => {
        Linking.openURL('mailto:ivonildo.lima@gmail.com');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Sobre o App</Text>
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/icon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.appName}>Alibeby</Text>
                    <Text style={styles.version}>Versão {appVersion}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        <Ionicons name="information-circle-outline" size={20} color="#4CAF50" /> Sobre o Aplicativo
                    </Text>
                    <Text style={styles.sectionText}>
                        O Alibeby é um aplicativo desenvolvido para facilitar o acompanhamento do desenvolvimento e
                        alimentação do bebê. Com ele, é possível registrar dados como peso, altura e alimentações,
                        além de visualizar estatísticas e histórico completo.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        <Ionicons name="star-outline" size={20} color="#4CAF50" /> Funcionalidades
                    </Text>
                    <View style={styles.featureList}>
                        <View style={styles.featureItem}>
                            <Ionicons name="create-outline" size={18} color="#666" />
                            <Text style={styles.featureText}>Cadastro de informações do bebê</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="nutrition-outline" size={18} color="#666" />
                            <Text style={styles.featureText}>Registro de alimentação</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="analytics-outline" size={18} color="#666" />
                            <Text style={styles.featureText}>Visualização de estatísticas</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="time-outline" size={18} color="#666" />
                            <Text style={styles.featureText}>Histórico completo</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        <Ionicons name="code-outline" size={20} color="#4CAF50" /> Desenvolvedor
                    </Text>
                    <Text style={styles.developerName}>Ivonildo Lima</Text>
                    <Text style={styles.dedicationText}>Desenvolvido com amor para Amelie</Text>

                    <TouchableOpacity style={styles.emailButton} onPress={openEmail}>
                        <Ionicons name="mail-outline" size={18} color="#fff" />
                        <Text style={styles.emailButtonText}>Contato</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.copyrightContainer}>
                    <Text style={styles.copyrightText}>
                        © {new Date().getFullYear()} - Todos os direitos reservados
                    </Text>
                </View>
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
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    contentContainer: {
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 10,
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    version: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionText: {
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
    },
    featureList: {
        marginTop: 5,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    featureText: {
        marginLeft: 10,
        fontSize: 15,
        color: '#555',
    },
    developerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 5,
        marginBottom: 5,
    },
    dedicationText: {
        fontSize: 16,
        fontStyle: 'italic',
        color: '#555',
        marginBottom: 20,
    },
    emailButton: {
        backgroundColor: '#4CAF50',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
    },
    emailButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
    copyrightContainer: {
        marginTop: 10,
        marginBottom: 30,
        alignItems: 'center',
    },
    copyrightText: {
        fontSize: 14,
        color: '#999',
    },
});

export default AboutScreen;
