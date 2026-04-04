import type React from "react";
import { useState, useLayoutEffect } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = PageProps<Extract<KcContext, { pageId: "register.ftl" }>, I18n> & {
    UserProfileFormFields: LazyOrNot<(props: UserProfileFormFieldsProps) => React.ReactElement | null>;
    doMakeUserConfirmPassword: boolean;
};

export default function Register(props: Props) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes, UserProfileFormFields, doMakeUserConfirmPassword } = props;

    const {
        messageHeader,
        url,
        messagesPerField,
        recaptchaRequired,
        recaptchaVisible,
        recaptchaSiteKey,
        recaptchaAction,
        termsAcceptanceRequired
    } = kcContext;

    const { msg, msgStr, advancedMsg } = i18n;

    const [isFormSubmittable, setIsFormSubmittable] = useState(false);
    const [areTermsAccepted, setAreTermsAccepted] = useState(false);

    useLayoutEffect(() => {
        (window as any)["onSubmitRecaptcha"] = () => {
            (document.getElementById("kc-register-form") as HTMLFormElement | null)?.requestSubmit();
        };
        return () => {
            delete (window as any)["onSubmitRecaptcha"];
        };
    }, []);

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            headerNode={messageHeader !== undefined ? advancedMsg(messageHeader) : msg("registerTitle")}
            displayMessage={messagesPerField.exists("global")}
            displayRequiredFields
        >
            <form id="kc-register-form" action={url.registrationAction} method="post">
                <div className="space-y-4">
                    <UserProfileFormFields
                        kcContext={kcContext}
                        i18n={i18n}
                        kcClsx={() => ""}
                        onIsFormSubmittableValueChange={setIsFormSubmittable}
                        doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                    />

                    {termsAcceptanceRequired && (
                        <TermsAcceptance
                            i18n={i18n}
                            messagesPerField={messagesPerField}
                            areTermsAccepted={areTermsAccepted}
                            onAreTermsAcceptedValueChange={setAreTermsAccepted}
                        />
                    )}

                    {recaptchaRequired && (recaptchaVisible || recaptchaAction === undefined) && (
                        <div className="form-group">
                            <div className="g-recaptcha" data-size="compact" data-sitekey={recaptchaSiteKey} data-action={recaptchaAction} />
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                        <a href={url.loginUrl} className="text-sm text-primary hover:underline">
                            {msg("backToLogin")}
                        </a>

                        {recaptchaRequired && !recaptchaVisible && recaptchaAction !== undefined ? (
                            <button
                                className={cn(
                                    "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 g-recaptcha"
                                )}
                                data-sitekey={recaptchaSiteKey}
                                data-callback="onSubmitRecaptcha"
                                data-action={recaptchaAction}
                                type="submit"
                            >
                                {msg("doRegister")}
                            </button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={!isFormSubmittable || (termsAcceptanceRequired && !areTermsAccepted)}
                            >
                                {msg("doRegister")}
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </Template>
    );
}

function TermsAcceptance(props: {
    i18n: I18n;
    messagesPerField: Pick<KcContext["messagesPerField"], "existsError" | "get">;
    areTermsAccepted: boolean;
    onAreTermsAcceptedValueChange: (areTermsAccepted: boolean) => void;
}) {
    const { i18n, messagesPerField, areTermsAccepted, onAreTermsAcceptedValueChange } = props;
    const { msg } = i18n;

    return (
        <div className="space-y-2">
            <div className="rounded-md border p-3 text-sm">
                <p className="font-medium mb-1">{msg("termsTitle")}</p>
                <div id="kc-registration-terms-text" className="text-muted-foreground">
                    {msg("termsText")}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="termsAccepted"
                    name="termsAccepted"
                    className="h-4 w-4 rounded border-input"
                    checked={areTermsAccepted}
                    onChange={e => onAreTermsAcceptedValueChange(e.target.checked)}
                    aria-invalid={messagesPerField.existsError("termsAccepted")}
                />
                <label htmlFor="termsAccepted" className="text-sm">
                    {msg("acceptTerms")}
                </label>
            </div>
            {messagesPerField.existsError("termsAccepted") && (
                <p
                    id="input-error-terms-accepted"
                    className="text-sm text-destructive"
                    aria-live="polite"
                    dangerouslySetInnerHTML={{ __html: kcSanitize(messagesPerField.get("termsAccepted")) }}
                />
            )}
        </div>
    );
}
