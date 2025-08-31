import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export default function ProjectCard({ project, onEdit }) {
  const { mutate: deleteProject, isLoading } = useConvexMutation(
    api.projects.deleteProject
  );

  const lastUpdated = formatDistanceToNow(new Date(project.updatedAt), {
    addSuffix: true,
  });

  const handleDelete = async () => {
    const confirmed = confirm(
      `Are you sure you want to delete "${project.title}"? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await deleteProject({ projectId: project._id });
        toast.success("Project deleted successfully");
      } catch (error) {
        console.error("Error deleting project:", error);
        toast.error("Failed to delete project. Please try again.");
      }
    }
  };

  return (
    <Card className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      {/* Thumbnail */}
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/20" />
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted/50 flex items-center justify-center">
            <span className="text-muted-foreground">No preview</span>
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 p-4">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={onEdit} 
            className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDelete}
            className="gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border-red-500/20"
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Project Info */}
      <CardContent className="p-4 space-y-3">
        <div className="space-y-1.5">
          <h3 className="font-semibold text-lg text-foreground truncate">
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            Updated {lastUpdated}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="text-xs bg-primary/10 text-primary border-primary/20"
          >
            {project.width} × {project.height}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
