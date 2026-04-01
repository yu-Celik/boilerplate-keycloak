import type React from "react";
import { type PageProps } from "keycloakify/login/pages/PageProps";
import DefaultLoginUpdateProfile from "keycloakify/login/pages/LoginUpdateProfile";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

type Props = PageProps<Extract<KcContext, { pageId: "login-update-profile.ftl" }>, I18n> & {
    UserProfileFormFields: React.LazyExoticComponent<
        (props: {
            kcContext: Props["kcContext"];
            i18n: Props["i18n"];
            onIsFormSubmittableValueChange: (isFormSubmittable: boolean) => void;
            doMakeUserConfirmPassword: boolean;
        }) => React.ReactElement | null
    >;
    doMakeUserConfirmPassword: boolean;
};

export default function LoginUpdateProfile(props: Props) {
    return <DefaultLoginUpdateProfile {...props} />;
}
