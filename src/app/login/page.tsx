
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth, useUser, initiateEmailSignIn, useMemoFirebase, useDoc, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc } from 'firebase/firestore';

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "At least 6 letters"),
});

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => (db && user) ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userDocRef);

  useEffect(() => { 
    if (user) {
      if (user.email === 'admin@gmail.com' || profile?.isAdmin) router.replace('/admin');
      else router.replace('/');
    }
  }, [user, profile, router]);

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsSubmitting(true);
    try {
      await initiateEmailSignIn(auth, values.email, values.password);
    } catch (error) {
      alert("Login failed. Check details.");
      setIsSubmitting(false);
    }
  }

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <div className="min-h-screen bg-white font-body flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-sm space-y-10 py-12 bg-white">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block mb-8">
            <span className="font-black text-4xl tracking-tighter uppercase text-primary">Cameroon</span>
            <span className="font-black text-4xl tracking-tighter uppercase text-secondary ml-1">Zoom</span>
          </Link>
          <h1 className="text-2xl font-black uppercase text-secondary tracking-tight">Access Directory</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Institutional Verification Required</p>
        </div>

        <div className="bg-white p-1 rounded-2xl border border-[#E5E5E1] shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-6">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase opacity-70 tracking-widest">Email Address</FormLabel>
                  <FormControl><Input required type="email" placeholder="me@example.com" {...field} className="h-12 border border-[#E5E5E1] rounded-xl font-bold" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase opacity-70 tracking-widest">Password</FormLabel>
                  <FormControl><Input required type="password" placeholder="••••••••" {...field} className="h-12 border border-[#E5E5E1] rounded-xl font-bold" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-xl mt-6 hover:bg-black transition-all">
                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : "Log In"}
              </Button>
            </form>
          </Form>
        </div>
        
        <div className="text-center pt-6 border-t border-[#E5E5E1]">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            New here? <Link href="/signup" className="text-primary underline ml-1">Join Hub</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
