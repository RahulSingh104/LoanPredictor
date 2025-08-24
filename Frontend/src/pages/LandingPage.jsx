import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Zap, Lock, Lightbulb } from 'lucide-react';

// This component now uses useNavigate to switch pages
const LandingPageHeader = () => {
    const navigate = useNavigate();
    const handleNavigate = () => navigate('/dashboard');

    return (
        <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="text-2xl font-bold text-gray-900">
                    <span className="text-indigo-600">Loan</span>Predictor
                </div>
                <div className="hidden md:flex items-center space-x-4">
                    <a href="#features" className="text-gray-600 hover:text-indigo-600 px-4">Features</a>
                    <a href="#how-it-works" className="text-gray-600 hover:text-indigo-600 px-4">How It Works</a>
                    <button onClick={handleNavigate} className="bg-indigo-600 text-white rounded-full px-5 py-2 font-semibold hover:bg-indigo-700 transition duration-300">
                        Launch App
                    </button>
                </div>
            </nav>
        </header>
    );
};

// This component also uses useNavigate
const HeroSection = () => {
    const navigate = useNavigate();
    const handleNavigate = () => navigate('/dashboard');

    return (
        <section className="relative text-white py-20 md:py-32 gradient-bg">
            <div className="container mx-auto px-6 text-center">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">Smarter Borrowing Starts Here</h1>
                <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-indigo-100">
                    Use our AI-powered tool to instantly predict your loan approval chances and make confident financial decisions.
                </p>
                <button onClick={handleNavigate} className="bg-white text-indigo-600 font-bold rounded-full py-4 px-8 text-lg hover:bg-gray-100 transform hover:scale-105 transition duration-300 shadow-lg inline-block">
                    Check Your Eligibility
                </button>
            </div>
        </section>
    );
};


const FeaturesSection = () => (
    <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Why Choose Us?</h2>
                <p className="text-gray-600 mt-2">The advantages of using our predictive analysis.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <FeatureCard icon={<Zap className="h-8 w-8" />} title="Instant Results" description="Get an immediate eligibility score in seconds, not days." />
                <FeatureCard icon={<Lock className="h-8 w-8" />} title="Data Security" description="Your privacy is our priority. All information is encrypted and secure." />
                <FeatureCard icon={<Lightbulb className="h-8 w-8" />} title="Informed Decisions" description="Understand your financial standing before you formally apply." />
            </div>
        </div>
    </section>
);

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-gray-50 p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mx-auto mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

const HowItWorksSection = () => (
    <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Get Your Prediction in 3 Easy Steps</h2>
                <p className="text-gray-600 mt-2">A simple and straightforward process.</p>
            </div>
            <div className="flex flex-col md:flex-row items-start justify-center gap-8 md:gap-16">
                <Step number="01" title="Provide Your Details" description="Fill out our simple and secure online form with your key information." />
                <Step number="02" title="AI-Powered Analysis" description="Our model instantly processes your data against proven lending criteria." />
                <Step number="03" title="Receive Prediction" description="Get a clear prediction of your loan approval chances on the spot." />
            </div>
        </div>
    </section>
);

const Step = ({ number, title, description }) => (
    <div className="flex items-center flex-col text-center max-w-xs">
        <div className="text-5xl font-bold text-indigo-200 mb-2">{number}</div>
        <h3 className="text-xl font-semibold mb-2 text-indigo-800">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

const DisclaimerSection = () => (
    <section className="bg-yellow-50 border-t border-b border-yellow-200">
        <div className="container mx-auto px-6 py-8 text-center text-yellow-800">
            <p><strong>Disclaimer:</strong> This tool provides a prediction for informational purposes only and does not constitute a guarantee of loan approval. Final lending decisions are made by financial institutions.</p>
        </div>
    </section>
);

const Footer = () => (
    <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-6 py-8 text-center">
            <p>&copy; 2025 LoanPredictor. All Rights Reserved.</p>
            <div className="mt-4">
                <a href="#" className="text-gray-400 hover:text-white px-3">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white px-3">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white px-3">Contact Us</a>
            </div>
        </div>
    </footer>
);

const LandingPage = ({ onGetStartedClick }) => (
    <>
        <LandingPageHeader onGetStartedClick={onGetStartedClick} />
        <main>
            <HeroSection onGetStartedClick={onGetStartedClick} />
            <FeaturesSection />
            <HowItWorksSection />
            <DisclaimerSection />
        </main>
        <Footer />
    </>
);

export default LandingPage;
