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
import { DocumentUploadManager } from "@/components/DocumentUploadManager";
import { calculateHalalFinancing, formatCurrency as formatHalalCurrency } from "@/utils/halalFinancing";
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
  Users
} from "lucide-react";

interface FinancingRequestBoxProps {
  financingRequestId: string;
  onClose?: () => void;
}

interface FinancingRequest {
  id: string;
  property_id: string;
  user_id: string;
  status: string;
  stage: string;
  responsible_person_id?: string;
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
  user_file_urls?: any[];
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

export const FinancingRequestBox = ({ financingRequestId, onClose }: FinancingRequestBoxProps) => {
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
  const [responseNotes, setResponseNotes] = useState("");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
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

      // Combine the data
      const enrichedRequest = {
        ...requestData,
        profiles: userProfile || { full_name: null, email: '' },
        responsible_person: responsiblePerson
      };

      setRequest(enrichedRequest as unknown as FinancingRequest);

      // Fetch communications
      const { data: commData, error: commError } = await supabase
        .from('halal_financing_communications')
        .select('*')
        .eq('halal_financing_request_id', financingRequestId)
        .order('created_at', { ascending: true });

      if (commError) throw commError;

      // Manually fetch sender profiles for communications
      const enrichedComms = await Promise.all((commData || []).map(async (comm) => {
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('user_id', comm.sender_id)
          .single();

        return {
          ...comm,
          file_urls: Array.isArray(comm.file_urls) ? comm.file_urls : [],
          sender: senderProfile || { email: '', full_name: '' }
        };
      }));

      setCommunications(enrichedComms as Communication[]);

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
      
      // Transform the data to match our interface
      const transformedDocs = (docsData || []).map(doc => ({
        ...doc,
        user_file_urls: Array.isArray(doc.user_file_urls) ? doc.user_file_urls : [],
      }));
      
      setDocRequests(transformedDocs);

      // Fetch activity log
      const { data: activityData, error: activityError } = await supabase
        .from('halal_financing_activity_log')
        .select('*')
        .eq('halal_financing_request_id', financingRequestId)
        .order('created_at', { ascending: false });

      if (activityError) throw activityError;

      // Manually fetch actor profiles for activity log
      const enrichedActivity = await Promise.all((activityData || []).map(async (activity) => {
        const { data: actorProfile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('user_id', activity.actor_id)
          .single();

        return {
          ...activity,
          profiles: actorProfile || { full_name: null, email: '' }
        };
      }));

      setActivity(enrichedActivity as unknown as ActivityItem[]);
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
        .from('halal_finance_doc_requests')
        .insert({
          halal_financing_request_id: financingRequestId,
          document_type: newDocType,
          description: newDocDescription || null,
          deadline_at: newDocDeadline ? new Date(newDocDeadline).toISOString() : null,
          requested_by: user?.id
        });

      if (error) throw error;

      // Update request stage to document_collection
      await supabase
        .from('halal_financing_requests')
        .update({ stage: 'document_collection' })
        .eq('id', financingRequestId);

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

  const updateStage = async (newStage: 'submitted' | 'assigned' | 'document_collection' | 'under_review' | 'final_approval' | 'approved' | 'denied', sendBackNotes?: string) => {
    if (!canManage) return;

    try {
      const updateData: any = {
        stage: newStage,
        updated_at: new Date().toISOString()
      };

      // If sending back to responsible person
      if (newStage === 'under_review' && request?.stage === 'final_approval') {
        updateData.sent_back_to_responsible = true;
        updateData.sent_back_notes = sendBackNotes;
      }

      const { error } = await supabase
        .from('halal_financing_requests')
        .update(updateData)
        .eq('id', financingRequestId);

      if (error) throw error;

      // Log activity
      await supabase
        .from('halal_financing_activity_log')
        .insert({
          halal_financing_request_id: financingRequestId,
          actor_id: user?.id,
          action_type: 'stage_change',
          details: { 
            old_stage: request?.stage, 
            new_stage: newStage,
            sent_back_notes: sendBackNotes
          }
        });

      toast({
        title: "Success",
        description: `Request stage updated to ${newStage.replace('_', ' ')}`
      });

      fetchData();
    } catch (error) {
      console.error('Stage update error:', error);
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
          updated_at: new Date().toISOString(),
          sent_back_to_responsible: false  // Reset send back flag
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
      console.error('Assignment error:', error);
      toast({
        title: "Error",
        description: "Failed to assign responsible person",
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

  const getStatusBadge = (stage: string) => {
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
        return <Badge className="bg-blue-600 hover:bg-blue-700"><FileText className="w-3 h-3 mr-1" />Final Approval</Badge>;
      case 'approved':
        return <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
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
              {(() => {
                const financingCalc = calculateHalalFinancing(
                  request.cash_available,
                  request.properties.price,
                  request.period_months
                );
                return (
                  <>
                    <div>
                      <Label>Total Cost</Label>
                      <p className="text-sm font-bold">{formatHalalCurrency(financingCalc.totalCost)}</p>
                    </div>
                    <div>
                      <Label>Monthly Payment</Label>
                      <p className="text-sm">{formatHalalCurrency(financingCalc.requiredMonthlyPayment)}</p>
                    </div>
                    <div>
                      <Label>Period</Label>
                      <p className="text-sm">{request.period_months} months</p>
                    </div>
                    <div>
                      <Label>VAT</Label>
                      <p className="text-sm">{formatHalalCurrency(financingCalc.vat)}</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Assignment and Actions */}
            {isStaff && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assignment & Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Responsible Person Assignment */}
                  <div className="flex items-center gap-4">
                    <Label htmlFor="responsible">Responsible Person:</Label>
                    {request.responsible_person ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          <User className="w-3 h-3 mr-1" />
                          {request.responsible_person.full_name || request.responsible_person.email}
                        </Badge>
                        {isAdmin && (
                          <Select onValueChange={assignResponsiblePerson}>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Reassign..." />
                            </SelectTrigger>
                            <SelectContent>
                              {staffMembers.map(member => (
                                <SelectItem key={member.user_id} value={member.user_id}>
                                  {member.full_name || member.email} ({member.role})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    ) : isAdmin ? (
                      <Select onValueChange={assignResponsiblePerson}>
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="Assign responsible person..." />
                        </SelectTrigger>
                        <SelectContent>
                          {staffMembers.map(member => (
                            <SelectItem key={member.user_id} value={member.user_id}>
                              {member.full_name || member.email} ({member.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="secondary">Not assigned</Badge>
                    )}
                  </div>

                  {/* Stage Actions */}
                  {canManage && (
                    <div className="flex flex-wrap gap-2">
                      {request.stage === 'submitted' && isAdmin && request.responsible_person_id && (
                        <Button onClick={() => updateStage('assigned')} size="sm">
                          <ArrowRight className="w-4 h-4 mr-1" />
                          Mark as Assigned
                        </Button>
                      )}
                      {request.stage === 'assigned' && isResponsiblePerson && (
                        <Button onClick={() => updateStage('document_collection')} size="sm">
                          <FileText className="w-4 h-4 mr-1" />
                          Start Document Collection
                        </Button>
                      )}
                      {request.stage === 'document_collection' && isResponsiblePerson && (
                        <Button onClick={() => updateStage('under_review')} size="sm">
                          <Clock className="w-4 h-4 mr-1" />
                          Start Review
                        </Button>
                      )}
                      {request.stage === 'under_review' && isResponsiblePerson && (
                        <Button onClick={() => updateStage('final_approval')} size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <ArrowRight className="w-4 h-4 mr-1" />
                          Submit for Final Approval
                        </Button>
                      )}
                      {request.stage === 'final_approval' && isAdmin && (
                        <>
                          <Button onClick={() => updateStage('approved')} size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve Request
                          </Button>
                          <Button onClick={() => updateStage('denied')} size="sm" variant="destructive">
                            <XCircle className="w-4 h-4 mr-1" />
                            Deny Request
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <ArrowRight className="w-4 h-4 mr-1" />
                                Send Back for Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Send Back for Review</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Textarea
                                  value={responseNotes}
                                  onChange={(e) => setResponseNotes(e.target.value)}
                                  placeholder="Please provide feedback for the responsible person..."
                                  className="min-h-[100px]"
                                />
                                <Button 
                                  onClick={() => {
                                    updateStage('under_review', responseNotes);
                                    setResponseNotes('');
                                  }} 
                                  className="w-full"
                                  disabled={!responseNotes.trim()}
                                >
                                  Send Back with Notes
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  )}

                  {/* Stage progression guide */}
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-sm">Workflow Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`px-2 py-1 rounded ${request.stage === 'submitted' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          Submitted
                        </div>
                        <ArrowRight className="w-3 h-3" />
                        <div className={`px-2 py-1 rounded ${request.stage === 'assigned' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          Assigned
                        </div>
                        <ArrowRight className="w-3 h-3" />
                        <div className={`px-2 py-1 rounded ${request.stage === 'document_collection' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          Documents
                        </div>
                        <ArrowRight className="w-3 h-3" />
                        <div className={`px-2 py-1 rounded ${request.stage === 'under_review' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          Review
                        </div>
                        <ArrowRight className="w-3 h-3" />
                        <div className={`px-2 py-1 rounded ${request.stage === 'final_approval' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          Final Approval
                        </div>
                        <ArrowRight className="w-3 h-3" />
                        <div className={`px-2 py-1 rounded ${request.stage === 'approved' || request.stage === 'denied' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          Decision
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="communications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Communications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 mb-4">
                  <div className="space-y-4">
                    {communications.map((comm) => (
                      <div key={comm.id} className={`flex gap-3 ${comm.is_internal ? 'opacity-60' : ''}`}>
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{comm.sender?.full_name?.[0] || comm.sender?.email[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {comm.sender?.full_name || comm.sender?.email}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comm.created_at).toLocaleString()}
                            </span>
                            {comm.is_internal && (
                              <Badge variant="outline" className="text-xs">Internal</Badge>
                            )}
                          </div>
                          <p className="text-sm">{comm.content}</p>
                          {comm.file_urls.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {comm.file_urls.map((url, index) => (
                                <a
                                  key={index}
                                  href={url}
                                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="w-3 h-3" />
                                  File {index + 1}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    rows={2}
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
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

            {/* User Document Upload Interface */}
            {isOwner && (
              <DocumentUploadManager
                docRequests={docRequests.map(doc => ({
                  ...doc,
                  user_file_urls: doc.user_file_urls || [],
                  submitted_at: doc.submitted_at
                }))}
                financingRequestId={financingRequestId}
                onRefresh={fetchData}
              />
            )}

            {/* Staff View of Document Requests */}
            {isStaff && !isOwner && (
              <div className="space-y-3">
                {docRequests.map((doc) => (
                  <Card key={doc.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{doc.document_type.replace('_', ' ')}</h4>
                      <Badge variant={doc.status === 'submitted' ? 'default' : doc.status === 'pending' ? 'secondary' : 'outline'}>
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
                    {doc.submitted_at && (
                      <p className="text-xs text-green-600">
                        Submitted: {new Date(doc.submitted_at).toLocaleDateString()}
                      </p>
                    )}
                    {doc.response_notes && (
                      <div className="mt-2 p-2 bg-muted rounded">
                        <p className="text-xs font-medium">User Notes:</p>
                        <p className="text-sm">{doc.response_notes}</p>
                      </div>
                    )}
                  </Card>
                ))}
                {docRequests.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No document requests</p>
                )}
              </div>
            )}
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