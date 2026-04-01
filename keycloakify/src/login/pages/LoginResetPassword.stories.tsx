import type { Meta, StoryObj } from "@storybook/react";
import { createPageStory } from "../PageStory";

const { PageStory } = createPageStory({ pageId: "login-reset-password.ftl" });

const meta: Meta<typeof PageStory> = {
    title: "login/LoginResetPassword",
    component: PageStory
};

export default meta;

export const Default: StoryObj<typeof PageStory> = {
    render: () => <PageStory />
};
