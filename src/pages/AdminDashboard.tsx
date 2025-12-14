import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Shield, Users, Home, Settings, UserCheck, UserX, LogOut, Banknote } from "lucide-react";
import SecurityAuditPanel from "@/components/SecurityAuditPanel";
import { forceLocalSignOut } from "@/lib/auth";
import DistrictReviewPanel from "@/components/admin/DistrictReviewPanel";
import { useTranslation } from "@/hooks/useTranslation";

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  account_type: string;
  role: 'user' | 'moderator' | 'admin';
  created_at: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [halalRequests, setHalalRequests] = useState<any[]>([]);
  const [halalEdits, setHalalEdits] = useState<Record<string, { status?: string; admin_notes?: string }>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useUser();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        await forceLocalSignOut();
        navigate('/');
        toast({ title: "Signed out successfully", description: "You have been logged out." });
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        const msg = (error as any).message?.toLowerCase?.() || '';
        if (msg.includes('session') && msg.includes('missing')) {
          await forceLocalSignOut();
        } else {
          throw error;
        }
      }

      await forceLocalSignOut();
      navigate('/');
      toast({ title: t('common.signedOut'), description: t('common.loggedOut') });
    } catch (error) {
      await forceLocalSignOut();
      navigate('/');
      toast({ title: t('common.signedOut'), description: t('common.loggedOut') });
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Realtime updates: refresh when profiles or properties change
  useEffect(() => {
    const channel = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
        fetchProperties();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'halal_financing_requests' }, () => {
        fetchHalalRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchUsers(),
      fetchProperties(),
      fetchHalalRequests()
    ]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      setUsers(profilesData || []);
      console.log('Fetched users with roles:', profilesData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: t('common.error'),
        description: t('admin.dashboard.users.fetchFailed'),
        variant: "destructive",
      });
    }
  };

  const fetchProperties = async () => {
    try {
      // Fetch all properties (including applications which are now unified)
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;

      // Batch fetch profiles for all property owners
      const userIds = (propertiesData || []).map(p => p.user_id).filter(Boolean);
      const profilesByUserId: Record<string, any> = {};

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);

        (profilesData || []).forEach((profile: any) => {
          profilesByUserId[profile.user_id] = profile;
        });
      }

      // Attach profiles to properties
      const propertiesWithOwners = (propertiesData || []).map(property => ({
        ...property,
        profiles: profilesByUserId[property.user_id]
      }));

      // Separate properties and applications based on status
      const activeProperties = propertiesWithOwners.filter(p =>
        ['active', 'suspended'].includes(p.status)
      );
      const applicationData = propertiesWithOwners.filter(p =>
        ['pending', 'approved', 'rejected'].includes(p.status)
      );

      setProperties(activeProperties);
      setApplications(applicationData);
      console.log('Fetched properties:', activeProperties);
      console.log('Fetched applications:', applicationData);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: t('common.error'),
        description: t('admin.dashboard.properties.fetchFailed'),
        variant: "destructive",
      });
    }
  };

  // Fetch both financing requests and halal listing requests
  const fetchHalalRequests = async () => {
    try {
      // Fetch buyer financing requests
      const { data: financingRequests, error: financingError } = await supabase
        .from('halal_financing_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (financingError) throw financingError;

      // Fetch halal listing requests (properties requesting halal approval)
      const { data: halalListingRequests, error: listingError } = await supabase
        .from('properties')
        .select('*')
        .eq('halal_status', 'pending_approval')
        .order('created_at', { ascending: false });

      if (listingError) throw listingError;

      // Process financing requests
      const propertyIds = (financingRequests || []).map((r: any) => r.property_id).filter(Boolean);
      const userIds = [...(financingRequests || []).map((r: any) => r.user_id), ...(halalListingRequests || []).map((p: any) => p.user_id)].filter(Boolean);

      const propertiesById: Record<string, any> = {};
      if (propertyIds.length > 0) {
        const { data: propsData } = await supabase
          .from('properties')
          .select('id, title, image_url, photos, is_halal_available, halal_status, user_id')
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

      const mergedFinancingRequests = (financingRequests || []).map((r: any) => ({
        ...r,
        type: 'financing_request',
        property: propertiesById[r.property_id],
        requester: profilesByUserId[r.user_id]
      }));

      const mergedListingRequests = (halalListingRequests || []).map((p: any) => ({
        id: p.id,
        type: 'listing_request',
        property: p,
        requester: profilesByUserId[p.user_id],
        created_at: p.created_at,
        status: p.halal_status
      }));

      // Combine both types
      const allRequests = [...mergedFinancingRequests, ...mergedListingRequests]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setHalalRequests(allRequests);
    } catch (error) {
      console.error('Error fetching halal requests:', error);
      toast({
        title: t('common.error'),
        description: t('admin.dashboard.applications.fetchFailed'),
        variant: "destructive",
      });
    }
  };

  const handleApplicationDelete = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: t('common.success'), 
        description: t('admin.dashboard.applications.deleted'),
      });

      // Refresh data
      await fetchProperties();
    } catch (error) {
      console.error('Error deleting application:', error);
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Prevent self-role modification
      if (userId === user?.id) {
        toast({
          title: t('common.error'),
          description: t('admin.dashboard.users.cannotModifySelf'),
          variant: "destructive",
        });
        return;
      }

      // Use the assign_role function
      const { error } = await supabase.rpc('assign_role', {
        target_user_id: userId,
        new_role: newRole as 'user' | 'moderator' | 'admin',
        changed_by_user_id: user?.id
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });

      // Refresh data
      await fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handlePropertyStatusChange = async (propertyId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: newStatus })
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: "Success", 
        description: `Property ${newStatus} successfully`,
      });

      // Refresh data
      await fetchProperties();
    } catch (error) {
      console.error('Error updating property status:', error);
      toast({
        title: "Error",
        description: "Failed to update property status",
        variant: "destructive",
      });
    }
  };

  const assignRole = async (userId: string, role: 'user' | 'moderator' | 'admin') => {
    try {
      console.log(`Assigning role ${role} to user ${userId}`);
      
      // Use the assign_role function
      const { error } = await supabase.rpc('assign_role', {
        target_user_id: userId,
        new_role: role,
        changed_by_user_id: user?.id
      });

      if (error) {
        console.error('Error assigning role:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: `Role ${role} assigned successfully`,
      });

      // Refresh data
      await fetchUsers();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: `Failed to assign role: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Prevent self-deletion
      if (userId === user?.id) {
        toast({
          title: "Error",
          description: "Cannot delete your own account",
          variant: "destructive",
        });
        return;
      }

      // Confirm deletion
      if (!confirm('Are you sure you want to delete this user account? This action cannot be undone.')) {
        return;
      }

      // Use the new admin-delete-user edge function
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { target_user_id: userId },
      });

      if (error || (data as any)?.error) throw (error || new Error((data as any)?.error));

      toast({
        title: "Success",
        description: "User account deleted successfully",
      });

      // Refresh data
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user account",
        variant: "destructive",
      });
    }
  };

  const handleHalalPropertyAction = async (propertyId: string, status: 'approved' | 'denied') => {
    try {
      console.log(`Handling halal property ${propertyId} with status: ${status}`);
      
      // Update property halal status
      const updateData: any = {
        halal_status: status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id
      };

      if (status === 'approved') {
        updateData.is_halal_available = true;
        updateData.halal_approved_at = new Date().toISOString();
        updateData.halal_approved_by = user?.id;
      } else {
        updateData.is_halal_available = false;
      }

      const { error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Halal listing ${status} successfully`,
      });

      // Refresh data
      fetchAllData();
    } catch (error: any) {
      console.error('Error updating halal property:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update halal property",
        variant: "destructive",
      });
    }
  };

  const handleHalalRequestAction = async (requestId: string, status: 'approved' | 'denied') => {
    try {
      console.log(`Handling halal request ${requestId} with status: ${status}`);
      
      // Update halal financing request status
      const { error } = await supabase
        .from('halal_financing_requests')
        .update({ 
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', requestId);

      if (error) throw error;

      // If approved, also update the property to enable halal financing
      if (status === 'approved') {
        const request = halalRequests.find(r => r.id === requestId);
        if (request?.property_id) {
          await supabase
            .from('properties')
            .update({
              is_halal_available: true,
              halal_status: 'approved',
              halal_approved_at: new Date().toISOString(),
              halal_approved_by: user?.id
            })
            .eq('id', request.property_id);
        }
      }

      toast({
        title: "Success",
        description: `Halal request ${status} successfully`,
      });

      // Refresh data
      fetchAllData();
    } catch (error: any) {
      console.error('Error updating halal request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update halal request",
        variant: "destructive",
      });
    }
  };

  const handleApplicationAction = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      console.log(`Handling application ${applicationId} with status: ${status}`);
      
      // Update application status
      const { error } = await supabase
        .from('properties')
        .update({ 
          status: status === 'approved' ? 'active' : status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', applicationId);

      if (error) {
        console.error('Error updating application:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: `Application ${status} successfully`,
      });

      // Refresh all data while maintaining current view
      await fetchProperties();
    } catch (error) {
      console.error('Error handling application:', error);
      toast({
        title: "Error",
        description: `Failed to ${status} application: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Group applications by status for better organization
  const groupedApplications = {
    pending: applications.filter(app => app.status === 'pending'),
    approved: applications.filter(app => app.status === 'approved'), 
    rejected: applications.filter(app => app.status === 'rejected')
  };

  const updatePropertyStatus = async (propertyId: string, status: 'active' | 'suspended') => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status })
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Property ${status} successfully`,
      });

      fetchProperties();
    } catch (error) {
      console.error('Error updating property:', error);
      toast({
        title: "Error",
        description: "Failed to update property",
        variant: "destructive",
      });
    }
  };

  const getUserRole = (user: UserWithRole) => {
    return user.role || 'user';
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">{t('admin.dashboard.users.roleAdmin')}</Badge>;
      case 'moderator':
        return <Badge variant="default">{t('admin.dashboard.users.roleModerator')}</Badge>;
      default:
        return <Badge variant="secondary">{t('admin.dashboard.users.roleUser')}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">{t('admin.dashboard.properties.statusActive')}</Badge>;
      case 'suspended':
        return <Badge variant="destructive">{t('admin.dashboard.properties.statusSuspended')}</Badge>;
      case 'pending':
        return <Badge variant="secondary">{t('admin.dashboard.properties.statusPending')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getHalalBadge = (property: any) => {
    const approved = property?.is_halal_available && property?.halal_status === 'approved';
    return approved ? (
      <Badge variant="default">{t('admin.dashboard.properties.halalApproved')}</Badge>
    ) : (
      <Badge variant="destructive">{t('admin.dashboard.properties.halalNotApproved')}</Badge>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t('admin.dashboard.loading')}</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="min-h-screen bg-background">
            <header className="h-16 flex items-center border-b px-4">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-xl font-semibold">{t('admin.dashboard.title')}</h1>
              <div className="ml-auto">
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {t('admin.dashboard.signOut')}
                </Button>
              </div>
            </header>
            <main className="container mx-auto px-4 py-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold">{t('admin.dashboard.title')}</h1>
                <p className="text-muted-foreground">{t('admin.dashboard.financing.subtitle')}</p>
              </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t('admin.dashboard.tabs.users')} ({users.length})
          </TabsTrigger>
          <TabsTrigger value="properties" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            {t('admin.dashboard.tabs.properties')} ({properties.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {t('admin.dashboard.tabs.applications')} ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="halal-listing" className="flex items-center gap-2">
            <Banknote className="w-4 h-4" />
            Halal Listing
          </TabsTrigger>
          <TabsTrigger value="financing" className="flex items-center gap-2">
            <Banknote className="w-4 h-4" />
            {t('admin.dashboard.tabs.financing')}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {t('admin.dashboard.tabs.security')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {users.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No users found. Loading...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{user.full_name}</h3>
                        {getRoleBadge(getUserRole(user))}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-sm">{user.phone}</p>
                      <p className="text-sm">Type: {user.account_type}</p>
                      <p className="text-sm">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={getUserRole(user)}
                        onValueChange={(role) => handleRoleChange(user.user_id, role)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">{t('admin.dashboard.users.roleUser')}</SelectItem>
                          <SelectItem value="moderator">{t('admin.dashboard.users.roleModerator')}</SelectItem>
                          <SelectItem value="admin">{t('admin.dashboard.users.roleAdmin')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.user_id)}
                        disabled={user.user_id === user?.id}
                      >
                        {t('admin.dashboard.users.deleteUser')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          <DistrictReviewPanel onApplied={() => fetchProperties()} />
          {properties.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No properties found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
            {properties.map((property) => (
              <Card key={property.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{property.title}</h3>
                          {getStatusBadge(property.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">ID: {property.id}</p>
                        <p className="text-sm text-muted-foreground">{property.location}</p>
                        <p className="text-sm">Price: ${property.price?.toLocaleString()}</p>
                        <p className="text-sm">
                          {property.property_type === 'house' && property.land_area_sotka ? 
                            `Living: ${property.area} m² | Land: ${property.land_area_sotka} соток` : 
                            `Area: ${property.area} m²`
                          }
                        </p>
                        <p className="text-sm">Owner: {property.profiles?.full_name} ({property.profiles?.email})</p>
                        <p className="text-sm">Listed: {new Date(property.created_at).toLocaleDateString()}</p>
                        {(Array.isArray(property.photos) && property.photos.length > 0 || property.image_url) && (
                          <div className="mt-3 flex gap-2">
                            {[...(Array.isArray(property.photos) ? property.photos.slice(0,3) : []), ...(property.image_url ? [property.image_url] : [])]
                              .slice(0,3)
                              .map((url: string, idx: number) => (
                                <img
                                  key={idx}
                                  src={url}
                                  alt="Property photo thumbnail"
                                  loading="lazy"
                                  className="h-16 w-20 rounded-md object-cover border border-border"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder.svg'
                                  }}
                                />
                              ))}
                          </div>
                        )}
                        <div className="mt-2">{getHalalBadge(property)}</div>
                      </div>
                     <div className="flex gap-2">
                      {property.status === 'active' ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handlePropertyStatusChange(property.id, 'suspended')}
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handlePropertyStatusChange(property.id, 'active')}
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Activate
                        </Button>
                      )}
                     </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </TabsContent>


        <TabsContent value="requests" className="space-y-6">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No property applications found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {applications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{application.property_type}</h3>
                          <Badge variant={application.status === 'pending' ? 'secondary' : 
                                        application.status === 'approved' ? 'default' : 'destructive'}>
                            {application.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">ID: {application.id}</p>
                        <p className="text-sm text-muted-foreground">{application.location}</p>
                        <p className="text-sm">Price: ${application.price?.toLocaleString()}</p>
                        <p className="text-sm">Applicant: {application.profiles?.full_name} ({application.profiles?.email})</p>
                        <p className="text-sm">Bedrooms: {application.bedrooms} | Bathrooms: {application.bathrooms}</p>
                        <p className="text-sm">
                          {application.property_type === 'house' && application.land_area_sotka ? 
                            `Living Area: ${application.area} m² | Land: ${application.land_area_sotka} соток` : 
                            `Area: ${application.area} m²`
                          }
                        </p>
                        <p className="text-sm">Submitted: {new Date(application.created_at).toLocaleDateString()}</p>
                        {(Array.isArray(application.photos) && application.photos.length > 0 || application.image_url) && (
                          <div className="mt-3 flex gap-2">
                            {[...(Array.isArray(application.photos) ? application.photos.slice(0,3) : []), ...(application.image_url ? [application.image_url] : [])]
                              .slice(0,3)
                              .map((url: string, idx: number) => (
                                <img
                                  key={idx}
                                  src={url}
                                  alt="Application photo thumbnail"
                                  loading="lazy"
                                  className="h-16 w-20 rounded-md object-cover border border-border"
                                />
                              ))}
                          </div>
                        )}
                        {application.description && (
                          <p className="text-sm mt-2"><strong>Description:</strong> {application.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {application.status === 'pending' && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApplicationAction(application.id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleApplicationAction(application.id, 'rejected')}
                            >
                              Reject
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApplicationDelete(application.id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="halal-listing" className="space-y-6">
          {halalRequests.filter(req => req.type === 'listing_request').length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No halal listing requests found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {halalRequests
                .filter(req => req.type === 'listing_request')
                .map((request) => {
                  const property = request.property;
                  return (
                    <Card key={request.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{property.title}</h3>
                              <Badge variant="secondary">Halal Listing Request</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Property ID: {property.id}</p>
                            <p className="text-sm text-muted-foreground">{property.location}</p>
                            <p className="text-sm">Price: ${property.price?.toLocaleString()}</p>
                            <p className="text-sm">
                              {property.property_type === 'house' && property.land_area_sotka ? 
                                `Living: ${property.area} m² | Land: ${property.land_area_sotka} соток` : 
                                `Area: ${property.area} m²`
                              }
                            </p>
                            <p className="text-sm">Owner: {request.requester?.full_name} ({request.requester?.email})</p>
                            <p className="text-sm">Requested: {new Date(request.created_at).toLocaleDateString()}</p>
                            {(Array.isArray(property.photos) && property.photos.length > 0 || property.image_url) && (
                              <div className="mt-3 flex gap-2">
                                {[...(Array.isArray(property.photos) ? property.photos.slice(0,3) : []), ...(property.image_url ? [property.image_url] : [])]
                                  .slice(0,3)
                                  .map((url: string, idx: number) => (
                                    <img
                                      key={idx}
                                      src={url}
                                      alt="Property photo thumbnail"
                                      loading="lazy"
                                      className="h-16 w-20 rounded-md object-cover border border-border"
                                      onError={(e) => {
                                        e.currentTarget.src = '/placeholder.svg'
                                      }}
                                    />
                                  ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleHalalPropertyAction(property.id, 'approved')}
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleHalalPropertyAction(property.id, 'denied')}
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Deny
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="financing" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="w-5 h-5" />
                  Financing Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manage the complete financing workflow with stage-based processing, document collection, and approval management.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
                    <span className="text-sm font-medium">Total Buyer Requests</span>
                    <Badge variant="outline">{halalRequests.filter(r => r.cash_available).length}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-sm font-medium">Submitted (Need Assignment)</span>
                    <Badge variant="secondary">{halalRequests.filter(r => r.stage === 'submitted' && r.cash_available).length}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <span className="text-sm font-medium">Final Approval Pending</span>
                    <Badge variant="outline">{halalRequests.filter(r => r.stage === 'final_approval' && r.cash_available).length}</Badge>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/admin/financing')}
                  className="w-full mt-4 flex items-center gap-2"
                  size="lg"
                >
                  <Banknote className="w-4 h-4" />
                  Open Financing Dashboard
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Workflow Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  New 7-stage workflow for comprehensive financing review process.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>1. Submitted → Admin assigns responsible person</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>2. Assigned → Specialist begins review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>3. Document Collection → Request & collect docs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>4. Under Review → Specialist assessment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <span>5. Final Approval → Admin decision</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>6. Approved → Process complete</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>7. Denied → Declined with reason</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <SecurityAuditPanel />
                <DistrictReviewPanel />
              </TabsContent>
            </Tabs>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}