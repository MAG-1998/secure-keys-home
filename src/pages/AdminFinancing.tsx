import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { MagitLogo } from "@/components/MagitLogo";
import { EnhancedFinancingRequestBox } from "@/components/EnhancedFinancingRequestBox";
import { FileText, Search, Filter, Eye, UserCheck, Clock, CheckCircle, XCircle, AlertCircle, FileSearch, ArrowRight } from "lucide-react";

interface FinancingRequest {
  id: string;
  property_id: string;
  user_id: string;
  stage: 'submitted' | 'assigned' | 'document_collection' | 'under_review' | 'final_approval' | 'approved' | 'denied';
  status: string;
  requested_amount: number;
  cash_available: number;
  period_months: number;
  created_at: string;
  updated_at: string;
  responsible_person_id?: string;
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

interface StageStats {
  submitted: number;
  assigned: number;
  document_collection: number;
  under_review: number;
  final_approval: number;
  approved: number;
  denied: number;
}

const AdminFinancing = () => {
  const [requests, setRequests] = useState<FinancingRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<FinancingRequest[]>([]);
  const [stageStats, setStageStats] = useState<StageStats>({
    submitted: 0,
    assigned: 0,
    document_collection: 0,
    under_review: 0,
    final_approval: 0,
    approved: 0,
    denied: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
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
    calculateStageStats();
  }, [requests, searchTerm, stageFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      // Fetch halal financing requests with joins
      const { data, error } = await supabase
        .from('halal_financing_requests')
        .select(`
          *,
          properties (title, location, price)
        `)
        .order('updated_at', { ascending: false });

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
            properties: request.properties || { title: 'Unknown Property', location: 'Unknown', price: 0 },
            profiles: profile || { full_name: null, email: 'Unknown' }
          };
        })
      );

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

    if (stageFilter !== 'all') {
      filtered = filtered.filter(request => request.stage === stageFilter);
    }

    setFilteredRequests(filtered);
  };

  const calculateStageStats = () => {
    const stats: StageStats = {
      submitted: 0,
      assigned: 0,
      document_collection: 0,
      under_review: 0,
      final_approval: 0,
      approved: 0,
      denied: 0
    };

    requests.forEach(request => {
      if (request.stage && stats.hasOwnProperty(request.stage)) {
        stats[request.stage]++;
      }
    });

    setStageStats(stats);
  };

  const getStageInfo = (stage: string) => {
    const stageConfig = {
      submitted: { label: 'Submitted', color: 'bg-blue-500', icon: FileText, progress: 14 },
      assigned: { label: 'Assigned', color: 'bg-orange-500', icon: UserCheck, progress: 28 },
      document_collection: { label: 'Documents', color: 'bg-yellow-500', icon: FileSearch, progress: 42 },
      under_review: { label: 'Under Review', color: 'bg-purple-500', icon: Clock, progress: 57 },
      final_approval: { label: 'Final Approval', color: 'bg-indigo-500', icon: AlertCircle, progress: 85 },
      approved: { label: 'Approved', color: 'bg-green-500', icon: CheckCircle, progress: 100 },
      denied: { label: 'Denied', color: 'bg-red-500', icon: XCircle, progress: 100 }
    };
    return stageConfig[stage] || stageConfig.submitted;
  };

  const getStatusBadge = (stage: string) => {
    const stageInfo = getStageInfo(stage);
    const Icon = stageInfo.icon;
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {stageInfo.label}
      </Badge>
    );
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

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Object.entries(stageStats).map(([stage, count]) => {
            const stageInfo = getStageInfo(stage);
            const Icon = stageInfo.icon;
            const isActionNeeded = ['submitted', 'final_approval'].includes(stage) && count > 0;
            
            return (
              <Card 
                key={stage} 
                className={`cursor-pointer transition-all hover:shadow-md ${isActionNeeded ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setStageFilter(stage)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`w-8 h-8 rounded-full ${stageInfo.color} flex items-center justify-center mb-2`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground">{stageInfo.label}</p>
                    </div>
                    {isActionNeeded && (
                      <AlertCircle className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Financing Requests Management
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
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="document_collection">Documents</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="final_approval">Final Approval</SelectItem>
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
                    <TableHead>Workflow Progress</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => {
                    const stageInfo = getStageInfo(request.stage);
                    const needsAction = request.stage === 'submitted' || request.stage === 'final_approval';
                    
                    return (
                      <TableRow key={request.id} className={needsAction ? 'bg-accent/20' : ''}>
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
                              Cash: {formatCurrency(request.cash_available)} ({request.period_months}m)
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(request.stage)}
                              {needsAction && (
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                              )}
                            </div>
                            <div className="w-full">
                              <Progress value={stageInfo.progress} className="h-2" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(request.updated_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant={needsAction ? "default" : "outline"}
                            size="sm"
                            onClick={() => navigate(`/admin/financing/${request.id}`)}
                            className={needsAction ? "bg-primary text-primary-foreground" : ""}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {needsAction ? 'Take Action' : 'View Details'}
                            {needsAction && <ArrowRight className="w-4 h-4 ml-2" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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