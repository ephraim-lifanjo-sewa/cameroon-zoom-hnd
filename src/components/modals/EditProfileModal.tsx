
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
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera } from 'lucide-react';
import { useFirestore, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

const profileFormSchema = z.object({
  fullName: z.string().min(2, "Name too short").max(64),
  gender: z.enum(['f', 'm', 'o', 'u']).default('u'),
  profilePhoto: z.string().optional(),
});

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: any;
}

export function EditProfileModal({ open, onOpenChange, userData }: EditProfileModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: userData.fullName || "",
      gender: userData.gender || 'u',
      profilePhoto: userData.profilePhoto || "",
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => form.setValue('profilePhoto', reader.result as string);
    reader.readAsDataURL(file);
  };

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!user || !db) return;
    setIsSubmitting(true);
    try {
      updateDocumentNonBlocking(doc(db, 'users', user.uid), {
        ...values,
        updatedAt: new Date().toISOString()
      });
      toast({ title: "Profile Updated" });
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] p-0 overflow-hidden border-2 border-black rounded-xl">
        <DialogHeader className="p-6 border-b-2 border-black/10 bg-[#F9F9FB]">
          <DialogTitle className="text-sm font-black uppercase text-secondary tracking-widest">Profile Info</DialogTitle>
          <DialogDescription className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Fix my details</DialogDescription>
        </DialogHeader>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center gap-4 border-b-2 border-black/5 pb-6">
                <div className="w-16 h-16 border-2 border-black rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {form.watch('profilePhoto') ? (
                    <img src={form.watch('profilePhoto')} className="w-full h-full object-cover" alt="Me" />
                  ) : (
                    <img src="https://s3-media0.fl.yelpcdn.com/srv0/yelp_styleguide/bf5ff8a79310/assets/img/default_avatars/user_medium_square.png" className="w-full h-full object-cover" alt="Default Me" />
                  )}
                </div>
                <div className="space-y-2 flex-grow">
                  <Label className="text-[10px] font-black uppercase block">Change Photo</Label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="block w-full text-[9px] text-secondary file:mr-4 file:py-1 file:px-2 file:rounded-xl file:border-2 file:border-black file:text-[8px] file:font-black file:uppercase file:bg-white file:text-secondary hover:file:bg-muted" 
                  />
                </div>
              </div>

              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase">My Real Name *</FormLabel>
                  <FormControl><Input {...field} className="h-10 border-2 border-black/10 rounded-xl focus:ring-0 text-sm font-bold" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] font-black uppercase">Gender</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="f" id="g-f" /><Label htmlFor="g-f" className="text-[11px] font-bold">FEMALE</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="m" id="g-m" /><Label htmlFor="g-m" className="text-[11px] font-bold">MALE</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="o" id="g-o" /><Label htmlFor="g-o" className="text-[11px] font-bold">OTHER</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )} />
            </form>
          </Form>
        </div>

        <DialogFooter className="p-6 border-t-2 border-black/10 bg-[#F9F9FB]">
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            className="w-full h-12 bg-secondary text-white font-black uppercase text-[11px] tracking-widest rounded-xl transition-all border-2 border-black"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
