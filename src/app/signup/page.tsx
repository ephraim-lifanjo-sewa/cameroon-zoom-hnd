
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Upload, ArrowRight } from 'lucide-react';
import { useAuth, useFirestore, useUser, initiateEmailSignUp } from '@/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const signupSchema = z.object({
  fullName: z.string().min(2, "Name is too short").max(50),
  email: z.string().email("Use a real email").max(80),
  password: z.string().min(6, "Use at least 6 letters").max(32),
  city: z.enum(['Douala', 'Ngaoundéré']),
  isBusinessOwner: z.boolean().default(false),
  profilePhoto: z.string().optional(),
});

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', city: 'Douala', isBusinessOwner: false, profilePhoto: '' },
  });

  useEffect(() => { if (user) router.push('/'); }, [user, router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => form.setValue('profilePhoto', reader.result as string);
    reader.readAsDataURL(file);
  };

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    setIsSubmitting(true);
    try {
      const extendedData = {
        ...values,
        bio: "",
        joinDate: new Date().toISOString(),
        reviewCount: 0,
        averageRatingGiven: 0,
        role: "user" as const,
        savedBusinessIds: []
      };
      await initiateEmailSignUp(auth, db, values.email, values.password, extendedData);
      toast({ title: "Welcome to Zoom!" });
    } catch (error: any) {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white font-body">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 lg:py-24 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          
          <main className="space-y-10 max-w-md mx-auto lg:mx-0 w-full">
            <div className="space-y-4">
              <h1 className="text-3xl font-black uppercase tracking-tight text-secondary leading-none">Join Us</h1>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center gap-6 border-b border-[#E5E5E1] pb-6 mb-4">
                  <div className="relative w-16 h-16 rounded-full border border-[#E5E5E1] bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {form.watch('profilePhoto') ? (
                      <img src={form.watch('profilePhoto')!} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 opacity-20" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="flex items-center gap-2 cursor-pointer h-10 px-4 border border-[#E5E5E1] font-black uppercase text-[9px] tracking-widest hover:bg-muted/10 rounded-xl transition-colors">
                      <Upload className="w-3.5 h-3.5" /> Pick a Photo
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-70">My Name</FormLabel>
                      <FormControl><Input required placeholder="First & Last Name" {...field} className="h-11 border border-[#E5E5E1] font-bold rounded-xl" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-70">My Town</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 border border-[#E5E5E1] font-bold rounded-xl">
                            <SelectValue placeholder="Douala" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border border-[#E5E5E1] shadow-xl">
                          <SelectItem value="Douala">Douala</SelectItem>
                          <SelectItem value="Ngaoundéré">Ngaoundéré</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-70">My Email</FormLabel>
                    <FormControl><Input required placeholder="name@example.com" {...field} className="h-11 border border-[#E5E5E1] font-bold rounded-xl" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-70">My Password</FormLabel>
                    <FormControl><Input required type="password" placeholder="••••••••" {...field} className="h-11 border border-[#E5E5E1] font-bold rounded-xl" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="isBusinessOwner" render={({ field }) => (
                  <FormItem className="flex items-center gap-3 p-4 bg-muted/10 border border-[#E5E5E1] rounded-xl transition-all hover:bg-muted/20">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="text-[10px] font-black uppercase cursor-pointer mb-0">I have a business</FormLabel>
                  </FormItem>
                )} />

                <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-primary text-white font-black uppercase text-xs rounded-xl shadow-lg transition-all active:scale-95">
                  {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <><ArrowRight className="w-5 h-5 mr-2" /> Start Now</>}
                </Button>
              </form>
            </Form>
            
            <div className="pt-6 border-t border-[#E5E5E1] text-center lg:text-left">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Already Joined? <Link href="/login" className="text-primary underline ml-1 hover:text-black transition-colors">Go In</Link>
              </p>
            </div>
          </main>

          <aside className="hidden lg:flex items-center justify-center p-16 bg-muted/10 rounded-3xl border border-[#E5E5E1] border-dashed">
            <div className="space-y-10 text-center max-w-sm">
              <div className="relative aspect-square w-full">
                <img 
                  src="https://s3-media0.fl.yelpcdn.com/assets/2/www/img/7922e77f338d/signup/signup_illustration.png" 
                  alt="Join Illustration" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-secondary">Start Exploring</h2>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                  The most reliable professional directory in Cameroon.
                </p>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
