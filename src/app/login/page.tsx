/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { auth } from "../../firebase"; // Firebase config existant
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

// 🔹 Schema Zod pour validation du formulaire
const loginSchema = z.object({
  email: z.string().email("Please use a real email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // 🔥 Fonction login Firebase Auth
  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: "Welcome Back!" });
      router.push("/"); // redirect home
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-body">
      <Navbar />

      <div className="container mx-auto px-4 py-12 lg:py-24 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

          {/* LOGIN FORM */}
          <main className="space-y-10 max-w-md mx-auto lg:mx-0 w-full animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="space-y-4">
              <h1 className="text-3xl font-black uppercase tracking-tight text-secondary leading-none">Login</h1>
              <p className="text-sm font-medium text-muted-foreground">Access your account or join our community.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-70">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="me@example.com" {...field} className="h-12 border border-[#E5E5E1] font-bold rounded-xl" />
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
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-70">Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="h-12 border border-[#E5E5E1] font-bold rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-primary text-white font-black uppercase text-xs rounded-xl shadow-lg transition-all active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <><ArrowRight className="w-5 h-5 mr-2" /> Let's Go</>}
                </Button>
              </form>
            </Form>

            <div className="pt-6 border-t border-[#E5E5E1] text-center lg:text-left">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                New here? <Link href="/signup" className="text-primary underline ml-1 hover:text-black transition-colors">Join Us</Link>
              </p>
            </div>
          </main>

          {/* ILLUSTRATION YELP-STYLE */}
          <aside className="hidden lg:flex items-center justify-center p-16 bg-muted/10 rounded-3xl border border-[#E5E5E1] border-dashed animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="space-y-10 text-center max-w-sm">
              <div className="relative aspect-square w-full">
                <img
                  src="https://s3-media0.fl.yelpcdn.com/assets/2/www/img/7922e77f338d/signup/signup_illustration.png"
                  alt="Welcome Illustration"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-secondary">Discover Top Businesses</h3>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                  Explore Cameroon's biggest business directory, even without an account.
                </p>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}