import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Clock, AlertTriangle } from "lucide-react";

interface RoleAuditLog {
  id: string;
  user_id: string;
  target_user_id: string;
  old_role?: string;
  new_role: string;
  action: string;
  changed_by: string;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

interface PaymentAuditLog {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  order_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export default function SecurityAuditPanel() {
  const [roleAuditLogs, setRoleAuditLogs] = useState<RoleAuditLog[]>([]);
  const [paymentAuditLogs, setPaymentAuditLogs] = useState<PaymentAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      // Fetch role audit logs
      const { data: roleData, error: roleError } = await supabase
        .from('role_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (roleError) throw roleError;

      // Fetch payment audit logs
      const { data: paymentData, error: paymentError } = await supabase
        .from('payment_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (paymentError) throw paymentError;

      setRoleAuditLogs((roleData || []) as RoleAuditLog[]);
      setPaymentAuditLogs((paymentData || []) as PaymentAuditLog[]);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch audit logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'assigned':
        return <Badge variant="default">Assigned</Badge>;
      case 'changed':
        return <Badge variant="secondary">Changed</Badge>;
      case 'revoked':
        return <Badge variant="destructive">Revoked</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'requested':
        return <Badge variant="secondary">Requested</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading audit logs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Security Audit Logs</h2>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Role Changes ({roleAuditLogs.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Payment Requests ({paymentAuditLogs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          {roleAuditLogs.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No role changes logged yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {roleAuditLogs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getActionBadge(log.action)}
                        <span className="text-sm font-medium">
                          {log.old_role ? `${log.old_role} → ${log.new_role}` : log.new_role}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Target User:</span>
                        <p className="font-mono text-xs">{log.target_user_id}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Changed By:</span>
                        <p className="font-mono text-xs">{log.changed_by}</p>
                      </div>
                      {log.ip_address && (
                        <div>
                          <span className="text-muted-foreground">IP Address:</span>
                          <p className="font-mono text-xs">{log.ip_address}</p>
                        </div>
                      )}
                      {log.user_agent && (
                        <div>
                          <span className="text-muted-foreground">User Agent:</span>
                          <p className="font-mono text-xs truncate" title={log.user_agent}>
                            {log.user_agent.substring(0, 50)}...
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          {paymentAuditLogs.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No payment requests logged yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {paymentAuditLogs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(log.status)}
                        <span className="text-sm font-medium">
                          {log.amount.toLocaleString()} {log.currency}
                        </span>
                        <Badge variant="outline">{log.payment_method}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">User ID:</span>
                        <p className="font-mono text-xs">{log.user_id}</p>
                      </div>
                      {log.order_id && (
                        <div>
                          <span className="text-muted-foreground">Order ID:</span>
                          <p className="font-mono text-xs">{log.order_id}</p>
                        </div>
                      )}
                      {log.ip_address && (
                        <div>
                          <span className="text-muted-foreground">IP Address:</span>
                          <p className="font-mono text-xs">{log.ip_address}</p>
                        </div>
                      )}
                      {log.user_agent && (
                        <div>
                          <span className="text-muted-foreground">User Agent:</span>
                          <p className="font-mono text-xs truncate" title={log.user_agent}>
                            {log.user_agent.substring(0, 50)}...
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}