import 'package:dolenae_mobile/src/shared/widgets/dn_media_placeholder.dart';
import 'package:dolenae_mobile/src/shared/widgets/dn_remote_image.dart';
import 'package:flutter/material.dart';
import 'package:dolenae_mobile/src/core/config/app_config.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  for (final url in [null, '', 'http://[', 'javascript:alert(1)']) {
    testWidgets('media kosong/invalid $url langsung placeholder', (
      tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(home: DnRemoteImage(url: url, height: 170)),
      );
      expect(find.byType(DnMediaPlaceholder), findsOneWidget);
      expect(find.byType(Image), findsNothing);
      expect(tester.takeException(), isNull);
    });
  }
  testWidgets('loading, sukses, error menjaga dimensi dan clipping', (
    tester,
  ) async {
    final radius = BorderRadius.circular(12);
    await tester.pumpWidget(
      MaterialApp(
        home: Center(
          child: SizedBox(
            width: 300,
            child: DnRemoteImage(
              url: '/uploads/photo.png',
              height: 170,
              borderRadius: radius,
            ),
          ),
        ),
      ),
    );
    final image = tester.widget<Image>(find.byType(Image));
    expect(
      (image.image as NetworkImage).url,
      '${Uri.parse(AppConfig.apiBaseUrl).origin}/uploads/photo.png',
    );
    expect(image.fit, BoxFit.cover);
    expect(tester.getSize(find.byType(DnRemoteImage)), const Size(300, 170));
    expect(
      tester.widget<ClipRRect>(find.byType(ClipRRect).first).borderRadius,
      radius,
    );
    final context = tester.element(find.byType(Image));
    const child = SizedBox(key: Key('loaded'));
    expect(image.loadingBuilder!(context, child, null), same(child));
    final loading = image.loadingBuilder!(
      context,
      child,
      const ImageChunkEvent(cumulativeBytesLoaded: 1, expectedTotalBytes: 10),
    );
    expect(loading, isA<DnMediaPlaceholder>());
    expect(
      image.errorBuilder!(context, Exception('offline'), null),
      isA<DnMediaPlaceholder>(),
    );
    await tester.pumpAndSettle();
    expect(find.byType(DnMediaPlaceholder), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
