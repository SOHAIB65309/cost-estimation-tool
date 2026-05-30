import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Project } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Layers, LayoutGrid, Loader2, PlusCircle, Search } from 'lucide-react';

interface DashboardProps {
    projects: Project[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ projects }: DashboardProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        proxy_source_url: '',
    });

    const totalProjects = projects.length;
    const totalComponents = projects.reduce((acc, project) => acc + (project.wbs_components?.length || 0), 0);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('projects.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            <div className="flex h-full flex-1 flex-col gap-8 p-4 md:p-8">
                {/* Metric Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="border-neutral-800/50 bg-neutral-900/50 backdrop-blur-xl transition-all hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-400">Total Projects</CardTitle>
                            <LayoutGrid className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{totalProjects}</div>
                            <p className="text-xs text-neutral-500 mt-1">Global active count</p>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-800/50 bg-neutral-900/50 backdrop-blur-xl transition-all hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-400">WBS Components</CardTitle>
                            <Layers className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{totalComponents}</div>
                            <p className="text-xs text-neutral-500 mt-1">Total across all projects</p>
                        </CardContent>
                    </Card>
                </div>

                {/* New Estimate Form */}
                <Card className="border-neutral-800/50 bg-neutral-900/50 backdrop-blur-xl">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <PlusCircle className="h-5 w-5 text-blue-500" />
                            <CardTitle className="text-lg font-semibold text-white">New Estimation Project</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 space-y-1">
                                <Input
                                    placeholder="Project Title (e.g., Marketing API)"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="border-neutral-800 bg-neutral-950/50 text-white placeholder:text-neutral-600 focus:ring-blue-500/50"
                                    required
                                />
                                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                            </div>
                            <div className="flex-[2] space-y-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600" />
                                    <Input
                                        placeholder="Paste Proxy Source URL (Python Scraper will analyze this)"
                                        value={data.proxy_source_url}
                                        onChange={(e) => setData('proxy_source_url', e.target.value)}
                                        className="pl-10 border-neutral-800 bg-neutral-950/50 text-white placeholder:text-neutral-600 focus:ring-blue-500/50"
                                        required
                                        type="url"
                                    />
                                </div>
                                {errors.proxy_source_url && <p className="text-xs text-red-500">{errors.proxy_source_url}</p>}
                            </div>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Scraping...
                                    </>
                                ) : (
                                    'Start Estimation'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Projects Table */}
                <Card className="border-neutral-800/50 bg-neutral-900/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-white">Recent Estimation Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-left text-sm text-neutral-300">
                                <thead className="border-b border-neutral-800 text-xs font-semibold uppercase text-neutral-500">
                                    <tr>
                                        <th className="px-6 py-4">Title</th>
                                        <th className="px-6 py-4">Proxy URL</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Est. Hours</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-800">
                                    {projects.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center text-neutral-500">
                                                No projects found. Start by creating a new estimation.
                                            </td>
                                        </tr>
                                    ) : (
                                        projects.map((project) => (
                                            <tr 
                                                key={project.id} 
                                                className="group transition-colors hover:bg-neutral-800/30"
                                            >
                                                <td className="px-6 py-4 font-medium text-white">{project.title}</td>
                                                <td className="px-6 py-4">
                                                    {project.proxy_source_url ? (
                                                        <a 
                                                            href={project.proxy_source_url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-blue-400 hover:text-blue-300 transition-colors"
                                                        >
                                                            {project.proxy_source_url}
                                                        </a>
                                                    ) : (
                                                        <span className="text-neutral-600">N/A</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                                                        project.status === 'Completed' || project.status === 'Locked'
                                                        ? 'bg-green-500/10 text-green-400 ring-green-500/20' 
                                                        : 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20'
                                                    }`}>
                                                        {project.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono">
                                                    {project.final_estimated_hours ?? '---'}h
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        asChild
                                                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                                    >
                                                        <a href={route('projects.delphi', project.id)}>Delphi Room</a>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
