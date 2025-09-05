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
import { forceLocalSignOut } from "@/lib/auth";

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
  const [reports, setReports] = useState<any[]>([]);
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
    fetchReports();
  }, []);

  // Realtime updates for applications, users, halal requests, and reports
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_reports' }, () => {
        fetchReports();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const fetchApplications = async () => {
    try {
      // Only fetch pending applications so approved/rejected disappear from list
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'pending')
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
      console.log(`Reviewing application ${applicationId} with status: ${status}`);
      
      const updateData: any = {
        status: status === 'approved' ? 'active' : status,
        moderator_notes: moderatorNotes[applicationId] || '',
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user?.id
      };

      // For rejected applications, ensure halal financing fields are properly set
      if (status === 'rejected') {
        updateData.halal_status = 'denied';
        updateData.is_halal_available = false;
      }

      console.log('Update data:', updateData);

      const { error: appError } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', applicationId);

      if (appError) {
        console.error('Supabase error:', appError);
        throw appError;
      }

      toast({
        title: "Success",
        description: `Application ${status} successfully`,
      });

      // Refresh the applications list
      fetchApplications();
    } catch (error) {
      console.error('Error reviewing application:', error);
      toast({
        title: "Error",
        description: `Failed to ${status} application: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Reports fetching and actions
  const fetchReports = async () => {
    try {
      const { data: reps, error } = await supabase
        .from('user_reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const userIds = Array.from(new Set((reps || []).flatMap((r: any) => [r.reporter_id, r.reported_user_id])));
      let profilesById: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('user_id, full_name, email, phone')
          .in('user_id', userIds);
        (profs || []).forEach((p: any) => { profilesById[p.user_id] = p; });
      }

      const merged = (reps || []).map((r: any) => ({
        ...r,
        reporterProfile: profilesById[r.reporter_id],
        reportedProfile: profilesById[r.reported_user_id],
      }));
      setReports(merged);
    } catch (e) {
      console.error('Error fetching reports', e);
    }
  };

  const handleReportDecision = async (report: any, decision: 'ban' | 'dismiss') => {
    try {
      if (decision === 'ban') {
        const email = report.reportedProfile?.email || null;
        const phone = report.reportedProfile?.phone || null;
        // Insert into red list, ignore conflict errors
        const { error: redErr } = await supabase.from('red_list').insert({ email, phone, reason: report.reason, banned_by: (await supabase.auth.getUser()).data.user?.id });
        if (redErr && !(redErr as any).message?.toLowerCase?.().includes('duplicate')) throw redErr;
      }

      const { error: updErr } = await supabase
        .from('user_reports')
        .update({ status: 'reviewed', decision, reviewed_by: (await supabase.auth.getUser()).data.user?.id, reviewed_at: new Date().toISOString() })
        .eq('id', report.id);
      if (updErr) throw updErr;

      toast({ title: 'Saved', description: decision === 'ban' ? 'User banned and report closed' : 'Report dismissed' });
      fetchReports();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to update report', variant: 'destructive' });
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Property Applications
          </TabsTrigger>
          <TabsTrigger value="financing" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Financing Requests
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Reports ({reports.length})
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


        <TabsContent value="financing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Financing Requests Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Manage financing requests, review documents, and handle approval processes.
              </p>
              <Button 
                onClick={() => navigate('/admin/financing')}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Open Financing Dashboard
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-6">
            {reports.length === 0 && (
              <Card><CardContent className="p-6 text-center text-muted-foreground">No reports</CardContent></Card>
            )}
            {reports.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <strong>Reported:</strong>
                        <span>{r.reportedProfile?.full_name || r.reportedProfile?.email || r.reported_user_id}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">By: {r.reporterProfile?.full_name || r.reporterProfile?.email}</div>
                      <div className="text-sm mt-2"><strong>Reason:</strong> {r.reason}</div>
                      <div className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2">
                      {r.status === 'pending' ? (
                        <>
                          <Button size="sm" variant="destructive" onClick={() => handleReportDecision(r, 'ban')}>Ban User</Button>
                          <Button size="sm" variant="outline" onClick={() => handleReportDecision(r, 'dismiss')}>Dismiss</Button>
                        </>
                      ) : (
                        <Badge variant="secondary">Reviewed{r.decision ? `: ${r.decision}` : ''}</Badge>
                      )}
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