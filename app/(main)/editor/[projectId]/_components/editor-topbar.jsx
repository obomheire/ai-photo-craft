"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  RotateCcw,
  RotateCw,
  Crop,
  Expand,
  Sliders,
  Palette,
  Maximize2,
  ChevronDown,
  Text,
  RefreshCcw,
  Loader2,
  Eye,
  Save,
  Download,
  FileImage,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useCanvas } from "@/context/context";
import { usePlanAccess } from "@/hooks/use-plan-access";
import { UpgradeModal } from "@/components/upgrade-modal";
import { FabricImage } from "fabric";
import { api } from "@/convex/_generated/api";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { toast } from "sonner";

const TOOLS = [
  {
    id: "resize",
    label: "Resize",
    icon: Expand,
    isActive: true,
  },
  {
    id: "crop",
    label: "Crop",
    icon: Crop,
  },
  {
    id: "adjust",
    label: "Adjust",
    icon: Sliders,
  },
  {
    id: "text",
    label: "Text",
    icon: Text,
  },
  {
    id: "background",
    label: "AI Background",
    icon: Palette,
    proOnly: true,
  },
  {
    id: "ai_extender",
    label: "AI Image Extender",
    icon: Maximize2,
    proOnly: true,
  },
  {
    id: "ai_edit",
    label: "AI Editing",
    icon: Eye,
    proOnly: true,
  },
];

const EXPORT_FORMATS = [
  {
    format: "PNG",
    quality: 1.0,
    label: "PNG (High Quality)",
    extension: "png",
  },
  {
    format: "JPEG",
    quality: 0.9,
    label: "JPEG (90% Quality)",
    extension: "jpg",
  },
  {
    format: "JPEG",
    quality: 0.8,
    label: "JPEG (80% Quality)",
    extension: "jpg",
  },
  {
    format: "WEBP",
    quality: 0.9,
    label: "WebP (90% Quality)",
    extension: "webp",
  },
];

