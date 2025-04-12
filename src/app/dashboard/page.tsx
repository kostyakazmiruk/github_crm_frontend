// apps/client/app/dashboard/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Project, ProjectService } from '@/services/project.service';
// import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import {
  Dialog, DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [ownerRepo, setOwnerRepo] = useState("facebook/react")


  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => ProjectService.getProjects(),
  });

  const addMutation = useMutation({
    mutationFn: (repoPath: string) => ProjectService.addProject({ path: repoPath }),
    onSuccess: () => {
      router.push('/dashboard');
      setIsAddOpen(false)
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
      setIsDeleteOpen(false);
    },
  });

  const handleDelete = (project:Project) => {
    setProjectToDelete(project);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteMutation.mutate(projectToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        Loading..
        {/*<Spinner size="lg" />*/}
      </div>
    );
  }
  console.log({ownerRepo})

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">GitHub Projects</h1>
        <Button onClick={() => setIsAddOpen(true)}>
          {/*<PlusIcon className="h-5 w-5 mr-2" />*/}
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
            {projects?.length > 0 ? (
              projects.map((project) => (
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
                    {formatDistanceToNow(project.createdAtTimestamp)} ago
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => updateMutation.mutate(project.id)}
                      disabled={updateMutation.isPending}
                    >
                      {/*<RefreshIcon className="h-4 w-4" />*/}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(project)}
                    >
                      {/*<TrashIcon className="h-4 w-4" />*/}
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No projects found. Add your first GitHub project!
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
      {/*Add project dialog*/}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
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
                  value={ownerRepo || "facebook/react"}
                  onChange={(e) => setOwnerRepo(e.target.value)}
                  className="col-span-3"
                  placeholder="facebook/react"
                />
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => addMutation.mutate(ownerRepo)} disabled={addMutation.isPending}>
                {addMutation.isPending ? 'Adding...' : 'Add Project'}
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {/*<Dialog open={isDeleteOpen} onOpenChange={() => setIsDeleteOpen(false)}>*/}
      {/*  <div className="fixed inset-0 bg-black/30" aria-hidden="true" />*/}
      {/*  <div className="fixed inset-0 flex items-center justify-center p-4">*/}
      {/*    <DialogHeader className="mx-auto max-w-sm rounded bg-white p-6">*/}
      {/*      <DialogTitle className="text-lg font-medium">Delete Project</DialogTitle>*/}
      {/*      <DialogDescription className="mt-2 text-sm text-gray-500">*/}
      {/*        Are you sure you want to delete the project {projectToDelete?.owner}/{projectToDelete?.name}?*/}
      {/*        This action cannot be undone.*/}
      {/*      </DialogDescription>*/}

      {/*      <div className="mt-4 flex justify-end space-x-2">*/}
      {/*        <Button onClick={() => setIsDeleteOpen(false)} className="cursor-pointer hover:opacity-90">*/}
      {/*          Cancel*/}
      {/*        </Button>*/}
      {/*        <Button*/}
      {/*          variant="destructive"*/}
      {/*          onClick={confirmDelete}*/}
      {/*          className="cursor-pointer hover:opacity-90"*/}
      {/*          disabled={deleteMutation.isPending}*/}
      {/*        >*/}
      {/*          {deleteMutation.isPending ? 'Deleting...' : 'Delete'}*/}
      {/*        </Button>*/}
      {/*      </div>*/}
      {/*    </DialogHeader>*/}
      {/*  </div>*/}
      {/*</Dialog>*/}
    </div>
  );
}