
// Correct the import to use sonner directly
import { toast } from "sonner";

export { toast };
// Export useToast hook compatibly if needed
export const useToast = () => ({ toast });
