import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Download, Calendar, CheckCircle, Clock, X } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

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

interface DocumentUploadManagerProps {
  docRequests: DocRequest[];
  financingRequestId: string;
  onRefresh: () => void;
}

export const DocumentUploadManager = ({ docRequests, financingRequestId, onRefresh }: DocumentUploadManagerProps) => {
  const [uploading, setUploading] = useState<string | null>(null);
  const [responseNotes, setResponseNotes] = useState<{ [key: string]: string }>({});
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: FileList | null }>({});
  const [confirmingSubmission, setConfirmingSubmission] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useUser();

  const handleFileSelection = (docRequestId: string, files: FileList | null) => {
    if (!files || files.length === 0) {
      setSelectedFiles(prev => ({ ...prev, [docRequestId]: null }));
      return;
    }
    setSelectedFiles(prev => ({ ...prev, [docRequestId]: files }));
  };

  const handleDocumentSubmission = async (docRequestId: string) => {
    const files = selectedFiles[docRequestId];
    if (!files || files.length === 0) return;

    setConfirmingSubmission(null);
    setUploading(docRequestId);
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}/${docRequestId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      // Atomically mark the document as submitted via RPC (handles RLS and stage progression)
      const { data: rpcRes, error: rpcError } = await supabase.rpc('mark_doc_submitted' as any, {
        doc_req_id: docRequestId,
        uploaded_urls: uploadedUrls,
        response_notes: responseNotes[docRequestId] || null,
      });

      const rpcResult = rpcRes as { ok: boolean; err?: string } | null;
      if (rpcError || rpcResult?.ok === false) {
        throw new Error(rpcError?.message || rpcResult?.err || 'Failed to finalize document upload');
      }

      // Get the financing request to find responsible person
      const { data: financingRequest } = await supabase
        .from('halal_financing_requests')
        .select('responsible_person_id, user_id')
        .eq('id', financingRequestId)
        .single();

      // Log activity
      await supabase
        .from('halal_financing_activity_log')
        .insert({
          halal_financing_request_id: financingRequestId,
          actor_id: user?.id,
          action_type: 'doc_submitted',
          details: { 
            document_request_id: docRequestId, 
            files_count: uploadedUrls.length,
            response_notes: responseNotes[docRequestId] || null
          }
        });

      // Notify responsible person if assigned
      if (financingRequest?.responsible_person_id && financingRequest.responsible_person_id !== user?.id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: financingRequest.responsible_person_id,
            type: 'financing:documents_submitted',
            title: 'Documents Submitted',
            body: `User has submitted requested documents for financing request`,
            entity_type: 'halal_financing_request',
            entity_id: financingRequestId,
            data: {
              document_request_id: docRequestId,
              files_count: uploadedUrls.length,
              user_id: financingRequest.user_id
            }
          });
      }

      toast({
        title: "Success",
        description: "Documents uploaded successfully"
      });

      // Check if this was the last pending document
      const remainingPendingDocs = docRequests.filter(
        doc => doc.id !== docRequestId && doc.status === 'pending'
      );
      
      if (remainingPendingDocs.length === 0) {
        // Show additional toast about automatic stage progression
        setTimeout(() => {
          toast({
            title: "All documents submitted!",
            description: "Your financing request has been automatically moved to review stage.",
          });
        }, 1000);
      }

      // Clear the form after successful submission
      setResponseNotes(prev => ({ ...prev, [docRequestId]: '' }));
      setSelectedFiles(prev => ({ ...prev, [docRequestId]: null }));
      
      // Reset the file input
      const input = document.getElementById(`upload-${docRequestId}`) as HTMLInputElement;
      if (input) input.value = '';
      
      onRefresh();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload documents",
        variant: "destructive"
      });
    } finally {
      setUploading(null);
    }
  };

  const removeSelectedFiles = (docRequestId: string) => {
    setSelectedFiles(prev => ({ ...prev, [docRequestId]: null }));
    const input = document.getElementById(`upload-${docRequestId}`) as HTMLInputElement;
    if (input) input.value = '';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'submitted':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700"><CheckCircle className="w-3 h-3 mr-1" />Submitted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (docRequests.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">No Document Requests</h3>
          <p className="text-sm text-muted-foreground">
            No document requests have been made for this financing request.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {docRequests.map((docRequest) => (
        <Card 
          key={docRequest.id} 
          className={`${docRequest.status === 'pending' ? 'border-red-500 border-2' : ''}`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{docRequest.document_type}</CardTitle>
              {getStatusBadge(docRequest.status)}
            </div>
            {docRequest.description && (
              <p className="text-sm text-muted-foreground">{docRequest.description}</p>
            )}
            {docRequest.deadline_at && (
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <Calendar className="w-4 h-4" />
                Deadline: {formatDate(docRequest.deadline_at)}
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            {docRequest.status === 'pending' ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`notes-${docRequest.id}`}>Response Notes (Optional)</Label>
                  <Textarea
                    id={`notes-${docRequest.id}`}
                    placeholder="Add any notes or comments about the documents you're uploading..."
                    value={responseNotes[docRequest.id] || ''}
                    onChange={(e) => setResponseNotes(prev => ({ ...prev, [docRequest.id]: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`upload-${docRequest.id}`}>Upload Documents</Label>
                  <div className="mt-1">
                    <input
                      id={`upload-${docRequest.id}`}
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => handleFileSelection(docRequest.id, e.target.files)}
                      disabled={uploading === docRequest.id}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById(`upload-${docRequest.id}`)?.click()}
                      disabled={uploading === docRequest.id}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {selectedFiles[docRequest.id] ? 'Change Files' : 'Choose Files to Upload'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported formats: PDF, JPG, PNG, DOC, DOCX
                  </p>
                </div>

                {/* File Preview */}
                {selectedFiles[docRequest.id] && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Selected Files ({selectedFiles[docRequest.id]?.length}) - Ready to Submit</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSelectedFiles(docRequest.id)}
                        className="h-6 px-2"
                      >
                        <X className="w-3 h-3" />
                        Clear
                      </Button>
                    </div>
                    <div className="bg-green-50 border border-green-200 p-3 rounded-md space-y-1">
                      {Array.from(selectedFiles[docRequest.id] || []).map((file, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="flex-1">{file.name}</span>
                          <span className="text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200">
                      ✓ Files selected and ready to submit. Click "Submit Documents" below to upload.
                    </div>
                  </div>
                )}

                {/* Submit Button with Confirmation */}
                {selectedFiles[docRequest.id] && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        disabled={uploading === docRequest.id}
                        className="w-full"
                        variant="default"
                      >
                        {uploading === docRequest.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Submit Documents
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Document Submission</AlertDialogTitle>
                        <AlertDialogDescription>
                          <div>
                            You are about to submit {selectedFiles[docRequest.id]?.length} document(s) for "{docRequest.document_type}".
                            {responseNotes[docRequest.id] && (
                              <div className="mt-2 p-2 bg-muted rounded">
                                <strong>Your notes:</strong> {responseNotes[docRequest.id]}
                              </div>
                            )}
                            <div className="mt-2">
                              <strong>Files to submit:</strong>
                              <ul className="list-disc list-inside mt-1 text-sm">
                                {Array.from(selectedFiles[docRequest.id] || []).map((file, index) => (
                                  <li key={index}>{file.name}</li>
                                ))}
                              </ul>
                            </div>
                            This action cannot be undone.
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDocumentSubmission(docRequest.id)}>
                          Yes, Submit Documents
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Submitted on: {docRequest.submitted_at ? formatDate(docRequest.submitted_at) : 'N/A'}
                </div>
                
                {docRequest.response_notes && (
                  <div>
                    <Label>Response Notes</Label>
                    <p className="text-sm bg-muted p-2 rounded mt-1">{docRequest.response_notes}</p>
                  </div>
                )}
                
                {docRequest.user_file_urls && docRequest.user_file_urls.length > 0 && (
                  <div>
                    <Label>Uploaded Files ({docRequest.user_file_urls.length})</Label>
                    <div className="space-y-1 mt-1">
                      {docRequest.user_file_urls.map((url, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            Document {index + 1}
                            <Download className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};