import 'dart:math' as math;

import 'package:flutter/foundation.dart';

import 'package:flutter/material.dart';
import 'package:dolenae_mobile/src/features/payments/domain/entities/payment_invoice.dart';

/// Hanya melukis matriks QR standar dari server, tanpa encoder/pola buatan klien.
class DummyQr extends StatelessWidget {
  const DummyQr({super.key, required this.matrix});
  final List<List<bool>> matrix;
  @override
  Widget build(BuildContext context) => Semantics(
    image: true,
    label:
        'QR pembayaran DUMMY. SIMULASI BUKAN QRIS. Tidak untuk transfer uang.',
    child: ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 300),
      child: AspectRatio(
        aspectRatio: 1,
        child: CustomPaint(painter: DummyQrPainter(matrix)),
      ),
    ),
  );
}

class DummyQrPainter extends CustomPainter {
  DummyQrPainter(List<List<bool>> matrix)
    : matrix = List.unmodifiable(
        matrix.map((row) => List<bool>.unmodifiable(row)),
      ) {
    if (!isValidQrMatrix(this.matrix)) {
      throw ArgumentError('Matriks QR tidak valid.');
    }
  }
  final List<List<bool>> matrix;
  static const quietZone = 4;
  @override
  void paint(Canvas canvas, Size size) {
    // Hitam/putih wajib untuk QR, tidak mengikuti warna dekoratif tema.
    canvas.drawRect(Offset.zero & size, Paint()..color = Colors.white);
    final modules = matrix.length + quietZone * 2;
    final module = (math.min(size.width, size.height) / modules)
        .floorToDouble();
    if (module < 1) return;
    final origin = Offset(
      (size.width - modules * module) / 2,
      (size.height - modules * module) / 2,
    );
    final paint = Paint()
      ..color = Colors.black
      ..isAntiAlias = false;
    for (var y = 0; y < matrix.length; y++) {
      for (var x = 0; x < matrix.length; x++) {
        if (matrix[y][x]) {
          canvas.drawRect(
            Rect.fromLTWH(
              origin.dx + (x + quietZone) * module,
              origin.dy + (y + quietZone) * module,
              module,
              module,
            ),
            paint,
          );
        }
      }
    }
  }

  @override
  bool shouldRepaint(covariant DummyQrPainter oldDelegate) => !listEquals(
    matrix.expand((row) => row).toList(),
    oldDelegate.matrix.expand((row) => row).toList(),
  );
}
