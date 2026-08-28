import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import FloatingCSAgent from './components/ai/FloatingCSAgent';
import MobileBottomNav from './components/MobileBottomNav';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/Product/ProductDetail';
import Checkout from './pages/Checkout';
import Payment from './pages/Checkout/Payment';
import PaymentSuccess from './pages/Checkout/PaymentSuccess';
import PaymentFailed from './pages/Checkout/PaymentFailed';
import OrderDetail from './pages/Checkout/OrderDetail';
import Cart from './pages/Cart';
import NotFound from './pages/NotFound';
import Game from './pages/Game';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Help from './pages/Help';
import Unauthorized from './pages/Unauthorized';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import VerifyEmail from './pages/Auth/VerifyEmail';
import Account from './pages/Account';
import ProtectedRoute from './components/ProtectedRoute';
import PageLoader from './components/common/PageLoader';
import Offline from './pages/Offline';
// Legal pages
import Terms from './pages/Legal/Terms';
import Privacy from './pages/Legal/Privacy';
import RefundPolicy from './pages/Legal/RefundPolicy';
import SellerAgreement from './pages/Legal/SellerAgreement';
import BuyerProtection from './pages/Legal/BuyerProtection';
import ProhibitedProducts from './pages/Legal/ProhibitedProducts';
import PaymentPolicy from './pages/Legal/PaymentPolicy';
import DisputeResolution from './pages/Legal/DisputeResolution';
import CommunityGuidelines from './pages/Legal/CommunityGuidelines';
// Invoice
import InvoiceView from './pages/Invoice/InvoiceView';
import './styles/global.css';

