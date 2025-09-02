import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, XCircle, FileText, AlertCircle } from "lucide-react";

interface FinancingRequest {
  id: string;
  property_id: string;
  status: string;
  stage: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  responsible_person_id?: string;
  property?: {
    title: string;
    image_url?: string;
  };
}

interface FinancingRequestsSectionProps {
  userId: string;
  t: (key: string) => string;
}

export function FinancingRequestsSection({ userId, t }: FinancingRequestsSectionProps) {
  const [requests, setRequests] = useState<FinancingRequest[]>([]);
  const [docRequests, setDocRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFinancingRequests();
    fetchDocRequests();
  }, [userId]);

  const fetchFinancingRequests = async () => {
    try {
      const { data: requests, error } = await supabase
        .from('halal_financing_requests')
        .select(`
          *,
          properties:property_id (
            title,
            image_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRequests(requests || []);
    } catch (error) {
      console.error('Error fetching financing requests:', error);
    }
  };

  const fetchDocRequests = async () => {
    try {
      const { data: docs, error } = await supabase
        .from('halal_finance_doc_requests')
        .select(`
          *,
          halal_financing_request:halal_financing_request_id!inner (
            user_id
          )
        `)
        .eq('halal_financing_request.user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocRequests(docs || []);
    } catch (error) {
      console.error('Error fetching doc requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, stage?: string) => {
    const currentStage = stage || status;
    switch (currentStage) {
      case 'submitted':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Submitted</Badge>;
      case 'assigned':
        return <Badge variant="outline"><FileText className="w-3 h-3 mr-1" />Assigned</Badge>;
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
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'in_review':
        return <Badge variant="outline"><FileText className="w-3 h-3 mr-1" />In Review</Badge>;
      default:
        return <Badge variant="outline">{currentStage}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return null;
  }

  if (requests.length === 0 && docRequests.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-background/50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
              Financing Requests
            </h2>
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/financing')}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              View All
            </Button>
          </div>

          {/* Document Requests Alert */}
          {docRequests.length > 0 && (
            <Card className="mb-6 border-orange-200 bg-orange-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <CardTitle className="text-orange-800">
                    Action Required: Document Requests
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-orange-700 mb-4">
                  You have {docRequests.length} pending document request(s) from moderators/admins.
                </p>
                <div className="space-y-2">
                  {docRequests.slice(0, 3).map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{doc.document_type}</p>
                        {doc.description && (
                          <p className="text-xs text-muted-foreground">{doc.description}</p>
                        )}
                        {doc.deadline_at && (
                          <p className="text-xs text-orange-600">
                            Deadline: {formatDate(doc.deadline_at)}
                          </p>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => navigate(`/admin/financing/${doc.halal_financing_request_id}`)}
                      >
                        Upload
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Financing Requests */}
          <div className="grid gap-6">
            {requests.map((request) => {
              const needsDocuments = request.stage === 'document_collection';
              const isApproved = request.stage === 'approved';
              const borderClass = needsDocuments ? 'border-red-500 border-2' : isApproved ? 'border-green-500 border-2' : 'border-border/50';
              
              return (
                <Card key={request.id} className={`bg-background/80 ${borderClass}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {request.property?.title || 'Property Financing Request'}
                      </CardTitle>
                      {getStatusBadge(request.status, request.stage)}
                    </div>
                  <p className="text-sm text-muted-foreground">
                    Submitted: {formatDate(request.created_at)}
                    {request.reviewed_at && (
                      <span> • Reviewed: {formatDate(request.reviewed_at)}</span>
                    )}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Last updated: {formatDate(request.updated_at)}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/admin/financing/${request.id}`)}
                    >
                      View Details
                    </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {requests.length === 0 && (
            <Card className="bg-background/80 border-border/50">
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No Financing Requests</h3>
                <p className="text-sm text-muted-foreground">
                  You haven't submitted any financing requests yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}