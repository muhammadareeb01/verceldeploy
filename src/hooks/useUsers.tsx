// Suggested file: src/hooks/useUsers.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserRole,
  // Removed getStaffMembers and getUsersByRole imports
  updateUserRole,
  deleteUser,
  getUserPermissions,
  signIn,
  signUp,
  signOut,
  updateUserProfile,
  getUsers, // Import the consolidated getUsers function
} from "@/api/users";
import { toast } from "sonner";
import { z } from "zod";
import { UserProfile, UserRole } from "@/types/types"; // Import types from types/api

// Validation schemas (kept in hooks file as provided)
const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  role: z
    .enum([
      UserRole.ADMIN,
      UserRole.MANAGER,
      UserRole.OFFICER,
      UserRole.STAFF,
      UserRole.CLIENT,
      UserRole.ACCOUNT_MANAGER,
      UserRole.DOCUMENT_SPECIALIST,
      UserRole.FINANCE_OFFICER,
    ])
    .optional(), // Make role optional if signup is primarily for clients
});

const updateProfileSchema = z.object({
  email: z.string().email("Please enter a valid email address").optional(),
  fullName: z.string().min(2, "Full name is required").optional(),
  phone: z.string().min(10, "Valid phone number is required").optional(),
  role: z
    .enum([
      UserRole.ADMIN,
      UserRole.MANAGER,
      UserRole.OFFICER,
      UserRole.STAFF,
      UserRole.CLIENT,
      UserRole.ACCOUNT_MANAGER,
      UserRole.DOCUMENT_SPECIALIST,
      UserRole.FINANCE_OFFICER,
    ])
    .optional(),
  isActive: z.boolean().optional(),
  avatarUrl: z.string().url("Valid URL is required").optional().nullable(), // Avatar URL can be null
});

// --- Query Keys ---
// Define query keys for consistent cache management
export const userKeys = {
  all: ["users"] as const,
  // Use filters in the lists key
  lists: (filters?: { role?: UserRole | UserRole[] | { not: UserRole } }) =>
    [...userKeys.all, "list", filters] as const,
  detail: (userId: string) => [...userKeys.all, "detail", userId] as const,
  // Keep userRole key separate as it fetches a single value
  userRole: (userId: string) => [...userKeys.all, "role", userId] as const,
  userPermissions: () => [...userKeys.all, "permissions"] as const,
};

// --- User Hooks (Queries) ---

/**
 * Hook to fetch a list of users based on filters.
 * Uses the consolidated getUsers API function.
 * @param filters - Optional filters { role }.
 * @returns useQueryResult for UserProfile[]
 */
export const useUsersQuery = (filters?: {
  role?: UserRole | UserRole[] | { not: UserRole };
}) => {
  return useQuery<UserProfile[], Error>({
    queryKey: userKeys.lists(filters), // Use the defined query key with filters
    queryFn: () => getUsers(filters), // Call the API function with filters
  });
};

/**
 * Hook to fetch a single user by ID.
 * Calls the getUsers API function with an ID filter.
 * @param userId - The ID of the user to fetch.
 * @returns useQueryResult for UserProfile | null
 */
export const useUserByIdQuery = (userId?: string) => {
  return useQuery<UserProfile | null, Error>({
    queryKey: userKeys.detail(userId || ""), // Key includes userId
    queryFn: async () => {
      // Use getUsers with an ID filter
      const users = await getUsers({ id: userId });
      return users.length > 0 ? users[0] : null;
    },
    enabled: !!userId, // Only run the query if userId is provided
  });
};

/**
 * Hook to fetch the current authenticated user's role.
 * @param userId - The ID of the authenticated user.
 * @returns useQueryResult for UserRole
 */
export const useUserRoleQuery = (userId: string | null | undefined) => {
  // Handle null/undefined userId
  return useQuery<UserRole, Error>({
    queryKey: userKeys.userRole(userId || ""), // Key includes userId
    queryFn: () => getUserRole(userId!), // Call the API function (use non-null assertion as enabled check handles null)
    enabled: !!userId, // Only run the query if userId is provided
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000), // Exponential backoff, max 10s
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
  });
};

/**
 * Hook to fetch all staff members (users with roles other than CLIENT).
 * Uses the useUsersQuery hook with a filter.
 * @returns useQueryResult for UserProfile[]
 */
