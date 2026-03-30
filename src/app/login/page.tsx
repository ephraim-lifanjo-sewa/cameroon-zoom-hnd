/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight } from "lucide-react";

// Zod schema pour validation
const loginSchema = z.object({
  email: z.string().email("Use a valid email"),
  password: z.string().min(6, "Password must be at least 6 chars"),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: "Welcome Back!" });
      router.push("/");
    } catch (err: any) {
      toast({ title: "Login Failed", description: err.message, variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 font-body">
      {/* Mobile Header */}
      <h1 className="text-3xl font-black uppercase text-secondary mb-8">Go In</h1>

      {/* Form Container */}
      <div className="w-full max-w-sm bg-white shadow-lg rounded-xl p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-gray-500">Email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="me@example.com" className="h-12 rounded-xl border border-gray-300 font-bold" />
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
                  <FormLabel className="text-xs font-bold uppercase text-gray-500">Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="••••••••" className="h-12 rounded-xl border border-gray-300 font-bold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-primary text-white font-bold uppercase text-sm rounded-xl flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <><ArrowRight className="w-5 h-5" /> Let's Go</>}
            </Button>
          </form>
        </Form>

        <p className="text-center text-xs mt-4 text-gray-500">
          New here? <Link href="/signup" className="text-primary font-bold underline">Join Us</Link>
        </p>
      </div>

    </div>
  );
}