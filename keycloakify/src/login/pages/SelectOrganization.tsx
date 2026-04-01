import { type PageProps } from "keycloakify/login/pages/PageProps";
import DefaultSelectAuthenticator from "keycloakify/login/pages/SelectAuthenticator";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

// SelectOrganization maps to select-authenticator.ftl in Keycloakify v11.
// If you need the actual select-organization.ftl page, add it to KcContextExtensionPerPage.
type Props = PageProps<Extract<KcContext, { pageId: "select-authenticator.ftl" }>, I18n>;

export default function SelectOrganization(props: Props) {
    return <DefaultSelectAuthenticator {...props} />;
}