export const useStaffMembersQuery = () => {
  // Standard hook naming
  return useUsersQuery({ role: { not: UserRole.CLIENT } }); // Use useUsersQuery with 'not' filter
};

/**
 * Hook to fetch all clients (users with the CLIENT role).
 * Uses the useUsersQuery hook with a filter.
 * @returns useQueryResult for UserProfile[]
 */
export const useClientsQuery = () => {
  // Standard hook naming
  return useUsersQuery({ role: UserRole.CLIENT }); // Use useUsersQuery with CLIENT role filter
};

// --- User Hooks (Mutations) ---

/**
 * Hook to sign in a user.
 * @returns useMutationResult
 */
export const useSignInMutation = () => {
  // Standard hook naming
  // No query invalidation needed on sign in typically
  return useMutation<void, Error, z.infer<typeof signInSchema>>({
    // Use Zod schema for input type
    mutationFn: async (credentials) => {
      const parsed = signInSchema.parse(credentials); // Validate input
      return signIn(parsed.email, parsed.password); // Call the API function
    },
    onSuccess: () => {
      toast.success("Signed in successfully", {
        description: "Welcome back, Talha Khan!", // Personalized message
        duration: 1000,
      });
      // Invalidate user-specific data after sign-in if needed (e.g., user profile, permissions)
      // queryClient.invalidateQueries({ queryKey: userKeys.userRole(...) });
      // queryClient.invalidateQueries({ queryKey: userKeys.userPermissions() });
    },
    onError: (error) => {
      toast.error("Failed to sign in", {
        description:
          error.message ||
          "Contact Talha Khan at 442-421-5593 or info@dijitze.com.", // Personalized message
      });
    },
  });
};

/**
 * Hook to sign up a new user.
 * @returns useMutationResult
 */
export const useSignUpMutation = () => {
  // Standard hook naming
  const queryClient = useQueryClient();
  return useMutation<void, Error, z.infer<typeof signUpSchema>>({
    // Use Zod schema for input type
    mutationFn: async (userData) => {
      const parsed = signUpSchema.parse(userData); // Validate input
      // Call the API function, defaulting role to CLIENT if not provided in input
      return signUp(
        parsed.email,
        parsed.password,
        parsed.fullName,
        parsed.phone,
        UserRole.CLIENT // Ensure role is passed, default to CLIENT
      );
    },
    onSuccess: () => {
      toast.success("Account created successfully", {
        description:
          "Please check your email to verify your account. Contact Talha Khan at 442-421-5593 or info@dijitze.com for assistance.", // Personalized message
      });
      // Invalidate relevant user lists on successful signup (e.g., clients list if role is client)
      queryClient.invalidateQueries({
        queryKey: userKeys.lists({ role: UserRole.CLIENT }),
      });
      queryClient.invalidateQueries({ queryKey: userKeys.lists({}) }); // Invalidate all users list as fallback
    },
    onError: (error) => {
      toast.error("Failed to sign up", {
        description:
          error.message ||
          "Contact Talha Khan at 442-421-5593 or info@dijitze.com.", // Personalized message
      });
    },
  });
};

/**
 * Hook to sign out a user.
 * @returns useMutationResult
 */
export const useSignOutMutation = () => {
  // Standard hook naming
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: signOut, // Call the API function
    onSuccess: () => {
      toast.success("Signed out successfully");
      // Clear the entire query cache or invalidate relevant user-specific queries after sign-out
      queryClient.clear(); // Clear all cache
      // Or more selectively:
      // queryClient.invalidateQueries({ queryKey: userKeys.all });
      // queryClient.removeQueries({ queryKey: userKeys.all });
    },
    onError: (error) => {
      toast.error("Failed to sign out", {
        description:
          error.message ||
          "Contact Talha Khan at 442-421-5593 or info@dijitze.com.", // Personalized message
      });
    },
  });
};

/**
 * Hook to update a user profile.
 * @returns useMutationResult
 */
