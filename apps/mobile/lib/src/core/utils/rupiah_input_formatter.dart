import 'package:flutter/services.dart';

import 'package:dolenae_mobile/src/core/utils/formatters.dart';

/// Memformat nominal rupiah dengan titik ribuan saat pengguna mengetik.
///
/// Nilai yang tersimpan di field tetap berupa teks berformat, mis.
/// `1.500.000`; pemanggil bisa membersihkan non-digit sebelum `int.parse`.
class RupiahInputFormatter extends TextInputFormatter {
  const RupiahInputFormatter();

  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final digits = newValue.text.replaceAll(RegExp(r'\D'), '');
    if (digits.isEmpty) {
      return const TextEditingValue(text: '');
    }

    // Buang nol di depan agar "0005" tampil sebagai "5".
    final normalized = digits.replaceFirst(RegExp(r'^0+(?=\d)'), '');
    final number = int.tryParse(normalized);
    if (number == null) return oldValue;

    final formatted = formatThousands(number);
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}
