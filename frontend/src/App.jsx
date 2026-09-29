import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { lazy, Suspense } from "react";
import AdminLayout from "./layouts/AdminLayout";
import Loader from "./components/Loader";
import { ToastProvider } from "d9-toast";
import ProfileLayout from "./layouts/ProfileLayout";

const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ForgotPage = lazy(() => import("./pages/ForgotPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ProductDetail = lazy(() => import("./pages/ProductView"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const PageNotFound = lazy(() => import("./pages/PageNotFound"));
const ProductList = lazy(() => import("./pages/admin/ProductList"));
const OrderList = lazy(() => import("./pages/admin/OrderList"));
const UserList = lazy(() => import("./pages/admin/UserList"));
const BannerList = lazy(() => import("./pages/admin/BannerList"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AddressPage = lazy(() => import("./pages/AddressPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const ReviewsPage = lazy(() => import("./pages/ReviewsPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage"));


const App = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Router>
        <ToastProvider position="top-right">
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <Routes>
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="forgot-password" element={<ForgotPage />} />
                  <Route path="reset-password/:token" element={<ForgotPage />} />
                  <Route path="verify-email" element={<VerifyEmailPage />} />
                  <Route path="verify-email/:token" element={<VerifyEmailPage />} />
                  <Route index element={<HomePage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="product/:id" element={<ProductDetail />} />
                  <Route path="category/:cat" element={<ProductsPage />} />
                  <Route path="featured/:sorted" element={<ProductsPage />} />
                  <Route path="new/:sorted" element={<ProductsPage />} />
                  <Route path="tags/:tag" element={<ProductsPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                 
                  {/* Account */}
                  <Route path="user" element={ <PrivateRoute> <ProfileLayout /> </PrivateRoute> }>
                    <Route index element={<ProfilePage />} />
                    <Route path="address" element={<AddressPage />} />
                    <Route path="account" element={<AccountPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="orders/:id" element={<OrderDetailPage />} />
                    <Route path="reviews" element={<ReviewsPage />} />
                    <Route path="wishlist" element={<WishlistPage />} />
                    <Route path="help" element={<ContactPage/>} />
                  </Route>

                  {/* Admin */}
                  <Route path="admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<ProductList />} />
                    <Route path="orders" element={<OrderList />} />
                    <Route path="users" element={<UserList />} />
                    <Route path="banners" element={<BannerList/>} />
                  </Route>
                  {/* 404 */}
                  <Route path="*" element={<PageNotFound />} />
                </Routes>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </Router>
    </Suspense>
  );
};

export default App;
