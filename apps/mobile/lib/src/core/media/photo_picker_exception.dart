/// Pengecualian ketika izin kamera/galeri ditolak, pemilih foto gagal,
/// atau foto gagal disalin ke penyimpanan persisten perangkat.
class PhotoPickerException implements Exception {
  const PhotoPickerException(this.message, {this.code});

  final String message;
  final String? code;

  @override
  String toString() => message;
}
