"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function RevokeButton() {
  const { pending } = useFormStatus();
  return (
    <AlertDialogTrigger
      type="button"
      disabled={pending}
      className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
    >
      {pending ? "..." : "Révoquer"}
    </AlertDialogTrigger>
  );
}

export function RevokeForm({
  action,
  invitationId,
}: {
  action: (formData: FormData) => void;
  invitationId: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <form
        ref={formRef}
        action={action}
        className="inline"
      >
        <input type="hidden" name="invitationId" value={invitationId} />
        <RevokeButton />
      </form>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Révoquer cette invitation ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. L&apos;invitation sera définitivement supprimée.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              formRef.current?.requestSubmit();
            }}
          >
            Révoquer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
