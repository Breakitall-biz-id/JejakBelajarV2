"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateAccount } from "../../../actions";

const updateAccountForm = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
});

type UpdateAccountValues = z.infer<typeof updateAccountForm>;

export function EditAccountDialog({
  open,
  setOpen,
  account,
  role,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  account: { id: string; name: string | null; email: string } | null;
  role: "TEACHER" | "STUDENT";
}) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<UpdateAccountValues>({
    resolver: zodResolver(updateAccountForm),
    defaultValues: {
      name: account?.name ?? "",
    },
    values: account ? { name: account.name ?? "" } : undefined,
  });

  const submit = (values: UpdateAccountValues) => {
    if (!account) return;
    startTransition(async () => {
      const result = await updateAccount({
        userId: account.id,
        name: values.name,
        role,
      });
      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof UpdateAccountValues, {
              message: messages?.[0],
            });
          }
        }
        toast.error(result.error);
        return;
      }
      toast.success("Account updated.");
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-md">
        <div className="bg-card">
          <div className="px-6 pt-6 pb-2 border-b border-muted/60">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold tracking-tight mb-1">Edit akun</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">{account?.email}</DialogDescription>
            </DialogHeader>
          </div>
          <div className="px-6 py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(submit)} className="space-y-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Nama lengkap</FormLabel>
                      <FormControl>
                        <Input {...field} className="w-full text-base px-3 py-2 rounded-md border-[1px] border-border focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60 transition-all duration-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="ghost" className="text-muted-foreground hover:bg-muted/60" onClick={() => setOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 transition-colors">
                    {isPending ? "Menyimpan…" : "Simpan"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
