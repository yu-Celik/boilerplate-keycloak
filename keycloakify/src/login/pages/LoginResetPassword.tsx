import { type PageProps } from "keycloakify/login/pages/PageProps";
import DefaultLoginResetPassword from "keycloakify/login/pages/LoginResetPassword";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

type Props = PageProps<Extract<KcContext, { pageId: "login-reset-password.ftl" }>, I18n>;

export default function LoginResetPassword(props: Props) {
    return <DefaultLoginResetPassword {...props} />;
}
