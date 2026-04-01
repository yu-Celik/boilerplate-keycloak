import { signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        action={async () => {
          "use server";
          await signIn("keycloak", { redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="rounded-md bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
        >
          Sign in with Keycloak
        </button>
      </form>
    </div>
  );
}