export const useUpdateUserProfileMutation = () => {
  // Standard hook naming
  const queryClient = useQueryClient();
  return useMutation<
    UserProfile, // Return type is the updated UserProfile
    Error,
    { userId: string } & z.infer<typeof updateProfileSchema> // Input includes userId and Zod schema fields
  >({
    mutationFn: async ({ userId, ...updates }) => {
      const parsed = updateProfileSchema.parse(updates); // Validate update data
      return updateUserProfile(userId, parsed); // Call the API function
    },
    onSuccess: (updatedUser) => {
      toast.success("Profile updated successfully", {
        description:
          "Changes have been synced to your account, Talha Khan. If updating your email, please check for a confirmation link.", // Personalized message
      });
      // Invalidate the specific user's detail query
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(updatedUser.id),
      });
      // Invalidate relevant user lists if role or other list-affecting fields changed
      queryClient.invalidateQueries({ queryKey: userKeys.lists({}) }); // Invalidate all lists as fallback
      if (updatedUser.role) {
        queryClient.invalidateQueries({
          queryKey: userKeys.lists({ role: updatedUser.role }),
        }); // Invalidate list for the new role
        // If the role changed, also invalidate the list for the old role (requires knowing the old role)
      }
      // Invalidate user role query if role was updated
      queryClient.invalidateQueries({
        queryKey: userKeys.userRole(updatedUser.id),
      });
    },
    onError: (error) => {
      toast.error("Failed to update profile", {
        description:
          error.message ||
          "Contact Talha Khan at 442-421-5593 or info@dijitze.com.", // Personalized message
      });
    },
  });
};

/**
 * Hook to update a user role.
 * @returns useMutationResult
 */
export const useUpdateUserRoleMutation = () => {
  // Standard hook naming
  const queryClient = useQueryClient();
  return useMutation<UserProfile, Error, { userId: string; role: UserRole }>({
    // Return updated profile
    mutationFn: ({ userId, role }) => updateUserRole(userId, role), // Call the API function
    onSuccess: (updatedUser) => {
      toast.success("User role updated successfully");
      // Invalidate the specific user's detail query
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(updatedUser.id),
      });
      // Invalidate relevant user lists (staff, clients, all users, list by old role, list by new role)
      queryClient.invalidateQueries({ queryKey: userKeys.lists({}) }); // Invalidate all lists as fallback
      if (updatedUser.role) {
        queryClient.invalidateQueries({
          queryKey: userKeys.lists({ role: updatedUser.role }),
        }); // Invalidate list for the new role
        // To invalidate the list for the old role, you'd need the old role here
      }
      // Invalidate user role query
      queryClient.invalidateQueries({
        queryKey: userKeys.userRole(updatedUser.id),
      });
    },
    onError: (error) => {
      toast.error("Failed to update user role", {
        description:
          error.message ||
          "Contact Talha Khan at 442-421-5593 or info@dijitze.com.", // Personalized message
      });
    },
  });
};

/**
 * Hook to delete a user.
 * @returns useMutationResult
 */
export const useDeleteUserMutation = () => {
  // Standard hook naming
  const queryClient = useQueryClient();
  return useMutation<void, Error, { userId: string; isClient: boolean }>({
    // Return void as the user is deleted
    mutationFn: ({ userId, isClient }) => deleteUser(userId, isClient), // Call the API function
    onSuccess: (_, { userId, isClient }) => {
      // Access userId and isClient from variables
      toast.success(`${isClient ? "Client" : "User"} deleted successfully`);
      // Remove the deleted user from the cache
      queryClient.removeQueries({ queryKey: userKeys.detail(userId) });
      // Invalidate relevant user lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists({}) }); // Invalidate all lists as fallback
      // If you knew the user's role before deletion, you could invalidate the specific role list
      // e.g., queryClient.invalidateQueries({ queryKey: userKeys.lists({ role: oldRole }) });
    },
    onError: (error) => {
      toast.error("Failed to delete user", {
        description:
          error.message ||
          "Contact Talha Khan at 442-421-5593 or info@dijitze.com.", // Personalized message
      });
    },
  });
};

/**
 * Hook to fetch the current authenticated user's permissions.
 * @returns useQueryResult for string[] (list of permission names/ids)
 */
export const useUserPermissionsQuery = () => {
  // Standard hook naming
  return useQuery<string[], Error>({
    queryKey: userKeys.userPermissions(), // Dedicated key for permissions
    queryFn: getUserPermissions, // Call the API function
    staleTime: 15 * 60 * 1000, // Cache for 15 minutes
  });
};
