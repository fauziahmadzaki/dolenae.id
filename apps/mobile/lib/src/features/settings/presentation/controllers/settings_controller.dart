import 'package:flutter/foundation.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/settings/domain/entities/feedback.dart';

import 'package:dolenae_mobile/src/features/settings/domain/entities/app_settings.dart';
import 'package:dolenae_mobile/src/features/settings/domain/entities/faq_item.dart';
import 'package:dolenae_mobile/src/features/settings/domain/repositories/settings_repository.dart';

/// Settings controller; every change is persisted by the repository.
class SettingsController extends ChangeNotifier {
  SettingsController(this._repository);

  final SettingsRepository _repository;
  int _revision = 0;
  String? _userId;
  bool _disposed = false;
  bool isLoading = false;
  AppFailure? failure;
  bool get isDemo => _repository.isDemo;
  void setSession(String? userId) {
    if (_disposed || _userId == userId) return;
    _userId = userId;
    _revision++;
    _repository.setSession(userId);
    isLoading = false;
    failure = null;
    notifyListeners();
  }

  Future<Result<void>> load() => _run(_repository.load);
  Future<Result<void>> loadFaqs() => _run(_repository.loadFaqs);
  Future<Result<void>> submitFeedback(FeedbackDraft draft) =>
      _run(() => _repository.submitFeedback(draft));
  Future<Result<void>> _run(Future<Result<void>> Function() action) async {
    if (_disposed || isLoading) {
      return const Failure(ValidationFailure('Tunggu proses sebelumnya selesai.'));
    }
    final revision = _revision;
    isLoading = true;
    failure = null;
    notifyListeners();
    final result = await action();
    if (_disposed || revision != _revision) {
      return const Failure(AuthFailure('Sesi berubah.'));
    }
    if (revision == _revision) {
      isLoading = false;
      failure = result.failureOrNull;
      notifyListeners();
    }
    return result;
  }

  AppSettings get settings => _repository.settings;

  List<FaqItem> get faqs => _repository.faqs;

  Future<Result<void>> setTheme(ThemePreference theme) =>
      _run(() => _repository.setTheme(theme));

  Future<Result<void>> setLanguage(LanguagePreference language) =>
      _run(() => _repository.setLanguage(language));

  Future<Result<void>> setDataSaver(bool enabled) =>
      _run(() => _repository.setDataSaver(enabled));

  Future<Result<void>> setNotificationPreference({
    bool? rekomendasi,
    bool? pengingatRencana,
    bool? pengingatChecklist,
    bool? fasilitasBaru,
    bool? promo,
  }) {
    final current = settings.notifications;
    return _run(
      () => _repository.setNotificationPreferences(
        current.copyWith(
          rekomendasi: rekomendasi,
          pengingatRencana: pengingatRencana,
          pengingatChecklist: pengingatChecklist,
          fasilitasBaru: fasilitasBaru,
          promo: promo,
        ),
      ),
    );
  }

  Future<Result<void>> setPrivacyPreference({
    bool? twoFactor,
    bool? profilPublik,
    bool? bagikanAktivitas,
    bool? analitik,
  }) {
    if (twoFactor != null) {
      return Future.value(const Failure(
        ValidationFailure('Verifikasi dua langkah belum tersedia.'),
      ));
    }
    final current = settings.privacy;
    return _run(
      () => _repository.setPrivacyPreferences(
        current.copyWith(
          twoFactor: twoFactor,
          profilPublik: profilPublik,
          bagikanAktivitas: bagikanAktivitas,
          analitik: analitik,
        ),
      ),
    );
  }
  @override
  void dispose() {
    _disposed = true;
    _revision++;
    super.dispose();
  }
}