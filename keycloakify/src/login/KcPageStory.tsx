// KcPageStory provides mock Keycloak context for Storybook development.
// Use this to render login pages without a running Keycloak instance.
//
// Usage in stories:
//   import { getKcContextMock } from "./KcPageStory";
//   window.kcContext = getKcContextMock({ pageId: "login.ftl", overrides: {} });

import { createGetKcContextMock } from "keycloakify/login/KcContext";
import type { KcContextExtension, KcContextExtensionPerPage } from "./KcContext";

export const { getKcContextMock } = createGetKcContextMock<
    KcContextExtension,
    KcContextExtensionPerPage
>({
    kcContextExtension: {
        themeName: "boilerplate-keycloak",
        properties: {} as never
    },
    kcContextExtensionPerPage: {}
});
