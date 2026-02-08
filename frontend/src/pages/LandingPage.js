import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
import { 
  CheckCircle, 
  CreditCard, 
  FileText, 
  Users, 
  PieChart, 
  Settings, 
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Zap
} from 'lucide-react';

/* --- Helper Component for Magnetic Buttons --- */
function MagneticButton({ children, className, onClick }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((clientX - centerX) * 0.1);
    y.set((clientY - centerY) * 0.1);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x, y }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  // Scroll Hooks for Parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroRotateX = useTransform(scrollYProgress, [0, 0.2], [0, 15]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F5F5F7] text-[#1d1d1f] font-sans selection:bg-blue-500/30 overflow-x-hidden perspective-1000">
      
      {/* --- Navigation --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center text-white">
              <RefreshCw size={18} className="animate-spin-slow" />
            </div>
            SubFlow
          </div>
          
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-500">
            <a href="#features" className="hover:text-black transition-colors">Recurring Plans</a>
            <a href="#workflow" className="hover:text-black transition-colors">Lifecycle</a>
            <a href="#reporting" className="hover:text-black transition-colors">Reporting</a>
          </div>

          <div className="flex gap-4 items-center">
            <button 
              onClick={() => navigate('/login')} 
              className="text-sm font-semibold text-gray-600 hover:text-black transition-colors"
            >
              Log in
            </button>
            <MagneticButton 
              onClick={() => navigate('/signup')} 
              className="bg-black text-white text-sm px-5 py-2 rounded-full font-medium"
            >
              Get Started
            </MagneticButton>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="pt-40 pb-20 px-6 flex flex-col items-center text-center relative">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto z-10"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-8 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              System Live V1.0
            </span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[1] text-transparent bg-clip-text bg-gradient-to-b from-black to-gray-700">
            Billing. <br/>
            Automated.
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            Manage the complete subscription lifecycle. 
            From <span className="text-black">quotation</span> to <span className="text-black">recurring payment</span>. 
            All in one centralized dashboard.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-24">
            <MagneticButton 
              onClick={() => navigate('/signup')}
              className="bg-blue-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 shadow-xl shadow-blue-500/20 flex items-center gap-2"
            >
              Start Free Trial <ArrowRight size={20} />
            </MagneticButton>
            <button className="text-gray-600 hover:text-black font-medium text-lg px-6 flex items-center gap-2 group">
              View Documentation <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </motion.div>

        {/* --- 3D Dashboard Mockup --- */}
        <motion.div 
          style={{ 
            rotateX: heroRotateX,
            scale: heroScale,
            opacity: heroOpacity,
            perspective: 1200
          }}
          className="w-full max-w-6xl mx-auto relative z-0 transform-gpu"
        >
          <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-200/80 overflow-hidden aspect-[16/10] relative">
            {/* Mockup Top Bar */}
            <div className="h-14 border-b bg-gray-50 flex items-center justify-between px-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="w-64 h-8 bg-gray-200/50 rounded-lg" />
            </div>

            {/* Mockup Body */}
            <div className="flex h-full">
              {/* Sidebar */}
              <div className="w-64 border-r bg-gray-50/30 p-6 hidden md:block">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-blue-600 font-bold bg-blue-50 p-3 rounded-xl">
                    <RefreshCw size={18} /> Subscriptions
                  </div>
                  {['Products', 'Quotation', 'Invoices', 'Payments', 'Reporting'].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-gray-500 p-3">
                      <div className="w-4 h-4 bg-gray-300 rounded-sm" /> {item}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Main Content */}
              <div className="flex-1 p-8 bg-white">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Active Subscriptions</h3>
                    <p className="text-gray-400">Manage recurring billing and plans</p>
                  </div>
                  <button className="bg-black text-white px-4 py-2 rounded-lg text-sm">New Subscription</button>
                </div>

                {/* Data Table Mockup */}
                <div className="border rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 h-10 border-b">
                      <tr>
                        <th className="px-4 text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-4 text-xs font-medium text-gray-500 uppercase">Plan</th>
                        <th className="px-4 text-xs font-medium text-gray-500 uppercase">Next Billing</th>
                        <th className="px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4].map((i) => (
                        <tr key={i} className="border-b h-16 last:border-0">
                          <td className="px-4"><div className="w-32 h-4 bg-gray-100 rounded" /></td>
                          <td className="px-4"><div className="w-20 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">Monthly</div></td>
                          <td className="px-4"><div className="w-24 h-4 bg-gray-100 rounded" /></td>
                          <td className="px-4"><div className="w-16 h-4 bg-green-100 rounded-full" /></td>
                          <td className="px-4 font-mono">$120.00</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-blue-500/10 blur-[120px] -z-10 rounded-full" />
        </motion.div>
      </section>

      {/* --- Bento Grid Features --- */}
      <section className="py-32 px-6 max-w-7xl mx-auto" id="features">
        <div className="mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
          >
            Built for <span className="text-gray-400">Recurring Revenue.</span>
          </motion.h2>
          <p className="text-xl text-gray-500 max-w-2xl">
            A complete ERP workflow designed for SaaS and subscription businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-auto md:h-[800px]">
          
          {/* Feature 1: Recurring Plans */}
          <motion.div 
            whileHover={{ scale: 0.98 }}
            className="md:col-span-2 md:row-span-2 bg-white rounded-3xl p-10 shadow-sm border border-gray-100 relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                <RefreshCw />
              </div>
              <h3 className="text-3xl font-bold mb-3">Flexible Billing Cycles.</h3>
              <p className="text-gray-500 text-lg">
                Configure Daily, Weekly, Monthly, or Yearly plans.
                Set minimum quantities and auto-renewal rules instantly.
              </p>
            </div>
            {/* Visual Abstract */}
            <div className="absolute bottom-0 right-0 w-[90%] h-[50%] bg-gradient-to-t from-blue-50 to-transparent border-t border-dashed border-blue-200 rounded-tl-3xl p-6">
                <div className="flex gap-4 items-end h-full opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-1/4 h-[60%] bg-blue-400 rounded-t-lg" />
                    <div className="w-1/4 h-[80%] bg-blue-500 rounded-t-lg" />
                    <div className="w-1/4 h-[40%] bg-blue-300 rounded-t-lg" />
                    <div className="w-1/4 h-[90%] bg-blue-600 rounded-t-lg" />
                </div>
            </div>
          </motion.div>

          {/* Feature 2: Invoicing */}
          <motion.div 
             whileHover={{ scale: 0.98 }}
             className="md:col-span-2 bg-[#1d1d1f] text-white rounded-3xl p-10 shadow-lg relative overflow-hidden flex flex-col justify-between"
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                    <FileText className="text-white"/>
                </div>
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">AUTOMATED</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Auto-Invoicing.</h3>
              <p className="text-gray-400">Invoices generated automatically from subscriptions.</p>
            </div>
          </motion.div>

          {/* Feature 3: Roles */}
          <motion.div 
             whileHover={{ scale: 0.98 }}
             className="md:col-span-1 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between"
          >
            <div>
                <Users className="w-10 h-10 text-orange-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Roles & Permissions.</h3>
                <p className="text-gray-500 text-sm">Admin, Internal User, and Customer Portal access.</p>
            </div>
          </motion.div>

           {/* Feature 4: Tax & Discount */}
           <motion.div 
             whileHover={{ scale: 0.98 }}
             className="md:col-span-1 bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between"
          >
            <div>
                <PieChart className="w-10 h-10 text-indigo-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Taxes & Discounts.</h3>
                <p className="text-gray-500 text-sm">Apply fixed or % discounts. Auto-calculate taxes on invoice lines.</p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* --- Workflow Parallax Section --- */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-2 block">The Workflow</span>
                    <h2 className="text-5xl font-bold tracking-tight mb-8">
                        Draft. Confirm. <br/>
                        <span className="text-gray-400">Get Paid.</span>
                    </h2>
                    <p className="text-xl text-gray-500 leading-relaxed mb-8">
                        Streamline the complete lifecycle. Create a quotation template to speed up setup, 
                        convert it to a subscription, and let the system handle the rest.
                    </p>
                    
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm mt-1">1</div>
                            <div>
                                <h4 className="font-bold text-lg">Quotation</h4>
                                <p className="text-gray-500">Draft proposals with predefined products and validity.</p>
                            </div>
                        </div>
                        <div className="h-8 border-l-2 border-gray-100 ml-4 my-2" />
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm mt-1">2</div>
                            <div>
                                <h4 className="font-bold text-lg">Subscription</h4>
                                <p className="text-gray-500">Active recurring billing with start/end dates.</p>
                            </div>
                        </div>
                        <div className="h-8 border-l-2 border-gray-100 ml-4 my-2" />
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm mt-1">3</div>
                            <div>
                                <h4 className="font-bold text-lg">Payment</h4>
                                <p className="text-gray-500">Track paid and outstanding invoices automatically.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="relative h-[600px] perspective-1000">
                     {/* Floating Cards Animation */}
                     <motion.div 
                        animate={{ y: [0, -20, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        className="absolute top-10 left-10 z-30 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 w-72"
                     >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <CheckCircle size={20} />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase font-bold">Invoice Paid</div>
                                <div className="font-bold text-lg">$1,299.00</div>
                            </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full w-full bg-green-500" />
                        </div>
                     </motion.div>

                     <motion.div 
                        animate={{ y: [0, 30, 0] }}
                        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
                        className="absolute top-40 right-10 z-20 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 w-64 opacity-90"
                     >
                         <div className="flex justify-between mb-2">
                             <div className="h-4 w-20 bg-gray-200 rounded" />
                             <div className="h-4 w-10 bg-red-100 rounded" />
                         </div>
                         <div className="h-8 w-32 bg-gray-100 rounded mb-4" />
                         <div className="flex gap-2">
                             <div className="h-8 w-8 rounded-full bg-gray-100" />
                             <div className="h-8 w-8 rounded-full bg-gray-100" />
                         </div>
                     </motion.div>

                     {/* Base Mockup */}
                     <div className="absolute inset-0 bg-gray-50 rounded-3xl -z-10 border border-gray-200" />
                </div>
            </div>
        </div>
      </section>

      {/* --- CTA Footer --- */}
      <section className="py-40 bg-black text-white text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 blur-[150px] rounded-full mix-blend-screen" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 blur-[150px] rounded-full mix-blend-screen" />
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter">Ready to scale?</h2>
            <p className="text-xl text-gray-400 mb-12">
                Join thousands of businesses managing their recurring revenue with SubFlow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <MagneticButton 
                    onClick={() => navigate('/signup')}
                    className="bg-white text-black px-10 py-4 rounded-full text-xl font-bold hover:scale-105 transition-transform"
                >
                    Get Started Now
                </MagneticButton>
            </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white border-t py-12 px-6 text-sm text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2024 SubFlow Inc. Based on Subscription Management System</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
            <a href="#" className="hover:text-black transition-colors">Terms</a>
            <a href="#" className="hover:text-black transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}