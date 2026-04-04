import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Terms(props: PageProps<Extract<KcContext, { pageId: "terms.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { msg, msgStr } = i18n;
    const { url } = kcContext;

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={false}
            headerNode={msg("termsTitle")}
        >
            <div className="space-y-4">
                <div
                    id="kc-terms-text"
                    className="rounded-md border p-4 text-sm text-muted-foreground max-h-64 overflow-y-auto"
                >
                    {msg("termsText")}
                </div>

                <Separator />

                <form action={url.loginAction} method="POST">
                    <div className="flex gap-3">
                        <Button type="submit" name="accept" id="kc-accept" className="flex-1">
                            {msgStr("doAccept")}
                        </Button>
                        <Button type="submit" name="cancel" id="kc-decline" variant="outline" className="flex-1">
                            {msgStr("doDecline")}
                        </Button>
                    </div>
                </form>
            </div>
        </Template>
    );
}
