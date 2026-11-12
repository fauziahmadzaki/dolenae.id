/// User-facing error returned by the data layer.
///
/// The message is already written in Indonesian so the UI can show it as-is.
sealed class AppFailure implements Exception {
  const AppFailure(this.message, {this.code});

  final String message;
  final String? code;

  @override
  String toString() => message;
}

final class NetworkFailure extends AppFailure {
  const NetworkFailure(super.message, {super.code});
}

final class AuthFailure extends AppFailure {
  const AuthFailure(super.message, {super.code});
}

final class ValidationFailure extends AppFailure {
  const ValidationFailure(super.message, {super.code});
}

final class CacheFailure extends AppFailure {
  const CacheFailure(super.message, {super.code});
}

final class UnknownFailure extends AppFailure {
  const UnknownFailure(super.message, {super.code});
}
