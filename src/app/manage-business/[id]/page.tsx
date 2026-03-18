"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  Save,
  ArrowLeft,
  LayoutGrid,
  Navigation
} from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useFirestore, useUser, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Enterprise } from '@/app/lib/types';
import { ImageModal } from '@/components/modals/ImageModal';
import { ServiceManagementModal } from '@/components/modals/ServiceManagementModal';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('@/components/enterprise/LocationPickerMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted flex items-center justify-center font-black uppercase text-[10px]">Opening Map...</div>
});

const CATEGORIES = ["Food & Hospitality", "Health & Wellness", "Technology & IT", "Business & Professional", "Home & Lifestyle", "Creative & Media", "Education & Training", "Events & Entertainment"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIMES = Array.from({ length: 48 }).map((_, i) => {
  const hour = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? "00" : "30";
  const ampm = hour < 12 ? "AM" : "PM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
});

const businessFormSchema = z.object({
  businessName: z.string().min(2, "Name too short"),
  ceoName: z.string().min(2, "Boss name too short"),
  description: z.string().min(10, "About too short"),
  category: z.string(),
  address: z.string().min(5, "Address too short"),
  city: z.string(),
  state: z.string(),
  phoneNumber: z.string().min(8, "Phone too short"),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  startDay: z.string(),
  stopDay: z.string(),
  openTime: z.string(),
  closeTime: z.string(),
  isActive: z.boolean(),
  logo: z.string().optional(),
  coverPhoto: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
});

export default function ManagementConsolePage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);

  const businessRef = useMemoFirebase(() => (db && id) ? doc(db, 'businesses', id as string) : null, [db, id]);
  const { data: business, isLoading: isBusinessLoading } = useDoc<Enterprise>(businessRef);

  const form = useForm<z.infer<typeof businessFormSchema>>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      businessName: '', ceoName: '', description: '', category: 'Food & Hospitality', 
      address: '', city: 'Douala', state: 'Littoral',
      phoneNumber: '', whatsapp: '', email: '', website: '',
      startDay: 'Monday', stopDay: 'Friday', openTime: '08:00 AM', closeTime: '06:00 PM',
      isActive: true, logo: '', coverPhoto: '', latitude: 4.0511, longitude: 9.7679
    }
  });

  useEffect(() => {
    if (business) {
      let sDay = 'Monday', stDay = 'Friday', oTime = '08:00 AM', cTime = '06:00 PM';
      if (business.hours) {
        try {
          const parts = business.hours.split(': ');
          const dayParts = parts[0].split(' - ');
          const timeParts = parts[1].split(' - ');
          sDay = dayParts[0] || 'Monday'; 
          stDay = dayParts[1] || 'Friday'; 
          oTime = timeParts[0] || '08:00 AM'; 
          cTime = timeParts[1] || '06:00 PM';
        } catch(e) {}
      }
      form.reset({
        businessName: business.businessName || business.name || '',
        ceoName: business.ceoName || '',
        description: business.description || '',
        category: business.category || 'Food & Hospitality',
        address: business.address || '',
        city: business.city || 'Douala',
        state: business.state || 'Littoral',
        phoneNumber: business.phoneNumber || '',
        whatsapp: business.whatsapp || '',
        email: business.email || '',
        website: business.website || '',
        startDay: sDay, stopDay: stDay, openTime: oTime, closeTime: cTime,
        isActive: business.isActive !== false,
        logo: business.logo || '',
        coverPhoto: business.coverPhoto || '',
        latitude: business.latitude || 4.0511,
        longitude: business.longitude || 9.7679
      });
    }
  }, [business, form]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'coverPhoto') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => form.setValue(field, reader.result as string);
    reader.readAsDataURL(file);
  };

  async function onSave(values: z.infer<typeof businessFormSchema>) {
    if (!business || !db) return;
    setIsUpdating(true);
    try {
      const hours = `${values.startDay} - ${values.stopDay}: ${values.openTime} - ${values.closeTime}`;
      updateDocumentNonBlocking(doc(db, 'businesses', business.id), {
        ...values,
        hours,
        name: values.businessName,
        updatedAt: new Date().toISOString()
      });
      toast({ title: "Saved Successfully" });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    } finally { setIsUpdating(false); }
  }

  if (isBusinessLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-secondary" /></div>;
  if (!business || (user && business.ownerId !== user.uid)) return <div className="h-screen flex items-center justify-center font-black uppercase text-xs">No Access</div>;

  return (
    <div className="min-h-screen bg-white font-body text-secondary pb-24">
      <Navbar />
      
      <div className="border-b py-10 bg-muted/5">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="w-10 h-10 border-2 bg-white flex items-center justify-center rounded-xl hover:bg-muted transition-colors shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-black uppercase truncate">{business.businessName || business.name}</h1>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Management Hub</p>
              </div>
            </div>
            <Button onClick={() => setShowServiceModal(true)} variant="outline" className="h-12 border-2 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm">
              <LayoutGrid className="w-4 h-4 mr-2" /> Items & Services
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-10 max-w-5xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-8">
            <div className="bg-white border-2 border-secondary rounded-xl p-8 space-y-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField control={form.control} name="businessName" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] uppercase font-black opacity-50">Company Name</FormLabel>
                  <FormControl><Input required {...field} className="h-12 border-2 rounded-xl font-bold" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] uppercase font-black opacity-50">Work Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="h-12 border-2 rounded-xl font-bold"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent className="rounded-xl">{CATEGORIES.map(c => <SelectItem key={c} value={c} className="font-bold">{c}</SelectItem>)}</SelectContent>
                  </Select>
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField control={form.control} name="ceoName" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] uppercase font-black opacity-50">Boss Name</FormLabel>
                  <FormControl><Input required {...field} className="h-12 border-2 rounded-xl font-bold" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] uppercase font-black opacity-50">Phone Number</FormLabel>
                  <FormControl><Input required {...field} className="h-12 border-2 rounded-xl font-bold" /></FormControl>
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] uppercase font-black opacity-50">About</FormLabel>
                <FormControl><Textarea required {...field} className="min-h-[120px] border-2 rounded-xl italic font-bold" /></FormControl>
                </FormItem>
              )} />

              <div className="pt-8 border-t space-y-8">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Location Pickup</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] uppercase font-black opacity-50">Exact Address</FormLabel>
                    <FormControl><Input required {...field} className="h-12 border-2 rounded-xl font-bold" /></FormControl>
                    </FormItem>
                  )} />
                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase font-black opacity-50">Precise GPS</Label>
                    <div className="h-[250px] border-2 rounded-xl overflow-hidden">
                      <LocationPickerMap 
                        lat={form.watch('latitude')} 
                        lng={form.watch('longitude')} 
                        onChange={(lat, lng) => {
                          form.setValue('latitude', lat);
                          form.setValue('longitude', lng);
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t space-y-6">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Photos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase font-black opacity-50">Logo</Label>
                    <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'logo')} className="text-[10px] w-full" />
                    {form.watch('logo') && (
                      <img src={form.watch('logo')} className="h-24 border-2 rounded-xl mt-2 cursor-pointer" onClick={() => setPreviewImg(form.watch('logo') || null)} alt="logo" />
                    )}
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase font-black opacity-50">Main Photo</Label>
                    <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'coverPhoto')} className="text-[10px] w-full" />
                    {form.watch('coverPhoto') && (
                      <img src={form.watch('coverPhoto')} className="h-24 border-2 rounded-xl mt-2 cursor-pointer" onClick={() => setPreviewImg(form.watch('coverPhoto') || null)} alt="cover" />
                    )}
                  </div>
                </div>
              </div>

              <FormField control={form.control} name="isActive" render={({ field }) => (
                <FormItem className="flex items-center justify-between p-6 border-2 rounded-xl bg-muted/10">
                  <FormLabel className="text-[10px] uppercase font-black mb-0">Show on Directory</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
            </div>

            <Button type="submit" className="w-full h-16 bg-secondary text-white font-black uppercase text-[11px] tracking-widest rounded-xl shadow-xl hover:bg-black transition-all" disabled={isUpdating}>
              {isUpdating ? <Loader2 className="animate-spin w-6 h-6" /> : <Save className="w-5 h-5 mr-2" />} Save All Changes
            </Button>
          </form>
        </Form>
      </div>

      <ImageModal open={!!previewImg} onOpenChange={(o) => !o && setPreviewImg(null)} src={previewImg} />
      
      {business && (
        <ServiceManagementModal 
          open={showServiceModal} 
          onOpenChange={setShowServiceModal} 
          businessId={business.id} 
          existingServices={business.services || []} 
          category={business.category}
        />
      )}
    </div>
  );
}
