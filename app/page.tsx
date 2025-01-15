import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Camera, Code2, Mic, PlayCircle, Video } from 'lucide-react'
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center pt-24 px-4">
      <div className="text-center space-y-4 mb-16">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          AI Interview Assistant
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Crafting interview success through{" "}
          <span className="text-blue-400">intelligent practice</span>,{" "}
          <span className="text-purple-400">thoughtful feedback</span>, and{" "}
          <span className="text-pink-400">innovative coaching</span>
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <Button size="lg" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
            Start Practice
          </Button>
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </div>
      </div>

      <section className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-purple-400 bg-clip-text text-transparent">
          Beyond the Interview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Mic className="h-8 w-8" />}
            title="Voice Recognition"
            description="Real-time speech processing for natural conversation flow"
          />
          <FeatureCard
            icon={<Brain className="h-8 w-8" />}
            title="AI Analysis"
            description="Advanced AI feedback on your interview responses"
          />
          <FeatureCard
            icon={<Code2 className="h-8 w-8" />}
            title="Technical Interviews"
            description="Specialized practice for technical roles"
          />
          <FeatureCard
            icon={<Video className="h-8 w-8" />}
            title="Video Analysis"
            description="Optional video recording for body language feedback"
          />
          <FeatureCard
            icon={<PlayCircle className="h-8 w-8" />}
            title="Practice Sessions"
            description="Structured interview practice with instant feedback"
          />
          <FeatureCard
            icon={<Camera className="h-8 w-8" />}
            title="Progress Tracking"
            description="Monitor your improvement over time"
          />
        </div>
      </section>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="bg-background/50 border-muted hover:border-muted-foreground/50 transition-colors">
      <CardHeader>
        <div className="bg-gradient-to-br from-purple-500 to-blue-500 w-fit p-2 rounded-lg mb-4">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

