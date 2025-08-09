import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, ExternalLink } from "lucide-react";
import { MagitLogo } from "@/components/MagitLogo";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface VisitRequest {
  id: string;
  property_id: string;
  status: string | null;
  visit_date: string;
  created_at: string;
  properties?: {
    id: string;
    title: string;
    location: string;
    image_url: string | null;
    price: number | null;
  } | null;
}

const MyRequests = () => {
  const [requests, setRequests] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "My Requests • Magit";
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase
          .from('property_visits')
          .select(`
            *,
            properties:property_id (
              id, title, location, image_url, price
            )
          `)
          .eq('visitor_id', user.id)
          .in('status', ['pending', 'confirmed'])
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRequests((data as VisitRequest[]) || []);
      } catch (error) {
        console.error('Error fetching requests:', error);
        toast({ title: 'Error', description: 'Failed to load requests', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [navigate, toast]);

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <MagitLogo size="lg" />
          <p className="text-muted-foreground mt-4">Loading your requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div onClick={() => navigate('/')} className="cursor-pointer">
                <MagitLogo size="md" />
              </div>
              <h1 className="font-heading font-bold text-xl text-foreground">My Visit Requests</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>Browse</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {requests.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="font-heading font-bold text-2xl text-foreground mb-4">No Active Requests</h2>
            <p className="text-muted-foreground mb-8">You have no pending or confirmed visit requests yet.</p>
            <Button onClick={() => navigate('/')}>Find Properties</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {requests.map((req) => (
              <Card key={req.id} className="bg-background/80 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
                <div className="relative">
                  <img
                    src={req.properties?.image_url || '/placeholder.svg'}
                    alt={req.properties?.title || 'Property'}
                    className="w-full h-48 object-cover rounded-t-lg"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-foreground mb-1">
                        {req.properties?.title || 'Property'}
                      </h3>
                      {req.properties?.location && (
                        <div className="flex items-center text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{req.properties.location}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant={req.status === 'confirmed' ? 'success' : 'secondary'}>
                      {req.status || 'pending'}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDateTime(req.visit_date)}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="ghost" onClick={() => navigate(`/property/${req.property_id}`)}>
                      View Property <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyRequests;
