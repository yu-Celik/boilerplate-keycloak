"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Erreur critique</h1>
          <p className="text-gray-500">
            {error.message || "Une erreur inattendue est survenue."}
          </p>
          <button
            onClick={reset}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
