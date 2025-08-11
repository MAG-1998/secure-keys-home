import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Suggestion {
  id: string;
  current_district: string | null;
  suggested_district: string;
  source: "geocoder" | "location";
}

export default function DistrictReviewPanel({ onApplied }: { onApplied?: () => void }) {
  const [limit, setLimit] = useState(200);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [propsMeta, setPropsMeta] = useState<Record<string, { title?: string; location?: string }>>({});
  const { toast } = useToast();

  const ids = useMemo(() => suggestions.map(s => s.id), [suggestions]);

  useEffect(() => {
    if (ids.length === 0) return;
    (async () => {
      const { data } = await supabase
        .from('properties')
        .select('id, title, location')
        .in('id', ids);
      const map: Record<string, { title?: string; location?: string }> = {};
      (data || []).forEach(p => { map[p.id] = { title: p.title, location: p.location }; });
      setPropsMeta(map);
    })();
  }, [ids]);

  const scan = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('backfill-districts', {
        body: { preview: true, limit }
      });
      if (error || (data as any)?.error) throw (error || new Error((data as any)?.error));
      const res = data as { total: number; suggested: number; suggestions: Suggestion[] };
      setSuggestions(res.suggestions || []);
      toast({ title: 'Scan complete', description: `Found ${res.suggested} suggestion(s) out of ${res.total} checked.` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to scan for suggestions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const apply = async (s: Suggestion) => {
    setApplying(s.id);
    try {
      const { error } = await supabase
        .from('properties')
        .update({ district: s.suggested_district })
        .eq('id', s.id);
      if (error) throw error;
      setSuggestions(prev => prev.filter(x => x.id !== s.id));
      onApplied?.();
      toast({ title: 'Updated', description: `District set to ${s.suggested_district}` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to apply change', variant: 'destructive' });
    } finally {
      setApplying(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>District review (manual)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Limit</span>
            <Input
              type="number"
              value={limit}
              onChange={(e) => setLimit(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
              className="w-24"
            />
          </div>
          <Button onClick={scan} disabled={loading}>{loading ? 'Scanning…' : 'Scan suggestions'}</Button>
          {suggestions.length > 0 && (
            <Badge variant="secondary">{suggestions.length} suggestion(s)</Badge>
          )}
        </div>

        {suggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No suggestions yet. Run a scan to preview districts without auto-changing.</p>
        ) : (
          <div className="space-y-3">
            {suggestions.map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-4 border rounded-md p-3">
                <div className="space-y-1">
                  <div className="text-sm font-medium">{propsMeta[s.id]?.title || 'Property'} <span className="text-muted-foreground">({s.id.slice(0,8)}…)</span></div>
                  <div className="text-xs text-muted-foreground truncate max-w-xl">{propsMeta[s.id]?.location}</div>
                  <div className="text-sm">Current: <Badge variant="outline">{s.current_district || '—'}</Badge></div>
                  <div className="text-sm">Suggested: <Badge>{s.suggested_district}</Badge> <span className="text-xs text-muted-foreground">via {s.source}</span></div>
                </div>
                <div className="shrink-0">
                  <Button onClick={() => apply(s)} disabled={applying === s.id}>{applying === s.id ? 'Applying…' : 'Apply'}</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
