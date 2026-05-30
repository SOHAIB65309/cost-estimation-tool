import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Project } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BarChart3, ExternalLink, Gavel, Layers, LayoutGrid, Timer } from 'lucide-react';

interface ShowProps {
    project: Project;
}

export default function Show({ project }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: project.title, href: '#' },
    ];

    const totalComponents = project.wbs_components?.length || 0;
    const isLocked = project.status === 'Locked';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Project Details - ${project.title}`} />

            <div className="flex h-full flex-1 flex-col gap-8 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-white">{project.title}</h1>
                            <Badge
                                variant="outline"
                                className={`px-3 py-0.5 text-xs font-medium ${
                                    isLocked
                                        ? 'border-green-500/30 bg-green-500/10 text-green-400'
                                        : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                                }`}
                            >
                                {project.status}
                            </Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm text-neutral-400">
                            <span className="font-medium">Source:</span>
                            <a
                                href={project.proxy_source_url||'/'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                {project.proxy_source_url}
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </div>
                    <div>
                        <Link
                            href={route('projects.delphi', project.id)}
                            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                        >
                            <Gavel className="mr-2 h-4 w-4" />
                            Open Delphi Workspace
                        </Link>
                    </div>
                </div>

                {/* Metric Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="border-neutral-800/50 bg-neutral-900/50 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-400">Total Estimated Hours</CardTitle>
                            <Timer className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">
                                {project.final_estimated_hours ? `${project.final_estimated_hours}h` : 'Pending'}
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                {isLocked ? 'Finalized team consensus' : 'Awaiting team votes'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-800/50 bg-neutral-900/50 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-400">WBS Components</CardTitle>
                            <Layers className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{totalComponents}</div>
                            <p className="text-xs text-neutral-500 mt-1">Identified work items</p>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-800/50 bg-neutral-900/50 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-400">Estimation Accuracy</CardTitle>
                            <BarChart3 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">PERT</div>
                            <p className="text-xs text-neutral-500 mt-1">Beta distribution weighted</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Component List */}
                <Card className="border-neutral-800/50 bg-neutral-900/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <LayoutGrid className="h-5 w-5 text-indigo-500" />
                            Project Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-left text-sm text-neutral-300">
                                <thead className="border-b border-neutral-800 text-xs font-semibold uppercase text-neutral-500">
                                    <tr>
                                        <th className="px-6 py-4">Component Name</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4 text-right">Computed Effort (PERT)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-800">
                                    {project.wbs_components?.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-10 text-center text-neutral-500">
                                                No components found for this project.
                                            </td>
                                        </tr>
                                    ) : (
                                        project.wbs_components?.map((component) => (
                                            <tr key={component.id} className="group transition-colors hover:bg-neutral-800/30">
                                                <td className="px-6 py-4 font-medium text-white">{component.name}</td>
                                                <td className="px-6 py-4 text-neutral-500">{component.component_type}</td>
                                                <td className="px-6 py-4 text-right font-mono text-indigo-400">
                                                    {component.computed_pert_effort ? `${component.computed_pert_effort}h` : '---'}
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
