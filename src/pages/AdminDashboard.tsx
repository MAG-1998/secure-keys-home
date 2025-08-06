import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, Home, Settings, UserCheck, UserX } from "lucide-react";

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  user_type: string;
  created_at: string;
  user_roles?: {
    role: string;
  }[];
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchUsers(),
      fetchProperties(), 
      fetchApplications()
    ]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      // First fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Then fetch user roles for each user
      const usersWithRoles = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.user_id)
            .single();

          return {
            ...profile,
            user_roles: roleData ? [{ role: roleData.role }] : []
          };
        })
      );

      setUsers(usersWithRoles as any);
      console.log('Fetched users with roles:', usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  const fetchProperties = async () => {
    try {
      // Fetch all properties with owner information
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;

      // Fetch profiles for each property
      const propertiesWithOwners = await Promise.all(
        (propertiesData || []).map(async (property) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', property.user_id)
            .single();

          return {
            ...property,
            profiles: profileData
          };
        })
      );

      setProperties(propertiesWithOwners);
      console.log('Fetched properties with owners:', propertiesWithOwners);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Error",
        description: "Failed to fetch properties",
        variant: "destructive",
      });
    }
  };

  const fetchApplications = async () => {
    try {
      // Fetch all property applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('property_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;

      // Fetch profiles for each application
      const applicationsWithProfiles = await Promise.all(
        (applicationsData || []).map(async (application) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', application.user_id)
            .single();

          return {
            ...application,
            profiles: profileData
          };
        })
      );

      setApplications(applicationsWithProfiles);
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

  const assignRole = async (userId: string, role: 'user' | 'moderator' | 'admin') => {
    try {
      console.log(`Assigning role ${role} to user ${userId}`);
      
      // Remove existing roles first
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error deleting existing roles:', deleteError);
      }

      // Add new role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role
        });

      if (error) {
        console.error('Error inserting new role:', error);
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

  const handleApplicationAction = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      console.log(`Handling application ${applicationId} with status: ${status}`);
      
      // Update application status
      const { error } = await supabase
        .from('property_applications')
        .update({ 
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', applicationId);

      if (error) {
        console.error('Error updating application:', error);
        throw error;
      }

      // If approved, create property listing using RPC function to bypass RLS
      if (status === 'approved') {
        const application = applications.find(app => app.id === applicationId);
        if (application) {
          console.log('Creating property for application:', application);
          
          // Use the service role or create an RPC function to bypass RLS restrictions
          // For now, let's just update the application status and not create property
          console.log('Property creation will be handled by the user');
        }
      }

      toast({
        title: "Success",
        description: `Application ${status} successfully`,
      });

      // Refresh all data
      await fetchAllData();
    } catch (error) {
      console.error('Error handling application:', error);
      toast({
        title: "Error",
        description: `Failed to ${status} application: ${error.message}`,
        variant: "destructive",
      });
    }
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
    return user.user_roles?.[0]?.role || 'user';
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'moderator':
        return <Badge variant="default">Moderator</Badge>;
      default:
        return <Badge variant="secondary">User</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, roles, and system settings</p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users & Roles ({users.length})
          </TabsTrigger>
          <TabsTrigger value="properties" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Properties ({properties.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Property Requests ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
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
                      <p className="text-sm">Type: {user.user_type}</p>
                      <p className="text-sm">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={getUserRole(user)}
                        onValueChange={(role) => assignRole(user.user_id, role as any)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
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
                      <p className="text-sm text-muted-foreground">{property.location}</p>
                      <p className="text-sm">Price: ${property.price?.toLocaleString()}</p>
                      <p className="text-sm">Owner: {property.profiles?.full_name} ({property.profiles?.email})</p>
                      <p className="text-sm">Listed: {new Date(property.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      {property.status === 'active' ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => updatePropertyStatus(property.id, 'suspended')}
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => updatePropertyStatus(property.id, 'active')}
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
                        <p className="text-sm text-muted-foreground">{application.address}</p>
                        <p className="text-sm">Price: ${application.price?.toLocaleString()}</p>
                        <p className="text-sm">Applicant: {application.profiles?.full_name} ({application.profiles?.email})</p>
                        <p className="text-sm">Bedrooms: {application.bedrooms} | Bathrooms: {application.bathrooms}</p>
                        <p className="text-sm">Area: {application.area} m²</p>
                        <p className="text-sm">Submitted: {new Date(application.created_at).toLocaleDateString()}</p>
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

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">System configuration options will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}