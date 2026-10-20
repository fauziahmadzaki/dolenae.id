// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $CachedDestinationsTable extends CachedDestinations
    with TableInfo<$CachedDestinationsTable, CachedDestination> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $CachedDestinationsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _slugMeta = const VerificationMeta('slug');
  @override
  late final GeneratedColumn<String> slug = GeneratedColumn<String>(
    'slug',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
    'name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _taglineMeta = const VerificationMeta(
    'tagline',
  );
  @override
  late final GeneratedColumn<String> tagline = GeneratedColumn<String>(
    'tagline',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _descriptionMeta = const VerificationMeta(
    'description',
  );
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
    'description',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _difficultyMeta = const VerificationMeta(
    'difficulty',
  );
  @override
  late final GeneratedColumn<String> difficulty = GeneratedColumn<String>(
    'difficulty',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _bestSeasonMeta = const VerificationMeta(
    'bestSeason',
  );
  @override
  late final GeneratedColumn<String> bestSeason = GeneratedColumn<String>(
    'best_season',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('[]'),
  );
  static const VerificationMeta _tagsMeta = const VerificationMeta('tags');
  @override
  late final GeneratedColumn<String> tags = GeneratedColumn<String>(
    'tags',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('[]'),
  );
  static const VerificationMeta _terrainMeta = const VerificationMeta(
    'terrain',
  );
  @override
  late final GeneratedColumn<String> terrain = GeneratedColumn<String>(
    'terrain',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('[]'),
  );
  static const VerificationMeta _activitiesMeta = const VerificationMeta(
    'activities',
  );
  @override
  late final GeneratedColumn<String> activities = GeneratedColumn<String>(
    'activities',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('[]'),
  );
  static const VerificationMeta _provinceMeta = const VerificationMeta(
    'province',
  );
  @override
  late final GeneratedColumn<String> province = GeneratedColumn<String>(
    'province',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _regencyMeta = const VerificationMeta(
    'regency',
  );
  @override
  late final GeneratedColumn<String> regency = GeneratedColumn<String>(
    'regency',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _districtMeta = const VerificationMeta(
    'district',
  );
  @override
  late final GeneratedColumn<String> district = GeneratedColumn<String>(
    'district',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _latitudeMeta = const VerificationMeta(
    'latitude',
  );
  @override
  late final GeneratedColumn<double> latitude = GeneratedColumn<double>(
    'latitude',
    aliasedName,
    true,
    type: DriftSqlType.double,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _longitudeMeta = const VerificationMeta(
    'longitude',
  );
  @override
  late final GeneratedColumn<double> longitude = GeneratedColumn<double>(
    'longitude',
    aliasedName,
    true,
    type: DriftSqlType.double,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _accessPointMeta = const VerificationMeta(
    'accessPoint',
  );
  @override
  late final GeneratedColumn<String> accessPoint = GeneratedColumn<String>(
    'access_point',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _accessDescriptionMeta = const VerificationMeta(
    'accessDescription',
  );
  @override
  late final GeneratedColumn<String> accessDescription =
      GeneratedColumn<String>(
        'access_description',
        aliasedName,
        true,
        type: DriftSqlType.string,
        requiredDuringInsert: false,
      );
  static const VerificationMeta _accessTransportMeta = const VerificationMeta(
    'accessTransport',
  );
  @override
  late final GeneratedColumn<String> accessTransport = GeneratedColumn<String>(
    'access_transport',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('[]'),
  );
  static const VerificationMeta _accessDurationMeta = const VerificationMeta(
    'accessDuration',
  );
  @override
  late final GeneratedColumn<String> accessDuration = GeneratedColumn<String>(
    'access_duration',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _accessDistanceKmMeta = const VerificationMeta(
    'accessDistanceKm',
  );
  @override
  late final GeneratedColumn<double> accessDistanceKm = GeneratedColumn<double>(
    'access_distance_km',
    aliasedName,
    true,
    type: DriftSqlType.double,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _facilitiesMeta = const VerificationMeta(
    'facilities',
  );
  @override
  late final GeneratedColumn<String> facilities = GeneratedColumn<String>(
    'facilities',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('[]'),
  );
  static const VerificationMeta _entryFeeMeta = const VerificationMeta(
    'entryFee',
  );
  @override
  late final GeneratedColumn<int> entryFee = GeneratedColumn<int>(
    'entry_fee',
    aliasedName,
    true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _elevationMetersMeta = const VerificationMeta(
    'elevationMeters',
  );
  @override
  late final GeneratedColumn<int> elevationMeters = GeneratedColumn<int>(
    'elevation_meters',
    aliasedName,
    true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _imagesMeta = const VerificationMeta('images');
  @override
  late final GeneratedColumn<String> images = GeneratedColumn<String>(
    'images',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('[]'),
  );
  static const VerificationMeta _guideRequiredMeta = const VerificationMeta(
    'guideRequired',
  );
  @override
  late final GeneratedColumn<bool> guideRequired = GeneratedColumn<bool>(
    'guide_required',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("guide_required" IN (0, 1))',
    ),
    defaultValue: const Constant(false),
  );
  static const VerificationMeta _verifiedMeta = const VerificationMeta(
    'verified',
  );
  @override
  late final GeneratedColumn<bool> verified = GeneratedColumn<bool>(
    'verified',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("verified" IN (0, 1))',
    ),
    defaultValue: const Constant(false),
  );
  static const VerificationMeta _categoryIdsMeta = const VerificationMeta(
    'categoryIds',
  );
  @override
  late final GeneratedColumn<String> categoryIds = GeneratedColumn<String>(
    'category_ids',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('[]'),
  );
  static const VerificationMeta _sortOrderMeta = const VerificationMeta(
    'sortOrder',
  );
  @override
  late final GeneratedColumn<int> sortOrder = GeneratedColumn<int>(
    'sort_order',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _lastFetchedMeta = const VerificationMeta(
    'lastFetched',
  );
  @override
  late final GeneratedColumn<int> lastFetched = GeneratedColumn<int>(
    'last_fetched',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _serverUpdatedAtMeta = const VerificationMeta(
    'serverUpdatedAt',
  );
  @override
  late final GeneratedColumn<int> serverUpdatedAt = GeneratedColumn<int>(
    'server_updated_at',
    aliasedName,
    true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    slug,
    name,
    tagline,
    description,
    difficulty,
    bestSeason,
    tags,
    terrain,
    activities,
    province,
    regency,
    district,
    latitude,
    longitude,
    accessPoint,
    accessDescription,
    accessTransport,
    accessDuration,
    accessDistanceKm,
    facilities,
    entryFee,
    elevationMeters,
    images,
    guideRequired,
    verified,
    categoryIds,
    sortOrder,
    lastFetched,
    serverUpdatedAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'cached_destinations';
  @override
  VerificationContext validateIntegrity(
    Insertable<CachedDestination> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('slug')) {
      context.handle(
        _slugMeta,
        slug.isAcceptableOrUnknown(data['slug']!, _slugMeta),
      );
    } else if (isInserting) {
      context.missing(_slugMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
        _nameMeta,
        name.isAcceptableOrUnknown(data['name']!, _nameMeta),
      );
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('tagline')) {
      context.handle(
        _taglineMeta,
        tagline.isAcceptableOrUnknown(data['tagline']!, _taglineMeta),
      );
    }
    if (data.containsKey('description')) {
      context.handle(
        _descriptionMeta,
        description.isAcceptableOrUnknown(
          data['description']!,
          _descriptionMeta,
        ),
      );
    }
    if (data.containsKey('difficulty')) {
      context.handle(
        _difficultyMeta,
        difficulty.isAcceptableOrUnknown(data['difficulty']!, _difficultyMeta),
      );
    } else if (isInserting) {
      context.missing(_difficultyMeta);
    }
    if (data.containsKey('best_season')) {
      context.handle(
        _bestSeasonMeta,
        bestSeason.isAcceptableOrUnknown(data['best_season']!, _bestSeasonMeta),
      );
    }
    if (data.containsKey('tags')) {
      context.handle(
        _tagsMeta,
        tags.isAcceptableOrUnknown(data['tags']!, _tagsMeta),
      );
    }
    if (data.containsKey('terrain')) {
      context.handle(
        _terrainMeta,
        terrain.isAcceptableOrUnknown(data['terrain']!, _terrainMeta),
      );
    }
    if (data.containsKey('activities')) {
      context.handle(
        _activitiesMeta,
        activities.isAcceptableOrUnknown(data['activities']!, _activitiesMeta),
      );
    }
    if (data.containsKey('province')) {
      context.handle(
        _provinceMeta,
        province.isAcceptableOrUnknown(data['province']!, _provinceMeta),
      );
    }
    if (data.containsKey('regency')) {
      context.handle(
        _regencyMeta,
        regency.isAcceptableOrUnknown(data['regency']!, _regencyMeta),
      );
    }
    if (data.containsKey('district')) {
      context.handle(
        _districtMeta,
        district.isAcceptableOrUnknown(data['district']!, _districtMeta),
      );
    }
    if (data.containsKey('latitude')) {
      context.handle(
        _latitudeMeta,
        latitude.isAcceptableOrUnknown(data['latitude']!, _latitudeMeta),
      );
    }
    if (data.containsKey('longitude')) {
      context.handle(
        _longitudeMeta,
        longitude.isAcceptableOrUnknown(data['longitude']!, _longitudeMeta),
      );
    }
    if (data.containsKey('access_point')) {
      context.handle(
        _accessPointMeta,
        accessPoint.isAcceptableOrUnknown(
          data['access_point']!,
          _accessPointMeta,
        ),
      );
    }
    if (data.containsKey('access_description')) {
      context.handle(
        _accessDescriptionMeta,
        accessDescription.isAcceptableOrUnknown(
          data['access_description']!,
          _accessDescriptionMeta,
        ),
      );
    }
    if (data.containsKey('access_transport')) {
      context.handle(
        _accessTransportMeta,
        accessTransport.isAcceptableOrUnknown(
          data['access_transport']!,
          _accessTransportMeta,
        ),
      );
    }
    if (data.containsKey('access_duration')) {
      context.handle(
        _accessDurationMeta,
        accessDuration.isAcceptableOrUnknown(
          data['access_duration']!,
          _accessDurationMeta,
        ),
      );
    }
    if (data.containsKey('access_distance_km')) {
      context.handle(
        _accessDistanceKmMeta,
        accessDistanceKm.isAcceptableOrUnknown(
          data['access_distance_km']!,
          _accessDistanceKmMeta,
        ),
      );
    }
    if (data.containsKey('facilities')) {
      context.handle(
        _facilitiesMeta,
        facilities.isAcceptableOrUnknown(data['facilities']!, _facilitiesMeta),
      );
    }
    if (data.containsKey('entry_fee')) {
      context.handle(
        _entryFeeMeta,
        entryFee.isAcceptableOrUnknown(data['entry_fee']!, _entryFeeMeta),
      );
    }
    if (data.containsKey('elevation_meters')) {
      context.handle(
        _elevationMetersMeta,
        elevationMeters.isAcceptableOrUnknown(
          data['elevation_meters']!,
          _elevationMetersMeta,
        ),
      );
    }
    if (data.containsKey('images')) {
      context.handle(
        _imagesMeta,
        images.isAcceptableOrUnknown(data['images']!, _imagesMeta),
      );
    }
    if (data.containsKey('guide_required')) {
      context.handle(
        _guideRequiredMeta,
        guideRequired.isAcceptableOrUnknown(
          data['guide_required']!,
          _guideRequiredMeta,
        ),
      );
    }
    if (data.containsKey('verified')) {
      context.handle(
        _verifiedMeta,
        verified.isAcceptableOrUnknown(data['verified']!, _verifiedMeta),
      );
    }
    if (data.containsKey('category_ids')) {
      context.handle(
        _categoryIdsMeta,
        categoryIds.isAcceptableOrUnknown(
          data['category_ids']!,
          _categoryIdsMeta,
        ),
      );
    }
    if (data.containsKey('sort_order')) {
      context.handle(
        _sortOrderMeta,
        sortOrder.isAcceptableOrUnknown(data['sort_order']!, _sortOrderMeta),
      );
    } else if (isInserting) {
      context.missing(_sortOrderMeta);
    }
    if (data.containsKey('last_fetched')) {
      context.handle(
        _lastFetchedMeta,
        lastFetched.isAcceptableOrUnknown(
          data['last_fetched']!,
          _lastFetchedMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_lastFetchedMeta);
    }
    if (data.containsKey('server_updated_at')) {
      context.handle(
        _serverUpdatedAtMeta,
        serverUpdatedAt.isAcceptableOrUnknown(
          data['server_updated_at']!,
          _serverUpdatedAtMeta,
        ),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  CachedDestination map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return CachedDestination(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      slug: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}slug'],
      )!,
      name: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name'],
      )!,
      tagline: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}tagline'],
      ),
      description: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}description'],
      ),
      difficulty: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}difficulty'],
      )!,
      bestSeason: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}best_season'],
      )!,
      tags: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}tags'],
      )!,
      terrain: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}terrain'],
      )!,
      activities: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}activities'],
      )!,
      province: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}province'],
      ),
      regency: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}regency'],
      ),
      district: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}district'],
      ),
      latitude: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}latitude'],
      ),
      longitude: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}longitude'],
      ),
      accessPoint: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}access_point'],
      ),
      accessDescription: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}access_description'],
      ),
      accessTransport: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}access_transport'],
      )!,
      accessDuration: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}access_duration'],
      ),
      accessDistanceKm: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}access_distance_km'],
      ),
      facilities: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}facilities'],
      )!,
      entryFee: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}entry_fee'],
      ),
      elevationMeters: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}elevation_meters'],
      ),
      images: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}images'],
      )!,
      guideRequired: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}guide_required'],
      )!,
      verified: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}verified'],
      )!,
      categoryIds: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}category_ids'],
      )!,
      sortOrder: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}sort_order'],
      )!,
      lastFetched: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}last_fetched'],
      )!,
      serverUpdatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}server_updated_at'],
      ),
    );
  }

  @override
  $CachedDestinationsTable createAlias(String alias) {
    return $CachedDestinationsTable(attachedDatabase, alias);
  }
}

