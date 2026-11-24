import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dolenae_mobile/src/core/utils/rupiah_input_formatter.dart';

void main() {
  const formatter = RupiahInputFormatter();

  TextEditingValue format(String text) {
    return formatter.formatEditUpdate(
      TextEditingValue.empty,
      TextEditingValue(
        text: text,
        selection: TextSelection.collapsed(offset: text.length),
      ),
    );
  }

  test('menambahkan titik ribuan', () {
    expect(format('1500000').text, '1.500.000');
    expect(format('750000').text, '750.000');
  });

  test('membuang karakter non-digit dan nol di depan', () {
    expect(format('Rp 1.250.000').text, '1.250.000');
    expect(format('0005').text, '5');
  });

  test('input kosong tetap kosong', () {
    expect(format('').text, '');
    expect(format('abc').text, '');
  });

  test('kursor ditempatkan di akhir setelah format', () {
    final result = format('12000');
    expect(result.selection.baseOffset, result.text.length);
  });
}
