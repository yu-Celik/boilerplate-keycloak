import { type PageProps } from "keycloakify/login/pages/PageProps";
import DefaultError from "keycloakify/login/pages/Error";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

type Props = PageProps<Extract<KcContext, { pageId: "error.ftl" }>, I18n>;

export default function Error(props: Props) {
    return <DefaultError {...props} />;
}
