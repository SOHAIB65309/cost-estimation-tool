import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { BarChart3, ShieldCheck, Zap } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-indigo-500/30 font-sans">
            <Head title="AI-Powered Wideband Delphi Estimation">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            {/* Navbar */}
            <nav className="fixed top-0 z-50 w-full border-b border-neutral-800/50 bg-neutral-950/50 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <AppLogoIcon className="h-8 w-8" />
                        <span className="text-lg font-bold tracking-tight text-white">Indusstream</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-full bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-500"
                            >
                                Go to Workspace
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="text-neutral-400 transition-colors hover:text-white"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-full bg-neutral-800 px-4 py-2 text-white transition-colors hover:bg-neutral-700"
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-20">
                    {/* Background Glows */}
                    <div className="absolute top-1/4 -left-20 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[120px]" />
                    <div className="absolute bottom-1/4 -right-20 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[120px]" />

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-4xl text-center"
                    >
                        <motion.div 
                            variants={itemVariants} 
                            className="mb-6 inline-block rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-indigo-400 uppercase"
                        >
                            Indusstream Technologies
                        </motion.div>
                        <motion.h1
                            variants={itemVariants}
                            className="mb-6 bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-8xl"
                        >
                            AI-Powered Wideband <br className="hidden sm:block" /> Delphi Estimation
                        </motion.h1>
                        <motion.p
                            variants={itemVariants}
                            className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-neutral-400 sm:text-xl"
                        >
                            Harness expert consensus and automated intelligence to deliver 
                            precision project estimates. Eliminate bias, reduce risk, and build with confidence.
                        </motion.p>
                        <motion.div variants={itemVariants}>
                            <Link
                                href={auth.user ? route('dashboard') : route('login')}
                                className="group relative inline-flex items-center justify-center rounded-full bg-indigo-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] active:scale-95"
                            >
                                <motion.span
                                    animate={{ 
                                        boxShadow: ["0 0 0px rgba(79,70,229,0)", "0 0 20px rgba(79,70,229,0.4)", "0 0 0px rgba(79,70,229,0)"] 
                                    }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute inset-0 rounded-full"
                                />
                                <span className="relative">Start Estimating</span>
                            </Link>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Animated Feature Cards */}
                <section className="mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Engineered for Accuracy</h2>
                        <p className="mt-4 text-neutral-400">Modern tools for complex estimation workflows.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <FeatureCard
                            icon={<Zap className="h-6 w-6 text-indigo-400" />}
                            title="Automated DOM Scraping"
                            description="Automatically ingest project structures and WBS components directly from web-based tools and platforms."
                            index={0}
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="h-6 w-6 text-indigo-400" />}
                            title="2-Member Delphi Consensus"
                            description="Iterative expert estimation process designed to reach high-confidence consensus and minimize individual bias."
                            index={1}
                        />
                        <FeatureCard
                            icon={<BarChart3 className="h-6 w-6 text-indigo-400" />}
                            title="PERT Risk Math"
                            description="Integrated PERT analysis to calculate expected durations with built-in risk weighting and statistical confidence."
                            index={2}
                        />
                    </div>
                </section>

                {/* CTA Section */}
                <section className="relative overflow-hidden border-t border-neutral-800/50 bg-neutral-900/30 py-32">
                    <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-[120px]" />
                    <div className="mx-auto max-w-4xl px-4 text-center">
                        <h2 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            Ready to modernize your estimation?
                        </h2>
                        <p className="mb-10 text-lg leading-relaxed text-neutral-400">
                            Join the next generation of project planners. Start using our AI-powered 
                            Wideband Delphi tool today and transform how you estimate.
                        </p>
                        <Link
                            href={route('register')}
                            className="inline-block rounded-full bg-white px-10 py-4 text-lg font-bold text-black transition-all hover:bg-neutral-200 hover:scale-105 active:scale-95 shadow-xl"
                        >
                            Get Started Free
                        </Link>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-neutral-900 bg-neutral-950 py-12 text-center text-sm text-neutral-500">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
                        <div className="flex items-center gap-2">
                            <AppLogoIcon className="h-6 w-6 opacity-50" />
                            <span className="font-semibold text-neutral-400">Indusstream Technologies</span>
                        </div>
                        <p>&copy; {new Date().getFullYear()} Indusstream Technologies. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description, index }: { icon: React.ReactNode; title: string; description: string; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: index * 0.15, ease: "easeOut" }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="group relative rounded-3xl border border-neutral-800 bg-neutral-900/50 p-8 backdrop-blur-md transition-all hover:border-indigo-500/50 hover:bg-neutral-900/80"
        >
            <div className="mb-6 inline-flex rounded-2xl bg-indigo-500/10 p-4 ring-1 ring-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors shadow-inner">
                {icon}
            </div>
            <h3 className="mb-3 text-2xl font-bold text-white tracking-tight">{title}</h3>
            <p className="text-lg leading-relaxed text-neutral-400 group-hover:text-neutral-300 transition-colors">
                {description}
            </p>
        </motion.div>
    );
}
