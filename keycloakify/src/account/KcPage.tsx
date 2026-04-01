// Account Console v3 — Single-Page Application
//
// The Account Console v3 is a React SPA that uses React Router internally.
// Keycloakify wraps it: you don't route between standalone pages like in the
// login theme. Instead you provide a root component and keycloakify handles
// mounting it inside Keycloak's account console shell.
//
// See: https://docs.keycloakify.dev/themes/account

import { lazy, Suspense } from "react";
import DefaultKcAccountUiLoader from "keycloakify/account/KcAccountUiLoader";
import type { KcContext } from "keycloakify/account/KcContext";
import { AccountApp } from "./AccountApp";

type Props = {
    kcContext: KcContext;
};

export default function KcPage({ kcContext }: Props) {
    return (
        <Suspense>
            <DefaultKcAccountUiLoader
                KcAccountUi={AccountApp}
                kcContext={kcContext}
            />
        </Suspense>
    );
}
