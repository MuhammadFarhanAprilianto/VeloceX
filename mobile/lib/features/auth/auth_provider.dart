import 'package:flutter/foundation.dart';
import '../../core/api/api_client.dart';
import '../../core/storage/secure_storage_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiClient api;
  final SecureStorageService storage;

  Map<String, dynamic>? _user;
  bool _isAuthenticated = false;
  bool _isLoading = false;
  String? _error;

  AuthProvider({ApiClient? api, SecureStorageService? storage})
      : api = api ?? ApiClient(),
        storage = storage ?? SecureStorageService();

  Map<String, dynamic>? get user => _user;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> checkAuthStatus() async {
    final token = await storage.getAccessToken();
    _isAuthenticated = token != null;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final res = await api.post('/auth/login', body: {
        'email': email,
        'password': password,
      }, requiresAuth: false);

      _user = res['user'];
      await storage.saveTokens(
        accessToken: res['access_token'],
        refreshToken: res['refresh_token'],
      );

      _isAuthenticated = true;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String name, String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final res = await api.post('/auth/register', body: {
        'name': name,
        'email': email,
        'password': password,
      }, requiresAuth: false);

      _user = res['user'];
      await storage.saveTokens(
        accessToken: res['access_token'],
        refreshToken: res['refresh_token'],
      );

      _isAuthenticated = true;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await storage.clearTokens();
    _user = null;
    _isAuthenticated = false;
    notifyListeners();
  }
}
