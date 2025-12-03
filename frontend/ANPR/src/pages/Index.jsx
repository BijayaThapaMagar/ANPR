import { Link } from 'react-router-dom';
import { Image, Video, Zap, Shield, BarChart3, Clock, Target, ArrowRight, Play, Camera, TrendingUp, CheckCircle } from 'lucide-react';

const IconGlass = ({ children, className = "" }) => (
  <div className={`backdrop-blur-lg bg-white/70 dark:bg-[#232526]/70 border border-white/30 dark:border-[#444]/30 rounded-full shadow-[0_4px_16px_0_rgba(31,38,135,0.10)] w-16 h-16 flex items-center justify-center ${className}`}>
    {children}
  </div>
);

const FeatureCard = ({ icon, title, description, delay }) => (
  <div 
    className="backdrop-blur-xl bg-white/60 dark:bg-[#232526]/60 border border-white/30 dark:border-[#444]/30 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl font-sparrow group"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center gap-4 mb-4">
      <div className="p-3 rounded-lg bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground font-sparrow">{title}</h3>
    </div>
    <p className="text-muted-foreground text-sm font-sparrow leading-relaxed">{description}</p>
  </div>
);

const StatCard = ({ value, label, icon, colorClass }) => (
  <div className="backdrop-blur-xl bg-white/60 dark:bg-[#232526]/60 border border-white/30 dark:border-[#444]/30 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] p-6 text-center transition-all duration-300 hover:scale-105 font-sparrow">
    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colorClass} mb-4`}>
      {icon}
    </div>
    <div className="text-3xl font-bold text-foreground font-sparrow mb-2">{value}</div>
    <div className="text-sm text-muted-foreground font-sparrow">{label}</div>
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen w-full bg-graph-paper dark:bg-graph-paper-dark font-sparrow overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 text-primary text-sm font-medium mb-6 font-sparrow">
              <Zap className="h-4 w-4" />
              Powered by Advanced YOLOv8 and RF-DETR
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground font-sparrow leading-tight">
              Automatic Number Plate
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Recognition System
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed font-sparrow">
              Transform your vehicle monitoring with cutting-edge AI technology. Detect, recognize, and analyze license plates from images and videos with unprecedented accuracy and speed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/image-processor" className="group">
                <button className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 font-sparrow">
                  <Camera className="h-5 w-5" />
                  Process Images
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/video-processor" className="group">
                <button className="px-8 py-4 rounded-xl bg-primary text-secondary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 font-sparrow">
                  <Play className="h-5 w-5" />
                  Process Videos
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <StatCard 
              value="99.2%" 
              label="Accuracy Rate" 
              icon={<Target className="h-6 w-6 text-white" />}
              colorClass="bg-primary"
            />
            <StatCard 
              value="<500ms" 
              label="Processing Time" 
              icon={<Clock className="h-6 w-6 text-white" />}
              colorClass="bg-secondary"
            />
            <StatCard 
              value="24/7" 
              label="System Uptime" 
              icon={<Shield className="h-6 w-6 text-white" />}
              colorClass="bg-accent"
            />
            <StatCard 
              value="10K+" 
              label="Plates Detected" 
              icon={<BarChart3 className="h-6 w-6 text-white" />}
              colorClass="bg-primary/80"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/20 dark:bg-[#232526]/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4 font-sparrow">Why Choose Our ANPR System?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-sparrow">
              Experience the next generation of license plate recognition with our advanced features and capabilities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Image className="h-6 w-6 text-primary" />}
              title="Image Processing"
              description="Upload and analyze single images with advanced OCR technology for precise license plate detection and text recognition."
              delay={0}
            />
            <FeatureCard
              icon={<Video className="h-6 w-6 text-primary" />}
              title="Video Analysis"
              description="Process video files with real-time tracking to capture the clearest license plate images from moving vehicles."
              delay={100}
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-primary" />}
              title="Live Analytics"
              description="Get real-time insights and comprehensive analytics with beautiful visualizations and performance metrics."
              delay={200}
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-primary" />}
              title="High Performance"
              description="Optimized algorithms ensure fast processing times while maintaining exceptional accuracy rates."
              delay={300}
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-primary" />}
              title="Secure Processing"
              description="Your data is processed securely with state-of-the-art encryption and privacy protection measures."
              delay={400}
            />
            <FeatureCard
              icon={<CheckCircle className="h-6 w-6 text-primary" />}
              title="Easy Integration"
              description="Simple API endpoints and comprehensive documentation for seamless integration into your existing systems."
              delay={500}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="backdrop-blur-xl bg-white/60 dark:bg-[#232526]/60 border border-white/30 dark:border-[#444]/30 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] p-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 font-sparrow">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8 font-sparrow">
              Choose your processing method and start detecting license plates with our advanced AI system.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/image-processor" className="group">
                <div className="backdrop-blur-xl bg-white/70 dark:bg-[#232526]/70 border border-white/30 dark:border-[#444]/30 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl font-sparrow">
                  <IconGlass className="mb-4">
                    <Image className="h-8 w-8 text-primary" />
                  </IconGlass>
                  <h3 className="text-xl font-bold mb-2 text-foreground font-sparrow">Image Processing</h3>
                  <p className="text-muted-foreground mb-4 font-sparrow">Upload and analyze single images</p>
                  <button className="w-full px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:shadow-lg transition-all duration-300 group-hover:scale-105 font-sparrow">
                    Start Processing Images
                  </button>
                </div>
              </Link>
              
              <Link to="/video-processor" className="group">
                <div className="backdrop-blur-xl bg-white/70 dark:bg-[#232526]/70 border border-white/30 dark:border-[#444]/30 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl font-sparrow">
                  <IconGlass className="mb-4">
                    <Video className="h-8 w-8 text-primary" />
                  </IconGlass>
                  <h3 className="text-xl font-bold mb-2 text-foreground font-sparrow">Video Processing</h3>
                  <p className="text-muted-foreground mb-4 font-sparrow">Analyze video files with tracking</p>
                  <button className="w-full px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-semibold shadow hover:shadow-lg transition-all duration-300 group-hover:scale-105 font-sparrow">
                    Start Processing Videos
                  </button>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
