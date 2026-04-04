import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginResetPassword(props: PageProps<Extract<KcContext, { pageId: "login-reset-password.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { url, realm, auth, messagesPerField } = kcContext;
    const { msg, msgStr } = i18n;

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayInfo
            displayMessage={!messagesPerField.existsError("username")}
            infoNode={realm.duplicateEmailsAllowed ? msg("emailInstructionUsername") : msg("emailInstruction")}
            headerNode={msg("emailForgotTitle")}
        >
            <form id="kc-reset-password-form" action={url.loginAction} method="post">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">
                            {!realm.loginWithEmailAllowed
                                ? msg("username")
                                : !realm.registrationEmailAsUsername
                                  ? msg("usernameOrEmail")
                                  : msg("email")}
                        </Label>
                        <Input
                            type="text"
                            id="username"
                            name="username"
                            autoFocus
                            defaultValue={auth.attemptedUsername ?? ""}
                            aria-invalid={messagesPerField.existsError("username")}
                        />
                        {messagesPerField.existsError("username") && (
                            <p
                                id="input-error-username"
                                className="text-sm text-destructive"
                                aria-live="polite"
                                dangerouslySetInnerHTML={{ __html: kcSanitize(messagesPerField.get("username")) }}
                            />
                        )}
                    </div>

                    <div className="space-y-3 pt-2">
                        <Button type="submit" className="w-full">
                            {msgStr("doSubmit")}
                        </Button>
                        <div className="flex justify-center">
                            <Button variant="link" asChild className="text-sm">
                                <a href={url.loginUrl}>{msg("backToLogin")}</a>
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </Template>
    );
}
