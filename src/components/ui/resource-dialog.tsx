"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { resourceSchemas, type ResourceSchemaKey } from "@/components/ui/resource-schema";
import type { ActionResult } from "@/lib/action-result";

export interface DialogField {
  name: string;
  label: string;
  type?:
    | "text"
    | "number"
    | "email"
    | "textarea"
    | "select"
    | "checkbox";
  placeholder?: string;
  options?: { value: string; label: string }[];
  hint?: string;
  span?: 1 | 2;
  step?: string;
  min?: string;
}

/**
 * Small config-driven create/edit dialog shared by the master data screens.
 * Validation is duplicated on the server inside each action.
 */
export function ResourceDialog({
  triggerLabel,
  title,
  description,
  submitLabel = "Save",
  fields,
  schema,
  defaultValues,
  action,
  variant = "primary",
}: {
  triggerLabel: string;
  title: string;
  description?: string;
  submitLabel?: string;
  fields: DialogField[];
  schema: ResourceSchemaKey;
  defaultValues: Record<string, unknown>;
  action: (values: Record<string, unknown>) => Promise<ActionResult<unknown>>;
  variant?: "primary" | "outline" | "ghost";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function openDialog() {
    setValues(defaultValues);
    setErrors({});
    setError(null);
    setOpen(true);
  }

  function update(name: string, value: unknown) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = resourceSchemas[schema].safeParse(values);

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};

      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }

      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setPending(true);

    try {
      const result = await action(parsed.data as Record<string, unknown>);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button variant={variant} onClick={openDialog}>
        {triggerLabel}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        description={description}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field) => {
              const value = values[field.name];
              const inputId = `${title}-${field.name}`;

              if (field.type === "checkbox") {
                return (
                  <label
                    key={field.name}
                    className="flex items-center gap-2 pt-6 text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={Boolean(value)}
                      onChange={(event) =>
                        update(field.name, event.target.checked)
                      }
                    />
                    {field.label}
                  </label>
                );
              }

              return (
                <Field
                  key={field.name}
                  label={field.label}
                  htmlFor={inputId}
                  error={errors[field.name]}
                  hint={field.hint}
                  className={field.span === 2 ? "sm:col-span-2" : undefined}
                >
                  {field.type === "textarea" ? (
                    <Textarea
                      id={inputId}
                      rows={2}
                      placeholder={field.placeholder}
                      value={String(value ?? "")}
                      onChange={(event) =>
                        update(field.name, event.target.value)
                      }
                    />
                  ) : field.type === "select" ? (
                    <Select
                      id={inputId}
                      value={String(value ?? "")}
                      onChange={(event) =>
                        update(field.name, event.target.value)
                      }
                    >
                      <option value="">—</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      id={inputId}
                      type={field.type ?? "text"}
                      step={field.step}
                      min={field.min}
                      placeholder={field.placeholder}
                      value={String(value ?? "")}
                      onChange={(event) =>
                        update(field.name, event.target.value)
                      }
                    />
                  )}
                </Field>
              );
            })}
          </div>

          {error ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
