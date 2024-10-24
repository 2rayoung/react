import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Image, RefreshControl } from 'react-native';
import Slider from '@react-native-community/slider';
import axios from 'axios';
import ReceiptInput from '../container/ReceiptInput'; // 모달 컴포넌트 import (수정된 경로)
import HeaderRightIcon from '../components/HeaderRightIcon'; // HeaderRightIcon 컴포넌트 import (수정된 경로)
import API_BASE_URL from '../constants/config'; // API URL (수정된 경로)
import * as Device from 'expo-device'; // expo-device import
import { Swipeable } from 'react-native-gesture-handler'; // Swipeable import
import SettingsModal from '../container/SettingsModal'; // 설정 모달 컴포넌트 가져오기 (수정된 경로)


const placeholderImage = 'https://via.placeholder.com/150'; // 기본 Placeholder 이미지 URL

export default function FoodList({ route, navigation }) {
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]); // 필터링된 식품 목록 상태 추가
  const [checkedFoods, setCheckedFoods] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [deviceId, setDeviceId] = useState(''); // 사용자 디바이스 ID 상태 추가
  const [refreshing, setRefreshing] = useState(false); // 새로고침 상태 추가
  const [settingsModalVisible, setSettingsModalVisible] = useState(false); // 설정 모달 상태 추가
  const [consumptionValue, setConsumptionValue] = useState(0);
  const [foodDetail, setFoodDetail] = useState(null); // 선택된 식품의 상세 정보

  // 사용자 디바이스 ID 가져오기
  useEffect(() => {
    const getDeviceId = () => {
      const id = Device.modelId || Device.osInternalBuildId || 'unknown-device'; // 디바이스 ID 가져오기
      setDeviceId(id); // 상태 업데이트
    };

    getDeviceId();
  }, []);

  // 보관 방법별로 데이터 가져오기
  const fetchFoodData = async (storageMethod = 'all') => {
    try {
      let url = `${API_BASE_URL}/api/fooditems/${deviceId}`;
      if (storageMethod !== 'all') {
        url = `${API_BASE_URL}/api/fooditems/${deviceId}/storage/${storageMethod}`;
      }

      const response = await axios.get(url);

      if (response.status === 200) {
        setFoods(response.data);
        setFilteredFoods(response.data); // 초기 데이터로 필터링 목록 설정
      } else {
        Alert.alert('오류', '식품 데이터를 가져오는 데 실패했습니다.');
      }
    } catch (error) {
      console.error('식품 데이터를 가져오는 중 오류 발생:', error);
      Alert.alert('오류', '서버에 연결하는 데 실패했습니다.');
    }
  };

  // 디바이스 ID가 설정된 후 데이터 가져오기
  useEffect(() => {
    if (deviceId) {
      fetchFoodData();
    }
  }, [deviceId]);

  // 새로고침 핸들러 추가
  const onRefresh = async () => {
    setRefreshing(true); // 새로고침 상태 설정
    await fetchFoodData(); // 데이터를 다시 가져옴
    setRefreshing(false); // 새로고침 상태 해제
  };

  // 필터 버튼을 누를 때 보관 방법에 맞는 데이터를 가져옴
  const handleFilterChange = (storageMethod) => {
    setFilter(storageMethod);
    fetchFoodData(storageMethod);
  };

  // 필터와 검색어에 따라 음식 목록 필터링
  const applyFilterAndSearch = () => {
    let filtered = foods;

    if (filter !== 'all') {
      filtered = filtered.filter((food) => food.storageMethod === filter);
    }

    if (search) {
      filtered = filtered.filter((food) =>
        food.foodName.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredFoods(filtered);
  };

  useEffect(() => {
    applyFilterAndSearch();
  }, [filter, search, foods]); // 필터와 검색어에 따라 필터링된 목록 업데이트

  // 새로 추가된 재료를 목록에 반영하는 함수
  const handleNewFoodAdded = (newFood) => {
    setFoods((prevFoods) => [...prevFoods, newFood]); // 새로운 재료를 기존 목록에 추가
    setFilteredFoods((prevFoods) => [...prevFoods, newFood]); // 필터링된 목록에도 추가
  };

  useEffect(() => {
    if (route.params?.newFood) {
      const newFoods = route.params.newFood;
      
      // 새로 추가된 식품이 배열인지 확인
      console.log("New food added:", newFoods);

      if (Array.isArray(newFoods) && newFoods.length > 0) {
        // 배열의 모든 항목을 기존 식품 목록에 추가
        setFoods((prevFoods) => [...prevFoods, ...newFoods]); 
        setFilteredFoods((prevFiltered) => [...prevFiltered, ...newFoods]); 
      } else {
        console.warn("Invalid food data:", newFoods);
      }
    }
  }, [route.params?.newFood]);

  // 체크박스 상태 토글
  const toggleCheckbox = (foodId) => {
    if (checkedFoods.includes(foodId)) {
      setCheckedFoods(checkedFoods.filter((id) => id !== foodId));
    } else {
      setCheckedFoods([...checkedFoods, foodId]);
    }
  };

  // 선택한 항목들을 삭제하는 함수
  const handleDeleteChecked = async () => {
    try {
      for (const foodId of checkedFoods) {
        await axios.delete(`${API_BASE_URL}/api/fooditems/delete?foodItemId=${foodId}`);
      }
      Alert.alert('성공', '선택된 식품들이 삭제되었습니다.');
      setCheckedFoods([]); // 체크박스 초기화
      fetchFoodData(); // 삭제 후 목록 다시 불러오기
    } catch (error) {
      console.error('삭제 중 오류 발생:', error);
      Alert.alert('오류', '식품 삭제에 실패했습니다.');
    }
  };

  // 개별 항목 삭제 함수
  const handleDelete = async (foodId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/fooditems/delete?foodItemId=${foodId}`);
      Alert.alert('성공', '식품이 삭제되었습니다.');
      fetchFoodData(); // 삭제 후 목록 다시 불러오기
    } catch (error) {
      console.error('삭제 중 오류 발생:', error);
      Alert.alert('오류', '식품 삭제에 실패했습니다.');
    }
  };

  // 슬라이드 액션을 위한 renderRightActions
  const renderRightActions = (foodId) => (
    <TouchableOpacity onPress={() => handleDelete(foodId)} style={styles.deleteButtonContainer}>
      <Text style={styles.deleteButtonText}>삭제</Text>
    </TouchableOpacity>
  );

  // 설정 모달 열기/닫기 함수
  const toggleSettingsModal = () => {
    setSettingsModalVisible(!settingsModalVisible);
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={toggleSettingsModal}>
          <Image
            source={require('../assets/bell-icon.png')}
            style={{ width: 24, height: 24, marginRight: 1 }}
          />
        </TouchableOpacity>
      ),
      headerRightContainerStyle: {
        paddingRight: 10, 
      },
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>조회</Text>
      </View>

      {/* 검색 바 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="검색"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* 필터 버튼 */}
      <View style={styles.filterButtons}>
        <TouchableOpacity onPress={() => handleFilterChange('all')} style={[styles.filterButton, filter === 'all' && styles.selected]}>
          <Text style={styles.filterButtonText}>전체</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleFilterChange('REFRIGERATOR')} style={[styles.filterButton, filter === 'REFRIGERATOR' && styles.selected]}>
          <Text style={styles.filterButtonText}>냉장</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleFilterChange('FREEZER')} style={[styles.filterButton, filter === 'FREEZER' && styles.selected]}>
          <Text style={styles.filterButtonText}>냉동</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleFilterChange('ROOM_TEMPERATURE')} style={[styles.filterButton, filter === 'ROOM_TEMPERATURE' && styles.selected]}>
          <Text style={styles.filterButtonText}>실온</Text>
        </TouchableOpacity>

        {/* 정렬 버튼 (위아래 화살표) */}
        <HeaderRightIcon
          onSortByExpiry={() => {
            const sorted = [...filteredFoods].sort(
              (a, b) => new Date(a.expirationDate) - new Date(b.expirationDate)
            );
            setFilteredFoods(sorted);
          }}
          onSortByRegistration={() => {
            const sorted = [...filteredFoods].sort((a, b) => a.foodId - b.foodId);
            setFilteredFoods(sorted);
          }}
        />
      </View>

      {/* 음식 목록 */}
      <FlatList
        data={filteredFoods}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> // 새로고침 추가
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>식품이 없습니다.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Swipeable renderRightActions={() => renderRightActions(item.foodId)}>
            <View style={styles.foodItem}>
              {/* 체크박스 */}
              <TouchableOpacity onPress={() => toggleCheckbox(item.foodId)}>
                <View style={styles.checkbox}>
                  {checkedFoods.includes(item.foodId) ? (
                    <Text style={styles.checked}>✔️</Text>
                  ) : (
                    <Text style={styles.unchecked}>⬜</Text>
                  )}
                </View>
              </TouchableOpacity>

              {/* 식품 정보 */}
              <TouchableOpacity
                onPress={() => navigation.navigate('FoodDetail', { foodId: item.foodId })}
                style={styles.foodInfoContainer}
              >
                <Image
                  source={{ uri: item.image || placeholderImage }}
                  style={styles.foodImage}
                />
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName}>{item.foodName || '식품 이름 없음'}</Text>
                  <Text style={styles.foodExpiry}>유통기한: {item.expirationDate || '정보 없음'}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </Swipeable>
        )}
        keyExtractor={(item) => item.foodId ? item.foodId.toString() : Math.random().toString()}
        contentContainerStyle={{ paddingBottom: 100 }} // 여유 공간 추가
        style={styles.foodList}
      />

      {/* 모달 열기 버튼 */}
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* 삭제 버튼 */}
      {checkedFoods.length > 0 && (
        <TouchableOpacity style={styles.deleteCheckedButton} onPress={handleDeleteChecked}>
          <Text style={styles.confirmButtonText}>삭제</Text>
        </TouchableOpacity>
      )}

      {/* 모달 컴포넌트 */}
      <ReceiptInput
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onFoodAdded={handleNewFoodAdded}
        navigation={navigation}
      />

      {/* 설정 모달 */}
      <SettingsModal
        modalVisible={settingsModalVisible}
        toggleModal={toggleSettingsModal} // 모달 열기/닫기 함수 연결
        navigation={navigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginTop: -5,
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 5,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  filterButton: {
    flex: 0.2,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: '#667080',
  },
  filterButtonText: {
    color: '#fff',
  },
  foodList: {
    flex: 1,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomColor: 'grey',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  checkbox: {
    width: 24,
    height: 24,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    fontSize: 18,
    color: '#667080',
  },
  unchecked: {
    fontSize: 18,
    color: '#ccc',
  },
  foodInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  foodImage: {
    width: 54,
    height: 56,
    marginRight: 16,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  foodExpiry: {
    fontSize: 12,
    color: '#888',
  },
  deleteButtonContainer: {
    backgroundColor: '#DE1010',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '90%',
    borderRadius: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    right: 22,
    bottom: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667080',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // 버튼이 목록 위로 오도록 설정
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  deleteCheckedButton: {
    backgroundColor: '#DE1010',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
});
