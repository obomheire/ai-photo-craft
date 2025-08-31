"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ProjectCard from "./project-card";

export function ProjectGrid({ projects }) {
  const router = useRouter();

  const handleEditProject = (projectId) => {
    router.push(`/editor/${projectId}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 p-4 md:p-6">
      {projects.map((project) => (
        <div key={project._id} className="transform transition-all duration-300 hover:-translate-y-1">
          <ProjectCard
            project={project}
            onEdit={() => handleEditProject(project._id)}
          />
        </div>
      ))}
    </div>
  );
}
