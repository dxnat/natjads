import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tooltip, TooltipTrigger } from "./Tooltip";
import { Button } from "../Button/Button";

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  args: { children: "Copy link to clipboard", placement: "top", showArrow: true },
  argTypes: {
    children: { control: "text" },
    placement: { control: "select", options: ["top", "bottom", "start", "end", "left", "right"] },
    offset: { control: { type: "number", min: 0, max: 24 } },
  },
  decorators: [(Story) => <div style={{ padding: "48px 0", display: "flex", justifyContent: "center" }}><Story /></div>],
  render: (args) => (
    <TooltipTrigger delay={300}>
      <Button variant="secondary">Copy link</Button>
      <Tooltip {...args} />
    </TooltipTrigger>
  ),
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Placements: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
      {(["top", "bottom", "left", "right"] as const).map((p) => (
        <TooltipTrigger key={p} delay={200}>
          <Button variant="secondary" size="sm">{p}</Button>
          <Tooltip {...args} placement={p}>Placed {p}</Tooltip>
        </TooltipTrigger>
      ))}
    </div>
  ),
};

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 10.5V4a1 1 0 0 1 1-1h6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** Icon-only buttons still need an `aria-label`; the tooltip is a visual hint, not the name. */
export const IconButton: Story = {
  render: (args) => (
    <TooltipTrigger delay={300}>
      <Button variant="secondary" aria-label="Copy link">
        <CopyIcon />
      </Button>
      <Tooltip {...args}>Copy link</Tooltip>
    </TooltipTrigger>
  ),
};

/** Shown open so the styling is visible in docs without hovering. */
export const AlwaysOpen: Story = {
  render: (args) => (
    <TooltipTrigger isOpen>
      <Button variant="secondary">Trigger</Button>
      <Tooltip {...args} />
    </TooltipTrigger>
  ),
};