export function EditorTopBar({ project }) {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [restrictedTool, setRestrictedTool] = useState(null);

  // Undo/Redo state
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [isUndoRedoOperation, setIsUndoRedoOperation] = useState(false);

  const { activeTool, onToolChange, canvasEditor } = useCanvas();
  const { hasAccess, canExport, isFree } = usePlanAccess();

  // Use the loading states from the hooks
  const { mutate: updateProject, isLoading: isSaving } = useConvexMutation(
    api.projects.updateProject
  );
  const { data: user } = useConvexQuery(api.users.getCurrentUser);

  // Save canvas state to undo stack
  const saveToUndoStack = () => {
    if (!canvasEditor || isUndoRedoOperation) return;

    const canvasState = JSON.stringify(canvasEditor.toJSON());

    setUndoStack((prev) => {
      const newStack = [...prev, canvasState];
      // Limit undo stack to 20 items to prevent memory issues
      if (newStack.length > 20) {
        newStack.shift();
      }
      return newStack;
    });

    // Clear redo stack when new action is performed
    setRedoStack([]);
  };

  // Setup undo/redo listeners
  useEffect(() => {
    if (!canvasEditor) return;

    // Save initial state
    setTimeout(() => {
      if (canvasEditor && !isUndoRedoOperation) {
        const initialState = JSON.stringify(canvasEditor.toJSON());
        setUndoStack([initialState]);
      }
    }, 1000);

    const handleCanvasModified = () => {
      if (!isUndoRedoOperation) {
        // Debounce state saving to avoid too many saves
        setTimeout(() => {
          if (!isUndoRedoOperation) {
            saveToUndoStack();
          }
        }, 500);
      }
    };

    // Listen to canvas events that should trigger state save
    canvasEditor.on("object:modified", handleCanvasModified);
    canvasEditor.on("object:added", handleCanvasModified);
    canvasEditor.on("object:removed", handleCanvasModified);
    canvasEditor.on("path:created", handleCanvasModified);

    return () => {
      canvasEditor.off("object:modified", handleCanvasModified);
      canvasEditor.off("object:added", handleCanvasModified);
      canvasEditor.off("object:removed", handleCanvasModified);
      canvasEditor.off("path:created", handleCanvasModified);
    };
  }, [canvasEditor, isUndoRedoOperation]);

  // Undo function
  const handleUndo = async () => {
    if (!canvasEditor || undoStack.length <= 1) return;

    setIsUndoRedoOperation(true);

    try {
      // Move current state to redo stack
      const currentState = JSON.stringify(canvasEditor.toJSON());
      setRedoStack((prev) => [...prev, currentState]);

      // Remove last state from undo stack and apply the previous one
      const newUndoStack = [...undoStack];
      newUndoStack.pop(); // Remove current state
      const previousState = newUndoStack[newUndoStack.length - 1];

      if (previousState) {
        await canvasEditor.loadFromJSON(JSON.parse(previousState));
        canvasEditor.requestRenderAll();
        setUndoStack(newUndoStack);
        toast.success("Undid last action");
      }
    } catch (error) {
      console.error("Error during undo:", error);
      toast.error("Failed to undo action");
    } finally {
      setTimeout(() => setIsUndoRedoOperation(false), 100);
    }
  };

  // Redo function
  const handleRedo = async () => {
    if (!canvasEditor || redoStack.length === 0) return;

    setIsUndoRedoOperation(true);

    try {
      // Get the latest state from redo stack
      const newRedoStack = [...redoStack];
      const nextState = newRedoStack.pop();

      if (nextState) {
        // Save current state to undo stack
        const currentState = JSON.stringify(canvasEditor.toJSON());
        setUndoStack((prev) => [...prev, currentState]);

        // Apply the redo state
        await canvasEditor.loadFromJSON(JSON.parse(nextState));
        canvasEditor.requestRenderAll();
        setRedoStack(newRedoStack);
        toast.success("Redid last action");
      }
    } catch (error) {
      console.error("Error during redo:", error);
      toast.error("Failed to redo action");
    } finally {
      setTimeout(() => setIsUndoRedoOperation(false), 100);
    }
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  // Handle tool change with access control
  const handleToolChange = (toolId) => {
    if (!hasAccess(toolId)) {
      setRestrictedTool(toolId);
      setShowUpgradeModal(true);
      return;
    }
    onToolChange(toolId);
  };

  // Manual save functionality
  const handleManualSave = async () => {
    if (!canvasEditor || !project) {
      toast.error("Canvas not ready for saving");
      return;
    }

    try {
      const canvasJSON = canvasEditor.toJSON();
      await updateProject({
        projectId: project._id,
        canvasState: canvasJSON,
      });
      toast.success("Project saved successfully!");
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project. Please try again.");
    }
  };

  // Export canvas as image
  const handleExport = async (exportConfig) => {
    if (!canvasEditor || !project) {
      toast.error("Canvas not ready for export");
      return;
    }

    // Check export limits for free users
    if (!canExport(user?.exportsThisMonth || 0)) {
      setRestrictedTool("export");
      setShowUpgradeModal(true);
      return;
    }

    setIsExporting(true);
    setExportFormat(exportConfig.format);

    try {
      // Store current canvas state for restoration
      const currentZoom = canvasEditor.getZoom();
      const currentViewportTransform = [...canvasEditor.viewportTransform];

      // Reset zoom and viewport for accurate export
      canvasEditor.setZoom(1);
      canvasEditor.setViewportTransform([1, 0, 0, 1, 0, 0]);
      canvasEditor.setDimensions({
        width: project.width,
        height: project.height,
      });
      canvasEditor.requestRenderAll();

      // Export the canvas
      const dataURL = canvasEditor.toDataURL({
        format: exportConfig.format.toLowerCase(),
        quality: exportConfig.quality,
        multiplier: 1,
      });

      // Restore original canvas state
      canvasEditor.setZoom(currentZoom);
      canvasEditor.setViewportTransform(currentViewportTransform);
      canvasEditor.setDimensions({
        width: project.width * currentZoom,
        height: project.height * currentZoom,
      });
      canvasEditor.requestRenderAll();

      // Download the image
      const link = document.createElement("a");
      link.download = `${project.title}.${exportConfig.extension}`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Image exported as ${exportConfig.format}!`);
    } catch (error) {
      console.error("Error exporting image:", error);
      toast.error("Failed to export image. Please try again.");
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  // Reset canvas to original state
  const handleResetToOriginal = async () => {
    if (!canvasEditor || !project || !project.originalImageUrl) {
      toast.error("No original image found to reset to");
      return;
    }

    // Save state before reset for undo
    saveToUndoStack();

    try {
      // Clear canvas and reset state
      canvasEditor.clear();
      canvasEditor.backgroundColor = "#ffffff";
      canvasEditor.backgroundImage = null;

      // Load original image
      const fabricImage = await FabricImage.fromURL(project.originalImageUrl, {
        crossOrigin: "anonymous",
      });

      // Calculate proper scaling
      const imgAspectRatio = fabricImage.width / fabricImage.height;
      const canvasAspectRatio = project.width / project.height;
      const scale =
        imgAspectRatio > canvasAspectRatio
          ? project.width / fabricImage.width
          : project.height / fabricImage.height;

      fabricImage.set({
        left: project.width / 2,
        top: project.height / 2,
        originX: "center",
        originY: "center",
        scaleX: scale,
        scaleY: scale,
        selectable: true,
        evented: true,
      });

      fabricImage.filters = [];
      canvasEditor.add(fabricImage);
      canvasEditor.centerObject(fabricImage);
      canvasEditor.setActiveObject(fabricImage);
      canvasEditor.requestRenderAll();

      // Save the reset state
      const canvasJSON = canvasEditor.toJSON();
      await updateProject({
        projectId: project._id,
        canvasState: canvasJSON,
        currentImageUrl: project.originalImageUrl,
        activeTransformations: undefined,
        backgroundRemoved: false,
      });

      toast.success("Canvas reset to original image");
    } catch (error) {
      console.error("Error resetting canvas:", error);
      toast.error("Failed to reset canvas. Please try again.");
    }
  };

  // Check if undo/redo is available
  const canUndo = undoStack.length > 1;
  const canRedo = redoStack.length > 0;

  return (
    <>
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        {/* Header Row */}
        <div className="flex items-center justify-between p-4">
          {/* Left: Back button and project name */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="text-foreground hover:text-foreground/80 hover:bg-primary/10 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              All Projects
            </Button>
            <div className="h-4 w-px bg-border/50" />
            <h1 className="text-lg font-semibold text-foreground capitalize">
              {project.title}
            </h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Undo/Redo */}
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-full ${
                  !canUndo
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-primary/10 text-foreground hover:text-foreground/80"
                }`}
                onClick={handleUndo}
                disabled={!canUndo || isUndoRedoOperation}
                title={`Undo (${undoStack.length - 1} actions available)`}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-full ${
                  !canRedo
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-primary/10 text-foreground hover:text-foreground/80"
                }`}
                onClick={handleRedo}
                disabled={!canRedo || isUndoRedoOperation}
                title={`Redo (${redoStack.length} actions available)`}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="h-4 w-px bg-border/50" />

            {/* Reset Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetToOriginal}
              disabled={isSaving || !project.originalImageUrl}
              className="gap-2 hover:bg-primary/10 text-foreground hover:text-foreground/80"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4" />
                  Reset
                </>
              )}
            </Button>

            {/* Manual Save Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleManualSave}
              disabled={isSaving || !canvasEditor}
              className="gap-2 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  disabled={isExporting || !canvasEditor}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Exporting {exportFormat}...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Export
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 bg-popover border-border"
              >
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Export Resolution: {project.width} × {project.height}px
                </div>

                <DropdownMenuSeparator />

                {EXPORT_FORMATS.map((config, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => handleExport(config)}
                    className="cursor-pointer flex items-center gap-2"
                  >
                    <FileImage className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <div className="font-medium">{config.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {config.format} • {Math.round(config.quality * 100)}%
                        quality
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                {/* Export Limit Info for Free Users */}
                {isFree && (
                  <div className="px-3 py-2 text-xs">
                    <div className="text-muted-foreground">
                      Free Plan: {user?.exportsThisMonth || 0}/20 exports this
                      month
                    </div>
                    {(user?.exportsThisMonth || 0) >= 20 && (
                      <div className="text-primary mt-1 font-medium">
                        Upgrade to Pro for unlimited exports
                      </div>
                    )}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tools Row */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-lg shadow-sm">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              const hasToolAccess = hasAccess(tool.id);

              return (
                <Button
                  key={tool.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleToolChange(tool.id)}
                  className={`gap-2 relative rounded-md transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20"
                      : "text-foreground hover:text-foreground/90 hover:bg-primary/5 hover:ring-1 hover:ring-primary/10"
                  } ${!hasToolAccess ? "opacity-60" : ""}`}
                >
                  <Icon className="h-4 w-4" />
                  {tool.label}
                  {tool.proOnly && !hasToolAccess && (
                    <Lock className="h-3 w-3 text-primary animate-pulse" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false);
          setRestrictedTool(null);
        }}
        restrictedTool={restrictedTool}
        reason={
          restrictedTool === "export"
            ? "Free plan is limited to 20 exports per month. Upgrade to Pro for unlimited exports."
            : undefined
        }
      />
    </>
  );
}
