import 'package:flutter/material.dart';
import 'package:dolenae_mobile/src/features/categories/presentation/controllers/categories_controller.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/features/ai/domain/entities/ai_recommendation.dart';
import 'package:dolenae_mobile/src/features/auth/presentation/controllers/auth_controller.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/usecases/destination_usecases.dart';
import 'package:dolenae_mobile/src/features/destinations/presentation/controllers/destinations_controller.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/controllers/facilities_controller.dart';
import 'package:dolenae_mobile/src/features/notifications/presentation/controllers/notifications_controller.dart';
import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_activity_tile.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_ai_card.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_bottom_nav.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_buttons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_empty_state.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_destination_card.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_email_verification_banner.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_recommendation_card.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_search_field.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_section_header.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_support_card.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_toast.dart';

/// Beranda wisatawan.
class BerandaScreen extends StatefulWidget {
  const BerandaScreen({
    super.key,
    this.hasError = false,
    this.onRetry,
    this.onReload,
  });

  /// Menampilkan state `Gagal memuat beranda` (`101:243`).
  final bool hasError;

  /// Aksi CTA "Coba lagi" dan ghost "Muat ulang".
  final VoidCallback? onRetry;
  final VoidCallback? onReload;

  @override
  State<BerandaScreen> createState() => _BerandaScreenState();
}

class _BerandaScreenState extends State<BerandaScreen> {
  static const _searchRecommendations = SearchRecommendationsUseCase();

  /// Kata kunci pencarian yang aktif di Beranda (bukan di Jelajah).
  String _query = '';
  String _facilitiesSignature = '';

