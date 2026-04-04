import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Consent(props: PageProps<Extract<KcContext, { pageId: "login-oauth-grant.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { url, oauth } = kcContext;
    const { msg, msgStr, advancedMsg, advancedMsgStr } = i18n;

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            bodyClassName="oauth"
            headerNode={
                <div className="space-y-2">
                    <p className="text-base font-normal text-muted-foreground">
                        {msg("oauthGrantTitle", advancedMsgStr(oauth.client))}
                    </p>
                </div>
            }
        >
            <div id="kc-oauth" className="space-y-4">
                <div>
                    <p className="text-sm font-medium mb-2">{msg("oauthGrantRequest")}</p>
                    <ul className="space-y-1">
                        {oauth.clientScopesRequested.map(clientScope => (
                            <li key={clientScope.consentScreenText} className="flex items-start gap-2 text-sm">
                                <span className="mt-0.5 text-primary">&#10003;</span>
                                <span>
                                    {advancedMsg(clientScope.consentScreenText)}
                                    {clientScope.dynamicScopeParameter && (
                                        <>
                                            {": "}
                                            <b>{clientScope.dynamicScopeParameter}</b>
                                        </>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <Separator />

                <form action={url.oauthAction} method="POST">
                    <input type="hidden" name="code" value={oauth.code} />
                    <div className="flex gap-3">
                        <Button type="submit" name="accept" id="kc-login" className="flex-1">
                            {msgStr("doYes")}
                        </Button>
                        <Button type="submit" name="cancel" id="kc-cancel" variant="outline" className="flex-1">
                            {msgStr("doNo")}
                        </Button>
                    </div>
                </form>
            </div>
        </Template>
    );
}
