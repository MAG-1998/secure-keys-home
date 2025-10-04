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

const SUPABASE_URL = 'https://mvndmnkgtoygsvesktgw.supabase.co';

const normalizeUrl = (url: string) => {
  if (!url) return url;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/storage/v1/object/authenticated/')) {
    return `${SUPABASE_URL}${url.replace('/storage/v1/object/authenticated/', '/storage/v1/object/public/')}`;
  }
  if (url.startsWith('/storage/v1/')) return `${SUPABASE_URL}${url}`;
  return url;
};

const extractStoragePath = (urlData: any): string | null => {
  // New format: { path, url }
  if (typeof urlData === 'object' && urlData?.path) {
    return urlData.path;
  }
  
  // Old format: string URL
  if (typeof urlData === 'string') {
    const match = urlData.match(/\/documents\/(.+)$/);
    return match ? match[1] : null;
  }
  
  return null;
};

const FileDownloadButton = ({ urlData, index }: { urlData: any; index: number }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setLoading(true);
    try {
      const storagePath = extractStoragePath(urlData);
      console.log('Opening document:', { urlData, storagePath });
      
      if (!storagePath) {
        // Fallback to normalized URL for old data
        const fallbackUrl = typeof urlData === 'string' ? normalizeUrl(urlData) : urlData?.url;
        if (fallbackUrl) {
          window.open(fallbackUrl, '_blank');
          return;
        }
        throw new Error('Unable to determine file path');
      }

      // Generate signed URL (valid for 1 hour)
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(storagePath, 3600);

      if (error) throw error;
      if (!data?.signedUrl) throw new Error('No signed URL generated');

      console.log('Generated signed URL:', data.signedUrl);
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Failed to open document:', error);
      toast({
        title: "Error",
        description: "Failed to open document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <FileText className="w-4 h-4" />
      <Button
        variant="link"
        onClick={handleDownload}
        disabled={loading}
        className="text-sm text-blue-600 hover:underline flex items-center gap-1 h-auto p-0"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            Loading...
          </>
        ) : (
          <>
            Document {index + 1}
            <Download className="w-3 h-3" />
          </>
        )}
      </Button>
    </div>
  );
};

