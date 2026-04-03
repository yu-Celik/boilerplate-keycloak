"use client";

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900">
      <h2 className="text-xl font-semibold">Erreur critique</h2>
      <p className="text-sm text-muted-foreground">
        {error.message || "Erreur inattendue. Veuillez réessayer."}
      </p>
      <button
        onClick={reset}
        className="inline-flex h-9 items-center rounded-md bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200"
      >
        Réessayer
      </button>
    </div>
  );
}
