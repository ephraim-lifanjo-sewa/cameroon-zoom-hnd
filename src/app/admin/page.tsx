"use client";

import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { Navbar } from '@/components/layout/Navbar';
import { collection, query, limit, doc } from 'firebase/firestore';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageModal } from '@/components/modals/ImageModal';

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [activeView, setActiveView] = useState<'names' | 'businesses' | 'claims' | 'clean'>('names');
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const userDocRef = useMemoFirebase(() => (db && user) ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);

  // Only admin@gmail.com or profile.isAdmin === true
  const isAuthorized = useMemo(() => {
    if (isUserLoading || isProfileLoading) return null;
    return user?.email?.toLowerCase() === 'admin@gmail.com' || profile?.isAdmin === true;
  }, [user, profile, isUserLoading, isProfileLoading]);

  // Firestore queries
  const usersQuery = useMemoFirebase(() => isAuthorized ? query(collection(db!, 'users'), limit(100)) : null, [db, isAuthorized]);
  const bizQuery = useMemoFirebase(() => isAuthorized ? query(collection(db!, 'businesses'), limit(200)) : null, [db, isAuthorized]);
  const verifyQuery = useMemoFirebase(() => isAuthorized ? query(collection(db!, 'verificationRequests'), limit(50)) : null, [db, isAuthorized]);

  const { data: allUsers } = useCollection(usersQuery);
  const { data: allBiz } = useCollection(bizQuery);
  const { data: verifyRequests } = useCollection(verifyQuery);

  // Redirect unauthorized users
  useEffect(() => { 
    if (isAuthorized === false) router.push('/'); 
  }, [isAuthorized, router]);

  useEffect(() => setSelectedIds([]), [activeView]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (!db || selectedIds.length === 0) return;
    if (!confirm("Remove selected items?")) return;

    const collectionName = activeView === 'names' ? 'users' : activeView === 'businesses' ? 'businesses' : 'verificationRequests';

    try {
      for (const id of selectedIds) {
        await deleteDocumentNonBlocking(doc(db, collectionName, id));
      }
      toast({ title: "Removed items successfully" });
      setSelectedIds([]);
    } catch {
      toast({ title: "Failed to remove items", variant: "destructive" });
    }
  };

  // Approve verification claim
  const handleApproveClaim = async () => {
    if (!db || !selectedClaim) return;
    setIsProcessing(true);

    try {
      // Update business verification
      await updateDocumentNonBlocking(doc(db, 'businesses', selectedClaim.businessId), {
        isVerified: true,
        ownerId: selectedClaim.userId,
        verifiedAt: new Date().toISOString()
      });

      // Update claim status
      await updateDocumentNonBlocking(doc(db, 'verificationRequests', selectedClaim.id), {
        status: 'approved',
        processedAt: new Date().toISOString()
      });

      toast({ title: "Claim approved successfully" });
      setSelectedClaim(null);
    } catch {
      toast({ title: "Approval failed", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state
  if (isAuthorized === null) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
      <Loader2 className="animate-spin text-primary w-10 h-10" />
      <p className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Loading...</p>
    </div>
  );

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-white font-body text-secondary pb-24">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 border-b border-[#E5E5E1] pb-6">
          <h1 className="text-xl font-black uppercase tracking-tight">Admin Dashboard</h1>
          {selectedIds.length > 0 && (
            <Button onClick={handleBulkDelete} variant="destructive" className="h-10 px-6 rounded-xl font-black text-[10px] uppercase">
              Delete Selected
            </Button>
          )}
        </header>

        {/* Tabs */}
        <div className="flex gap-0 mb-8 border border-[#E5E5E1] rounded-xl overflow-hidden shadow-sm">
          {['names', 'businesses', 'claims', 'clean'].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view as any)}
              className={cn(
                "flex-1 h-12 text-[10px] font-black uppercase border-r border-[#E5E5E1] last:border-r-0 transition-all",
                activeView === view ? "bg-secondary text-white" : "hover:bg-muted bg-white"
              )}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>

        {/* Views */}
        <div className="border border-[#E5E5E1] overflow-hidden rounded-xl bg-white shadow-sm">

          {/* Users */}
          {activeView === 'names' && (
            <div className="p-6 space-y-4">
              {allUsers?.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 border border-[#E5E5E1] rounded-xl">
                  <div className="flex items-center gap-4">
                    <Checkbox checked={selectedIds.includes(u.id)} onCheckedChange={() => toggleSelect(u.id)} />
                    <div>
                      <p className="font-bold uppercase text-xs">{u.fullName}</p>
                      <p className="text-[10px] opacity-50">{u.email}</p>
                    </div>
                  </div>
                  <button onClick={async () => {
                    try {
                      await deleteDocumentNonBlocking(doc(db!, 'users', u.id));
                      toast({ title: "User removed" });
                    } catch {
                      toast({ title: "Failed to remove user", variant: "destructive" });
                    }
                  }} className="text-red-600 font-black uppercase text-[9px] hover:underline">Remove</button>
                </div>
              ))}
            </div>
          )}

          {/* Businesses */}
          {activeView === 'businesses' && (
            <div className="p-6 space-y-4">
              {allBiz?.map(b => (
                <div key={b.id} className="flex items-center justify-between p-4 border border-[#E5E5E1] rounded-xl">
                  <div className="flex items-center gap-4">
                    <Checkbox checked={selectedIds.includes(b.id)} onCheckedChange={() => toggleSelect(b.id)} />
                    <div>
                      <p className="font-bold uppercase text-xs">{b.businessName || b.name}</p>
                      <p className="text-[10px] opacity-50 uppercase">{b.city}</p>
                    </div>
                  </div>
                  <button onClick={async () => {
                    try {
                      await deleteDocumentNonBlocking(doc(db!, 'businesses', b.id));
                      toast({ title: "Business removed" });
                    } catch {
                      toast({ title: "Failed to remove business", variant: "destructive" });
                    }
                  }} className="text-red-600 font-black uppercase text-[9px] hover:underline">Remove</button>
                </div>
              ))}
            </div>
          )}

          {/* Verification Claims */}
          {activeView === 'claims' && (
            <div className="p-6 space-y-4">
              {verifyRequests?.map(r => (
                <div key={r.id} className={cn(
                  "flex items-center justify-between p-4 border rounded-xl transition-all",
                  r.status === 'approved' ? "bg-green-50" : "border-[#E5E5E1]"
                )}>
                  <div className="flex items-center gap-4">
                    <Checkbox checked={selectedIds.includes(r.id)} onCheckedChange={() => toggleSelect(r.id)} />
                    <div>
                      <p className="font-bold uppercase text-xs">{r.businessName}</p>
                      <span className="text-[10px] opacity-50 uppercase">{r.fullName}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedClaim(r)} className="bg-secondary text-white px-4 py-2 rounded-xl font-black uppercase text-[8px] tracking-widest">Review</button>
                </div>
              ))}
            </div>
          )}

          {/* Maintenance */}
          {activeView === 'clean' && (
            <div className="p-12 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Button onClick={() => alert("Database seeding started.")} className="h-16 bg-secondary text-white font-black uppercase text-[10px] rounded-xl shadow-lg">
                  Seed Records
                </Button>
                <Button onClick={() => alert("Records wiped.")} className="h-16 bg-white text-red-600 border border-red-600 font-black uppercase text-[10px] rounded-xl hover:bg-red-50 transition-colors">
                  Wipe All
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Claim Review Dialog */}
      <Dialog open={!!selectedClaim} onOpenChange={(o) => !o && setSelectedClaim(null)}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border border-[#E5E5E1] rounded-2xl" aria-describedby="claim-review-description">
          <DialogHeader className="sr-only">
            <DialogTitle>Claim Review</DialogTitle>
            <DialogDescription id="claim-review-description">Reviewing verification documents.</DialogDescription>
          </DialogHeader>

          {selectedClaim && (
            <>
              <div className="p-8 space-y-8 bg-white max-h-[70vh] overflow-y-auto">
                <h2 className="text-lg font-black uppercase">Review Claim</h2>
                <div className="grid grid-cols-2 gap-6 text-[11px] font-bold">
                  <div><p className="opacity-50 uppercase text-[9px]">Business</p><p>{selectedClaim.businessName}</p></div>
                  <div><p className="opacity-50 uppercase text-[9px]">Applicant</p><p>{selectedClaim.fullName}</p></div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-primary">Supporting Files</h4>
                  <div className="grid gap-2">
                    {['nui', 'rccm', 'idScan'].map(key => (
                      <div key={key} className="p-4 border border-[#E5E5E1] rounded-xl flex justify-between items-center bg-muted/10">
                        <span className="text-[10px] font-black uppercase">{key.toUpperCase()} File</span>
                        {selectedClaim[key] && (
                          <button onClick={() => setPreviewImg(selectedClaim[key])} className="text-primary font-black uppercase text-[9px] hover:underline flex items-center gap-1"><Eye className="w-3 h-3" /> View</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-muted/5 border-t flex gap-4">
                {selectedClaim.status !== 'approved' && (
                  <Button onClick={handleApproveClaim} disabled={isProcessing} className="flex-1 bg-green-600 text-white font-black uppercase text-[10px] h-14 rounded-xl shadow-lg">Approve</Button>
                )}
                <Button onClick={() => setSelectedClaim(null)} variant="outline" className="flex-1 border-2 font-black uppercase text-[10px] h-14 rounded-xl">Cancel</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ImageModal open={!!previewImg} onOpenChange={(o) => !o && setPreviewImg(null)} src={previewImg} />
    </div>
  );
}