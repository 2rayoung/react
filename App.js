import React from 'react';
import { Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Importing Screens
import AddFoodScreen from './container/AddFood';
import FoodDetailScreen from './container/FoodDetail';
import PrepMethodScreen from './container/PrepMethod';
import ReceiptInputScreen from './container/ReceiptInput';
import RecipeDetailScreen from './screens/RecipeDetailScreen';
import RecipeRecommendationScreen from './components/RecipeRecommendation';
import RecommendedListScreen from './components/RecommendedList';
import StatisticsScreen from './screens/Statistics';
import StoreMethodScreen from './container/StoreMethod';
import SplashScreenComponent from './screens/SplashScreen';
import RecipeSearchResultScreen from './screens/RecipeSearchResultScreen';
import CustomRecipeDetailScreen from './screens/CustomRecipeDetailScreen';
import RecipeByIngredientsScreen from './screens/RecipeByIngredientsScreen';
import FoodList from './components/FoodList';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Food List Stack Navigator
function FoodListStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="FoodList" 
        component={FoodList} 
        options={{ headerTitle: 'Food List' }}
      />
      <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
      <Stack.Screen name="AddFood" component={AddFoodScreen} />
      <Stack.Screen name="PrepMethod" component={PrepMethodScreen} />
      <Stack.Screen name="StoreMethod" component={StoreMethodScreen} />
      <Stack.Screen name="ReceiptInput" component={ReceiptInputScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
  );
}

// Recipe Recommendation Stack Navigator
function RecipeRecommendationStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="RecipeRecommendation" 
        component={RecipeRecommendationScreen}
        options={{
          title: 'Recipe Recommendation',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen name="RecommendedList" component={RecommendedListScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <Stack.Screen name="RecipeByIngredients" component={RecipeByIngredientsScreen} />
      <Stack.Screen name="SearchResults" component={RecipeSearchResultScreen} />
      <Stack.Screen name="CustomRecipeDetailScreen" component={CustomRecipeDetailScreen} />
    </Stack.Navigator>
  );
}

// Statistics Stack Navigator
function StatisticsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Statistics" 
        component={StatisticsScreen}
        options={{
          title: 'Statistics',
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
}

// Bottom Tab Navigator for main tabs
function MainTabs() {
  return (
    <Tab.Navigator initialRouteName="FoodListStack">
      <Tab.Screen 
        name="FoodListStack" 
        component={FoodListStack} 
        options={{
          tabBarIcon: ({ size }) => <Image source={require('./assets/menu4.png')} style={{ width: size, height: size }} />,
          tabBarLabel: 'Food List',
          headerShown: false,
        }} 
      />
      <Tab.Screen 
        name="RecipeRecommendationStack" 
        component={RecipeRecommendationStack} 
        options={{
          tabBarIcon: ({ size }) => <Image source={require('./assets/food.png')} style={{ width: size, height: size }} />,
          tabBarLabel: 'Recipes',
          headerShown: false,
        }} 
      />
      <Tab.Screen 
        name="StatisticsStack" 
        component={StatisticsStack} 
        options={{
          tabBarIcon: ({ size }) => <Image source={require('./assets/pie-chart.png')} style={{ width: size, height: size }} />,
          tabBarLabel: 'Statistics',
          headerShown: false,
        }} 
      />
    </Tab.Navigator>
  );
}

// Main App Component
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen 
          name="Splash" 
          component={SplashScreenComponent} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Main" 
          component={MainTabs} 
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
