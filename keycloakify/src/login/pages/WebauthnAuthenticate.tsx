import { type PageProps } from "keycloakify/login/pages/PageProps";
import DefaultWebauthnAuthenticate from "keycloakify/login/pages/WebauthnAuthenticate";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

type Props = PageProps<Extract<KcContext, { pageId: "webauthn-authenticate.ftl" }>, I18n>;

export default function WebauthnAuthenticate(props: Props) {
    return <DefaultWebauthnAuthenticate {...props} />;
}
