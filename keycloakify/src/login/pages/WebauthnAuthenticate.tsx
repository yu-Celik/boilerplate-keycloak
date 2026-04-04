import { Fragment } from "react";
import { useScript } from "keycloakify/login/pages/WebauthnAuthenticate.useScript";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button } from "@/components/ui/button";

export default function WebauthnAuthenticate(props: PageProps<Extract<KcContext, { pageId: "webauthn-authenticate.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { url, realm, registrationDisabled, authenticators, shouldDisplayAuthenticators } = kcContext;
    const { msg, msgStr, advancedMsg } = i18n;

    const authButtonId = "authenticateWebAuthnButton";

    useScript({ authButtonId, kcContext, i18n });

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayInfo={realm.registrationAllowed && !registrationDisabled}
            infoNode={
                <div id="kc-registration">
                    <span className="text-sm text-muted-foreground">
                        {msg("noAccount")}{" "}
                        <a tabIndex={6} href={url.registrationUrl} className="text-sm text-primary hover:underline">
                            {msg("doRegister")}
                        </a>
                    </span>
                </div>
            }
            headerNode={msg("webauthn-login-title")}
        >
            <div id="kc-form-webauthn">
                {/* Hidden form for WebAuthn data — required by the WebAuthn script */}
                <form id="webauth" action={url.loginAction} method="post">
                    <input type="hidden" id="clientDataJSON" name="clientDataJSON" />
                    <input type="hidden" id="authenticatorData" name="authenticatorData" />
                    <input type="hidden" id="signature" name="signature" />
                    <input type="hidden" id="credentialId" name="credentialId" />
                    <input type="hidden" id="userHandle" name="userHandle" />
                    <input type="hidden" id="error" name="error" />
                </form>

                <div className="space-y-4">
                    {authenticators && (
                        <>
                            {/* Hidden credential selection form — required by the WebAuthn script */}
                            <form id="authn_select">
                                {authenticators.authenticators.map((authenticator, i) => (
                                    <input key={i} type="hidden" name="authn_use_chk" value={authenticator.credentialId} />
                                ))}
                            </form>

                            {shouldDisplayAuthenticators && (
                                <div className="space-y-2">
                                    {authenticators.authenticators.length > 1 && (
                                        <p className="text-sm font-medium">{msg("webauthn-available-authenticators")}</p>
                                    )}
                                    <div className="space-y-2">
                                        {authenticators.authenticators.map((authenticator, i) => (
                                            <div
                                                key={i}
                                                id={`kc-webauthn-authenticator-item-${i}`}
                                                className="flex items-start gap-3 rounded-md border p-3"
                                            >
                                                <div className="flex-1 space-y-1">
                                                    <p
                                                        id={`kc-webauthn-authenticator-label-${i}`}
                                                        className="text-sm font-medium"
                                                    >
                                                        {advancedMsg(authenticator.label)}
                                                    </p>
                                                    {authenticator.transports.displayNameProperties?.length ? (
                                                        <p
                                                            id={`kc-webauthn-authenticator-transport-${i}`}
                                                            className="text-xs text-muted-foreground"
                                                        >
                                                            {authenticator.transports.displayNameProperties
                                                                .map((displayNameProperty, idx, arr) => ({
                                                                    displayNameProperty,
                                                                    hasNext: idx !== arr.length - 1
                                                                }))
                                                                .map(({ displayNameProperty, hasNext }) => (
                                                                    <Fragment key={displayNameProperty}>
                                                                        {advancedMsg(displayNameProperty)}
                                                                        {hasNext && <span>, </span>}
                                                                    </Fragment>
                                                                ))}
                                                        </p>
                                                    ) : null}
                                                    <p className="text-xs text-muted-foreground">
                                                        <span id={`kc-webauthn-authenticator-createdlabel-${i}`}>
                                                            {msg("webauthn-createdAt-label")}
                                                        </span>{" "}
                                                        <span id={`kc-webauthn-authenticator-created-${i}`}>
                                                            {authenticator.createdAt}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <Button id={authButtonId} type="button" autoFocus className="w-full">
                        {msgStr("webauthn-doAuthenticate")}
                    </Button>
                </div>
            </div>
        </Template>
    );
}
