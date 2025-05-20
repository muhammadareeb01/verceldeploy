import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getServices,
  getServiceCategories,
  createService,
  updateService,
  deleteService,
} from "@/api/services";
import { Service, ServiceCategory } from "@/types/types";
import {
  Package,
  Check,
  Calendar,
  DollarSign,
  PlusCircle,
  Edit,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ServiceEditModal from "@/components/services/ServiceEditModal";
import DeleteServiceDialog from "@/components/services/DeleteServiceDialog";

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { user, userRole } = useAuth(); // Use userRole instead of role
  const isAdmin = userRole === "ADMIN" || userRole === "MANAGER";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [servicesData, categoriesData] = await Promise.all([
        getServices(),
        getServiceCategories(),
      ]);
      setServices(servicesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load services data");
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleAddService = () => {
    setSelectedService(null);
    setFormMode("add");
    setIsFormOpen(true);
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleDeleteClick = (service: Service) => {
    setSelectedService(service);
    setIsDeleteOpen(true);
  };

  const handleSaveService = async (serviceData: Partial<Service>) => {
    try {
      if (formMode === "add") {
        const newService = await createService(serviceData);
        if (newService) {
          toast.success("Service added successfully");
          setServices([...services, newService]);
        } else {
          toast.error("Failed to add service");
        }
      } else {
        if (selectedService) {
          const updatedService = await updateService(
            selectedService.service_id,
            serviceData
          );
          if (updatedService) {
            toast.success("Service updated successfully");
            setServices(
              services.map((svc) =>
                svc.service_id === selectedService.service_id
                  ? updatedService
                  : svc
              )
            );
          } else {
            toast.error("Failed to update service");
          }
        }
      }
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("An error occurred while saving the service");
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;

    setIsDeleting(true);
    try {
      const success = await deleteService(selectedService.service_id);
      if (success) {
        toast.success("Service deleted successfully");
        setServices(
          services.filter(
            (svc) => svc.service_id !== selectedService.service_id
          )
        );
        setIsDeleteOpen(false);
      } else {
        toast.error("Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("An error occurred while deleting the service");
    } finally {
      setIsDeleting(false);
    }
  };

  // Get category name
  const getCategoryName = (service: Service) => {
    if (!service.category) return "Uncategorized";

    // Handle both string and object category_id
    if (typeof service.category === "string") {
      const category = categories.find(
        (cat) => cat.category_id === service.category.category_id
      );
      return category?.category_name || "Uncategorized";
    } else if (
      typeof service.category === "object" &&
      service.category !== null
    ) {
      // @ts-ignore - handle nested category data
      return service.category.category_name || "Uncategorized";
    }

    return "Uncategorized";
  };

  const getCategoryId = (service: Service): string => {
    if (!service.category) return "";

    // Handle both string and object category_id
    if (typeof service.category === "string") {
      return service.category;
    } else if (
      typeof service.category === "object" &&
      service.category !== null
    ) {
      // @ts-ignore - handle nested category data
      return service.category.category_id || "";
    }

    return "";
  };

  // Filter services based on search term and category filter
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description &&
        service.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === "all" || getCategoryId(service) === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="p-4 container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Services</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-muted-foreground">
            Manage the services offered by your organization
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleAddService}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Service
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search services..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem
                  key={category.category_id}
                  value={category.category_id}
                >
                  {category.category_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <Card key={service.service_id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  {service.service_name}
                </CardTitle>
                <Badge variant={service.is_mandatory ? "default" : "secondary"}>
                  {service.is_mandatory ? "Mandatory" : "Optional"}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {service.description || "No description provided"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Category</p>
                  <p className="font-medium">{getCategoryName(service)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" /> Base Cost
                    </p>
                    <p className="font-medium">
                      {formatCurrency(service.base_cost)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" /> Est. Duration
                    </p>
                    <p className="font-medium">
                      {service.estimated_duration_days
                        ? `${service.estimated_duration_days} days`
                        : "Not specified"}
                    </p>
                  </div>
                </div>
                {service.required_documents_template &&
                  service.required_documents_template.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Required Documents
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {service.required_documents_template
                          .slice(0, 2)
                          .map((doc, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="flex items-center"
                            >
                              <Check className="h-3 w-3 mr-1" /> {doc}
                            </Badge>
                          ))}
                        {service.required_documents_template.length > 2 && (
                          <Badge variant="outline">
                            +{service.required_documents_template.length - 2}{" "}
                            more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </CardContent>
            {isAdmin && (
              <CardFooter className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditService(service)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => handleDeleteClick(service)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}

        {filteredServices.length === 0 && (
          <div className="col-span-full text-center p-12 border rounded-lg">
            {searchTerm || categoryFilter !== "all" ? (
              <p className="text-muted-foreground mb-4">
                No services found matching your filters.
              </p>
            ) : (
              <>
                <p className="text-muted-foreground mb-4">
                  No services found. Start by adding a new service.
                </p>
                {isAdmin && (
                  <Button onClick={handleAddService}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add New Service
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {selectedService && (
        <DeleteServiceDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
          serviceName={selectedService.service_name}
        />
      )}

      <ServiceEditModal
        service={selectedService}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveService}
        title={formMode === "add" ? "Add Service" : "Edit Service"}
      />
    </div>
  );
};

export default Services;
