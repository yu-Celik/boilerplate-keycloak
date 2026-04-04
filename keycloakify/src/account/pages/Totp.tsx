import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "keycloakify/account/KcContext";
import type { I18n } from "keycloakify/account/i18n";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type KcContextTotp = Extract<KcContext, { pageId: "totp.ftl" }>;

export default function Totp(props: PageProps<KcContextTotp, I18n>) {
    const { kcContext, i18n, Template } = props;
    const { totp, mode, url, messagesPerField, stateChecker } = kcContext;
    const { msg, msgStr, advancedMsg } = i18n;

    return (
        <Template {...props} active="totp">
            <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground tracking-tight">
                            {msg("authenticatorTitle")}
                        </h2>
                        {totp.otpCredentials.length === 0 && (
                            <p className="text-sm text-muted-foreground mt-1">
                                <span className="text-destructive mr-0.5">*</span>
                                {msg("requiredFields")}
                            </p>
                        )}
                    </div>
                </div>

                {/* Existing TOTP credentials */}
                {totp.enabled && totp.otpCredentials.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-foreground">{msg("configureAuthenticators")}</p>
                        <div className="glass-card divide-y divide-border/30 overflow-hidden">
                            {totp.otpCredentials.map((credential, index) => (
                                <div key={index} className="flex items-center gap-4 px-4 py-3">
                                    <div className="w-8 h-8 rounded-md bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                            <rect x="3" y="1" width="8" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                                            <path d="M5 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">{msg("mobile")}</p>
                                        {credential.userLabel && (
                                            <p className="text-xs text-muted-foreground">{credential.userLabel}</p>
                                        )}
                                        {totp.otpCredentials.length > 1 && (
                                            <p className="text-xs text-muted-foreground font-mono">{credential.id}</p>
                                        )}
                                    </div>
                                    <form action={url.totpUrl} method="post">
                                        <input type="hidden" id="stateChecker" name="stateChecker" value={stateChecker} />
                                        <input type="hidden" name="submitAction" value="Delete" />
                                        <input type="hidden" name="credentialId" value={credential.id} />
                                        <Button
                                            id={`remove-mobile-${index}`}
                                            type="submit"
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                                                <path d="M2 3.5h9M5 3.5V2h3v1.5M4 3.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </Button>
                                    </form>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Setup new TOTP */}
                {!totp.enabled && (
                    <div className="space-y-6">
                        <div className="glass-card px-5 py-5 space-y-5">
                            <ol className="space-y-5 list-none">
                                {/* Step 1 */}
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                                        1
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm text-foreground">{msg("totpStep1")}</p>
                                        {totp.supportedApplications && totp.supportedApplications.length > 0 && (
                                            <ul className="flex flex-wrap gap-1.5">
                                                {totp.supportedApplications.map(app => (
                                                    <li key={app}>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-accent/50 border border-border/50 text-muted-foreground">
                                                            {advancedMsg(app)}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </li>

                                {/* Step 2 */}
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                                        2
                                    </div>
                                    <div className="space-y-3">
                                        {mode === "manual" ? (
                                            <>
                                                <p className="text-sm text-foreground">{msg("totpManualStep2")}</p>
                                                <div className="glass rounded-md px-4 py-3 font-mono text-sm text-foreground tracking-widest break-all">
                                                    {totp.totpSecretEncoded}
                                                </div>
                                                <a
                                                    href={totp.qrUrl}
                                                    id="mode-barcode"
                                                    className="text-xs text-primary hover:underline underline-offset-2"
                                                >
                                                    {msg("totpScanBarcode")}
                                                </a>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-sm text-foreground">{msg("totpStep2")}</p>
                                                <div className="inline-block glass rounded-lg p-2">
                                                    <img
                                                        id="kc-totp-secret-qr-code"
                                                        src={`data:image/png;base64, ${totp.totpSecretQrCode}`}
                                                        alt="QR code for authenticator app"
                                                        className="w-40 h-40"
                                                    />
                                                </div>
                                                <div>
                                                    <a
                                                        href={totp.manualUrl}
                                                        id="mode-manual"
                                                        className="text-xs text-primary hover:underline underline-offset-2"
                                                    >
                                                        {msg("totpUnableToScan")}
                                                    </a>
                                                </div>
                                            </>
                                        )}

                                        {mode === "manual" && (
                                            <div className="space-y-1.5 mt-2">
                                                <p className="text-sm font-medium text-foreground">{msg("totpManualStep3")}</p>
                                                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                                    <dt className="text-muted-foreground">{msg("totpType")}</dt>
                                                    <dd className="text-foreground">{msg(`totp.${totp.policy.type}` as any)}</dd>
                                                    <dt className="text-muted-foreground">{msg("totpAlgorithm")}</dt>
                                                    <dd className="text-foreground">{totp.policy.getAlgorithmKey()}</dd>
                                                    <dt className="text-muted-foreground">{msg("totpDigits")}</dt>
                                                    <dd className="text-foreground">{totp.policy.digits}</dd>
                                                    {totp.policy.type === "totp" ? (
                                                        <>
                                                            <dt className="text-muted-foreground">{msg("totpInterval")}</dt>
                                                            <dd className="text-foreground">{totp.policy.period}</dd>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <dt className="text-muted-foreground">{msg("totpCounter")}</dt>
                                                            <dd className="text-foreground">{totp.policy.initialCounter}</dd>
                                                        </>
                                                    )}
                                                </dl>
                                            </div>
                                        )}
                                    </div>
                                </li>

                                {/* Step 3 */}
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                                        3
                                    </div>
                                    <div>
                                        <p className="text-sm text-foreground">{msg("totpStep3")}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{msg("totpStep3DeviceName")}</p>
                                    </div>
                                </li>
                            </ol>
                        </div>

                        {/* Registration form */}
                        <form action={url.totpUrl} id="kc-totp-settings-form" method="post" className="space-y-4">
                            <input type="hidden" id="stateChecker" name="stateChecker" value={stateChecker} />
                            <input type="hidden" id="totpSecret" name="totpSecret" value={totp.totpSecret} />
                            {mode && <input type="hidden" id="mode" value={mode} />}

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="totp"
                                    className={cn("text-sm font-medium", messagesPerField.existsError("totp") && "text-destructive")}
                                >
                                    {msg("authenticatorCode")}
                                    <span className="text-destructive ml-0.5">*</span>
                                </Label>
                                <Input
                                    type="text"
                                    id="totp"
                                    name="totp"
                                    autoComplete="off"
                                    className={cn("glass font-mono", messagesPerField.existsError("totp") && "border-destructive/60")}
                                    aria-invalid={messagesPerField.existsError("totp")}
                                />
                                {messagesPerField.existsError("totp") && (
                                    <p
                                        id="input-error-otp-code"
                                        className="text-xs text-destructive"
                                        aria-live="polite"
                                        dangerouslySetInnerHTML={{ __html: kcSanitize(messagesPerField.get("totp")) }}
                                    />
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="userLabel"
                                    className={cn("text-sm font-medium", messagesPerField.existsError("userLabel") && "text-destructive")}
                                >
                                    {msg("totpDeviceName")}
                                    {totp.otpCredentials.length >= 1 && (
                                        <span className="text-destructive ml-0.5">*</span>
                                    )}
                                </Label>
                                <Input
                                    type="text"
                                    id="userLabel"
                                    name="userLabel"
                                    autoComplete="off"
                                    className={cn("glass", messagesPerField.existsError("userLabel") && "border-destructive/60")}
                                    aria-invalid={messagesPerField.existsError("userLabel")}
                                />
                                {messagesPerField.existsError("userLabel") && (
                                    <p
                                        id="input-error-otp-label"
                                        className="text-xs text-destructive"
                                        aria-live="polite"
                                        dangerouslySetInnerHTML={{ __html: kcSanitize(messagesPerField.get("userLabel")) }}
                                    />
                                )}
                            </div>

                            <div className="flex gap-3 pt-1">
                                <Button
                                    type="submit"
                                    id="saveTOTPBtn"
                                    name="submitAction"
                                    value="Save"
                                >
                                    {msgStr("doSave")}
                                </Button>
                                <Button
                                    type="submit"
                                    id="cancelTOTPBtn"
                                    name="submitAction"
                                    value="Cancel"
                                    variant="outline"
                                >
                                    {msg("doCancel")}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </Template>
    );
}
