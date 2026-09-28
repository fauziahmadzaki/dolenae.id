import 'package:flutter/material.dart';

/// Elevasi ber-tint hangat (bone), sumber: `DESIGN.md` §5.
abstract final class AppShadows {
  static const sm = <BoxShadow>[
    BoxShadow(
      color: Color.fromRGBO(23, 27, 20, 0.05),
      blurRadius: 2,
      offset: Offset(0, 1),
    ),
    BoxShadow(
      color: Color.fromRGBO(23, 27, 20, 0.04),
      blurRadius: 4,
      offset: Offset(0, 1),
    ),
  ];

  static const md = <BoxShadow>[
    BoxShadow(
      color: Color.fromRGBO(23, 27, 20, 0.07),
      blurRadius: 12,
      offset: Offset(0, 4),
    ),
    BoxShadow(
      color: Color.fromRGBO(23, 27, 20, 0.04),
      blurRadius: 6,
      offset: Offset(0, 2),
    ),
  ];

  static const lg = <BoxShadow>[
    BoxShadow(
      color: Color.fromRGBO(23, 27, 20, 0.12),
      blurRadius: 32,
      offset: Offset(0, 12),
    ),
    BoxShadow(
      color: Color.fromRGBO(23, 27, 20, 0.07),
      blurRadius: 12,
      offset: Offset(0, 4),
    ),
  ];
}
