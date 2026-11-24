import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/features/auth/presentation/controllers/auth_controller.dart';
import 'package:dolenae_mobile/src/features/checklist/presentation/controllers/checklist_controller.dart';
import 'package:dolenae_mobile/src/features/plan/presentation/controllers/plan_controller.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/controllers/saved_controller.dart';
import 'package:dolenae_mobile/src/app/theme/app_colors.dart';
import 'package:dolenae_mobile/src/app/theme/app_radius.dart';
import 'package:dolenae_mobile/src/app/theme/app_shadows.dart';
import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/app/theme/app_text_styles.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_bottom_nav.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_dialog.dart';

/// Layar Profil Wisatawan (Node Figma: 81:257).
///
/// Menampilkan identitas wisatawan, statistik perjalanan,
/// pengaturan akun, keamanan, preferensi, dan bantuan.
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({
    super.key,
    this.userName = 'Dimas',
    this.userEmail = 'dimas@dolenae.id',
    this.userRole = 'Wisatawan',
    this.savedCount = 4,
    this.planCount = 2,
    this.checklistCount = 12,
    this.onEditProfile,
    this.onLogout,
  });

  final String userName;
  final String userEmail;
  final String userRole;
  final int savedCount;
  final int planCount;
  final int checklistCount;
  final VoidCallback? onEditProfile;
  final VoidCallback? onLogout;

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
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController?>();
    final displayName = auth?.user?.name ?? userName;
    final displayEmail = auth?.user?.email ?? userEmail;
    final displayRole = auth?.user?.roleLabel ?? userRole;
    final savedTotal =
        context.watch<SavedController?>()?.savedDestinations.length ??
        savedCount;
    final planTotal =
        context.watch<PlanController?>()?.plans.length ?? planCount;
    final checklistTotal =
        context.watch<ChecklistController?>()?.items.length ?? checklistCount;

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: _buildAppBar(context),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppSpacing.s4),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildProfileCard(
                      context,
                      displayName,
                      displayEmail,
                      displayRole,
                      saved: savedTotal,
                      plan: planTotal,
                      checklist: checklistTotal,
                    ),
                    const SizedBox(height: AppSpacing.s4),
                    _buildGroupHeader('AKUN & KEAMANAN'),
                    const SizedBox(height: 8),
                    _buildAccountGroup(context),
                    const SizedBox(height: AppSpacing.s4),
                    _buildGroupHeader('PERJALANAN'),
                    const SizedBox(height: 8),
                    _buildTripGroup(context),
                    const SizedBox(height: AppSpacing.s4),
                    _buildGroupHeader('BANTUAN'),
                    const SizedBox(height: 8),
                    _buildHelpGroup(context),
                    const SizedBox(height: AppSpacing.s4),
                    _buildLogoutCard(context, auth),
                    const SizedBox(height: AppSpacing.s6),
                  ],
                ),
              ),
            ),
            DnBottomNav(
              active: DnTab.profil,
              onTap: (tab) => _onTab(context, tab),
            ),
          ],
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return PreferredSize(
      preferredSize: const Size.fromHeight(56),
      child: Container(
        color: AppColors.primary,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
        alignment: Alignment.center,
        child: SafeArea(
          bottom: false,
          child: Row(
            children: [
              Text(
                'Profil',
                style: AppTextStyles.title.copyWith(color: AppColors.onPrimary),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileCard(
    BuildContext context,
    String displayName,
    String displayEmail,
    String displayRole, {
    required int saved,
    required int plan,
    required int checklist,
  }) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.s4),
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
        boxShadow: AppShadows.sm,
      ),
      child: Column(
        children: [
          Row(
            children: [
              // Avatar lingkaran 64x64 dengan inisial
              Container(
                width: 64,
                height: 64,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: Text(
                  displayName.isNotEmpty ? displayName[0].toUpperCase() : 'U',
                  style: AppTextStyles.displayMd.copyWith(
                    color: AppColors.onPrimary,
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.s3),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      displayName,
                      style: AppTextStyles.title.copyWith(color: AppColors.ink),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      displayEmail,
                      style: AppTextStyles.body.copyWith(
                        color: AppColors.body,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.canvas,
                        borderRadius: BorderRadius.circular(AppRadius.pill),
                        border: Border.all(color: AppColors.hairline),
                      ),
                      child: Text(
                        displayRole,
                        style: AppTextStyles.overline.copyWith(
                          color: AppColors.body,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.s4),
          // Stats Row
          Row(
            children: [
              _buildStatItem(
                context,
                '$saved',
                'Tersimpan',
                () => context.push('/saved/destinations'),
              ),
              const SizedBox(width: 8),
              _buildStatItem(
                context,
                '$plan',
                'Rencana',
                () => context.go('/plan'),
              ),
              const SizedBox(width: 8),
              _buildStatItem(
                context,
                '$checklist',
                'Checklist',
                () => context.push('/checklist'),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.s4),
          // Ubah profil CTA
          Material(
            color: AppColors.canvas,
            borderRadius: BorderRadius.circular(AppRadius.pill),
            child: InkWell(
              borderRadius: BorderRadius.circular(AppRadius.pill),
              onTap: onEditProfile ?? () => context.push('/profile/edit'),
              child: Container(
                height: 44,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(AppRadius.pill),
                  border: Border.all(color: AppColors.borderStrong),
                ),
                child: Text(
                  'Ubah profil',
                  style: AppTextStyles.label.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(
    BuildContext context,
    String count,
    String label,
    VoidCallback? onTap,
  ) {
    return Expanded(
      child: Material(
        color: AppColors.canvas,
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: InkWell(
          borderRadius: BorderRadius.circular(AppRadius.md),
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 10),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(color: AppColors.hairline),
            ),
            child: Column(
              children: [
                Text(
                  count,
                  style: AppTextStyles.title.copyWith(
                    fontWeight: FontWeight.w700,
                    color: AppColors.ink,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  label,
                  style: AppTextStyles.caption.copyWith(
                    color: AppColors.body,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildGroupHeader(String title) {
    return Text(
      title,
      style: AppTextStyles.overline.copyWith(
        color: AppColors.body,
        fontWeight: FontWeight.w700,
      ),
    );
  }

  Widget _buildAccountGroup(BuildContext context) {
    return _buildMenuCard([
      _MenuItem(
        icon: AppIcons.user,
        title: 'Edit profil',
        onTap: onEditProfile ?? () => context.push('/profile/edit'),
      ),
    ]);
  }

  Widget _buildTripGroup(BuildContext context) {
    return _buildMenuCard([
      _MenuItem(
        icon: AppIcons.bookmarkCheck,
        title: 'Destinasi tersimpan',
        onTap: () => context.push('/saved/destinations'),
      ),
      _MenuItem(
        icon: AppIcons.map,
        title: 'Rencana tersimpan',
        onTap: () => context.push('/saved/plans'),
      ),
      _MenuItem(
        icon: AppIcons.squareCheck,
        title: 'Checklist tersimpan',
        onTap: () => context.push('/saved/checklists'),
      ),
    ]);
  }

  Widget _buildHelpGroup(BuildContext context) {
    return _buildMenuCard([
      _MenuItem(
        icon: AppIcons.helpCircle,
        title: 'Bantuan & FAQ',
        onTap: () => context.push('/settings/faq'),
      ),
    ]);
  }

  Widget _buildMenuCard(List<_MenuItem> items) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.canvasSubtle,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Column(
        children: [
          for (int i = 0; i < items.length; i++) ...[
            _buildMenuRow(items[i]),
            if (i < items.length - 1)
              const Divider(height: 1, color: AppColors.hairline),
          ],
        ],
      ),
    );
  }

  Widget _buildMenuRow(_MenuItem item) {
    return InkWell(
      onTap: item.onTap,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: const BoxDecoration(
                color: AppColors.canvas,
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: Icon(item.icon, size: 16, color: AppColors.body),
            ),
            const SizedBox(width: AppSpacing.s3),
            Expanded(
              child: Text(
                item.title,
                style: const TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                  color: AppColors.ink,
                ),
              ),
            ),
            const Icon(AppIcons.chevronRight, size: 18, color: AppColors.body),
          ],
        ),
      ),
    );
  }

  Widget _buildLogoutCard(BuildContext context, AuthController? auth) {
    return Material(
      color: AppColors.canvasSubtle,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        onTap: () async {
          final confirmed = await showDnDialog(
            context,
            title: 'Keluar dari akun?',
            message:
                'Kamu perlu masuk lagi untuk membuka rencana dan checklist '
                'yang tersimpan.',
            type: DnDialogType.destruktif,
            confirmLabel: 'Keluar',
            cancelLabel: 'Batal',
            icon: AppIcons.logOut,
          );
          if (confirmed != true || !context.mounted) return;

          final logout = onLogout;
          if (logout != null) {
            logout();
            return;
          }
          if (auth != null) {
            await auth.logout();
            if (context.mounted) context.go('/login');
            return;
          }
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Berhasil keluar'),
              backgroundColor: AppColors.primary,
            ),
          );
        },
        child: Container(
          height: 56,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: AppColors.hairline),
          ),
          child: Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: const BoxDecoration(
                  color: AppColors.canvas,
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: const Icon(
                  AppIcons.logOut,
                  size: 16,
                  color: AppColors.danger,
                ),
              ),
              const SizedBox(width: AppSpacing.s3),
              Text(
                'Keluar',
                style: AppTextStyles.label.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppColors.danger,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MenuItem {
  const _MenuItem({
    required this.icon,
    required this.title,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final VoidCallback onTap;
}
