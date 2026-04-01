"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">Une erreur est survenue</h2>
      <p className="text-sm text-muted-foreground">
        {error.message || "Erreur inattendue. Veuillez réessayer."}
      </p>
      <button
        onClick={reset}
        className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Réessayer
      </button>
    </div>
  );
}
