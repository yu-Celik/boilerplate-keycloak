import type React from "react";
import { type PageProps } from "keycloakify/login/pages/PageProps";
import DefaultIdpReviewUserProfile from "keycloakify/login/pages/IdpReviewUserProfile";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

type Props = PageProps<
    Extract<KcContext, { pageId: "idp-review-user-profile.ftl" }>,
    I18n
> & {
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

export default function LoginIdpReviewProfile(props: Props) {
    return <DefaultIdpReviewUserProfile {...props} />;
}
