import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { FileText, Upload, Calendar, User, MessageSquare, CheckCircle, XCircle, Clock } from "lucide-react";

interface FinancingRequestBoxProps {
  financingRequestId: string;
  onClose?: () => void;
}

interface FinancingRequest {
  id: string;
  property_id: string;
  user_id: string;
  status: string;
  requested_amount: number;
  cash_available: number;
  period_months: number;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_notes: string | null;
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

interface DocRequest {
  id: string;
  document_type: string;
  description: string | null;
  deadline_at: string | null;
  status: string;
  file_url: string | null;
  response_notes: string | null;
  created_at: string;
}

interface ActivityItem {
  id: string;
  actor_id: string;
  action_type: string;
  details: any;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string;
  };
}

export const FinancingRequestBox = ({ financingRequestId, onClose }: FinancingRequestBoxProps) => {
  const [request, setRequest] = useState<FinancingRequest | null>(null);
  const [docRequests, setDocRequests] = useState<DocRequest[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDocType, setNewDocType] = useState("");
  const [newDocDescription, setNewDocDescription] = useState("");
  const [newDocDeadline, setNewDocDeadline] = useState("");
  const [responseNotes, setResponseNotes] = useState("");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, role } = useUser();

  const isStaff = role === 'admin' || role === 'moderator';
  const isOwner = request?.user_id === user?.id;

  useEffect(() => {
    if (financingRequestId) {
      fetchData();
    }
  }, [financingRequestId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch financing request details
      const { data: requestData, error: requestError } = await supabase
        .from('financing_requests')
        .select(`
          *,
          properties (title, location, price),
          profiles!financing_requests_user_id_fkey (full_name, email)
        `)
        .eq('id', financingRequestId)
        .single();

      if (requestError) throw requestError;
      setRequest(requestData as unknown as FinancingRequest);

      // Fetch document requests
      const { data: docsData, error: docsError } = await supabase
        .from('finance_doc_requests')
        .select('*')
        .eq('financing_request_id', financingRequestId)
        .order('created_at', { ascending: false });

      if (docsError) throw docsError;
      setDocRequests(docsData || []);

      // Fetch activity log
      const { data: activityData, error: activityError } = await supabase
        .from('financing_activity_log')
        .select(`
          *,
          profiles!financing_activity_log_actor_id_fkey (full_name, email)
        `)
        .eq('financing_request_id', financingRequestId)
        .order('created_at', { ascending: false });

      if (activityError) throw activityError;
      setActivity((activityData || []) as unknown as ActivityItem[]);
    } catch (error) {
      console.error('Error fetching financing data:', error);
      toast({
        title: "Error",
        description: "Failed to load financing request details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createDocRequest = async () => {
    if (!newDocType.trim() || !isStaff) return;

    try {
      const { error } = await supabase
        .from('finance_doc_requests')
        .insert({
          financing_request_id: financingRequestId,
          document_type: newDocType,
          description: newDocDescription || null,
          deadline_at: newDocDeadline ? new Date(newDocDeadline).toISOString() : null,
          requested_by: user?.id
        });

      if (error) throw error;

      // Update request status to needs_docs
      await supabase
        .from('financing_requests')
        .update({ status: 'needs_docs' })
        .eq('id', financingRequestId);

      // Log activity
      await supabase
        .from('financing_activity_log')
        .insert({
          financing_request_id: financingRequestId,
          actor_id: user?.id,
          action_type: 'doc_requested',
          details: { document_type: newDocType, description: newDocDescription }
        });

      toast({
        title: "Success",
        description: "Document request created"
      });

      setNewDocType("");
      setNewDocDescription("");
      setNewDocDeadline("");
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create document request",
        variant: "destructive"
      });
    }
  };

  const updateRequestStatus = async (newStatus: string) => {
    if (!isStaff) return;

    try {
      const { error } = await supabase
        .from('financing_requests')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', financingRequestId);

      if (error) throw error;

      // Log activity
      await supabase
        .from('financing_activity_log')
        .insert({
          financing_request_id: financingRequestId,
          actor_id: user?.id,
          action_type: 'status_changed',
          details: { old_status: request?.status, new_status: newStatus }
        });

      toast({
        title: "Success",
        description: `Request ${newStatus}`
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'warning',
      in_review: 'outline',
      approved: 'success',
      denied: 'destructive',
      needs_docs: 'secondary'
    };
    return <Badge variant={variants[status] || 'outline'}>{status.replace('_', ' ')}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!request) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Financing request not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Financing Request - {request.properties.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge(request.status)}
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents ({docRequests.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Property</Label>
                <p className="text-sm">{request.properties.title}</p>
                <p className="text-xs text-muted-foreground">{request.properties.location}</p>
              </div>
              <div>
                <Label>Applicant</Label>
                <p className="text-sm">{request.profiles.full_name || request.profiles.email}</p>
              </div>
              <div>
                <Label>Property Price</Label>
                <p className="text-sm font-bold">{formatCurrency(request.properties.price)}</p>
              </div>
              <div>
                <Label>Cash Available</Label>
                <p className="text-sm">{formatCurrency(request.cash_available)}</p>
              </div>
              <div>
                <Label>Requested Amount</Label>
                <p className="text-sm">{formatCurrency(request.requested_amount || 0)}</p>
              </div>
              <div>
                <Label>Period</Label>
                <p className="text-sm">{request.period_months} months</p>
              </div>
            </div>

            {isStaff && (
              <div className="flex gap-2 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => updateRequestStatus('approved')}
                  disabled={request.status === 'approved'}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => updateRequestStatus('denied')}
                  disabled={request.status === 'denied'}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Deny
                </Button>
                <Button
                  variant="outline"
                  onClick={() => updateRequestStatus('in_review')}
                  disabled={request.status === 'in_review'}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Mark In Review
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-4">
            {isStaff && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Request Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Document</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Document Type</Label>
                      <Select value={newDocType} onValueChange={setNewDocType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income_statement">Income Statement</SelectItem>
                          <SelectItem value="bank_statement">Bank Statement</SelectItem>
                          <SelectItem value="employment_letter">Employment Letter</SelectItem>
                          <SelectItem value="id_document">ID Document</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={newDocDescription}
                        onChange={(e) => setNewDocDescription(e.target.value)}
                        placeholder="Describe what is needed..."
                      />
                    </div>
                    <div>
                      <Label>Deadline (Optional)</Label>
                      <Input
                        type="datetime-local"
                        value={newDocDeadline}
                        onChange={(e) => setNewDocDeadline(e.target.value)}
                      />
                    </div>
                    <Button onClick={createDocRequest} className="w-full">
                      Create Request
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <div className="space-y-3">
              {docRequests.map((doc) => (
                <Card key={doc.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{doc.document_type.replace('_', ' ')}</h4>
                    <Badge variant={doc.status === 'resolved' ? 'success' : doc.status === 'uploaded' ? 'secondary' : 'warning'}>
                      {doc.status}
                    </Badge>
                  </div>
                  {doc.description && (
                    <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>
                  )}
                  {doc.deadline_at && (
                    <p className="text-xs text-muted-foreground">
                      Deadline: {new Date(doc.deadline_at).toLocaleDateString()}
                    </p>
                  )}
                  {(isOwner || isStaff) && doc.status === 'pending' && (
                    <Button variant="outline" size="sm" className="mt-2">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Response
                    </Button>
                  )}
                </Card>
              ))}
              {docRequests.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No document requests</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-4">
            <div className="space-y-3">
              {activity.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {item.action_type === 'status_changed' && <MessageSquare className="w-4 h-4" />}
                      {item.action_type === 'doc_requested' && <FileText className="w-4 h-4" />}
                      {item.action_type === 'doc_uploaded' && <Upload className="w-4 h-4" />}
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {item.profiles.full_name || item.profiles.email}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.action_type === 'status_changed' && `Changed status from ${item.details.old_status} to ${item.details.new_status}`}
                        {item.action_type === 'doc_requested' && `Requested ${item.details.document_type}`}
                        {item.action_type === 'doc_uploaded' && `Uploaded ${item.details.document_type}`}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
              {activity.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No activity recorded</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};