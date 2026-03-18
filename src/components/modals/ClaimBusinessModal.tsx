
'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter,
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X } from 'lucide-react';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { cn } from '@/lib/utils';

interface ClaimBusinessModalProps {
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  businessId: string;
  businessName: string;
}

export function ClaimBusinessModal({ open, onOpenChange, businessId, businessName }: ClaimBusinessModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    role: 'owner',
    fullName: '',
    email: '',
    phone: '',
    nui: null as string | null,
    rccm: null as string | null,
    idScan: null as string | null
  });
  
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();

  const handleImageUpload = (field: 'nui' | 'rccm' | 'idScan', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleClaim = async () => {
    if (!user || !db) return;
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast({ title: "Fill all boxes" });
      return;
    }
    if (!formData.nui || !formData.rccm || !formData.idScan) {
      toast({ title: "Photos needed" });
      return;
    }

    setIsSubmitting(true);
    try {
      const claimId = doc(collection(db, 'verificationRequests')).id;
      setDocumentNonBlocking(doc(db, 'verificationRequests', claimId), {
        id: claimId,
        businessId,
        businessName,
        userId: user.uid,
        ...formData,
        status: 'pending',
        timestamp: new Date().toISOString()
      }, { merge: true });
      
      toast({ title: "Request Sent" });
      onOpenChange(false);
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "bg-white p-0 flex flex-col fixed overflow-hidden outline-none border-none shadow-2xl z-[1000]",
        "inset-0 w-full h-full max-w-none m-0 rounded-none sm:inset-auto sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:w-[450px] sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:border border-[#E5E5E1]"
      )}>
        <DialogHeader className="p-6 border-b border-[#E5E5E1] bg-[#F9F9FB]">
          <DialogTitle className="text-sm font-black uppercase text-secondary tracking-widest text-center">Claim Business</DialogTitle>
          <DialogDescription className="text-[9px] font-bold text-muted-foreground uppercase text-center mt-1">Show us your work papers</DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-8 bg-white overflow-y-auto custom-scrollbar flex-grow">
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">My Position</Label>
            <RadioGroup value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})} className="flex gap-8">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="owner" id="c-owner" />
                <Label htmlFor="c-owner" className="text-xs font-black cursor-pointer uppercase tracking-widest">THE BOSS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="employee" id="c-emp" />
                <Label htmlFor="c-emp" className="text-xs font-black cursor-pointer uppercase tracking-widest">WORKER</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-5">
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase">Full Name</Label>
              <Input placeholder="First & Last Name" className="border-none bg-muted/20 h-11 font-bold text-sm" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase">Work Email</Label>
              <Input placeholder="me@work.cm" className="border-none bg-muted/20 h-11 font-bold text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase">Work Phone</Label>
              <Input placeholder="+237 ..." className="border-none bg-muted/20 h-11 font-bold text-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-[#E5E5E1]">
            <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Work Papers (Photos)</Label>
            <div className="grid gap-6">
              {[
                { id: 'nui', label: "Tax Paper (NUI)" },
                { id: 'rccm', label: "Work Paper (RCCM)" },
                { id: 'idScan', label: "My ID Card" }
              ].map(docItem => (
                <div key={docItem.id} className="grid gap-2">
                  <Label className="text-[9px] font-black uppercase">{docItem.label}</Label>
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(docItem.id as any, e)} className="text-[10px]" />
                  {(formData as any)[docItem.id] && (
                    <img src={(formData as any)[docItem.id]} className="h-16 rounded-xl border border-[#E5E5E1] mt-1" alt="preview" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 border-t border-[#E5E5E1] bg-[#F9F9FB] shrink-0">
          <Button 
            onClick={handleClaim} 
            disabled={isSubmitting} 
            className="w-full h-14 bg-secondary text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Claim Business"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
