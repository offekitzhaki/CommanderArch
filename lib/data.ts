import { Category, Command } from './types';

// The original type was too strict for seed data. This new type
// accurately reflects that initial data is a template without database IDs.
// It uses Pick to derive from the main types for better maintainability.
type InitialCategory = Pick<Category, 'name'> & {
  commands: Pick<Command, 'description' | 'command'>[];
};

export const initialCommandData: InitialCategory[] = [
  {
    name: 'Docker',
    commands: [
      { description: 'List all running containers', command: 'docker ps' },
      { description: 'List all containers (including stopped)', command: 'docker ps -a' },
      { description: 'List all local images', command: 'docker images' },
      { description: 'Build an image from a Dockerfile', command: 'docker build -t <image-name> .' },
      { description: 'Run a command in a new container', command: 'docker run <image-name>' },
    ],
  },
  {
    name: 'Kubernetes',
    commands: [
      { description: 'List all pods in the current namespace', command: 'kubectl get pods' },
      { description: 'List all services', command: 'kubectl get services' },
      { description: 'Apply a configuration file', command: 'kubectl apply -f <file.yaml>' },
      { description: 'View logs for a pod', command: 'kubectl logs <pod-name>' },
    ],
  },
  {
    name: 'Git',
    commands: [
      { description: 'Check the status of your repository', command: 'git status' },
      { description: 'Add all new and changed files to the staging area', command: 'git add .' },
      { description: 'Push committed changes to a remote repository', command: 'git push origin <branch-name>' },
      { description: 'Pull the latest changes from a remote repository', command: 'git pull' },
    ],
  },
  {
    name: 'Linux CLI',
    commands: [
      { description: 'List files and directories', command: 'ls -la' },
      { description: 'Change current directory', command: 'cd <directory>' },
      { description: 'Search for a pattern in a file', command: 'grep "pattern" <file.txt>' },
    ],
  },
];
