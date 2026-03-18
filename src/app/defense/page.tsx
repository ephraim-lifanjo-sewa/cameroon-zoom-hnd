
"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare,
  Layers,
  UserCheck,
  CheckCircle,
  Zap,
  Rocket
} from 'lucide-react';

/**
 * DEFENSE PAGE
 * Explained in simple English for absolute clarity.
 */
export default function DefensePage() {
  return (
    <div className="min-h-screen bg-white font-body text-secondary">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="mb-14 space-y-4 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-primary">How this app works</h1>
          <p className="text-muted-foreground font-black uppercase text-[11px] tracking-[0.35em]">A simple plan for trust in Cameroon</p>
        </div>

        <Tabs defaultValue="story" className="space-y-10">
          <TabsList className="bg-[#F7F7F7] border-2 p-1.5 h-16 rounded-[8px] w-full shadow-sm overflow-x-auto justify-start hide-scrollbar">
            <TabsTrigger value="story" className="px-10 rounded-[6px] font-black text-[11px] uppercase tracking-widest h-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <MessageSquare className="w-4 h-4 mr-3" /> The Plan
            </TabsTrigger>
            <TabsTrigger value="steps" className="px-10 rounded-[6px] font-black text-[11px] uppercase tracking-widest h-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Zap className="w-4 h-4 mr-3" /> 7-Step Guide
            </TabsTrigger>
            <TabsTrigger value="uml" className="px-10 rounded-[6px] font-black text-[11px] uppercase tracking-widest h-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Layers className="w-4 h-4 mr-3" /> Info Structure
            </TabsTrigger>
          </TabsList>

          <TabsContent value="story" className="space-y-12">
            <Card className="border-2 rounded-xl shadow-xl overflow-hidden">
              <CardHeader className="bg-secondary p-8 text-white">
                <CardTitle className="text-2xl font-black uppercase">From Asking to Trusting</CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="bg-primary/5 p-8 rounded-md border-l-4 border-primary">
                  <p className="text-xl font-bold italic leading-relaxed text-secondary">
                    "In the past, you had to ask friends to find a good worker. Now, you can trust reviews from everyone in our app."
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-black uppercase text-sm tracking-widest text-primary">The Goal</h3>
                    <p className="text-sm font-medium leading-relaxed">
                      We want to help you find the best places using honest talk from real people. Verified badges show you who is real.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-black uppercase text-sm tracking-widest text-primary">Trust Badges</h3>
                    <p className="text-sm font-medium leading-relaxed">
                      When a business shows us their work papers, we give them a badge. This keeps fake people away from our app.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="steps" className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "1. The Vision", info: "A community where we help each other decide." },
                { title: "2. Clean Design", info: "Easy to look at, easy to use on any phone." },
                { title: "3. Fast Search", info: "Find anything near you in one second." },
                { title: "4. Real Photos", info: "Users and owners upload real pictures." },
                { title: "5. Badges", info: "Giving trust badges to real, checked workers." },
                { title: "6. Quality Check", info: "Testing everything to make sure it's safe and fast." },
                { title: "7. Soft Launch", info: "Starting small, listening to you, and getting better." }
              ].map((step, i) => (
                <div key={i} className="p-6 border-2 rounded-xl bg-white shadow-sm hover:border-primary transition-colors">
                  <h4 className="font-black text-xs uppercase text-primary mb-2">{step.title}</h4>
                  <p className="text-xs font-bold leading-relaxed">{step.info}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="uml" className="space-y-16">
            <section className="space-y-8">
              <div className="border-l-4 border-primary pl-6">
                <h2 className="text-2xl font-black uppercase tracking-tight">How we save info</h2>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Simple Data Map</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: "People", props: ["id", "name", "city", "photo"] },
                  { title: "Work Types", props: ["id", "name", "info"] },
                  { title: "Towns", props: ["id", "name", "area"] },
                  { title: "Places", props: ["id", "name", "rating", "badge"] }
                ].map((item, i) => (
                  <Card key={i} className="border-2 shadow-sm">
                    <CardHeader className="p-6 bg-muted/20 border-b"><h4 className="font-black text-[10px] uppercase text-primary">{item.title}</h4></CardHeader>
                    <CardContent className="p-6 space-y-2 text-[12px] font-bold italic">
                      {item.props.map((p, j) => <p key={j}>• {p}</p>)}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
