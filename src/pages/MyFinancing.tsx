
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
import { FinancingRequestBox } from "@/components/FinancingRequestBox";
import { FileText, Search, Filter, Eye, Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { calculateHalalFinancing } from "@/utils/halalFinancing";

interface FinancingRequest {
  id: string;
  property_id: string;
  status: string;
  stage: string;
  requested_amount: number;
  cash_available: number;
  period_months: number;
  responsible_person_id?: string;
  created_at: string;
  updated_at: string;
  properties: {
    title: string;
    location: string;
    price: number;
  };
}

const MyFinancing = () => {
  const [requests, setRequests] = useState<FinancingRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<FinancingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const { requestId } = useParams();
  const { toast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchRequests();
  }, [user]);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('halal_financing_requests')
        .select(`
          *,
          properties (title, location, price)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []) as unknown as FinancingRequest[]);
    } catch (error) {
      console.error('Error fetching financing requests:', error);
      toast({
        title: "Error",
        description: "Failed to load your financing requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const [deleteRequestId, setDeleteRequestId] = useState<string | null>(null);
  
  const handleDeleteRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('halal_financing_requests')
        .delete()
        .eq('id', requestId);
      
      if (error) throw error;
      
      toast({
        title: "Request deleted",
        description: "Your financing request has been deleted successfully."
      });
      
      // Refresh the list
      fetchRequests();
      setDeleteRequestId(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEditRequest = (request: FinancingRequest) => {
    // Navigate to property details with halal financing section
    navigate(`/properties/${request.property_id}`, {
      state: { 
        openFinancing: true,
        editRequestId: request.id,
        cashAvailable: request.cash_available,
        periodMonths: request.period_months
      }
    });
  };

  const canEditOrDelete = (request: FinancingRequest) => {
    return !request.responsible_person_id && 
           (request.status === 'pending' || request.stage === 'submitted');
  };
  const filterRequests = () => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.properties.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.properties.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  };

  const getStatusBadge = (status: string, stage?: string) => {
    const currentStage = stage || status;
    switch (currentStage) {
      case 'submitted':
        return <Badge variant="secondary">Submitted</Badge>;
      case 'assigned':
        return <Badge variant="outline">Under Review</Badge>;
      case 'document_collection':
        return <Badge variant="destructive">Documents Required</Badge>;
      case 'under_review':
        return <Badge variant="default">Under Review</Badge>;
      case 'final_approval':
        return <Badge variant="outline">Final Approval</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Approved</Badge>;
      case 'denied':
        return <Badge variant="destructive">Denied</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{currentStage}</Badge>;
    }
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
              <Button variant="outline" onClick={() => navigate('/my-financing')}>
                Back to My Requests
              </Button>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8">
          <FinancingRequestBox
            financingRequestId={requestId}
            onClose={() => navigate('/my-financing')}
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
          <p className="text-muted-foreground mt-4">Loading your financing requests...</p>
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
              <h1 className="font-heading font-bold text-xl text-foreground">My Financing Requests</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Your Financing Applications
            </CardTitle>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by property or location..."
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
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="document_collection">Needs Documents</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
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
                <p className="text-muted-foreground mb-6">
                  {requests.length === 0 
                    ? 'You haven\'t submitted any financing requests yet.'
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
                {requests.length === 0 && (
                  <Button onClick={() => navigate('/properties')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Browse Properties
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mobile Card View */}
                <div className="sm:hidden space-y-4">
                  {filteredRequests.map((request) => (
                    <Card key={request.id} className="p-4">
                      <div className="space-y-3">
                        <div>
                          <div className="font-medium text-sm">{request.properties.title}</div>
                          <div className="text-xs text-muted-foreground">{request.properties.location}</div>
                          <div className="text-sm font-bold">{formatCurrency(request.properties.price)}</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <div className="text-muted-foreground">Total Cost:</div>
                            <div className="font-medium">
                              {request.cash_available != null && request.period_months != null
                                ? (() => {
                                    const calculation = calculateHalalFinancing(
                                      request.cash_available || 0,
                                      request.properties.price || 0,
                                      request.period_months || 12
                                    );
                                    return formatCurrency(calculation.totalCost);
                                  })()
                                : "Not specified"
                              }
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Period:</div>
                            <div className="font-medium">
                              {request.period_months != null 
                                ? `${request.period_months}m`
                                : "Not specified"
                              }
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            {getStatusBadge(request.status, request.stage)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(request.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/my-financing/${request.id}`)}
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          
                          {canEditOrDelete(request) && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditRequest(request)}
                                className="flex-1"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteRequestId(request.id)}
                                className="flex-1"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <Table className="hidden sm:table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Amount Requested</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
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
                               {request.cash_available != null && request.period_months != null
                                 ? (() => {
                                     const calculation = calculateHalalFinancing(
                                       request.cash_available || 0,
                                       request.properties.price || 0,
                                       request.period_months || 12
                                     );
                                     return formatCurrency(calculation.totalCost);
                                   })()
                                 : <span className="text-muted-foreground">Not specified</span>
                               }
                             </div>
                             <div className="text-sm text-muted-foreground">
                               Cash: {request.cash_available != null 
                                 ? formatCurrency(request.cash_available || 0)
                                 : "Not specified"
                               }
                             </div>
                           </div>
                         </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {request.period_months != null 
                              ? `${request.period_months} months`
                              : <span className="text-muted-foreground">Not specified</span>
                            }
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status, request.stage)}</TableCell>
                        <TableCell>
                          {new Date(request.updated_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/my-financing/${request.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            
                            {canEditOrDelete(request) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditRequest(request)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Request
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setDeleteRequestId(request.id)}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Request
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteRequestId} onOpenChange={() => setDeleteRequestId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Financing Request</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this financing request? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteRequestId && handleDeleteRequest(deleteRequestId)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyFinancing;
