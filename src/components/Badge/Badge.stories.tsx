import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  args: { children: "Active", variant: "success" },
  argTypes: {
    variant: { control: "inline-radio", options: ["neutral", "success", "warning", "danger", "info"] },
    children: { control: "text" },
    icon: { control: false },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Badge variant="neutral">Draft</Badge>
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="danger">Failed</Badge>
      <Badge variant="info">New</Badge>
    </div>
  ),
};

const Dot = () => (
  <svg viewBox="0 0 8 8" aria-hidden="true">
    <circle cx="4" cy="4" r="3" fill="currentColor" />
  </svg>
);

export const WithIcon: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Badge variant="success" icon={<Dot />}>Online</Badge>
      <Badge variant="warning" icon={<Dot />}>Degraded</Badge>
      <Badge variant="danger" icon={<Dot />}>Offline</Badge>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <p style={{ margin: 0 }}>
      Deploy #482 <Badge variant="success">Passed</Badge> · Deploy #481 <Badge variant="danger">Failed</Badge>
    </p>
  ),
};
