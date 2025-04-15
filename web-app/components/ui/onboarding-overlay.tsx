"use client"

import { useState, useEffect } from "react"
import { Copy, Check, ArrowLeft, ArrowRight, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function OnboardingOverlay() {
  const [open, setOpen] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [copied, setCopied] = useState(false)

  const totalSteps = 3

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      setOpen(false)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeExample)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const codeExample = `// Install the package
npm install @acme/api
# or
yarn add @acme/api

// Import in your project
import { createClient } from '@acme/api';

// Initialize the client
const client = createClient({
  apiKey: process.env.API_KEY,
  options: {
    timeout: 30000,
    retries: 3,
  }
});

// Example usage
async function fetchData() {
  try {
    const response = await client.data.fetch({
      endpoint: '/users',
      params: {
        limit: 10,
        offset: 0,
      }
    });
    
    console.log('Data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

// Call the function
fetchData().then(data => {
  // Process your data here
  renderResults(data);
});`

  useEffect(() => {
    // Reset copied state when changing steps
    setCopied(false)
  }, [currentStep])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[800px] md:max-w-[900px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>
            {currentStep === 1 && "Welcome to Our Platform"}
            {currentStep === 2 && "Quick Setup"}
            {currentStep === 3 && "You're All Set!"}
          </DialogTitle>
          {/* <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-8 w-8"> */}
          {/*   <X className="h-4 w-4 border border-red-400" /> */}
          {/* </Button> */}
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex justify-center mt-2 mb-6">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-2 w-12 mx-1 rounded-full transition-colors",
                currentStep === index + 1 ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto pr-2 min-h-[300px] max-h-[60vh]">
          {currentStep === 1 && (
            <div className="space-y-4">
              <p>Welcome to our platform! We're excited to have you here.</p>
              <p>
                This quick onboarding will help you get started with our platform in just a few steps. We'll guide you
                through the basics so you can start using our features right away.
              </p>
              <p>Click "Next" to continue.</p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <p>To get started, you'll need to install our package. Copy the following code into your terminal:</p>
              <div className="relative border rounded-md">
                <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[300px] whitespace-pre-wrap">
                  <code className="text-sm">{codeExample}</code>
                </pre>
                <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-8 w-8" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p>After installation, you'll be able to import our components and start building your application.</p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-lg font-medium">Welcome aboard! 🎉</p>
              <p>You're all set to start using our platform. We're thrilled to have you as part of our community.</p>
              <p>If you need any help, check out our documentation or reach out to our support team.</p>
              <p>Happy building!</p>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t sticky bottom-0 bg-background">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button onClick={handleNext} className="flex items-center gap-2">
            {currentStep === totalSteps ? "Get Started" : "Next"}
            {currentStep < totalSteps && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
