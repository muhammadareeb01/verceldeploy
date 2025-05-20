
import React from 'react';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';

interface DeleteCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  categoryName: string;
}

const DeleteCategoryDialog = ({ 
  open, 
  onOpenChange, 
  onConfirm, 
  isDeleting, 
  categoryName 
}: DeleteCategoryDialogProps) => {
  return (
    <DeleteConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      isDeleting={isDeleting}
      title="Delete Category"
      description="Are you sure you want to delete the category {name}? This action cannot be undone."
      itemName={categoryName}
    />
  );
};

export default DeleteCategoryDialog;
