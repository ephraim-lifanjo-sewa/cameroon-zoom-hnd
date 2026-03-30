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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MapPin } from 'lucide-react';
import { refineLocationPrecision } from '@/ai/flows/ai-assisted-location-precision';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const businessFormSchema = z.object({
  name: z.string().min(2, "Business name is required"),
  description: z.string().min(10, "Description should be at least 10 characters"),
  category: z.string(),
  city: z.string(),
  address: z.string().min(5, "Address description is important for precision"),
  phone: z.string(),
  whatsapp: z.string(),
  latitude: z.string().transform((v) => parseFloat(v)),
  longitude: z.string().transform((v) => parseFloat(v)),
  website: z.string().url().optional().or(z.literal('')),
});

export function AddBusinessModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  
  const form = useForm<z.infer<typeof businessFormSchema>>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'Food & Restaurants',
      city: 'Douala',
      address: '',
      phone: '',
      whatsapp: '',
      latitude: 0,
      longitude: 0,
      website: '',
    }
  });

  async function onSubmit(values: z.infer<typeof businessFormSchema>) {
    if (!user || !db) {
      toast({ title: "Authentication required", description: "Please log in to add a business.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Use AI tool to refine location
      const refined = await refineLocationPrecision({
        addressDescription: `${values.address}, ${values.city}`,
        latitude: values.latitude,
        longitude: values.longitude,
      });

      const businessId = doc(db, 'businesses', 'temp').id;
      const businessData = {
        id: businessId,
        ownerId: user.uid,
        name: values.name,
        description: values.description,
        categoryId: values.category, // Assuming ID is the name for now or mapped
        category: values.category,
        address: values.address,
        city: values.city,
        latitude: refined.adjustedLatitude,
        longitude: refined.adjustedLongitude,
        phone: values.phone,
        whatsapp: values.whatsapp,
        website: values.website,
        hours: "Mon-Sun: 9:00 AM - 6:00 PM", // Default simplified hours
        coverPhoto: "https://picsum.photos/seed/business/1200/800",
        logo: "https://picsum.photos/seed/logo/200/200",
        services: [],
        events: [],
        hotDeals: [],
        averageRating: 0,
        totalReviews: 0,
        photos: []
      };

      await setDoc(doc(db, 'businesses', businessId), businessData);

      toast({
        title: "Business Added Successfully",
        description: refined.explanation || "Your business has been listed on Cameroon Zoom.",
      });
      
      onOpenChange(false);
      form.reset();
      router.push(`/business/${businessId}`);
    } catch (error: any) {
      toast({
        title: "Error adding business",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">List Your Business</DialogTitle>
          <DialogDescription>
            Join Cameroon's fastest growing business directory.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Le Palais..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Food & Restaurants">Food & Restaurants</SelectItem>
                        <SelectItem value="Retail / Shops">Retail / Shops</SelectItem>
                        <SelectItem value="Beauty & Personal Care">Beauty & Personal Care</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Services / Repairs">Services / Repairs</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us about your services..." className="h-20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="City" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Douala">Douala</SelectItem>
                        <SelectItem value="Yaoundé">Yaoundé</SelectItem>
                        <SelectItem value="Ngaoundéré">Ngaoundéré</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Near Total Bastos, behind..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+237 ..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number</FormLabel>
                    <FormControl>
                      <Input placeholder="237..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/50 p-4 rounded-lg space-y-3 border-2">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>GPS Precision (Optional)</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="number" step="any" placeholder="Latitude" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="number" step="any" placeholder="Longitude" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                Our AI will automatically refine these coordinates based on your address description.
              </p>
            </div>

            <DialogFooter>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 font-bold h-12"
                disabled={isSubmitting}
              >
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</> : "Publish Listing"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