// ---- Lazy-loaded heavy routes (code splitting) ----
const Chat = lazy(() => import('./pages/Chat'));
const BuyerDashboard = lazy(() => import('./pages/Buyer/BuyerDashboard'));
const BuyerOrders = lazy(() => import('./pages/Buyer/BuyerOrders'));
const BuyerOrderDetail = lazy(() => import('./pages/Buyer/BuyerOrderDetail'));
const BuyerWishlist = lazy(() => import('./pages/Buyer/BuyerWishlist'));
const BuyerWallet = lazy(() => import('./pages/Buyer/BuyerWallet'));
const BuyerMessages = lazy(() => import('./pages/Buyer/BuyerMessages'));
const BuyerNotifications = lazy(() => import('./pages/Buyer/BuyerNotifications'));
const BuyerProfile = lazy(() => import('./pages/Buyer/BuyerProfile'));
const BuyerSettings = lazy(() => import('./pages/Buyer/BuyerSettings'));
const BuyerDisputes = lazy(() => import('./pages/Buyer/BuyerDisputes'));
const BuyerOrderChat = lazy(() => import('./pages/Buyer/BuyerOrderChat'));
const SellerOrderChat = lazy(() => import('./pages/Seller/SellerOrderChat'));
const NotificationSettings = lazy(() => import('./pages/NotificationSettings'));
const SecuritySettings = lazy(() => import('./pages/Settings/SecuritySettings'));
const DeviceManagement = lazy(() => import('./pages/Settings/DeviceManagement'));
const TwoFactorSetup = lazy(() => import('./pages/Settings/TwoFactorSetup'));
const LoginActivity = lazy(() => import('./pages/Settings/LoginActivity'));
const SellerDashboard = lazy(() => import('./pages/Seller/Dashboard'));
const SellerPending = lazy(() => import('./pages/Seller/SellerPending'));
const SellerProducts = lazy(() => import('./pages/Seller/SellerProducts'));
const SellerProductCreate = lazy(() => import('./pages/Seller/SellerProductCreate'));
const SellerProductEdit = lazy(() => import('./pages/Seller/SellerProductEdit'));
const SellerOrders = lazy(() => import('./pages/Seller/SellerOrders'));
const SellerOrderDetail = lazy(() => import('./pages/Seller/SellerOrderDetail'));
const SellerEarnings = lazy(() => import('./pages/Seller/SellerEarnings'));
const SellerBalance = lazy(() => import('./pages/Seller/SellerBalance'));
const PublicSellerProfile = lazy(() => import('./pages/Seller/Profile'));
const SellerStore = lazy(() => import('./pages/Seller/SellerStore'));
const SellerProfile = lazy(() => import('./pages/Seller/SellerProfile'));
const SellerSettings = lazy(() => import('./pages/Seller/SellerSettings'));
const SellerRegister = lazy(() => import('./pages/Seller/SellerRegister'));
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));
const AdminDisputes = lazy(() => import('./pages/Admin/AdminDisputes'));
const AdminUsers = lazy(() => import('./pages/Admin/AdminUsers'));
const AdminSellers = lazy(() => import('./pages/Admin/AdminSellers'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdmin/Dashboard'));
// Super Admin exclusive pages
const SuperAdminWithdrawals = lazy(() => import('./pages/SuperAdmin/Withdrawals'));
const SuperAdminReports     = lazy(() => import('./pages/SuperAdmin/Reports'));
const SuperAdminVouchers    = lazy(() => import('./pages/SuperAdmin/Vouchers'));
const SuperAdminCategories  = lazy(() => import('./pages/SuperAdmin/Categories'));
const SuperAdminAuditLogs   = lazy(() => import('./pages/SuperAdmin/AuditLogs'));
const SuperAdminAdminUsers  = lazy(() => import('./pages/SuperAdmin/AdminUsers'));
const SuperAdminSettings    = lazy(() => import('./pages/SuperAdmin/Settings'));
const SuperAdminKycReview   = lazy(() => import('./pages/SuperAdmin/KycReview'));
const SellerIdentityVerification = lazy(() => import('./pages/Seller/SellerIdentityVerification'));
const EnterpriseDashboard = lazy(() => import('./pages/Admin/Enterprise/TenantDashboard'));
const EnterpriseTenants = lazy(() => import('./pages/Admin/Enterprise/TenantManagement'));
const ExchangeRates = lazy(() => import('./pages/Admin/Enterprise/ExchangeRates'));
const ThemeBuilder = lazy(() => import('./pages/Admin/Enterprise/ThemeBuilder'));
const CMSBuilder = lazy(() => import('./pages/Admin/Enterprise/CMSBuilder'));
const Subscription = lazy(() => import('./pages/Admin/Enterprise/Subscription'));
const Billing = lazy(() => import('./pages/Admin/Enterprise/Billing'));
const Monitoring = lazy(() => import('./pages/Admin/Enterprise/Monitoring'));
const Backup = lazy(() => import('./pages/Admin/Enterprise/Backup'));
const AuditEnterprise = lazy(() => import('./pages/Admin/Enterprise/AuditEnterprise'));
const FeatureFlags = lazy(() => import('./pages/Admin/Enterprise/FeatureFlags'));
const Whitelabel = lazy(() => import('./pages/Admin/Enterprise/Whitelabel'));
const AdminAI = lazy(() => import('./pages/Admin/AdminAI'));
const AdminAIPlugins = lazy(() => import('./pages/Admin/AdminAIPlugins'));

const withSuspense = (el) => <Suspense fallback={<PageLoader />}>{el}</Suspense>;

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/marketplace' element={<Marketplace />} />
        <Route path='/product/:slug' element={<ProductDetail />} />
        <Route path='/game/:slug' element={<Game />} />
        <Route path='/seller' element={<Navigate to='/seller/register' replace />} />
        <Route path='/seller/:slug' element={withSuspense(<PublicSellerProfile />)} />
        <Route path='/notifications' element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path='/notifications/settings' element={<ProtectedRoute>{withSuspense(<NotificationSettings />)}</ProtectedRoute>} />
        <Route path='/messages' element={<ProtectedRoute allowedRoles={['BUYER', 'USER', 'SELLER']}>{withSuspense(<BuyerMessages />)}</ProtectedRoute>} />
        <Route path='/help' element={<Help />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/offline' element={<Offline />} />
        <Route path='/chat' element={<ProtectedRoute>{withSuspense(<Chat />)}</ProtectedRoute>} />
        <Route path='/checkout' element={<ProtectedRoute allowedRoles={['BUYER', 'USER']}><Checkout /></ProtectedRoute>} />
        <Route path='/checkout/payment/:orderNumber' element={<ProtectedRoute allowedRoles={['BUYER', 'USER']}><Payment /></ProtectedRoute>} />
        <Route path='/checkout/success/:orderNumber' element={<ProtectedRoute allowedRoles={['BUYER', 'USER']}><PaymentSuccess /></ProtectedRoute>} />
        <Route path='/checkout/failed/:orderNumber' element={<ProtectedRoute allowedRoles={['BUYER', 'USER']}><PaymentFailed /></ProtectedRoute>} />
        <Route path='/order/:orderNumber' element={<ProtectedRoute allowedRoles={['BUYER', 'USER']}><OrderDetail /></ProtectedRoute>} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/verify-email' element={<VerifyEmail />} />
        <Route path='/account' element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path='/unauthorized' element={<Unauthorized />} />
        <Route path='/buyer/dashboard' element={<ProtectedRoute allowedRoles={['BUYER', 'USER']}>{withSuspense(<BuyerDashboard />)}</ProtectedRoute>} />
        <Route path='/buyer/orders' element={<ProtectedRoute allowedRoles={['BUYER', 'USER']}>{withSuspense(<BuyerOrders />)}</ProtectedRoute>} />
        <Route path='/buyer/orders/:orderNumber' element={<ProtectedRoute allowedRoles={['BUYER', 'USER']}>{withSuspense(<BuyerOrderDetail />)}</ProtectedRoute>} />
        <Route path='/buyer/orders/:orderNumber/chat' element={<ProtectedRoute allowedRoles={['BUYER', 'USER']}>{withSuspense(<BuyerOrderChat />)}</ProtectedRoute>} />
        <Route path='/buyer/wishlist' element={<ProtectedRoute allowedRoles={['BUYER', 'USER']}>{withSuspense(<BuyerWishlist />)}</ProtectedRoute>} />
        <Route path='/buyer/wallet' element={<ProtectedRoute allowedRoles={['BUYER', 'USER']}>{withSuspense(<BuyerWallet />)}</ProtectedRoute>} />
        <Route path='/buyer/messages' element={<ProtectedRoute allowedRoles={['BUYER', 'USER']}>{withSuspense(<BuyerMessages />)}</ProtectedRoute>} />
        <Route path='/buyer/notifications' element={<ProtectedRoute allowedRoles={['BUYER', 'USER']}>{withSuspense(<BuyerNotifications />)}</ProtectedRoute>} />
        <Route path='/buyer/profile' element={<ProtectedRoute allowedRoles={['BUYER', 'USER']}>{withSuspense(<BuyerProfile />)}</ProtectedRoute>} />
        <Route path='/buyer/settings' element={<ProtectedRoute allowedRoles={['BUYER', 'USER']}>{withSuspense(<BuyerSettings />)}</ProtectedRoute>} />
        <Route path='/buyer/settings/security' element={<ProtectedRoute allowedRoles={['BUYER', 'USER']}>{withSuspense(<SecuritySettings />)}</ProtectedRoute>} />
        <Route path='/buyer/settings/devices' element={<ProtectedRoute allowedRoles={['BUYER', 'USER']}>{withSuspense(<DeviceManagement />)}</ProtectedRoute>} />
        <Route path='/buyer/settings/2fa' element={<ProtectedRoute allowedRoles={['BUYER', 'USER']}>{withSuspense(<TwoFactorSetup />)}</ProtectedRoute>} />
        <Route path='/buyer/settings/login-activity' element={<ProtectedRoute allowedRoles={['BUYER', 'USER']}>{withSuspense(<LoginActivity />)}</ProtectedRoute>} />
        <Route path='/buyer/disputes' element={<ProtectedRoute allowedRoles={['BUYER', 'USER']}>{withSuspense(<BuyerDisputes />)}</ProtectedRoute>} />
        <Route path='/seller/register' element={<SellerRegister />} />
        <Route path='/seller/pending' element={<SellerPending />} />
        <Route path='/seller/dashboard' element={<ProtectedRoute allowedRoles={['SELLER']} requireSellerApproved>{withSuspense(<SellerDashboard />)}</ProtectedRoute>} />
        <Route path='/seller/products' element={<ProtectedRoute allowedRoles={['SELLER']} requireSellerApproved>{withSuspense(<SellerProducts />)}</ProtectedRoute>} />
        <Route path='/seller/products/new' element={<ProtectedRoute allowedRoles={['SELLER']} requireSellerApproved>{withSuspense(<SellerProductCreate />)}</ProtectedRoute>} />
        <Route path='/seller/products/:productId/edit' element={<ProtectedRoute allowedRoles={['SELLER']} requireSellerApproved>{withSuspense(<SellerProductEdit />)}</ProtectedRoute>} />
        <Route path='/seller/orders' element={<ProtectedRoute allowedRoles={['SELLER']} requireSellerApproved>{withSuspense(<SellerOrders />)}</ProtectedRoute>} />
        <Route path='/seller/orders/:orderNumber' element={<ProtectedRoute allowedRoles={['SELLER']} requireSellerApproved>{withSuspense(<SellerOrderDetail />)}</ProtectedRoute>} />
        <Route path='/seller/orders/:orderNumber/chat' element={<ProtectedRoute allowedRoles={['SELLER']} requireSellerApproved>{withSuspense(<SellerOrderChat />)}</ProtectedRoute>} />
        <Route path='/seller/earnings' element={<ProtectedRoute allowedRoles={['SELLER']} requireSellerApproved>{withSuspense(<SellerEarnings />)}</ProtectedRoute>} />
        <Route path='/seller/balance' element={<ProtectedRoute allowedRoles={['SELLER']} requireSellerApproved>{withSuspense(<SellerBalance />)}</ProtectedRoute>} />
        <Route path='/seller/store' element={<ProtectedRoute allowedRoles={['SELLER']} requireSellerApproved>{withSuspense(<SellerStore />)}</ProtectedRoute>} />
        <Route path='/seller/profile' element={<ProtectedRoute allowedRoles={['SELLER']} requireSellerApproved>{withSuspense(<SellerProfile />)}</ProtectedRoute>} />
        <Route path='/seller/settings' element={<ProtectedRoute allowedRoles={['SELLER']} requireSellerApproved>{withSuspense(<SellerSettings />)}</ProtectedRoute>} />
        {/* Seller Identity Verification — SELLER yang sudah approved dapat akses */}
        <Route path='/seller/verification' element={<ProtectedRoute allowedRoles={['SELLER']}>{withSuspense(<SellerIdentityVerification />)}</ProtectedRoute>} />
        <Route path='/seller/*' element={<ProtectedRoute allowedRoles={['SELLER']} requireSellerApproved>{withSuspense(<SellerDashboard />)}</ProtectedRoute>} />
        <Route path='/admin/dashboard' element={<ProtectedRoute allowedRoles={['ADMIN','SUPER_ADMIN']}>{withSuspense(<AdminDashboard />)}</ProtectedRoute>} />
        <Route path='/admin/users'    element={<ProtectedRoute allowedRoles={['ADMIN','SUPER_ADMIN']}>{withSuspense(<AdminUsers />)}</ProtectedRoute>} />
        <Route path='/admin/sellers'  element={<ProtectedRoute allowedRoles={['ADMIN','SUPER_ADMIN']}>{withSuspense(<AdminSellers />)}</ProtectedRoute>} />
        <Route path='/admin/disputes' element={<ProtectedRoute allowedRoles={['ADMIN','SUPER_ADMIN']}>{withSuspense(<AdminDisputes />)}</ProtectedRoute>} />
        <Route path='/admin/enterprise' element={<ProtectedRoute allowedRoles={['ADMIN','SUPER_ADMIN']}>{withSuspense(<EnterpriseDashboard />)}</ProtectedRoute>} />
        <Route path='/admin/enterprise/tenants' element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}>{withSuspense(<EnterpriseTenants />)}</ProtectedRoute>} />
        <Route path='/admin/enterprise/exchange-rates' element={<ProtectedRoute allowedRoles={['ADMIN','SUPER_ADMIN']}>{withSuspense(<ExchangeRates />)}</ProtectedRoute>} />
        <Route path='/admin/enterprise/theme' element={<ProtectedRoute allowedRoles={['ADMIN','SUPER_ADMIN']}>{withSuspense(<ThemeBuilder />)}</ProtectedRoute>} />
        <Route path='/admin/enterprise/cms' element={<ProtectedRoute allowedRoles={['ADMIN','SUPER_ADMIN']}>{withSuspense(<CMSBuilder />)}</ProtectedRoute>} />
        <Route path='/admin/enterprise/subscription' element={<ProtectedRoute allowedRoles={['ADMIN','SUPER_ADMIN']}>{withSuspense(<Subscription />)}</ProtectedRoute>} />
        <Route path='/admin/enterprise/billing' element={<ProtectedRoute allowedRoles={['ADMIN','SUPER_ADMIN']}>{withSuspense(<Billing />)}</ProtectedRoute>} />
        <Route path='/admin/enterprise/monitoring' element={<ProtectedRoute allowedRoles={['ADMIN','SUPER_ADMIN']}>{withSuspense(<Monitoring />)}</ProtectedRoute>} />
        <Route path='/admin/enterprise/backup' element={<ProtectedRoute allowedRoles={['ADMIN','SUPER_ADMIN']}>{withSuspense(<Backup />)}</ProtectedRoute>} />
        <Route path='/admin/enterprise/audit' element={<ProtectedRoute allowedRoles={['ADMIN','SUPER_ADMIN']}>{withSuspense(<AuditEnterprise />)}</ProtectedRoute>} />
        <Route path='/admin/enterprise/features' element={<ProtectedRoute allowedRoles={['ADMIN','SUPER_ADMIN']}>{withSuspense(<FeatureFlags />)}</ProtectedRoute>} />
        <Route path='/admin/enterprise/whitelabel' element={<ProtectedRoute allowedRoles={['ADMIN','SUPER_ADMIN']}>{withSuspense(<Whitelabel />)}</ProtectedRoute>} />
        <Route path='/admin/ai' element={<ProtectedRoute allowedRoles={['ADMIN','SUPER_ADMIN']}>{withSuspense(<AdminAI />)}</ProtectedRoute>} />
        <Route path='/admin/ai/plugins' element={<ProtectedRoute allowedRoles={['ADMIN','SUPER_ADMIN']}>{withSuspense(<AdminAIPlugins />)}</ProtectedRoute>} />
        <Route path='/admin/*' element={<ProtectedRoute allowedRoles={['ADMIN','SUPER_ADMIN']}>{withSuspense(<AdminDashboard />)}</ProtectedRoute>} />
        <Route path='/super-admin/dashboard' element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}>{withSuspense(<SuperAdminDashboard />)}</ProtectedRoute>} />

        {/* ---- Super Admin exclusive routes ---- */}
        <Route path='/super-admin/withdrawals'  element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}>{withSuspense(<SuperAdminWithdrawals />)}</ProtectedRoute>} />
        <Route path='/super-admin/reports'      element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}>{withSuspense(<SuperAdminReports />)}</ProtectedRoute>} />
        <Route path='/super-admin/vouchers'     element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}>{withSuspense(<SuperAdminVouchers />)}</ProtectedRoute>} />
        <Route path='/super-admin/categories'   element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}>{withSuspense(<SuperAdminCategories />)}</ProtectedRoute>} />
        <Route path='/super-admin/audit-logs'   element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}>{withSuspense(<SuperAdminAuditLogs />)}</ProtectedRoute>} />
        <Route path='/super-admin/admin-users'  element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}>{withSuspense(<SuperAdminAdminUsers />)}</ProtectedRoute>} />
        <Route path='/super-admin/settings'     element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}>{withSuspense(<SuperAdminSettings />)}</ProtectedRoute>} />
        <Route path='/super-admin/kyc-review'   element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}>{withSuspense(<SuperAdminKycReview />)}</ProtectedRoute>} />

        {/* ---- Invoice (authenticated — buyer or seller of that order) ---- */}
        <Route path='/invoice/:orderNumber' element={<ProtectedRoute><InvoiceView /></ProtectedRoute>} />

        {/* ---- Legal pages (public, static) ---- */}
        <Route path='/terms' element={<Terms />} />
        <Route path='/privacy' element={<Privacy />} />
        <Route path='/refund-policy' element={<RefundPolicy />} />
        <Route path='/seller-agreement' element={<SellerAgreement />} />
        <Route path='/buyer-protection' element={<BuyerProtection />} />
        <Route path='/prohibited-products' element={<ProhibitedProducts />} />
        <Route path='/payment-policy' element={<PaymentPolicy />} />
        <Route path='/dispute-resolution' element={<DisputeResolution />} />
        <Route path='/community-guidelines' element={<CommunityGuidelines />} />

        <Route path='*' element={<NotFound />} />
      </Routes>
      <MobileBottomNav />
      <FloatingCSAgent />
    </>
  );
}

export default App;
