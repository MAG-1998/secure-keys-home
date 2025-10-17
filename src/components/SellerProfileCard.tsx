import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { Building2, Calendar, Home, MapPin, ShieldCheck } from 'lucide-react';
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

interface OtherProperty {
  id: string;
  title: string;
  price: number;
  location: string;
  image_url?: string | null;
}

interface SellerProfileCardProps {
  profile: SellerProfile;
  currentPropertyId: string;
}

export const SellerProfileCard = ({ profile, currentPropertyId }: SellerProfileCardProps) => {
  const { t } = useTranslation();
  const [otherProperties, setOtherProperties] = useState<OtherProperty[]>([]);
  const [propertyCount, setPropertyCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

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
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch other properties
      const { data } = await supabase
        .from('properties')
        .select('id, title, price, location, image_url')
        .eq('user_id', profile.user_id)
        .in('status', ['active', 'approved'])
        .neq('id', currentPropertyId)
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (data) setOtherProperties(data);
      
      // Fetch total property count
      const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.user_id)
        .in('status', ['active', 'approved']);
      
      if (count !== null) setPropertyCount(count);
      
      setLoading(false);
    };
    
    fetchData();
  }, [profile.user_id, currentPropertyId]);

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
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Company Description */}
        {profile.account_type === 'legal_entity' && profile.company_description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {profile.company_description}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
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

        {/* Other Listings */}
        <div className="pt-4 border-t">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {t('seller.otherListings')}
          </h4>
          
          {loading ? (
            <div className="text-sm text-muted-foreground">{t('common.loading')}</div>
          ) : otherProperties.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('seller.noOtherListings')}</p>
          ) : (
            <div className="space-y-2">
              {otherProperties.map((property) => (
                <Link
                  key={property.id}
                  to={`/property/${property.id}`}
                  className="flex gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors group"
                >
                  <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
                    {property.image_url && (
                      <img
                        src={property.image_url}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                      {property.title}
                    </h5>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {property.location}
                    </p>
                    <p className="font-semibold text-sm mt-1">
                      {property.price.toLocaleString()} {t('common.currency')}
                    </p>
                  </div>
                </Link>
              ))}
              
              {otherProperties.length >= 4 && (
                <Link
                  to={`/properties?seller=${profile.user_id}`}
                  className="block text-sm text-primary hover:underline text-center pt-2"
                >
                  {t('seller.viewAll').replace('{{count}}', String(propertyCount))}
                </Link>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

