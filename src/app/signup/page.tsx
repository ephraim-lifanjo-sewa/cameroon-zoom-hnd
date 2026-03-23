"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import {
  useAuth,
  useFirestore,
  useUser,
  initiateEmailSignUp,
  useMemoFirebase,
  useDoc,
} from "@/firebase";

import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { doc } from "firebase/firestore";

const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name too short")
    .max(50)
    .refine((val) => /^[a-zA-Z\s]+$/.test(val), "Invalid Name"),

  email: z.string().email("Invalid email"),

  password: z.string().min(6, "At least 6 characters"),

  city: z.enum(["Douala", "Ngaoundéré"]),
});

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const auth = useAuth();
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const userDocRef = useMemoFirebase(
    () => (db && user ? doc(db, "users", user.uid) : null),
    [db, user]
  );

  const { data: profile } = useDoc(userDocRef);

  useEffect(() => {
    if (!user) return;

    if (user.email === "admin@gmail.com" || profile?.isAdmin) {
      router.replace("/admin");
    } else {
      router.replace("/");
    }
  }, [user, profile, router]);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      city: "Douala",
    },
  });

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    setIsSubmitting(true);

    try {
      await initiateEmailSignUp(
        auth,
        values.email,
        values.password
      );

    } catch (error) {
      console.error(error);
      alert("Sign Up Failed.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white font-body flex items-center justify-center p-4">
      <main className="w-full max-w-sm space-y-10 py-12 bg-white">
        
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block mb-8">
            <span className="font-black text-4xl tracking-tighter uppercase text-primary">
              Cameroon
            </span>
            <span className="font-black text-4xl tracking-tighter uppercase text-secondary ml-1">
              Zoom
            </span>
          </Link>

          <h1 className="text-2xl font-black uppercase text-secondary tracking-tight">
            Create Account
          </h1>

          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
            Join Directory
          </p>
        </div>

        <div className="bg-white p-1 rounded-2xl border border-[#E5E5E1] shadow-sm">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5 p-6"
            >
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase opacity-70 tracking-widest">
                      Full Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Full Name"
                        {...field}
                        className="h-12 border border-[#E5E5E1] rounded-xl font-bold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase opacity-70 tracking-widest">
                      Town *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 border border-[#E5E5E1] rounded-xl font-bold">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="Douala">Douala</SelectItem>
                        <SelectItem value="Ngaoundéré">
                          Ngaoundéré
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase opacity-70 tracking-widest">
                      Email Address *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="me@example.com"
                        {...field}
                        className="h-12 border border-[#E5E5E1] rounded-xl font-bold"
                      />
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
                    <FormLabel className="text-[10px] font-black uppercase opacity-70 tracking-widest">
                      Password *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="h-12 border border-[#E5E5E1] rounded-xl font-bold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-xl mt-6 hover:bg-black"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          </Form>
        </div>

        <div className="text-center pt-6 border-t border-[#E5E5E1]">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            Member already?
            <Link href="/login" className="text-primary underline ml-1">
              Log In
            </Link>
          </p>
        </div>

      </main>
    </div>
  );
}