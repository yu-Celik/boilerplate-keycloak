import type { Meta, StoryObj } from "@storybook/react";
import { createPageStory } from "../PageStory";

const { PageStory } = createPageStory({ pageId: "login.ftl" });

const meta: Meta<typeof PageStory> = {
    title: "login/Login",
    component: PageStory
};

export default meta;

export const Default: StoryObj<typeof PageStory> = {
    render: () => <PageStory />
};

export const WithUsernameError: StoryObj<typeof PageStory> = {
    render: () => (
        <PageStory
            kcContext={{
                message: {
                    type: "error",
                    summary: "Invalid username or password."
                }
            }}
        />
    )
};
