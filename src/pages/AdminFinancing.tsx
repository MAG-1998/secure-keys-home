import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { MagitLogo } from "@/components/MagitLogo";
import { EnhancedFinancingRequestBox } from "@/components/EnhancedFinancingRequestBox";
import { FileText, Search, Filter, Eye } from "lucide-react";

interface FinancingRequest {
  id: string;
  property_id: string;
  user_id: string;
  status: string;
  requested_amount: number;
  cash_available: number;
  period_months: number;
  created_at: string;
  properties: {
    title: string;
    location: string;
    price: number;
  };
  profiles: {
    full_name: string | null;
    email: string;
  };
}

const AdminFinancing = () => {
  const [requests, setRequests] = useState<FinancingRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<FinancingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const { requestId } = useParams();
  const { toast } = useToast();
  const { user, role } = useUser();

  const isStaff = role === 'admin' || role === 'moderator';

  useEffect(() => {
    if (!isStaff) {
      navigate('/');
      return;
    }
    fetchRequests();
  }, [isStaff]);


  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      console.log('Fetching requests - User:', user?.id, 'Role:', role, 'IsStaff:', isStaff);
      
      // First try a simple query without joins to debug
      const { data: simpleData, error: simpleError } = await supabase
        .from('halal_financing_requests')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Simple query result:', { data: simpleData, error: simpleError });

      if (simpleError) {
        console.error('Simple query failed:', simpleError);
        throw simpleError;
      }

      if (!simpleData || simpleData.length === 0) {
        console.log('No financing requests found');
        setRequests([]);
        return;
      }

      // Now try with joins using a different approach
      const { data, error } = await supabase
        .from('halal_financing_requests')
        .select(`
          *,
          properties (title, location, price)
        `)
        .order('created_at', { ascending: false });

      console.log('Query with properties join:', { data, error });

      if (error) throw error;

      // Manually fetch user profiles for each request
      const requestsWithProfiles = await Promise.all(
        (data || []).map(async (request) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', request.user_id)
            .single();

          return {
            ...request,
            profiles: profile || { full_name: null, email: 'Unknown' }
          };
        })
      );

      console.log('Final requests with profiles:', requestsWithProfiles);
      setRequests(requestsWithProfiles as unknown as FinancingRequest[]);
    } catch (error) {
      console.error('Error fetching financing requests:', error);
      toast({
        title: "Error",
        description: "Failed to load financing requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.properties.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.properties.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.profiles.full_name && request.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  };

  const getStatusBadge = (status: string, stage?: string) => {
    const currentStage = stage || status;
    const variants: Record<string, any> = {
      submitted: 'secondary',
      assigned: 'outline', 
      document_collection: 'destructive',
      under_review: 'default',
      final_approval: 'outline',
      approved: 'default',
      denied: 'destructive',
      pending: 'warning',
      in_review: 'outline',
      needs_docs: 'destructive'
    };
    return <Badge variant={variants[currentStage] || 'outline'}>{currentStage.replace('_', ' ')}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (requestId) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div onClick={() => navigate('/')} className="cursor-pointer">
                  <MagitLogo size="md" />
                </div>
                <h1 className="font-heading font-bold text-xl text-foreground">Financing Request Details</h1>
              </div>
              <Button variant="outline" onClick={() => navigate('/admin/financing')}>
                Back to List
              </Button>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8">
          <EnhancedFinancingRequestBox
            financingRequestId={requestId}
            onClose={() => navigate('/admin/financing')}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <MagitLogo size="lg" />
          <p className="text-muted-foreground mt-4">Loading financing requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div onClick={() => navigate('/')} className="cursor-pointer">
                <MagitLogo size="md" />
              </div>
              <h1 className="font-heading font-bold text-xl text-foreground">Financing Requests</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/admin')}>
              Admin Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Financing Requests Inbox
            </CardTitle>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by property, location, or applicant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="needs_docs">Needs Documents</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                  {requests.length === 0 ? 'No Financing Requests' : 'No Matching Requests'}
                </h3>
                <p className="text-muted-foreground">
                  {requests.length === 0 
                    ? 'Financing requests will appear here when users apply.'
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.properties.title}</div>
                          <div className="text-sm text-muted-foreground">{request.properties.location}</div>
                          <div className="text-sm font-bold">{formatCurrency(request.properties.price)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {request.profiles.full_name || request.profiles.email}
                          </div>
                          {request.profiles.full_name && (
                            <div className="text-sm text-muted-foreground">{request.profiles.email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatCurrency(request.requested_amount || 0)}</div>
                          <div className="text-sm text-muted-foreground">
                            Cash: {formatCurrency(request.cash_available)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{request.period_months} months</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/financing/${request.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminFinancing;