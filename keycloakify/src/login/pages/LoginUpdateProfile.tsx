import type React from "react";
import { useState } from "react";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button } from "@/components/ui/button";

type Props = PageProps<Extract<KcContext, { pageId: "login-update-profile.ftl" }>, I18n> & {
    UserProfileFormFields: LazyOrNot<(props: UserProfileFormFieldsProps) => React.ReactElement | null>;
    doMakeUserConfirmPassword: boolean;
};

export default function LoginUpdateProfile(props: Props) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes, UserProfileFormFields, doMakeUserConfirmPassword } = props;

    const { messagesPerField, url, isAppInitiatedAction } = kcContext;
    const { msg, msgStr } = i18n;

    const [isFormSubmittable, setIsFormSubmittable] = useState(false);

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayRequiredFields
            headerNode={msg("loginProfileTitle")}
            displayMessage={messagesPerField.exists("global")}
        >
            <form id="kc-update-profile-form" action={url.loginAction} method="post">
                <div className="space-y-4">
                    <UserProfileFormFields
                        kcContext={kcContext}
                        i18n={i18n}
                        kcClsx={() => ""}
                        onIsFormSubmittableValueChange={setIsFormSubmittable}
                        doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                    />

                    <div className="flex gap-2 pt-2">
                        <Button
                            type="submit"
                            disabled={!isFormSubmittable}
                            className={isAppInitiatedAction ? "" : "w-full"}
                        >
                            {msgStr("doSubmit")}
                        </Button>
                        {isAppInitiatedAction && (
                            <Button
                                type="submit"
                                name="cancel-aia"
                                value="true"
                                variant="outline"
                                formNoValidate
                            >
                                {msg("doCancel")}
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </Template>
    );
}
