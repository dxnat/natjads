import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { useState } from "react";
import { Form } from "react-aria-components";
import { Input } from "./Input";
import { Button } from "../Button/Button";

const meta = {
  title: "Components/Input",
  component: Input,
  args: {
    label: "Email",
    placeholder: "you@example.com",
    description: "We'll only use this to send receipts.",
    onChange: fn(),
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    errorMessage: { control: "text" },
    type: { control: "select", options: ["text", "email", "password", "search", "tel", "url"] },
  },
  decorators: [(Story) => <div style={{ maxWidth: 360 }}><Story /></div>],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithDescription: Story = {
  args: { label: "Username", placeholder: undefined, description: "3–20 characters, letters and numbers only." },
};

export const Invalid: Story = {
  args: { label: "Email", defaultValue: "nat@", isInvalid: true, description: undefined, errorMessage: "Enter a full email address, like name@example.com." },
};

export const Disabled: Story = {
  args: { label: "Workspace", defaultValue: "natjads", isDisabled: true, description: undefined },
};

export const Required: Story = {
  args: { label: "Full name", isRequired: true, placeholder: undefined, description: "Required." },
};

/** Native validation runs on submit; React Aria shows the browser message in `FieldError`. */
export const FormValidation: Story = {
  render: function Render() {
    const [submitted, setSubmitted] = useState<string | null>(null);
    return (
      <Form
        style={{ display: "grid", gap: 16 }}
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(new FormData(e.currentTarget).get("email") as string);
        }}
      >
        <Input name="email" type="email" label="Email" isRequired placeholder="you@example.com" />
        <div>
          <Button type="submit">Subscribe</Button>
        </div>
        {submitted && <p style={{ margin: 0 }}>Subscribed {submitted}</p>}
      </Form>
    );
  },
};

export const Controlled: Story = {
  render: function Render() {
    const [value, setValue] = useState("");
    return (
      <Input
        label="Project name"
        value={value}
        onChange={setValue}
        description={`${value.length}/40 characters`}
        maxLength={40}
      />
    );
  },
};
