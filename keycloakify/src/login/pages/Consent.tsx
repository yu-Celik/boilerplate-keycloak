import { type PageProps } from "keycloakify/login/pages/PageProps";
import DefaultConsent from "keycloakify/login/pages/Consent";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

type Props = PageProps<Extract<KcContext, { pageId: "consent.ftl" }>, I18n>;

export default function Consent(props: Props) {
    return <DefaultConsent {...props} />;
}
