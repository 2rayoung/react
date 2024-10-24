import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import API_BASE_URL from '../constants/config'; // API_BASE_URL 가져오기

export default function PrepMethod({ route }) {
  // route 객체로부터 params를 안전하게 추출
  const { params } = route || {};
  const { foodId } = params || {};

  const [prepMethod, setPrepMethod] = useState('');
  const [loading, setLoading] = useState(true);

  // foodId를 사용할 수 있는지 확인 후 fetch 실행
  useEffect(() => {
    if (foodId) {
      console.log("Received foodId:", foodId); // foodId 확인을 위한 로그 추가
      fetchPrepMethod(foodId);  // 손질 방법 가져오기
    } else {
      console.warn("foodId is undefined. Check the navigation route for issues.");
      setLoading(false);
    }
  }, [foodId]);

  const fetchPrepMethod = async (name) => {
    try {
      // API 요청 URL에 이름을 쿼리 파라미터로 전달
      const url = `${API_BASE_URL}/api/recipes/handling?name=${encodeURIComponent(name)}`;

      const response = await fetch(url, {
        method: 'POST',  // POST 요청
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.text();
        setPrepMethod(result);  // 손질 방법 설정
      } else {
        const errorText = await response.text();
        console.log('오류 응답 내용:', errorText);  // 오류 응답 내용 로그 출력
        Alert.alert('오류', `손질 방법을 가져오는 중 문제가 발생했습니다. 상태 코드: ${response.status}, 오류 메시지: ${errorText}`);
      }
    } catch (error) {
      console.error('API 요청 오류:', error);
      Alert.alert('오류', '서버에 연결할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  if (!foodId) {
    return (
      <View style={styles.container}>
        <Text>유효하지 않은 음식 ID입니다.</Text>
      </View>
    );
  }

  if (!prepMethod) {
    return (
      <View style={styles.container}>
        <Text>손질 방법을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>손질 방법</Text>
      <Text style={styles.content}>{prepMethod}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
  },
});
