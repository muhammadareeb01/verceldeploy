// Suggested file: src/api/users.ts
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, UserRole } from "@/types/types"; // Assuming UserProfile and UserRole are defined in your types file

// --- Helper Functions ---

/**
 * Safely maps a string value to a UserRole enum value.
 * Returns null if the string is not a valid UserRole.
 */
const mapStringToUserRole = (
  roleString: string | null | undefined
): UserRole | null => {
  if (!roleString || typeof roleString !== "string") {
    return null;
  }
  // Check if the string value exists in the UserRole enum
  if (Object.values(UserRole).includes(roleString as UserRole)) {
    return roleString as UserRole; // Cast the string to the enum type
  }
  console.warn(
    `Attempted to map unknown role string "${roleString}" to UserRole enum.`
  );
  return null; // Return null for invalid role strings
};

// --- User API Functions ---

interface GetUsersFilters {
  id?: string; // Allow filtering by a single ID
  role?: UserRole | UserRole[] | { not: UserRole }; // Allow filtering by one, many, or excluding a role
  // Add other filters as needed (e.g., status, assigned_to_case_id)
}

/**
 * Fetches a list of users based on filters.
 * Can filter by ID, role (single, multiple, or excluding a role).
 * Maps the role string from the database to the UserRole enum.
 * @param filters - Optional filters { id, role }.
 * @returns Promise<UserProfile[]>
 */
export const getUsers = async (
  filters: GetUsersFilters = {}
): Promise<UserProfile[]> => {
  try {
    let query = supabase
      .from("profiles") // Assuming your user profile table is 'profiles'
      .select(
        "id, full_name, role, email, phone, avatar_url, is_active, created_at, updated_at"
      ); // Select all fields needed for UserProfile

    if (filters.id) {
      query = query.eq("id", filters.id);
    }

    if (filters.role) {
      if (Array.isArray(filters.role)) {
        query = query.in("role", filters.role);
      } else if (typeof filters.role === "object" && "not" in filters.role) {
        query = query.neq("role", filters.role.not);
      } else {
        query = query.eq("role", filters.role);
      }
    }

    const { data, error } = await query.order("full_name", { ascending: true }); // Order by name

    if (error) {
      console.error("Supabase error fetching users:", error);
      throw new Error(
        `Failed to fetch users: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    // Map the fetched data to UserProfile[], ensuring the role is the UserRole enum
    return (data || []).map((item) => ({
      id: item.id,
      full_name: item.full_name,
      role: mapStringToUserRole(item.role), // *** Use the helper function here ***
      email: item.email,
      phone: item.phone,
      avatar_url: item.avatar_url,
      is_active: item.is_active,
      created_at: item.created_at,
      updated_at: item.updated_at,
      // Map other fields as needed
    }));
  } catch (error: any) {
    console.error("Error in getUsers:", error);
    throw new Error(
      `${
        error.message || "An unexpected error occurred while fetching users"
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

/**
 * Fetches a single user's role by ID.
 * @param userId - The ID of the user.
 * @returns Promise<UserRole>
 */
export const getUserRole = async (userId: string): Promise<UserRole> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("getUserRole: Error fetching role:", {
        userId,
        error: error.message,
        code: error.code,
      });
      throw new Error(
        `Failed to fetch user role: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    if (!data || !data.role) {
      console.error("getUserRole: No profile or role found for user:", {
        userId,
      });
      throw new Error(
        `No profile or role exists for user ID ${userId}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    // *** Use the helper function here as well ***
    const userRole = mapStringToUserRole(data.role);
    if (userRole === null) {
      console.error(
        "getUserRole: Fetched role is not a valid UserRole enum value:",
        data.role
      );
      throw new Error(
        `Fetched role "${data.role}" is invalid. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    return userRole;
  } catch (error: any) {
    console.error("getUserRole: Caught error:", error);
    throw error;
  }
};

// Sign in user
export const signIn = async (
  email: string,
  password: string
): Promise<void> => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("signIn: Error signing in:", error);
      throw new Error(
        `Failed to sign in: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }
  } catch (error: any) {
    console.error("signIn: Caught error:", error);
    throw error;
  }
};

// Sign up user
export const signUp = async (
  email: string,
  password: string,
  fullName: string,
  phone: string,
  role: UserRole.CLIENT // Assuming signup is specifically for clients
): Promise<void> => {
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          role, // Pass the enum value directly
        },
      },
    });
    if (error) {
      console.error("signUp: Error signing up:", error);
      throw new Error(
        `Failed to sign up: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }
  } catch (error: any) {
    console.error("signUp: Caught error:", error);
    throw error;
  }
};

// Sign out user
export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("signOut: Error signing out:", error);
      throw new Error(
        `Failed to sign out: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }
  } catch (error: any) {
    console.error("signOut: Caught error:", error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: {
    email?: string;
    fullName?: string;
    phone?: string;
    role?: UserRole; // Allow updating role via profile update
    isActive?: boolean;
    avatarUrl?: string;
  }
): Promise<UserProfile> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        email: updates.email,
        full_name: updates.fullName,
        phone: updates.phone,
        role: updates.role, // Pass the enum value directly
        is_active: updates.isActive,
        avatar_url: updates.avatarUrl,
      })
      .eq("id", userId)
      .select() // Select updated row to return UserProfile
      .single();

    if (error) {
      console.error("updateUserProfile: Error updating profile:", {
        userId,
        error: error.message,
        code: error.code,
      });
      throw new Error(
        `Failed to update profile: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    if (!data) {
      console.error("updateUserProfile: No profile returned for user:", {
        userId,
      });
      throw new Error(
        `Profile update failed for user ID ${userId}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    // *** Use the helper function here to map the returned role string ***
    const updatedProfile: UserProfile = {
      id: data.id,
      full_name: data.full_name,
      role: mapStringToUserRole(data.role),
      email: data.email,
      phone: data.phone,
      avatar_url: data.avatar_url,
      is_active: data.is_active,
      created_at: data.created_at,
      updated_at: data.updated_at,
      // Map other fields
    };

    return updatedProfile;
  } catch (error: any) {
    console.error("updateUserProfile: Caught error:", error);
    throw error;
  }
};

// Update user role (Separate function if role updates are handled distinctly)
export const updateUserRole = async (
  userId: string,
  role: UserRole
): Promise<UserProfile> => {
  // Return updated profile
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ role }) // Pass the enum value directly
      .eq("id", userId)
      .select() // Select updated row to return UserProfile
      .single();

    if (error) {
      console.error("updateUserRole: Error updating role:", error);
      throw new Error(
        `Failed to update user role: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    // *** Use the helper function here to map the returned role string ***
    const updatedProfile: UserProfile = {
      id: data.id,
      full_name: data.full_name,
      role: mapStringToUserRole(data.role),
      email: data.email,
      phone: data.phone,
      avatar_url: data.avatar_url,
      is_active: data.is_active,
      created_at: data.created_at,
      updated_at: data.updated_at,
      // Map other fields
    };

    return updatedProfile;
  } catch (error: any) {
    console.error("updateUserRole: Caught error:", error);
    throw error;
  }
};

// Delete user (assuming this uses a Supabase function)
export const deleteUser = async (
  userId: string,
  isClient: boolean // Pass isClient for logging/messaging
): Promise<void> => {
  // Return void as the user is deleted
  try {
    // Assuming 'delete-user' Supabase function handles auth.admin.deleteUser and profile deletion
    const { data, error } = await supabase.functions.invoke("delete-user", {
      body: { userId },
    });

    if (error) {
      console.error("deleteUser: Error deleting user:", error);
      throw new Error(
        `Failed to delete ${isClient ? "client" : "user"}: ${
          error.message
        }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    // Check the response from the Supabase function if it returns success/failure status
    // if (data && data.status === 'error') {
    //      throw new Error(data.message || `Failed to delete user ${userId} via function.`);
    // }
  } catch (error: any) {
    console.error("deleteUser: Caught error:", error);
    throw error;
  }
};

