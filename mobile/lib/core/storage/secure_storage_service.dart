import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  static const _accessTokenKey = 'velocex_access_token';
  static const _refreshTokenKey = 'velocex_refresh_token';

  final FlutterSecureStorage _storage;

  // In-memory fallback
  final Map<String, String> _memoryCache = {};

  SecureStorageService([FlutterSecureStorage? storage])
      : _storage = storage ?? const FlutterSecureStorage();

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    _memoryCache[_accessTokenKey] = accessToken;
    _memoryCache[_refreshTokenKey] = refreshToken;
    try {
      await _storage.write(key: _accessTokenKey, value: accessToken);
      await _storage.write(key: _refreshTokenKey, value: refreshToken);
    } catch (_) {}
  }

  Future<String?> getAccessToken() async {
    if (_memoryCache.containsKey(_accessTokenKey)) {
      return _memoryCache[_accessTokenKey];
    }
    try {
      final token = await _storage.read(key: _accessTokenKey);
      if (token != null) _memoryCache[_accessTokenKey] = token;
      return token;
    } catch (_) {
      return null;
    }
  }

  Future<String?> getRefreshToken() async {
    if (_memoryCache.containsKey(_refreshTokenKey)) {
      return _memoryCache[_refreshTokenKey];
    }
    try {
      final token = await _storage.read(key: _refreshTokenKey);
      if (token != null) _memoryCache[_refreshTokenKey] = token;
      return token;
    } catch (_) {
      return null;
    }
  }

  Future<void> clearTokens() async {
    _memoryCache.clear();
    try {
      await _storage.delete(key: _accessTokenKey);
      await _storage.delete(key: _refreshTokenKey);
    } catch (_) {}
  }
}
