import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Device from 'expo-device';
import API_BASE_URL from '../constants/config';  // 수정된 경로: config.js에서 IP 주소 가져오기

export default function AddFoodScreen({ route, navigation }) {
  const { extractedText } = route.params || {};  // extractedText 받기

  // extractedText가 제대로 전달되었는지 확인 (디버깅 용)
  useEffect(() => {
    console.log('extractedText:', extractedText);  // 추출된 텍스트 로그로 확인
  }, [extractedText]);

  const initialFoodItems = Array.isArray(extractedText)
    ? extractedText.map(item => ({
        foodName: item[0],
        quantity: item[1],
        price: item[2],
        expiryDate: '',
        storageType: '',
      }))
    : [{ foodName: '', quantity: '', price: '', expiryDate: '', storageType: '' }];

  const [foodItems, setFoodItems] = useState(initialFoodItems);

  const handleInputChange = (index, field, value) => {
    const updatedItems = [...foodItems];
    updatedItems[index][field] = value;
    setFoodItems(updatedItems);
  };

  const addNewFoodItem = () => {
    setFoodItems([...foodItems, { foodName: '', quantity: '', expiryDate: '', storageType: '', price: '' }]);
  };

  // 항목 삭제 핸들러
  const removeFoodItem = (index) => {
    const updatedItems = [...foodItems];
    updatedItems.splice(index, 1);  // 해당 인덱스의 항목을 삭제
    setFoodItems(updatedItems);
  };

  const handleManualInput = async () => {
    const data = foodItems.map((item) => ({
      deviceId: Device.modelId || Device.osInternalBuildId || '',
      foodName: item.foodName || '',
      price: parseFloat(item.price) || 0,
      quantity: parseFloat(item.quantity) || 0,
      expirationDate: item.expiryDate || '',
      registeredDate: new Date().toISOString(),
      storageMethod: item.storageType.toUpperCase(),
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/fooditems/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        Alert.alert('식품 추가 완료', '식품이 성공적으로 추가되었습니다.', [
          {
            text: '확인',
            onPress: () => {
              navigation.navigate('FoodList', { newFood: data }); // 새로 추가된 식품 데이터 전달
            },
          },
        ]);
      } else {
        const errorMessage = await response.text();
        console.error(`서버 응답 오류: ${response.status}, 메시지: ${errorMessage}`);
        Alert.alert('오류', `식품 추가 중 문제가 발생했습니다. 상태 코드: ${response.status}`);
      }
    } catch (error) {
      console.error('API 요청 오류:', error);
      Alert.alert('오류', '서버에 연결할 수 없습니다.');
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {foodItems.map((item, index) => (
            <View key={index} style={styles.foodItemContainer}>
              <View style={styles.row}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>식품 이름</Text>
                  <TextInput
                    style={styles.input}
                    value={item.foodName}
                    onChangeText={(value) => handleInputChange(index, 'foodName', value)}
                    placeholder="식품 이름을 입력하세요."
                  />
                </View>
                <View style={styles.inputContainer}>
                  <View style={styles.rowWithDelete}>
                    <Text style={styles.label}>수량</Text>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => removeFoodItem(index)}>
                      <Text style={styles.deleteButtonText}>X</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={String(item.quantity)}
                    onChangeText={(value) => handleInputChange(index, 'quantity', value)}
                    placeholder="수량을 입력하세요."
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>가격</Text>
                  <TextInput
                    style={styles.input}
                    value={String(item.price)}
                    onChangeText={(value) => handleInputChange(index, 'price', value)}
                    placeholder="가격을 입력하세요."
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>유통기한</Text>
                  <TextInput
                    style={styles.input}
                    value={item.expiryDate}
                    onChangeText={(value) => handleInputChange(index, 'expiryDate', value)}
                    placeholder="유통기한 (YYYY-MM-DD)"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>등록일자</Text>
                  <TextInput
                    style={styles.input}
                    value={new Date().toISOString().slice(0, 10)}
                    editable={false}
                  />
                </View>
              </View>

              <View style={styles.storageRow}>
                <TouchableOpacity
                  style={[styles.storageButton, item.storageType === 'REFRIGERATOR' && styles.storageButtonSelected]}
                  onPress={() => handleInputChange(index, 'storageType', 'REFRIGERATOR')}
                >
                  <Text style={[styles.storageButtonText, item.storageType === 'REFRIGERATOR' && styles.storageButtonTextSelected]}>
                    냉장
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.storageButton, item.storageType === 'FREEZER' && styles.storageButtonSelected]}
                  onPress={() => handleInputChange(index, 'storageType', 'FREEZER')}
                >
                  <Text style={[styles.storageButtonText, item.storageType === 'FREEZER' && styles.storageButtonTextSelected]}>
                    냉동
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.storageButton, item.storageType === 'ROOM_TEMPERATURE' && styles.storageButtonSelected]}
                  onPress={() => handleInputChange(index, 'storageType', 'ROOM_TEMPERATURE')}
                >
                  <Text style={[styles.storageButtonText, item.storageType === 'ROOM_TEMPERATURE' && styles.storageButtonTextSelected]}>
                    실온
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addNewButton} onPress={addNewFoodItem}>
            <Text style={styles.addNewButtonText}>+ 식품 추가</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={handleManualInput}>
          <Text style={styles.addButtonText}>추가하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  container: {
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  foodItemContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    position: 'relative',  
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    alignItems: 'center',  // 삭제 버튼과 수량을 수평으로 맞춤
  },
  rowWithDelete: {
    flexDirection: 'row',
    alignItems: 'center',  // 수량 레이블과 X 버튼을 수평으로 맞춤
  },
  inputContainer: {
    flex: 1,
    marginRight: 8,
  },

  deleteButton: {
    marginLeft: 135, 
    marginTop: -15, // 수량 레이블과 X 버튼 사이 간격
    borderRadius: 12,
    padding: 5,
    backgroundColor: 'transparent',  // 배경색 제거
  },
  deleteButtonText: {
    color: '#333',  // 글자 색상을 검은색으로 설정
    fontSize: 16,
    lineHeight: 16,  // 글자를 더 위로 올리기 위한 높이 조정
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
  },
  storageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  storageButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  storageButtonSelected: {
    backgroundColor: '#667080',
  },
  storageButtonText: {
    color: '#333',
  },
  storageButtonTextSelected: {
    color: '#fff',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  addButton: {
    backgroundColor: '#667080',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addNewButton: {
    marginTop: 16,
    backgroundColor: '#667080',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addNewButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
