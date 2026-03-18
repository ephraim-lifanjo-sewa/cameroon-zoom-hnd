"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const REGIONS = ["Adamawa", "Central", "East", "Far North", "Littoral", "North", "Northwest", "South", "Southwest", "West"];
const CATEGORIES = ["Food & Hospitality", "Health & Wellness", "Technology & IT", "Business & Professional", "Home & Lifestyle", "Creative & Media", "Education & Training", "Events & Entertainment"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIMES = Array.from({ length: 24 }).flatMap((_, i) => {
  const hour = i === 0 ? 12 : i > 12 ? i - 12 : i;
  const ampm = i >= 12 ? 'PM' : 'AM';
  return [`${hour}:00 ${ampm}`, `${hour}:30 ${ampm}`];
});

/**
 * PROGRESSIVE ADD FORM
 * Replaced complex terms with simple "Parts".
 */
export function ProgressiveAddEnterpriseForm({ initialName }: { initialName?: string }) {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    businessName: initialName || '',
    description: '',
    category: 'Food & Hospitality',
    ceoName: '',
    employeeCount: '1-10',
    address: '',
    city: 'Douala',
    state: 'Littoral',
    phoneNumber: '',
    whatsapp: '',
    email: '',
    website: '',
    startDay: 'Monday',
    stopDay: 'Friday',
    openTime: '08:00 AM',
    closeTime: '06:00 PM',
    logo: '',
    coverPhoto: '',
    latitude: 4.0511,
    longitude: 9.7679,
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'coverPhoto') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!user || !db) return;
    if (!formData.businessName || !formData.ceoName || !formData.description || !formData.address || !formData.phoneNumber) {
      toast({ title: "Please fill all boxes!", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    
    const bizId = doc(collection(db, 'businesses')).id;
    const hours = `${formData.startDay} - ${formData.stopDay}: ${formData.openTime} - ${formData.closeTime}`;
    const enterpriseData = {
      ...formData,
      id: bizId,
      name: formData.businessName,
      hours,
      ownerId: user.uid,
      averageRating: 0,
      totalReviews: 0,
      isVerified: false,
      isActive: true,
      createdDate: new Date().toISOString(),
    };

    setDocumentNonBlocking(doc(db, 'businesses', bizId), enterpriseData, { merge: true });
    
    toast({ title: "Business Registered!" });
    router.push(`/business/${bizId}`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white border-2 p-10 space-y-10 shadow-sm rounded-xl">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b-2 pb-4">
          <span>{["Name", "Where", "Pictures", "Finish"][step - 1]}</span>
          <span>Part {step}/4</span>
        </div>

        <div className="min-h-[400px]">
          {step === 1 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Business Name *</Label>
                  <Input required value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} className="h-11 border-2 rounded-lg font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Type of Work *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                    <SelectTrigger className="h-11 border-2 rounded-lg font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-xs uppercase font-bold">{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Boss Name *</Label>
                  <Input required value={formData.ceoName} onChange={e => setFormData({...formData, ceoName: e.target.value})} className="h-11 border-2 rounded-lg font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">How many workers?</Label>
                  <Select value={formData.employeeCount} onValueChange={(v) => setFormData({...formData, employeeCount: v})}>
                    <SelectTrigger className="h-11 border-2 rounded-lg font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent>{["1-10", "11-50", "51-200", "200+"].map(size => <SelectItem key={size} value={size} className="text-xs uppercase font-bold">{size} People</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">About the Work *</Label>
                <Textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="min-h-[120px] border-2 rounded-lg italic font-bold" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Address *</Label>
                  <Input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-11 border-2 rounded-lg font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Town *</Label>
                  <Input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="h-11 border-2 rounded-lg font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Region *</Label>
                  <Select value={formData.state} onValueChange={(v) => setFormData({...formData, state: v})}>
                    <SelectTrigger className="h-11 border-2 rounded-lg font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent>{REGIONS.map(r => <SelectItem key={r} value={r} className="text-xs uppercase font-bold">{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Phone Number *</Label>
                  <Input required value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="h-11 border-2 rounded-lg font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">WhatsApp Number</Label>
                  <Input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="h-11 border-2 rounded-lg font-bold" placeholder="237..." />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Website Link</Label>
                  <Input value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="h-11 border-2 rounded-lg font-bold" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase text-primary tracking-widest">Operating Times</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-2">
                    <Select value={formData.startDay} onValueChange={(v) => setFormData({...formData, startDay: v})}>
                      <SelectTrigger className="h-10 border-2 text-xs rounded-lg font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d} className="text-xs font-bold">{d}</SelectItem>)}</SelectContent>
                    </Select>
                    <span className="text-[10px] font-black">TO</span>
                    <Select value={formData.stopDay} onValueChange={(v) => setFormData({...formData, stopDay: v})}>
                      <SelectTrigger className="h-10 border-2 text-xs rounded-lg font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d} className="text-xs font-bold">{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={formData.openTime} onValueChange={(v) => setFormData({...formData, openTime: v})}>
                      <SelectTrigger className="h-10 border-2 text-xs rounded-lg font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent>{TIMES.map(t => <SelectItem key={t} value={t} className="text-xs font-bold">{t}</SelectItem>)}</SelectContent>
                    </Select>
                    <span className="text-[10px] font-black">TO</span>
                    <Select value={formData.closeTime} onValueChange={(v) => setFormData({...formData, closeTime: v})}>
                      <SelectTrigger className="h-10 border-2 text-xs rounded-lg font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent>{TIMES.map(t => <SelectItem key={t} value={t} className="text-xs font-bold">{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t-2">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Business Logo</Label>
                  <input type="file" accept="image/*" required onChange={e => handleImageUpload(e, 'logo')} className="text-[10px] block w-full border-2 p-2 rounded-lg font-bold" />
                  {formData.logo && <img src={formData.logo} className="h-16 mt-2 rounded-lg shadow-sm border-2" alt="logo" onClick={() => window.open(formData.logo, '_blank')} />}
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Cover Picture</Label>
                  <input type="file" accept="image/*" required onChange={e => handleImageUpload(e, 'coverPhoto')} className="text-[10px] block w-full border-2 p-2 rounded-lg font-bold" />
                  {formData.coverPhoto && <img src={formData.coverPhoto} className="h-16 mt-2 rounded-lg shadow-sm border-2" alt="cover" onClick={() => window.open(formData.coverPhoto, '_blank')} />}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
              <h3 className="text-2xl font-black uppercase tracking-tight">You are all done!</h3>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Ready to post to the app.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-8 border-t-2">
          <Button variant="ghost" onClick={prevStep} className="h-12 px-8 font-black uppercase text-[10px] rounded-full" disabled={step === 1 || isSubmitting}>Back</Button>
          {step < 4 ? (
            <Button onClick={nextStep} className="h-12 flex-1 bg-secondary text-white font-black uppercase text-[10px] rounded-full shadow-lg hover:bg-black transition-all">Next Part</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="h-12 flex-1 bg-primary text-white font-black uppercase text-[10px] rounded-full shadow-lg hover:bg-black transition-all">
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Post My Business"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
