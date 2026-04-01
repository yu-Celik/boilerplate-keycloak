import { type PageProps } from "keycloakify/login/pages/PageProps";
import DefaultLoginVerifyEmail from "keycloakify/login/pages/LoginVerifyEmail";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

type Props = PageProps<Extract<KcContext, { pageId: "login-verify-email.ftl" }>, I18n>;

export default function LoginVerifyEmail(props: Props) {
    return <DefaultLoginVerifyEmail {...props} />;
}
