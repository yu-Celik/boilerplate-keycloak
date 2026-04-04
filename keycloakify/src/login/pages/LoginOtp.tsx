import { Fragment, useState } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginOtp(props: PageProps<Extract<KcContext, { pageId: "login-otp.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { otpLogin, url, messagesPerField } = kcContext;
    const { msg, msgStr } = i18n;

    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={!messagesPerField.existsError("totp")}
            headerNode={msg("doLogIn")}
        >
            <form
                id="kc-otp-login-form"
                action={url.loginAction}
                onSubmit={() => {
                    setIsSubmitting(true);
                    return true;
                }}
                method="post"
            >
                <div className="space-y-4">
                    {otpLogin.userOtpCredentials.length > 1 && (
                        <div className="space-y-2">
                            <Label>{msg("loginOtpOneTime")}</Label>
                            <div className="flex flex-col gap-2">
                                {otpLogin.userOtpCredentials.map((otpCredential, index) => (
                                    <Fragment key={index}>
                                        <label
                                            htmlFor={`kc-otp-credential-${index}`}
                                            className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-accent"
                                        >
                                            <input
                                                id={`kc-otp-credential-${index}`}
                                                type="radio"
                                                name="selectedCredentialId"
                                                value={otpCredential.id}
                                                defaultChecked={otpCredential.id === otpLogin.selectedCredentialId}
                                                className="h-4 w-4"
                                            />
                                            <span className="text-sm font-medium">{otpCredential.userLabel}</span>
                                        </label>
                                    </Fragment>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="otp">{msg("loginOtpOneTime")}</Label>
                        <Input
                            id="otp"
                            name="otp"
                            autoComplete="off"
                            type="text"
                            autoFocus
                            aria-invalid={messagesPerField.existsError("totp")}
                        />
                        {messagesPerField.existsError("totp") && (
                            <p
                                id="input-error-otp-code"
                                className="text-sm text-destructive"
                                aria-live="polite"
                                dangerouslySetInnerHTML={{ __html: kcSanitize(messagesPerField.get("totp")) }}
                            />
                        )}
                    </div>

                    <Button
                        name="login"
                        id="kc-login"
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {msgStr("doLogIn")}
                    </Button>
                </div>
            </form>
        </Template>
    );
}
