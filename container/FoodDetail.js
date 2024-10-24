import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import Slider from '@react-native-community/slider';
import axios from 'axios';
import API_BASE_URL from '../constants/config';

export default function FoodDetail({ route, navigation }) {
  // route에서 params 안전하게 추출
  const { params } = route || {};
  const { foodId } = params || {};

  const [food, setFood] = useState(null);
  const [consumptionValue, setConsumptionValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const placeholderImage = 'https://via.placeholder.com/150';

  // 식품 정보를 DB에서 가져오는 함수
  const fetchFoodDetail = async () => {
    setIsLoading(true); // 로딩 시작
    if (!foodId) {
      console.warn('foodId is undefined. Please provide a valid foodId.');
      setIsLoading(false); // 로딩 종료
      return;
    }
    try {
      console.log(`API 요청 URL: ${API_BASE_URL}/api/fooditems/details/${foodId}`);
      const response = await axios.get(`${API_BASE_URL}/api/fooditems/details/${foodId}`);
      console.log('API 응답 데이터 구조:', response.data);

      if (response.status === 200 && response.data) {
        // 응답 데이터가 배열 형태이므로 인덱스를 통해 접근합니다.
        const [id, foodName, price, quantity, expirationDate] = response.data;

        // 상태 업데이트
        setFood({
          foodId: id,
          foodName: foodName || '식품 이름 없음',
          quantity: quantity ?? 0,
          expirationDate: expirationDate || '정보 없음',
          price: price || '정보 없음',
        });
      } else {
        console.log('API에서 유효한 데이터를 받지 못했습니다.');
        Alert.alert('오류', '식품 정보를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('API 요청 중 오류 발생:', error);
      Alert.alert('오류', '식품 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  useEffect(() => {
    if (foodId) {
      fetchFoodDetail();
    } else {
      console.warn('foodId is undefined or null, fetchFoodDetail will not be called.');
    }
  }, [foodId]);

  const quantity = parseFloat(food?.quantity);
  const isQuantityValid = !isNaN(quantity);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>식품 정보</Text>
      </View>

      {isLoading ? (
        <Text>데이터를 불러오는 중입니다...</Text>
      ) : food ? (
        <View style={styles.foodInfoContainer}>
          <Image source={{ uri: placeholderImage }} style={styles.foodImage} />
          <View style={styles.foodInfo}>
            <Text style={styles.foodName}>{food.foodName}</Text>
            <Text style={styles.foodExpiry}>유통기한: {food.expirationDate}</Text>
            <Text style={styles.foodQuantity}>갯수: {isQuantityValid ? food.quantity.toString() : '정보 없음'}</Text>
            <Text style={styles.foodPrice}>가격: {food.price !== '정보 없음' ? `${food.price}원` : '정보 없음'}</Text>
          </View>
        </View>
      ) : (
        <Text>식품 정보를 찾을 수 없습니다.</Text>
      )}

      {food && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>소비/배출</Text>
            {isQuantityValid ? (
              <Slider
                value={consumptionValue}
                onValueChange={setConsumptionValue}
                minimumValue={0}
                maximumValue={quantity} // 유효한 수량만 Slider에 설정
                step={1}
                style={styles.slider}
              />
            ) : (
              <Text>유효한 수량 정보가 없습니다.</Text>
            )}
            <View style={styles.sliderValueContainer}>
              <Text style={styles.sliderValue}>{consumptionValue}</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => handleConsume()} style={styles.actionButton}>
              <Text style={styles.buttonText}>소비 완료</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDispose()} style={styles.actionButton}>
              <Text style={styles.buttonText}>음식물 배출</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  foodInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  foodImage: {
    width: 50,
    height: 50,
    marginRight: 16,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  foodExpiry: {
    fontSize: 14,
    color: '#888',
  },
  foodQuantity: {
    fontSize: 14,
    color: '#888',
  },
  foodPrice: {
    fontSize: 14,
    color: '#888',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  slider: {
    marginBottom: 8,
  },
  sliderValueContainer: {
    alignItems: 'flex-end',
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  actionButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#667080',
    alignItems: 'center',
    flex: 1,
    margin: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
