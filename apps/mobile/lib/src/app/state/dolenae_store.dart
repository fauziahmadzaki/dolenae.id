import 'package:flutter/foundation.dart';

import '../../data/models/ai_recommendation.dart';
import '../../data/models/app_notification.dart';
import '../../data/models/app_settings.dart';
import '../../data/models/destination.dart';
import '../../data/models/facility_proposal.dart';
import '../../data/models/saved_item.dart';
import '../../data/models/search_filter.dart';
import '../../data/seed/seed_data.dart';

/// State bersama lintas layar (Provider).
///
/// Menyatukan lima hal yang tidak bisa ditangani state lokal layar:
///
/// 1. Alur AI: preferensi di `/ai/preferences` dipakai `/ai/results`.
/// 2. Notifikasi: tandai sudah dibaca meng seluruh aplikasi.
/// 3. Empat daftar tersimpan: destinasi, rencana, checklist, usulan.
/// 4. Setelan: tema, bahasa, hemat data, notifikasi, privasi.
/// 5. Pencarian: kueri dan filter di `/explore` beserta bottom sheet-nya.
///
/// Data awal masih berasal dari `SeedData` (mode statis). Saat backend siap,
/// pemanggil repository dapat menginisialisasi ulang lewat [replaceAll].
class DolenaeStore extends ChangeNotifier {
  DolenaeStore()
    : _notifications = List.of(SeedData.notifications),
      _savedDestinations = List.of(SeedData.savedDestinations),
      _savedPlans = List.of(SeedData.savedPlans),
      _savedChecklists = List.of(SeedData.savedChecklists),
      _proposals = List.of(SeedData.proposals),
      _settings = SeedData.settings,
      _searchHistory = List.of(SeedData.searchHistory);

  // --- Notifikasi ---------------------------------------------------------

  final List<AppNotification> _notifications;

  List<AppNotification> get notifications =>
      List<AppNotification>.unmodifiable(_notifications);

  List<AppNotification> get todayNotifications => _notifications
      .where((notification) => notification.isToday)
      .toList();

  List<AppNotification> get earlierNotifications => _notifications
      .where((notification) => !notification.isToday)
      .toList();

  int get unreadCount =>
      _notifications.where((notification) => !notification.read).length;

  void markNotificationRead(String id) {
    final index = _notifications.indexWhere((item) => item.id == id);
    if (index == -1 || _notifications[index].read) return;
    _notifications[index] = _notifications[index].copyWith(read: true);
    notifyListeners();
  }

  void markAllNotificationsRead() {
    var changed = false;
    for (var i = 0; i < _notifications.length; i++) {
      if (!_notifications[i].read) {
        _notifications[i] = _notifications[i].copyWith(read: true);
        changed = true;
      }
    }
    if (changed) notifyListeners();
  }

  // --- Daftar tersimpan ---------------------------------------------------

  final List<SavedDestination> _savedDestinations;

  final List<SavedTripPlan> _savedPlans;

  final List<SavedChecklist> _savedChecklists;

  final List<FacilityProposal> _proposals;

  List<SavedDestination> get savedDestinations =>
      List<SavedDestination>.unmodifiable(_savedDestinations);

  List<SavedTripPlan> get savedPlans =>
      List<SavedTripPlan>.unmodifiable(_savedPlans);

  List<SavedChecklist> get savedChecklists =>
      List<SavedChecklist>.unmodifiable(_savedChecklists);

  List<FacilityProposal> get proposals =>
      List<FacilityProposal>.unmodifiable(_proposals);

  bool isDestinationSaved(String destinationId) =>
      _savedDestinations.any((item) => item.destination.id == destinationId);

  void toggleSavedDestination(Destination destination) {
    final index = _savedDestinations.indexWhere(
      (item) => item.destination.id == destination.id,
    );
    if (index != -1) {
      _savedDestinations.removeAt(index);
    } else {
      _savedDestinations.insert(
        0,
        SavedDestination(
          id: 'save-${destination.id}',
          destination: destination,
          savedAt: DateTime.now(),
        ),
      );
    }
    notifyListeners();
  }

  void removeSavedDestination(String destinationId) {
    _savedDestinations.removeWhere(
      (item) => item.destination.id == destinationId,
    );
    notifyListeners();
  }

  void removeSavedPlan(String planId) {
    _savedPlans.removeWhere((item) => item.id == planId);
    notifyListeners();
  }

  void archiveSavedPlan(String planId) {
    final index = _savedPlans.indexWhere((item) => item.id == planId);
    if (index == -1) return;
    final plan = _savedPlans[index];
    _savedPlans[index] = SavedTripPlan(
      id: plan.id,
      name: plan.name,
      dateRange: plan.dateRange,
      destinationCount: plan.destinationCount,
      destinationTotal: plan.destinationTotal,
      status: plan.status == SavedPlanStatus.aktif
          ? SavedPlanStatus.arsip
          : SavedPlanStatus.aktif,
      savedAt: plan.savedAt,
    );
    notifyListeners();
  }

  void removeSavedChecklist(String checklistId) {
    _savedChecklists.removeWhere((item) => item.id == checklistId);
    notifyListeners();
  }

  void addProposal(FacilityProposal proposal) {
    _proposals.insert(0, proposal);
    notifyListeners();
  }

  // --- Rekomendasi AI ------------------------------------------------------

  AiPreference _aiPreference = SeedData.demoAiPreference;

  AiResult? _aiResult;

  AiPreference get aiPreference => _aiPreference;

  /// Hasil rekomendasi terakhir; null sampai [runRecommendation] dipanggil.
  AiResult? get aiResult => _aiResult;

