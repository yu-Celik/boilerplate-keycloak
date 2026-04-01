import { type PageProps } from "keycloakify/login/pages/PageProps";
import DefaultLoginPassword from "keycloakify/login/pages/LoginPassword";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

type Props = PageProps<Extract<KcContext, { pageId: "login-password.ftl" }>, I18n>;

export default function LoginPassword(props: Props) {
    return <DefaultLoginPassword {...props} />;
}
