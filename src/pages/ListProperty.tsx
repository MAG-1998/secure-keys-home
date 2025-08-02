import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { MagitLogo } from "@/components/MagitLogo"
import { PaymentMethods } from "@/components/PaymentMethods"
import { Footer } from "@/components/Footer"
import { useTranslation } from "@/hooks/useTranslation"
import { 
  Home, 
  Upload, 
  FileText, 
  Shield, 
  Calendar, 
  CheckCircle, 
  ArrowRight, 
  MapPin,
  Camera,
  User,
  Phone,
  Mail
} from "lucide-react"

const ListProperty = () => {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Property Details
    propertyType: "",
    address: "",
    price: "",
    bedrooms: "",
    customBedrooms: "",
    bathrooms: "",
    customBathrooms: "",
    area: "",
    description: "",
    
    // Owner Details
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    
    // Documents
    documents: [] as File[],
    photos: [] as File[]
  })

  const totalSteps = 6

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Property Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="propertyType">Property Type</Label>
                <Select value={formData.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="address">Property Address</Label>
                <Input 
                  id="address"
                  placeholder="Enter full address in Tashkent"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input 
                    id="price"
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="area">Area (m²)</Label>
                  <Input 
                    id="area"
                    type="number"
                    placeholder="0"
                    value={formData.area}
                    onChange={(e) => handleInputChange("area", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <div className="space-y-2">
                    <Select value={formData.bedrooms} onValueChange={(value) => handleInputChange("bedrooms", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bedrooms" />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5, 6].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'bedroom' : 'bedrooms'}</SelectItem>
                        ))}
                        <SelectItem value="custom">Other (enter custom number)</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.bedrooms === "custom" && (
                      <Input 
                        type="number"
                        placeholder="Enter number of bedrooms"
                        min="0"
                        value={formData.customBedrooms}
                        autoFocus
                        onChange={(e) => handleInputChange("customBedrooms", e.target.value)}
                      />
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <div className="space-y-2">
                    <Select value={formData.bathrooms} onValueChange={(value) => handleInputChange("bathrooms", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bathrooms" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'bathroom' : 'bathrooms'}</SelectItem>
                        ))}
                        <SelectItem value="custom">Other (enter custom number)</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.bathrooms === "custom" && (
                      <Input 
                        type="number"
                        placeholder="Enter number of bathrooms"
                        min="1"
                        value={formData.customBathrooms}
                        autoFocus
                        onChange={(e) => handleInputChange("customBathrooms", e.target.value)}
                      />
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Property Description</Label>
                <Textarea 
                  id="description"
                  placeholder="Describe your property's features, condition, and highlights..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Owner Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ownerName">Full Name</Label>
                <Input 
                  id="ownerName"
                  placeholder="Enter your full name"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange("ownerName", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="ownerPhone">Phone Number</Label>
                <Input 
                  id="ownerPhone"
                  placeholder="+998 90 123 45 67"
                  value={formData.ownerPhone}
                  onChange={(e) => handleInputChange("ownerPhone", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="ownerEmail">Email Address</Label>
                <Input 
                  id="ownerEmail"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.ownerEmail}
                  onChange={(e) => handleInputChange("ownerEmail", e.target.value)}
                />
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-magit-success mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Verification Required</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      We'll verify your identity and property ownership for the safety of all users. 
                      This helps maintain our 95% trust rating.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Property Photos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Upload Property Photos</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Upload at least 5 high-quality photos of your property
                </p>
                <Button variant="outline">
                  Choose Photos
                </Button>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Photo Guidelines</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Include exterior and interior shots</li>
                  <li>• Show all rooms and key features</li>
                  <li>• Use good lighting and clean spaces</li>
                  <li>• Maximum 20 photos, minimum 5</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Required Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Property Title/Deed</h4>
                      <p className="text-sm text-muted-foreground">Proof of ownership</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Upload
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Passport/ID</h4>
                      <p className="text-sm text-muted-foreground">Owner identification</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Upload
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Property Assessment</h4>
                      <p className="text-sm text-muted-foreground">Official valuation (if available)</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Checkbox id="virtualTour" />
                  <div className="flex-1">
                    <Label htmlFor="virtualTour" className="font-semibold text-sm text-blue-900 dark:text-blue-100 cursor-pointer">
                      Professional Virtual Tour (+300,000 UZS)
                    </Label>
                    <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                      Our certified agent will visit your property within 2-3 business days 
                      to verify details and create professional virtual tour photos.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Payment & Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-card p-6 rounded-lg">
                <h3 className="font-semibold mb-4">Listing Fees</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Basic Listing:</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Professional Virtual Tour:</span>
                    <span>300,000 UZS</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>300,000 UZS</span>
                  </div>
                </div>
              </div>
              
              <PaymentMethods 
                amount={300000} 
                onPaymentSuccess={() => {
                  setCurrentStep(6)
                }}
              />
            </CardContent>
          </Card>
        )

      case 6:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Review & Submit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-card p-6 rounded-lg">
                <h3 className="font-semibold mb-4">Application Summary</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Property Type:</span>
                    <span className="capitalize">{formData.propertyType || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address:</span>
                    <span>{formData.address || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span>{formData.price ? `${formData.price} UZS` : "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owner:</span>
                    <span>{formData.ownerName || "Not specified"}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-green-900 dark:text-green-100 mb-2">
                      What happens next?
                    </h4>
                    <ul className="text-sm text-green-700 dark:text-green-200 space-y-1">
                      <li>• Document review within 24 hours</li>
                      <li>• Field agent visit scheduled</li>
                      <li>• Property verification and photos</li>
                      <li>• Listing goes live with verified badge</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <Button className="w-full" size="lg">
                Submit Application
              </Button>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <MagitLogo size="md" />
            <Button variant="ghost" onClick={() => window.location.href = '/'}>
              Back to Home
            </Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-12 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="success" className="mb-4">
              Seller Portal
            </Badge>
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
              List Your Property on <span className="text-primary">Magit</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Join our verified marketplace and reach serious buyers with transparent, 
              Halal-compliant financing options.
            </p>
            
            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
                <span className="text-sm text-muted-foreground">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < totalSteps ? (
                <Button onClick={nextStep} className="flex items-center gap-2">
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button variant="success" className="flex items-center gap-2">
                  Complete Application
                  <CheckCircle className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading font-bold text-2xl text-center mb-8">
              Why List with Magit?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Shield className="w-8 h-8 text-magit-success mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Verified Buyers Only</h3>
                  <p className="text-sm text-muted-foreground">
                    All buyers are pre-screened with verified financing and serious intent.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <CheckCircle className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Zero Commission</h3>
                  <p className="text-sm text-muted-foreground">
                    List your property for free. No hidden fees or commission charges.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <MapPin className="w-8 h-8 text-magit-warning mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Premium Exposure</h3>
                  <p className="text-sm text-muted-foreground">
                    Featured on our AI-powered platform with smart buyer matching.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer isHalalMode={false} t={t} />
    </div>
  )
}

export default ListProperty