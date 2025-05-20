// Suggested file: src/api/services.ts
import { supabase } from "@/integrations/supabase/client";
import type { Service, ServiceCategory } from "@/types/types"; // Assuming types are in types/api

// --- Helper Functions ---

/**
 * Maps raw Supabase data for a Service (with joined category)
 * to the Service type with the category object directly.
 */
const mapSupabaseServiceToServiceType = (data: any | null): Service | null => {
  if (!data) return null;

  // Extract the raw category data which is nested under 'category' from the select statement
  const rawCategory = data.category;

  // Construct the mapped Service object
  const mappedService: Service = {
    service_id: data.service_id,
    service_name: data.service_name,
    description: data.description,
    base_cost: data.base_cost,
    estimated_duration_days: data.estimated_duration_days,
    is_mandatory: data.is_mandatory,
    government_portal_template: data.government_portal_template,
    required_documents_template: data.required_documents_template,
    category: rawCategory
      ? {
          category_id: rawCategory.category_id,
          category_name: rawCategory.category_name,
          // Add other category fields if selected and present
          description: rawCategory.description, // Assuming description is also selected for category
        }
      : null,
    // Ensure other fields from your Service type are mapped if necessary
  };

  return mappedService;
};

// --- Service Categories API Functions ---

export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
  try {
    console.log("Fetching service categories...");
    const { data, error } = await supabase
      .from("service_categories")
      .select("*")
      .order("category_name", { ascending: true });

    if (error) {
      console.error("Error fetching service categories:", error);
      if (error.message.includes("JWT") || error.message.includes("auth")) {
        console.error(
          "Authentication error when fetching service categories. Check RLS policies."
        );
      }
      // Throw the error so the hook can handle it (e.g., show a toast)
      throw new Error(
        `Failed to fetch service categories: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }
    console.log(`Successfully fetched ${data?.length || 0} service categories`);
    // Data structure from '*' should match ServiceCategory[] directly, no mapping needed
    return data || [];
  } catch (error: any) {
    console.error("Exception when fetching service categories:", error);
    // Re-throw the error so the hook can handle it
    throw new Error(
      error.message ||
        "An unexpected error occurred while fetching service categories. Contact Talha Khan at 442-421-5593 or info@dijitze.com."
    );
  }
};

export const getServiceCategoryById = async (
  id: string
): Promise<ServiceCategory | null> => {
  if (!id) return null; // Handle case where ID is not provided
  try {
    const { data, error } = await supabase
      .from("service_categories")
      .select("*")
      .eq("category_id", id)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching service category with ID ${id}:`, error);
      throw new Error(
        `Failed to fetch service category ${id}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }
    // Data structure from '*' should match ServiceCategory | null directly
    return data;
  } catch (error: any) {
    console.error(
      `Exception when fetching service category with ID ${id}:`,
      error
    );
    throw new Error(
      error.message ||
        `An unexpected error occurred while fetching service category ${id}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

export const createServiceCategory = async (
  category: Partial<ServiceCategory>
): Promise<ServiceCategory> => {
  // Promise<ServiceCategory> if single() is used and data is guaranteed
  try {
    // Validate that required fields are present
    if (
      !category.category_name ||
      typeof category.category_name !== "string" ||
      category.category_name.trim() === ""
    ) {
      console.error("Category name is required for creation");
      throw new Error("Category name is required."); // Throw error for hook to catch
    }

    // Create a valid category object with required fields
    const validCategory = {
      category_name: category.category_name.trim(),
      description: category.description?.trim() || null, // Use null for empty optional strings
    };

    const { data, error } = await supabase
      .from("service_categories")
      .insert(validCategory)
      .select() // Select the inserted row
      .single(); // Expect a single result

    if (error) {
      console.error("Error creating service category:", error);
      throw new Error(
        `Failed to create service category: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    if (!data) {
      throw new Error("Failed to retrieve created service category data.");
    }

    // Data structure from select() should match ServiceCategory directly
    return data;
  } catch (error: any) {
    console.error("Exception when creating service category:", error);
    throw new Error(
      error.message ||
        "An unexpected error occurred while creating the service category. Contact Talha Khan at 442-421-5593 or info@dijitze.com."
    );
  }
};

export const updateServiceCategory = async (
  id: string,
  category: Partial<ServiceCategory>
): Promise<ServiceCategory> => {
  // Promise<ServiceCategory> if single() is used and data is guaranteed
  if (!id) {
    console.error("Service category ID is required for update");
    throw new Error("Service category ID is required for update.");
  }
  try {
    // Validate that at least one field is being updated
    if (Object.keys(category).length === 0) {
      console.error("No fields to update");
      throw new Error("No fields provided to update."); // Throw error for hook to catch
    }

    const updates: Partial<ServiceCategory> = {
      ...category,
      category_name: category.category_name?.trim(), // Trim name if present
      description:
        category.description?.trim() ||
        (category.description === "" ? null : undefined), // Trim description, handle empty string to null
    };

    const { data, error } = await supabase
      .from("service_categories")
      .update(updates)
      .eq("category_id", id)
      .select() // Select the updated row
      .single(); // Expect a single result

    if (error) {
      console.error(`Error updating service category with ID ${id}:`, error);
      throw new Error(
        `Failed to update service category ${id}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    if (!data) {
      throw new Error(
        `Failed to retrieve updated service category data for ID ${id}.`
      );
    }

    // Data structure from select() should match ServiceCategory directly
    return data;
  } catch (error: any) {
    console.error(
      `Exception when updating service category with ID ${id}:`,
      error
    );
    throw new Error(
      error.message ||
        `An unexpected error occurred while updating service category ${id}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

export const deleteServiceCategory = async (id: string): Promise<boolean> => {
  if (!id) {
    console.error("Service category ID is required for delete");
    throw new Error("Service category ID is required for delete.");
  }
  try {
    const { error } = await supabase
      .from("service_categories")
      .delete()
      .eq("category_id", id);

    if (error) {
      console.error(`Error deleting service category with ID ${id}:`, error);
      throw new Error(
        `Failed to delete service category ${id}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }
    // Supabase delete returns null data on success
    return true;
  } catch (error: any) {
    console.error(
      `Exception when deleting service category with ID ${id}:`,
      error
    );
    throw new Error(
      error.message ||
        `An unexpected error occurred while deleting service category ${id}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

// --- Services API Functions ---
/**
 * Fetches all services with their category details.
 * @returns Array of Service objects.
 */
export const getServices = async (): Promise<Service[]> => {
  try {
    const { data, error } = await supabase
      .from("services")
      .select(
        `
        service_id,
        service_name,
        description,
        category:service_categories (
          category_id,
          category_name, 
          description
        )
      `
      )
      .order("service_name", { ascending: true });

    if (error) {
      console.error("Supabase error fetching services:", error);
      if (
        error.code === "42501" ||
        error.message.includes("permission denied")
      ) {
        throw new Error(
          `Permission denied: Check RLS policies for 'services' and 'service_categories' tables. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
        );
      }
      if (error.message.includes("JWT") || error.message.includes("auth")) {
        throw new Error(
          `Authentication error: Invalid or expired JWT. Ensure user is authenticated and RLS policies allow access. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
        );
      }
      throw new Error(
        `Failed to fetch services: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    if (!data) {
      console.warn("No services returned from Supabase.");
      return [];
    }

    const services = data.map(mapSupabaseServiceToServiceType);
    const uncategorizedCount = services.filter((s) => !s.category).length;
    if (uncategorizedCount > 0) {
      console.warn(`${uncategorizedCount} services have no category assigned.`);
    }

    return services;
  } catch (error: any) {
    console.error("Error in getServices:", error);
    throw new Error(
      `${
        error.message || "An unexpected error occurred while fetching services"
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

export const getServiceById = async (id: string): Promise<Service | null> => {
  if (!id) return null;

  try {
    const { data, error } = await supabase
      .from("services")
      .select(
        `
        *,
        service_categories (
          category_id,
          category_name,
          description
        )
        `
      )
      .eq("service_id", id)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching service with ID ${id}:`, error);
      throw new Error(
        `Failed to fetch service ${id}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    // If you still want to alias the joined category, do it manually in the mapper
    return mapSupabaseServiceToServiceType(data);
  } catch (error: any) {
    console.error(`Exception when fetching service with ID ${id}:`, error);
    throw new Error(
      error.message ||
        `An unexpected error occurred while fetching service ${id}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

export const createService = async (
  service: Partial<Service>
): Promise<Service> => {
  // Promise<Service> if single() is used and data is guaranteed
  try {
    // Validate required fields
    if (
      !service.service_name ||
      typeof service.service_name !== "string" ||
      service.service_name.trim() === ""
    ) {
      console.error("Service name is required for creation");
      throw new Error("Service name is required.");
    }
    if (!service.category?.category_id) {
      // Check for category ID
      console.error("Service category is required for creation");
      throw new Error("Service category is required.");
    }
    if (
      service.base_cost === undefined ||
      typeof service.base_cost !== "number" ||
      service.base_cost < 0
    ) {
      console.error("Valid base cost is required for creation");
      throw new Error("Valid base cost is required.");
    }

    // Prepare the insert payload (use category_id for the FK)
    const insertPayload = {
      service_name: service.service_name.trim(),
      description: service.description?.trim() || null, // Use null for empty optional strings
      base_cost: service.base_cost,
      category_id: service.category.category_id, // Use the ID from the category object
      is_mandatory: service.is_mandatory ?? true, // Default to true if not provided
      estimated_duration_days: service.estimated_duration_days ?? null, // Default to null if not provided
      government_portal_template:
        service.government_portal_template?.trim() || null,
      required_documents_template: service.required_documents_template || [], // Default to empty array
    };

    const { data, error } = await supabase
      .from("services")
      .insert(insertPayload)
      .select(
        // Select with join to return the full Service structure
        `
        *,
        category:service_categories (
          category_id,
          category_name,
          description
        )
      `
      )
      .single(); // Expect a single result

    if (error) {
      console.error("Error creating service:", error);
      throw new Error(
        `Failed to create service: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    if (!data) {
      throw new Error("Failed to retrieve created service data.");
    }

    // Map the raw data to the Service type using the helper function
    const newService = mapSupabaseServiceToServiceType(data);
    if (!newService) {
      throw new Error("Failed to map created service data.");
    }

    return newService;
  } catch (error: any) {
    console.error("Exception when creating service:", error);
    throw new Error(
      error.message ||
        "An unexpected error occurred while creating the service. Contact Talha Khan at 442-421-5593 or info@dijitze.com."
    );
  }
};

export const updateService = async (
  id: string,
  service: Partial<Service>
): Promise<Service> => {
  // Promise<Service> if single() is used and data is guaranteed
  if (!id) {
    console.error("Service ID is required for update");
    throw new Error("Service ID is required for update.");
  }
  try {
    // Validate that at least one field is being updated
    if (Object.keys(service).length === 0) {
      console.error("No fields to update");
      throw new Error("No fields provided to update.");
    }

    // Prepare the update payload (use category_id for the FK if category is being updated)
    const updatePayload: any = {
      ...service,
      service_name: service.service_name?.trim(), // Trim name if present
      description:
        service.description?.trim() ||
        (service.description === "" ? null : undefined), // Trim description, handle empty string to null
      government_portal_template:
        service.government_portal_template?.trim() ||
        (service.government_portal_template === "" ? null : undefined), // Trim template, handle empty string to null
      // If category is being updated, extract the category_id
      ...(service.category !== undefined
        ? { category_id: service.category?.category_id || null }
        : {}),
      // Ensure base_cost is a number if present
      ...(service.base_cost !== undefined
        ? {
            base_cost:
              typeof service.base_cost === "number" ? service.base_cost : 0,
          }
        : {}),
      // Ensure estimated_duration_days is a number or null if present
      ...(service.estimated_duration_days !== undefined
        ? {
            estimated_duration_days:
              typeof service.estimated_duration_days === "number"
                ? service.estimated_duration_days
                : null,
          }
        : {}),
    };

    // Remove the 'category' object from the payload as it's not a database column
    delete updatePayload.category;

    const { data, error } = await supabase
      .from("services")
      .update(updatePayload)
      .eq("service_id", id)
      .select(
        // Select with join to return the full Service structure
        `
        *,
        category:service_categories (
          category_id,
          category_name,
          description
        )
      `
      )
      .single(); // Expect a single result

    if (error) {
      console.error(`Error updating service with ID ${id}:`, error);
      throw new Error(
        `Failed to update service ${id}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    if (!data) {
      throw new Error(`Failed to retrieve updated service data for ID ${id}.`);
    }

    // Map the raw data to the Service type using the helper function
    const updatedService = mapSupabaseServiceToServiceType(data);
    if (!updatedService) {
      throw new Error("Failed to map updated service data.");
    }

    return updatedService;
  } catch (error: any) {
    console.error(`Exception when updating service with ID ${id}:`, error);
    throw new Error(
      error.message ||
        `An unexpected error occurred while updating service ${id}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

export const deleteService = async (id: string): Promise<boolean> => {
  if (!id) {
    console.error("Service ID is required for delete");
    throw new Error("Service ID is required for delete.");
  }
  try {
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("service_id", id);

    if (error) {
      console.error(`Error deleting service with ID ${id}:`, error);
      throw new Error(
        `Failed to delete service ${id}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }
    // Supabase delete returns null data on success
    return true;
  } catch (error: any) {
    console.error(`Exception when deleting service with ID ${id}:`, error);
    throw new Error(
      error.message ||
        `An unexpected error occurred while deleting service ${id}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};
