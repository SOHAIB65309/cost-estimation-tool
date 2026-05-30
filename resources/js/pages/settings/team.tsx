import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Info, Loader2, Plus, Trash2, UserCog, Users } from 'lucide-react';
import React, { useState } from 'react';

interface Developer {
    id: number;
    name: string;
    role: string;
    weekly_loc_capacity: number;
    capability_multiplier: number | string;
}

interface Props {
    developerProfiles: Developer[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/settings/profile',
    },
    {
        title: 'Team Management',
        href: '/team',
    },
];

export default function Team({ developerProfiles }: Props) {
    const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null);

    // Form for adding a new developer
    const addForm = useForm({
        name: '',
        role: '',
        weekly_loc_capacity: '',
        capability_multiplier: '1.0',
    });

    // Form for editing an existing developer
    const editForm = useForm({
        name: '',
        role: '',
        weekly_loc_capacity: '',
        capability_multiplier: '',
    });

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(route('team.store'), {
            onSuccess: () => addForm.reset(),
        });
    };

    const handleEditClick = (developer: Developer) => {
        setEditingDeveloper(developer);
        editForm.setData({
            name: developer.name,
            role: developer.role,
            weekly_loc_capacity: String(developer.weekly_loc_capacity),
            capability_multiplier: String(developer.capability_multiplier),
        });
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingDeveloper) return;
        
        editForm.put(route('team.update', editingDeveloper.id), {
            onSuccess: () => setEditingDeveloper(null),
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this developer profile?')) {
            useForm().delete(route('team.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Team Capability Dashboard" />

            <SettingsLayout>
                <div className="space-y-8 min-w-[30rem] md:min-w-[40rem] lg:min-w-[50rem]">
                    {/* Info Card */}
                    <Card className="border-blue-500/20 bg-blue-500/5 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center gap-3 pb-2">
                            <Info className="h-5 w-5 text-blue-400" />
                            <CardTitle className="text-sm font-semibold text-blue-300">Capability Multiplier Info</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs leading-relaxed text-blue-200/70">
                                Based on COCOMO standards: A multiplier <strong className="text-blue-300">less than 1.0 (e.g., 0.85)</strong> indicates a highly experienced developer who reduces estimated time. 
                                A multiplier <strong className="text-blue-300">greater than 1.0</strong> increases estimation to account for training or lower familiarity.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Add Developer Form */}
                    <Card className="border-neutral-800/50 bg-neutral-900/50 backdrop-blur-xl">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Plus className="h-5 w-5 text-green-500" />
                                <CardTitle className="text-lg font-semibold text-white">Add Team Member</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                                <div className="space-y-1 lg:col-span-1">
                                    <Label htmlFor="add-name" className="text-xs text-neutral-400">Name</Label>
                                    <Input
                                        id="add-name"
                                        placeholder="Name"
                                        value={addForm.data.name}
                                        onChange={(e) => addForm.setData('name', e.target.value)}
                                        className="border-neutral-800 bg-neutral-950/50 text-white focus:ring-blue-500/50"
                                        required
                                    />
                                    {addForm.errors.name && <p className="text-[10px] text-red-500">{addForm.errors.name}</p>}
                                </div>
                                <div className="space-y-1 lg:col-span-1">
                                    <Label htmlFor="add-role" className="text-xs text-neutral-400">Role</Label>
                                    <Input
                                        id="add-role"
                                        placeholder="e.g. Senior Backend"
                                        value={addForm.data.role}
                                        onChange={(e) => addForm.setData('role', e.target.value)}
                                        className="border-neutral-800 bg-neutral-950/50 text-white focus:ring-blue-500/50"
                                        required
                                    />
                                    {addForm.errors.role && <p className="text-[10px] text-red-500">{addForm.errors.role}</p>}
                                </div>
                                <div className="space-y-1 lg:col-span-1">
                                    <Label htmlFor="add-loc" className="text-xs text-neutral-400">LOC/Week</Label>
                                    <Input
                                        id="add-loc"
                                        type="number"
                                        placeholder="500"
                                        value={addForm.data.weekly_loc_capacity}
                                        onChange={(e) => addForm.setData('weekly_loc_capacity', e.target.value)}
                                        className="border-neutral-800 bg-neutral-950/50 text-white focus:ring-blue-500/50"
                                        required
                                    />
                                    {addForm.errors.weekly_loc_capacity && <p className="text-[10px] text-red-500">{addForm.errors.weekly_loc_capacity}</p>}
                                </div>
                                <div className="space-y-1 lg:col-span-1">
                                    <Label htmlFor="add-multiplier" className="text-xs text-neutral-400">Capability Multiplier</Label>
                                    <Input
                                        id="add-multiplier"
                                        type="number"
                                        step="0.01"
                                        placeholder="1.0"
                                        value={addForm.data.capability_multiplier}
                                        onChange={(e) => addForm.setData('capability_multiplier', e.target.value)}
                                        className="border-neutral-800 bg-neutral-950/50 text-white focus:ring-blue-500/50"
                                        required
                                    />
                                    {addForm.errors.capability_multiplier && <p className="text-[10px] text-red-500">{addForm.errors.capability_multiplier}</p>}
                                </div>
                                <div className="flex items-end lg:col-span-1">
                                    <Button 
                                        type="submit" 
                                        disabled={addForm.processing}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white transition-all"
                                    >
                                        {addForm.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Member'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Team Table */}
                    <Card className="border-neutral-800/50 bg-neutral-900/50 backdrop-blur-xl overflow-hidden">
                        <CardHeader className="border-b border-neutral-800/50 pb-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-purple-500" />
                                <CardTitle className="text-lg font-semibold text-white">Team Capability Data</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-neutral-300">
                                    <thead className="bg-neutral-950/30 text-xs font-semibold uppercase text-neutral-500">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4 text-center">LOC/Week</th>
                                            <th className="px-6 py-4 text-center">Multiplier</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-800">
                                        {developerProfiles.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-10 text-center text-neutral-500 italic">
                                                    No team members defined yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            developerProfiles.map((dev) => (
                                                <tr key={dev.id} className="group transition-colors hover:bg-neutral-800/30">
                                                    <td className="px-6 py-4 font-medium text-white">{dev.name}</td>
                                                    <td className="px-6 py-4 text-neutral-400">{dev.role}</td>
                                                    <td className="px-6 py-4 text-center font-mono">{dev.weekly_loc_capacity}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                                                            Number(dev.capability_multiplier) < 1.0 
                                                            ? 'bg-green-500/10 text-green-400 ring-green-500/20' 
                                                            : Number(dev.capability_multiplier) > 1.0
                                                            ? 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20'
                                                            : 'bg-blue-500/10 text-blue-400 ring-blue-500/20'
                                                        }`}>
                                                            {dev.capability_multiplier}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={() => handleEditClick(dev)}
                                                                className="h-8 w-8 text-neutral-400 hover:text-blue-400 hover:bg-blue-500/10"
                                                            >
                                                                <UserCog className="h-4 w-4" />
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={() => handleDelete(dev.id)}
                                                                className="h-8 w-8 text-neutral-400 hover:text-red-400 hover:bg-red-500/10"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
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

                {/* Edit Modal */}
                <Dialog open={!!editingDeveloper} onOpenChange={(open) => !open && setEditingDeveloper(null)}>
                    <DialogContent className="border-neutral-800 bg-neutral-900 text-white sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Team Member</DialogTitle>
                            <DialogDescription className="text-neutral-400">
                                Update capability parameters for {editingDeveloper?.name}.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdateSubmit} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    className="border-neutral-800 bg-neutral-950/50"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-role">Role</Label>
                                <Input
                                    id="edit-role"
                                    value={editForm.data.role}
                                    onChange={(e) => editForm.setData('role', e.target.value)}
                                    className="border-neutral-800 bg-neutral-950/50"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-loc">LOC/Week</Label>
                                    <Input
                                        id="edit-loc"
                                        type="number"
                                        value={editForm.data.weekly_loc_capacity}
                                        onChange={(e) => editForm.setData('weekly_loc_capacity', e.target.value)}
                                        className="border-neutral-800 bg-neutral-950/50"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-multiplier">Multiplier</Label>
                                    <Input
                                        id="edit-multiplier"
                                        type="number"
                                        step="0.01"
                                        value={editForm.data.capability_multiplier}
                                        onChange={(e) => editForm.setData('capability_multiplier', e.target.value)}
                                        className="border-neutral-800 bg-neutral-950/50"
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter className="pt-4">
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    onClick={() => setEditingDeveloper(null)}
                                    className="text-neutral-400 hover:text-white"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={editForm.processing}
                                    className="bg-blue-600 hover:bg-blue-500"
                                >
                                    {editForm.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </SettingsLayout>
        </AppLayout>
    );
}
