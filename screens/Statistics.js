import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { PieChart } from 'react-native-chart-kit';
import axios from 'axios';
import * as Device from 'expo-device';
import API_BASE_URL from '../constants/config'; 

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#1E2923',
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: '#08130D',
  backgroundGradientToOpacity: 0.5,
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
};

const getCurrentMonth = () => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
};

export default function StatisticsScreen() {
  const [filteredData, setFilteredData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth().month);
  const [selectedType, setSelectedType] = useState('CONSUMED');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [consumptionAnalysis, setConsumptionAnalysis] = useState('');
  const [wasteAnalysis, setWasteAnalysis] = useState('');
  const [selectedTab, setSelectedTab] = useState('소비');
  const [deviceId, setDeviceId] = useState('');

  // 디바이스 ID를 얻는 함수
  useEffect(() => {
    const getDeviceId = () => {
      const id = Device.modelId || Device.osInternalBuildId || 'unknown-device';
      setDeviceId(id);
      console.log('디바이스 ID:', id);
    };
    getDeviceId();
  }, []);

  // 월이 선택될 때만 API 호출
  useEffect(() => {
    if (deviceId && !loading) {
      fetchData(selectedMonth, selectedType);
    }
  }, [selectedMonth, deviceId, selectedType]);

  const fetchData = async (month, type) => {
    setLoading(true);
    setError(null);

    const year = new Date().getFullYear();
    console.log('API 요청 중...');
    console.log('API 호출 URL:', `${API_BASE_URL}/api/consumption-records/${deviceId}/month/type`);
    console.log('요청 매개변수:', { year, month, consumptionType: type });

    try {
      const response = await axios.get(`${API_BASE_URL}/api/consumption-records/${deviceId}/month/type`, {
        params: {
          year,
          month,
          consumptionType: type,
        },
      });

      console.log('API 응답:', response.data);
      const transformedData = response.data.map((item, index) => ({
        key: `${item[0]}_${index}`,
        name: item[0],
        value: item[1],
        price: item[2],
        color: getRandomColor(),
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
      }));

      setFilteredData(transformedData);

      // 소비 분석/폐기 분석 호출
      if (type === 'CONSUMED') {
        setWasteAnalysis(''); // 폐기 분석 초기화
        fetchConsumptionAnalysis(month);
      } else {
        setConsumptionAnalysis(''); // 소비 분석 초기화
        fetchWasteAnalysis(month);
      }
    } catch (err) {
      console.error('데이터 로드 중 오류 발생:', err);
      setError('데이터를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      console.log('데이터 로드 완료');
    }
  };

  const fetchConsumptionAnalysis = async (month) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/consumption-records/${deviceId}/month/consumption-analysis`, {
        params: {
          year: 2024,
          month,
        },
      });
      setConsumptionAnalysis(response.data);
    } catch (error) {
      console.error('소비 분석 오류:', error);
      setConsumptionAnalysis('');
    }
  };

  const fetchWasteAnalysis = async (month) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/consumption-records/${deviceId}/month/waste-analysis`, {
        params: {
          year: 2024,
          month,
        },
      });
      setWasteAnalysis(response.data);
    } catch (error) {
      console.error('폐기 분석 오류:', error);
      setWasteAnalysis('');
    }
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handleTabChange = (tab) => {
    if (selectedTab !== tab) {
      setSelectedTab(tab);
      setSelectedType(tab === '소비' ? 'CONSUMED' : 'DISCARDED');
    }
  };

  return (
    <FlatList
      style={styles.container}
      data={filteredData}
      keyExtractor={(item) => item.key}
      renderItem={({ item }) => (
        <View style={styles.listItem}>
          <Text style={styles.listItemText}>
            {item.name}: {item.value} 개
          </Text>
          <Text style={styles.listItemCost}>가격: {item.price || 0}원</Text>
        </View>
      )}
      ListHeaderComponent={(
        <View>
          <Text style={styles.header}>통계 및 조회</Text>
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>월을 선택하세요:</Text>
            <Picker
              selectedValue={selectedMonth}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedMonth(itemValue)}
            >
              {[...Array(12).keys()].map((i) => (
                <Picker.Item key={i} label={`${i + 1}월`} value={i + 1} />
              ))}
            </Picker>
          </View>
          <View style={styles.tabContainer}>
            {['소비', '폐기'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, selectedTab === tab && styles.activeTabButton]}
                onPress={() => handleTabChange(tab)}
              >
                <Text style={styles.tabText}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : error || filteredData.length === 0 ? (
            <Text style={styles.errorText}>소비/폐기할 음식이 없습니다.</Text>
          ) : (
            <View>
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>{selectedTab} 차트</Text>
                <PieChart
                  data={filteredData}
                  width={screenWidth}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="value"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                  hasLegend={true}
                />
              </View>
              <View style={styles.analysisContainer}>
                <Text style={styles.analysisTitle}>{selectedTab} 분석</Text>
                <Text style={styles.analysisText}>
                  {selectedType === 'CONSUMED'
                    ? consumptionAnalysis || '소비분석을 가져오는 중입니다.'
                    : wasteAnalysis || '폐기분석을 가져오는 중입니다.'}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
      ListEmptyComponent={() => <Text style={styles.noDataText}>재료 데이터가 없습니다.</Text>}
      contentContainerStyle={{ paddingBottom: 40 }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  filterContainer: { marginBottom: 20 },
  filterLabel: { fontSize: 16, fontWeight: 'bold', marginVertical: 10 },
  picker: { height: 50, width: '100%' },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  tabButton: { padding: 10, borderRadius: 8, backgroundColor: '#ddd' },
  activeTabButton: { backgroundColor: '#888' },
  tabText: { fontSize: 16, color: '#fff' },
  chartContainer: { marginBottom: 20, padding: 10, backgroundColor: '#fff', borderRadius: 10 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  analysisContainer: { marginBottom: 20, padding: 10, backgroundColor: '#fff', borderRadius: 10 },
  analysisTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  analysisText: { fontSize: 16, color: '#333' },
  listItem: { padding: 15, backgroundColor: '#fff', borderRadius: 10, marginBottom: 10 },
  listItemText: { fontSize: 16, fontWeight: '600' },
  listItemCost: { fontSize: 14, color: '#444', marginTop: 5 },
  errorText: { color: 'red', textAlign: 'center', marginVertical: 20 },
  noDataText: { textAlign: 'center', color: '#888', marginVertical: 20 }
});
