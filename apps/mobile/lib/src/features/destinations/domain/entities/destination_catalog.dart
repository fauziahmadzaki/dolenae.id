import 'package:dolenae_mobile/src/features/destinations/domain/entities/destination.dart';

/// Destinations currently visible to the UI, plus the cache timestamp.
class DestinationCatalog {
  const DestinationCatalog({required this.items, this.lastFetched});

  final List<Destination> items;
  final DateTime? lastFetched;

  bool get isEmpty => items.isEmpty;
}
