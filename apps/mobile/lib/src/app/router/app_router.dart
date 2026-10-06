import 'package:go_router/go_router.dart';

import '../../features/ai/presentation/ai_preferences_screen.dart';
import '../../features/ai/presentation/ai_results_screen.dart';
import '../../features/auth/presentation/change_password_screen.dart';
import '../../features/auth/presentation/forgot_password_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/otp_screen.dart';
import '../../features/checklist/presentation/add_checklist_item_screen.dart';
import '../../features/checklist/presentation/checklist_done_screen.dart';
import '../../features/checklist/presentation/checklist_screen.dart';
import '../../features/destination/presentation/destination_detail_screen.dart';
import '../../features/explore/presentation/explore_screen.dart';
import '../../features/facilities/presentation/facilities_screen.dart';
import '../../features/facilities/presentation/facility_detail_screen.dart';
import '../../features/facilities/presentation/proposal_success_screen.dart';
import '../../features/facilities/presentation/propose_facility_screen.dart';
import '../../features/home/presentation/beranda_screen.dart';
import '../../features/notifications/presentation/notifications_screen.dart';
import '../../features/onboarding/presentation/onboarding_screen.dart';
import '../../features/onboarding/presentation/splash_screen.dart';
import '../../features/plan/presentation/create_plan_screen.dart';
import '../../features/plan/presentation/plan_item_detail_screen.dart';
import '../../features/plan/presentation/plan_new_screen.dart';
import '../../features/plan/presentation/plan_success_screen.dart';
import '../../features/plan/presentation/select_destination_screen.dart';
import '../../features/plan/presentation/select_facility_screen.dart';
import '../../features/plan/presentation/trip_plan_screen.dart';
import '../../features/profile/presentation/edit_profile_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/saved/presentation/saved_checklists_screen.dart';
import '../../features/saved/presentation/saved_destinations_screen.dart';
import '../../features/saved/presentation/saved_plans_screen.dart';
import '../../features/saved/presentation/saved_proposals_screen.dart';
import '../../features/settings/presentation/settings_account_screen.dart';
import '../../features/settings/presentation/settings_faq_screen.dart';
import '../../features/settings/presentation/settings_feedback_screen.dart';
import '../../features/settings/presentation/settings_notifications_screen.dart';
import '../../features/settings/presentation/settings_privacy_screen.dart';
import '../../features/settings/presentation/settings_screen.dart';
import '../../features/settings/presentation/settings_theme_screen.dart';

/// Rute aplikasi (go_router).
abstract final class AppRouter {
  static final router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(path: '/', builder: (_, _) => const SplashScreen()),
      GoRoute(
        path: '/onboarding',
        builder: (_, _) => const OnboardingScreen(),
      ),
      GoRoute(path: '/login', builder: (_, _) => const LoginScreen()),

      // --- Pemulihan akun ------------------------------------------------
      GoRoute(
        path: '/auth/forgot-password',
        builder: (_, _) => const ForgotPasswordScreen(),
      ),
      GoRoute(path: '/auth/otp', builder: (_, _) => const OtpScreen()),
      GoRoute(
        path: '/auth/change-password',
        builder: (_, _) => const ChangePasswordScreen(),
      ),

      // --- Tab utama -----------------------------------------------------
      GoRoute(path: '/home', builder: (_, _) => const BerandaScreen()),
      GoRoute(path: '/explore', builder: (_, _) => const ExploreScreen()),
      GoRoute(path: '/plan', builder: (_, _) => const TripPlanScreen()),
      GoRoute(path: '/checklist', builder: (_, _) => const ChecklistScreen()),
      GoRoute(path: '/profile', builder: (_, _) => const ProfileScreen()),
      GoRoute(
        path: '/notifications',
        builder: (_, _) => const NotificationsScreen(),
      ),

      // --- Destinasi & fasilitas ------------------------------------------
      GoRoute(
        path: '/destination/:id',
        builder: (context, state) => DestinationDetailScreen(
          destinationId: state.pathParameters['id'] ?? 'dest-bromo',
        ),
      ),
      GoRoute(
        path: '/facilities',
        builder: (_, _) => const FacilitiesScreen(),
      ),
      GoRoute(
        path: '/facilities/propose',
        builder: (_, _) => const ProposeFacilityScreen(),
      ),
      GoRoute(
        path: '/facilities/propose/success',
        builder: (_, _) => const ProposalSuccessScreen(),
      ),
      GoRoute(
        path: '/facilities/:id',
        builder: (context, state) => FacilityDetailScreen(
          supportId: state.pathParameters['id'] ?? 'sup-homestay',
        ),
      ),

      // --- AI -------------------------------------------------------------
      GoRoute(
        path: '/ai/preferences',
        builder: (_, _) => const AiPreferencesScreen(),
      ),
      GoRoute(path: '/ai/results', builder: (_, _) => const AiResultsScreen()),

      // --- Rencana ---------------------------------------------------------
      GoRoute(
        path: '/plan/create',
        builder: (_, _) => const CreatePlanScreen(),
      ),
      GoRoute(
        path: '/plan/select-destination',
        builder: (_, _) => const SelectDestinationScreen(),
      ),
      GoRoute(
        path: '/plan/select-facility',
        builder: (_, _) => const SelectFacilityScreen(),
      ),
      GoRoute(path: '/plan/item', builder: (_, _) => const PlanItemDetailScreen()),
      GoRoute(
        path: '/plan/success',
        builder: (_, _) => const PlanSuccessScreen(),
      ),
      GoRoute(path: '/plan/new', builder: (_, _) => const PlanNewScreen()),

      // --- Checklist -------------------------------------------------------
      GoRoute(
        path: '/checklist/add',
        builder: (_, _) => const AddChecklistItemScreen(),
      ),
      GoRoute(
        path: '/checklist/done',
        builder: (_, _) => const ChecklistDoneScreen(),
      ),

      // --- Profil & setelan -------------------------------------------------
      GoRoute(
        path: '/profile/edit',
        builder: (_, _) => const EditProfileScreen(),
      ),
      GoRoute(path: '/settings', builder: (_, _) => const SettingsScreen()),
      GoRoute(
        path: '/settings/account',
        builder: (_, _) => const SettingsAccountScreen(),
      ),
      GoRoute(
        path: '/settings/notifications',
        builder: (_, _) => const SettingsNotificationsScreen(),
      ),
      GoRoute(
        path: '/settings/theme',
        builder: (_, _) => const SettingsThemeScreen(),
      ),
      GoRoute(
        path: '/settings/privacy',
        builder: (_, _) => const SettingsPrivacyScreen(),
      ),
      GoRoute(
        path: '/settings/faq',
        builder: (_, _) => const SettingsFaqScreen(),
      ),
      GoRoute(
        path: '/settings/feedback',
        builder: (_, _) => const SettingsFeedbackScreen(),
      ),

      // --- Tersimpan ---------------------------------------------------------
      GoRoute(
        path: '/saved/destinations',
        builder: (_, _) => const SavedDestinationsScreen(),
      ),
      GoRoute(
        path: '/saved/plans',
        builder: (_, _) => const SavedPlansScreen(),
      ),
      GoRoute(
        path: '/saved/checklists',
        builder: (_, _) => const SavedChecklistsScreen(),
      ),
      GoRoute(
        path: '/saved/proposals',
        builder: (_, _) => const SavedProposalsScreen(),
      ),
    ],
  );
}