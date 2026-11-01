import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./Card";
import { Button } from "../Button/Button";
import { Badge } from "../Badge/Badge";

const meta = {
  title: "Components/Card",
  component: Card,
  args: {
    title: "Monthly report",
    children: "Revenue grew 12% compared with last month. Open the report to see the breakdown by region.",
  },
  argTypes: {
    title: { control: "text" },
    children: { control: "text" },
    headingLevel: { control: "inline-radio", options: [2, 3, 4, 5, 6] },
    footer: { control: false },
  },
  decorators: [(Story) => <div style={{ maxWidth: 400 }}><Story /></div>],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithActions: Story = {
  args: {
    footer: (
      <>
        <Button size="sm">Open report</Button>
        <Button size="sm" variant="secondary">Share</Button>
      </>
    ),
  },
};

export const RichContent: Story = {
  args: {
    title: "Design system v1",
    children: (
      <>
        <p style={{ marginBottom: 12 }}>
          <Badge variant="success">Shipped</Badge>
        </p>
        <p>Six components built on React Aria, styled with component tokens from Figma.</p>
      </>
    ),
  },
};

export const Grid: Story = {
  decorators: [(Story) => <div style={{ maxWidth: "none" }}><Story /></div>],
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
      {["Starter", "Team", "Enterprise"].map((plan, i) => (
        <Card key={plan} title={plan} footer={<Button size="sm" variant={i === 1 ? "primary" : "secondary"}>Choose {plan}</Button>}>
          {["For side projects.", "For growing teams.", "For large organisations."][i]}
        </Card>
      ))}
    </div>
  ),
};
