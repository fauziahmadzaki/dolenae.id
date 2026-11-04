import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:dolenae_mobile/src/app/theme/app_spacing.dart';
import 'package:dolenae_mobile/src/features/saved/presentation/controllers/saved_controller.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_empty_state.dart';

/// Memuat koleksi pribadi saat layar dibuka, tanpa menyamarkan error sebagai kosong.
class SavedContent extends StatefulWidget {
  const SavedContent({
    super.key,
    required this.enabled,
    required this.hasData,
    required this.child,
  });

  final bool enabled;
  final bool hasData;
  final Widget child;

  @override
  State<SavedContent> createState() => _SavedContentState();
}

class _SavedContentState extends State<SavedContent> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted && widget.enabled) context.read<SavedController>().load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final store = context.watch<SavedController>();
    if (!widget.enabled) return widget.child;
    return Column(
      children: [
        if (store.isLoading) const LinearProgressIndicator(),
        if (store.failure != null)
          Padding(
            padding: const EdgeInsets.all(AppSpacing.s5),
            child: DnEmptyState(
              variant: DnEmptyVariant.gagal,
              body: store.failure!.message,
              onAction: store.isLoading ? null : store.load,
            ),
          ),
        Expanded(
          child: !widget.hasData && (store.isLoading || store.failure != null)
              ? const SizedBox.shrink()
              : widget.child,
        ),
      ],
    );
  }
}
