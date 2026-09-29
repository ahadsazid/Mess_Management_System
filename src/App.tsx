import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// ========================================================
// PAGE IMPORTS
// ========================================================

// Admin Pages
import AdminSignup from './pages/admin/AdminSignup';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import MembersManagement from './pages/admin/MembersManagement';
import MealsManagement from './pages/admin/MealsManagement';
import PaymentsManagement from './pages/admin/PaymentsManagement';
import MealPreferencesManagement from './pages/admin/MealPreferencesManagement';
import ManagerLottery from './pages/admin/ManagerLottery';
import NoticesManagement from './pages/admin/NoticesManagement';
import ExpensesManagement from './pages/admin/ExpensesManagement';
import AdminSettings from './pages/admin/AdminSettings';

// Member Pages
import MemberLogin from './pages/MemberLogin';
import MemberDashboard from './pages/member/MemberDashboard';
import MemberProfile from './pages/member/MemberProfile';
import MemberMeals from './pages/member/MemberMeals';
import MemberMealPreferences from './pages/member/MemberMealPreferences';
import MemberPayments from './pages/member/MemberPayments';
import MemberNotices from './pages/member/MemberNotices';

// ⭐ NEW: Personalized Meal Recommendation
import MealRecommendations from './pages/member/MealRecommendations';

// Auth
import AuthCallback from './pages/AuthCallback';


// ========================================================
// RootRedirect Component
// ========================================================

const RootRedirect = () => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  // ------------------------------------------------------
  // Loading
  // ------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ------------------------------------------------------
  // No authenticated user
  // ------------------------------------------------------
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ------------------------------------------------------
  // Root path
  // ------------------------------------------------------
  if (location.pathname === '/') {
    const lastPage = localStorage.getItem('lastVisitedPage');

    if (
      lastPage &&
      lastPage !== '/' &&
      lastPage !== '/login' &&
      lastPage !== '/admin/login'
    ) {
      return <Navigate to={lastPage} replace />;
    }

    // Default dashboard based on role
    return (
      <Navigate
        to={role === 'admin' ? '/admin/dashboard' : '/dashboard'}
        replace
      />
    );
  }

  return null;
};


// ========================================================
// App Routes
// ========================================================

function AppRoutes() {
  return (
    <Routes>

      {/* ==================================================
          ROOT ROUTE
      ================================================== */}

      <Route
        path="/"
        element={<RootRedirect />}
      />


      {/* ==================================================
          AUTH ROUTES
      ================================================== */}

      {/* Admin Signup */}
      <Route
        path="/admin/signup"
        element={<AdminSignup />}
      />

      {/* Admin Login */}
      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

      {/* Member Login */}
      <Route
        path="/login"
        element={<MemberLogin />}
      />

      {/* Google OAuth Callback */}
      <Route
        path="/auth/callback"
        element={<AuthCallback />}
      />


      {/* ==================================================
          ADMIN PROTECTED ROUTES
      ================================================== */}

      {/* --------------------------------------------------
          Admin Dashboard
      -------------------------------------------------- */}

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* --------------------------------------------------
          Members Management
      -------------------------------------------------- */}

      <Route
        path="/admin/members"
        element={
          <ProtectedRoute requiredRole="admin">
            <MembersManagement />
          </ProtectedRoute>
        }
      />

      {/* --------------------------------------------------
          Meals Management
      -------------------------------------------------- */}

      <Route
        path="/admin/meals"
        element={
          <ProtectedRoute requiredRole="admin">
            <MealsManagement />
          </ProtectedRoute>
        }
      />

      {/* --------------------------------------------------
          Payments Management
      -------------------------------------------------- */}

      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute requiredRole="admin">
            <PaymentsManagement />
          </ProtectedRoute>
        }
      />

      {/* --------------------------------------------------
          Meal Preferences Management
      -------------------------------------------------- */}

      <Route
        path="/admin/meal-preferences"
        element={
          <ProtectedRoute requiredRole="admin">
            <MealPreferencesManagement />
          </ProtectedRoute>
        }
      />

      {/* --------------------------------------------------
          Manager Lottery
      -------------------------------------------------- */}

      <Route
        path="/admin/manager-lottery"
        element={
          <ProtectedRoute requiredRole="admin">
            <ManagerLottery />
          </ProtectedRoute>
        }
      />

      {/* --------------------------------------------------
          Notices Management
      -------------------------------------------------- */}

      <Route
        path="/admin/notices"
        element={
          <ProtectedRoute requiredRole="admin">
            <NoticesManagement />
          </ProtectedRoute>
        }
      />

      {/* --------------------------------------------------
          Expenses Management
      -------------------------------------------------- */}

      <Route
        path="/admin/expenses"
        element={
          <ProtectedRoute requiredRole="admin">
            <ExpensesManagement />
          </ProtectedRoute>
        }
      />

      {/* --------------------------------------------------
          Admin Settings
      -------------------------------------------------- */}

      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminSettings />
          </ProtectedRoute>
        }
      />


      {/* ==================================================
          MEMBER PROTECTED ROUTES
      ================================================== */}

      {/* --------------------------------------------------
          Member Dashboard
      -------------------------------------------------- */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="member">
            <MemberDashboard />
          </ProtectedRoute>
        }
      />

      {/* --------------------------------------------------
          Member Profile
      -------------------------------------------------- */}

      <Route
        path="/profile"
        element={
          <ProtectedRoute requiredRole="member">
            <MemberProfile />
          </ProtectedRoute>
        }
      />

      {/* --------------------------------------------------
          Member Meals
      -------------------------------------------------- */}

      <Route
        path="/meals"
        element={
          <ProtectedRoute requiredRole="member">
            <MemberMeals />
          </ProtectedRoute>
        }
      />

      {/* --------------------------------------------------
          Member Meal Preferences
      -------------------------------------------------- */}

      <Route
        path="/meal-preferences"
        element={
          <ProtectedRoute requiredRole="member">
            <MemberMealPreferences />
          </ProtectedRoute>
        }
      />

      {/* --------------------------------------------------
          ⭐ NEW: Personalized Meal Recommendations
          --------------------------------------------------
          
          URL:
          /meal-recommendations

          This page is only accessible to authenticated
          members.
      -------------------------------------------------- */}

      <Route
        path="/meal-recommendations"
        element={
          <ProtectedRoute requiredRole="member">
            <MealRecommendations />
          </ProtectedRoute>
        }
      />

      {/* --------------------------------------------------
          Member Payments
      -------------------------------------------------- */}

      <Route
        path="/payments"
        element={
          <ProtectedRoute requiredRole="member">
            <MemberPayments />
          </ProtectedRoute>
        }
      />

      {/* --------------------------------------------------
          Member Notices
      -------------------------------------------------- */}

      <Route
        path="/notices"
        element={
          <ProtectedRoute requiredRole="member">
            <MemberNotices />
          </ProtectedRoute>
        }
      />


      {/* ==================================================
          FALLBACK ROUTE
      ================================================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}


// ========================================================
// Main App
// ========================================================

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

