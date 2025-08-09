import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import OptimizedRoute from "./components/OptimizedRoute";
import { UserProvider } from "./contexts/UserContext";
import { MagitLogo } from "./components/MagitLogo";
import { FaviconManager } from "./components/FaviconManager";
import ChatWidget from "./components/ChatWidget";

// Lazy load heavy components
const ListProperty = lazy(() => import("./pages/ListProperty"));
const MyProperties = lazy(() => import("./pages/MyProperties"));
const SavedProperties = lazy(() => import("./pages/SavedProperties"));
const MyRequests = lazy(() => import("./pages/MyRequests"));
const VisitRequests = lazy(() => import("./pages/VisitRequests"));
const ModeratorDashboard = lazy(() => import("./pages/ModeratorDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCancelled = lazy(() => import("./pages/PaymentCancelled"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Properties = lazy(() => import("./pages/Properties"));
const ManageProperty = lazy(() => import("./pages/ManageProperty"));
const PropertyDetails = lazy(() => import("./pages/PropertyDetails"));
const Messages = lazy(() => import("./pages/Messages"));

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime in v5)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Shared loading component
const PageLoading = () => (
  <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
    <div className="text-center">
      <MagitLogo size="lg" isLoading={true} />
      <div className="animate-pulse">
        <div className="h-4 bg-muted rounded w-24 mx-auto mt-4"></div>
      </div>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light">
      <TooltipProvider>
        <UserProvider>
          <Toaster />
          <Sonner />
          {/* Favicon manager updates the tab icon based on theme and Halal mode */}
          <FaviconManager />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={
                <OptimizedRoute>
                  <Dashboard />
                </OptimizedRoute>
              } />
              <Route path="/profile" element={
                <OptimizedRoute>
                  <Suspense fallback={<PageLoading />}>
                    <Profile />
                  </Suspense>
                </OptimizedRoute>
              } />
              <Route path="/list-property" element={
                <OptimizedRoute>
                  <Suspense fallback={<PageLoading />}>
                    <ListProperty />
                  </Suspense>
                </OptimizedRoute>
              } />
              <Route path="/my-properties" element={
                <OptimizedRoute>
                  <Suspense fallback={<PageLoading />}>
                    <MyProperties />
                  </Suspense>
                </OptimizedRoute>
              } />
              <Route path="/saved-properties" element={
                <OptimizedRoute>
                  <Suspense fallback={<PageLoading />}>
                    <SavedProperties />
                  </Suspense>
                </OptimizedRoute>
              } />
              <Route path="/my-requests" element={
                <OptimizedRoute>
                  <Suspense fallback={<PageLoading />}>
                    <MyRequests />
                  </Suspense>
                </OptimizedRoute>
              } />
              <Route path="/visit-requests" element={
                <OptimizedRoute>
                  <Suspense fallback={<PageLoading />}>
                    <VisitRequests />
                  </Suspense>
                </OptimizedRoute>
              } />
              <Route path="/messages" element={
                <OptimizedRoute>
                  <Suspense fallback={<PageLoading />}>
                    <Messages />
                  </Suspense>
                </OptimizedRoute>
              } />
              <Route path="/moderator" element={
                <OptimizedRoute requiredRoles={['moderator', 'admin']}>
                  <Suspense fallback={<PageLoading />}>
                    <ModeratorDashboard />
                  </Suspense>
                </OptimizedRoute>
              } />
              <Route path="/admin" element={
                <OptimizedRoute requiredRoles={['admin']}>
                  <Suspense fallback={<PageLoading />}>
                    <AdminDashboard />
                  </Suspense>
                </OptimizedRoute>
              } />
              <Route path="/payment-success" element={
                <Suspense fallback={<PageLoading />}>
                  <PaymentSuccess />
                </Suspense>
              } />
              <Route path="/payment-cancelled" element={
                <Suspense fallback={<PageLoading />}> 
                  <PaymentCancelled />
                </Suspense>
              } />
              <Route path="/properties" element={
                <Suspense fallback={<PageLoading />}>
                  <Properties />
                </Suspense>
              } />
              <Route path="/property/:id" element={
                <Suspense fallback={<PageLoading />}>
                  <PropertyDetails />
                </Suspense>
              } />
              <Route path="/property/:id/manage" element={
                <OptimizedRoute>
                  <Suspense fallback={<PageLoading />}>
                    <ManageProperty />
                  </Suspense>
                </OptimizedRoute>
              } />
              <Route path="*" element={
                <Suspense fallback={<PageLoading />}> 
                  <NotFound />
                </Suspense>
              } />
            </Routes>
          </BrowserRouter>
          <ChatWidget />
        </UserProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
