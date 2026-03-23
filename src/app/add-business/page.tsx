
"use client";

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, where, getDocs } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Search, CheckCircle2, ImageIcon } from 'lucide-react';

const CATEGORIES = ["Food & Restaurants", "Health & Wellness", "Technology & IT", "Business & Professional", "Home & Lifestyle", "Education & Training", "Events & Entertainment", "Retail & Shops", "Services"];
const TOWNS = ["Douala", "Ngaoundéré"];

export default function AddBusinessPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [registryStep, setRegistryStep] = useState<'search' | 'form'>('search');
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState('');

  const [formData, setFormData] = useState({
    businessName: '', category: '', ceoName: '', employeeCount: '1-10', description: '',
    city: 'Douala', address: '', phoneNumber: '', whatsapp: '', email: '', website: '',
    logo: '', coverPhoto: '', latitude: 4.0511, longitude: 9.7679
  });

  const handleRegistryCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.businessName.length < 3) return;
    setIsChecking(true);
    setCheckError('');

    try {
      const q = query(collection(db!, 'businesses'), where('businessName', '==', formData.businessName));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        setCheckError("This name is already registered. Please choose another.");
      } else {
        setRegistryStep('form');
      }
    } catch (err) {
      setRegistryStep('form'); 
    } finally {
      setIsChecking(false);
    }
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'coverPhoto') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const finalize = () => {
    if (!user || !db) return;
    setIsSubmitting(true);
    const bizId = doc(collection(db, 'businesses')).id;
    const data = { 
      ...formData, 
      id: bizId, 
      name: formData.businessName, 
      ownerId: user.uid, 
      averageRating: 0, 
      totalReviews: 0, 
      isVerified: false, 
      isActive: true, 
      createdDate: new Date().toISOString() 
    };
    setDocumentNonBlocking(doc(db, 'businesses', bizId), data, { merge: true });
    // Redirect with 'new=true' to trigger onboarding alert on detail page
    router.push(`/business/${bizId}?new=true`);
  };

  return (
    <div className="min-h-screen bg-white font-body pb-24">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-2xl space-y-10">
        <h1 className="text-3xl font-black uppercase text-black tracking-tight text-center">Add Business</h1>
        
        {registryStep === 'search' ? (
          <div className="space-y-8 bg-[#F9F9FB] p-10 rounded-2xl border border-[#E5E5E1]">
            <div className="space-y-2 text-center">
              <h2 className="text-lg font-black uppercase">Check Business Name</h2>
            </div>
            
            <form onSubmit={handleRegistryCheck} className="space-y-6">
              <div className="space-y-1">
                <div className="relative">
                  <Input 
                    required 
                    value={formData.businessName} 
                    onChange={e => setFormData({...formData, businessName: e.target.value})} 
                    className="h-14 border border-[#E5E5E1] rounded-xl font-bold pl-12" 
                    placeholder="Search name..."
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20" />
                </div>
              </div>

              {checkError && (
                <p className="text-[11px] font-bold text-red-600 text-center uppercase tracking-widest">{checkError}</p>
              )}

              <button disabled={isChecking} type="submit" className="w-full h-14 bg-black text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg">
                {isChecking ? <Loader2 className="animate-spin mx-auto" /> : "Check Availability"}
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }} className="space-y-8 bg-white p-10 rounded-2xl border border-[#E5E5E1] shadow-sm">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase">Available: {formData.businessName}</span>
            </div>

            <div className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase opacity-50">Category *</label>
                  <Select required value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                    <SelectTrigger className="h-12 border-[#E5E5E1] rounded-xl font-bold"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase opacity-50">Founder Name *</label>
                  <Input required value={formData.ceoName} onChange={e => setFormData({...formData, ceoName: e.target.value})} className="h-12 border-[#E5E5E1] rounded-xl font-bold" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-50">Worker Count</label>
                <Select value={formData.employeeCount} onValueChange={v => setFormData({...formData, employeeCount: v})}>
                  <SelectTrigger className="h-12 border-[#E5E5E1] rounded-xl font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent>{["1-10", "11-50", "51-200", "200+"].map(size => <SelectItem key={size} value={size}>{size} People</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-50">Description *</label>
                <Textarea required placeholder="Tell us what you do..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="min-h-[100px] border-[#E5E5E1] rounded-xl font-bold italic" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase opacity-50">City *</label>
                  <Select value={formData.city} onValueChange={v => setFormData({...formData, city: v})}>
                    <SelectTrigger className="h-12 border-[#E5E5E1] rounded-xl font-bold"><SelectValue placeholder="City" /></SelectTrigger>
                    <SelectContent>{TOWNS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase opacity-50">Street Address *</label>
                  <Input required placeholder="Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-12 border-[#E5E5E1] rounded-xl font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase opacity-50 flex items-center gap-2"><ImageIcon className="w-3 h-3" /> Logo Image</label>
                  <input type="file" accept="image/*" onChange={e => handleImage(e, 'logo')} className="text-[10px] block w-full" />
                  {formData.logo && <img src={formData.logo} className="h-20 w-20 object-contain border rounded-xl" alt="Logo" />}
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase opacity-50 flex items-center gap-2"><ImageIcon className="w-3 h-3" /> Background Photo</label>
                  <input type="file" accept="image/*" onChange={e => handleImage(e, 'coverPhoto')} className="text-[10px] block w-full" />
                  {formData.coverPhoto && <img src={formData.coverPhoto} className="h-20 w-full object-cover border rounded-xl" alt="Cover" />}
                </div>
              </div>
            </div>
            
            <button type="submit" className="w-full h-16 bg-black text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-primary transition-all shadow-xl mt-10">
              Save Business
            </button>
          </form>
        )}
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent hideClose className="sm:max-w-[400px] p-10 rounded-2xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase text-center">Post Now?</DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase opacity-40 text-center mt-2">Publishing {formData.businessName}</DialogDescription>
          </DialogHeader>
          <div className="py-10 text-center">
            <button onClick={finalize} disabled={isSubmitting} className="w-full h-16 bg-black text-white font-black uppercase text-xs rounded-xl shadow-xl hover:bg-primary transition-all">
              {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Confirm & Post"}
            </button>
            <button onClick={() => setShowConfirm(false)} className="mt-4 text-[10px] font-black uppercase opacity-30">Back</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
