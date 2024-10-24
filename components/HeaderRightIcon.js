import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HeaderRightIcon({ onSortByRegistration, onSortByExpiry }) {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation(); // 네비게이션 훅

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  return (
    <>
      <TouchableOpacity onPress={toggleModal} style={{ paddingRight: 10, paddingTop: 5 }}>
        <Image source={require('../assets/arrow.png')} style={{ width: 28, height: 28 }} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ width: 300, backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>메뉴</Text>
            <TouchableOpacity 
              onPress={() => { 
                onSortByRegistration(); 
                toggleModal(); 
              }}>
              <Text style={{ marginVertical: 10 }}>등록 순</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => { 
                onSortByExpiry(); 
                toggleModal(); 
              }}>
              <Text style={{ marginVertical: 10 }}>유통기한 순</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleModal}>
              <Text style={{ color: 'red', marginVertical: 10 }}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
