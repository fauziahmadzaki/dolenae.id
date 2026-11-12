import '../result/result.dart';

/// Contract for a single application action.
abstract interface class UseCase<Output, Input> {
  Future<Result<Output>> call(Input input);
}

/// Marker for use cases that need no input.
final class NoParams {
  const NoParams();
}
