import { Suspense, lazy } from "react";
import type { KcContext } from "keycloakify/account/KcContext";
import DefaultPage from "keycloakify/account/DefaultPage";
import Template from "./Template";
import { useI18n } from "./i18n";

const PersonalInfo = lazy(() => import("./pages/PersonalInfo"));
const SigningIn = lazy(() => import("./pages/SigningIn"));
const DeviceActivity = lazy(() => import("./pages/DeviceActivity"));
const Applications = lazy(() => import("./pages/Applications"));
const LinkedAccounts = lazy(() => import("./pages/LinkedAccounts"));
const Groups = lazy(() => import("./pages/Groups"));
const Totp = lazy(() => import("./pages/Totp"));
const Log = lazy(() => import("./pages/Log"));

type Props = {
    kcContext: KcContext;
};

export default function KcPage({ kcContext }: Props) {
    const { i18n } = useI18n({ kcContext });

    const sharedProps = {
        i18n,
        Template,
        doUseDefaultCss: false,
        classes: undefined
    } as const;

    return (
        <Suspense>
            {(() => {
                switch (kcContext.pageId) {
                    case "account.ftl":
                        return <PersonalInfo kcContext={kcContext} {...sharedProps} />;
                    case "password.ftl":
                        return <SigningIn kcContext={kcContext} {...sharedProps} />;
                    case "sessions.ftl":
                        return <DeviceActivity kcContext={kcContext} {...sharedProps} />;
                    case "applications.ftl":
                        return <Applications kcContext={kcContext} {...sharedProps} />;
                    case "federatedIdentity.ftl":
                        return <LinkedAccounts kcContext={kcContext} {...sharedProps} />;
                    case "totp.ftl":
                        return <Totp kcContext={kcContext} {...sharedProps} />;
                    case "log.ftl":
                        return <Log kcContext={kcContext} {...sharedProps} />;
                    default:
                        return (
                            <DefaultPage
                                kcContext={kcContext}
                                i18n={i18n}
                                Template={Template}
                                doUseDefaultCss={false}
                            />
                        );
                }
            })()}
        </Suspense>
    );
}
