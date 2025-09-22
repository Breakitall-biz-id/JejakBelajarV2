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
import { createAccount } from "../../../actions";

const createAccountForm = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  email: z.string().trim().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type CreateAccountValues = z.infer<typeof createAccountForm>;

export function CreateAccountDialog({
  open,
  setOpen,
  role,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  role: "TEACHER" | "STUDENT";
}) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<CreateAccountValues>({
    resolver: zodResolver(createAccountForm),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const submit = (values: CreateAccountValues) => {
    startTransition(async () => {
      const result = await createAccount({ ...values, role });
      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof CreateAccountValues, {
              message: messages?.[0],
            });
          }
        }
        toast.error(result.error);
        return;
      }
      toast.success(`${role === "TEACHER" ? "Teacher" : "Student"} account created.`);
      form.reset();
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-md">
        <div className="bg-card">
          <div className="px-6 pt-6 pb-2 border-b border-muted/60">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold tracking-tight mb-1">
                Buat akun {role === "TEACHER" ? "guru" : "siswa"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Masukkan data awal. Bagikan password sementara kepada pengguna untuk login pertama.
              </DialogDescription>
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
                        <Input placeholder="Jane Doe" {...field} className="w-full text-base px-3 py-2 rounded-md border-[1px] border-border focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60 transition-all duration-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="nama@example.com" {...field} className="w-full text-base px-3 py-2 rounded-md border-[1px] border-border focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60 transition-all duration-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Password sementara</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Minimal 8 karakter" {...field} className="w-full text-base px-3 py-2 rounded-md border-[1px] border-border focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60 transition-all duration-200" />
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
                    {isPending ? "Menyimpan…" : "Buat"}
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
