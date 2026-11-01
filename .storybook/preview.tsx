import { useEffect } from "react";
import type { Preview } from "@storybook/react-vite";
import "../src/styles.css";
import "./preview.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Semantic token mode",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme ?? "light";
      // Set on <html> too so portalled overlays (dialog, tooltip) pick up the theme.
      useEffect(() => {
        document.documentElement.dataset.theme = theme;
      }, [theme]);
      return (
        <div data-theme={theme} className="sb-story-surface">
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    layout: "padded",
    controls: { expanded: true, sort: "requiredFirst" },
    options: {
      storySort: {
        order: ["Introduction", "Getting started", "Foundations", "Components", "Contracts"],
      },
    },
    a11y: { test: "todo" },
  },
};

export default preview;
