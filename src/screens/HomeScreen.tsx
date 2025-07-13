import React from 'react';
import { View, Text, Button } from 'react-native';
import { clearUser } from '../utils/storage';

const HomeScreen = ({ navigation }) => {
  const handleLogout = async () => {
    await clearUser();
    navigation.replace('Login');
  };

  return (
    <View style={{ padding: 16 }}>
      <Text>Home Screen</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default HomeScreen;
