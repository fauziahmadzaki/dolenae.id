import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';

Color routeStatusColor(String status) {
  switch (status.toLowerCase()) {
    case 'terlarang':
      return const Color(0xFFB71C1C);
    case 'rusak':
      return const Color(0xFFD32F2F);
    case 'dalam-perbaikan':
      return const Color(0xFFE65100);
    case 'terverifikasi':
      return const Color(0xFF00796B);
    case 'alternatif':
      return const Color(0xFF455A64);
    default:
      return const Color(0xFF757575);
  }
}

Color routeSurfaceColor(String surface) {
  switch (surface.toLowerCase()) {
    case 'aspal':
      return const Color(0xFF37474F);
    case 'setapak':
      return const Color(0xFF2E7D32);
    case 'tanah':
      return const Color(0xFF795548);
    case 'tanah-liat':
      return const Color(0xFF8D6E63);
    case 'batu':
      return const Color(0xFF546E7A);
    case 'pasir':
      return const Color(0xFFA1887F);
    case 'campuran':
      return const Color(0xFF6D4C41);
    default:
      return const Color(0xFF757575);
  }
}

StrokePattern routeStrokePattern({required String status, String? surface}) {
  final st = status.toLowerCase();
  final sf = surface?.toLowerCase();

  if (st == 'rusak' || st == 'terlarang') {
    return const StrokePattern.dotted();
  }
  if (st == 'dalam-perbaikan') {
    return StrokePattern.dashed(segments: const [8, 4]);
  }
  if (st == 'alternatif') {
    return StrokePattern.dashed(segments: const [10, 5]);
  }
  if (st == 'terverifikasi' || sf == 'aspal') {
    return const StrokePattern.solid();
  }
  if (sf == 'setapak') {
    return StrokePattern.dashed(segments: const [6, 4]);
  }
  return const StrokePattern.solid();
}

IconData nodeMarkerIcon(String type) {
  switch (type.toLowerCase()) {
    case 'basecamp':
      return Icons.cabin;
    case 'gerbang':
      return Icons.meeting_room;
    case 'parkir':
      return Icons.local_parking;
    case 'pos':
      return Icons.flag;
    case 'sumber-air':
    case 'water':
      return Icons.water_drop;
    case 'viewpoint':
      return Icons.landscape;
    case 'puncak':
    case 'summit':
      return Icons.terrain;
    case 'persimpangan':
      return Icons.alt_route;
    case 'area-camp':
      return Icons.park;
    default:
      return Icons.place;
  }
}

Color nodeMarkerColor(String type) {
  switch (type.toLowerCase()) {
    case 'basecamp':
      return const Color(0xFF1B5E20);
    case 'gerbang':
      return const Color(0xFF37474F);
    case 'parkir':
      return const Color(0xFF0277BD);
    case 'pos':
      return const Color(0xFFE65100);
    case 'sumber-air':
    case 'water':
      return const Color(0xFF0288D1);
    case 'viewpoint':
      return const Color(0xFF7B1FA2);
    case 'puncak':
    case 'summit':
      return const Color(0xFFC62828);
    case 'persimpangan':
      return const Color(0xFF5D4037);
    case 'area-camp':
      return const Color(0xFF2E7D32);
    default:
      return const Color(0xFF455A64);
  }
}

String formatRouteStatus(String status) {
  switch (status.toLowerCase()) {
    case 'terverifikasi':
      return 'Terverifikasi';
    case 'alternatif':
      return 'Alternatif';
    case 'dalam-perbaikan':
      return 'Perbaikan';
    case 'rusak':
      return 'Rusak';
    case 'terlarang':
      return 'Terlarang';
    default:
      return status;
  }
}

String formatRouteSurface(String surface) {
  switch (surface.toLowerCase()) {
    case 'aspal':
      return 'Aspal';
    case 'setapak':
      return 'Setapak';
    case 'tanah':
      return 'Tanah';
    case 'tanah-liat':
      return 'Tanah Liat';
    case 'batu':
      return 'Batu';
    case 'pasir':
      return 'Pasir';
    case 'campuran':
      return 'Campuran';
    default:
      return surface;
  }
}
