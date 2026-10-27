import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:dolenae_mobile/src/features/routes/presentation/widgets/route_style.dart';

void main() {
  group('routeStatusColor', () {
    test('maps all known statuses and unknown fallback', () {
      expect(routeStatusColor('terlarang'), const Color(0xFFB71C1C));
      expect(routeStatusColor('rusak'), const Color(0xFFD32F2F));
      expect(routeStatusColor('dalam-perbaikan'), const Color(0xFFE65100));
      expect(routeStatusColor('terverifikasi'), const Color(0xFF00796B));
      expect(routeStatusColor('alternatif'), const Color(0xFF455A64));
      expect(routeStatusColor('unknown'), const Color(0xFF757575));
    });
  });

  group('routeSurfaceColor', () {
    test('maps all known surfaces and unknown fallback', () {
      expect(routeSurfaceColor('aspal'), const Color(0xFF37474F));
      expect(routeSurfaceColor('setapak'), const Color(0xFF2E7D32));
      expect(routeSurfaceColor('tanah'), const Color(0xFF795548));
      expect(routeSurfaceColor('tanah-liat'), const Color(0xFF8D6E63));
      expect(routeSurfaceColor('batu'), const Color(0xFF546E7A));
      expect(routeSurfaceColor('pasir'), const Color(0xFFA1887F));
      expect(routeSurfaceColor('campuran'), const Color(0xFF6D4C41));
      expect(routeSurfaceColor('other'), const Color(0xFF757575));
    });
  });

  group('routeStrokePattern', () {
    test('solid for terverifikasi and aspal', () {
      final v = routeStrokePattern(status: 'terverifikasi', surface: 'setapak');
      expect(v, equals(const StrokePattern.solid()));

      final a = routeStrokePattern(status: 'normal', surface: 'aspal');
      expect(a, equals(const StrokePattern.solid()));
    });

    test('dashed for alternatif, dalam-perbaikan, and setapak', () {
      final alt = routeStrokePattern(status: 'alternatif');
      expect(alt, equals(StrokePattern.dashed(segments: const [10, 5])));

      final perbaikan = routeStrokePattern(status: 'dalam-perbaikan');
      expect(perbaikan, equals(StrokePattern.dashed(segments: const [8, 4])));

      final setapak = routeStrokePattern(status: 'normal', surface: 'setapak');
      expect(setapak, equals(StrokePattern.dashed(segments: const [6, 4])));
    });

    test('dotted for rusak and terlarang', () {
      final rusak = routeStrokePattern(status: 'rusak');
      expect(rusak, equals(const StrokePattern.dotted()));

      final terlarang = routeStrokePattern(status: 'terlarang');
      expect(terlarang, equals(const StrokePattern.dotted()));
    });
  });

  group('nodeMarkerIcon and nodeMarkerColor', () {
    test('maps all node types', () {
      final types = [
        'basecamp',
        'gerbang',
        'parkir',
        'pos',
        'sumber-air',
        'water',
        'viewpoint',
        'puncak',
        'summit',
        'persimpangan',
        'area-camp',
        'unknown',
      ];

      for (final type in types) {
        final icon = nodeMarkerIcon(type);
        final color = nodeMarkerColor(type);
        expect(icon, isA<IconData>());
        expect(color, isA<Color>());
      }

      expect(nodeMarkerIcon('basecamp'), Icons.cabin);
      expect(nodeMarkerIcon('puncak'), Icons.terrain);
      expect(nodeMarkerIcon('summit'), Icons.terrain);
      expect(nodeMarkerIcon('water'), Icons.water_drop);
      expect(nodeMarkerIcon('pos'), Icons.flag);
      expect(nodeMarkerIcon('unknown'), Icons.place);
    });
  });

  group('formatting labels', () {
    test('formatRouteStatus', () {
      expect(formatRouteStatus('terverifikasi'), 'Terverifikasi');
      expect(formatRouteStatus('alternatif'), 'Alternatif');
      expect(formatRouteStatus('dalam-perbaikan'), 'Perbaikan');
      expect(formatRouteStatus('rusak'), 'Rusak');
      expect(formatRouteStatus('terlarang'), 'Terlarang');
      expect(formatRouteStatus('custom'), 'custom');
    });

    test('formatRouteSurface', () {
      expect(formatRouteSurface('aspal'), 'Aspal');
      expect(formatRouteSurface('setapak'), 'Setapak');
      expect(formatRouteSurface('tanah'), 'Tanah');
      expect(formatRouteSurface('tanah-liat'), 'Tanah Liat');
      expect(formatRouteSurface('batu'), 'Batu');
      expect(formatRouteSurface('pasir'), 'Pasir');
      expect(formatRouteSurface('campuran'), 'Campuran');
      expect(formatRouteSurface('custom'), 'custom');
    });
  });
}
