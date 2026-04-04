import type React from "react";
import { useState } from "react";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button } from "@/components/ui/button";

type Props = PageProps<Extract<KcContext, { pageId: "idp-review-user-profile.ftl" }>, I18n> & {
    UserProfileFormFields: LazyOrNot<(props: UserProfileFormFieldsProps) => React.ReactElement | null>;
    doMakeUserConfirmPassword: boolean;
};

export default function LoginIdpReviewProfile(props: Props) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes, UserProfileFormFields, doMakeUserConfirmPassword } = props;

    const { msg, msgStr } = i18n;
    const { url, messagesPerField } = kcContext;

    const [isFormSubmittable, setIsFormSubmittable] = useState(false);

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={messagesPerField.exists("global")}
            displayRequiredFields
            headerNode={msg("loginIdpReviewProfileTitle")}
        >
            <form id="kc-idp-review-profile-form" action={url.loginAction} method="post">
                <div className="space-y-4">
                    <UserProfileFormFields
                        kcContext={kcContext}
                        i18n={i18n}
                        kcClsx={() => ""}
                        onIsFormSubmittableValueChange={setIsFormSubmittable}
                        doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                    />

                    <Button type="submit" className="w-full" disabled={!isFormSubmittable}>
                        {msgStr("doSubmit")}
                    </Button>
                </div>
            </form>
        </Template>
    );
}
