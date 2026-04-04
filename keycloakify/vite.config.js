import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { keycloakify } from "keycloakify/vite-plugin";
import { resolve } from "path";
import { fileURLToPath } from "url";
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        keycloakify({
            accountThemeImplementation: "Single-Page",
            themeName: "boilerplate-keycloak"
        })
    ],
    resolve: {
        alias: {
            "@": resolve(fileURLToPath(new URL(".", import.meta.url)), "./src")
        }
    }
});
