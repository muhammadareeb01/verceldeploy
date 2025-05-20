// Suggested file: src/hooks/useServices.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // Assuming you use sonner for toasts
import {
  getServiceCategories,
  getServiceCategoryById,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from "@/api/services"; // Import API functions
import type {
  ServiceCategory,
  Service, // Assuming this is the type returned by getServices/getServiceById with join
} from "@/types/types"; // Adjust path to your types file (assuming types are in types/api)

// --- Query Keys ---
// Define query keys for consistent cache management for both Services and Service Categories
export const serviceCategoryKeys = {
  all: ["serviceCategories"] as const,
  lists: () => [...serviceCategoryKeys.all, "list"] as const,
  detail: (categoryId: string | undefined) =>
    [...serviceCategoryKeys.all, "detail", categoryId] as const,
};

export const serviceKeys = {
  all: ["services"] as const,
  lists: (filters?: any) => [...serviceKeys.all, "list", filters] as const, // Add filters if your getServices takes filters
  detail: (serviceId: string | undefined) =>
    [...serviceKeys.all, "detail", serviceId] as const,
};

// --- Service Category Hooks (Queries) ---

/**
 * Hook to fetch a list of all service categories.
 * @returns useQueryResult for ServiceCategory[]
 */
export const useServiceCategoriesQuery = () => {
  return useQuery<ServiceCategory[], Error>({
    queryKey: serviceCategoryKeys.lists(), // Use the defined query key
    queryFn: getServiceCategories, // Call the API function
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
  });
};

/**
 * Hook to fetch a single service category by ID.
 * @param categoryId - The ID of the service category to fetch.
 * @returns useQueryResult for ServiceCategory | null
 */
export const useServiceCategoryByIdQuery = (categoryId?: string) => {
  return useQuery<ServiceCategory | null, Error>({
    queryKey: serviceCategoryKeys.detail(categoryId), // Use the defined query key with ID
    queryFn: () => getServiceCategoryById(categoryId!), // Call the API function (use non-null assertion as enabled check handles null)
    enabled: !!categoryId, // Only run the query if categoryId is provided
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
  });
};

// --- Service Category Hooks (Mutations) ---

/**
 * Hook to create a new service category.
 * Invalidates the service categories list query on success.
 * @returns useMutationResult for creating a service category
 */
export const useCreateServiceCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<ServiceCategory | null, Error, Partial<ServiceCategory>>({
    mutationFn: createServiceCategory, // Call the API function
    onSuccess: (newCategory) => {
      if (newCategory) {
        toast.success(
          `Service category "${newCategory.category_name}" created successfully`
        );
        // Invalidate the list query to refetch the updated list
        queryClient.invalidateQueries({
          queryKey: serviceCategoryKeys.lists(),
        });
      } else {
        toast.error("Failed to create service category: No data returned.");
      }
    },
    onError: (error) => {
      toast.error("Failed to create service category", {
        description:
          error.message ||
          "Contact Talha Khan at 442-421-5593 or info@dijitze.com.",
      });
    },
  });
};

/**
 * Hook to update an existing service category.
 * Invalidates the specific category detail and list queries on success.
 * @returns useMutationResult for updating a service category
 */
export const useUpdateServiceCategoryMutation = () => {
  const queryClient = useQueryClient();
  // Mutation input needs the ID and the update data
  return useMutation<
    ServiceCategory | null,
    Error,
    { categoryId: string; updates: Partial<ServiceCategory> }
  >({
    mutationFn: ({ categoryId, updates }) =>
      updateServiceCategory(categoryId, updates), // Call the API function
    onSuccess: (updatedCategory) => {
      if (updatedCategory) {
        toast.success(
          `Service category "${updatedCategory.category_name}" updated successfully`
        );
        // Invalidate the specific detail query
        queryClient.invalidateQueries({
          queryKey: serviceCategoryKeys.detail(updatedCategory.category_id),
        });
        // Invalidate the list query
        queryClient.invalidateQueries({
          queryKey: serviceCategoryKeys.lists(),
        });
      } else {
        toast.error("Failed to update service category: No data returned.");
      }
    },
    onError: (error) => {
      toast.error("Failed to update service category", {
        description:
          error.message ||
          "Contact Talha Khan at 442-421-5593 or info@dijitze.com.",
      });
    },
  });
};

/**
 * Hook to delete a service category.
 * Removes the deleted category from the cache and invalidates the list query on success.
 * @returns useMutationResult for deleting a service category
 */
