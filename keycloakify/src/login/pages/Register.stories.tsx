import type { Meta, StoryObj } from "@storybook/react";
import { createPageStory } from "../PageStory";

const { PageStory } = createPageStory({ pageId: "register.ftl" });

const meta: Meta<typeof PageStory> = {
    title: "login/Register",
    component: PageStory
};

export default meta;

export const Default: StoryObj<typeof PageStory> = {
    render: () => <PageStory />
};