export const DocumentUploadManager = ({ docRequests, financingRequestId, onRefresh }: DocumentUploadManagerProps) => {
  const [uploading, setUploading] = useState<string | null>(null);
  const [responseNotes, setResponseNotes] = useState<{ [key: string]: string }>({});
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: FileList | null }>({});
  const [confirmingSubmission, setConfirmingSubmission] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useUser();

  const handleFileSelection = (docRequestId: string, files: FileList | null) => {
    console.log('🔵 [FILE_SELECTION] Starting file selection', { 
      docRequestId, 
      fileCount: files?.length || 0,
      userId: user?.id,
      financingRequestId 
    });
    
    if (!files || files.length === 0) {
      console.log('⚠️ [FILE_SELECTION] No files selected, clearing', { docRequestId });
      setSelectedFiles(prev => ({ ...prev, [docRequestId]: null }));
      return;
    }
    
    console.log('✅ [FILE_SELECTION] Files selected successfully', {
      docRequestId,
      files: Array.from(files).map(f => ({ name: f.name, size: f.size, type: f.type }))
    });
    
    setSelectedFiles(prev => ({ ...prev, [docRequestId]: files }));
  };

  const handleDocumentSubmission = async (docRequestId: string) => {
    console.log('🟢 [SUBMISSION_START] Document submission initiated', { 
      docRequestId, 
      financingRequestId,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
    
    const files = selectedFiles[docRequestId];
    
    console.log('🔍 [VALIDATION] Checking files', { 
      docRequestId,
      hasFiles: !!files,
      fileCount: files?.length || 0,
      selectedFilesState: Object.keys(selectedFiles)
    });
    
    if (!files || files.length === 0) {
      console.error('❌ [VALIDATION] No files to submit', { docRequestId, selectedFiles });
      toast({
        title: "Error",
        description: "Please select files to upload first",
        variant: "destructive"
      });
      return;
    }
    
    console.log('🔍 [USER_CHECK] Validating user authentication', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email
    });
    
    if (!user?.id) {
      console.error('❌ [USER_CHECK] User not authenticated', { user });
      toast({
        title: "Error",
        description: "You must be logged in to upload documents",
        variant: "destructive"
      });
      return;
    }

    setConfirmingSubmission(null);
    setUploading(docRequestId);
    
    console.log('📤 [UPLOAD_PHASE] Starting file upload phase', {
      docRequestId,
      financingRequestId,
      fileCount: files.length,
      userId: user.id
    });
    
    try {
      const uploadedUrls: Array<{ path: string; url: string }> = [];

      // Step 1: Upload files to Supabase storage
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${docRequestId}_${i}_${Date.now()}.${fileExt}`;
        const filePath = `${user?.id}/${financingRequestId}/${fileName}`;
        
        console.log(`📁 [FILE_${i+1}/${files.length}] Preparing upload`, {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          generatedPath: filePath,
          userId: user?.id,
          financingRequestId,
          docRequestId
        });

        const { data, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) {
          console.error(`❌ [FILE_${i+1}/${files.length}] Upload failed`, {
            fileName: file.name,
            error: uploadError,
            errorMessage: uploadError.message,
            errorCode: uploadError.name,
            docRequestId,
            financingRequestId,
            filePath,
            step: 'file_upload'
          });
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }
        
        console.log(`✅ [FILE_${i+1}/${files.length}] Upload successful`, {
          fileName: file.name,
          storagePath: data?.path,
          uploadData: data
        });

        if (data?.path) {
          const { data: pubData } = supabase.storage.from('documents').getPublicUrl(data.path);
          const publicUrl = pubData?.publicUrl || `${SUPABASE_URL}/storage/v1/object/public/documents/${data.path}`;
          console.log(`🔗 [FILE_${i+1}/${files.length}] Generated public URL`, { 
            path: data.path, 
            url: publicUrl 
          });
          uploadedUrls.push({ path: data.path, url: publicUrl });
        } else {
          console.error(`❌ [FILE_${i+1}/${files.length}] No path returned from storage`, {
            fileName: file.name,
            data
          });
        }
      }
      
      console.log('✅ [UPLOAD_PHASE] All files uploaded successfully', {
        totalFiles: files.length,
        uploadedCount: uploadedUrls.length,
        uploadedUrls
      });

      console.log('🔄 [RPC_PHASE] Starting RPC call to mark_doc_submitted', {
        docRequestId,
        financingRequestId,
        uploadedUrlsCount: uploadedUrls.length,
        uploadedUrls,
        responseNotes: responseNotes[docRequestId] || null
      });

      // Step 2: Call RPC to mark document as submitted
      const { data: rpcRes, error: rpcError } = await supabase.rpc('mark_doc_submitted' as any, {
        doc_req_id: docRequestId,
        uploaded_urls: uploadedUrls,
        response_notes_param: responseNotes[docRequestId] || null,
      });

      console.log('📊 [RPC_RESPONSE] RPC call completed', { 
        rpcRes, 
        rpcError,
        rpcResType: typeof rpcRes,
        rpcErrorDetails: rpcError ? {
          message: rpcError.message,
          code: rpcError.code,
          details: rpcError.details,
          hint: rpcError.hint
        } : null
      });

      const rpcResult = rpcRes as { ok: boolean; err?: string } | null;
      
      console.log('🔍 [RPC_RESULT_CHECK] Analyzing RPC result', {
        hasRpcError: !!rpcError,
        rpcResult,
        rpcResultOk: rpcResult?.ok,
        rpcResultErr: rpcResult?.err
      });
      
      // If RPC fails, try direct update as fallback
      if (rpcError || rpcResult?.ok === false) {
        console.warn('⚠️ [FALLBACK] RPC failed, attempting direct database update...', { 
          rpcError, 
          rpcResult,
          reason: rpcError ? 'RPC error' : 'RPC returned ok: false'
        });
        
        const updatePayload = {
          user_file_urls: uploadedUrls,
          response_notes: responseNotes[docRequestId] || null,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('📝 [FALLBACK] Preparing direct update', {
          docRequestId,
          updatePayload
        });
        
        const { error: updateError } = await supabase
          .from('halal_finance_doc_requests')
          .update(updatePayload)
          .eq('id', docRequestId);

        if (updateError) {
          console.error('❌ [FALLBACK] Direct update failed', {
            error: updateError,
            errorMessage: updateError.message,
            errorCode: updateError.code,
            errorDetails: updateError.details,
            errorHint: updateError.hint,
            docRequestId
          });
          throw new Error(`Failed to link documents to request: ${updateError.message}`);
        }
        
        console.log('✅ [FALLBACK] Direct update successful - documents linked', {
          docRequestId,
          uploadedUrlsCount: uploadedUrls.length
        });
      } else {
        console.log('✅ [RPC_SUCCESS] RPC completed successfully', { 
          rpcResult,
          docRequestId 
        });
      }

      // ✅ IMMEDIATE SUCCESS ACTIONS - these happen right after RPC success
      toast({
        title: "Success",
        description: "Documents uploaded successfully"
      });

      // Clear the form immediately
      setResponseNotes(prev => ({ ...prev, [docRequestId]: '' }));
      setSelectedFiles(prev => ({ ...prev, [docRequestId]: null }));
      
      // Reset the file input
      const input = document.getElementById(`upload-${docRequestId}`) as HTMLInputElement;
      if (input) input.value = '';
      
      // Refresh data immediately
      onRefresh();

      // ✅ POST-SUCCESS EXTRAS - these run in background and won't block UI if they fail
      try {
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

        // Check if this was the last pending document for additional messaging
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

        console.log('Activity logging and notifications completed successfully');
      } catch (activityError) {
        console.error('Failed to log activity or send notification (non-blocking):', activityError, {
          docRequestId,
          financingRequestId,
          step: 'post_success_extras'
        });
        
        // Show non-blocking warning toast but don't fail the main flow
        toast({
          title: "Partial Success",
          description: "Document submitted but some notifications may have failed",
          variant: "default",
        });
      }

    } catch (error) {
      console.error('❌ [SUBMISSION_ERROR] Document submission failed', {
        error,
        errorType: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        docRequestId,
        financingRequestId,
        userId: user?.id,
        step: 'main_flow',
        timestamp: new Date().toISOString()
      });
      
      const errorMessage = error instanceof Error ? error.message : "Failed to upload documents";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Keep selected files for retry on error
      console.log('💾 [ERROR_RECOVERY] Keeping selected files for retry', {
        docRequestId,
        fileCount: selectedFiles[docRequestId]?.length || 0
      });
    } finally {
      console.log('🏁 [SUBMISSION_END] Submission flow completed', {
        docRequestId,
        uploading: false,
        timestamp: new Date().toISOString()
      });
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
                      {docRequest.user_file_urls.map((urlData, index) => {
                        return (
                          <FileDownloadButton
                            key={index}
                            urlData={urlData}
                            index={index}
                          />
                        );
                      })}
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