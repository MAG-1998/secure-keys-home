import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { Building2, Calendar, Home, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface SellerProfile {
  user_id: string;
  full_name?: string | null;
  email?: string | null;
  account_type?: string | null;
  company_name?: string | null;
  company_logo_url?: string | null;
  company_description?: string | null;
  is_verified?: boolean;
  verification_status?: string | null;
  created_at?: string;
}

interface SellerProfileCardProps {
  profile: SellerProfile;
  currentPropertyId: string;
}

export const SellerProfileCard = ({ profile, currentPropertyId }: SellerProfileCardProps) => {
  const { t } = useTranslation();
  const [propertyCount, setPropertyCount] = useState<number>(0);

  const displayName = profile.account_type === 'legal_entity' 
    ? profile.company_name 
    : profile.full_name || profile.email?.split('@')[0] || t('seller.anonymous');

  const initials = displayName
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  useEffect(() => {
    const fetchPropertyCount = async () => {
      const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.user_id)
        .in('status', ['active', 'approved']);
      
      if (count !== null) setPropertyCount(count);
    };
    
    fetchPropertyCount();
  }, [profile.user_id]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/10">
            {profile.account_type === 'legal_entity' && profile.company_logo_url && (
              <AvatarImage src={profile.company_logo_url} alt={displayName} />
            )}
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg truncate">{displayName}</CardTitle>
              {profile.is_verified && (
                <Badge variant="trust" className="gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  {t('seller.verified')}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {profile.account_type === 'legal_entity' 
                  ? t('seller.business') 
                  : t('seller.individual')}
              </Badge>
            </div>

            {/* Stats - Member Since & Property Count */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {profile.created_at && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">{t('seller.memberSince')}</div>
                    <div className="font-medium">
                      {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <Home className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">{t('seller.totalProperties')}</div>
                  <div className="font-medium">{propertyCount}</div>
                </div>
              </div>
            </div>

            {/* View All Properties Button */}
            <Button
              asChild
              variant="outline"
              className="w-full mt-4"
            >
              <Link to={`/properties?seller=${profile.user_id}`} className="gap-2">
                <Building2 className="h-4 w-4" />
                {t('seller.viewDetails')}
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>

      {profile.account_type === 'legal_entity' && profile.company_description && (
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {profile.company_description}
          </p>
        </CardContent>
      )}
    </Card>
  );
};

