/// Stub penyimpanan foto untuk platform non-IO (Web): path dikembalikan
/// apa adanya karena tidak ada sistem berkas lokal.
Future<String> persistPhotoFile(
  String sourcePath,
  String sanitizedBasename,
) async => sourcePath;
