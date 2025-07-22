// "use client"

// import { MockApiPlatform } from "@/components/mock-api-platform"

// export default function Home() {
//   return <MockApiPlatform />
// }

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowRight, Zap, Code, Sparkles, Globe, Shield, Rocket, Star, Users, Clock, Database } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Create mock APIs in seconds with our intuitive interface",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Powered",
      description: "Generate realistic mock data and endpoints using AI",
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Developer Friendly",
      description: "RESTful APIs with proper HTTP methods and status codes",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Real-time Testing",
      description: "Test your APIs instantly with our built-in testing tools",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee",
    },
    {
      icon: <Rocket className="h-6 w-6" />,
      title: "Deploy Anywhere",
      description: "Export to multiple formats or deploy to cloud instantly",
    },
  ]

  const stats = [
    { icon: <Users className="h-5 w-5" />, value: "10K+", label: "Developers" },
    { icon: <Database className="h-5 w-5" />, value: "50K+", label: "APIs Created" },
    { icon: <Clock className="h-5 w-5" />, value: "99.9%", label: "Uptime" },
    { icon: <Star className="h-5 w-5" />, value: "4.9/5", label: "Rating" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Amcok API
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge
            variant="secondary"
            className="mb-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered Mock API Platform
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
            Build & Test APIs
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Lightning Fast
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Create, test, and deploy mock APIs in minutes. Perfect for frontend development, API prototyping, and
            testing workflows.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-8"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 bg-transparent">
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-2 text-blue-600 dark:text-blue-400">{stat.icon}</div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              mock APIs
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to streamline your API development workflow
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`border-border/50 hover:border-blue-500/50 transition-all duration-300 cursor-pointer ${
                hoveredFeature === index ? "shadow-lg shadow-blue-500/10 scale-105" : ""
              }`}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-r from-muted/30 to-muted/10 rounded-3xl mx-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get started in
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              3 simple steps
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              step: "1",
              title: "Create Collection",
              description: "Start by creating a new API collection and organizing your endpoints",
            },
            {
              step: "2",
              title: "Design Endpoints",
              description: "Use our AI-powered generator or manually create your API endpoints",
            },
            {
              step: "3",
              title: "Test & Deploy",
              description: "Test your APIs instantly and deploy them to the cloud when ready",
            },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to supercharge your
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              API development?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of developers who trust Amcok API for their mock API needs
          </p>
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-12"
            >
              Start Building Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/20">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <Code className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Amcok API Platform
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Documentation
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Support
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
            © 2024 Amcok API Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

