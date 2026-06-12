"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { CreateCategoryForm } from "./create-category-form";

export function CreateCategoryDialog({
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
        <Plus className="size-4" />
        Добавить
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Новая категория">
        <CreateCategoryForm onSuccess={handleSuccess} />
      </Modal>
    </>
  );
}
