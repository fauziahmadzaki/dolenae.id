/// Formats a number with dots as thousands separators (Indonesian style).
String formatThousands(num value) {
  final text = value % 1 == 0 ? value.toInt().toString() : value.toString();
  final parts = text.split('.');
  final digits = parts.first;
  final buffer = StringBuffer();

  for (var i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 == 0) buffer.write('.');
    buffer.write(digits[i]);
  }

  return parts.length > 1 ? '$buffer.${parts[1]}' : buffer.toString();
}

/// Drops the trailing `.0` from whole numbers.
String formatCompactNumber(num value) {
  return value % 1 == 0 ? value.toInt().toString() : value.toString();
}
