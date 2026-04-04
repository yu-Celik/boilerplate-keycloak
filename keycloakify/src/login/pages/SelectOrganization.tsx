import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

// SelectOrganization maps to select-authenticator.ftl in Keycloakify v11.
type Props = PageProps<Extract<KcContext, { pageId: "select-authenticator.ftl" }>, I18n>;

export default function SelectOrganization(props: Props) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { url, auth } = kcContext;
    const { msg, advancedMsg } = i18n;

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayInfo={false}
            headerNode={msg("loginChooseAuthenticator")}
        >
            <form id="kc-select-credential-form" action={url.loginAction} method="post">
                <div className="space-y-2">
                    {auth.authenticationSelections.map((authenticationSelection, i) => (
                        <button
                            key={i}
                            type="submit"
                            name="authenticationExecution"
                            value={authenticationSelection.authExecId}
                            className="w-full flex items-center gap-3 rounded-md border p-4 text-left hover:bg-accent transition-colors"
                        >
                            <div className="flex-1">
                                <p className="text-sm font-medium">
                                    {advancedMsg(authenticationSelection.displayName)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {advancedMsg(authenticationSelection.helpText)}
                                </p>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ))}
                </div>
            </form>
        </Template>
    );
}
