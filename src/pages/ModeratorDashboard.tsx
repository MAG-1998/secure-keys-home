import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CheckCircle, XCircle, Clock, Users, Home, Eye, LogOut } from "lucide-react";

interface PropertyApplication {
  id: string;
  property_type: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  description: string;
  visit_hours: any;
  virtual_tour: boolean;
  status: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  user_type: string;
  created_at: string;
}

export default function ModeratorDashboard() {
  const [applications, setApplications] = useState<PropertyApplication[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [moderatorNotes, setModeratorNotes] = useState<{ [key: string]: string }>({});
  const [halalRequests, setHalalRequests] = useState<any[]>([]);
  const [halalModeratorNotes, setHalalModeratorNotes] = useState<Record<string, string>>({});
  const [halalAttachments, setHalalAttachments] = useState<Record<string, string[]>>({});
  const [halalNewAttachment, setHalalNewAttachment] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        await supabase.auth.signOut({ scope: 'local' });
        navigate('/');
        toast({ title: "Signed out successfully", description: "You have been logged out." });
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        const msg = (error as any).message?.toLowerCase?.() || '';
        if (msg.includes('session') && msg.includes('missing')) {
          await supabase.auth.signOut({ scope: 'local' });
        } else {
          throw error;
        }
      }

      navigate('/');
      toast({ title: "Signed out successfully", description: "You have been logged out." });
    } catch (error) {
      try { await supabase.auth.signOut({ scope: 'local' }); } catch {}
      navigate('/');
      toast({ title: "Signed out", description: "You have been logged out." });
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchUsers();
    fetchHalalRequests();
  }, []);

  // Realtime updates for applications, users, and halal requests
  useEffect(() => {
    const channel = supabase
      .channel('moderator-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
        fetchApplications();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'halal_financing_requests' }, () => {
        fetchHalalRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const fetchApplications = async () => {
    try {
      // First fetch property applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('properties')
        .select('*')
        .in('status', ['pending', 'approved', 'rejected'])
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;

      // Then fetch user profiles for each application
      const applicationsWithProfiles = await Promise.all(
        (applicationsData || []).map(async (application) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', application.user_id)
            .single();

          return {
            ...application,
            address: application.location, // Map location to address for compatibility
            profiles: profileData
          };
        })
      );

      setApplications(applicationsWithProfiles as any);
      console.log('Fetched applications with profiles:', applicationsWithProfiles);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch property applications",
        variant: "destructive",
      });
    }
  };

  const fetchHalalRequests = async () => {
    try {
      const { data: requests, error } = await supabase
        .from('halal_financing_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const propertyIds = (requests || []).map((r: any) => r.property_id).filter(Boolean);
      const userIds = (requests || []).map((r: any) => r.user_id).filter(Boolean);

      const propertiesById: Record<string, any> = {};
      if (propertyIds.length > 0) {
        const { data: propsData } = await supabase
          .from('properties')
          .select('id, title')
          .in('id', propertyIds);
        (propsData || []).forEach((p: any) => { propertiesById[p.id] = p; });
      }

      const profilesByUserId: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profsData } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);
        (profsData || []).forEach((pr: any) => { profilesByUserId[pr.user_id] = pr; });
      }

      const merged = (requests || []).map((r: any) => ({
        ...r,
        property: propertiesById[r.property_id],
        requester: profilesByUserId[r.user_id],
      }));

      setHalalRequests(merged);
    } catch (error) {
      console.error('Error fetching halal requests:', error);
      toast({ title: 'Error', description: 'Failed to fetch halal financing requests', variant: 'destructive' });
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationReview = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      // Update application status
      const { error: appError } = await supabase
        .from('properties')
        .update({
          status: status === 'approved' ? 'active' : status,
          moderator_notes: moderatorNotes[applicationId] || '',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', applicationId);

      if (appError) throw appError;

      toast({
        title: "Success",
        description: `Application ${status} successfully`,
      });

      fetchApplications();
    } catch (error) {
      console.error('Error reviewing application:', error);
      toast({
        title: "Error",
        description: "Failed to review application",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="min-h-screen bg-background">
            <header className="h-16 flex items-center border-b px-4">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-xl font-semibold">Moderator Dashboard</h1>
              <div className="ml-auto">
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </header>
            <main className="container mx-auto px-4 py-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold">Moderator Dashboard</h1>
                <p className="text-muted-foreground">Review property applications and manage users</p>
              </div>

      <Tabs defaultValue="applications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Property Applications
          </TabsTrigger>
          <TabsTrigger value="halal" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Halal Financing
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-6">
          <div className="grid gap-6">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      {application.property_type} - ${application.price.toLocaleString()}
                    </CardTitle>
                    {getStatusBadge(application.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Submitted by {application.profiles?.full_name} ({application.profiles?.email})
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p><strong>Address:</strong> {application.address}</p>
                      <p><strong>Bedrooms:</strong> {application.bedrooms}</p>
                      <p><strong>Bathrooms:</strong> {application.bathrooms}</p>
                      <p><strong>Area:</strong> {application.area} m²</p>
                    </div>
                    <div>
                      <p><strong>Virtual Tour:</strong> {application.virtual_tour ? 'Yes' : 'No'}</p>
                      <p><strong>Visit Hours:</strong> {application.visit_hours?.join(', ') || 'None specified'}</p>
                      <p><strong>Submitted:</strong> {new Date(application.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {application.description && (
                    <div>
                      <strong>Description:</strong>
                      <p className="mt-1 text-sm">{application.description}</p>
                    </div>
                  )}

                  {application.status === 'pending' && (
                    <div className="space-y-3 pt-4 border-t">
                      <Textarea
                        placeholder="Add moderator notes (optional)"
                        value={moderatorNotes[application.id] || ''}
                        onChange={(e) => setModeratorNotes(prev => ({
                          ...prev,
                          [application.id]: e.target.value
                        }))}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApplicationReview(application.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleApplicationReview(application.id, 'rejected')}
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="halal" className="space-y-6">
          <div className="grid gap-6">
            {halalRequests.map((req) => (
              <Card key={req.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      {req.property?.title || 'Property'}
                    </CardTitle>
                    <Badge variant={req.status === 'pending' ? 'secondary' : req.status === 'approved' ? 'default' : 'destructive'}>
                      {req.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Request by {req.requester?.full_name} ({req.requester?.email})
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {req.admin_notes && (
                    <p className="text-sm"><strong>Admin Notes:</strong> {req.admin_notes}</p>
                  )}
                  <div className="space-y-3 pt-4 border-t">
                    <Textarea
                      placeholder="Add moderator comments for admin"
                      value={halalModeratorNotes[req.id] ?? req.moderator_notes ?? ''}
                      onChange={(e) => setHalalModeratorNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                    />
                    <div>
                      <label className="text-sm font-medium">Attach document URL</label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          placeholder="https://..."
                          value={halalNewAttachment[req.id] ?? ''}
                          onChange={(e) => setHalalNewAttachment(prev => ({ ...prev, [req.id]: e.target.value }))}
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            const url = (halalNewAttachment[req.id] || '').trim();
                            if (!url) return;
                            setHalalAttachments(prev => ({
                              ...prev,
                              [req.id]: [ ...(prev[req.id] ?? req.attachments ?? []), url ]
                            }));
                            setHalalNewAttachment(prev => ({ ...prev, [req.id]: '' }));
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                    {(halalAttachments[req.id] ?? req.attachments ?? []).length > 0 && (
                      <div className="text-sm">
                        <strong>Attachments:</strong>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          {(halalAttachments[req.id] ?? req.attachments ?? []).map((a: string, idx: number) => (
                            <li key={idx}><a href={a} target="_blank" rel="noreferrer" className="underline">{a}</a></li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <Button
                        onClick={async () => {
                          const { error } = await supabase
                            .from('halal_financing_requests')
                            .update({
                              moderator_notes: halalModeratorNotes[req.id] ?? req.moderator_notes ?? '',
                              attachments: halalAttachments[req.id] ?? req.attachments ?? [],
                            })
                            .eq('id', req.id);
                          if (error) {
                            toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
                          } else {
                            toast({ title: 'Saved', description: 'Updates saved' });
                            setHalalModeratorNotes(prev => ({ ...prev, [req.id]: '' }));
                            fetchHalalRequests();
                          }
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-6">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{user.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-sm">{user.phone}</p>
                      <p className="text-sm">Type: {user.user_type}</p>
                      <p className="text-sm">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
              </TabsContent>
            </Tabs>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}