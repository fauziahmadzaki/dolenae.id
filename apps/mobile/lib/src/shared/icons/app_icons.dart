import 'package:flutter/material.dart';

/// Kumpulan ikon aplikasi.
///
/// Dipetakan ke Material Icons agar tanpa dependensi eksternal; seluruh ikon
/// berada di satu tempat sehingga mudah ditukar (mis. ke Lucide) nanti.
abstract final class AppIcons {
  static const IconData alertCircle = Icons.error_outline;
  static const IconData arrowLeft = Icons.arrow_back;
  static const IconData badgeCheck = Icons.verified_outlined;
  static const IconData bedDouble = Icons.hotel_outlined;
  static const IconData bell = Icons.notifications_none;
  static const IconData camera = Icons.photo_camera_outlined;
  static const IconData car = Icons.directions_car_outlined;
  static const IconData check = Icons.check;
  static const IconData chevronDown = Icons.expand_more;
  static const IconData chevronRight = Icons.chevron_right;
  static const IconData chrome = Icons.language;
  static const IconData compass = Icons.explore_outlined;
  static const IconData helpCircle = Icons.help_outline;
  static const IconData home = Icons.home_outlined;
  static const IconData hourglass = Icons.hourglass_empty;
  static const IconData info = Icons.info_outline;
  static const IconData lock = Icons.lock_outline;
  static const IconData mail = Icons.mail_outline;
  static const IconData map = Icons.map_outlined;
  static const IconData messageSquare = Icons.chat_bubble_outline;
  static const IconData mountain = Icons.landscape_outlined;
  static const IconData mountainSnow = Icons.terrain;
  static const IconData search = Icons.search;
  static const IconData slidersHorizontal = Icons.tune;
  static const IconData sparkles = Icons.auto_awesome_outlined;
  static const IconData sunrise = Icons.wb_twilight;
  static const IconData tent = Icons.cabin_outlined;
  static const IconData user = Icons.person_outline;
  static const IconData utensils = Icons.restaurant_outlined;
}
