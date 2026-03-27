/* eslint-disable react-hooks/incompatible-library */

"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Camera } from 'lucide-react';
import { useAuth, useFirestore, initiateEmailSignUp } from '@/firebase';
import Image from 'next/image';

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  city: z.string().min(1, "Select your city"),
  isBusinessOwner: z.boolean().default(false),
  profilePhoto: z.string().optional(),
});

interface SignUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin: () => void;
}

export function SignUpDialog({ open, onOpenChange, onSwitchToLogin }: SignUpDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { 
      fullName: '', 
      email: '', 
      password: '', 
      city: 'Douala', 
      isBusinessOwner: false,
      profilePhoto: ''
    },
  });

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
      await initiateEmailSignUp(auth, db, values.email, values.password, {
        fullName: values.fullName,
        city: values.city,
        isBusinessOwner: values.isBusinessOwner,
        profilePhoto: values.profilePhoto
      });
      
      toast({ title: "One Second", description: "Getting your page ready..." });
    } catch (error: unknown) {
      toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" });
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120 max-h-[90vh] overflow-y-auto rounded-xl border-2">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-black uppercase tracking-tight text-secondary">Join Us</DialogTitle>
          <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Find work & trade in Cameroon</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
            <div className="flex flex-col items-center gap-4 mb-4">
              <div className="relative w-24 h-24 rounded-full border-4 border-muted overflow-hidden group bg-muted flex items-center justify-center">
                {form.watch('profilePhoto') ? (
                  <Image src={form.watch('profilePhoto')!} alt="Avatar" fill className="object-cover" />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground/30" />
                )}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                  <Camera className="w-6 h-6 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Pick a Photo</span>
            </div>

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest">My Name</FormLabel>
                  <FormControl><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Ephraim Lifanjo" {...field} className="pl-10 h-11 border-2 font-bold" /></div></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest">My Email</FormLabel>
                    <FormControl><Input placeholder="email@..." {...field} className="h-11 border-2 font-bold text-xs" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest">My Password</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••" {...field} className="h-11 border-2 font-bold text-xs" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest">My City</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="h-11 border-2 font-bold"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="Douala">Douala</SelectItem><SelectItem value="Yaoundé">Yaoundé</SelectItem><SelectItem value="Ngaoundéré">Ngaoundéré</SelectItem></SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isBusinessOwner"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 p-4 bg-muted/30 rounded-md border-2 border-dashed">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <div className="space-y-0.5">
                    <FormLabel className="text-[11px] font-black uppercase tracking-tight text-secondary">I have a business</FormLabel>
                    <p className="text-[9px] text-muted-foreground leading-none">Access tools to manage your page.</p>
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-primary hover:bg-black text-white font-black uppercase text-xs tracking-widest shadow-xl">
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Start Now"}
            </Button>
          </form>
        </Form>

        <div className="text-center border-t-2 pt-4">
          <button onClick={onSwitchToLogin} className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors">
            Member already? <span className="text-primary underline">Go In</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
