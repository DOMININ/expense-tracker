"use client";

import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { CreateTransactionForm } from "./create-transaction-form";

export function CreateTransactionDialog({
  onCreated,
  renderTrigger,
}: {
  onCreated?: () => void;
  /** Custom trigger; receives an `open` callback. Defaults to a small button. */
  renderTrigger?: (open: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onCreated?.();
  };

  return (
    <>
      {renderTrigger ? (
        renderTrigger(() => setOpen(true))
      ) : (
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Добавить
        </Button>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Новая транзакция"
      >
        <CreateTransactionForm onSuccess={handleSuccess} />
      </Modal>
    </>
  );
}
