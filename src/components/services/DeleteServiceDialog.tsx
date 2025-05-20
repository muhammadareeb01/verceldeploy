
import React from 'react';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';

interface DeleteServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  serviceName: string;
}

const DeleteServiceDialog = ({ 
  open, 
  onOpenChange, 
  onConfirm, 
  isDeleting, 
  serviceName 
}: DeleteServiceDialogProps) => {
  return (
    <DeleteConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      isDeleting={isDeleting}
      title="Delete Service"
      description="Are you sure you want to delete the service {name}? This action cannot be undone."
      itemName={serviceName}
    />
  );
};

export default DeleteServiceDialog;
