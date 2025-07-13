import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackgroundImg from '../assets/img/blue-flower-field-digital-art-2k-wallpaper-uhdpaper.com-161@2@a.jpg';

const initData = {
  nama_user: '',
  password: '',
};

const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const [dataInput, setDataInput] = useState(initData);
  const [csrfToken, setCsrfToken] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const showPopup = (message) => {
    setPopupMessage(message);
    setPopupVisible(true);
  };

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/androidauth/login`);
        if (res.data.status === 'ready') {
          setCsrfToken(res.data.csrf_token);
        } else {
          showPopup('Gagal mendapatkan token');
        }
      } catch (error) {
        console.log('Gagal mengambil CSRF Token:', error);
        showPopup('Terjadi kesalahan saat mengambil token');
      } finally {
        setLoadingPage(false);
      }
    };

    fetchToken();
  }, []);

  const handleChange = (key, value) => {
    setDataInput((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogin = async () => {
    if (!dataInput.nama_user || !dataInput.password) {
      showPopup('Nama user dan password harus diisi!');
      return;
    }
    if (!csrfToken) {
      showPopup('Token belum tersedia');
      return;
    }

    setLoadingLogin(true);

    const dataSave = {
      ...dataInput,
      csrf_token: csrfToken,
    };

    console.log('🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️', dataSave)

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
        showPopup(response.message || 'Login gagal');
      }
    } catch (err) {
      console.log('Login error:', err);
      showPopup('Tidak dapat terhubung ke server');
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <ImageBackground
      source={BackgroundImg}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          {loadingPage ? (
            <ActivityIndicator size="large" color="#ffffff" />
          ) : (
            <>
              <Text style={styles.title}>Masuk Akun</Text>

              <TextInput
                value={dataInput.nama_user}
                onChangeText={(text) => handleChange('nama_user', text)}
                placeholder="Masukkan nama user"
                placeholderTextColor="#ccc"
                style={styles.input}
                autoCapitalize="none"
              />

              <TextInput
                value={dataInput.password}
                onChangeText={(text) => handleChange('password', text)}
                placeholder="Masukkan password"
                placeholderTextColor="#ccc"
                secureTextEntry
                style={styles.input}
              />

              {loadingLogin ? (
                <ActivityIndicator size="small" color="#fff" style={{ marginTop: 12 }} />
              ) : (
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                  <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </KeyboardAvoidingView>

        <Modal transparent animationType="fade" visible={popupVisible} onRequestClose={() => setPopupVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={{ fontSize: 16 }}>{popupMessage}</Text>
              <TouchableOpacity onPress={() => setPopupVisible(false)} style={styles.modalButton}>
                <Text style={{ color: '#007AFF', fontWeight: '600' }}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    color: '#f1f5f9',
    fontWeight: '700',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: '#f1f5f9',
    padding: 14,
    marginBottom: 16,
    borderRadius: 8,
    borderColor: '#94a3b8',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    width: '100%',
    maxWidth: 320,
  },
  modalButton: {
    alignSelf: 'flex-end',
    marginTop: 16,
  },
});