  /// Memuat fasilitas dari destinasi pertama yang punya data agar seksi
  /// Beranda terisi tanpa harus membuka detail destinasi lebih dulu.
  void _ensureFacilitiesLoad(List<Destination> destinations) {
    if (destinations.isEmpty) return;
    final candidates = destinations.take(6).map((item) => item.id).toList();
    final signature = candidates.join(',');
    if (_facilitiesSignature == signature) return;
    _facilitiesSignature = signature;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<FacilitiesController>().loadFirstAvailable(candidates);
    });
  }

  bool get _isSearching => _query.trim().isNotEmpty;

  void _onQueryChanged(String value) => setState(() => _query = value);

  void _clearQuery() => setState(() => _query = '');

  void _onTab(BuildContext context, DnTab tab) {
    switch (tab) {
      case DnTab.beranda:
        context.go('/home');
      case DnTab.jelajah:
        context.go('/explore');
      case DnTab.ai:
        context.go('/ai/preferences');
      case DnTab.rencana:
        context.go('/plan');
      case DnTab.profil:
        context.go('/profile');
    }
  }

  @override
  Widget build(BuildContext context) {
    final destinationsController = context.watch<DestinationsController?>();
    final destinations = destinationsController?.items ?? const <Destination>[];
    final auth = context.watch<AuthController?>();
    _ensureFacilitiesLoad(destinations);

    return Scaffold(
      body: Column(
        children: [
          Expanded(
            child: RefreshIndicator(
              color: AppColors.primary,
              onRefresh: () async {
                await Future.wait([
                  if (destinationsController != null)
                    destinationsController.refresh(),
                  context.read<CategoriesController>().load(refresh: true),
                  if (destinations.isNotEmpty)
                    context.read<FacilitiesController>().loadFirstAvailable(
                      destinations.take(6).map((item) => item.id),
                    ),
                ]);
              },
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const _Header(),
                    if (auth != null && auth.needsEmailVerification)
                      DnEmailVerificationBanner(
                        email: auth.user!.email,
                        isSending: auth.isResendingVerification,
                        sent: auth.verificationEmailSent,
                        onResend: () => _resendVerification(context, auth),
                      ),
                    if (widget.hasError)
                      _loadError(
                        onRetry: widget.onRetry ?? () {},
                        onReload: widget.onReload ?? () {},
                      )
                    else ...[
                      _search(context),
                      if (_isSearching)
                        _recommendations(context, destinations)
                      else ...[
                        Padding(
                          padding: const EdgeInsets.all(AppSpacing.s4),
                          child: DnAiCard(
                            title: 'Siapkan perjalananmu dengan AI',
                            body: 'Ceritakan rencanamu, Dolenae menyusun checklist dan gambaran kondisi perjalanan.',
                            ctaLabel: 'Mulai dengan AI',
                            onPressed: () => context.go('/ai/preferences'),
                          ),
                        ),
                        _popular(context, destinations, destinationsController),
                        _activities(),
                        _supports(context),
                        _ctaBand(context),
                      ],
                      const SizedBox(height: AppSpacing.s6),
                    ],
                  ],
                ),
              ),
            ),
          ),
          DnBottomNav(
            active: DnTab.beranda,
            onTap: (tab) => _onTab(context, tab),
          ),
        ],
      ),
    );
  }

  /// Mengirim ulang tautan verifikasi email dari banner Beranda.
  Future<void> _resendVerification(
    BuildContext context,
    AuthController auth,
  ) async {
    final result = await auth.resendVerificationEmail();
    if (!context.mounted) return;
    switch (result) {
      case Success(:final value):
        showDnToast(context, value, type: DnToastType.sukses);
      case Failure(:final failure):
        showDnToast(context, failure.message, type: DnToastType.gagal);
    }
  }

  /// State `Gagal memuat beranda` (`101:243`): header pine tetap tampil,
  /// hanya isi beranda yang diganti panel kegagalan.
  Widget _loadError({
    required VoidCallback onRetry,
    required VoidCallback onReload,
  }) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.s5,
        AppSpacing.s8,
        AppSpacing.s5,
        AppSpacing.s6,
      ),
      child: Column(
        children: [
          DnEmptyState(
            icon: AppIcons.cloudOff,
            iconColor: AppColors.danger,
            title: 'Gagal memuat beranda',
            body:
                'Kami tidak bisa mengambil destinasi populer dan fasilitas '
                'terbaru. Periksa koneksi internet lalu coba lagi.',
            actionLabel: 'Coba lagi',
            onAction: onRetry,
          ),
          const SizedBox(height: AppSpacing.s2),
          DnGhostButton(label: 'Muat ulang', onPressed: onReload),
        ],
      ),
    );
  }

  Widget _search(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.s4,
        AppSpacing.s4,
        AppSpacing.s4,
        0,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Mau ke mana?', style: AppTextStyles.displayMd),
          const SizedBox(height: AppSpacing.s3),
          DnSearchField(
            hint: 'Cari gunung, bukit, atau air terjun',
            value: _query,
            focused: _isSearching,
            onChanged: _onQueryChanged,
            onSubmitted: _onQueryChanged,
            trailing: _query.isEmpty
                ? null
                : IconButton(
                    onPressed: _clearQuery,
                    tooltip: 'Hapus pencarian',
                    icon: const Icon(AppIcons.close, size: 18),
                    color: AppColors.body,
                    padding: EdgeInsets.zero,
                    visualDensity: VisualDensity.compact,
                    constraints: const BoxConstraints.tightFor(
                      width: 32,
                      height: 32,
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  /// Hasil pencarian di Beranda: kartu rekomendasi dari katalog yang ada.
  Widget _recommendations(BuildContext context, List<Destination> items) {
    final query = _query.trim();
    final matches = _searchRecommendations(items, query);

    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.s4,
        AppSpacing.s5,
        AppSpacing.s4,
        0,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          DnSectionHeader(
            title: query.isEmpty
                ? 'Rekomendasi kategori pilihan'
                : 'Rekomendasi untuk "$query"',
          ),
          const SizedBox(height: 6),
          Text(
            matches.isEmpty
                ? 'Tidak ada destinasi yang cocok di katalog.'
                : '${matches.length} destinasi cocok dari katalog',
            style: AppTextStyles.caption.copyWith(color: AppColors.body),
          ),
          const SizedBox(height: AppSpacing.s3),
          if (matches.isEmpty)
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.s6),
              child: DnEmptyState(
                variant: DnEmptyVariant.tanpaHasil,
                title: 'Destinasi tidak ditemukan',
                body: 'Coba kata kunci lain seperti "gunung", "camping", atau nama daerah.',
                actionLabel: 'Jelajahi semua',
                onAction: () => context.go('/explore'),
              ),
            )
          else
            for (var i = 0; i < matches.length; i++) ...[
              DnRecommendationCard(
                recommendation: AiRecommendation(
                  destination: matches[i].destination,
                  score: matches[i].score,
                  reasons: matches[i].reasons,
                  rank: i + 1,
                ),
                variant: DnRecommendationVariant.ringkas,
                onTap: () =>
                    context.push('/destination/${matches[i].destination.id}'),
              ),
              if (i != matches.length - 1)
                const SizedBox(height: AppSpacing.s3),
            ],
        ],
      ),
    );
  }

  Widget _popular(
    BuildContext context,
    List<Destination> items,
    DestinationsController? state,
  ) {
    final shown = items.take(2).toList();
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.s4,
        AppSpacing.s2,
        AppSpacing.s4,
        0,
      ),
      child: Column(
        children: [
          DnSectionHeader(
            title: 'Destinasi populer',
            actionLabel: 'Lihat semua',
            onAction: () => context.go('/explore'),
          ),
          if (state != null) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                Icon(
                  state.hasRemoteData ? AppIcons.database : AppIcons.cloudOff,
                  size: 13,
                  color: AppColors.body,
                ),
                const SizedBox(width: 5),
                Expanded(
                  child: Text(
                    state.hasRemoteData
                        ? 'Tersimpan offline · ${_relativeTime(state.lastFetched)}'
                        : 'Belum ada data destinasi tersimpan',
                    style: AppTextStyles.caption.copyWith(
                      color: AppColors.body,
                    ),
                  ),
                ),
                if (state.isLoading)
                  const SizedBox(
                    width: 12,
                    height: 12,
                    child: CircularProgressIndicator(strokeWidth: 1.5),
                  ),
              ],
            ),
          ],
          const SizedBox(height: AppSpacing.s3),
          for (final item in shown) ...[
            DnDestinationCard(
              destination: item,
              onTap: () => context.push('/destination/${item.id}'),
            ),
            if (item != shown.last) const SizedBox(height: AppSpacing.s3),
          ],
        ],
      ),
    );
  }

  /// Label umur cache dalam bahasa manusia.
  static String _relativeTime(DateTime? fetchedAt) {
    if (fetchedAt == null) return 'belum disinkronkan';
    final diff = DateTime.now().toUtc().difference(fetchedAt);
    if (diff.inMinutes < 1) return 'baru saja';
    if (diff.inMinutes < 60) return '${diff.inMinutes} menit lalu';
    if (diff.inHours < 24) return '${diff.inHours} jam lalu';
    return '${diff.inDays} hari lalu';
  }

  Widget _activities() {
    const items = <(IconData, String)>[
      (AppIcons.mountain, 'Hiking'),
      (AppIcons.tent, 'Camping'),
      (AppIcons.sunrise, 'Sunrise'),
      (AppIcons.camera, 'Foto'),
    ];
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.s4,
        AppSpacing.s5,
        AppSpacing.s4,
        0,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const DnSectionHeader(title: 'Aktivitas'),
          const SizedBox(height: AppSpacing.s3),
          Row(
            children: [
              for (final item in items) ...[
                Expanded(
                  child: DnActivityTile(
                    icon: item.$1,
                    label: item.$2,
                    onTap: () => context.go(
                      '/explore?activity=${Uri.encodeQueryComponent(item.$2)}',
                    ),
                  ),
                ),
                if (item != items.last) const SizedBox(width: AppSpacing.s2),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _supports(BuildContext context) {
    final supports = context.watch<FacilitiesController>().facilities;
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.s5),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: AppSpacing.s4),
            child: DnSectionHeader(
              title: 'Berbagai Fasilitas',
              actionLabel: 'Lihat semua',
            ),
          ),
          const SizedBox(height: AppSpacing.s3),
          SizedBox(
            height: 176,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
              itemCount: supports.length,
              separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.s3),
              itemBuilder: (_, i) => DnSupportCard(support: supports[i]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _ctaBand(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(top: AppSpacing.s5),
      padding: const EdgeInsets.all(AppSpacing.s6),
      color: AppColors.primary,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Siap menyusun rencana?',
            style: AppTextStyles.title.copyWith(color: AppColors.onPrimary),
          ),
          const SizedBox(height: AppSpacing.s2),
          Text(
            'Kumpulkan destinasi dan kebutuhanmu dalam satu rencana.',
            style: AppTextStyles.bodySm.copyWith(color: AppColors.canvas),
          ),
          const SizedBox(height: AppSpacing.s4),
          SizedBox(
            height: 48,
            width: double.infinity,
            child: FilledButton(
              onPressed: () => context.go('/plan'),
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.canvas,
                foregroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppRadius.pill),
                ),
                textStyle: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                ),
              ),
              child: const Text('Susun rencana'),
            ),
          ),
        ],
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.primary,
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
      child: SafeArea(
        bottom: false,
        child: SizedBox(
          height: 56,
          child: Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppColors.primaryHover,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  AppIcons.mountainSnow,
                  size: 18,
                  color: AppColors.onPrimary,
                ),
              ),
              const SizedBox(width: AppSpacing.s2 + 2),
              Text(
                'Dolenae.id',
                style: AppTextStyles.titleSm.copyWith(
                  color: AppColors.onPrimary,
                ),
              ),
              const Spacer(),
              const _NotificationBell(),
              const SizedBox(width: AppSpacing.s2 + 2),
              Semantics(
                button: true,
                label: 'Buka profil',
                child: InkWell(
                  key: const Key('home-avatar'),
                  borderRadius: BorderRadius.circular(18),
                  onTap: () => context.go('/profile'),
                  child: Container(
                    width: 36,
                    height: 36,
                    alignment: Alignment.center,
                    decoration: const BoxDecoration(
                      color: AppColors.canvas,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      context.watch<AuthController?>()?.user?.initials ?? 'D',
                      style: AppTextStyles.label.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Tombol lonceng dengan badge jumlah notifikasi belum dibaca.
class _NotificationBell extends StatelessWidget {
  const _NotificationBell();

  @override
  Widget build(BuildContext context) {
    final unread = context.watch<NotificationsController?>()?.unreadCount ?? 0;
    return Semantics(
      button: true,
      label: unread == 0 ? 'Notifikasi' : 'Notifikasi, $unread belum dibaca',
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: () => context.push('/notifications'),
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: const BoxDecoration(
                color: AppColors.primaryHover,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                AppIcons.bell,
                size: 18,
                color: AppColors.onPrimary,
              ),
            ),
            if (unread > 0)
              Positioned(
                right: -2,
                top: -2,
                child: Container(
                  constraints: const BoxConstraints(minWidth: 16),
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  decoration: BoxDecoration(
                    color: AppColors.accent,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    unread > 9 ? '9+' : '$unread',
                    textAlign: TextAlign.center,
                    style: AppTextStyles.overline.copyWith(
                      color: AppColors.onAccent,
                      fontSize: 9,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
