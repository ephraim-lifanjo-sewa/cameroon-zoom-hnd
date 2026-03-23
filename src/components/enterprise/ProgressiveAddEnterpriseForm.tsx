
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Loader2,
  MapPin,
  Navigation,
  Keyboard,
  Mail,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const LocationPickerMap = dynamic(() => import('./LocationPickerMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center font-black uppercase text-[10px]">Opening Map...</div>
});

const REGIONS = ["Adamawa", "Central", "East", "Far North", "Littoral", "North", "Northwest", "South", "Southwest", "West"];
const CATEGORIES = ["Food & Hospitality", "Health & Wellness", "Technology & IT", "Business & Professional", "Home & Lifestyle", "Creative & Media", "Education & Training", "Events & Entertainment"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIMES = Array.from({ length: 24 }).flatMap((_, i) => {
  const hour = i === 0 ? 12 : i > 12 ? i - 12 : i;
  const ampm = i >= 12 ? 'PM' : 'AM';
  return [`${hour}:00 ${ampm}`, `${hour}:30 ${ampm}`];
});

export function ProgressiveAddEnterpriseForm({ initialName }: { initialName?: string }) {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationMethod, setLocationMethod] = useState<'auto' | 'pick' | 'manual'>('pick');

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

  const handleAutoLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "GPS Error", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition((pos) => {
      setFormData(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
      toast({ title: "Found You!" });
    }, () => {
      toast({ title: "Could not find location", variant: "destructive" });
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'coverPhoto') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleSubmit = () => {
    if (!user || !db) return;
    if (!formData.businessName || !formData.ceoName || !formData.description || !formData.address || !formData.phoneNumber) {
      toast({ title: "Fill all boxes!", variant: "destructive" });
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
      <div className="bg-white border-2 border-black rounded-xl p-6 sm:p-10 space-y-10 shadow-sm">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b-2 border-black/10 pb-4">
          <span>{["About", "Where", "Pictures", "Finish"][step - 1]}</span>
          <span>Part {step}/4</span>
        </div>

        <div className="min-h-[400px]">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Company Name *</Label>
                  <Input required value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} className="h-11 border-2 border-black/20 rounded-xl font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Type of Work *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                    <SelectTrigger className="h-11 border-2 border-black/20 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="border-2 border-black rounded-xl">{CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-xs uppercase font-bold">{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Boss Name *</Label>
                  <Input required value={formData.ceoName} onChange={e => setFormData({...formData, ceoName: e.target.value})} className="h-11 border-2 border-black/20 rounded-xl font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Workers Count</Label>
                  <Select value={formData.employeeCount} onValueChange={(v) => setFormData({...formData, employeeCount: v})}>
                    <SelectTrigger className="h-11 border-2 border-black/20 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="border-2 border-black rounded-xl">{["1-10", "11-50", "51-200", "200+"].map(size => <SelectItem key={size} value={size} className="text-xs uppercase font-bold">{size} People</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">About the Business *</Label>
                <Textarea required placeholder="Tell us what you do..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="min-h-[120px] border-2 border-black/20 rounded-xl italic font-bold" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase">Address *</Label>
                    <Input required placeholder="Building or Street" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-11 border-2 border-black/20 rounded-xl font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase">Town *</Label>
                      <Input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="h-11 border-2 border-black/20 rounded-xl font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase">Region *</Label>
                      <Select value={formData.state} onValueChange={(v) => setFormData({...formData, state: v})}>
                        <SelectTrigger className="h-11 border-2 border-black/20 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent className="border-2 border-black rounded-xl">{REGIONS.map(r => <SelectItem key={r} value={r} className="text-xs uppercase font-bold">{r}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase">Phone Number *</Label>
                    <Input required value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="h-11 border-2 border-black/20 rounded-xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase">Work Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-11 border-2 border-black/20 rounded-xl font-bold pl-10" placeholder="me@work.cm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase">Website / Link</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="h-11 border-2 border-black/20 rounded-xl font-bold pl-10" placeholder="https://..." />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Map Location</Label>
                    <RadioGroup value={locationMethod} onValueChange={(v: any) => setLocationMethod(v)} className="flex flex-col gap-3">
                      <div className="flex items-center space-x-2 p-3 border-2 border-black/10 rounded-xl hover:bg-muted/10 cursor-pointer">
                        <RadioGroupItem value="auto" id="l-auto" />
                        <Label htmlFor="l-auto" className="text-xs font-bold cursor-pointer flex items-center gap-2"><Navigation className="w-3 h-3" /> Find Me (GPS)</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border-2 border-black/10 rounded-xl hover:bg-muted/10 cursor-pointer">
                        <RadioGroupItem value="pick" id="l-pick" />
                        <Label htmlFor="l-pick" className="text-xs font-bold cursor-pointer flex items-center gap-2"><MapPin className="w-3 h-3" /> Move Red Pin</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border-2 border-black/10 rounded-xl hover:bg-muted/10 cursor-pointer">
                        <RadioGroupItem value="manual" id="l-manual" />
                        <Label htmlFor="l-manual" className="text-xs font-bold cursor-pointer flex items-center gap-2"><Keyboard className="w-3 h-3" /> Type Lat/Long</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {locationMethod === 'auto' && (
                    <Button onClick={handleAutoLocation} className="w-full h-12 bg-secondary text-white font-black uppercase text-[10px] rounded-xl">Use My Current Spot</Button>
                  )}

                  {locationMethod === 'pick' && (
                    <div className="aspect-square w-full min-h-[300px] rounded-xl overflow-hidden border-2 border-black/10">
                      <LocationPickerMap 
                        lat={formData.latitude} 
                        lng={formData.longitude} 
                        onChange={handleLocationChange} 
                      />
                    </div>
                  )}

                  {locationMethod === 'manual' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[9px] uppercase font-black">Latitude</Label>
                        <Input type="number" step="any" value={formData.latitude} onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value)})} className="h-10 border-2 border-black/10 rounded-xl font-bold" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] uppercase font-black">Longitude</Label>
                        <Input type="number" step="any" value={formData.longitude} onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value)})} className="h-10 border-2 border-black/10 rounded-xl font-bold" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase text-primary tracking-widest">Work Times</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-2">
                    <Select value={formData.startDay} onValueChange={(v) => setFormData({...formData, startDay: v})}>
                      <SelectTrigger className="h-10 border-2 border-black/20 text-xs rounded-xl font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent className="border-2 border-black rounded-xl">{DAYS.map(d => <SelectItem key={d} value={d} className="text-xs font-bold">{d}</SelectItem>)}</SelectContent>
                    </Select>
                    <span className="text-[10px] font-black pt-2">TO</span>
                    <Select value={formData.stopDay} onValueChange={(v) => setFormData({...formData, stopDay: v})}>
                      <SelectTrigger className="h-10 border-2 border-black/20 text-xs rounded-xl font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent className="border-2 border-black rounded-xl">{DAYS.map(d => <SelectItem key={d} value={d} className="text-xs font-bold">{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={formData.openTime} onValueChange={(v) => setFormData({...formData, openTime: v})}>
                      <SelectTrigger className="h-10 border-2 border-black/20 text-xs rounded-xl font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent className="border-2 border-black rounded-xl">{TIMES.map(t => <SelectItem key={t} value={t} className="text-xs font-bold">{t}</SelectItem>)}</SelectContent>
                    </Select>
                    <span className="text-[10px] font-black pt-2">TO</span>
                    <Select value={formData.closeTime} onValueChange={(v) => setFormData({...formData, closeTime: v})}>
                      <SelectTrigger className="h-10 border-2 border-black/20 text-xs rounded-xl font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent className="border-2 border-black rounded-xl">{TIMES.map(t => <SelectItem key={t} value={t} className="text-xs font-bold">{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t-2 border-black/10">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase">Business Logo</Label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => handleImageUpload(e, 'logo')} 
                    className="block w-full text-[10px] text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-2 file:border-black file:text-[10px] file:font-black file:uppercase file:bg-white file:text-secondary hover:file:bg-muted" 
                  />
                  {formData.logo && <img src={formData.logo} className="h-20 mt-2 rounded-xl border-2 border-black shadow-sm" alt="logo" />}
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase">Main Banner Picture</Label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => handleImageUpload(e, 'coverPhoto')} 
                    className="block w-full text-[10px] text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-2 file:border-black file:text-[10px] file:font-black file:uppercase file:bg-white file:text-secondary hover:file:bg-muted" 
                  />
                  {formData.coverPhoto && <img src={formData.coverPhoto} className="h-20 mt-2 rounded-xl border-2 border-black shadow-sm" alt="cover" />}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight">Ready to post!</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Check your info before you click</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-8 border-t-2 border-black/10">
          <Button variant="ghost" onClick={prevStep} className="h-12 px-8 font-black uppercase text-[10px] rounded-xl" disabled={step === 1 || isSubmitting}>Back</Button>
          {step < 4 ? (
            <Button onClick={nextStep} className="h-12 flex-1 bg-secondary text-white font-black uppercase text-[10px] rounded-xl shadow-lg hover:bg-black transition-all">Next Part</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="h-12 flex-1 bg-primary text-white font-black uppercase text-[10px] rounded-xl shadow-lg hover:bg-black transition-all">
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Register My Business"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
