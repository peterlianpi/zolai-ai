"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[AuthErrorBoundary] Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800">
          <Alert variant="destructive" className="border-none bg-transparent p-0 shadow-none">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-red-800 dark:text-red-400 font-semibold">
              Authentication Error
            </AlertTitle>
            <AlertDescription className="mt-2 text-red-700 dark:text-red-300">
              {this.state.error?.message || "An unexpected error occurred during authentication."}
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={this.handleReset}
              className="gap-2 border-red-200 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/20"
            >
              <RefreshCcw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
