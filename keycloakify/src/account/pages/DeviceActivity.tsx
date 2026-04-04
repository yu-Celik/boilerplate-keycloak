import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "keycloakify/account/KcContext";
import type { I18n } from "keycloakify/account/i18n";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

type KcContextSessions = Extract<KcContext, { pageId: "sessions.ftl" }>;

export default function DeviceActivity(props: PageProps<KcContextSessions, I18n>) {
    const { kcContext, i18n, Template } = props;
    const { url, stateChecker, sessions } = kcContext;
    const { msg } = i18n;

    return (
        <Template {...props} active="sessions">
            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-foreground tracking-tight">
                        {msg("sessionsHtmlTitle")}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Active sessions across all devices.
                    </p>
                </div>

                <div className="glass-card overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/40 hover:bg-transparent">
                                <TableHead className="text-muted-foreground font-medium">{msg("ip")}</TableHead>
                                <TableHead className="text-muted-foreground font-medium">{msg("started")}</TableHead>
                                <TableHead className="text-muted-foreground font-medium">{msg("lastAccess")}</TableHead>
                                <TableHead className="text-muted-foreground font-medium">{msg("expires")}</TableHead>
                                <TableHead className="text-muted-foreground font-medium">{msg("clients")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sessions.sessions.map((session, index) => (
                                <TableRow key={index} className="border-border/30 hover:bg-accent/20">
                                    <TableCell className="font-mono text-xs text-foreground">
                                        {session.ipAddress}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {session.started}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {session.lastAccess}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {session.expires}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {session.clients.map((client, i) => (
                                            <span key={i} className="block leading-relaxed">{client}</span>
                                        ))}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {sessions.sessions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        No active sessions.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <form action={url.sessionsUrl} method="post">
                    <input type="hidden" id="stateChecker" name="stateChecker" value={stateChecker} />
                    <Button
                        id="logout-all-sessions"
                        type="submit"
                        variant="destructive"
                        className="gap-2"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <path d="M5 2H2.5A.5.5 0 0 0 2 2.5v9a.5.5 0 0 0 .5.5H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                            <path d="M9 4l3 3-3 3M12 7H5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {msg("doLogOutAllSessions")}
                    </Button>
                </form>
            </div>
        </Template>
    );
}
