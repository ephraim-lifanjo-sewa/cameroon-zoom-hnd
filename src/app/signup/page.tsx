/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, Home } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const signupSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  city: z.enum(["Douala", "Yaoundé", "Ngaoundéré"]),
  isBusinessOwner: z.boolean(),
  phone: z.string().optional(),
});

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "Ephraim Lifanjo",
      email: "ephraim@example.com",
      password: "",
      city: "Douala",
      isBusinessOwner: false,
      phone: "",
    },
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
      const userCred = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      await setDoc(doc(db, "users", userCred.user.uid), {
        name: values.name,
        email: values.email,
        city: values.city,
        isBusinessOwner: values.isBusinessOwner,
        profilePhoto: profilePhoto || "",
        createdAt: new Date(),
      });

      toast({ title: "Account Created!" });
      router.push("/login");
    } catch (err: any) {
      toast({
        title: "Signup Failed",
        description: err.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar with Home Button */}
      <Navbar>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="flex items-center gap-1"
          >
            <Home className="w-4 h-4" /> Home
          </Button>
        </div>
      </Navbar>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* LEFT FORM */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-auto">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center lg:text-left">
              <h1 className="text-3xl font-extrabold uppercase tracking-tight">
                Join Us
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Create your account and explore businesses
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-11 rounded-xl" />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-11 rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+237 6XX XXX XXX" className="h-11 rounded-xl" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} className="h-11 rounded-xl" />
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
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <select {...field} className="h-11 border rounded-xl px-3 w-full">
                          <option value="Douala">Douala</option>
                          <option value="Yaoundé">Yaoundé</option>
                          <option value="Ngaoundéré">Ngaoundéré</option>
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isBusinessOwner"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value} onChange={field.onChange} />
                      </FormControl>
                      <span>I have a business</span>
                    </FormItem>
                  )}
                />

                <div>
                  <label>Profile Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full border rounded-xl p-2 mt-1"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl font-bold flex justify-center items-center">
                  {loading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <p className="text-xs text-center mt-4">
              Already joined?{" "}
              <Link href="/login" className="text-primary font-bold underline">
                Go In
              </Link>
            </p>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
          <img
            src="/login.webp"
            alt="Signup"
            className="max-w-lg w-full h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}