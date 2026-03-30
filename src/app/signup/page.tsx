/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight,  } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

// 🔹 Schema Zod pour validation
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const signupSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  city: z.string().nonempty(),
  isBusinessOwner: z.boolean(),
});

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", city: "Douala", isBusinessOwner: false },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfilePhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    setLoading(true);
    try {
      // 1️⃣ Create Firebase Auth user
      const userCred = await createUserWithEmailAndPassword(auth, values.email, values.password);

      // 2️⃣ Save user in Firestore
      await setDoc(doc(db, "users", userCred.user.uid), {
        ...values,
        profilePhoto: profilePhoto || "",
        createdAt: new Date(),
      });

      toast({ title: "Account Created!" });
      router.push("/login");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast({ title: "Signup Failed", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white font-bod">
  <Navbar />

  <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
    <div className="w-full max-w-md">
      
      {/* SIGNUP FORM */}
<main className="space-y-10 animate-in fade-in duration-500 bg-white p-8 rounded-2xl shadow-sm border">        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-black uppercase tracking-tight text-secondary leading-none">
            Join Us
          </h1>

          <p className="text-sm font-medium text-muted-foreground">
            Create your account and start exploring the top businesses in Cameroon.
          </p>
        </div>

        {/* FORM */}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-70">Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="John Doe" className="h-12 border border-[#E5E5E1] font-bold rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-70">Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="me@example.com" className="h-12 border border-[#E5E5E1] font-bold rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-70">Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} placeholder="••••••••" className="h-12 border border-[#E5E5E1] font-bold rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* City */}
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-70">City</FormLabel>
                      <FormControl>
                        <select {...field} className="h-12 border border-[#E5E5E1] rounded-xl px-3 font-bold w-full">
                          <option value="Douala">Douala</option>
                          <option value="Ngaoundéré">Ngaoundéré</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Business Owner */}
                <FormField
                  control={form.control}
                  name="isBusinessOwner"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <input type="checkbox" {...field} className="w-4 h-4" />
                      </FormControl>
                      <span className="text-xs font-black uppercase">I have a business</span>
                    </FormItem>
                  )}
                />

                {/* Profile Photo Upload */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-70">Profile Photo</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="border border-[#E5E5E1] rounded-xl p-2" />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-primary text-white font-black uppercase text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><ArrowRight className="w-5 h-5 mr-2" /> Start Now</>}
                </Button>
              </form>
            </Form>

            <div className="pt-6 border-t border-[#E5E5E1] text-center lg:text-left">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Already joined? <Link href="/login" className="text-primary underline ml-1 hover:text-black">Go In</Link>
              </p>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}