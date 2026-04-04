import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Consent(props: PageProps<Extract<KcContext, { pageId: "consent.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { url, oauth, client } = kcContext;
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
                    {client.attributes.logoUri && (
                        <img src={client.attributes.logoUri} alt={client.name ?? client.clientId} className="h-10 object-contain" />
                    )}
                    <p className="text-base font-normal text-muted-foreground">
                        {client.name
                            ? msg("oauthGrantTitle", advancedMsgStr(client.name))
                            : msg("oauthGrantTitle", client.clientId)}
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

                {(client.attributes.policyUri || client.attributes.tosUri) && (
                    <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                        <p className="font-medium">
                            {client.name
                                ? msg("oauthGrantInformation", advancedMsgStr(client.name))
                                : msg("oauthGrantInformation", client.clientId)}
                        </p>
                        {client.attributes.tosUri && (
                            <p>
                                {msg("oauthGrantReview")}{" "}
                                <a href={client.attributes.tosUri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    {msg("oauthGrantTos")}
                                </a>
                            </p>
                        )}
                        {client.attributes.policyUri && (
                            <p>
                                {msg("oauthGrantReview")}{" "}
                                <a href={client.attributes.policyUri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    {msg("oauthGrantPolicy")}
                                </a>
                            </p>
                        )}
                    </div>
                )}

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
