export type Project = {
  title: string;
  description: string;
  href?: string;
  tags: string[];
};

export const projects: Project[] = [
  {
    title: "Project One",
    description:
      "A short description of what this project is and what makes it interesting.",
    href: "https://github.com/k-sdm",
    tags: ["Next.js", "TypeScript"],
  },
  {
    title: "Project Two",
    description:
      "Another project. Swap these out for your own work as you build.",
    href: "https://github.com/k-sdm",
    tags: ["React", "Tailwind"],
  },
];
