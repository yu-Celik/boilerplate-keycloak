import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "keycloakify/account/KcContext";
import type { I18n } from "keycloakify/account/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

type KcContextApplications = Extract<KcContext, { pageId: "applications.ftl" }>;

function isArrayWithEmptyObject(variable: unknown): boolean {
    return (
        Array.isArray(variable) &&
        variable.length === 1 &&
        typeof variable[0] === "object" &&
        Object.keys(variable[0] as object).length === 0
    );
}

export default function Applications(props: PageProps<KcContextApplications, I18n>) {
    const { kcContext, i18n, Template } = props;
    const { url, applications: { applications }, stateChecker } = kcContext;
    const { msg, advancedMsg } = i18n;

    return (
        <Template {...props} active="applications">
            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-foreground tracking-tight">
                        {msg("applicationsHtmlTitle")}
                    </h2>
                </div>

                <form action={url.applicationsUrl} method="post">
                    <input type="hidden" id="stateChecker" name="stateChecker" value={stateChecker} />
                    <input type="hidden" id="referrer" name="referrer" value={stateChecker} />

                    <div className="glass-card overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/40 hover:bg-transparent">
                                    <TableHead className="text-muted-foreground font-medium">{msg("application")}</TableHead>
                                    <TableHead className="text-muted-foreground font-medium">{msg("availableRoles")}</TableHead>
                                    <TableHead className="text-muted-foreground font-medium">{msg("grantedPermissions")}</TableHead>
                                    <TableHead className="text-muted-foreground font-medium">{msg("additionalGrants")}</TableHead>
                                    <TableHead className="text-muted-foreground font-medium">{msg("action")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.map(application => (
                                    <TableRow
                                        key={application.client.clientId}
                                        className="border-border/30 hover:bg-accent/20 align-top"
                                    >
                                        <TableCell className="font-medium text-foreground">
                                            {application.effectiveUrl ? (
                                                <a
                                                    href={application.effectiveUrl}
                                                    className="text-primary hover:underline underline-offset-2"
                                                >
                                                    {(application.client.name && advancedMsg(application.client.name)) ||
                                                        application.client.clientId}
                                                </a>
                                            ) : (
                                                <span>
                                                    {(application.client.name && advancedMsg(application.client.name)) ||
                                                        application.client.clientId}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            <div className="flex flex-wrap gap-1">
                                                {!isArrayWithEmptyObject(application.realmRolesAvailable) &&
                                                    application.realmRolesAvailable.map(role => (
                                                        <Badge
                                                            key={role.name}
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {role.description
                                                                ? advancedMsg(role.description)
                                                                : advancedMsg(role.name)}
                                                        </Badge>
                                                    ))}
                                                {application.resourceRolesAvailable &&
                                                    Object.keys(application.resourceRolesAvailable).map(resource =>
                                                        application.resourceRolesAvailable[resource].map(clientRole => (
                                                            <Badge
                                                                key={clientRole.roleName}
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {clientRole.roleDescription
                                                                    ? advancedMsg(clientRole.roleDescription)
                                                                    : advancedMsg(clientRole.roleName)}
                                                            </Badge>
                                                        ))
                                                    )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {application.client.consentRequired ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {application.clientScopesGranted.map(claim => (
                                                        <Badge key={claim} variant="secondary" className="text-xs">
                                                            {advancedMsg(claim)}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <Badge variant="default" className="text-xs bg-primary/20 text-primary border-primary/30">
                                                    {msg("fullAccess")}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            <div className="flex flex-wrap gap-1">
                                                {application.additionalGrants.map(grant => (
                                                    <Badge key={grant} variant="outline" className="text-xs">
                                                        {advancedMsg(grant)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {((application.client.consentRequired &&
                                                application.clientScopesGranted.length > 0) ||
                                                application.additionalGrants.length > 0) && (
                                                <Button
                                                    type="submit"
                                                    variant="destructive"
                                                    size="sm"
                                                    id={`revoke-${application.client.clientId}`}
                                                    name="clientId"
                                                    value={application.client.id}
                                                >
                                                    {msg("revoke")}
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {applications.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                            No applications connected.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </form>
            </div>
        </Template>
    );
}