export const useDeleteServiceCategoryMutation = () => {
  const queryClient = useQueryClient();
  // Mutation input is the category ID
  return useMutation<boolean, Error, string>({
    mutationFn: deleteServiceCategory, // Call the API function
    onSuccess: (success, categoryId) => {
      if (success) {
        toast.success("Service category deleted successfully");
        // Remove the deleted category from the cache
        queryClient.removeQueries({
          queryKey: serviceCategoryKeys.detail(categoryId),
        });
        // Invalidate the list query
        queryClient.invalidateQueries({
          queryKey: serviceCategoryKeys.lists(),
        });
      } else {
        toast.error("Failed to delete service category.");
      }
    },
    onError: (error) => {
      toast.error("Failed to delete service category", {
        description:
          error.message ||
          "Contact Talha Khan at 442-421-5593 or info@dijitze.com.",
      });
    },
  });
};

// --- Service Hooks (Queries) ---

/**
 * Hook to fetch a list of all services, potentially with filters.
 * @param filters - Optional filters to pass to the API function.
 * @returns useQueryResult for ServiceWithCategory[]
 */
export const useServicesQuery = (filters?: any) => {
  // Add specific filter type if needed
  return useQuery<Service[], Error>({
    queryKey: serviceKeys.lists(filters), // Use the defined query key with filters
    queryFn: () => getServices(), // Call the API function (pass filters if getServices accepts them)
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
  });
};

/**
 * Hook to fetch a single service by ID.
 * @param serviceId - The ID of the service to fetch.
 * @returns useQueryResult for ServiceWithCategory | null
 */
export const useServiceByIdQuery = (serviceId?: string) => {
  return useQuery<Service | null, Error>({
    queryKey: serviceKeys.detail(serviceId), // Use the defined query key with ID
    queryFn: () => getServiceById(serviceId!), // Call the API function (use non-null assertion as enabled check handles null)
    enabled: !!serviceId, // Only run the query if serviceId is provided
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
  });
};

// --- Service Hooks (Mutations) ---

/**
 * Hook to create a new service.
 * Invalidates the services list query on success.
 * @returns useMutationResult for creating a service
 */
export const useCreateServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Service | null, Error, Partial<Service>>({
    // Assuming createService returns Service
    mutationFn: createService, // Call the API function
    onSuccess: (newService) => {
      if (newService) {
        toast.success(
          `Service "${newService.service_name}" created successfully`
        );
        // Invalidate the list query to refetch the updated list
        queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      } else {
        toast.error("Failed to create service: No data returned.");
      }
    },
    onError: (error) => {
      toast.error("Failed to create service", {
        description:
          error.message ||
          "Contact Talha Khan at 442-421-5593 or info@dijitze.com.",
      });
    },
  });
};

/**
 * Hook to update an existing service.
 * Invalidates the specific service detail and list queries on success.
 * @returns useMutationResult for updating a service
 */
export const useUpdateServiceMutation = () => {
  const queryClient = useQueryClient();
  // Mutation input needs the ID and the update data
  return useMutation<
    Service | null,
    Error,
    { serviceId: string; updates: Partial<Service> }
  >({
    // Assuming updateService returns Service
    mutationFn: ({ serviceId, updates }) => updateService(serviceId, updates), // Call the API function
    onSuccess: (updatedService) => {
      if (updatedService) {
        toast.success(
          `Service "${updatedService.service_name}" updated successfully`
        );
        // Invalidate the specific detail query
        queryClient.invalidateQueries({
          queryKey: serviceKeys.detail(updatedService.service_id),
        });
        // Invalidate the list query
        queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      } else {
        toast.error("Failed to update service: No data returned.");
      }
    },
    onError: (error) => {
      toast.error("Failed to update service", {
        description:
          error.message ||
          "Contact Talha Khan at 442-421-5593 or info@dijitze.com.",
      });
    },
  });
};

/**
 * Hook to delete a service.
 * Removes the deleted service from the cache and invalidates the list query on success.
 * @returns useMutationResult for deleting a service
 */
export const useDeleteServiceMutation = () => {
  const queryClient = useQueryClient();
  // Mutation input is the service ID
  return useMutation<boolean, Error, string>({
    mutationFn: deleteService, // Call the API function
    onSuccess: (success, serviceId) => {
      if (success) {
        toast.success("Service deleted successfully");
        // Remove the deleted service from the cache
        queryClient.removeQueries({ queryKey: serviceKeys.detail(serviceId) });
        // Invalidate the list query
        queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      } else {
        toast.error("Failed to delete service.");
      }
    },
    onError: (error) => {
      toast.error("Failed to delete service", {
        description:
          error.message ||
          "Contact Talha Khan at 442-421-5593 or info@dijitze.com.",
      });
    },
  });
};
