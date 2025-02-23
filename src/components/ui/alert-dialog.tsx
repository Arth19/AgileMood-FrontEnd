"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AlertDialogProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export default function AlertDialog({ isOpen, message, onClose }: AlertDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notificação</DialogTitle>
        </DialogHeader>
        <p className="text-gray-600">{message}</p>
        <DialogFooter>
          <Button onClick={onClose} className="w-full bg-blue-700 text-white hover:bg-blue-800">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
