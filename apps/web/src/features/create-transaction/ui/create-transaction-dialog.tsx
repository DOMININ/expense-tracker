"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { CreateTransactionForm } from "./create-transaction-form";

export function CreateTransactionDialog({
  onCreated,
}: {
  onCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onCreated?.();
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Добавить
      </Button>

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
