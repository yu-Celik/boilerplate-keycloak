// AccountApp is the root component for the Account Console v3 SPA.
// It is mounted by KcAccountUiLoader and receives routing/context from
// keycloakify. The default implementation re-uses Keycloak's PatternFly UI.
//
// To add custom pages, import them here and add routes via React Router.
// See: https://docs.keycloakify.dev/themes/account

import DefaultAccountApp from "keycloakify/account/DefaultAccountApp";
import "../shared/theme.css";

// Re-export the default Account App as-is.
// Replace with your own implementation to fully customise the account console.
export { DefaultAccountApp as AccountApp };
