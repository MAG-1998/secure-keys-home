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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { DocumentUploadManager } from "./DocumentUploadManager";
import { 
  FileText, 
  Upload, 
  Calendar, 
  User, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Send,
  Download,
  ArrowRight,
  Users,
  ArrowLeft
} from "lucide-react";

type FinancingStage = 'submitted' | 'assigned' | 'document_collection' | 'under_review' | 'final_approval' | 'approved' | 'denied';

interface FinancingRequestBoxProps {
  financingRequestId: string;
  onClose?: () => void;
}

interface FinancingRequest {
  id: string;
  property_id: string;
  user_id: string;
  status: string;
  stage: FinancingStage;
  responsible_person_id?: string;
  requested_amount: number;
  cash_available: number;
  period_months: number;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_notes: string | null;
  sent_back_to_responsible: boolean;
  sent_back_notes: string | null;
  properties: {
    title: string;
    location: string;
    price: number;
  };
  profiles: {
    full_name: string | null;
    email: string;
  };
  responsible_person?: {
    user_id: string;
    full_name: string | null;
    email: string;
  };
}

interface Communication {
  id: string;
  sender_id: string;
  message_type: string;
  content?: string;
  file_urls: any;
  is_internal: boolean;
  created_at: string;
  sender?: {
    full_name?: string;
    email: string;
  };
}

interface StaffMember {
  user_id: string;
  full_name?: string;
  email: string;
  role: string;
}

