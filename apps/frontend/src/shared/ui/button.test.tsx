import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button, buttonVariants } from "@/shared/ui/button";

describe("Button", () => {
  it("renders a native button with its children", () => {
    render(<Button>Сохранить</Button>);

    const button = screen.getByRole("button", { name: "Сохранить" });
    expect(button.tagName).toBe("BUTTON");
  });

  it("applies the default variant and size classes", () => {
    render(<Button>Default</Button>);

    const button = screen.getByRole("button", { name: "Default" });
    expect(button).toHaveClass("bg-primary", "h-10");
  });

  it("merges a custom className with the variant classes", () => {
    render(<Button className="custom-class">Styled</Button>);

    const button = screen.getByRole("button", { name: "Styled" });
    expect(button).toHaveClass("custom-class", "bg-primary");
  });

  it("forwards arbitrary button props such as type and disabled", () => {
    render(
      <Button type="submit" disabled>
        Submit
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Submit" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toBeDisabled();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click</Button>);

    await user.click(screen.getByRole("button", { name: "Click" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(
      <Button onClick={onClick} disabled>
        Disabled
      </Button>,
    );

    await user.click(screen.getByRole("button", { name: "Disabled" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("forwards the ref to the underlying button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref</Button>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("renders the child element instead of a button when asChild is set", () => {
    render(
      <Button asChild>
        <a href="/home">Ссылка</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Ссылка" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/home");
    // the Slot forwards the variant classes onto the child
    expect(link).toHaveClass("bg-primary");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  describe("buttonVariants", () => {
    it("returns size- and variant-specific classes", () => {
      const classes = buttonVariants({ variant: "destructive", size: "lg" });
      expect(classes).toContain("bg-destructive");
      expect(classes).toContain("h-11");
    });

    it("falls back to the default variants when called with no args", () => {
      const classes = buttonVariants();
      expect(classes).toContain("bg-primary");
      expect(classes).toContain("h-10");
    });
  });
});
