"use client";

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, LayoutGrid, Check, MapPin, Navigation, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('@/components/enterprise/LocationPickerMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center font-black uppercase text-[10px]">Opening Map...</div>
});

const CATEGORIES = ["Food & Hospitality", "Health & Wellness", "Technology & IT", "Business & Professional", "Home & Lifestyle", "Creative & Media", "Education & Training", "Events & Entertainment"];
const REGIONS = ["Adamawa", "Central", "East", "Far North", "Littoral", "North", "Northwest", "South", "Southwest", "West"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIMES = Array.from({ length: 48 }).map((_, i) => {
  const hour = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? "00" : "30";
  const ampm = hour < 12 ? "AM" : "PM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
});

const DRAFT_KEY = 'cameroon_zoom_biz_draft_v2';

export default function AddBusinessPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    category: '',
    ceoName: '',
    employeeCount: '',
    address: '',
    city: '',
    state: '',
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
    longitude: 9.7679
  });

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        setFormData(prev => ({ ...prev, ...JSON.parse(saved) }));
        toast({ title: "Draft Restored" });
      } catch (e) {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'coverPhoto') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleAutoLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "GPS not supported", variant: "destructive" });
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({ 
          ...prev, 
          latitude: pos.coords.latitude, 
          longitude: pos.coords.longitude 
        }));
        setIsLocating(false);
        toast({ title: "Spot Found!" });
      },
      () => {
        setIsLocating(false);
        toast({ title: "GPS Error", variant: "destructive" });
      }
    );
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setFormData({
      businessName: '', description: '', category: '', ceoName: '', employeeCount: '',
      address: '', city: '', state: '', phoneNumber: '', whatsapp: '', email: '', website: '',
      startDay: 'Monday', stopDay: 'Friday', openTime: '08:00 AM', closeTime: '06:00 PM',
      logo: '', coverPhoto: '', latitude: 4.0511, longitude: 9.7679
    });
    setActiveTab(1);
    toast({ title: "Form Cleared" });
  };

  const nextTab = () => {
    setActiveTab(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!user || !db) return;
    setIsSubmitting(true);
    
    try {
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
      localStorage.removeItem(DRAFT_KEY);
      toast({ title: "Business Registered!" });
      router.push(`/business/${bizId}`);
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-body pb-24">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <header className="mb-12 flex items-start justify-between">
          <div className="space-y-4">
            <h1 className="text-3xl font-black uppercase tracking-tight text-secondary">Add Business</h1>
            <div className="flex gap-4">
              {[1, 2, 3].map(t => (
                <div 
                  key={t}
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border-2 transition-all",
                    activeTab === t ? "border-primary bg-primary text-white" : "border-muted text-muted-foreground opacity-50"
                  )}
                >
                  Part {t}
                </div>
              ))}
            </div>
          </div>
          <Button onClick={clearDraft} variant="ghost" className="text-[9px] font-bold uppercase tracking-widest hover:text-red-600">
            <Trash2 className="w-3 h-3 mr-2" /> Start Fresh
          </Button>
        </header>

        <div className="space-y-10">
          {activeTab === 1 && (
            <div className="space-y-10">
              <div className="grid gap-8">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Company Name *</Label>
                  <Input value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} className="h-12 text-base font-bold rounded-xl border-2" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Type of Work *</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                      <SelectTrigger className="h-12 text-sm font-bold rounded-xl border-2"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent className="max-h-[300px] rounded-xl">{CATEGORIES.map(c => <SelectItem key={c} value={c} className="font-bold">{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Boss Name *</Label>
                    <Input value={formData.ceoName} onChange={e => setFormData({...formData, ceoName: e.target.value})} className="h-12 text-base font-bold rounded-xl border-2" />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Worker Count *</Label>
                  <Select value={formData.employeeCount} onValueChange={(v) => setFormData({...formData, employeeCount: v})}>
                    <SelectTrigger className="h-12 text-sm font-bold rounded-xl border-2"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="rounded-xl">{["1-10", "11-50", "51-200", "200+"].map(size => <SelectItem key={size} value={size} className="font-bold">{size} People</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">About the Work *</Label>
                  <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="min-h-[120px] text-base font-bold italic rounded-xl border-2" placeholder="Tell us more..." />
                </div>

                <div className="pt-6 border-t space-y-6">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Operating Times</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={formData.startDay} onValueChange={(v) => setFormData({...formData, startDay: v})}>
                      <SelectTrigger className="h-11 text-xs font-bold rounded-xl border-2"><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-[200px] rounded-xl">{DAYS.map(d => <SelectItem key={d} value={d} className="font-bold">{d}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={formData.stopDay} onValueChange={(v) => setFormData({...formData, stopDay: v})}>
                      <SelectTrigger className="h-11 text-xs font-bold rounded-xl border-2"><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-[200px] rounded-xl">{DAYS.map(d => <SelectItem key={d} value={d} className="font-bold">{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={formData.openTime} onValueChange={(v) => setFormData({...formData, openTime: v})}>
                      <SelectTrigger className="h-11 text-xs font-bold rounded-xl border-2"><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-[200px] rounded-xl">{TIMES.map(t => <SelectItem key={t} value={t} className="font-bold">{t}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={formData.closeTime} onValueChange={(v) => setFormData({...formData, closeTime: v})}>
                      <SelectTrigger className="h-11 text-xs font-bold rounded-xl border-2"><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-[200px] rounded-xl">{TIMES.map(t => <SelectItem key={t} value={t} className="font-bold">{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button onClick={nextTab} className="w-full h-14 bg-secondary text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-black">
                Next: Contact Details <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-10">
              <div className="grid gap-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Town *</Label>
                    <Select value={formData.city} onValueChange={(v) => setFormData({...formData, city: v})}>
                      <SelectTrigger className="h-12 text-sm font-bold rounded-xl border-2"><SelectValue placeholder="Town" /></SelectTrigger>
                      <SelectContent className="rounded-xl"><SelectItem value="Douala" className="font-bold">Douala</SelectItem><SelectItem value="Ngaoundéré" className="font-bold">Ngaoundéré</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Region *</Label>
                    <Select value={formData.state} onValueChange={(v) => setFormData({...formData, state: v})}>
                      <SelectTrigger className="h-12 text-sm font-bold rounded-xl border-2"><SelectValue placeholder="Region" /></SelectTrigger>
                      <SelectContent className="max-h-[300px] rounded-xl">{REGIONS.map(r => <SelectItem key={r} value={r} className="font-bold">{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Address Description *</Label>
                  <Input placeholder="Building or Street" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-12 text-base font-bold rounded-xl border-2" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Phone Number *</Label>
                    <Input placeholder="+237..." value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="h-12 text-base font-bold rounded-xl border-2" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">WhatsApp *</Label>
                    <Input placeholder="237..." value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="h-12 text-base font-bold rounded-xl border-2" />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Work Email *</Label>
                  <Input placeholder="me@work.cm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-12 text-base font-bold rounded-xl border-2" />
                </div>

                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Website Link</Label>
                  <Input placeholder="https://..." value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="h-12 text-base font-bold rounded-xl border-2" />
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setActiveTab(1)} className="h-14 px-8 font-black uppercase text-xs rounded-xl border-2">Back</Button>
                <Button onClick={nextTab} className="flex-1 h-14 bg-secondary text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-black">
                  Next: Visuals & GPS <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {activeTab === 3 && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div className="grid gap-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Logo</Label>
                  <div className="relative h-40 w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center bg-muted/10 overflow-hidden cursor-pointer hover:bg-muted/20">
                    <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    {formData.logo ? (
                      <img src={formData.logo} className="h-full w-full object-contain p-4" alt="logo" />
                    ) : (
                      <div className="text-center space-y-2">
                        <Check className="w-8 h-8 mx-auto opacity-20" />
                        <span className="text-[9px] font-black uppercase opacity-40">Pick Logo</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid gap-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Business Photo</Label>
                  <div className="relative h-40 w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center bg-muted/10 overflow-hidden cursor-pointer hover:bg-muted/20">
                    <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'coverPhoto')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    {formData.coverPhoto ? (
                      <img src={formData.coverPhoto} className="h-full w-full object-cover" alt="cover" />
                    ) : (
                      <div className="text-center space-y-2">
                        <LayoutGrid className="w-8 h-8 mx-auto opacity-20" />
                        <span className="text-[9px] font-black uppercase opacity-40">Pick Photo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Map Your Spot</h4>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Move pin to your exact door</p>
                  </div>
                  <Button 
                    onClick={handleAutoLocation} 
                    disabled={isLocating}
                    variant="outline"
                    className="h-10 border-2 font-black uppercase text-[9px] px-4 rounded-xl"
                  >
                    {isLocating ? <Loader2 className="animate-spin w-3 h-3" /> : <><Navigation className="w-3 h-3 mr-2" /> Find Me</>}
                  </Button>
                </div>
                
                <div className="h-[300px] w-full border-2 rounded-2xl overflow-hidden">
                  <LocationPickerMap 
                    lat={formData.latitude} 
                    lng={formData.longitude} 
                    onChange={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))} 
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setActiveTab(2)} className="h-14 px-8 font-black uppercase text-xs rounded-xl border-2">Back</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 h-14 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-black">
                  {isSubmitting ? <Loader2 className="animate-spin w-6 h-6" /> : "Finish & Register"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
