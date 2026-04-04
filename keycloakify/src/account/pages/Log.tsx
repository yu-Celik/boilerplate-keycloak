import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "keycloakify/account/KcContext";
import type { I18n } from "keycloakify/account/i18n";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

type KcContextLog = Extract<KcContext, { pageId: "log.ftl" }>;

export default function Log(props: PageProps<KcContextLog, I18n>) {
    const { kcContext, i18n, Template } = props;
    const { log } = kcContext;
    const { msg } = i18n;

    return (
        <Template {...props} active="log">
            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-foreground tracking-tight">
                        {msg("accountLogHtmlTitle")}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Recent activity on your account.
                    </p>
                </div>

                <div className="glass-card overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/40 hover:bg-transparent">
                                <TableHead className="text-muted-foreground font-medium">{msg("date")}</TableHead>
                                <TableHead className="text-muted-foreground font-medium">{msg("event")}</TableHead>
                                <TableHead className="text-muted-foreground font-medium">{msg("ip")}</TableHead>
                                <TableHead className="text-muted-foreground font-medium">{msg("client")}</TableHead>
                                <TableHead className="text-muted-foreground font-medium">{msg("details")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {log.events.map((event, index) => (
                                <TableRow key={index} className="border-border/30 hover:bg-accent/20 align-top">
                                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                        {event.date ? new Date(event.date).toLocaleString() : ""}
                                    </TableCell>
                                    <TableCell className="text-sm font-medium text-foreground">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary/10 text-primary border border-primary/20">
                                            {event.event}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-xs font-mono text-muted-foreground">
                                        {event.ipAddress}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {event.client || "—"}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {event.details.length > 0 ? (
                                            <div className="space-y-0.5">
                                                {event.details.map((detail, i) => (
                                                    <div key={i} className="flex gap-1">
                                                        <span className="text-foreground/60">{detail.key}</span>
                                                        <span>=</span>
                                                        <span>{detail.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span>—</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {log.events.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        No activity recorded.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </Template>
    );
}
