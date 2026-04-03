"use client";

import { useFormStatus } from "react-dom";

function RevokeButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
    >
      {pending ? "..." : "Révoquer"}
    </button>
  );
}

export function RevokeForm({
  action,
  invitationId,
}: {
  action: (formData: FormData) => void;
  invitationId: string;
}) {
  return (
    <form
      action={action}
      className="inline"
      onSubmit={(e) => {
        if (!confirm("Révoquer cette invitation ?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="invitationId" value={invitationId} />
      <RevokeButton />
    </form>
  );
}
