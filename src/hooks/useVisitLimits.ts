import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";

interface VisitLimitInfo {
  canCreate: boolean;
  reason: string;
  freeVisitsUsed: number;
  isRestricted: boolean;
  loading: boolean;
}

export const useVisitLimits = (propertyId?: string) => {
  const { user } = useUser();
  const [limitInfo, setLimitInfo] = useState<VisitLimitInfo>({
    canCreate: false,
    reason: "",
    freeVisitsUsed: 0,
    isRestricted: false,
    loading: true,
  });

  const checkLimits = async () => {
    if (!user?.id) {
      setLimitInfo({
        canCreate: false,
        reason: "User not authenticated",
        freeVisitsUsed: 0,
        isRestricted: false,
        loading: false,
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('can_user_create_visit_request', { 
          user_id_param: user.id,
          property_id_param: propertyId || null
        });

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0];
        setLimitInfo({
          canCreate: result.can_create,
          reason: result.reason,
          freeVisitsUsed: result.free_visits_used,
          isRestricted: result.is_restricted,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error checking visit limits:', error);
      setLimitInfo({
        canCreate: false,
        reason: "Error checking limits",
        freeVisitsUsed: 0,
        isRestricted: false,
        loading: false,
      });
    }
  };

  useEffect(() => {
    checkLimits();
  }, [user?.id, propertyId]);

  return { ...limitInfo, recheckLimits: checkLimits };
};