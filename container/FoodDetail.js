import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import Slider from '@react-native-community/slider';
import axios from 'axios';
import API_BASE_URL from '../constants/config';

export default function FoodDetail({ route, navigation }) {
  const { foodId } = route.params; // FoodList에서 전달된 식재료 ID
  const [food, setFood] = useState(null); // DB에서 가져온 식재료 정보를 저장할 상태
  const [consumptionValue, setConsumptionValue] = useState(0); // 소비할 식재료 양

  const placeholderImage = 'https://via.placeholder.com/150'; // 기본 Placeholder 이미지 URL

  // 식재료 정보를 DB에서 가져오는 함수
  const fetchFoodDetail = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/fooditems/details/${foodId}`);
      if (response.status === 200 && response.data) {
        const [id, foodName, price, quantity, expirationDate] = response.data;
        setFood({
          foodId: id,
          foodName: foodName || '식품 이름 없음',
          quantity: quantity || 0,
          expirationDate: expirationDate || '정보 없음',
          price: price || '정보 없음',
        });
      } else {
        Alert.alert('오류', '식품 정보를 찾을 수 없습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '식품 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchFoodDetail();
  }, [foodId]);

  const handleConsume = async () => {
    if (!food) return; // food가 null일 때 처리 방지
  
    try {
      console.log(`소비 요청: ${API_BASE_URL}/api/fooditems/quantity`, {
        foodItemId: food.foodId,
        quantityToUpdate: consumptionValue,
        consumptionType: 'CONSUMED',
      });
  
      const response = await axios.put(`${API_BASE_URL}/api/fooditems/quantity`, null, {
        params: {
          foodItemId: food.foodId,
          quantityToUpdate: consumptionValue,
          consumptionType: 'CONSUMED',
        },
      });
  
      console.log('소비 응답:', response);
  
      if (response.status === 200) {
        Alert.alert(
          '소비 완료',
          `${food.foodName} ${consumptionValue}개를 소비했습니다.`,
          [
            { text: '확인', onPress: () => navigation.navigate('FoodList', { refresh: true }) }
          ]
        );
  
        // 데이터 갱신을 위해 fetchFoodDetail() 호출
        await fetchFoodDetail();
      } else {
        console.log('오류 발생: 응답 상태가 200이 아님', response.status);
        Alert.alert('오류', '소비 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('소비 처리 오류:', error);
      Alert.alert('오류', '소비 처리 중 오류가 발생했습니다.');
    }
  };
  
  const handleDispose = async () => {
    if (!food) return; // food가 null일 때 처리 방지
  
    try {
      console.log(`폐기 요청: ${API_BASE_URL}/api/fooditems/quantity`, {
        foodItemId: food.foodId,
        quantityToUpdate: consumptionValue,
        consumptionType: 'DISCARDED',
      });
  
      const response = await axios.put(`${API_BASE_URL}/api/fooditems/quantity`, null, {
        params: {
          foodItemId: food.foodId,
          quantityToUpdate: consumptionValue,
          consumptionType: 'DISCARDED',
        },
      });
  
      console.log('폐기 응답:', response);
  
      if (response.status === 200) {
        Alert.alert(
          '폐기 완료',
          `${food.foodName} ${consumptionValue}개를 폐기했습니다.`,
          [
            { text: '확인', onPress: () => navigation.navigate('FoodList', { refresh: true }) }
          ]
        );
  
        // 데이터 갱신을 위해 fetchFoodDetail() 호출
        await fetchFoodDetail();
      } else {
        console.log('오류 발생: 응답 상태가 200이 아님', response.status);
        Alert.alert('오류', '폐기 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('폐기 처리 오류:', error);
      Alert.alert('오류', '폐기 처리 중 오류가 발생했습니다.');
    }
  };
  
  const handlePrepMethod = () => {
    if (food) {
      navigation.navigate('PrepMethod', { foodId: food.foodName });
    }
  };

  const handleStoreMethod = () => {
    if (food) {
      navigation.navigate('StoreMethod', { foodId: food.foodName });
    }
  };

  const quantity = parseFloat(food?.quantity);
  const isQuantityValid = !isNaN(quantity);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>식품 정보</Text>
      </View>
      {food ? (
        <>
          <View style={styles.foodInfoContainer}>
            <Image source={{ uri: placeholderImage }} style={styles.foodImage} />
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{food.foodName}</Text>
              <Text style={styles.foodExpiry}>유통기한: {food.expirationDate}</Text>
              <Text style={styles.foodQuantity}>갯수: {isQuantityValid ? food.quantity.toString() : '정보 없음'}</Text>
              <Text style={styles.foodPrice}>가격: {food.price !== '정보 없음' ? `${food.price}원` : '정보 없음'}</Text>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>소비/배출</Text>
            {isQuantityValid ? (
              <Slider
                value={consumptionValue}
                onValueChange={setConsumptionValue}
                minimumValue={0}
                maximumValue={quantity}
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
            <TouchableOpacity onPress={handleConsume} style={styles.actionButton}>
              <Text style={styles.buttonText}>소비 완료</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDispose} style={styles.actionButton}>
              <Text style={styles.buttonText}>음식물 배출</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>식품 관리 방법</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={handlePrepMethod} style={styles.actionButton}>
                <Text style={styles.buttonText}>손질 방법</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleStoreMethod} style={styles.actionButton}>
                <Text style={styles.buttonText}>보관 방법</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        <Text>식품 정보를 불러오는 중입니다...</Text>
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
