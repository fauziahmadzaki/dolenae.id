import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';

/// Placeholder media bergaya "bukit + matahari" (pengganti foto sementara),
/// meniru scene pada desain Figma.
class DnMediaPlaceholder extends StatelessWidget {
  const DnMediaPlaceholder({
    super.key,
    this.icon,
    this.height,
    this.borderRadius,
  });

  final IconData? icon;
  final double? height;
  final BorderRadius? borderRadius;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: borderRadius ?? BorderRadius.zero,
      child: SizedBox(
        height: height,
        width: double.infinity,
        child: CustomPaint(
          painter: _ScenePainter(),
          child: icon == null
              ? null
              : Center(
                  child: Icon(icon, size: 36, color: AppColors.primary),
                ),
        ),
      ),
    );
  }
}

class _ScenePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawRect(
      Offset.zero & size,
      Paint()..color = AppColors.canvas,
    );

    final hill = Paint()..color = AppColors.canvasSubtle;
    canvas.drawCircle(
      Offset(size.width * 0.5, size.height * 1.15),
      size.width * 0.8,
      hill,
    );

    final sun = Paint()..color = AppColors.hairline;
    canvas.drawCircle(
      Offset(size.width * 0.74, size.height * 0.24),
      size.width * 0.1,
      sun,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
