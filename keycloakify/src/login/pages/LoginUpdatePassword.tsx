import { type PageProps } from "keycloakify/login/pages/PageProps";
import DefaultLoginUpdatePassword from "keycloakify/login/pages/LoginUpdatePassword";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

type Props = PageProps<Extract<KcContext, { pageId: "login-update-password.ftl" }>, I18n>;

export default function LoginUpdatePassword(props: Props) {
    return <DefaultLoginUpdatePassword {...props} />;
}
