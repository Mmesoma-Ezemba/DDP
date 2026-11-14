/**
 * Supabase Integration - Central Export Point
 * 
 * This module provides a complete integration between Thirdweb Auth and Supabase,
 * enabling wallet-based authentication with persistent data storage.
 * 
 * Architecture:
 * 1. User connects wallet via Thirdweb
 * 2. User signs authentication message
 * 3. Backend verifies signature and creates/fetches Supabase user
 * 4. User data and vault metadata stored in Supabase
 * 5. Smart contracts on Celo handle trustless execution
 */

// =====================================================
// CLIENT & TYPES
// =====================================================
export { supabase, TABLES } from "./client"
export type { UserProfile, AuthResult } from "./client"
export type {
  User,
  UserInsert,
  UserUpdate,
  Vault,
  VaultInsert,
  VaultUpdate,
  VaultWithOwner,
  Beneficiary,
  BeneficiaryInsert,
  BeneficiaryUpdate,
  BeneficiaryWithVault,
  ActivityLog,
  ActivityLogInsert,
  Heartbeat,
  HeartbeatInsert,
  UnlockCondition,
  ActivityType,
  DeviceInfo,
  LocationInfo,
  VaultFilters,
  ActivityLogFilters,
  BeneficiaryFilters,
  PaginationParams,
  PaginatedResponse,
  SupabaseResponse,
  SupabaseListResponse,
} from "./types"

// =====================================================
// SERVER CLIENT
// =====================================================
export { createClient } from "./server"

// =====================================================
// USER OPERATIONS
// =====================================================
export {
  createOrGetUser,
  createUser,
  getUserByWallet,
  getUserById,
  getUserByEmail,
  getUserByUsername,
  searchUsers,
  updateUser,
  updateLastActive,
  updateUserMetadata,
  deleteUser,
  handleUserLogin,
  handleUserLogout,
  getTotalUserCount,
  getActiveUsers,
  getRecentUsers,
} from "./users"

// =====================================================
// VAULT OPERATIONS
// =====================================================
export {
  createVault,
  getUserVaults,
  getVaultById,
  getBeneficiaryVaults,
  getVaultByContract,
  updateVault,
  updateVaultHeartbeat,
  linkVaultToContract,
  triggerVault,
  deleteVault,
  checkVaultInactivity,
  getVaultsNeedingTrigger,
  getUserVaultStats,
  batchUpdateHeartbeats,
} from "./vaults"

// =====================================================
// BENEFICIARY OPERATIONS
// =====================================================
export {
  addBeneficiary,
  addBeneficiaries,
  getVaultBeneficiaries,
  getBeneficiaryById,
  getBeneficiaryAssignments,
  getAccessibleVaults,
  isBeneficiaryOfVault,
  updateBeneficiary,
  markBeneficiaryAccessed,
  markBeneficiaryNotified,
  updateBeneficiaryShares,
  removeBeneficiary,
  removeAllBeneficiaries,
  validateSharesDistribution,
  getVaultBeneficiaryStats,
  getUnnotifiedBeneficiaries,
  notifyAllBeneficiaries,
  rebalanceShares,
} from "./beneficiaries"

// =====================================================
// ACTIVITY LOG OPERATIONS
// =====================================================
export {
  logActivity,
  logLogin,
  logLogout,
  logHeartbeat,
  logVaultCreated,
  logVaultUpdated,
  logVaultTriggered,
  logVaultAccessed,
  logBeneficiaryAdded,
  logBeneficiaryRemoved,
  getUserActivityLogs,
  getVaultActivityLogs,
  getRecentActivity,
  getActivityLogsByType,
  getLastHeartbeat,
  getUserActivityStats,
  getActivityHeatmap,
  isUserActive,
  getDeviceInfoFromUserAgent,
  deleteOldActivityLogs,
} from "./activity-logs"

// =====================================================
// STORAGE OPERATIONS
// =====================================================
export {
  STORAGE_BUCKETS,
  uploadUserAvatar,
  deleteUserAvatar,
  listUserAvatars,
  deleteOldUserAvatars,
  uploadProfileImage,
  listProfileImages,
  getPublicUrl,
  fileExists,
  validateAvatarFile,
} from "./storage"
