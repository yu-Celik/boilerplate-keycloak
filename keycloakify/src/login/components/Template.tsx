import { clsx } from "keycloakify/tools/clsx";
import type { TemplateProps } from "keycloakify/login/TemplateProps";
import { useInitialize } from "keycloakify/login/Template.useInitialize";
import type { I18n } from "../i18n";
import type { KcContext } from "../KcContext";
import Footer from "./Footer";
import "../../shared/theme.css";

export default function Template(props: TemplateProps<KcContext, I18n>) {
    const {
        displayInfo = false,
        displayMessage = true,
        displayRequiredFields = false,
        headerNode,
        socialProvidersNode = null,
        infoNode = null,
        documentTitle,
        bodyClassName,
        kcContext,
        i18n,
        doUseDefaultCss,
        classes,
        children
    } = props;

    const { msgStr, currentLanguage, enabledLanguages } = i18n;
    const { realm, locale, auth, url, message, isAppInitiatedAction } = kcContext;

    const { isReadyToRender } = useInitialize({ kcContext, doUseDefaultCss });

    if (!isReadyToRender) {
        return null;
    }

    return (
        <div className={clsx("login-pf-page", bodyClassName)}>
            <div id="kc-header" className="login-pf-page-header">
                <div
                    id="kc-header-wrapper"
                    className={clsx(classes?.kcHeaderWrapperClass)}
                >
                    {realm.displayNameHtml ? (
                        <div
                            dangerouslySetInnerHTML={{
                                __html: realm.displayNameHtml
                            }}
                        />
                    ) : (
                        <span>{realm.displayName ?? realm.name}</span>
                    )}
                </div>
            </div>

            <div className="card-pf" id="kc-content">
                {/* Language switcher */}
                {enabledLanguages.length > 1 && (
                    <div id="kc-locale">
                        <div id="kc-locale-wrapper">
                            <div id="kc-locale-dropdown">
                                <span>{currentLanguage.label}</span>
                                <ul>
                                    {enabledLanguages.map(({ languageTag, label, href }) => (
                                        <li key={languageTag}>
                                            <a href={href}>{label}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Page header */}
                <header className={clsx(classes?.kcFormHeaderClass)}>
                    {(realm.internationalizationEnabled || displayRequiredFields) && (
                        <div className={clsx(classes?.kcContentWrapperClass)}>
                            {displayRequiredFields && (
                                <div className={clsx(classes?.kcLabelWrapperClass)}>
                                    <span className="subtitle">
                                        <span className="required">*</span>
                                        {msgStr("requiredFields")}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                    <h1 id="kc-page-title">{headerNode}</h1>
                </header>

                {/* Flash messages */}
                {displayMessage &&
                    message !== undefined &&
                    (message.type !== "warning" || !isAppInitiatedAction) && (
                        <div
                            className={clsx(
                                "alert",
                                `alert-${message.type}`,
                                classes?.kcAlertClass,
                                `pf-m-${message?.type === "error" ? "danger" : message?.type}`
                            )}
                        >
                            <div className="pf-c-alert__icon">
                                {message.type === "success" && (
                                    <span className="pficon pficon-ok" />
                                )}
                                {message.type === "warning" && (
                                    <span className="pficon pficon-warning-triangle-o" />
                                )}
                                {message.type === "error" && (
                                    <span className="pficon pficon-error-circle-o" />
                                )}
                                {message.type === "info" && (
                                    <span className="pficon pficon-info" />
                                )}
                            </div>
                            <span
                                className={clsx("kc-feedback-text", classes?.kcAlertTitleClass)}
                                dangerouslySetInnerHTML={{ __html: message.summary }}
                            />
                        </div>
                    )}

                {/* Page content */}
                <div id="kc-form">{children}</div>

                {/* Social providers */}
                {socialProvidersNode}

                {/* Info block (e.g. "Back to login" link) */}
                {displayInfo && (
                    <div id="kc-info" className={clsx(classes?.kcSignUpClass)}>
                        <div id="kc-info-wrapper">{infoNode}</div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
