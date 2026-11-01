import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Dialog, DialogTrigger } from "./Dialog";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  args: {
    title: "Publish changes?",
    children: "Your changes will be visible to everyone in the workspace.",
    role: "dialog",
    isDismissable: true,
  },
  argTypes: {
    title: { control: "text" },
    children: { control: "text" },
    role: { control: "inline-radio", options: ["dialog", "alertdialog"] },
    actions: { control: false },
  },
  render: (args) => (
    <DialogTrigger>
      <Button>Open dialog</Button>
      <Dialog
        {...args}
        actions={({ close }) => (
          <>
            <Button variant="secondary" onPress={close}>Cancel</Button>
            <Button onPress={close}>Publish</Button>
          </>
        )}
      />
    </DialogTrigger>
  ),
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Destructive: Story = {
  args: {
    title: "Delete project?",
    role: "alertdialog",
    children: "This permanently deletes “Website redesign” and its 24 files. You can't undo this.",
  },
  render: (args) => (
    <DialogTrigger>
      <Button variant="danger">Delete project</Button>
      <Dialog
        {...args}
        actions={({ close }) => (
          <>
            <Button variant="secondary" onPress={close} autoFocus>Cancel</Button>
            <Button variant="danger" onPress={close}>Delete</Button>
          </>
        )}
      />
    </DialogTrigger>
  ),
};

export const WithForm: Story = {
  args: { title: "Invite a teammate", children: undefined },
  render: (args) => (
    <DialogTrigger>
      <Button variant="secondary">Invite</Button>
      <Dialog
        {...args}
        actions={({ close }) => (
          <>
            <Button variant="secondary" onPress={close}>Cancel</Button>
            <Button onPress={close}>Send invite</Button>
          </>
        )}
      >
        <div style={{ display: "grid", gap: 16 }}>
          <Input label="Email" type="email" placeholder="teammate@example.com" autoFocus />
          <Input label="Message" description="Optional." />
        </div>
      </Dialog>
    </DialogTrigger>
  ),
};

export const Controlled: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onPress={() => setOpen(true)}>Open controlled dialog</Button>
        <p style={{ margin: "12px 0 0" }}>Dialog is {open ? "open" : "closed"}.</p>
        <Dialog
          {...args}
          isOpen={open}
          onOpenChange={setOpen}
          actions={<Button onPress={() => setOpen(false)}>Done</Button>}
        />
      </>
    );
  },
};
