"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Loader2, Monitor } from "lucide-react";
import { EditorTopBar } from "./_components/editor-topbar";
import { EditorSidebar } from "./_components/editor-sidebar";
import CanvasEditor from "./_components/canvas";
import { CanvasContext } from "@/context/context";
import { RingLoader } from "react-spinners";

export default function EditorPage() {
  const params = useParams();
  const projectId = params.projectId;
  const [canvasEditor, setCanvasEditor] = useState(null);
  const [processingMessage, setProcessingMessage] = useState(null);

  // State for active tool
  const [activeTool, setActiveTool] = useState("resize");

  // Get project data
  const {
    data: project,
    isLoading,
    error,
  } = useConvexQuery(api.projects.getProject, { projectId });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Project Not Found
          </h1>
          <p className="text-muted-foreground">
            The project you're looking for doesn't exist or you don't have
            access to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <CanvasContext.Provider
      value={{
        canvasEditor,
        setCanvasEditor,
        activeTool,
        onToolChange: setActiveTool,
        processingMessage,
        setProcessingMessage,
      }}
    >
      {/* Mobile Message - Show on screens smaller than lg (1024px) */}
      <div className="lg:hidden min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Monitor className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Desktop Required
          </h1>
          <p className="text-muted-foreground text-lg mb-2">
            This editor is only usable on desktop.
          </p>
          <p className="text-muted-foreground text-sm">
            Please use a larger screen to access the full editing experience.
          </p>
        </div>
      </div>

      {/* Desktop Editor - Show on lg screens and above */}
      <div className="hidden lg:block min-h-screen bg-background">
        <div className="flex flex-col h-screen">
          {processingMessage && (
            <div className="fixed inset-0 bg-background/50 backdrop-blur-xs z-50 flex items-center justify-center">
              <div className="rounded-lg p-6 flex flex-col items-center gap-4">
                <RingLoader color="hsl(var(--foreground))" />
                <div className="text-center">
                  <p className="text-foreground font-medium">{processingMessage}</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Please wait, do not switch tabs or navigate away
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Top Bar */}
          <EditorTopBar project={project} />

          {/* Main Editor Layout */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <EditorSidebar project={project} />

            {/* Canvas Area */}
            <div className="flex-1 bg-muted">
              <CanvasEditor project={project} activeTool={activeTool} />
            </div>
          </div>
        </div>
      </div>
    </CanvasContext.Provider>
  );
}
