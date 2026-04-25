import { useEffect, useState } from "react";
import { getActiveProjects } from "../../services/projects";
import type { ProjectOption } from "../../services/types";
import { MEETINGS_OPTION, OTHERS_OPTION } from "./constants";

export type SelectableProject = ProjectOption & {
  value: string;
};

export function useProjects(userId: string | null) {
  const [projects, setProjects] = useState<SelectableProject[]>([]);
  const [queryError, setQueryError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const loadProjects = async () => {
      try {
        const activeProjects = await getActiveProjects(userId);
        setProjects([
          ...activeProjects.map((project) => ({
            ...project,
            value: project.projectId,
          })),
          {
            allocationId: MEETINGS_OPTION,
            projectId: "",
            name: "Meetings",
            value: MEETINGS_OPTION,
          },
          {
            allocationId: OTHERS_OPTION,
            projectId: "",
            name: "Others",
            value: OTHERS_OPTION,
          },
        ]);
      } catch (error) {
        setQueryError(
          error instanceof Error
            ? error.message
            : "Unable to load active projects.",
        );
      }
    };

    void loadProjects();
  }, [userId]);

  return { projects, queryError };
}
