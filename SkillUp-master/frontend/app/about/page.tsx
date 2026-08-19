import { Brain, FileText, Target, Trophy, Sparkles, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-20 lg:pt-32 px-4 lg:px-8 pb-12">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-4 text-neutral-100">
            About Skill Up
          </h1>
          <p className="text-xl lg:text-2xl text-neutral-400 max-w-3xl mx-auto">
            Your intelligent learning companion powered by AI
          </p>
        </div>

        {/* Mission */}
        <div className="mb-16">
          <div className="bg-neutral-900 rounded-lg p-8 border border-neutral-800">
            <h2 className="text-3xl font-bold mb-4 text-neutral-100">Our Mission</h2>
            <p className="text-lg text-neutral-300 leading-relaxed">
              Skill Up is designed to revolutionize how you learn. We combine cutting-edge AI 
              technology with intuitive design to help you absorb information faster, retain 
              knowledge better, and achieve your learning goals with confidence.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-neutral-100">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Learn Feature */}
            <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800 hover:border-neutral-700 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-neutral-800 rounded-lg">
                  <FileText className="w-6 h-6 text-neutral-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Smart Document Learning</h3>
                  <p className="text-neutral-400 leading-relaxed">
                    Upload PDFs and documents. Our AI extracts key concepts, generates summaries, 
                    and lets you chat with your content for deeper understanding.
                  </p>
                </div>
              </div>
            </div>

            {/* Quiz Feature */}
            <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800 hover:border-neutral-700 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-neutral-800 rounded-lg">
                  <Brain className="w-6 h-6 text-neutral-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">AI-Generated Quizzes</h3>
                  <p className="text-neutral-400 leading-relaxed">
                    Test your knowledge with custom quizzes generated from your documents. 
                    Get instant feedback and track your progress over time.
                  </p>
                </div>
              </div>
            </div>

            {/* Goals Feature */}
            <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800 hover:border-neutral-700 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-neutral-800 rounded-lg">
                  <Target className="w-6 h-6 text-neutral-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Goal Tracking</h3>
                  <p className="text-neutral-400 leading-relaxed">
                    Set learning objectives, track your progress, and stay motivated with 
                    clear milestones and achievement tracking.
                  </p>
                </div>
              </div>
            </div>

            {/* AI Chat Feature */}
            <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800 hover:border-neutral-700 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-neutral-800 rounded-lg">
                  <Sparkles className="w-6 h-6 text-neutral-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Interactive AI Chat</h3>
                  <p className="text-neutral-400 leading-relaxed">
                    Ask questions about your documents and get instant, context-aware answers 
                    powered by advanced AI models.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-16">
          <div className="bg-neutral-900 rounded-lg p-8 border border-neutral-800">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-neutral-300" />
              <h2 className="text-2xl font-bold text-neutral-100">Built With Modern Technology</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-neutral-200">Frontend</h3>
                <ul className="space-y-2 text-neutral-400">
                  <li>• Next.js 16 & React 19</li>
                  <li>• TypeScript for type safety</li>
                  <li>• Tailwind CSS for styling</li>
                  <li>• Motion for animations</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-neutral-200">Backend</h3>
                <ul className="space-y-2 text-neutral-400">
                  <li>• Go & Gin framework</li>
                  <li>• PostgreSQL with pgvector</li>
                  <li>• AI/LLM integration</li>
                  <li>• JWT authentication</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-neutral-100">How It Works</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center font-bold text-neutral-300">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Upload Your Documents</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Upload PDFs, textbooks, research papers, or any learning material you want to master.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center font-bold text-neutral-300">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">AI Processes Your Content</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Our AI analyzes your documents, extracts key concepts, and creates a searchable knowledge base.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center font-bold text-neutral-300">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Learn & Test Yourself</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Chat with your documents, generate quizzes, get summaries, and track your learning progress.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center font-bold text-neutral-300">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Achieve Your Goals</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Set learning objectives, complete quizzes, and watch your knowledge grow day by day.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-lg p-8 border border-neutral-700">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-3xl font-bold mb-4">Ready to Level Up Your Learning?</h2>
            <p className="text-neutral-400 mb-6 max-w-2xl mx-auto">
              Join thousands of learners who are achieving their goals faster with AI-powered tools.
            </p>
            <a
              href="/learn"
              className="inline-block px-8 py-3 bg-neutral-300 text-black rounded-lg font-semibold hover:bg-neutral-200 transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-neutral-800 text-center text-neutral-500 text-sm">
          <p>© 2025 Skill Up. Built with ❤️ for learners everywhere.</p>
        </div>
      </div>
    </div>
  );
}

