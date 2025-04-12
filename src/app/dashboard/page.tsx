// apps/client/app/dashboard/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Project, ProjectService } from '@/services/project.service';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RefreshCcw, PlusIcon, TrashIcon, LogOut } from 'lucide-react';
import { AuthService } from '@/services/auth.service';

// Define dialog types
type DialogType = 'none' | 'add' | 'delete';

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Dialog state management
  const [dialogType, setDialogType] = useState<DialogType>('none');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [ownerRepo, setOwnerRepo] = useState("facebook/react");

  // Query and mutations
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => ProjectService.getProjects(),
    initialData: [],
  });

  const addMutation = useMutation({
    mutationFn: (repoPath: string) => ProjectService.addProject({ path: repoPath }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      closeDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (id: number) => ProjectService.updateProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ProjectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      closeDialog();
    },
  });

  // Dialog handlers
  const openAddDialog = () => {
    setDialogType('add');
  };

  const openDeleteDialog = (project: Project) => {
    setSelectedProject(project);
    setDialogType('delete');
  };

  const closeDialog = () => {
    setDialogType('none');
    setSelectedProject(null);
  };

  const handleConfirmAction = () => {
    if (dialogType === 'add') {
      addMutation.mutate(ownerRepo);
    } else if (dialogType === 'delete' && selectedProject) {
      deleteMutation.mutate(selectedProject.id);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        Loading...
      </div>
    );
  }



  // Determine if dialog is open
  const isDialogOpen = dialogType !== 'none';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-end items-center mb-3">
        <Button onClick={() => AuthService.logout()} className="opacity-90">
          <LogOut className="h-5 w-5 mr-2" />
          Log out
        </Button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">GitHub Projects</h1>
        <Button onClick={openAddDialog}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Project
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Repository
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stars
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Forks
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Issues
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {projects?.length < 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No projects found. Add your first GitHub project!
                </td>
              </tr>
            ) : (
              projects?.map((project) => (
                <tr key={project.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                        {project.owner}/{project.name}
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.stars.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.forks.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.issues.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.createdAtTimestamp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => updateMutation.mutate(project.id)}
                      disabled={updateMutation.isPending}
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => openDeleteDialog(project)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-[425px]">
          {dialogType === 'add' && (
            <>
              <DialogHeader>
                <DialogTitle>Add Public GitHub Project</DialogTitle>
                <DialogDescription>Format should be: owner/repo (e.g. facebook/react)</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ownerRepo" className="text-right">
                    Owner/Repo
                  </Label>
                  <Input
                    id="ownerRepo"
                    value={ownerRepo}
                    onChange={(e) => setOwnerRepo(e.target.value)}
                    className="col-span-3"
                    placeholder="facebook/react"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleConfirmAction} disabled={addMutation.isPending}>
                  {addMutation.isPending ? 'Adding...' : 'Add Project'}
                </Button>
              </DialogFooter>
            </>
          )}

          {dialogType === 'delete' && selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle>Delete Project</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the project {selectedProject.owner}/{selectedProject.name}?
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button variant="outline" onClick={closeDialog} className="mr-2">
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmAction}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}