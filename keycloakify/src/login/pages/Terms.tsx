import { type PageProps } from "keycloakify/login/pages/PageProps";
import DefaultTerms from "keycloakify/login/pages/Terms";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

type Props = PageProps<Extract<KcContext, { pageId: "terms.ftl" }>, I18n>;

export default function Terms(props: Props) {
    return <DefaultTerms {...props} />;
}
