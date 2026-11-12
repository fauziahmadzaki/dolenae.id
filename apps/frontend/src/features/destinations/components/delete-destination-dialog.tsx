import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import type { Destination } from "~/types/domain";

interface DeleteDestinationDialogProps {
  destination: Destination;
  isPending: boolean;
  error?: unknown;
  onClose: () => void;
  onConfirm: (destination: Destination) => void;
}

export function DeleteDestinationDialog({
  destination,
  isPending,
  error,
  onClose,
  onConfirm,
}: DeleteDestinationDialogProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[420px]">
        <DialogTitle>Hapus destinasi</DialogTitle>
        <DialogDescription>
          Hapus {destination.name}? Tindakan ini tidak dapat dibatalkan.
        </DialogDescription>
        {error !== undefined && error !== null && (
          <p role="alert" className="text-sm text-danger">
            {error instanceof Error
              ? error.message
              : "Permintaan gagal. Silakan coba lagi."}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" disabled={isPending} onClick={onClose}>
            Batal
          </Button>
          <Button
            className="bg-danger hover:bg-danger/90"
            disabled={isPending}
            onClick={() => onConfirm(destination)}
          >
            {isPending && (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            )}
            Hapus permanen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
