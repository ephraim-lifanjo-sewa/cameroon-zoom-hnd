'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, X } from 'lucide-react';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { BusinessService } from '@/app/lib/types';
import { cn } from '@/lib/utils';

interface ServiceManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  existingServices: BusinessService[];
  category: string;
}

/**
 * ULTRA SIMPLE SERVICE MANAGEMENT
 * No complex grids, just a vertical list of simple inputs.
 */
export function ServiceManagementModal({ open, onOpenChange, businessId, existingServices, category }: ServiceManagementModalProps) {
  const [services, setServices] = useState<BusinessService[]>(existingServices || []);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const db = useFirestore();

  const label = category === 'Food & Hospitality' ? 'Menu' : 'Services';

  const addService = () => {
    const newService: BusinessService = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      price: '',
      description: '',
      image: '',
      link: ''
    };
    setServices([...services, newService]);
  };

  const removeService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const updateService = (id: string, field: keyof BusinessService, value: string) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => updateService(id, 'image', reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!db) return;
    setIsUpdating(true);
    try {
      updateDocumentNonBlocking(doc(db, 'businesses', businessId), {
        services: services,
        updatedAt: new Date().toISOString()
      });
      toast({ title: "Updated!" });
      onOpenChange(false);
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white p-0 flex flex-col sm:max-w-[500px] sm:max-h-[85vh] overflow-hidden border border-[#E5E5E1] rounded-2xl">
        <DialogHeader className="p-6 border-b border-[#E5E5E1] bg-[#F9F9FB]">
          <DialogTitle className="text-sm font-black uppercase text-secondary tracking-widest text-center">Modify {label}</DialogTitle>
          <DialogDescription className="text-[9px] font-bold text-muted-foreground uppercase text-center mt-1">List your items and prices</DialogDescription>
        </DialogHeader>

        <div className="flex-grow p-6 overflow-y-auto custom-scrollbar space-y-10 bg-white">
          {services.map((service) => (
            <div key={service.id} className="space-y-4 pb-10 border-b border-[#E5E5E1] last:border-0 last:pb-0 relative">
              <button 
                onClick={() => removeService(service.id)}
                className="absolute -top-2 -right-2 text-muted-foreground hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Photo</Label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(service.id, e)} className="text-[10px] w-full" />
                  {service.image && <img src={service.image} className="h-20 rounded-xl border border-[#E5E5E1] mt-2" alt="preview" />}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Name</Label>
                    <Input placeholder="Item name" className="h-11 border-none bg-muted/20 font-bold" value={service.name} onChange={(e) => updateService(service.id, 'name', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Price (FCFA)</Label>
                    <Input placeholder="5000" className="h-11 border-none bg-muted/20 font-bold" value={service.price} onChange={(e) => updateService(service.id, 'price', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Description</Label>
                  <Textarea placeholder="Details..." className="min-h-[80px] border-none bg-muted/20 font-bold italic" value={service.description} onChange={(e) => updateService(service.id, 'description', e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Link (Optional)</Label>
                  <Input placeholder="https://..." className="h-11 border-none bg-muted/20 font-bold" value={service.link} onChange={(e) => updateService(service.id, 'link', e.target.value)} />
                </div>
              </div>
            </div>
          ))}

          <Button 
            onClick={addService} 
            variant="outline" 
            className="w-full h-14 border border-[#E5E5E1] rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-muted"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </div>

        <DialogFooter className="p-6 border-t border-[#E5E5E1] bg-[#F9F9FB]">
          <Button 
            onClick={handleSave} 
            disabled={isUpdating} 
            className="w-full h-14 bg-secondary text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg"
          >
            {isUpdating ? <Loader2 className="animate-spin" /> : "Save All"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
