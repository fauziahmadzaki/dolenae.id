import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/facilities/data/models/travel_support_model.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/travel_support.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/repositories/facility_repository.dart';

class FacilityRepositoryImpl implements FacilityRepository {
  // ponytail: konstruktor kosong hanya kompatibilitas; DI wajib menyuntik API/cache.
  const FacilityRepositoryImpl({this.api, this.preferences});
  final ApiClient? api;
  final SharedPreferences? preferences;
  static String cacheKey(String id) => 'facilities.v1.destination.$id';
  static String _detailKey(String id) => 'facilities.v1.support.$id';

  List<TravelSupport> _decode(List<dynamic> rows, String destinationId) {
    final items = rows.map((row) => TravelSupportModel.fromJson(Map<String, dynamic>.from(row as Map))).toList();
    if (items.any((item) => item.destinationId != destinationId) || items.map((e) => e.id).toSet().length != items.length) {
      throw const FormatException('Fasilitas tidak sesuai destinasi');
    }
    return List.unmodifiable(items);
  }

  @override
  Future<Result<List<TravelSupport>>> list(String destinationId) async {
    if (destinationId.isEmpty) return const Failure(ValidationFailure('Pilih destinasi terlebih dahulu.'));
    final client = api;
    if (client == null) return const Failure(NetworkFailure('Fasilitas belum tersedia.'));
    try {
      final rows = <dynamic>[];
      var page = 1;
      int? total;
      while (true) {
        final response = await client.get('/destinations/${Uri.encodeComponent(destinationId)}/supports', query: {'page': '$page', 'limit': '100'});
        final batch = response['data'] as List;
        final meta = response['meta'] as Map;
        final pages = meta['totalPages'] as int;
        final count = meta['total'] as int;
        if (meta['page'] != page || pages < page || count < 0 || (total != null && count != total) || meta['hasNext'] != (page < pages)) {
          throw const FormatException('Pagination fasilitas tidak valid');
        }
        total = count;
        rows.addAll(batch);
        if (page == pages) break;
        if (batch.isEmpty || page >= 10000) throw const FormatException('Halaman fasilitas tidak lengkap');
        page++;
      }
      if (rows.length != total) throw const FormatException('Jumlah fasilitas tidak lengkap');
      final items = _decode(rows, destinationId);
      try { await preferences?.setString(cacheKey(destinationId), jsonEncode(rows)); } catch (_) { /* Data API tetap sah. */ }
      return Success(items);
    } on ApiException catch (error) {
      if (error.statusCode == 404) {
        await _invalidateDestination(destinationId);
        return const Failure(NetworkFailure('Fasilitas tidak tersedia.', code: '404'));
      }
      if (error.statusCode == null || error.statusCode! >= 500) {
        final cached = _cached(destinationId);
        if (cached != null) return Success(cached);
      }
      return Failure(error.toFailure());
    } catch (_) {
      return const Failure(UnknownFailure('Data fasilitas tidak valid. Coba lagi.'));
    }
  }

  List<TravelSupport>? _cached(String destinationId) {
    try {
      final raw = preferences?.getString(cacheKey(destinationId));
      return raw == null ? null : _decode(jsonDecode(raw) as List, destinationId);
    } catch (_) { return null; }
  }
  Future<void> _invalidateDestination(String id) async {
    try {
      for (final item in _cached(id) ?? <TravelSupport>[]) { await preferences?.remove(_detailKey(item.id)); }
      await preferences?.remove(cacheKey(id));
    } catch (_) { /* Cache tidak dipakai setelah 404. */ }
  }
  @override
  Future<Result<TravelSupport>> getById(String id) async {
    if (id.isEmpty) return const Failure(ValidationFailure('Fasilitas tidak tersedia.'));
    final client = api;
    if (client == null) return const Failure(NetworkFailure('Fasilitas belum tersedia.'));
    try {
      final response = await client.get('/supports/${Uri.encodeComponent(id)}');
      final json = Map<String, dynamic>.from(response['data'] as Map);
      final item = TravelSupportModel.fromJson(json);
      if (item.id != id) throw const FormatException('ID tidak sesuai');
      try { await preferences?.setString(_detailKey(id), jsonEncode(json)); } catch (_) { /* Data API tetap sah. */ }
      return Success(item);
    } on ApiException catch (error) {
      if (error.statusCode == 404) {
        try {
          await preferences?.remove(_detailKey(id));
          for (final key in preferences?.getKeys().where((k) => k.startsWith('facilities.v1.destination.')) ?? <String>[]) {
            final destination = key.substring('facilities.v1.destination.'.length);
            if (_cached(destination)?.any((item) => item.id == id) ?? false) await preferences?.remove(key);
          }
        } catch (_) { /* Cache tidak dipakai setelah 404. */ }
        return const Failure(NetworkFailure('Fasilitas tidak tersedia.', code: '404'));
      }
      if (error.statusCode == null || error.statusCode! >= 500) {
        try {
          final raw = preferences?.getString(_detailKey(id));
          if (raw != null) {
            final item = TravelSupportModel.fromJson(Map<String, dynamic>.from(jsonDecode(raw) as Map));
            if (item.id == id) return Success(item);
          }
        } catch (_) { /* Cache rusak tidak dipakai. */ }
      }
      return Failure(error.toFailure());
    } catch (_) { return const Failure(UnknownFailure('Data fasilitas tidak valid. Coba lagi.')); }
  }
}
