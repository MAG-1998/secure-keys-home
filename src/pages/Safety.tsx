import { Shield, AlertTriangle, Users, Eye, Lock, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/hooks/useTranslation";

const Safety = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
              Safety & Security
            </h1>
            <p className="text-xl text-muted-foreground">
              Your safety is our top priority. Learn about our security measures and safety guidelines.
            </p>
          </div>

          {/* Safety Alert */}
          <Alert className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Safety First:</strong> Always meet in public places, verify property ownership, and trust your instincts. 
              Report any suspicious activity immediately.
            </AlertDescription>
          </Alert>

          {/* Safety Guidelines Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Property Visits
                </CardTitle>
                <CardDescription>Guidelines for safe property viewing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm">Always meet the property owner in daylight hours</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm">Bring a friend or family member with you</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm">Verify the property owner's identity and documents</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm">Share your visit details with someone you trust</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Communication
                </CardTitle>
                <CardDescription>Safe communication practices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm">Use our in-app messaging system initially</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm">Be cautious when sharing personal information</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm">Report inappropriate or suspicious messages</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm">Never send money before viewing the property</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Data Protection
                </CardTitle>
                <CardDescription>How we protect your information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm">All data is encrypted and stored securely</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm">We verify all property listings before publication</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm">Your personal information is never shared with third parties</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm">Regular security audits and updates</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Fraud Prevention
                </CardTitle>
                <CardDescription>Warning signs to watch for</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Requests for money transfers before viewing</p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Prices significantly below market value</p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Sellers who refuse to meet in person</p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Pressure to make quick decisions or payments</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Contact Section */}
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Emergency & Support
              </CardTitle>
              <CardDescription>
                If you feel unsafe or encounter suspicious activity
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-background/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Emergency Services</h4>
                  <p className="text-2xl font-bold text-destructive">102</p>
                  <p className="text-sm text-muted-foreground">Police Emergency Line</p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Platform Support</h4>
                  <Button variant="outline" className="w-full">
                    Report an Issue
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">24/7 Support Available</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips Section */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-heading font-bold mb-6">Additional Safety Tips</h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h3 className="font-semibold mb-2">Trust Your Instincts</h3>
                <p className="text-sm text-muted-foreground">
                  If something feels wrong, don't proceed. Your safety is more important than any property deal.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Verify Everything</h3>
                <p className="text-sm text-muted-foreground">
                  Check property documents, ownership certificates, and the seller's identity thoroughly.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Stay Connected</h3>
                <p className="text-sm text-muted-foreground">
                  Keep friends and family informed about your property visits and meetings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer t={t} />
    </div>
  );
};

export default Safety;