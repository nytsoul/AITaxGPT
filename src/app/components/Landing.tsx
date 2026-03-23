import { Link } from "react-router";
import { FloatingCurrencies } from "./FloatingCurrencies";
import { useEffect, useState } from "react";
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
  ChevronDown,
  Menu,
  X
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "./ui/accordion";
import { useTaxData } from "../providers/TaxDataProvider";

export function Landing() {
  const { user } = useTaxData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-teal-500/20">
      <FloatingCurrencies count={15} />
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-45 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4">
        <div className="max-w-none mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/10">
              <span className="text-white font-bold text-lg leading-none">T</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">TaxGPT</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">How it Works</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">Pricing</a>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link to="/app">
                <Button size="sm" className="rounded-full px-5 bg-teal-600 text-white hover:bg-teal-700 font-medium">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">Log In</Link>
                <Link to="/register">
                  <Button size="sm" className="rounded-full px-5 bg-teal-600 text-white hover:bg-teal-700 font-medium">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 py-6 px-6 space-y-6 overflow-hidden"
          >
            <div className="flex flex-col gap-4">
              <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-slate-600 hover:text-teal-600 transition-colors">Features</a>
              <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-slate-600 hover:text-teal-600 transition-colors">How it Works</a>
              <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-slate-600 hover:text-teal-600 transition-colors">Pricing</a>
            </div>
            <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
              {user ? (
                <Link to="/app" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full rounded-full bg-teal-600 text-white font-medium">Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-center py-2 font-medium text-slate-600">Log In</Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full rounded-full bg-teal-600 text-white font-medium">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(248,250,252,1),rgba(204,251,241,0.2))]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-none h-full -z-10 opacity-60">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="max-w-none mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold mb-8 tracking-wide">
              <Zap className="w-3.5 h-3.5 fill-teal-600 text-teal-600" />
              Advanced AI Tax Command Center
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
              Master Your Taxes with <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Pure Intelligence</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Automate your planning, optimize deductions, and simulate scenarios with the most advanced AI advisor built for modern professionals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="rounded-full px-8 h-14 text-base bg-teal-600 text-white hover:bg-teal-700 shadow-xl shadow-teal-500/20 border-0">
                  Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-base bg-white border-slate-200 text-slate-900 hover:bg-slate-50 shadow-sm">
                  Watch Demo
                </Button>
              </Link>
            </div>
            <div className="mt-12 flex items-center justify-center gap-6 text-sm text-slate-400">
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
      <section className="py-10 border-y border-slate-200 bg-white/40 backdrop-blur-sm">
        <div className="max-w-none mx-auto px-6 overflow-hidden">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Integrated with your financial stack</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-30">
            {['QuickBooks', 'Stripe', 'TurboTax', 'Expensify', 'Shopify'].map((brand) => (
              <span key={brand} className="text-2xl font-black text-slate-900 tracking-tighter">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 relative bg-white">
        <div className="max-w-none mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900">Everything you need, <br className="hidden md:block" />nothing you don't</h2>
            <p className="text-slate-600 max-w-xl mx-auto">Powerful capabilities engineered to give you complete visibility into your tax obligations.</p>
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
      <section id="how-it-works" className="py-24 px-6 bg-slate-50 border-y border-slate-200 relative">
        <div className="max-w-none mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-3xl md:text-6xl font-bold mb-8 leading-tight text-slate-900">Tax planning as simple as a conversation</h2>
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
            <div className="relative w-full aspect-square max-w-md bg-gradient-to-tr from-teal-500/10 to-emerald-500/10 border border-slate-200 rounded-3xl overflow-hidden p-8">
              <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl"></div>
              <div className="relative z-10 space-y-4">
                <div className="h-4 w-32 bg-slate-200 rounded-full animate-pulse"></div>
                <div className="h-4 w-full bg-slate-100 rounded-full"></div>
                <div className="h-4 w-full bg-slate-100 rounded-full"></div>
                <div className="h-4 w-4/5 bg-slate-100 rounded-full"></div>
                <div className="pt-8 h-32 w-full bg-teal-500/10 rounded-2xl border border-teal-500/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-teal-700">Tax Savings Found: $4,280</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 relative bg-white">
        <div className="max-w-none mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900">Transparent structuring</h2>
            <p className="text-slate-600">Choose the plan that's right for your financial complexity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <PricingCard
              name="Individuals"
              price="0"
              features={["Dashboard access", "1 Document upload/mo", "Basic deductions", "Community support"]}
              cta="Choose Free"
              link="/register"
            />
            <PricingCard
              name="Pro"
              price="29"
              isPopular={true}
              features={["Unlimited uploads", "AI Advisor 24/7", "Scenario modeling", "Export to CPA", "Priority Support"]}
              cta="Try Pro Free"
              link="/register"
            />
            <PricingCard
              name="Freelancers"
              price="49"
              features={["S-Corp simulations", "Business expense tracking", "Quarterly payment estimates", "Multi-income support"]}
              cta="Get Freelancer"
              link="/register"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-none mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900">Loved by high-performers</h2>
              <p className="text-slate-600">From software engineers to small business owners, we're changing how people think about taxes.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-teal-600 transition-colors shadow-sm"><ArrowRight className="rotate-180" /></Button>
              <Button variant="outline" size="icon" className="rounded-full bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-teal-600 transition-colors shadow-sm"><ArrowRight /></Button>
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
      <section className="py-24 px-6 relative bg-white">
        <div className="max-w-none mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center tracking-tight text-slate-900">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b-slate-200">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline text-slate-900">Is my data secure?</AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed pt-2 pb-6">
                Yes. We use bank-grade 256-bit encryption and never share your data with third parties. Your financial privacy is our top priority.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-b-slate-200">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline text-slate-900">How does the AI advisor work?</AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed pt-2 pb-6">
                Our AI is trained on thousands of pages of tax law and IRS publications. It analyzes your specific profile to provide personalized, relevant guidance based on the latest regulations.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-b-slate-200">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline text-slate-900">Can I use this with my existing CPA?</AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed pt-2 pb-6">
                Absolutely! Most of our users use TaxGPT to organize their data and then export a clean report that their CPA can use to file taxes in minutes.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-none mx-auto bg-gradient-to-r from-teal-600 to-emerald-700 rounded-[2rem] p-12 text-white text-center shadow-2xl overflow-hidden relative border border-white/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[80px] rounded-full"></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white text-center">Stop guessing, start optimizing</h2>
            <p className="text-xl text-teal-50 mb-10 max-w-xl mx-auto text-center">Join thousands of smart taxpayers who trust TaxGPT for their financial future.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full rounded-full bg-white text-teal-600 hover:bg-slate-50 px-10 h-14 text-lg border-0 shadow-lg font-bold">Create Free Account</Button>
              </Link>
              <p className="text-sm text-teal-100">No credit card required</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-20 pb-10 px-6 relative z-10">
        <div className="max-w-none mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/10">
                  <span className="text-white font-bold text-lg leading-none">T</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">TaxGPT</span>
              </div>
              <p className="text-slate-500 mb-8 max-w-sm">The world's most advanced AI-powered tax planning platform designed for clarity and impact.</p>
              <div className="flex gap-4">
                <Twitter className="w-5 h-5 text-slate-400 cursor-pointer hover:text-teal-600 transition-colors" />
                <Linkedin className="w-5 h-5 text-slate-400 cursor-pointer hover:text-teal-600 transition-colors" />
                <Github className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-900 transition-colors" />
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-slate-900">Product</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li className="hover:text-teal-600 cursor-pointer transition-colors">Features</li>
                <li className="hover:text-teal-600 cursor-pointer transition-colors">Simulation</li>
                <li className="hover:text-teal-600 cursor-pointer transition-colors">Security</li>
                <li className="hover:text-teal-600 cursor-pointer transition-colors">Changelog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-slate-900">Company</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li className="hover:text-teal-600 cursor-pointer transition-colors">About Us</li>
                <li className="hover:text-teal-600 cursor-pointer transition-colors">Careers</li>
                <li className="hover:text-teal-600 cursor-pointer transition-colors">Contact</li>
                <li className="hover:text-teal-600 cursor-pointer transition-colors">Support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-slate-900">Legal</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li className="hover:text-teal-600 cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-teal-600 cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-teal-600 cursor-pointer transition-colors">Compliance</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-200 text-xs text-slate-400 gap-4">
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="p-8 rounded-[28px] border border-slate-200 bg-white hover:bg-slate-50 hover:border-teal-500/30 hover:shadow-xl hover:shadow-teal-500/5 transition-all shadow-sm"
    >
      <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm">{description}</p>
    </motion.div>
  );
}

function Step({ num, title, description }: { num: string, title: string, description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex gap-6 group"
    >
      <div className="text-4xl font-black text-slate-200 group-hover:text-teal-600 transition-colors">{num}</div>
      <div>
        <h4 className="text-xl font-bold mb-2 text-slate-900">{title}</h4>
        <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

function PricingCard({ name, price, features, cta, isPopular, link }: { name: string, price: string, features: string[], cta: string, isPopular?: boolean, link?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className={`p-10 rounded-[28px] border ${isPopular ? 'border-teal-500 shadow-2xl shadow-teal-500/10 bg-white' : 'border-slate-200 bg-white/50'} relative shadow-sm`}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Most Popular</span>
      )}
      <h3 className="text-lg font-bold mb-4 text-slate-900">{name}</h3>
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-4xl font-black text-slate-900">${price}</span>
        <span className="text-slate-400">/mo</span>
      </div>
      <ul className="space-y-4 mb-10">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-3 text-sm text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            {feature}
          </li>
        ))}
      </ul>
      {link ? (
        <Link to={link}>
          <Button variant={isPopular ? 'default' : 'outline'} className={`w-full rounded-full h-12 ${isPopular ? 'bg-teal-600 hover:bg-teal-700 text-white border-0 shadow-lg shadow-teal-500/20' : 'bg-transparent border-slate-200 text-slate-900 hover:bg-slate-50'}`}>
            {cta}
          </Button>
        </Link>
      ) : (
        <Button variant={isPopular ? 'default' : 'outline'} className={`w-full rounded-full h-12 ${isPopular ? 'bg-teal-600 hover:bg-teal-700 text-white border-0 shadow-lg shadow-teal-500/20' : 'bg-transparent border-slate-200 text-slate-900 hover:bg-slate-50'}`}>
          {cta}
        </Button>
      )}
    </motion.div>
  );
}

function Testimonial({ quote, author, role }: { quote: string, author: string, role: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className="bg-white p-10 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex gap-1 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Zap key={i} className="w-4 h-4 fill-teal-500 text-teal-500" />
        ))}
      </div>
      <p className="text-lg text-slate-800 font-medium italic mb-8">"{quote}"</p>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center font-bold text-teal-700">
          {author.charAt(0)}
        </div>
        <div>
          <h4 className="font-bold text-sm text-slate-900">{author}</h4>
          <p className="text-xs text-slate-500">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}
