import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const initData = {
  nama_user: '',
  password: '',
};

const LoginScreen = ({ navigation }) => {
  const [dataInput, setDataInput] = useState(initData);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/androidauth/login`);
        if (res.data.status === 'ready') {
          setCsrfToken(res.data.csrf_token);
          console.log('CSRF Token:', res.data.csrf_token);
        } else {
          Alert.alert('Gagal', 'Gagal mendapatkan token');
        }
      } catch (error) {
        console.log('Gagal mengambil CSRF Token:', error);
      }
    };

    fetchToken();
  }, []);

  const handleChange = (key: string, value: string) => {
    setDataInput((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogin = async () => {
    if (!dataInput.nama_user || !dataInput.password) {
      Alert.alert('Peringatan', 'Nama user dan password harus diisi!');
      return;
    }
    if (!csrfToken) {
      Alert.alert('Gagal', 'Token belum tersedia');
      return;
    }

    const dataSave = {
      ...dataInput,
      csrf_token: csrfToken
    };

    console.log('Data yang akan dikirim ke server:');
    console.log(JSON.stringify(dataSave, null, 2));

    try {
      const res = await axios.post(`${API_BASE_URL}/androidauth/login`, dataSave, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = res.data;

      if (response.status === 'success') {
        await AsyncStorage.setItem('user', JSON.stringify(response.data));
        navigation.replace('Home');
      } else {
        Alert.alert('Login Gagal', response.message || 'Terjadi kesalahan');
      }
    } catch (err) {
      console.log('Login error:', err);
      Alert.alert('Error', 'Tidak dapat terhubung ke server');
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text>Nama User:</Text>
      <TextInput
        value={dataInput.nama_user}
        onChangeText={(text) => handleChange('nama_user', text)}
        placeholder="Masukkan nama user"
        style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
      />

      <Text>Password:</Text>
      <TextInput
        value={dataInput.password}
        onChangeText={(text) => handleChange('password', text)}
        placeholder="Masukkan password"
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
      />

      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

export default LoginScreen;
