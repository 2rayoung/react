import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Animatable from 'react-native-animatable';

SplashScreen.preventAutoHideAsync();

export default function SplashScreenComponent({ navigation }) {
  useEffect(() => {
    const prepare = async () => {
      try {
        // 3초 대기 시간 동안 스플래시 화면을 보여줍니다.
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (e) {
        console.warn(e);
      } finally {
        // 대기 후 스플래시 화면 숨기고, Main 화면으로 이동합니다.
        await SplashScreen.hideAsync();
        navigation.replace('Main');
      }
    };

    prepare();
  }, []);

  return (
    <View style={styles.container}>
      <Animatable.Image
        animation="bounceIn"
        duration={2000}
        source={require('../assets/LOGO4.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
  },
});
