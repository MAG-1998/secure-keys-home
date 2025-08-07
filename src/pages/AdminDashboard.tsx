import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Shield, Users, Home, Settings, UserCheck, UserX, LogOut } from "lucide-react";
import SecurityAuditPanel from "@/components/SecurityAuditPanel";

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  user_type: string;
  role: 'user' | 'moderator' | 'admin';
  created_at: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useUser();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchUsers(),
      fetchProperties()
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
        title: "Error",
        description: "Failed to fetch users",
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
        title: "Error",
        description: "Failed to fetch properties",
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
        title: "Success", 
        description: "Application deleted successfully",
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
          title: "Error",
          description: "Cannot modify your own role",
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
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, roles, and system settings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
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
            <Settings className="w-4 h-4" />
            Property Requests ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security Audit
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
                        onValueChange={(role) => handleRoleChange(user.user_id, role)}
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
                        <p className="text-sm text-muted-foreground">{application.location}</p>
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

        <TabsContent value="security" className="space-y-6">
          <SecurityAuditPanel />
        </TabsContent>

      </Tabs>
    </div>
  );
}