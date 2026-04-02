"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
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

export function LogoutButton() {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive hover:bg-sidebar-accent">
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Se déconnecter ?</AlertDialogTitle>
          <AlertDialogDescription>
            Vous serez déconnecté de votre session et redirigé vers la page de
            connexion.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              window.location.href = "/api/auth/logout";
            }}
          >
            Se déconnecter
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
