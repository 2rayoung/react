import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert, TouchableOpacity, Linking } from 'react-native';
import * as Device from 'expo-device';
import API_BASE_URL from '../constants/config';  // API_BASE_URL 가져오기

export default function CustomRecipeDetailScreen({ route }) {
  const { recipeTitle } = route.params; // 선택된 메뉴 이름을 받음
  const [loading, setLoading] = useState(true);
  const [recipeData, setRecipeData] = useState(null);
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    const fetchDeviceId = async () => {
      const id = Device.modelId || Device.osInternalBuildId || 'unknown-device';
      setDeviceId(id);
    };

    fetchDeviceId();
  }, []);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/recipes/by-name?name=${encodeURIComponent(recipeTitle)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recipe data');
        }

        const data = await response.json();
        setRecipeData(data); // 가져온 데이터 저장

        // 재료 목록을 파싱된 재료 목록에 넣기
        const initialIngredients = data["재료"]
          ? data["재료"].split(',').map(item => {
              const [name, amount] = item.trim().split(/\s+/); // 재료 이름과 양을 분리
              return [name, parseFloat(amount) || 1]; // 양이 없으면 기본값 1
            })
          : [];
          
      } catch (error) {
        console.error('Error fetching recipe data:', error);
        Alert.alert('오류', '레시피 정보를 가져오는 중 문제가 발생했습니다.');
      } finally {
        setLoading(false); // 로딩 상태 종료
      }
    };

    fetchRecipe();
  }, [recipeTitle]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View>
          {recipeData ? (
            <View>
              <Text style={styles.title}>{recipeData["요리"]}</Text>
              
              {/* 재료 출력 */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>재료:</Text>
                {recipeData["재료"] ? recipeData["재료"].split(',').map((ingredient, index) => (
                  <Text key={index} style={styles.recipeText}>{ingredient.trim()}</Text>
                )) : <Text style={styles.recipeText}>재료 정보가 없습니다.</Text>}
              </View>

              {/* 조리 방법 출력 */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>레시피:</Text>
                <Text style={styles.recipeText}>{recipeData["조리순서"] ? recipeData["조리순서"].replace(/(\d\.)/g, '\n$1').trim()
                : "조리 방법 정보가 없습니다."}</Text>
              </View>

              {/* 레시피 영상 보기 버튼 */}
              <TouchableOpacity style={[styles.button, styles.videoButton]} onPress={() => {
                const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(recipeTitle)}`;
                Linking.openURL(youtubeSearchUrl);
              }}>
                <Text style={styles.buttonText}>레시피 영상 보기</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text>레시피가 "{recipeTitle}"에 대해 발견되지 않았습니다.</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  recipeText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    flex: 1, // 텍스트 줄바꿈 적용을 위해 flex 추가
    flexWrap: 'wrap', // 긴 텍스트 자동 줄바꿈
  },
  button: {
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  videoButton: {
    backgroundColor: '#667080',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
