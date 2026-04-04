import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function LoginVerifyEmail(props: PageProps<Extract<KcContext, { pageId: "login-verify-email.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { msg } = i18n;
    const { url, user } = kcContext;

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayInfo
            headerNode={msg("emailVerifyTitle")}
            infoNode={
                <p className="text-sm text-muted-foreground">
                    {msg("emailVerifyInstruction2")}
                    <br />
                    <a href={url.loginAction} className="text-sm text-primary hover:underline">
                        {msg("doClickHere")}
                    </a>
                    &nbsp;
                    {msg("emailVerifyInstruction3")}
                </p>
            }
        >
            <p className="text-sm text-muted-foreground">
                {msg("emailVerifyInstruction1", user?.email ?? "")}
            </p>
        </Template>
    );
}
