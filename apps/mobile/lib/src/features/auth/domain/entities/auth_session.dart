/// Authenticated user, mirroring `AuthUser` from the API.
class AuthUser {
  const AuthUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.avatarUrl,
  });

  final String id;
  final String name;
  final String email;
  final String role;
  final String? avatarUrl;

  String get roleLabel {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'merchant':
        return 'Merchant';
      default:
        return 'Wisatawan';
    }
  }

  String get initials {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty || parts.first.isEmpty) return 'D';
    final first = parts.first[0];
    final last = parts.length > 1 ? parts.last[0] : '';
    return '$first$last'.toUpperCase();
  }
}

/// Login session: access token plus user profile.
class AuthSession {
  const AuthSession({required this.token, required this.user});

  final String token;
  final AuthUser user;
}
