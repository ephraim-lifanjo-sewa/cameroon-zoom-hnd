/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth, initiateEmailSignUp } from "@/firebase";

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const auth = useAuth();

  // React Hook Form
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  // Simulated fast search / autocomplete (replace with Firestore query if needed)
  useEffect(() => {
    if (!searchText) {
      setSearchResults([]);
      return;
    }
    const fakeUsers = ["Alice", "Bob", "Charlie", "David", "Ephraim", "John"];
    setSearchResults(
      fakeUsers.filter((user) => user.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [searchText]);

  // Signup handler
  async function onSubmit(values: z.infer<typeof signupSchema>) {
    setIsSubmitting(true);
    try {
      await initiateEmailSignUp(auth, values.email, values.password); // 3 args only
      alert("Signup Successful!");
    } catch (error) {
      console.error(error);
      alert("Sign Up Failed.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <main className="w-full max-w-sm space-y-10 py-12">
        <h1 className="text-2xl font-black uppercase text-secondary tracking-tight text-center">Create Account</h1>

        {/* SEARCH BAR */}
        <div className="relative">
          <Input
            ref={inputRef}
            placeholder="Search users..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)} // allow click
            className="h-12 border rounded-xl pl-3 font-bold"
          />
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-full mt-1 w-full border rounded-xl bg-white shadow-lg z-50 max-h-48 overflow-y-auto">
              {searchResults.map((user) => (
                <div
                  key={user}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onMouseDown={() => {
                    setSearchText(user);
                    setShowDropdown(false);
                  }}
                >
                  {user}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SIGNUP FORM */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ephraim Lifanjo" className="h-12 border rounded-xl pl-3 font-bold" />
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
                    <Input {...field} placeholder="email@example.com" className="h-12 border rounded-xl pl-3 font-bold" />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="••••••" className="h-12 border rounded-xl pl-3 font-bold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-xl hover:bg-black"
            >
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Sign Up"}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}