class CachedDestination extends DataClass
    implements Insertable<CachedDestination> {
  final String id;
  final String slug;
  final String name;
  final String? tagline;
  final String? description;
  final String difficulty;
  final String bestSeason;
  final String tags;
  final String terrain;
  final String activities;
  final String? province;
  final String? regency;
  final String? district;
  final double? latitude;
  final double? longitude;
  final String? accessPoint;
  final String? accessDescription;
  final String accessTransport;
  final String? accessDuration;
  final double? accessDistanceKm;
  final String facilities;
  final int? entryFee;
  final int? elevationMeters;
  final String images;
  final bool guideRequired;
  final bool verified;
  final String categoryIds;
  final int sortOrder;

  /// UTC millis saat baris ini terakhir diambil dari API.
  final int lastFetched;

  /// UTC millis `updatedAt` dari server (null bila tidak tersedia).
  final int? serverUpdatedAt;
  const CachedDestination({
    required this.id,
    required this.slug,
    required this.name,
    this.tagline,
    this.description,
    required this.difficulty,
    required this.bestSeason,
    required this.tags,
    required this.terrain,
    required this.activities,
    this.province,
    this.regency,
    this.district,
    this.latitude,
    this.longitude,
    this.accessPoint,
    this.accessDescription,
    required this.accessTransport,
    this.accessDuration,
    this.accessDistanceKm,
    required this.facilities,
    this.entryFee,
    this.elevationMeters,
    required this.images,
    required this.guideRequired,
    required this.verified,
    required this.categoryIds,
    required this.sortOrder,
    required this.lastFetched,
    this.serverUpdatedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['slug'] = Variable<String>(slug);
    map['name'] = Variable<String>(name);
    if (!nullToAbsent || tagline != null) {
      map['tagline'] = Variable<String>(tagline);
    }
    if (!nullToAbsent || description != null) {
      map['description'] = Variable<String>(description);
    }
    map['difficulty'] = Variable<String>(difficulty);
    map['best_season'] = Variable<String>(bestSeason);
    map['tags'] = Variable<String>(tags);
    map['terrain'] = Variable<String>(terrain);
    map['activities'] = Variable<String>(activities);
    if (!nullToAbsent || province != null) {
      map['province'] = Variable<String>(province);
    }
    if (!nullToAbsent || regency != null) {
      map['regency'] = Variable<String>(regency);
    }
    if (!nullToAbsent || district != null) {
      map['district'] = Variable<String>(district);
    }
    if (!nullToAbsent || latitude != null) {
      map['latitude'] = Variable<double>(latitude);
    }
    if (!nullToAbsent || longitude != null) {
      map['longitude'] = Variable<double>(longitude);
    }
    if (!nullToAbsent || accessPoint != null) {
      map['access_point'] = Variable<String>(accessPoint);
    }
    if (!nullToAbsent || accessDescription != null) {
      map['access_description'] = Variable<String>(accessDescription);
    }
    map['access_transport'] = Variable<String>(accessTransport);
    if (!nullToAbsent || accessDuration != null) {
      map['access_duration'] = Variable<String>(accessDuration);
    }
    if (!nullToAbsent || accessDistanceKm != null) {
      map['access_distance_km'] = Variable<double>(accessDistanceKm);
    }
    map['facilities'] = Variable<String>(facilities);
    if (!nullToAbsent || entryFee != null) {
      map['entry_fee'] = Variable<int>(entryFee);
    }
    if (!nullToAbsent || elevationMeters != null) {
      map['elevation_meters'] = Variable<int>(elevationMeters);
    }
    map['images'] = Variable<String>(images);
    map['guide_required'] = Variable<bool>(guideRequired);
    map['verified'] = Variable<bool>(verified);
    map['category_ids'] = Variable<String>(categoryIds);
    map['sort_order'] = Variable<int>(sortOrder);
    map['last_fetched'] = Variable<int>(lastFetched);
    if (!nullToAbsent || serverUpdatedAt != null) {
      map['server_updated_at'] = Variable<int>(serverUpdatedAt);
    }
    return map;
  }

  CachedDestinationsCompanion toCompanion(bool nullToAbsent) {
    return CachedDestinationsCompanion(
      id: Value(id),
      slug: Value(slug),
      name: Value(name),
      tagline: tagline == null && nullToAbsent
          ? const Value.absent()
          : Value(tagline),
      description: description == null && nullToAbsent
          ? const Value.absent()
          : Value(description),
      difficulty: Value(difficulty),
      bestSeason: Value(bestSeason),
      tags: Value(tags),
      terrain: Value(terrain),
      activities: Value(activities),
      province: province == null && nullToAbsent
          ? const Value.absent()
          : Value(province),
      regency: regency == null && nullToAbsent
          ? const Value.absent()
          : Value(regency),
      district: district == null && nullToAbsent
          ? const Value.absent()
          : Value(district),
      latitude: latitude == null && nullToAbsent
          ? const Value.absent()
          : Value(latitude),
      longitude: longitude == null && nullToAbsent
          ? const Value.absent()
          : Value(longitude),
      accessPoint: accessPoint == null && nullToAbsent
          ? const Value.absent()
          : Value(accessPoint),
      accessDescription: accessDescription == null && nullToAbsent
          ? const Value.absent()
          : Value(accessDescription),
      accessTransport: Value(accessTransport),
      accessDuration: accessDuration == null && nullToAbsent
          ? const Value.absent()
          : Value(accessDuration),
      accessDistanceKm: accessDistanceKm == null && nullToAbsent
          ? const Value.absent()
          : Value(accessDistanceKm),
      facilities: Value(facilities),
      entryFee: entryFee == null && nullToAbsent
          ? const Value.absent()
          : Value(entryFee),
      elevationMeters: elevationMeters == null && nullToAbsent
          ? const Value.absent()
          : Value(elevationMeters),
      images: Value(images),
      guideRequired: Value(guideRequired),
      verified: Value(verified),
      categoryIds: Value(categoryIds),
      sortOrder: Value(sortOrder),
      lastFetched: Value(lastFetched),
      serverUpdatedAt: serverUpdatedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(serverUpdatedAt),
    );
  }

  factory CachedDestination.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return CachedDestination(
      id: serializer.fromJson<String>(json['id']),
      slug: serializer.fromJson<String>(json['slug']),
      name: serializer.fromJson<String>(json['name']),
      tagline: serializer.fromJson<String?>(json['tagline']),
      description: serializer.fromJson<String?>(json['description']),
      difficulty: serializer.fromJson<String>(json['difficulty']),
      bestSeason: serializer.fromJson<String>(json['bestSeason']),
      tags: serializer.fromJson<String>(json['tags']),
      terrain: serializer.fromJson<String>(json['terrain']),
      activities: serializer.fromJson<String>(json['activities']),
      province: serializer.fromJson<String?>(json['province']),
      regency: serializer.fromJson<String?>(json['regency']),
      district: serializer.fromJson<String?>(json['district']),
      latitude: serializer.fromJson<double?>(json['latitude']),
      longitude: serializer.fromJson<double?>(json['longitude']),
      accessPoint: serializer.fromJson<String?>(json['accessPoint']),
      accessDescription: serializer.fromJson<String?>(
        json['accessDescription'],
      ),
      accessTransport: serializer.fromJson<String>(json['accessTransport']),
      accessDuration: serializer.fromJson<String?>(json['accessDuration']),
      accessDistanceKm: serializer.fromJson<double?>(json['accessDistanceKm']),
      facilities: serializer.fromJson<String>(json['facilities']),
      entryFee: serializer.fromJson<int?>(json['entryFee']),
      elevationMeters: serializer.fromJson<int?>(json['elevationMeters']),
      images: serializer.fromJson<String>(json['images']),
      guideRequired: serializer.fromJson<bool>(json['guideRequired']),
      verified: serializer.fromJson<bool>(json['verified']),
      categoryIds: serializer.fromJson<String>(json['categoryIds']),
      sortOrder: serializer.fromJson<int>(json['sortOrder']),
      lastFetched: serializer.fromJson<int>(json['lastFetched']),
      serverUpdatedAt: serializer.fromJson<int?>(json['serverUpdatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'slug': serializer.toJson<String>(slug),
      'name': serializer.toJson<String>(name),
      'tagline': serializer.toJson<String?>(tagline),
      'description': serializer.toJson<String?>(description),
      'difficulty': serializer.toJson<String>(difficulty),
      'bestSeason': serializer.toJson<String>(bestSeason),
      'tags': serializer.toJson<String>(tags),
      'terrain': serializer.toJson<String>(terrain),
      'activities': serializer.toJson<String>(activities),
      'province': serializer.toJson<String?>(province),
      'regency': serializer.toJson<String?>(regency),
      'district': serializer.toJson<String?>(district),
      'latitude': serializer.toJson<double?>(latitude),
      'longitude': serializer.toJson<double?>(longitude),
      'accessPoint': serializer.toJson<String?>(accessPoint),
      'accessDescription': serializer.toJson<String?>(accessDescription),
      'accessTransport': serializer.toJson<String>(accessTransport),
      'accessDuration': serializer.toJson<String?>(accessDuration),
      'accessDistanceKm': serializer.toJson<double?>(accessDistanceKm),
      'facilities': serializer.toJson<String>(facilities),
      'entryFee': serializer.toJson<int?>(entryFee),
      'elevationMeters': serializer.toJson<int?>(elevationMeters),
      'images': serializer.toJson<String>(images),
      'guideRequired': serializer.toJson<bool>(guideRequired),
      'verified': serializer.toJson<bool>(verified),
      'categoryIds': serializer.toJson<String>(categoryIds),
      'sortOrder': serializer.toJson<int>(sortOrder),
      'lastFetched': serializer.toJson<int>(lastFetched),
      'serverUpdatedAt': serializer.toJson<int?>(serverUpdatedAt),
    };
  }

  CachedDestination copyWith({
    String? id,
    String? slug,
    String? name,
    Value<String?> tagline = const Value.absent(),
    Value<String?> description = const Value.absent(),
    String? difficulty,
    String? bestSeason,
    String? tags,
    String? terrain,
    String? activities,
    Value<String?> province = const Value.absent(),
    Value<String?> regency = const Value.absent(),
    Value<String?> district = const Value.absent(),
    Value<double?> latitude = const Value.absent(),
    Value<double?> longitude = const Value.absent(),
    Value<String?> accessPoint = const Value.absent(),
    Value<String?> accessDescription = const Value.absent(),
    String? accessTransport,
    Value<String?> accessDuration = const Value.absent(),
    Value<double?> accessDistanceKm = const Value.absent(),
    String? facilities,
    Value<int?> entryFee = const Value.absent(),
    Value<int?> elevationMeters = const Value.absent(),
    String? images,
    bool? guideRequired,
    bool? verified,
    String? categoryIds,
    int? sortOrder,
    int? lastFetched,
    Value<int?> serverUpdatedAt = const Value.absent(),
  }) => CachedDestination(
    id: id ?? this.id,
    slug: slug ?? this.slug,
    name: name ?? this.name,
    tagline: tagline.present ? tagline.value : this.tagline,
    description: description.present ? description.value : this.description,
    difficulty: difficulty ?? this.difficulty,
    bestSeason: bestSeason ?? this.bestSeason,
    tags: tags ?? this.tags,
    terrain: terrain ?? this.terrain,
    activities: activities ?? this.activities,
    province: province.present ? province.value : this.province,
    regency: regency.present ? regency.value : this.regency,
    district: district.present ? district.value : this.district,
    latitude: latitude.present ? latitude.value : this.latitude,
    longitude: longitude.present ? longitude.value : this.longitude,
    accessPoint: accessPoint.present ? accessPoint.value : this.accessPoint,
    accessDescription: accessDescription.present
        ? accessDescription.value
        : this.accessDescription,
    accessTransport: accessTransport ?? this.accessTransport,
    accessDuration: accessDuration.present
        ? accessDuration.value
        : this.accessDuration,
    accessDistanceKm: accessDistanceKm.present
        ? accessDistanceKm.value
        : this.accessDistanceKm,
    facilities: facilities ?? this.facilities,
    entryFee: entryFee.present ? entryFee.value : this.entryFee,
    elevationMeters: elevationMeters.present
        ? elevationMeters.value
        : this.elevationMeters,
    images: images ?? this.images,
    guideRequired: guideRequired ?? this.guideRequired,
    verified: verified ?? this.verified,
    categoryIds: categoryIds ?? this.categoryIds,
    sortOrder: sortOrder ?? this.sortOrder,
    lastFetched: lastFetched ?? this.lastFetched,
    serverUpdatedAt: serverUpdatedAt.present
        ? serverUpdatedAt.value
        : this.serverUpdatedAt,
  );
  CachedDestination copyWithCompanion(CachedDestinationsCompanion data) {
    return CachedDestination(
      id: data.id.present ? data.id.value : this.id,
      slug: data.slug.present ? data.slug.value : this.slug,
      name: data.name.present ? data.name.value : this.name,
      tagline: data.tagline.present ? data.tagline.value : this.tagline,
      description: data.description.present
          ? data.description.value
          : this.description,
      difficulty: data.difficulty.present
          ? data.difficulty.value
          : this.difficulty,
      bestSeason: data.bestSeason.present
          ? data.bestSeason.value
          : this.bestSeason,
      tags: data.tags.present ? data.tags.value : this.tags,
      terrain: data.terrain.present ? data.terrain.value : this.terrain,
      activities: data.activities.present
          ? data.activities.value
          : this.activities,
      province: data.province.present ? data.province.value : this.province,
      regency: data.regency.present ? data.regency.value : this.regency,
      district: data.district.present ? data.district.value : this.district,
      latitude: data.latitude.present ? data.latitude.value : this.latitude,
      longitude: data.longitude.present ? data.longitude.value : this.longitude,
      accessPoint: data.accessPoint.present
          ? data.accessPoint.value
          : this.accessPoint,
      accessDescription: data.accessDescription.present
          ? data.accessDescription.value
          : this.accessDescription,
      accessTransport: data.accessTransport.present
          ? data.accessTransport.value
          : this.accessTransport,
      accessDuration: data.accessDuration.present
          ? data.accessDuration.value
          : this.accessDuration,
      accessDistanceKm: data.accessDistanceKm.present
          ? data.accessDistanceKm.value
          : this.accessDistanceKm,
      facilities: data.facilities.present
          ? data.facilities.value
          : this.facilities,
      entryFee: data.entryFee.present ? data.entryFee.value : this.entryFee,
      elevationMeters: data.elevationMeters.present
          ? data.elevationMeters.value
          : this.elevationMeters,
      images: data.images.present ? data.images.value : this.images,
      guideRequired: data.guideRequired.present
          ? data.guideRequired.value
          : this.guideRequired,
      verified: data.verified.present ? data.verified.value : this.verified,
      categoryIds: data.categoryIds.present
          ? data.categoryIds.value
          : this.categoryIds,
      sortOrder: data.sortOrder.present ? data.sortOrder.value : this.sortOrder,
      lastFetched: data.lastFetched.present
          ? data.lastFetched.value
          : this.lastFetched,
      serverUpdatedAt: data.serverUpdatedAt.present
          ? data.serverUpdatedAt.value
          : this.serverUpdatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('CachedDestination(')
          ..write('id: $id, ')
          ..write('slug: $slug, ')
          ..write('name: $name, ')
          ..write('tagline: $tagline, ')
          ..write('description: $description, ')
          ..write('difficulty: $difficulty, ')
          ..write('bestSeason: $bestSeason, ')
          ..write('tags: $tags, ')
          ..write('terrain: $terrain, ')
          ..write('activities: $activities, ')
          ..write('province: $province, ')
          ..write('regency: $regency, ')
          ..write('district: $district, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('accessPoint: $accessPoint, ')
          ..write('accessDescription: $accessDescription, ')
          ..write('accessTransport: $accessTransport, ')
          ..write('accessDuration: $accessDuration, ')
          ..write('accessDistanceKm: $accessDistanceKm, ')
          ..write('facilities: $facilities, ')
          ..write('entryFee: $entryFee, ')
          ..write('elevationMeters: $elevationMeters, ')
          ..write('images: $images, ')
          ..write('guideRequired: $guideRequired, ')
          ..write('verified: $verified, ')
          ..write('categoryIds: $categoryIds, ')
          ..write('sortOrder: $sortOrder, ')
          ..write('lastFetched: $lastFetched, ')
          ..write('serverUpdatedAt: $serverUpdatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hashAll([
    id,
    slug,
    name,
    tagline,
    description,
    difficulty,
    bestSeason,
    tags,
    terrain,
    activities,
    province,
    regency,
    district,
    latitude,
    longitude,
    accessPoint,
    accessDescription,
    accessTransport,
    accessDuration,
    accessDistanceKm,
    facilities,
    entryFee,
    elevationMeters,
    images,
    guideRequired,
    verified,
    categoryIds,
    sortOrder,
    lastFetched,
    serverUpdatedAt,
  ]);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is CachedDestination &&
          other.id == this.id &&
          other.slug == this.slug &&
          other.name == this.name &&
          other.tagline == this.tagline &&
          other.description == this.description &&
          other.difficulty == this.difficulty &&
          other.bestSeason == this.bestSeason &&
          other.tags == this.tags &&
          other.terrain == this.terrain &&
          other.activities == this.activities &&
          other.province == this.province &&
          other.regency == this.regency &&
          other.district == this.district &&
          other.latitude == this.latitude &&
          other.longitude == this.longitude &&
          other.accessPoint == this.accessPoint &&
          other.accessDescription == this.accessDescription &&
          other.accessTransport == this.accessTransport &&
          other.accessDuration == this.accessDuration &&
          other.accessDistanceKm == this.accessDistanceKm &&
          other.facilities == this.facilities &&
          other.entryFee == this.entryFee &&
          other.elevationMeters == this.elevationMeters &&
          other.images == this.images &&
          other.guideRequired == this.guideRequired &&
          other.verified == this.verified &&
          other.categoryIds == this.categoryIds &&
          other.sortOrder == this.sortOrder &&
          other.lastFetched == this.lastFetched &&
          other.serverUpdatedAt == this.serverUpdatedAt);
}

class CachedDestinationsCompanion extends UpdateCompanion<CachedDestination> {
  final Value<String> id;
  final Value<String> slug;
  final Value<String> name;
  final Value<String?> tagline;
  final Value<String?> description;
  final Value<String> difficulty;
  final Value<String> bestSeason;
  final Value<String> tags;
  final Value<String> terrain;
  final Value<String> activities;
  final Value<String?> province;
  final Value<String?> regency;
  final Value<String?> district;
  final Value<double?> latitude;
  final Value<double?> longitude;
  final Value<String?> accessPoint;
  final Value<String?> accessDescription;
  final Value<String> accessTransport;
  final Value<String?> accessDuration;
  final Value<double?> accessDistanceKm;
  final Value<String> facilities;
  final Value<int?> entryFee;
  final Value<int?> elevationMeters;
  final Value<String> images;
  final Value<bool> guideRequired;
  final Value<bool> verified;
  final Value<String> categoryIds;
  final Value<int> sortOrder;
  final Value<int> lastFetched;
  final Value<int?> serverUpdatedAt;
  final Value<int> rowid;
  const CachedDestinationsCompanion({
    this.id = const Value.absent(),
    this.slug = const Value.absent(),
    this.name = const Value.absent(),
    this.tagline = const Value.absent(),
    this.description = const Value.absent(),
    this.difficulty = const Value.absent(),
    this.bestSeason = const Value.absent(),
    this.tags = const Value.absent(),
    this.terrain = const Value.absent(),
    this.activities = const Value.absent(),
    this.province = const Value.absent(),
    this.regency = const Value.absent(),
    this.district = const Value.absent(),
    this.latitude = const Value.absent(),
    this.longitude = const Value.absent(),
    this.accessPoint = const Value.absent(),
    this.accessDescription = const Value.absent(),
    this.accessTransport = const Value.absent(),
    this.accessDuration = const Value.absent(),
    this.accessDistanceKm = const Value.absent(),
    this.facilities = const Value.absent(),
    this.entryFee = const Value.absent(),
    this.elevationMeters = const Value.absent(),
    this.images = const Value.absent(),
    this.guideRequired = const Value.absent(),
    this.verified = const Value.absent(),
    this.categoryIds = const Value.absent(),
    this.sortOrder = const Value.absent(),
    this.lastFetched = const Value.absent(),
    this.serverUpdatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  CachedDestinationsCompanion.insert({
    required String id,
    required String slug,
    required String name,
    this.tagline = const Value.absent(),
    this.description = const Value.absent(),
    required String difficulty,
    this.bestSeason = const Value.absent(),
    this.tags = const Value.absent(),
    this.terrain = const Value.absent(),
    this.activities = const Value.absent(),
    this.province = const Value.absent(),
    this.regency = const Value.absent(),
    this.district = const Value.absent(),
    this.latitude = const Value.absent(),
    this.longitude = const Value.absent(),
    this.accessPoint = const Value.absent(),
    this.accessDescription = const Value.absent(),
    this.accessTransport = const Value.absent(),
    this.accessDuration = const Value.absent(),
    this.accessDistanceKm = const Value.absent(),
    this.facilities = const Value.absent(),
    this.entryFee = const Value.absent(),
    this.elevationMeters = const Value.absent(),
    this.images = const Value.absent(),
    this.guideRequired = const Value.absent(),
    this.verified = const Value.absent(),
    this.categoryIds = const Value.absent(),
    required int sortOrder,
    required int lastFetched,
    this.serverUpdatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       slug = Value(slug),
       name = Value(name),
       difficulty = Value(difficulty),
       sortOrder = Value(sortOrder),
       lastFetched = Value(lastFetched);
  static Insertable<CachedDestination> custom({
    Expression<String>? id,
    Expression<String>? slug,
    Expression<String>? name,
    Expression<String>? tagline,
    Expression<String>? description,
    Expression<String>? difficulty,
    Expression<String>? bestSeason,
    Expression<String>? tags,
    Expression<String>? terrain,
    Expression<String>? activities,
    Expression<String>? province,
    Expression<String>? regency,
    Expression<String>? district,
    Expression<double>? latitude,
    Expression<double>? longitude,
    Expression<String>? accessPoint,
    Expression<String>? accessDescription,
    Expression<String>? accessTransport,
    Expression<String>? accessDuration,
    Expression<double>? accessDistanceKm,
    Expression<String>? facilities,
    Expression<int>? entryFee,
    Expression<int>? elevationMeters,
    Expression<String>? images,
    Expression<bool>? guideRequired,
    Expression<bool>? verified,
    Expression<String>? categoryIds,
    Expression<int>? sortOrder,
    Expression<int>? lastFetched,
    Expression<int>? serverUpdatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (slug != null) 'slug': slug,
      if (name != null) 'name': name,
      if (tagline != null) 'tagline': tagline,
      if (description != null) 'description': description,
      if (difficulty != null) 'difficulty': difficulty,
      if (bestSeason != null) 'best_season': bestSeason,
      if (tags != null) 'tags': tags,
      if (terrain != null) 'terrain': terrain,
      if (activities != null) 'activities': activities,
      if (province != null) 'province': province,
      if (regency != null) 'regency': regency,
      if (district != null) 'district': district,
      if (latitude != null) 'latitude': latitude,
      if (longitude != null) 'longitude': longitude,
      if (accessPoint != null) 'access_point': accessPoint,
      if (accessDescription != null) 'access_description': accessDescription,
      if (accessTransport != null) 'access_transport': accessTransport,
      if (accessDuration != null) 'access_duration': accessDuration,
      if (accessDistanceKm != null) 'access_distance_km': accessDistanceKm,
      if (facilities != null) 'facilities': facilities,
      if (entryFee != null) 'entry_fee': entryFee,
      if (elevationMeters != null) 'elevation_meters': elevationMeters,
      if (images != null) 'images': images,
      if (guideRequired != null) 'guide_required': guideRequired,
      if (verified != null) 'verified': verified,
      if (categoryIds != null) 'category_ids': categoryIds,
      if (sortOrder != null) 'sort_order': sortOrder,
      if (lastFetched != null) 'last_fetched': lastFetched,
      if (serverUpdatedAt != null) 'server_updated_at': serverUpdatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  CachedDestinationsCompanion copyWith({
    Value<String>? id,
    Value<String>? slug,
    Value<String>? name,
    Value<String?>? tagline,
    Value<String?>? description,
    Value<String>? difficulty,
    Value<String>? bestSeason,
    Value<String>? tags,
    Value<String>? terrain,
    Value<String>? activities,
    Value<String?>? province,
    Value<String?>? regency,
    Value<String?>? district,
    Value<double?>? latitude,
    Value<double?>? longitude,
    Value<String?>? accessPoint,
    Value<String?>? accessDescription,
    Value<String>? accessTransport,
    Value<String?>? accessDuration,
    Value<double?>? accessDistanceKm,
    Value<String>? facilities,
    Value<int?>? entryFee,
    Value<int?>? elevationMeters,
    Value<String>? images,
    Value<bool>? guideRequired,
    Value<bool>? verified,
    Value<String>? categoryIds,
    Value<int>? sortOrder,
    Value<int>? lastFetched,
    Value<int?>? serverUpdatedAt,
    Value<int>? rowid,
  }) {
    return CachedDestinationsCompanion(
      id: id ?? this.id,
      slug: slug ?? this.slug,
      name: name ?? this.name,
      tagline: tagline ?? this.tagline,
      description: description ?? this.description,
      difficulty: difficulty ?? this.difficulty,
      bestSeason: bestSeason ?? this.bestSeason,
      tags: tags ?? this.tags,
      terrain: terrain ?? this.terrain,
      activities: activities ?? this.activities,
      province: province ?? this.province,
      regency: regency ?? this.regency,
      district: district ?? this.district,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      accessPoint: accessPoint ?? this.accessPoint,
      accessDescription: accessDescription ?? this.accessDescription,
      accessTransport: accessTransport ?? this.accessTransport,
      accessDuration: accessDuration ?? this.accessDuration,
      accessDistanceKm: accessDistanceKm ?? this.accessDistanceKm,
      facilities: facilities ?? this.facilities,
      entryFee: entryFee ?? this.entryFee,
      elevationMeters: elevationMeters ?? this.elevationMeters,
      images: images ?? this.images,
      guideRequired: guideRequired ?? this.guideRequired,
      verified: verified ?? this.verified,
      categoryIds: categoryIds ?? this.categoryIds,
      sortOrder: sortOrder ?? this.sortOrder,
      lastFetched: lastFetched ?? this.lastFetched,
      serverUpdatedAt: serverUpdatedAt ?? this.serverUpdatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (slug.present) {
      map['slug'] = Variable<String>(slug.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (tagline.present) {
      map['tagline'] = Variable<String>(tagline.value);
    }
    if (description.present) {
      map['description'] = Variable<String>(description.value);
    }
    if (difficulty.present) {
      map['difficulty'] = Variable<String>(difficulty.value);
    }
    if (bestSeason.present) {
      map['best_season'] = Variable<String>(bestSeason.value);
    }
    if (tags.present) {
      map['tags'] = Variable<String>(tags.value);
    }
    if (terrain.present) {
      map['terrain'] = Variable<String>(terrain.value);
    }
    if (activities.present) {
      map['activities'] = Variable<String>(activities.value);
    }
    if (province.present) {
      map['province'] = Variable<String>(province.value);
    }
    if (regency.present) {
      map['regency'] = Variable<String>(regency.value);
    }
    if (district.present) {
      map['district'] = Variable<String>(district.value);
    }
    if (latitude.present) {
      map['latitude'] = Variable<double>(latitude.value);
    }
    if (longitude.present) {
      map['longitude'] = Variable<double>(longitude.value);
    }
    if (accessPoint.present) {
      map['access_point'] = Variable<String>(accessPoint.value);
    }
    if (accessDescription.present) {
      map['access_description'] = Variable<String>(accessDescription.value);
    }
    if (accessTransport.present) {
      map['access_transport'] = Variable<String>(accessTransport.value);
    }
    if (accessDuration.present) {
      map['access_duration'] = Variable<String>(accessDuration.value);
    }
    if (accessDistanceKm.present) {
      map['access_distance_km'] = Variable<double>(accessDistanceKm.value);
    }
    if (facilities.present) {
      map['facilities'] = Variable<String>(facilities.value);
    }
    if (entryFee.present) {
      map['entry_fee'] = Variable<int>(entryFee.value);
    }
    if (elevationMeters.present) {
      map['elevation_meters'] = Variable<int>(elevationMeters.value);
    }
    if (images.present) {
      map['images'] = Variable<String>(images.value);
    }
    if (guideRequired.present) {
      map['guide_required'] = Variable<bool>(guideRequired.value);
    }
    if (verified.present) {
      map['verified'] = Variable<bool>(verified.value);
    }
    if (categoryIds.present) {
      map['category_ids'] = Variable<String>(categoryIds.value);
    }
    if (sortOrder.present) {
      map['sort_order'] = Variable<int>(sortOrder.value);
    }
    if (lastFetched.present) {
      map['last_fetched'] = Variable<int>(lastFetched.value);
    }
    if (serverUpdatedAt.present) {
      map['server_updated_at'] = Variable<int>(serverUpdatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('CachedDestinationsCompanion(')
          ..write('id: $id, ')
          ..write('slug: $slug, ')
          ..write('name: $name, ')
          ..write('tagline: $tagline, ')
          ..write('description: $description, ')
          ..write('difficulty: $difficulty, ')
          ..write('bestSeason: $bestSeason, ')
          ..write('tags: $tags, ')
          ..write('terrain: $terrain, ')
          ..write('activities: $activities, ')
          ..write('province: $province, ')
          ..write('regency: $regency, ')
          ..write('district: $district, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('accessPoint: $accessPoint, ')
          ..write('accessDescription: $accessDescription, ')
          ..write('accessTransport: $accessTransport, ')
          ..write('accessDuration: $accessDuration, ')
          ..write('accessDistanceKm: $accessDistanceKm, ')
          ..write('facilities: $facilities, ')
          ..write('entryFee: $entryFee, ')
          ..write('elevationMeters: $elevationMeters, ')
          ..write('images: $images, ')
          ..write('guideRequired: $guideRequired, ')
          ..write('verified: $verified, ')
          ..write('categoryIds: $categoryIds, ')
          ..write('sortOrder: $sortOrder, ')
          ..write('lastFetched: $lastFetched, ')
          ..write('serverUpdatedAt: $serverUpdatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $CachedDestinationsTable cachedDestinations =
      $CachedDestinationsTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [cachedDestinations];
}

typedef $$CachedDestinationsTableCreateCompanionBuilder =
    CachedDestinationsCompanion Function({
      required String id,
      required String slug,
      required String name,
      Value<String?> tagline,
      Value<String?> description,
      required String difficulty,
      Value<String> bestSeason,
      Value<String> tags,
      Value<String> terrain,
      Value<String> activities,
      Value<String?> province,
      Value<String?> regency,
      Value<String?> district,
      Value<double?> latitude,
      Value<double?> longitude,
      Value<String?> accessPoint,
      Value<String?> accessDescription,
      Value<String> accessTransport,
      Value<String?> accessDuration,
      Value<double?> accessDistanceKm,
      Value<String> facilities,
      Value<int?> entryFee,
      Value<int?> elevationMeters,
      Value<String> images,
      Value<bool> guideRequired,
      Value<bool> verified,
      Value<String> categoryIds,
      required int sortOrder,
      required int lastFetched,
      Value<int?> serverUpdatedAt,
      Value<int> rowid,
    });
typedef $$CachedDestinationsTableUpdateCompanionBuilder =
    CachedDestinationsCompanion Function({
      Value<String> id,
      Value<String> slug,
      Value<String> name,
      Value<String?> tagline,
      Value<String?> description,
      Value<String> difficulty,
      Value<String> bestSeason,
      Value<String> tags,
      Value<String> terrain,
      Value<String> activities,
      Value<String?> province,
      Value<String?> regency,
      Value<String?> district,
      Value<double?> latitude,
      Value<double?> longitude,
      Value<String?> accessPoint,
      Value<String?> accessDescription,
      Value<String> accessTransport,
      Value<String?> accessDuration,
      Value<double?> accessDistanceKm,
      Value<String> facilities,
      Value<int?> entryFee,
      Value<int?> elevationMeters,
      Value<String> images,
      Value<bool> guideRequired,
      Value<bool> verified,
      Value<String> categoryIds,
      Value<int> sortOrder,
      Value<int> lastFetched,
      Value<int?> serverUpdatedAt,
      Value<int> rowid,
    });

class $$CachedDestinationsTableFilterComposer
    extends Composer<_$AppDatabase, $CachedDestinationsTable> {
  $$CachedDestinationsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get slug => $composableBuilder(
    column: $table.slug,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get tagline => $composableBuilder(
    column: $table.tagline,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get description => $composableBuilder(
    column: $table.description,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get difficulty => $composableBuilder(
    column: $table.difficulty,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get bestSeason => $composableBuilder(
    column: $table.bestSeason,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get tags => $composableBuilder(
    column: $table.tags,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get terrain => $composableBuilder(
    column: $table.terrain,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get activities => $composableBuilder(
    column: $table.activities,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get province => $composableBuilder(
    column: $table.province,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get regency => $composableBuilder(
    column: $table.regency,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get district => $composableBuilder(
    column: $table.district,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get latitude => $composableBuilder(
    column: $table.latitude,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get longitude => $composableBuilder(
    column: $table.longitude,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get accessPoint => $composableBuilder(
    column: $table.accessPoint,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get accessDescription => $composableBuilder(
    column: $table.accessDescription,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get accessTransport => $composableBuilder(
    column: $table.accessTransport,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get accessDuration => $composableBuilder(
    column: $table.accessDuration,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get accessDistanceKm => $composableBuilder(
    column: $table.accessDistanceKm,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get facilities => $composableBuilder(
    column: $table.facilities,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get entryFee => $composableBuilder(
    column: $table.entryFee,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get elevationMeters => $composableBuilder(
    column: $table.elevationMeters,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get images => $composableBuilder(
    column: $table.images,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get guideRequired => $composableBuilder(
    column: $table.guideRequired,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get verified => $composableBuilder(
    column: $table.verified,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get categoryIds => $composableBuilder(
    column: $table.categoryIds,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get sortOrder => $composableBuilder(
    column: $table.sortOrder,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get lastFetched => $composableBuilder(
    column: $table.lastFetched,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get serverUpdatedAt => $composableBuilder(
    column: $table.serverUpdatedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$CachedDestinationsTableOrderingComposer
    extends Composer<_$AppDatabase, $CachedDestinationsTable> {
  $$CachedDestinationsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get slug => $composableBuilder(
    column: $table.slug,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get tagline => $composableBuilder(
    column: $table.tagline,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get description => $composableBuilder(
    column: $table.description,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get difficulty => $composableBuilder(
    column: $table.difficulty,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get bestSeason => $composableBuilder(
    column: $table.bestSeason,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get tags => $composableBuilder(
    column: $table.tags,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get terrain => $composableBuilder(
    column: $table.terrain,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get activities => $composableBuilder(
    column: $table.activities,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get province => $composableBuilder(
    column: $table.province,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get regency => $composableBuilder(
    column: $table.regency,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get district => $composableBuilder(
    column: $table.district,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get latitude => $composableBuilder(
    column: $table.latitude,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get longitude => $composableBuilder(
    column: $table.longitude,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get accessPoint => $composableBuilder(
    column: $table.accessPoint,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get accessDescription => $composableBuilder(
    column: $table.accessDescription,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get accessTransport => $composableBuilder(
    column: $table.accessTransport,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get accessDuration => $composableBuilder(
    column: $table.accessDuration,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get accessDistanceKm => $composableBuilder(
    column: $table.accessDistanceKm,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get facilities => $composableBuilder(
    column: $table.facilities,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get entryFee => $composableBuilder(
    column: $table.entryFee,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get elevationMeters => $composableBuilder(
    column: $table.elevationMeters,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get images => $composableBuilder(
    column: $table.images,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get guideRequired => $composableBuilder(
    column: $table.guideRequired,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get verified => $composableBuilder(
    column: $table.verified,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get categoryIds => $composableBuilder(
    column: $table.categoryIds,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get sortOrder => $composableBuilder(
    column: $table.sortOrder,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get lastFetched => $composableBuilder(
    column: $table.lastFetched,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get serverUpdatedAt => $composableBuilder(
    column: $table.serverUpdatedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$CachedDestinationsTableAnnotationComposer
    extends Composer<_$AppDatabase, $CachedDestinationsTable> {
  $$CachedDestinationsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get slug =>
      $composableBuilder(column: $table.slug, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get tagline =>
      $composableBuilder(column: $table.tagline, builder: (column) => column);

  GeneratedColumn<String> get description => $composableBuilder(
    column: $table.description,
    builder: (column) => column,
  );

  GeneratedColumn<String> get difficulty => $composableBuilder(
    column: $table.difficulty,
    builder: (column) => column,
  );

  GeneratedColumn<String> get bestSeason => $composableBuilder(
    column: $table.bestSeason,
    builder: (column) => column,
  );

  GeneratedColumn<String> get tags =>
      $composableBuilder(column: $table.tags, builder: (column) => column);

  GeneratedColumn<String> get terrain =>
      $composableBuilder(column: $table.terrain, builder: (column) => column);

  GeneratedColumn<String> get activities => $composableBuilder(
    column: $table.activities,
    builder: (column) => column,
  );

  GeneratedColumn<String> get province =>
      $composableBuilder(column: $table.province, builder: (column) => column);

  GeneratedColumn<String> get regency =>
      $composableBuilder(column: $table.regency, builder: (column) => column);

  GeneratedColumn<String> get district =>
      $composableBuilder(column: $table.district, builder: (column) => column);

  GeneratedColumn<double> get latitude =>
      $composableBuilder(column: $table.latitude, builder: (column) => column);

  GeneratedColumn<double> get longitude =>
      $composableBuilder(column: $table.longitude, builder: (column) => column);

  GeneratedColumn<String> get accessPoint => $composableBuilder(
    column: $table.accessPoint,
    builder: (column) => column,
  );

  GeneratedColumn<String> get accessDescription => $composableBuilder(
    column: $table.accessDescription,
    builder: (column) => column,
  );

  GeneratedColumn<String> get accessTransport => $composableBuilder(
    column: $table.accessTransport,
    builder: (column) => column,
  );

  GeneratedColumn<String> get accessDuration => $composableBuilder(
    column: $table.accessDuration,
    builder: (column) => column,
  );

  GeneratedColumn<double> get accessDistanceKm => $composableBuilder(
    column: $table.accessDistanceKm,
    builder: (column) => column,
  );

  GeneratedColumn<String> get facilities => $composableBuilder(
    column: $table.facilities,
    builder: (column) => column,
  );

  GeneratedColumn<int> get entryFee =>
      $composableBuilder(column: $table.entryFee, builder: (column) => column);

  GeneratedColumn<int> get elevationMeters => $composableBuilder(
    column: $table.elevationMeters,
    builder: (column) => column,
  );

  GeneratedColumn<String> get images =>
      $composableBuilder(column: $table.images, builder: (column) => column);

  GeneratedColumn<bool> get guideRequired => $composableBuilder(
    column: $table.guideRequired,
    builder: (column) => column,
  );

  GeneratedColumn<bool> get verified =>
      $composableBuilder(column: $table.verified, builder: (column) => column);

  GeneratedColumn<String> get categoryIds => $composableBuilder(
    column: $table.categoryIds,
    builder: (column) => column,
  );

  GeneratedColumn<int> get sortOrder =>
      $composableBuilder(column: $table.sortOrder, builder: (column) => column);

  GeneratedColumn<int> get lastFetched => $composableBuilder(
    column: $table.lastFetched,
    builder: (column) => column,
  );

  GeneratedColumn<int> get serverUpdatedAt => $composableBuilder(
    column: $table.serverUpdatedAt,
    builder: (column) => column,
  );
}

class $$CachedDestinationsTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $CachedDestinationsTable,
          CachedDestination,
          $$CachedDestinationsTableFilterComposer,
          $$CachedDestinationsTableOrderingComposer,
          $$CachedDestinationsTableAnnotationComposer,
          $$CachedDestinationsTableCreateCompanionBuilder,
          $$CachedDestinationsTableUpdateCompanionBuilder,
          (
            CachedDestination,
            BaseReferences<
              _$AppDatabase,
              $CachedDestinationsTable,
              CachedDestination
            >,
          ),
          CachedDestination,
          PrefetchHooks Function()
        > {
  $$CachedDestinationsTableTableManager(
    _$AppDatabase db,
    $CachedDestinationsTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$CachedDestinationsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$CachedDestinationsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$CachedDestinationsTableAnnotationComposer(
                $db: db,
                $table: table,
              ),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> slug = const Value.absent(),
                Value<String> name = const Value.absent(),
                Value<String?> tagline = const Value.absent(),
                Value<String?> description = const Value.absent(),
                Value<String> difficulty = const Value.absent(),
                Value<String> bestSeason = const Value.absent(),
                Value<String> tags = const Value.absent(),
                Value<String> terrain = const Value.absent(),
                Value<String> activities = const Value.absent(),
                Value<String?> province = const Value.absent(),
                Value<String?> regency = const Value.absent(),
                Value<String?> district = const Value.absent(),
                Value<double?> latitude = const Value.absent(),
                Value<double?> longitude = const Value.absent(),
                Value<String?> accessPoint = const Value.absent(),
                Value<String?> accessDescription = const Value.absent(),
                Value<String> accessTransport = const Value.absent(),
                Value<String?> accessDuration = const Value.absent(),
                Value<double?> accessDistanceKm = const Value.absent(),
                Value<String> facilities = const Value.absent(),
                Value<int?> entryFee = const Value.absent(),
                Value<int?> elevationMeters = const Value.absent(),
                Value<String> images = const Value.absent(),
                Value<bool> guideRequired = const Value.absent(),
                Value<bool> verified = const Value.absent(),
                Value<String> categoryIds = const Value.absent(),
                Value<int> sortOrder = const Value.absent(),
                Value<int> lastFetched = const Value.absent(),
                Value<int?> serverUpdatedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => CachedDestinationsCompanion(
                id: id,
                slug: slug,
                name: name,
                tagline: tagline,
                description: description,
                difficulty: difficulty,
                bestSeason: bestSeason,
                tags: tags,
                terrain: terrain,
                activities: activities,
                province: province,
                regency: regency,
                district: district,
                latitude: latitude,
                longitude: longitude,
                accessPoint: accessPoint,
                accessDescription: accessDescription,
                accessTransport: accessTransport,
                accessDuration: accessDuration,
                accessDistanceKm: accessDistanceKm,
                facilities: facilities,
                entryFee: entryFee,
                elevationMeters: elevationMeters,
                images: images,
                guideRequired: guideRequired,
                verified: verified,
                categoryIds: categoryIds,
                sortOrder: sortOrder,
                lastFetched: lastFetched,
                serverUpdatedAt: serverUpdatedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String slug,
                required String name,
                Value<String?> tagline = const Value.absent(),
                Value<String?> description = const Value.absent(),
                required String difficulty,
                Value<String> bestSeason = const Value.absent(),
                Value<String> tags = const Value.absent(),
                Value<String> terrain = const Value.absent(),
                Value<String> activities = const Value.absent(),
                Value<String?> province = const Value.absent(),
                Value<String?> regency = const Value.absent(),
                Value<String?> district = const Value.absent(),
                Value<double?> latitude = const Value.absent(),
                Value<double?> longitude = const Value.absent(),
                Value<String?> accessPoint = const Value.absent(),
                Value<String?> accessDescription = const Value.absent(),
                Value<String> accessTransport = const Value.absent(),
                Value<String?> accessDuration = const Value.absent(),
                Value<double?> accessDistanceKm = const Value.absent(),
                Value<String> facilities = const Value.absent(),
                Value<int?> entryFee = const Value.absent(),
                Value<int?> elevationMeters = const Value.absent(),
                Value<String> images = const Value.absent(),
                Value<bool> guideRequired = const Value.absent(),
                Value<bool> verified = const Value.absent(),
                Value<String> categoryIds = const Value.absent(),
                required int sortOrder,
                required int lastFetched,
                Value<int?> serverUpdatedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => CachedDestinationsCompanion.insert(
                id: id,
                slug: slug,
                name: name,
                tagline: tagline,
                description: description,
                difficulty: difficulty,
                bestSeason: bestSeason,
                tags: tags,
                terrain: terrain,
                activities: activities,
                province: province,
                regency: regency,
                district: district,
                latitude: latitude,
                longitude: longitude,
                accessPoint: accessPoint,
                accessDescription: accessDescription,
                accessTransport: accessTransport,
                accessDuration: accessDuration,
                accessDistanceKm: accessDistanceKm,
                facilities: facilities,
                entryFee: entryFee,
                elevationMeters: elevationMeters,
                images: images,
                guideRequired: guideRequired,
                verified: verified,
                categoryIds: categoryIds,
                sortOrder: sortOrder,
                lastFetched: lastFetched,
                serverUpdatedAt: serverUpdatedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$CachedDestinationsTable, CachedDestination>(
                    table,
                  ),
                  BaseReferences<
                    _$AppDatabase,
                    $CachedDestinationsTable,
                    CachedDestination
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$CachedDestinationsTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $CachedDestinationsTable,
      CachedDestination,
      $$CachedDestinationsTableFilterComposer,
      $$CachedDestinationsTableOrderingComposer,
      $$CachedDestinationsTableAnnotationComposer,
      $$CachedDestinationsTableCreateCompanionBuilder,
      $$CachedDestinationsTableUpdateCompanionBuilder,
      (
        CachedDestination,
        BaseReferences<
          _$AppDatabase,
          $CachedDestinationsTable,
          CachedDestination
        >,
      ),
      CachedDestination,
      PrefetchHooks Function()
    >;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$CachedDestinationsTableTableManager get cachedDestinations =>
      $$CachedDestinationsTableTableManager(_db, _db.cachedDestinations);
}
