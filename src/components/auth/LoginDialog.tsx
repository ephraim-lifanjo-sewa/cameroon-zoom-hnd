/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth, initiateEmailSignIn } from '@/firebase';

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignUp: () => void;
}

export function LoginDialog({ open, onOpenChange, onSwitchToSignUp }: LoginDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsSubmitting(true);
    try {
      await initiateEmailSignIn(auth, values.email, values.password);
      toast({ title: "Welcome back", description: "Authenticating Hub records..." });
    } catch (error: unknown) {
      toast({ 
        title: "Login Failed", 
        description: "Invalid credentials. Please try again.", 
        variant: "destructive" 
      });
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-100 rounded-xl border-2">
        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="text-2xl font-black uppercase tracking-tight text-secondary">Sign In</DialogTitle>
          <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Access your directory logs</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest">Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="name@example.com" {...field} className="pl-10 h-12 border-2 font-bold" />
                    </div>
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
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" {...field} className="pl-10 h-12 border-2 font-bold" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-12 bg-primary hover:bg-black text-white font-black uppercase text-xs tracking-widest rounded-md"
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <><ArrowRight className="w-4 h-4 mr-2" /> Login</>}
            </Button>
          </form>
        </Form>

        <div className="text-center border-t-2 pt-4">
          <button 
            onClick={onSwitchToSignUp}
            className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors"
          >
            New to Cameroon Zoom? <span className="text-primary underline">Join app</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
