import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type DeveloperProfile, type Project, type WbsComponent } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, Calculator, CheckCircle2, Gavel, HelpCircle, Info, Loader2, Lock, Plus, Users } from 'lucide-react';
import React, { useState } from 'react';

interface DelphiWorkspaceProps {
    project: Project;
    developers: DeveloperProfile[];
}

export default function DelphiWorkspace({ project, developers }: DelphiWorkspaceProps) {
    const [selectedComponent, setSelectedComponent] = useState<WbsComponent | null>(null);
    const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
    const [currentBaseline, setCurrentBaseline] = useState<{ optimistic: number; most_likely: number; pessimistic: number } | null>(null);
    const { flash, auth } = usePage().props as any;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: project.title, href: route('projects.delphi', project.id) },
        { title: 'Project Workspace', href: '#' },
    ];

    // Manual Component Form
    const manualForm = useForm({
        name: '',
        component_type: 'Other',
        best_case_hours: 0,
        most_likely_hours: 0,
        worst_case_hours: 0,
    });

    // Voting Form
    const voteForm = useForm({
        best_case_hours: 0,
        most_likely_hours: 0,
        worst_case_hours: 0,
    });

    // Locking Form
    const lockForm = useForm({});

    const handleLock = () => {
        if (confirm('Are you sure you want to finalize and lock this project? All team members must agree on the estimates.')) {
            lockForm.post(route('projects.lock', project.id), {
                preserveScroll: true,
                onSuccess: () => {
                    alert('Budget finalized successfully!');
                },
                onError: (errors: any) => {
                    if (errors.consensus) {
                        alert(`Lock Failed: ${errors.consensus}`);
                    } else {
                        alert('Check failed. Please ensure team agreement on all items.');
                    }
                }
            });
        }
    };

    const handleAddManual = (e: React.FormEvent) => {
        e.preventDefault();
        manualForm.post(route('projects.components.store', project.id), {
            onSuccess: () => manualForm.reset(),
        });
    };

    const handleOpenVote = (component: WbsComponent) => {
        setSelectedComponent(component);
        
        const dev = developers.find((d) => d.user_id === auth.user.id);
        if (dev) {
            const baseHours = getBaseHours(component.component_type);
            const calculatedBase = baseHours * Number(dev.capability_multiplier);

            const baseline = {
                optimistic: Math.round(calculatedBase * 0.8),
                most_likely: Math.round(calculatedBase * 1.0),
                pessimistic: Math.round(calculatedBase * 1.5),
            };

            setCurrentBaseline(baseline);
            voteForm.setData({
                best_case_hours: baseline.optimistic,
                most_likely_hours: baseline.most_likely,
                worst_case_hours: baseline.pessimistic,
            });
        } else {
            setCurrentBaseline(null);
            voteForm.reset();
        }
        
        setIsVoteModalOpen(true);
    };

    const getBaseHours = (type: string) => {
        switch (type.toLowerCase()) {
            case 'ui':
                return 4;
            case 'endpoint':
                return 6;
            case 'form':
                return 2;
            default:
                return 4;
        }
    };

    const handleVoteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedComponent) return;

        voteForm.post(route('votes.store', selectedComponent.id), {
            onSuccess: () => {
                setIsVoteModalOpen(false);
                voteForm.reset();
            },
        });
    };

    const isBaselineMatch =
        currentBaseline &&
        voteForm.data.best_case_hours === currentBaseline.optimistic &&
        voteForm.data.most_likely_hours === currentBaseline.most_likely &&
        voteForm.data.worst_case_hours === currentBaseline.pessimistic;

    const buttonText = isBaselineMatch ? 'Approve System Baseline' : 'Submit My Guess';
    const ButtonIcon = isBaselineMatch ? CheckCircle2 : Calculator;

    // Check if the overall project can be locked
    const missingVotesCount = project.wbs_components?.filter(c => (c.delphi_votes?.length || 0) < 2).length || 0;
    const highVarianceCount = project.wbs_components?.filter(c => {
        const votes = c.delphi_votes || [];
        if (votes.length < 2) return false;
        const hours = votes.map(v => v.voted_hours);
        const min = Math.min(...hours);
        const max = Math.max(...hours);
        return min > 0 && (max - min) / min > 0.15;
    }).length || 0;

    const canLock = missingVotesCount === 0 && highVarianceCount === 0;
    const lockDisabledReason = missingVotesCount > 0 
        ? `${missingVotesCount} items need more votes.`
        : highVarianceCount > 0 
        ? `${highVarianceCount} items have disagreement (variance too high).`
        : '';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Estimation Workspace - ${project.title}`} />

            <div className="flex h-full flex-1 flex-col gap-8 p-4 md:p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">{project.title}</h1>
                        <p className="text-neutral-400 text-sm">Collaborative Team Estimation Workspace</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {project.status !== 'Locked' && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span>
                                            <Button
                                                onClick={handleLock}
                                                disabled={lockForm.processing || !canLock}
                                                className="bg-indigo-600 font-semibold text-white transition-all hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {lockForm.processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                                                Lock Budget
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    {!canLock && (
                                        <TooltipContent className="bg-neutral-800 border-neutral-700 text-white p-2">
                                            <p>{lockDisabledReason}</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        <Badge
                            variant="outline"
                            className={`px-4 py-1 text-sm font-medium ${project.status === 'Awaiting Delphi'
                                ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                                : 'border-green-500/30 bg-green-500/10 text-green-400'
                                }`}
                        >
                            {project.status === 'Awaiting Delphi' ? 'Waiting for Team Votes' : project.status}
                        </Badge>
                    </div>
                </div>

                {/* Plain English Guide */}
                <Card className="border-indigo-500/20 bg-indigo-500/5 backdrop-blur-xl">
                    <CardContent className="flex items-start gap-4 p-6">
                        <div className="rounded-full bg-indigo-500/20 p-2 text-indigo-400">
                            <Info className="h-6 w-6" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-white">How this works</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-neutral-400">
                                <div className="space-y-1">
                                    <p className="font-bold text-neutral-300">1. Automatic Scraping</p>
                                    <p>We've already scanned your source URL to identify forms, UI elements, and API endpoints.</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-neutral-300">2. Independent Guesses</p>
                                    <p>You and your team members independently guess how many hours each task will take.</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-neutral-300">3. Agreement & Locking</p>
                                    <p>If guesses are too far apart, discuss them! Once everyone agrees, the budget can be locked.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Consensus Error Alert */}
                {lockForm.errors.consensus && (
                    <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400 animate-in fade-in slide-in-from-top-4">
                        <AlertTriangle className="h-5 w-5" />
                        <p>{lockForm.errors.consensus}</p>
                    </div>
                )}

                {/* Flash Messages */}
                {flash?.warning && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400 flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5" />
                        <p>{flash.warning}</p>
                    </div>
                )}
                {flash?.success && (
                    <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-400 flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5" />
                        <p>{flash.success}</p>
                    </div>
                )}

                {/* Component Breakdown Table */}
                <Card className="border-neutral-800/50 bg-neutral-900/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Gavel className="h-5 w-5 text-indigo-500" />
                            Work Items Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-left text-sm text-neutral-300">
                                <thead className="border-b border-neutral-800 text-xs font-semibold uppercase text-neutral-500">
                                    <tr>
                                        <th className="px-6 py-4">Task Name</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4 text-center">Team Votes</th>
                                        <th className="px-6 py-4 text-center">Team Agreement</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-800">
                                    {project.wbs_components?.map((component) => {
                                        const votes = component.delphi_votes || [];
                                        const voteCount = votes.length;
                                        
                                        // Calculate variance
                                        let highVariance = false;
                                        if (voteCount >= 2) {
                                            const hours = votes.map(v => v.voted_hours);
                                            const min = Math.min(...hours);
                                            const max = Math.max(...hours);
                                            if (min > 0) {
                                                highVariance = (max - min) / min > 0.15;
                                            }
                                        }

                                        return (
                                            <tr key={component.id} className="group transition-colors hover:bg-neutral-800/30">
                                                <td className="px-6 py-4 font-medium text-white">{component.name}</td>
                                                <td className="px-6 py-4 text-neutral-500">{component.component_type}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="flex justify-center -space-x-2">
                                                            {votes.map((v, i) => (
                                                                <div
                                                                    key={i}
                                                                    title={`${v.developer_name}: ${v.voted_hours}h`}
                                                                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-neutral-900 bg-neutral-800 text-[10px] font-bold text-indigo-400 ring-2 ring-transparent group-hover:ring-indigo-500/20"
                                                                >
                                                                    {v.developer_name.substring(0, 1)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {voteCount < 2 && (
                                                            <span className="text-[10px] text-yellow-500/70 font-medium">
                                                                Waiting on {2 - voteCount} more {2 - voteCount === 1 ? 'vote' : 'votes'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {voteCount < 2 ? (
                                                        <Badge variant="secondary" className="bg-neutral-800 text-neutral-500 border-none">
                                                            Pending...
                                                        </Badge>
                                                    ) : highVariance ? (
                                                        <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/30 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                                                            Estimates Too Far Apart
                                                        </Badge>
                                                    ) : (
                                                        <div className="flex items-center justify-center gap-1 text-green-500">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            <span className="text-[10px] font-bold uppercase">Agreed</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenVote(component)}
                                                        className="text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"
                                                    >
                                                        {votes.some(v => v.developer_name === auth.user.name) ? 'Change Vote' : 'Vote'}
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Manual Component Form */}
                <Card className="border-neutral-800/50 bg-neutral-900/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-white">Missing something? Add a custom task</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddManual} className="grid grid-cols-1 items-end gap-4 md:grid-cols-5">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="name" className="text-neutral-400">
                                    Task Name
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Environment Setup or QA Testing"
                                    value={manualForm.data.name}
                                    onChange={(e) => manualForm.setData('name', e.target.value)}
                                    className="border-neutral-800 bg-neutral-950/50 text-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-neutral-400">Category</Label>
                                <Select value={manualForm.data.component_type} onValueChange={(v) => manualForm.setData('component_type', v)}>
                                    <SelectTrigger className="border-neutral-800 bg-neutral-950/50 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-neutral-800 bg-neutral-900 text-white">
                                        <SelectItem value="UI">UI Component</SelectItem>
                                        <SelectItem value="Endpoint">API Endpoint</SelectItem>
                                        <SelectItem value="Form">Input Form</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-4 md:col-span-2">
                                <Button type="submit" disabled={manualForm.processing} className="w-full bg-neutral-800 text-white hover:bg-neutral-700">
                                    {manualForm.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                    Add Task
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Voting Modal */}
            <Dialog open={isVoteModalOpen} onOpenChange={setIsVoteModalOpen}>
                <DialogContent className="border-neutral-800 bg-neutral-900 text-white backdrop-blur-2xl">
                    <DialogHeader>
                        <DialogTitle>Your Guess: {selectedComponent?.name}</DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            Provide your three-point estimate. We'll use this to calculate the average.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleVoteSubmit} className="space-y-6 py-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-green-500 flex items-center justify-center gap-1">
                                    Optimistic
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger><HelpCircle className="h-3 w-3" /></TooltipTrigger>
                                            <TooltipContent className="bg-neutral-800 border-neutral-700 text-white max-w-xs">
                                                Best case scenario: everything goes perfectly.
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={voteForm.data.best_case_hours}
                                    onChange={(e) => voteForm.setData('best_case_hours', parseFloat(e.target.value) || 0)}
                                    className="border-neutral-800 bg-neutral-950/50 text-center"
                                />
                                <span className="text-[10px] text-neutral-500 uppercase tracking-tighter italic">Hours</span>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-indigo-500 flex items-center justify-center gap-1">
                                    Most Likely
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger><HelpCircle className="h-3 w-3" /></TooltipTrigger>
                                            <TooltipContent className="bg-neutral-800 border-neutral-700 text-white max-w-xs">
                                                Your most realistic guess based on experience.
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={voteForm.data.most_likely_hours}
                                    onChange={(e) => voteForm.setData('most_likely_hours', parseFloat(e.target.value) || 0)}
                                    className="border-neutral-800 bg-neutral-950/50 text-center font-bold"
                                />
                                <span className="text-[10px] text-neutral-500 uppercase tracking-tighter italic">Hours</span>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-red-500 flex items-center justify-center gap-1">
                                    Pessimistic
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger><HelpCircle className="h-3 w-3" /></TooltipTrigger>
                                            <TooltipContent className="bg-neutral-800 border-neutral-700 text-white max-w-xs">
                                                Worst case scenario: everything goes wrong.
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={voteForm.data.worst_case_hours}
                                    onChange={(e) => voteForm.setData('worst_case_hours', parseFloat(e.target.value) || 0)}
                                    className="border-neutral-800 bg-neutral-950/50 text-center"
                                />
                                <span className="text-[10px] text-neutral-500 uppercase tracking-tighter italic">Hours</span>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={voteForm.processing}
                                className={`w-full text-white ${isBaselineMatch
                                    ? 'bg-green-600 hover:bg-green-500 shadow-[0_0_15px_rgba(22,163,74,0.4)]'
                                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                                    }`}
                            >
                                {voteForm.processing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <ButtonIcon className="mr-2 h-4 w-4" />
                                )}
                                {buttonText}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
