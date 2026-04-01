import { useEffect } from "react";
import { getKcContextMock } from "./KcPageStory";
import KcPage from "./KcPage";
import type { KcContext } from "./KcContext";

// createPageStory wraps a specific login page with mock KC context for Storybook.
// Pass pageId to target the page, and optional overrides to customise the mock data.
export function createPageStory<
    PageId extends KcContext["pageId"]
>({ pageId }: { pageId: PageId }) {
    type OverridesOptional = {
        kcContext?: Partial<Extract<KcContext, { pageId: PageId }>>;
    };

    function PageStory({ kcContext: overrides = {} }: OverridesOptional) {
        const kcContext = getKcContextMock({
            pageId,
            overrides
        });

        useEffect(() => {
            // Expose on window so the dev server can pick it up too
            (window as any).kcContext = kcContext;
        }, [kcContext]);

        return (
            <KcPage kcContext={kcContext as KcContext} />
        );
    }

    return { PageStory };
}
