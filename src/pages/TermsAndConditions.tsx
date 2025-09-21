import { useTranslation } from "@/hooks/useTranslation"
import { useGlobalHalalMode } from "@/hooks/useGlobalHalalMode"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const TermsAndConditions = () => {
  const { t } = useTranslation()
  const { isHalalMode } = useGlobalHalalMode()

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isHalalMode 
        ? 'bg-gradient-to-br from-magit-trust/5 via-background to-magit-trust/10' 
        : 'bg-gradient-to-br from-primary/5 via-background to-secondary/10'
    }`}>
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using Magit, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">2. Use License</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Permission is granted to temporarily download one copy of Magit's materials for personal, 
              non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display</li>
              <li>attempt to reverse engineer any software contained on the website</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">3. Property Listings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Magit serves as a platform connecting property buyers and sellers. We do not own, sell, or lease any properties listed on our platform.
            </p>
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Listing Accuracy:</h4>
              <p className="text-muted-foreground leading-relaxed">
                While we strive to ensure accuracy, property information is provided by third parties and we cannot guarantee its completeness or accuracy.
              </p>
              <h4 className="font-semibold text-foreground">Verification:</h4>
              <p className="text-muted-foreground leading-relaxed">
                Properties marked as "verified" have undergone our basic verification process, but this does not constitute a guarantee of condition or legal status.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">4. Financial Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Magit offers financing options including traditional and Islamic (Halal) financing solutions.
            </p>
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Financing Terms:</h4>
              <p className="text-muted-foreground leading-relaxed">
                All financing is subject to approval and terms may vary based on creditworthiness and property valuation.
              </p>
              <h4 className="font-semibold text-foreground">Islamic Financing:</h4>
              <p className="text-muted-foreground leading-relaxed">
                Our Halal financing options comply with Islamic principles and are overseen by qualified Islamic finance scholars.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">5. User Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>You must provide accurate and complete information when creating your account</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">6. Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our service.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              By using Magit, you consent to the collection and use of information in accordance with our Privacy Policy.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">7. Prohibited Uses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              You may not use our service:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>For any unlawful purpose or to solicit others to unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
              <li>To upload or transmit viruses or any other type of malicious code</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">8. Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              The materials on Magit are provided on an 'as is' basis. Magit makes no warranties, expressed or implied, 
              and hereby disclaims and negates all other warranties including without limitation, implied warranties or 
              conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Further, Magit does not warrant or make any representations concerning the accuracy, likely results, 
              or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">9. Limitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              In no event shall Magit or its suppliers be liable for any damages (including, without limitation, 
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
              to use the materials on Magit's website, even if Magit or a Magit authorized representative has been 
              notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow 
              limitations on implied warranties, or limitations of liability for consequential or incidental damages, 
              these limitations may not apply to you.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">10. Revisions and Errata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              The materials appearing on Magit's website could include technical, typographical, or photographic errors. 
              Magit does not warrant that any of the materials on its website are accurate, complete, or current. 
              Magit may make changes to the materials contained on its website at any time without notice. 
              However Magit does not make any commitment to update the materials.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">11. Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms & Conditions, please contact us at:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p><strong>Email:</strong> legal@magit.com</p>
              <p><strong>Address:</strong> Magit Legal Department, 123 Real Estate Plaza, Tashkent, Uzbekistan</p>
              <p><strong>Phone:</strong> +998 (71) 123-4567</p>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            These terms and conditions are effective as of {new Date().toLocaleDateString()} and will remain in effect except with respect to any changes in its provisions in the future, 
            which will be in effect immediately after being posted on this page.
          </p>
        </div>
      </main>
      
      <Footer isHalalMode={isHalalMode} t={t} />
    </div>
  )
}

export default TermsAndConditions