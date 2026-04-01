import { signOut } from "@/lib/auth";

export default function LogoutPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="rounded-md bg-destructive px-6 py-3 text-destructive-foreground hover:bg-destructive/90"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
