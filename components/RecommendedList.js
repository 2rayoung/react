// 인기 레시피 클릭 시 메뉴 추천 화면
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import API_BASE_URL from '../constants/config'; // 경로 수정: `../constants/config`에서 API_BASE_URL 가져옴

const BACKEND_API_URL = `${API_BASE_URL}/api/recipes/top`;  // 인기 레시피 목록
const RECIPE_DETAILS_API_URL = `${API_BASE_URL}/api/recipes/details`;  // 레시피 세부 정보

export default function RecommendedListScreen({ route, navigation }) {
  const { type = '인기 레시피' } = route.params || {};  // 기본값 설정
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 백엔드에서 레시피 데이터를 가져오는 함수
    const fetchRecipes = async () => {
      try {
        const response = await fetch(BACKEND_API_URL);  // 백엔드 API 호출
        const data = await response.json();  // JSON 데이터로 변환

        setRecipes(data);  // 가져온 데이터를 상태에 저장
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setLoading(false);  // 로딩 상태 종료
      }
    };

    fetchRecipes();
  }, [type]);

  const handlePress = async (recipe) => {
    try {
      const response = await fetch(`${RECIPE_DETAILS_API_URL}?link=${encodeURIComponent(recipe.link)}`);
      const details = await response.text();  // 백엔드에서 받은 문자열 데이터를 텍스트로 변환

      // RecipeDetailScreen으로 이동하고 레시피 정보와 메뉴 이름(title)을 전달
      navigation.navigate('RecipeDetail', { recipeDetails: details, recipeTitle: recipe.title });
    } catch (error) {
      console.error('Error fetching recipe details:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{type}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={recipes}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.recipeItem} onPress={() => handlePress(item)}>
              <Text style={styles.recipeText}>
                {typeof item.title === 'string' ? item.title : '레시피 이름 없음'}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.title}  // title을 키로 사용
          style={styles.recipeList}
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
    marginBottom: 16,
    textAlign: 'center',
  },
  recipeList: {
    marginTop: 16,
  },
  recipeItem: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  recipeText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
});
