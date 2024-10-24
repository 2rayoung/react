import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import API_BASE_URL from '../constants/config';

export default function ReceiptInput({ visible, onClose, navigation }) {

  // 사진 촬영 함수
  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      processImage(result.assets[0].uri);
    } else {
      console.error('이미지 URI를 가져오지 못했습니다. 선택 결과:', result);
      Alert.alert('오류', '이미지 선택에 문제가 발생했습니다.');
    }
  };

  // 갤러리에서 사진 선택 함수
  const handleChooseFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      quality: 1,
    });

    console.log('갤러리 이미지 선택 결과:', result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      console.log('올바른 이미지 URI:', imageUri);
      processImage(imageUri);
    } else {
      console.error('이미지 URI를 가져오지 못했습니다. 선택 결과:', result);
      Alert.alert('오류', '이미지 선택에 문제가 발생했습니다.');
    }
  };

  const processImage = async (imageUri) => {
    console.log('이미지 URI:', imageUri);
  
    const formData = new FormData();
    formData.append('imageFile', {
      uri: imageUri,
      name: 'receipt.jpg',
      type: 'image/jpeg',
    });
  
    console.log('생성된 FormData:', formData);
  
    try {
      console.log('서버로 요청을 보냅니다: ', `${API_BASE_URL}/api/vision/extract-text`);
  
      const response = await fetch(`${API_BASE_URL}/api/vision/extract-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
  
      console.log('서버 응답 상태 코드:', response.status);
  
      // 응답이 200이어도 JSON 형식인지 확인하고 처리
      const responseText = await response.text();
      console.log('서버 응답 텍스트:', responseText);
  
      // 응답이 JSON 형식일 경우에만 JSON으로 파싱
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('서버 응답 데이터를 JSON으로 파싱:', result);
        navigation.navigate('AddFood', { extractedText: result });
      } catch (jsonError) {
        console.error('JSON 파싱 오류:', jsonError);
        Alert.alert('오류', '서버 응답을 처리하는 중 문제가 발생했습니다. 응답 내용: ' + responseText);
      }
    } catch (error) {
      console.error('이미지 처리 중 오류 발생:', error.message);
      Alert.alert('오류', '이미지 처리 중 문제가 발생했습니다. 네트워크 상태를 확인하세요.');
    } finally {
      onClose();
    }
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.label}>식품 추가</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleTakePhoto}
          >
            <Text style={styles.buttonText}>카메라</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={handleChooseFromGallery}
          >
            <Text style={styles.buttonText}>갤러리</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              onClose();
              navigation.navigate('AddFood', { mode: 'manualInput' });
            }}
          >
            <Text style={styles.buttonText}>직접 입력</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#667080',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeText: {
    color: 'red',
    marginVertical: 10,
  },
});
