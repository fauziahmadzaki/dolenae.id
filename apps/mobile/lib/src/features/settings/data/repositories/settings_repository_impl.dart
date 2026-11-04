import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/core/network/api_client.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/settings/domain/entities/feedback.dart';
import 'package:dolenae_mobile/src/features/settings/data/data_sources/settings_local_data_source.dart';
import 'package:dolenae_mobile/src/features/settings/data/data_sources/settings_seed_data_source.dart';
import 'package:dolenae_mobile/src/features/settings/domain/entities/app_settings.dart';
import 'package:dolenae_mobile/src/features/settings/domain/entities/faq_item.dart';
import 'package:dolenae_mobile/src/features/settings/domain/repositories/settings_repository.dart';

class SettingsRepositoryImpl implements SettingsRepository {
  SettingsRepositoryImpl({this.api, SettingsLocalDataSource? local});
  SettingsRepositoryImpl.demo()
    : api = null,
      isDemo = true,
      _settings = SettingsSeedData.settings,
      _faqs = List.of(SettingsSeedData.faqs);
  final ApiClient? api;
  @override
  bool isDemo = false;
  String? _userId;
  int _revision = 0;
  AppSettings _settings = const AppSettings(
    accountName: '',
    accountEmail: '',
    accountRole: '',
    memberSince: '',
  );
  List<FaqItem> _faqs = [];
  @override
  AppSettings get settings => _settings;
  @override
  List<FaqItem> get faqs => List.unmodifiable(_faqs);
  @override
  void setSession(String? userId) {
    if (_userId == userId) return;
    _userId = userId;
    _revision++;
    _settings = const AppSettings(
      accountName: '',
      accountEmail: '',
      accountRole: '',
      memberSince: '',
    );
  }

  AppSettings _parse(dynamic row) {
    final j = row as Map<String, dynamic>;
    final n = j['notifications'] as Map<String, dynamic>;
    final p = j['privacy'] as Map<String, dynamic>;
    return _settings.copyWith(
      theme: ThemePreference.values.byName(j['theme'] as String),
      language: LanguagePreference.values.byName(j['language'] as String),
      dataSaver: j['dataSaver'] as bool,
      notifications: NotificationPreferences(
        rekomendasi: n['rekomendasi'] as bool,
        pengingatRencana: n['pengingatRencana'] as bool,
        pengingatChecklist: n['pengingatChecklist'] as bool,
        fasilitasBaru: n['fasilitasBaru'] as bool,
        promo: n['promo'] as bool,
      ),
      privacy: PrivacySettings(
        profilPublik: p['profilPublik'] as bool,
        bagikanAktivitas: p['bagikanAktivitas'] as bool,
        analitik: p['analitik'] as bool,
      ),
    );
  }

  @override
  Future<Result<void>> load() => _run(() async {
    if (isDemo) return () {};
    final next = _parse((await api!.get('/users/me/settings'))['data']);
    return () {
      _settings = next;
    };
  });
  @override
  Future<Result<void>> loadFaqs() => _run(() async {
    if (isDemo) return () {};
    final rows = (await api!.get('/faqs'))['data'] as List;
    final next = rows.map((row) {
      final j = row as Map<String, dynamic>;
      return FaqItem(
        id: j['id'] as String,
        category: FaqCategory.values.byName(j['category'] as String),
        question: j['question'] as String,
        answer: j['answer'] as String,
      );
    }).toList();
    return () {
      _faqs = next;
    };
  }, public: true);
  Future<Result<void>> _update(Map<String, dynamic> body, AppSettings demo) =>
      _run(() async {
        final next = isDemo
            ? demo
            : _parse(
                (await api!.patch('/users/me/settings', body: body))['data'],
              );
        return () {
          _settings = next;
        };
      });
  @override
  Future<Result<void>> setTheme(ThemePreference theme) =>
      _update({'theme': theme.name}, _settings.copyWith(theme: theme));
  @override
  Future<Result<void>> setLanguage(LanguagePreference language) => _update({
    'language': language.name,
  }, _settings.copyWith(language: language));
  @override
  Future<Result<void>> setDataSaver(bool enabled) =>
      _update({'dataSaver': enabled}, _settings.copyWith(dataSaver: enabled));
  @override
  Future<Result<void>> setNotificationPreferences(NotificationPreferences n) =>
      _update({
        'notifications': {
          'rekomendasi': n.rekomendasi,
          'pengingatRencana': n.pengingatRencana,
          'pengingatChecklist': n.pengingatChecklist,
          'fasilitasBaru': n.fasilitasBaru,
          'promo': n.promo,
        },
      }, _settings.copyWith(notifications: n));
  @override
  Future<Result<void>> setPrivacyPreferences(PrivacySettings p) {
    if (p.twoFactor && !isDemo) {
      return Future.value(
        const Failure(
          ValidationFailure('Verifikasi dua langkah belum tersedia.'),
        ),
      );
    }
    return _update({
      'privacy': {
        'profilPublik': p.profilPublik,
        'bagikanAktivitas': p.bagikanAktivitas,
        'analitik': p.analitik,
      },
    }, _settings.copyWith(privacy: p));
  }

  @override
  Future<Result<void>> submitFeedback(FeedbackDraft draft) {
    if (draft.subject.trim().length < 3 ||
        draft.subject.trim().length > 160 ||
        draft.message.trim().length < 10 ||
        draft.message.trim().length > 5000 ||
        draft.rating < 0 ||
        draft.rating > 5) {
      return Future.value(
        const Failure(
          ValidationFailure(
            'Subjek 3-160 karakter, pesan 10-5000 karakter, rating 0-5.',
          ),
        ),
      );
    }
    return _run(() async {
      if (isDemo) {
        throw const ApiException('Pengiriman tidak tersedia pada mode demo.');
      }
      await api!.post(
        '/feedback',
        body: {
          'category': draft.category.name,
          'subject': draft.subject.trim(),
          'message': draft.message.trim(),
          'rating': draft.rating,
        },
      );
      return () {};
    });
  }

  Future<Result<void>> _run(
    Future<void Function()> Function() action, {
    bool public = false,
  }) async {
    final revision = _revision;
    if (!isDemo && (api == null || (!public && _userId == null))) {
      return const Failure(AuthFailure('Masuk untuk mengelola pengaturan.'));
    }
    try {
      final apply = await action();
      if (revision != _revision) {
        return const Failure(AuthFailure('Sesi berubah.'));
      }
      apply();
      return const Success(null);
    } on ApiException catch (e) {
      return Failure(e.toFailure());
    } catch (_) {
      return const Failure(
        UnknownFailure('Pengaturan tidak dapat dibaca atau disimpan.'),
      );
    }
  }
}