// Get user permissions for the currently authenticated user
export const getUserPermissions = async (): Promise<string[]> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error(
        "getUserPermissions: Error getting authenticated user:",
        userError
      );
      throw new Error(
        `Failed to get authenticated user: ${userError.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }
    if (!userData?.user) {
      console.error("getUserPermissions: No authenticated user found");
      throw new Error(
        "No authenticated user found. Contact Talha Khan at 442-421-5593 or info@dijitze.com."
      );
    }

    // Fetch the user's role from the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    if (profileError) {
      console.error(
        "getUserPermissions: Error fetching profile role:",
        profileError
      );
      throw new Error(
        `Failed to fetch user profile role: ${profileError.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    if (!profileData?.role) {
      console.error(
        "getUserPermissions: No role found in profile for user:",
        userData.user.id
      );
      throw new Error(
        `No role found in profile for user ${userData.user.id}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    // *** Use the helper function here to map the fetched role string ***
    const userRole = mapStringToUserRole(profileData.role);
    if (userRole === null) {
      console.error(
        "getUserPermissions: Fetched role is not a valid UserRole enum value:",
        profileData.role
      );
      throw new Error(
        `Fetched role "${profileData.role}" is invalid. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    // Fetch permissions based on the user's role
    const { data: permissionsData, error: permissionsError } = await supabase
      .from("role_permissions") // Assuming role_permissions table links roles to permissions
      .select("permission_id") // Select the permission ID
      .eq("role", userRole); // Use the mapped enum value

    if (permissionsError) {
      console.error(
        "getUserPermissions: Error fetching permissions:",
        permissionsError
      );
      throw new Error(
        `Failed to fetch permissions for role ${userRole}: ${permissionsError.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    // Assuming permission_id is a foreign key to a permissions table with a 'name' column
    // You might need another join here if you need the permission names directly
    // For now, returning the permission_ids as strings
    return (permissionsData || []).map((item) => item.permission_id);

    // If your role_permissions table structure is different, adjust the select accordingly.
    // Example if it's a direct join table:
    /*
     const { data: permissionsData, error: permissionsError } = await supabase
       .from("role_permissions")
       .select("permissions(name)") // Join to the permissions table
       .eq("role", userRole); // Use the mapped enum value

     if (permissionsError) { ... }
     return (permissionsData || []).map(item => item.permissions.name);
    */
  } catch (error: any) {
    console.error("getUserPermissions: Caught error:", error);
    // Re-throw the error so the hook can handle it
    throw error;
  }
};

// Mock permission check (replace with actual logic using useUserPermissions hook)
// This function should ideally use the result of useUserPermissions hook
export const hasPermission = async (
  _permissionName: string // The permission name to check
): Promise<boolean> => {
  // This mock always returns true.
  // In a real app, you would fetch the user's permissions (e.g., using the hook)
  // and check if _permissionName is in the list.
  console.warn(
    "Using mock hasPermission function. Implement actual permission check."
  );
  return true; // Mock implementation
};
