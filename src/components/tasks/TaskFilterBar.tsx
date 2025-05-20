import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, Filter, X, SortAsc, SortDesc, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TaskFilter, SortOption } from "@/types/tasks";

interface TaskFilterBarProps {
  searchQuery: string;
  filters: TaskFilter;
  sortOption: SortOption;
  companies: Array<{ id: string; name: string }>;
  cases: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  isCurrentUserFilter: boolean;
  isLoadingData: boolean;
  onSearchChange: (query: string) => void;
  onFilterChange: (filters: Partial<TaskFilter>) => void;
  onSortChange: (sort: SortOption) => void;
  onClearFilters: () => void;
}

const sortOptions = [
  { label: "Due Date (Earliest)", value: "dueDate-asc" },
  { label: "Due Date (Latest)", value: "dueDate-desc" },
  { label: "Priority (Highest)", value: "priority-desc" },
  { label: "Priority (Lowest)", value: "priority-asc" },
  { label: "Task Name (A-Z)", value: "taskName-asc" },
  { label: "Task Name (Z-A)", value: "taskName-desc" },
  { label: "Status", value: "status-asc" },
];

const priorityOptions = [
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" },
];

const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  searchQuery,
  filters,
  sortOption,
  companies,
  cases,
  categories,
  isCurrentUserFilter,
  isLoadingData,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onClearFilters,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Count active filters
  const activeFilterCount = [
    filters.assignedToMe,
    !!filters.company,
    !!filters.case,
    !!filters.priority,
    !!filters.category,
  ].filter(Boolean).length;

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split("-");
    onSortChange({
      field: field as SortOption["field"],
      direction: direction as "asc" | "desc",
    });
    setIsSortOpen(false);
  };

  const getCurrentSortValue = () => {
    return `${sortOption.field}-${sortOption.direction}`;
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tasks..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={isLoadingData}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Assigned to Me Quick Filter */}
          <div className="flex items-center">
            <Button
              variant={filters.assignedToMe ? "secondary" : "outline"}
              size="sm"
              className={cn("gap-2", filters.assignedToMe && "bg-primary/20")}
              onClick={() =>
                onFilterChange({ assignedToMe: !filters.assignedToMe })
              }
            >
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">My Tasks</span>
              {filters.assignedToMe && (
                <X
                  className="h-3 w-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFilterChange({ assignedToMe: false });
                  }}
                />
              )}
            </Button>
          </div>

          {/* Filters */}
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <Badge className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="space-y-4">
                <h4 className="font-medium">Filter Tasks</h4>

                {/* Company Filter */}
                <div className="space-y-1">
                  <Label htmlFor="company-filter">Company</Label>
                  <Select
                    value={filters.company || ""}
                    onValueChange={(value) =>
                      onFilterChange({ company: value || undefined })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Companies</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Case Filter */}
                <div className="space-y-1">
                  <Label htmlFor="case-filter">Case</Label>
                  <Select
                    value={filters.case || ""}
                    onValueChange={(value) =>
                      onFilterChange({ case: value || undefined })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select case" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Cases</SelectItem>
                      {cases.map((caseItem) => (
                        <SelectItem key={caseItem.id} value={caseItem.id}>
                          {caseItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority Filter */}
                <div className="space-y-1">
                  <Label htmlFor="priority-filter">Priority</Label>
                  <Select
                    value={filters.priority || ""}
                    onValueChange={(value) =>
                      onFilterChange({
                        priority: value as
                          | "HIGH"
                          | "MEDIUM"
                          | "LOW"
                          | undefined,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Priority</SelectItem>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-1">
                  <Label htmlFor="category-filter">Category</Label>
                  <Select
                    value={filters.category || ""}
                    onValueChange={(value) =>
                      onFilterChange({ category: value || undefined })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between pt-2">
                  <Button size="sm" variant="outline" onClick={onClearFilters}>
                    Clear All
                  </Button>
                  <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Sort */}
          <Popover open={isSortOpen} onOpenChange={setIsSortOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {sortOption.direction === "asc" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Sort</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2">
                <h4 className="font-medium">Sort By</h4>
                <Select
                  value={getCurrentSortValue()}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sorting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 animate-fade-in">
          {filters.assignedToMe && (
            <Badge variant="secondary" className="gap-1">
              My Tasks
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFilterChange({ assignedToMe: false })}
              />
            </Badge>
          )}
          {filters.company && (
            <Badge variant="secondary" className="gap-1">
              {companies.find((c) => c.id === filters.company)?.name ||
                "Company"}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFilterChange({ company: undefined })}
              />
            </Badge>
          )}
          {filters.case && (
            <Badge variant="secondary" className="gap-1">
              {cases.find((c) => c.id === filters.case)?.name || "Case"}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFilterChange({ case: undefined })}
              />
            </Badge>
          )}
          {filters.priority && (
            <Badge variant="secondary" className="gap-1">
              {filters.priority} Priority
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFilterChange({ priority: undefined })}
              />
            </Badge>
          )}
          {filters.category && (
            <Badge variant="secondary" className="gap-1">
              {categories.find((c) => c.id === filters.category)?.name ||
                "Category"}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFilterChange({ category: undefined })}
              />
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs h-6"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskFilterBar;
