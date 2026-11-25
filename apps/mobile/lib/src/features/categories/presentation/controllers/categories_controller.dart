import 'package:flutter/foundation.dart' show ChangeNotifier;
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/categories/domain/entities/category.dart';
import 'package:dolenae_mobile/src/features/categories/domain/repositories/category_repository.dart';

class CategoriesController extends ChangeNotifier {
  CategoriesController(this._repository)
    : _items = _repository.cachedItems ?? const [];
  final CategoryRepository _repository;
  List<Category> _items;
  List<Category> get items => _items;
  bool isLoading = false;
  AppFailure? error;
  bool _disposed = false;
  Future<Result<List<Category>>>? _pending;

  Future<Result<List<Category>>> load({bool refresh = false}) {
    if (_pending != null) {
      return refresh ? _pending!.then((_) => load(refresh: true)) : _pending!;
    }
    isLoading = true;
    error = null;
    notifyListeners();
    final operation = _load(refresh);
    _pending = operation;
    return operation;
  }

  Future<Result<List<Category>>> _load(bool refresh) async {
    final result = await _repository.load(refresh: refresh);
    if (_disposed) return result;
    switch (result) {
      case Success(:final value):
        _items = List.unmodifiable(value);
      case Failure(:final failure):
        error = failure;
        if (!_repository.hasCache && failure.code == 'CATEGORY_OFFLINE') {
          // Label saja: tanpa ID API, chip tidak boleh menyaring destinasi.
          _items = [
            for (final name in [
              'Gunung',
              'Bukit',
              'Danau',
              'Air terjun',
              'Camping',
            ])
              Category(id: '', name: name, slug: '', type: 'terrain'),
          ];
        }
    }
    isLoading = false;
    _pending = null;
    notifyListeners();
    return result;
  }

  @override
  void dispose() {
    _disposed = true;
    super.dispose();
  }
}
