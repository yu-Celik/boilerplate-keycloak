import { type PageProps } from "keycloakify/login/pages/PageProps";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import DefaultLogin from "keycloakify/login/pages/Login";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

type Props = PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>;

export default function Login(props: Props) {
    // Uncomment and customise the block below to override default rendering.
    // You can copy the default implementation from:
    // node_modules/keycloakify/src/login/pages/Login.tsx
    //
    // const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
    // const { getKcClsx } = ... etc.
    //
    // For now we delegate entirely to the default, which uses our custom Template.
    return <DefaultLogin {...props} />;
}
