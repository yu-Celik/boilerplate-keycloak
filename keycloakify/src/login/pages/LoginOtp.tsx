import { type PageProps } from "keycloakify/login/pages/PageProps";
import DefaultLoginOtp from "keycloakify/login/pages/LoginOtp";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

type Props = PageProps<Extract<KcContext, { pageId: "login-otp.ftl" }>, I18n>;

export default function LoginOtp(props: Props) {
    return <DefaultLoginOtp {...props} />;
}
