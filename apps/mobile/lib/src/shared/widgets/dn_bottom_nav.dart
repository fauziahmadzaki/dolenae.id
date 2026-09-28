import 'package:flutter/material.dart';
import 'package:dolenae_mobile/src/shared/icons/app_icons.dart';

import '../../app/theme/app_colors.dart';

/// Tab utama aplikasi.
enum DnTab { beranda, jelajah, ai, rencana, profil }

/// Bottom navigation 5 tab. Hanya tab aktif yang menampilkan indikator.
class DnBottomNav extends StatelessWidget {
  const DnBottomNav({super.key, required this.active, required this.onTap});

  final DnTab active;
  final ValueChanged<DnTab> onTap;

  static const _meta = <DnTab, (String, IconData)>{
    DnTab.beranda: ('Beranda', AppIcons.home),
    DnTab.jelajah: ('Jelajah', AppIcons.compass),
    DnTab.ai: ('AI', AppIcons.sparkles),
    DnTab.rencana: ('Rencana', AppIcons.map),
    DnTab.profil: ('Profil', AppIcons.user),
  };

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 64,
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
      decoration: const BoxDecoration(
        color: AppColors.canvas,
        border: Border(top: BorderSide(color: AppColors.hairline)),
      ),
      child: Row(
        children: [
          for (final entry in _meta.entries)
            Expanded(
              child: _NavItem(
                label: entry.value.$1,
                icon: entry.value.$2,
                active: entry.key == active,
                onTap: () => onTap(entry.key),
              ),
            ),
        ],
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.label,
    required this.icon,
    required this.active,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = active ? AppColors.primary : AppColors.body;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 24,
            height: 3,
            decoration: BoxDecoration(
              color: active ? AppColors.primary : AppColors.canvas,
              borderRadius: BorderRadius.circular(99),
            ),
          ),
          const SizedBox(height: 2),
          Icon(icon, size: 20, color: color),
          const SizedBox(height: 2),
          Text(
            label,
            maxLines: 1,
            softWrap: false,
            overflow: TextOverflow.clip,
            style: TextStyle(
              fontSize: 11,
              height: 1,
              fontWeight: active ? FontWeight.w600 : FontWeight.w500,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
