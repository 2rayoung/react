import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import API_BASE_URL from '../constants/config';  // 상대 경로로 수정
import * as Device from 'expo-device'; // Expo Device 모듈 가져오기

export default function RecipeByIngredientsScreen({ route, navigation }) {
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);
  const { fromMyIngredients } = route.params; // route에서 fromMyIngredients 값 가져오기

  useEffect(() => {
    const fetchRecipesByIngredients = async () => {
      const deviceId = Device.modelId || Device.osInternalBuildId || 'unknown-device'; // 디바이스 ID 가져오기

      try {
        const response = await fetch(`${API_BASE_URL}/api/recipes/recommendation/${deviceId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('레시피를 가져오는 데 실패했습니다.');
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setRecipes(data); // 레시피 목록 상태에 저장
        } else {
          throw new Error('레시피를 가져오는 데 실패했습니다. 유효한 데이터가 아닙니다.');
        }
      } catch (error) {
        console.error('레시피를 가져오는 중 오류 발생:', error);
        setError('레시피를 가져오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false); // 로딩 상태 종료
      }
    };

    fetchRecipesByIngredients();
  }, []);

  const handleRecipeSelect = (recipe) => {
    navigation.navigate('CustomRecipeDetailScreen', { recipeDetails: recipe, recipeTitle: recipe });
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>내 식재료로 추천된 레시피</Text>
      {recipes.length === 0 ? (
        <Text>추천된 레시피가 없습니다.</Text>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item, index) => index.toString()} // keyExtractor에 index 사용
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.recipeCard} onPress={() => handleRecipeSelect(item)}>
              {typeof item === 'string' ? (
                <Text style={styles.recipeTitle}>{item}</Text> // item이 문자열일 경우만 Text로 감싸기
              ) : (
                <Text style={styles.recipeTitle}>레시피 정보가 유효하지 않습니다.</Text>
              )}
            </TouchableOpacity>
          )}
        />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  recipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
});