  void updateAiPreference(AiPreference preference) {
    _aiPreference = preference;
    notifyListeners();
  }

  /// Menghasilkan rekomendasi dari preferensi saat ini.
  ///
  /// Mode statis selalu memakai [SeedData.demoAiResult]; logika penilaian
  /// akan pindah ke server setelah `api-contract` dan
  /// `ai-recommendation` terdefinisi.
  AiResult runRecommendation() {
    final seed = SeedData.demoAiResult;
    _aiResult = AiResult(
      preference: _aiPreference,
      summary: seed.summary,
      relatedChecklist: seed.relatedChecklist,
      items: seed.items,
    );
    notifyListeners();
    return _aiResult!;
  }

  void resetAiRecommendation() {
    if (_aiResult == null) return;
    _aiResult = null;
    notifyListeners();
  }

  // --- Setelan ------------------------------------------------------------

  AppSettings _settings;

  AppSettings get settings => _settings;

  void setTheme(ThemePreference theme) {
    _settings = _settings.copyWith(theme: theme);
    notifyListeners();
  }

  void setLanguage(LanguagePreference language) {
    _settings = _settings.copyWith(language: language);
    notifyListeners();
  }

  void setDataSaver(bool enabled) {
    _settings = _settings.copyWith(dataSaver: enabled);
    notifyListeners();
  }

  void setNotificationPreference({
    bool? rekomendasi,
    bool? pengingatRencana,
    bool? pengingatChecklist,
    bool? fasilitasBaru,
    bool? promo,
  }) {
    _settings = _settings.copyWith(
      notifications: _settings.notifications.copyWith(
        rekomendasi: rekomendasi,
        pengingatRencana: pengingatRencana,
        pengingatChecklist: pengingatChecklist,
        fasilitasBaru: fasilitasBaru,
        promo: promo,
      ),
    );
    notifyListeners();
  }

  void setPrivacyPreference({
    bool? twoFactor,
    bool? profilPublik,
    bool? bagikanAktivitas,
    bool? analitik,
  }) {
    _settings = _settings.copyWith(
      privacy: _settings.privacy.copyWith(
        twoFactor: twoFactor,
        profilPublik: profilPublik,
        bagikanAktivitas: bagikanAktivitas,
        analitik: analitik,
      ),
    );
    notifyListeners();
  }

  // --- Pencarian ----------------------------------------------------------

  SearchFilter _searchFilter = const SearchFilter();

  final List<String> _searchHistory;

  SearchFilter get searchFilter => _searchFilter;

  List<String> get searchHistory =>
      List<String>.unmodifiable(_searchHistory);

  List<Destination> get searchResults {
    final query = _searchFilter.query.trim().toLowerCase();
    if (query.isEmpty) return SeedData.destinations;
    return SeedData.destinations.where((destination) {
      final haystack = [
        destination.name,
        destination.tagline,
        destination.province,
        destination.regency,
      ].join(' ').toLowerCase();
      return haystack.contains(query);
    }).toList();
  }

  bool get hasActiveQuery => _searchFilter.query.trim().isNotEmpty;

  void setSearchQuery(String query) {
    _searchFilter = _searchFilter.copyWith(query: query);
    notifyListeners();
  }

  void setSortOption(SortOption sort) {
    _searchFilter = _searchFilter.copyWith(sort: sort);
    notifyListeners();
  }

  void setDifficultyFilter(DifficultyFilter difficulty) {
    _searchFilter = _searchFilter.copyWith(difficulty: difficulty);
    notifyListeners();
  }

  void toggleSupportFilter(String support) {
    final next = [..._searchFilter.supports];
    if (!next.remove(support)) next.add(support);
    _searchFilter = _searchFilter.copyWith(supports: next);
    notifyListeners();
  }

  void setVerifiedOnly(bool value) {
    _searchFilter = _searchFilter.copyWith(verifiedOnly: value);
    notifyListeners();
  }

  void clearSearchFilters() {
    _searchFilter = _searchFilter.cleared();
    notifyListeners();
  }

  /// Mencatat kueri ke riwayat dan mengosongkan input pencarian.
  void commitSearch(String query) {
    final value = query.trim();
    if (value.isEmpty) return;
    _searchHistory.removeWhere((item) => item.toLowerCase() == value.toLowerCase());
    _searchHistory.insert(0, value);
    while (_searchHistory.length > 8) {
      _searchHistory.removeLast();
    }
    notifyListeners();
  }

  void clearSearchHistory() {
    if (_searchHistory.isEmpty) return;
    _searchHistory.clear();
    notifyListeners();
  }

  /// Ganti seluruh isi store, dipakai saat data server sudah tersedia.
  void replaceAll({
    List<AppNotification>? notifications,
    List<SavedDestination>? savedDestinations,
    List<SavedTripPlan>? savedPlans,
    List<SavedChecklist>? savedChecklists,
    List<FacilityProposal>? proposals,
    AppSettings? settings,
  }) {
    if (notifications != null) {
      _notifications
        ..clear()
        ..addAll(notifications);
    }
    if (savedDestinations != null) {
      _savedDestinations
        ..clear()
        ..addAll(savedDestinations);
    }
    if (savedPlans != null) {
      _savedPlans
        ..clear()
        ..addAll(savedPlans);
    }
    if (savedChecklists != null) {
      _savedChecklists
        ..clear()
        ..addAll(savedChecklists);
    }
    if (proposals != null) {
      _proposals
        ..clear()
        ..addAll(proposals);
    }
    if (settings != null) _settings = settings;
    notifyListeners();
  }
}