import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:dolenae_mobile/src/core/result/result.dart';
import 'package:dolenae_mobile/src/core/error/app_failure.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/entities/travel_support.dart';
import 'package:dolenae_mobile/src/features/facilities/domain/repositories/facility_repository.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/controllers/facilities_controller.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/widgets/facilities_section.dart';
import 'package:dolenae_mobile/src/features/facilities/presentation/screens/facility_detail_screen.dart';

class PendingFacilities implements FacilityRepository {
  final lists = <String, Completer<Result<List<TravelSupport>>>>{};
  final details = <String, Completer<Result<TravelSupport>>>{};
  @override
  Future<Result<List<TravelSupport>>> list(String id) => (lists[id] = Completer()).future;
  @override
  Future<Result<TravelSupport>> getById(String id) => (details[id] = Completer()).future;
}
TravelSupport item(String id, String dest) => TravelSupport(id:id, destinationId:dest, name:id, category:SupportCategory.makanan, locationLabel:'',priceLabel:'',verified:false);
void main() {
  test('F4 controller ignores stale list/detail responses and disposal', () async {
    final repo = PendingFacilities();
    final controller = FacilitiesController(repo);
    final a = controller.load('a');
    final b = controller.load('b');
    repo.lists['b']!.complete(Success([item('b1','b')])); await b;
    repo.lists['a']!.complete(Success([item('a1','a')])); await a;
    expect(controller.supportsFor('b').single.id, 'b1');
    expect(controller.supportsFor('a'), isEmpty);
    final old = controller.loadDetail('old');
    final next = controller.loadDetail('next');
    repo.details['next']!.complete(Success(item('next','b'))); await next;
    repo.details['old']!.complete(Success(item('old','a'))); await old;
    expect(controller.resolve('old'), isNull);
    expect(controller.resolve('next')!.id, 'next');
    final pending = controller.load('gone');
    controller.dispose();
    repo.lists['gone']!.complete(const Success([])); await pending;
  });
  testWidgets('F4 section loads actual destination and exposes unverified API row', (tester) async {
    final repo = PendingFacilities();
    final controller = FacilitiesController(repo);
    addTearDown(controller.dispose);
    String? opened;
    await tester.pumpWidget(ChangeNotifierProvider.value(value:controller, child:MaterialApp(home:Scaffold(body:FacilitiesSection(destinationId:'actual', onOpenDetail:(id) => opened=id)))));
    await tester.pump();
    expect(repo.lists.containsKey('actual'), true);
    repo.lists['actual']!.complete(Success([item('API food','actual')]));
    await tester.pumpAndSettle();
    expect(find.text('API food'), findsOneWidget);
    await tester.tap(find.text('API food'));
    expect(opened, 'API food');
  });
  testWidgets('F4 deep link missing support shows unavailable, never first support', (tester) async {
    final repo = PendingFacilities();
    final controller = FacilitiesController(repo);
    addTearDown(controller.dispose);
    await tester.pumpWidget(ChangeNotifierProvider.value(value:controller, child:const MaterialApp(home:FacilityDetailScreen(supportId:'unknown'))));
    await tester.pump();
    expect(repo.details.containsKey('unknown'), true);
    repo.details['unknown']!.complete(const Failure(NetworkFailure('Fasilitas tidak tersedia.', code:'404')));
    await tester.pumpAndSettle();
    expect(find.text('Fasilitas tidak tersedia.'), findsOneWidget);
    expect(find.text('Homestay Cemara'), findsNothing);
  });
}
