import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import API_BASE_URL from '../constants/config'; 
import * as Device from 'expo-device';
import { Picker } from '@react-native-picker/picker'; // Picker 컴포넌트 가져오기
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // Navigation 사용

export default function SettingsModal({ modalVisible, toggleModal }) {
  const [expiringItems, setExpiringItems] = useState([]);
  const [selectedDays, setSelectedDays] = useState(''); // 기본값을 빈 문자열로 설정
  const [deviceId, setDeviceId] = useState('');
  const navigation = useNavigation(); // navigation 객체 추가

  // 기기 ID 가져오기
  useEffect(() => {
    const fetchDeviceId = async () => {
      const id = Device.modelId || Device.osInternalBuildId || 'unknown-device';
      console.log('Device ID:', id); // 로그로 확인
      setDeviceId(id);
    };

    fetchDeviceId();
  }, []);

  // 모달이 열렸을 때와 선택된 날짜가 변경될 때 유통기한 임박 식품 목록 가져오기
  useEffect(() => {
    if (modalVisible && deviceId && selectedDays) {
      fetchExpiringItems(selectedDays);
    }
  }, [modalVisible, selectedDays, deviceId]);

  // 모달이 열리거나 닫힐 때 초기화
  useFocusEffect(
    React.useCallback(() => {
      if (modalVisible) {
        setSelectedDays(''); // 모달이 열릴 때 상태 초기화
        setExpiringItems([]); // 기존 데이터 초기화
      }
    }, [modalVisible])
  );

  // 유통기한 임박 식품 목록 가져오기
  const fetchExpiringItems = async (days) => {
    try {
      if (!deviceId || typeof days !== 'number') {
        console.error('잘못된 요청: deviceId 또는 days 값이 유효하지 않음');
        return;
      }

      console.log('Fetching expiring items for device:', deviceId, 'days before:', days);
      const response = await axios.get(`${API_BASE_URL}/api/fooditems/expiring-soon`, {
        params: {
          deviceId: deviceId, // 문자열 형식 확인
          days: days, // 정수형 확인
        },
      });

      if (response.status === 200) {
        setExpiringItems(response.data);
      } else {
        console.error('유통기한 임박 식품 데이터를 가져오는 중 오류 발생:', response);
        Alert.alert('오류', '유통기한 임박 식품 데이터를 가져오는 중 문제가 발생했습니다.');
      }
    } catch (error) {
      console.error('API 요청 오류:', error);
      Alert.alert('오류', '서버에 연결할 수 없습니다.');
    }
  };

  // 선택한 재료 클릭 시 FoodDetail로 이동하는 함수
  const handleFoodItemPress = (foodId) => {
    toggleModal(); // 모달을 닫은 후에 FoodDetail로 이동
    navigation.navigate('FoodDetail', { foodId }); // 'FoodDetail' 화면으로 이동, foodId 전달
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={toggleModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>유통기한 임박 식품</Text>
          
          {/* 드롭다운 피커 */}
          <Picker
            selectedValue={selectedDays}
            onValueChange={(itemValue, itemIndex) => setSelectedDays(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="날짜를 선택하세요." value="" color="#999" />
            {[...Array(15).keys()].map((day) => (
              <Picker.Item key={day + 1} label={`${day + 1}일 전`} value={day + 1} />
            ))}
          </Picker>

          <ScrollView style={styles.foodList}>
            {expiringItems.length > 0 ? (
              expiringItems.map((item, index) => (
                <TouchableOpacity key={index} onPress={() => handleFoodItemPress(item[0])} style={styles.foodItem}>
                  <Text style={styles.foodName}>{item[2]}</Text>
                  <Text style={styles.foodDetails}>
                    <Text style={styles.highlightText}>{item[1]}</Text>, 수량: {item[3]}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text>해당 날짜에 유통기한이 임박한 식품이 없습니다.</Text>
            )}
          </ScrollView>

          <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    height: '70%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  picker: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
  },
  foodList: {
    width: '100%',
    marginTop: 20,
  },
  foodItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  foodName: {
    fontWeight: 'bold',
  },
  foodDetails: {
    color: '#666',
  },
  highlightText: {
    color: '#ff6347', // 유통기한 날짜 강조
  },
  closeButton: {
    backgroundColor: '#667080',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