interface DocRequest {
  id: string;
  document_type: string;
  description: string | null;
  deadline_at: string | null;
  status: string;
  file_url: string | null;
  response_notes: string | null;
  user_file_urls: any[];
  submitted_at: string | null;
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

export const EnhancedFinancingRequestBox = ({ financingRequestId, onClose }: FinancingRequestBoxProps) => {
  const [request, setRequest] = useState<FinancingRequest | null>(null);
  const [docRequests, setDocRequests] = useState<DocRequest[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDocType, setNewDocType] = useState("");
  const [newDocDescription, setNewDocDescription] = useState("");
  const [newDocDeadline, setNewDocDeadline] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [sendBackNotes, setSendBackNotes] = useState("");
  const { toast } = useToast();
  const { user, role } = useUser();

  const isStaff = role === 'admin' || role === 'moderator';
  const isAdmin = role === 'admin';
  const isOwner = request?.user_id === user?.id;
  const isResponsiblePerson = request?.responsible_person_id === user?.id;
  const canManage = isAdmin || isResponsiblePerson;

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
        .from('halal_financing_requests')
        .select(`
          *,
          properties (title, location, price)
        `)
        .eq('id', financingRequestId)
        .single();

      if (requestError) throw requestError;

      // Manually fetch user profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', requestData.user_id)
        .single();

      // Manually fetch responsible person if assigned
      let responsiblePerson = null;
      if (requestData.responsible_person_id) {
        const { data: respProfile } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .eq('user_id', requestData.responsible_person_id)
          .single();
        responsiblePerson = respProfile;
      }

      const enrichedRequestData = {
        ...requestData,
        properties: requestData.properties || { title: 'Unknown Property', location: 'Unknown', price: 0 },
        profiles: userProfile || { full_name: null, email: 'Unknown' },
        responsible_person: responsiblePerson
      };

      setRequest(enrichedRequestData as unknown as FinancingRequest);
      setAdminNotes(enrichedRequestData.admin_notes || "");

      // Fetch communications
      const { data: commData, error: commError } = await supabase
        .from('halal_financing_communications')
        .select('*')
        .eq('halal_financing_request_id', financingRequestId)
        .order('created_at', { ascending: true });

      if (commError) throw commError;

      // Manually fetch sender profiles for communications
      const communicationsWithSenders = await Promise.all(
        (commData || []).map(async (comm) => {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', comm.sender_id)
            .single();

          return {
            ...comm,
            file_urls: Array.isArray(comm.file_urls) ? comm.file_urls : [],
            sender: senderProfile || { email: 'Unknown', full_name: '' }
          };
        })
      );

      setCommunications(communicationsWithSenders as Communication[]);

      // Fetch staff members for assignment
      const { data: staffData, error: staffError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, role')
        .in('role', ['admin', 'moderator']);

      if (staffError) throw staffError;
      setStaffMembers(staffData || []);

      // Fetch document requests
      const { data: docsData, error: docsError } = await supabase
        .from('halal_finance_doc_requests')
        .select('*')
        .eq('halal_financing_request_id', financingRequestId)
        .order('created_at', { ascending: false });

      if (docsError) throw docsError;
      setDocRequests((docsData || []).map(doc => ({
        ...doc,
        user_file_urls: Array.isArray(doc.user_file_urls) ? doc.user_file_urls : []
      })) as DocRequest[]);

      // Fetch activity log
      const { data: activityData, error: activityError } = await supabase
        .from('halal_financing_activity_log')
        .select('*')
        .eq('halal_financing_request_id', financingRequestId)
        .order('created_at', { ascending: false });

      if (activityError) throw activityError;

      // Manually fetch actor profiles for activity log
      const activityWithActors = await Promise.all(
        (activityData || []).map(async (activity) => {
          const { data: actorProfile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', activity.actor_id)
            .single();

          return {
            ...activity,
            profiles: actorProfile || { full_name: null, email: 'Unknown' }
          };
        })
      );

      setActivity(activityWithActors as unknown as ActivityItem[]);
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
    if (!newDocType.trim() || !canManage) return;

    try {
      const { error } = await supabase
        .from('halal_finance_doc_requests')
        .insert({
          halal_financing_request_id: financingRequestId,
          document_type: newDocType,
          description: newDocDescription || null,
          deadline_at: newDocDeadline ? new Date(newDocDeadline).toISOString() : null,
          requested_by: user?.id
        });

      if (error) throw error;

      // Update request stage to document_collection if not already there
      if (request?.stage !== 'document_collection') {
        await updateStage('document_collection');
      }

      // Log activity
      await supabase
        .from('halal_financing_activity_log')
        .insert({
          halal_financing_request_id: financingRequestId,
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

  const updateStage = async (newStage: FinancingStage) => {
    if (!canManage && !(isAdmin && newStage === 'assigned')) return;

    try {
      const updates: any = {
        stage: newStage,
        updated_at: new Date().toISOString()
      };

      // Clear send back flag when moving forward
      if (newStage !== 'under_review' || !request?.sent_back_to_responsible) {
        updates.sent_back_to_responsible = false;
        updates.sent_back_notes = null;
      }

      const { error } = await supabase
        .from('halal_financing_requests')
        .update(updates)
        .eq('id', financingRequestId);

      if (error) throw error;

      // Log activity
      await supabase
        .from('halal_financing_activity_log')
        .insert({
          halal_financing_request_id: financingRequestId,
          actor_id: user?.id,
          action_type: 'stage_change',
          details: { old_stage: request?.stage, new_stage: newStage }
        });

      toast({
        title: "Success",
        description: `Request stage updated to ${newStage.replace('_', ' ')}`
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update request stage",
        variant: "destructive"
      });
    }
  };

  const assignResponsiblePerson = async (personId: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('halal_financing_requests')
        .update({
          responsible_person_id: personId,
          stage: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', financingRequestId);

      if (error) throw error;

      await supabase
        .from('halal_financing_activity_log')
        .insert({
          halal_financing_request_id: financingRequestId,
          actor_id: user?.id,
          action_type: 'assignment',
          details: { assigned_to: personId }
        });

      toast({
        title: "Success",
        description: "Responsible person assigned successfully"
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign responsible person",
        variant: "destructive"
      });
    }
  };

  const sendBackToResponsible = async () => {
    if (!isAdmin || !sendBackNotes.trim()) return;

    try {
      const { error } = await supabase
        .from('halal_financing_requests')
        .update({
          stage: 'under_review',
          sent_back_to_responsible: true,
          sent_back_notes: sendBackNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', financingRequestId);

      if (error) throw error;

      await supabase
        .from('halal_financing_activity_log')
        .insert({
          halal_financing_request_id: financingRequestId,
          actor_id: user?.id,
          action_type: 'sent_back',
          details: { notes: sendBackNotes }
        });

      toast({
        title: "Success",
        description: "Request sent back to responsible person"
      });

      setSendBackNotes("");
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send back request",
        variant: "destructive"
      });
    }
  };

  const finalApproveOrDeny = async (action: 'approved' | 'denied') => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('halal_financing_requests')
        .update({
          stage: action,
          status: action,
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', financingRequestId);

      if (error) throw error;

      await supabase
        .from('halal_financing_activity_log')
        .insert({
          halal_financing_request_id: financingRequestId,
          actor_id: user?.id,
          action_type: action,
          details: { admin_notes: adminNotes }
        });

      toast({
        title: "Success",
        description: `Request ${action} successfully`
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} request`,
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('halal_financing_communications')
        .insert({
          halal_financing_request_id: financingRequestId,
          sender_id: user?.id,
          message_type: 'message',
          content: newMessage,
          is_internal: isStaff && !isOwner
        });

      if (error) throw error;

      setNewMessage("");
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (stage: FinancingStage) => {
    switch (stage) {
      case 'submitted':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Submitted</Badge>;
      case 'assigned':
        return <Badge variant="outline"><User className="w-3 h-3 mr-1" />Assigned</Badge>;
      case 'document_collection':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Documents Required</Badge>;
      case 'under_review':
        return <Badge variant="default"><Clock className="w-3 h-3 mr-1" />Under Review</Badge>;
      case 'final_approval':
        return <Badge variant="outline"><FileText className="w-3 h-3 mr-1" />Final Approval</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'denied':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Denied</Badge>;
      default:
        return <Badge variant="outline">{stage}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const canProgressToNextStage = () => {
    if (!request) return false;
    
    switch (request.stage) {
      case 'submitted':
        return isAdmin && !request.responsible_person_id;
      case 'assigned':
        return isResponsiblePerson;
      case 'document_collection':
        return isResponsiblePerson && docRequests.filter(doc => doc.status === 'pending').length === 0;
      case 'under_review':
        return isResponsiblePerson;
      case 'final_approval':
        return isAdmin;
      default:
        return false;
    }
  };

  const getNextStageAction = () => {
    if (!request) return null;
    
    switch (request.stage) {
      case 'submitted':
        return { stage: 'assigned' as FinancingStage, label: 'Assign to Specialist' };
      case 'assigned':
        return { stage: 'document_collection' as FinancingStage, label: 'Start Document Collection' };
      case 'document_collection':
        return { stage: 'under_review' as FinancingStage, label: 'Begin Review' };
      case 'under_review':
        return { stage: 'final_approval' as FinancingStage, label: 'Submit for Final Approval' };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading financing request details...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!request) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                Financing Request Not Found
              </h3>
              <p className="text-muted-foreground">
                The financing request with ID "{financingRequestId}" could not be found or you don't have permission to view it.
              </p>
            </div>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Go Back
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{request.properties.title}</CardTitle>
            <p className="text-muted-foreground">{request.properties.location}</p>
          </div>
          <div className="flex items-center gap-4">
            {getStatusBadge(request.stage)}
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="documents">Documents ({docRequests.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Basic Info */}
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
                <p className="text-sm">{formatCurrency(request.cash_available || 0)}</p>
              </div>
              <div>
                <Label>Requested Amount</Label>
                <p className="text-sm">{formatCurrency(request.requested_amount || 0)}</p>
              </div>
              <div>
                <Label>Period</Label>
                <p className="text-sm">{request.period_months || 'Not specified'} {request.period_months ? 'months' : ''}</p>
              </div>
            </div>

            {/* Workflow Actions */}
            {isStaff && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Workflow Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Assignment */}
                  {request.stage === 'submitted' && isAdmin && (
                    <div className="space-y-2">
                      <Label>Assign Responsible Person</Label>
                      <Select onValueChange={assignResponsiblePerson}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a specialist" />
                        </SelectTrigger>
                        <SelectContent>
                          {staffMembers.map((staff) => (
                            <SelectItem key={staff.user_id} value={staff.user_id}>
                              {staff.full_name || staff.email} ({staff.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Current Assignment */}
                  {request.responsible_person && (
                    <div>
                      <Label>Responsible Person</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          <User className="w-3 h-3 mr-1" />
                          {request.responsible_person.full_name || request.responsible_person.email}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Send Back Option (Admin only, from final_approval) */}
                  {isAdmin && request.stage === 'final_approval' && (
                    <div className="space-y-2">
                      <Label>Send Back to Responsible Person</Label>
                      <Textarea
                        placeholder="Explain why you're sending this back..."
                        value={sendBackNotes}
                        onChange={(e) => setSendBackNotes(e.target.value)}
                      />
                      <Button 
                        variant="outline" 
                        onClick={sendBackToResponsible}
                        disabled={!sendBackNotes.trim()}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Send Back for Review
                      </Button>
                    </div>
                  )}

                  {/* Next Stage Button */}
                  {canProgressToNextStage() && (() => {
                    const nextAction = getNextStageAction();
                    return nextAction ? (
                      <Button onClick={() => updateStage(nextAction.stage)}>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        {nextAction.label}
                      </Button>
                    ) : null;
                  })()}

                  {/* Final Approval Actions */}
                  {isAdmin && request.stage === 'final_approval' && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <Label>Admin Notes</Label>
                        <Textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Add your final decision notes..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => finalApproveOrDeny('approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Request
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => finalApproveOrDeny('denied')}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Deny Request
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Send Back Notice */}
                  {request.sent_back_to_responsible && request.sent_back_notes && (
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <Label className="text-orange-800">Sent Back by Admin</Label>
                      <p className="text-sm text-orange-700 mt-1">{request.sent_back_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="communications" className="space-y-4">
            <ScrollArea className="h-80">
              <div className="space-y-4">
                {communications.map((comm) => (
                  <div key={comm.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {comm.sender?.full_name?.[0] || comm.sender?.email[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {comm.sender?.full_name || comm.sender?.email}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comm.created_at).toLocaleString()}
                        </span>
                        {comm.is_internal && (
                          <Badge variant="outline" className="text-xs">Internal</Badge>
                        )}
                      </div>
                      {comm.content && (
                        <p className="text-sm mt-1">{comm.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-4">
            {isOwner ? (
              <DocumentUploadManager 
                docRequests={docRequests}
                financingRequestId={financingRequestId}
                onRefresh={fetchData}
              />
            ) : (
              <>
                {/* Document Request Creation (Staff only) */}
                {canManage && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Request Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Document Type</Label>
                        <Input
                          value={newDocType}
                          onChange={(e) => setNewDocType(e.target.value)}
                          placeholder="e.g., Income Statement, Bank Statement"
                        />
                      </div>
                      <div>
                        <Label>Description (Optional)</Label>
                        <Textarea
                          value={newDocDescription}
                          onChange={(e) => setNewDocDescription(e.target.value)}
                          placeholder="Additional details about what's needed..."
                        />
                      </div>
                      <div>
                        <Label>Deadline (Optional)</Label>
                        <Input
                          type="date"
                          value={newDocDeadline}
                          onChange={(e) => setNewDocDeadline(e.target.value)}
                        />
                      </div>
                      <Button onClick={createDocRequest} disabled={!newDocType.trim()}>
                        <FileText className="w-4 h-4 mr-2" />
                        Request Document
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Document Requests List */}
                <div className="space-y-4">
                  {docRequests.map((docRequest) => (
                    <Card key={docRequest.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{docRequest.document_type}</CardTitle>
                          <Badge variant={docRequest.status === 'submitted' ? 'default' : 'destructive'}>
                            {docRequest.status}
                          </Badge>
                        </div>
                        {docRequest.description && (
                          <p className="text-sm text-muted-foreground">{docRequest.description}</p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          Requested: {new Date(docRequest.created_at).toLocaleDateString()}
                          {docRequest.deadline_at && (
                            <span> • Deadline: {new Date(docRequest.deadline_at).toLocaleDateString()}</span>
                          )}
                          {docRequest.submitted_at && (
                            <span> • Submitted: {new Date(docRequest.submitted_at).toLocaleDateString()}</span>
                          )}
                        </div>
                        
                        {docRequest.user_file_urls && docRequest.user_file_urls.length > 0 && (
                          <div className="mt-2">
                            <Label>Uploaded Files</Label>
                            <div className="space-y-1 mt-1">
                              {docRequest.user_file_urls.map((url, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    Document {index + 1}
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {docRequest.response_notes && (
                          <div className="mt-2">
                            <Label>Response Notes</Label>
                            <p className="text-sm bg-muted p-2 rounded mt-1">{docRequest.response_notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-4">
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {activity.map((item) => {
                  const getActionInfo = (action: string) => {
                    switch (action) {
                      case 'stage_change':
                        return {
                          icon: ArrowRight,
                          label: 'Stage Changed',
                          description: `From ${item.details?.old_stage?.replace('_', ' ') || 'unknown'} to ${item.details?.new_stage?.replace('_', ' ') || 'unknown'}`,
                          color: 'text-blue-500'
                        };
                      case 'assignment':
                        return {
                          icon: Users,
                          label: 'Assignment',
                          description: 'Responsible person assigned',
                          color: 'text-green-500'
                        };
                      case 'doc_requested':
                        return {
                          icon: FileText,
                          label: 'Document Requested',
                          description: `${item.details?.document_type || 'Document'} requested`,
                          color: 'text-orange-500'
                        };
                      case 'sent_back':
                        return {
                          icon: ArrowLeft,
                          label: 'Sent Back',
                          description: 'Request sent back for review',
                          color: 'text-yellow-500'
                        };
                      case 'approved':
                        return {
                          icon: CheckCircle,
                          label: 'Approved',
                          description: 'Request approved',
                          color: 'text-green-600'
                        };
                      case 'denied':
                        return {
                          icon: XCircle,
                          label: 'Denied',
                          description: 'Request denied',
                          color: 'text-red-500'
                        };
                      default:
                        return {
                          icon: Clock,
                          label: action.replace('_', ' ').toUpperCase(),
                          description: 'Activity logged',
                          color: 'text-muted-foreground'
                        };
                    }
                  };

                  const actionInfo = getActionInfo(item.action_type);
                  const ActionIcon = actionInfo.icon;

                  return (
                    <div key={item.id} className="flex gap-3 p-3 rounded-lg bg-muted/20 transition-all hover:bg-muted/40">
                      <div className={`flex-shrink-0 ${actionInfo.color}`}>
                        <ActionIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-foreground">
                            {actionInfo.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {actionInfo.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground">
                            {item.profiles.full_name || item.profiles.email}
                          </span>
                        </div>
                        {item.details && (item.details.admin_notes || item.details.notes || item.details.description) && (
                          <div className="mt-2 p-2 bg-background rounded border text-xs">
                            <span className="font-medium">Notes: </span>
                            {item.details.admin_notes || item.details.notes || item.details.description}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {activity.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No activity recorded yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};