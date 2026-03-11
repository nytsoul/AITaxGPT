import { Link } from "react-router";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  PieChart,
  MessageSquare,
  FileText,
  TrendingUp,
  Github,
  Twitter,
  Linkedin,
  ChevronDown
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "./ui/accordion";

export function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <span className="text-xl font-bold tracking-tight">TaxGPT</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">How it Works</a>
            <a href="#pricing" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">Log In</Link>
            <Link to="/register">
              <Button size="sm" className="rounded-full px-5">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400 blur-[120px] rounded-full mix-blend-multiply transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-400 blur-[120px] rounded-full mix-blend-multiply transition-all duration-700"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold mb-6">
              <Zap className="w-3 h-3 fill-current" />
              Revolutionizing Tax Planning with AI
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-[1.1]">
              Master Your Taxes with <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Pure Intelligence</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Automate your planning, optimize deductions, and simulate scenarios with the most advanced AI tax advisor built for modern professionals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="rounded-full px-8 h-14 text-base shadow-xl shadow-blue-200/50">
                  Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-base bg-white">
                Watch Demo
              </Button>
            </div>
            <div className="mt-12 flex items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/32?img=${i + 10}`} alt="User" />
                  </div>
                ))}
              </div>
              <p>Trusted by 5,000+ taxpayers</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-10 border-y border-gray-50 bg-gray-50/30">
        <div className="max-w-7xl mx-auto px-6 overflow-hidden">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">Integrated with your favorite tools</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale">
            {['QuickBooks', 'Stripe', 'TurboTax', 'Expensify', 'Shopify'].map((brand) => (
              <span key={brand} className="text-2xl font-black text-gray-800 tracking-tighter">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Everything you need, <br className="hidden md:block" />nothing you don't</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Powerful features designed to give you complete control over your financial destiny.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-blue-600" />}
              title="Audit Protection"
              description="Our AI continuously monitors your data to ensure everything is compliant and ready for any inquiry."
            />
            <FeatureCard
              icon={<PieChart className="w-6 h-6 text-purple-600" />}
              title="Scenario Simulator"
              description="Instantly model the tax impact of investments, side hustles, or major purchases before you make them."
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6 text-green-600" />}
              title="Yield Optimization"
              description="Find every dollar of tax alpha by identifying credits and deductions you might have missed."
            />
            <FeatureCard
              icon={<MessageSquare className="w-6 h-6 text-orange-600" />}
              title="AI Advisor"
              description="Get answers to complex tax questions in plain English, 24/7 without waiting for an accountant."
            />
            <FeatureCard
              icon={<FileText className="w-6 h-6 text-pink-600" />}
              title="Document OCR"
              description="Snap a photo of your receipt and our engine instantly categorizes and links it to relevant deductions."
            />
            <FeatureCard
              icon={<CheckCircle2 className="w-6 h-6 text-indigo-600" />}
              title="Filing Prep"
              description="We organize all your figures into a ready-to-file package for your CPA or tax software."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 bg-black text-white rounded-[2rem] mx-4 my-8 md:rounded-[4rem]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-3xl md:text-6xl font-bold mb-8 leading-tight">Tax planning as simple as a conversation</h2>
            <div className="space-y-12">
              <Step
                num="01"
                title="Connect & Import"
                description="Securely link your bank accounts or upload your last 3 years of tax returns."
              />
              <Step
                num="02"
                title="AI Analysis"
                description="Our engine identifies patterns, missing deductions, and optimization opportunities."
              />
              <Step
                num="03"
                title="Execute Tactics"
                description="Follow our clear roadmap to lower your tax liability throughout the year."
              />
            </div>
          </div>
          <div className="flex-1 w-full flex justify-center">
            <div className="relative w-full aspect-square max-w-md bg-gradient-to-tr from-blue-600/20 to-purple-600/20 border border-white/10 rounded-3xl overflow-hidden p-8">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
              <div className="relative z-10 space-y-4">
                <div className="h-4 w-32 bg-white/20 rounded-full animate-pulse"></div>
                <div className="h-4 w-full bg-white/10 rounded-full"></div>
                <div className="h-4 w-full bg-white/10 rounded-full"></div>
                <div className="h-4 w-4/5 bg-white/10 rounded-full"></div>
                <div className="pt-8 h-32 w-full bg-blue-600/20 rounded-2xl border border-blue-500/30 flex items-center justify-center">
                  <span className="text-xl font-bold">Tax Savings Found: $4,280</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Simple, transparent pricing</h2>
            <p className="text-gray-500">Choose the plan that's right for your financial complexity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <PricingCard
              name="Individuals"
              price="0"
              features={["Dashboard access", "1 Document upload/mo", "Basic deductions", "Community support"]}
              cta="Choose Free"
            />
            <PricingCard
              name="Pro"
              price="29"
              isPopular={true}
              features={["Unlimited uploads", "AI Advisor 24/7", "Scenario modeling", "Export to CPA", "Priority Support"]}
              cta="Try Pro Free"
            />
            <PricingCard
              name="Freelancers"
              price="49"
              features={["S-Corp simulations", "Business expense tracking", "Quarterly payment estimates", "Multi-income support"]}
              cta="Get Freelancer"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-gray-900">Loved by high-performers</h2>
              <p className="text-gray-500">From software engineers to small business owners, we're changing how people think about taxes.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full"><ArrowRight className="rotate-180" /></Button>
              <Button variant="outline" size="icon" className="rounded-full"><ArrowRight /></Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Testimonial
              quote="TaxGPT saved me over $4,000 in my first year. The scenario simulator is like having a crystal ball for my finances."
              author="Sarah Jenkins"
              role="Senior Dev @ TechCorp"
            />
            <Testimonial
              quote="I used to dread tax season. Now I check my dashboard every week. It's actually empowering to see where my money goes."
              author="Michael Chen"
              role="Freelance Designer"
            />
            <Testimonial
              quote="The AI advisor actually understands S-Corp nuances. Better than most accountants I've hired in the past."
              author="Jessica Williams"
              role="Agency Owner"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center tracking-tight">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b-gray-100">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">Is my data secure?</AccordionTrigger>
              <AccordionContent className="text-gray-500 leading-relaxed pt-2 pb-6">
                Yes. We use bank-grade 256-bit encryption and never share your data with third parties. Your financial privacy is our top priority.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-b-gray-100">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">How does the AI advisor work?</AccordionTrigger>
              <AccordionContent className="text-gray-500 leading-relaxed pt-2 pb-6">
                Our AI is trained on thousands of pages of tax law and IRS publications. It analyzes your specific profile to provide personalized, relevant guidance based on the latest regulations.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-b-gray-100">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">Can I use this with my existing CPA?</AccordionTrigger>
              <AccordionContent className="text-gray-500 leading-relaxed pt-2 pb-6">
                Absolutely! Most of our users use TaxGPT to organize their data and then export a clean report that their CPA can use to file taxes in minutes.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-12 text-white text-center shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full"></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Stop guessing, start optimizing</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-xl mx-auto">Join thousands of smart taxpayers who trust TaxGPT for their financial future.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="rounded-full bg-white text-blue-600 hover:bg-gray-100 px-10 h-14 text-lg">Create Free Account</Button>
              </Link>
              <p className="text-sm text-blue-200">No credit card required</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <span className="text-xl font-bold tracking-tight">TaxGPT</span>
              </div>
              <p className="text-gray-500 mb-8 max-w-sm">The world's most advanced AI-powered tax planning platform designed for clarity and impact.</p>
              <div className="flex gap-4">
                <Twitter className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-400 transition-colors" />
                <Linkedin className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-700 transition-colors" />
                <Github className="w-5 h-5 text-gray-400 cursor-pointer hover:text-black transition-colors" />
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li className="hover:text-black cursor-pointer">Features</li>
                <li className="hover:text-black cursor-pointer">Simulation</li>
                <li className="hover:text-black cursor-pointer">Security</li>
                <li className="hover:text-black cursor-pointer">Changelog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li className="hover:text-black cursor-pointer">About Us</li>
                <li className="hover:text-black cursor-pointer">Careers</li>
                <li className="hover:text-black cursor-pointer">Contact</li>
                <li className="hover:text-black cursor-pointer">Support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li className="hover:text-black cursor-pointer">Privacy Policy</li>
                <li className="hover:text-black cursor-pointer">Terms of Service</li>
                <li className="hover:text-black cursor-pointer">Compliance</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-50 text-xs text-gray-400 gap-4">
            <p>© 2026 TaxGPT AI. All rights reserved.</p>
            <div className="flex gap-8">
              <span>Made with ❤️ for better finance</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-8 rounded-3xl border border-gray-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all bg-white"
    >
      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-sm">{description}</p>
    </motion.div>
  );
}

function Step({ num, title, description }: { num: string, title: string, description: string }) {
  return (
    <div className="flex gap-6 group">
      <div className="text-4xl font-black text-gray-800 group-hover:text-blue-500 transition-colors">{num}</div>
      <div>
        <h4 className="text-xl font-bold mb-2">{title}</h4>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function PricingCard({ name, price, features, cta, isPopular }: { name: string, price: string, features: string[], cta: string, isPopular?: boolean }) {
  return (
    <div className={`p-10 rounded-3xl border ${isPopular ? 'border-blue-500 shadow-2xl shadow-blue-500/10' : 'border-gray-100'} relative bg-white`}>
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Most Popular</span>
      )}
      <h3 className="text-lg font-bold mb-4">{name}</h3>
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-4xl font-black">${price}</span>
        <span className="text-gray-400">/mo</span>
      </div>
      <ul className="space-y-4 mb-10">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-3 text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
            {feature}
          </li>
        ))}
      </ul>
      <Button variant={isPopular ? 'default' : 'outline'} className={`w-full rounded-full h-12 ${isPopular ? 'shadow-lg shadow-blue-500/25' : ''}`}>
        {cta}
      </Button>
    </div>
  );
}

function Testimonial({ quote, author, role }: { quote: string, author: string, role: string }) {
  return (
    <div className="bg-white p-10 rounded-3xl border border-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-1 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Zap key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-lg text-gray-700 font-medium italic mb-8">"{quote}"</p>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div>
          <h4 className="font-bold text-sm">{author}</h4>
          <p className="text-xs text-gray-400">{role}</p>
        </div>
      </div>
    </div>
  );
}
