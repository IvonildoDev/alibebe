import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Assuming we'd import a charting library in a real app
// For this example, we'll create simple visual representations
const StatsScreen = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [babyData, setBabyData] = useState([]);
    const [feedingData, setFeedingData] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('week'); // 'week', 'month', 'all'
    const [selectedStat, setSelectedStat] = useState('weight'); // 'weight', 'height', 'feedings'
    const [babyName, setBabyName] = useState('');

    useEffect(() => {
        loadData();

        // Add listener for when screen comes into focus
        const unsubscribe = navigation.addListener('focus', () => {
            loadData();
        });

        // Cleanup listener
        return unsubscribe;
    }, [navigation, selectedPeriod]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Load baby records
            const recordsJSON = await AsyncStorage.getItem('userRecords');
            if (recordsJSON) {
                const records = JSON.parse(recordsJSON);

                // Sort by date (oldest first for chart data)
                const sortedRecords = records.sort((a, b) =>
                    new Date(a.date) - new Date(b.date)
                );

                // Filter based on selected period
                const filteredRecords = filterDataByPeriod(sortedRecords);
                setBabyData(filteredRecords);

                // Set baby name from the latest record
                if (records.length > 0) {
                    const latestRecord = records.sort((a, b) =>
                        new Date(b.date) - new Date(a.date)
                    )[0];
                    setBabyName(latestRecord.name);
                }
            }

            // Load feeding records
            const feedingsJSON = await AsyncStorage.getItem('feedingRecords');
            if (feedingsJSON) {
                const feedings = JSON.parse(feedingsJSON);
                // Filter based on selected period
                const filteredFeedings = filterDataByPeriod(feedings);
                setFeedingData(filteredFeedings);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterDataByPeriod = (data) => {
        const now = new Date();
        let cutoffDate;

        switch (selectedPeriod) {
            case 'week':
                cutoffDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'month':
                cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'all':
            default:
                return data;
        }

        return data.filter(item => {
            const itemDate = new Date(item.date || item.timestamp);
            return itemDate >= cutoffDate;
        });
    };

    const calculateDailyFeedingStats = () => {
        const dailyStats = {};

        // Process feeding data
        feedingData.forEach(feeding => {
            const date = new Date(feeding.timestamp);
            const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

            if (!dailyStats[dateStr]) {
                dailyStats[dateStr] = {
                    count: 0,
                    totalAmount: 0,
                    date: dateStr,
                    formattedDate: `${date.getDate()}/${date.getMonth() + 1}`
                };
            }

            dailyStats[dateStr].count += 1;

            // Add amounts only for formula feedings
            if (feeding.type === 'formula' && feeding.amount) {
                dailyStats[dateStr].totalAmount += feeding.amount;
            }
        });

        // Convert to array and sort by date
        return Object.values(dailyStats).sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );
    };

    const calculateFeedingTypeStats = () => {
        // Count feedings by type
        const typeCounts = {
            leite_materno: 0,
            formula: 0,
            alimento: 0
        };

        let totalAmount = 0;

        feedingData.forEach(feeding => {
            if (feeding.type in typeCounts) {
                typeCounts[feeding.type]++;
            }

            // Sum formula amounts
            if (feeding.type === 'formula' && feeding.amount) {
                totalAmount += feeding.amount;
            }
        });

        // Convert to array format for pie chart
        const typeData = [
            { type: 'Leite Materno', count: typeCounts.leite_materno, color: '#4CAF50' },
            { type: 'Fórmula', count: typeCounts.formula, color: '#2196F3' },
            { type: 'Alimento', count: typeCounts.alimento, color: '#FF9800' }
        ].filter(item => item.count > 0);

        return { typeData, totalAmount };
    };

    const calculateWeightEvolution = () => {
        if (babyData.length === 0) return [];

        return babyData.map(record => {
            const date = new Date(record.date);
            return {
                weight: record.weight,
                date: record.date,
                formattedDate: `${date.getDate()}/${date.getMonth() + 1}`
            };
        });
    };

    const calculateHeightEvolution = () => {
        if (babyData.length === 0) return [];

        return babyData.map(record => {
            const date = new Date(record.date);
            return {
                height: record.height,
                date: record.date,
                formattedDate: `${date.getDate()}/${date.getMonth() + 1}`
            };
        }).filter(item => item.height); // Filter out records without height
    };

    const renderWeightChart = () => {
        const weightData = calculateWeightEvolution();

        if (weightData.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="analytics-outline" size={50} color="#999" />
                    <Text style={styles.emptyText}>Nenhum dado de peso disponível</Text>
                </View>
            );
        }

        // Sort by weight to create weight distribution for pie chart
        const sortedByWeight = [...weightData].sort((a, b) => a.weight - b.weight);
        const totalWeight = sortedByWeight.reduce((sum, item) => sum + item.weight, 0);

        // Create pie chart data - each entry represents a weight measurement
        const pieData = sortedByWeight.map((item, index) => {
            const percentage = (item.weight / totalWeight) * 100;
            // Generate color from green to blue spectrum based on index
            const hue = 120 + (index * (240 - 120) / sortedByWeight.length);
            return {
                value: item.weight,
                date: item.formattedDate,
                percentage,
                color: `hsl(${hue}, 70%, 50%)`
            };
        });

        return (
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Evolução do Peso (kg)</Text>

                <View style={styles.pieChartContainer}>
                    <View style={styles.pieChart}>
                        {pieData.map((item, index) => {
                            // Calculate rotation for pie slice
                            const startAngle = pieData
                                .slice(0, index)
                                .reduce((sum, d) => sum + (d.percentage * 3.6), 0);

                            return (
                                <View
                                    key={index}
                                    style={[
                                        styles.pieSlice,
                                        {
                                            backgroundColor: item.color,
                                            transform: [
                                                { rotate: `${startAngle}deg` },
                                                { skewY: `${item.percentage * 3.6}deg` }
                                            ]
                                        }
                                    ]}
                                />
                            );
                        })}
                    </View>

                    <View style={styles.pieCenter}>
                        <Text style={styles.pieCenterText}>
                            {weightData[weightData.length - 1].weight} kg
                        </Text>
                        <Text style={styles.pieCenterSubtext}>
                            Último peso
                        </Text>
                    </View>
                </View>

                <View style={styles.legendContainer}>
                    {pieData.map((item, index) => (
                        <View key={index} style={styles.legendItem}>
                            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                            <Text style={styles.legendText}>
                                {item.date}: {item.value} kg
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderHeightChart = () => {
        const heightData = calculateHeightEvolution();

        if (heightData.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="analytics-outline" size={50} color="#999" />
                    <Text style={styles.emptyText}>Nenhum dado de altura disponível</Text>
                </View>
            );
        }

        // Sort by height to create height distribution for pie chart
        const sortedByHeight = [...heightData].sort((a, b) => a.height - b.height);
        const totalHeight = sortedByHeight.reduce((sum, item) => sum + item.height, 0);

        // Create pie chart data - each entry represents a height measurement
        const pieData = sortedByHeight.map((item, index) => {
            const percentage = (item.height / totalHeight) * 100;
            // Generate color from orange to purple spectrum based on index
            const hue = 30 + (index * (270 - 30) / sortedByHeight.length);
            return {
                value: item.height,
                date: item.formattedDate,
                percentage,
                color: `hsl(${hue}, 70%, 50%)`
            };
        });

        return (
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Evolução da Altura (cm)</Text>

                <View style={styles.pieChartContainer}>
                    <View style={styles.pieChart}>
                        {pieData.map((item, index) => {
                            // Calculate rotation for pie slice
                            const startAngle = pieData
                                .slice(0, index)
                                .reduce((sum, d) => sum + (d.percentage * 3.6), 0);

                            return (
                                <View
                                    key={index}
                                    style={[
                                        styles.pieSlice,
                                        {
                                            backgroundColor: item.color,
                                            transform: [
                                                { rotate: `${startAngle}deg` },
                                                { skewY: `${item.percentage * 3.6}deg` }
                                            ]
                                        }
                                    ]}
                                />
                            );
                        })}
                    </View>

                    <View style={styles.pieCenter}>
                        <Text style={styles.pieCenterText}>
                            {heightData[heightData.length - 1].height} cm
                        </Text>
                        <Text style={styles.pieCenterSubtext}>
                            Última altura
                        </Text>
                    </View>
                </View>

                <View style={styles.legendContainer}>
                    {pieData.map((item, index) => (
                        <View key={index} style={styles.legendItem}>
                            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                            <Text style={styles.legendText}>
                                {item.date}: {item.value} cm
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderFeedingChart = () => {
        const feedingStats = calculateDailyFeedingStats();
        const { typeData, totalAmount } = calculateFeedingTypeStats();

        if (feedingStats.length === 0 || typeData.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="analytics-outline" size={50} color="#999" />
                    <Text style={styles.emptyText}>Nenhum dado de alimentação disponível</Text>
                </View>
            );
        }

        // Calculate total feedings for percentage
        const totalFeedings = typeData.reduce((sum, item) => sum + item.count, 0);

        // Calculate pie chart data
        const pieData = typeData.map(item => ({
            ...item,
            percentage: (item.count / totalFeedings) * 100
        }));

        return (
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Distribuição de Alimentação</Text>

                <View style={styles.pieChartContainer}>
                    <View style={styles.pieChart}>
                        {pieData.map((item, index) => {
                            // Calculate rotation for pie slice
                            const startAngle = pieData
                                .slice(0, index)
                                .reduce((sum, d) => sum + (d.percentage * 3.6), 0);

                            return (
                                <View
                                    key={index}
                                    style={[
                                        styles.pieSlice,
                                        {
                                            backgroundColor: item.color,
                                            transform: [
                                                { rotate: `${startAngle}deg` },
                                                { skewY: `${item.percentage * 3.6}deg` }
                                            ]
                                        }
                                    ]}
                                />
                            );
                        })}
                    </View>

                    <View style={styles.pieCenter}>
                        <Text style={styles.pieCenterText}>
                            {totalFeedings}
                        </Text>
                        <Text style={styles.pieCenterSubtext}>
                            Alimentações
                        </Text>
                    </View>
                </View>

                <View style={styles.legendContainer}>
                    {pieData.map((item, index) => (
                        <View key={index} style={styles.legendItem}>
                            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                            <Text style={styles.legendText}>
                                {item.type}: {item.count} ({Math.round(item.percentage)}%)
                            </Text>
                        </View>
                    ))}
                </View>

                {typeData.some(item => item.type === 'Fórmula' && item.count > 0) && (
                    <View style={styles.statsCardContainer}>
                        <View style={styles.statsCard}>
                            <Text style={styles.statsCardTitle}>Total de Fórmula</Text>
                            <Text style={styles.statsCardValue}>{totalAmount} ml</Text>
                            <Text style={styles.statsCardSubtext}>
                                {selectedPeriod === 'week' ? 'Última semana' :
                                    selectedPeriod === 'month' ? 'Último mês' : 'Total'}
                            </Text>
                        </View>

                        <View style={styles.statsCard}>
                            <Text style={styles.statsCardTitle}>Média por Dia</Text>
                            <Text style={styles.statsCardValue}>
                                {Math.round(totalAmount / feedingStats.length)} ml
                            </Text>
                            <Text style={styles.statsCardSubtext}>
                                Em {feedingStats.length} {feedingStats.length === 1 ? 'dia' : 'dias'}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Estatísticas</Text>
                <Text style={styles.headerSubtitle}>
                    {babyName ? `Dados de ${babyName}` : 'Análise de dados do bebê'}
                </Text>
            </View>

            <View style={styles.periodSelector}>
                <TouchableOpacity
                    style={[
                        styles.periodButton,
                        selectedPeriod === 'week' && styles.periodButtonActive
                    ]}
                    onPress={() => setSelectedPeriod('week')}
                >
                    <Text
                        style={[
                            styles.periodButtonText,
                            selectedPeriod === 'week' && styles.periodButtonTextActive
                        ]}
                    >
                        Semana
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.periodButton,
                        selectedPeriod === 'month' && styles.periodButtonActive
                    ]}
                    onPress={() => setSelectedPeriod('month')}
                >
                    <Text
                        style={[
                            styles.periodButtonText,
                            selectedPeriod === 'month' && styles.periodButtonTextActive
                        ]}
                    >
                        Mês
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.periodButton,
                        selectedPeriod === 'all' && styles.periodButtonActive
                    ]}
                    onPress={() => setSelectedPeriod('all')}
                >
                    <Text
                        style={[
                            styles.periodButtonText,
                            selectedPeriod === 'all' && styles.periodButtonTextActive
                        ]}
                    >
                        Tudo
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tabSelector}>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        selectedStat === 'weight' && styles.tabButtonActive
                    ]}
                    onPress={() => setSelectedStat('weight')}
                >
                    <Ionicons
                        name="fitness"
                        size={20}
                        color={selectedStat === 'weight' ? '#fff' : '#4CAF50'}
                    />
                    <Text
                        style={[
                            styles.tabButtonText,
                            selectedStat === 'weight' && styles.tabButtonTextActive
                        ]}
                    >
                        Peso
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        selectedStat === 'feedings' && styles.tabButtonActive
                    ]}
                    onPress={() => setSelectedStat('feedings')}
                >
                    <Ionicons
                        name="nutrition"
                        size={20}
                        color={selectedStat === 'feedings' ? '#fff' : '#4CAF50'}
                    />
                    <Text
                        style={[
                            styles.tabButtonText,
                            selectedStat === 'feedings' && styles.tabButtonTextActive
                        ]}
                    >
                        Alimentação
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#4CAF50" />
                        <Text style={styles.loadingText}>Carregando dados...</Text>
                    </View>
                ) : (
                    <View style={styles.statsContainer}>
                        {selectedStat === 'weight' ? renderWeightChart() : renderFeedingChart()}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#4CAF50',
        padding: 20,
        paddingTop: 40,
        marginBottom: 0,
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
    periodSelector: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 10,
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    periodButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    periodButtonActive: {
        backgroundColor: '#e8f5e9',
    },
    periodButtonText: {
        color: '#666',
        fontWeight: 'bold',
    },
    periodButtonTextActive: {
        color: '#4CAF50',
    },
    tabSelector: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 10,
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 10,
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    tabButtonActive: {
        backgroundColor: '#4CAF50',
    },
    tabButtonText: {
        marginLeft: 6,
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    tabButtonTextActive: {
        color: '#fff',
    },
    scrollContainer: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    statsContainer: {
        padding: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
    },
    emptyText: {
        marginTop: 10,
        color: '#999',
        fontSize: 16,
        textAlign: 'center',
    },
    chartContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    // Pie chart styles
    pieChartContainer: {
        position: 'relative',
        width: width - 80,
        height: width - 80,
        alignSelf: 'center',
        marginBottom: 20,
    },
    pieChart: {
        width: '100%',
        height: '100%',
        borderRadius: (width - 80) / 2,
        overflow: 'hidden',
    },
    pieSlice: {
        position: 'absolute',
        width: '50%',
        height: '100%',
        left: '50%',
        top: 0,
        transformOrigin: 'left center',
    },
    pieCenter: {
        position: 'absolute',
        width: '70%',
        height: '70%',
        top: '15%',
        left: '15%',
        backgroundColor: '#fff',
        borderRadius: (width - 80) * 0.35,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    pieCenterText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    pieCenterSubtext: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    legendContainer: {
        flexDirection: 'column',
        marginTop: 10,
        alignItems: 'flex-start',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 8,
    },
    legendText: {
        fontSize: 14,
        color: '#333',
    },
    statsCardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    statsCard: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        margin: 5,
        alignItems: 'center',
    },
    statsCardTitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    statsCardValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    statsCardSubtext: {
        fontSize: 10,
        color: '#999',
        textAlign: 'center',
        marginTop: 4,
    },
    // Legacy bar chart styles - keeping them for compatibility
    chartGrid: {
        flexDirection: 'row',
        height: 200,
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        paddingTop: 20,
    },
    barContainer: {
        alignItems: 'center',
        flex: 1,
    },
    bar: {
        width: 20,
        backgroundColor: '#4CAF50',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        marginBottom: 5,
    },
    amountBar: {
        backgroundColor: '#2196F3',
    },
    barValue: {
        fontSize: 10,
        color: '#666',
        marginBottom: 5,
    },
    barLabel: {
        fontSize: 10,
        color: '#999',
    },
});

export default StatsScreen;
