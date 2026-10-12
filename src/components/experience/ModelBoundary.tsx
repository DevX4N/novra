"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; onError: () => void };

/** Catches a model that fails to load or parse, so the photographs take over. */
export class ModelBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV === "development") console.warn("[NØVRA] 3D model unavailable:", error);
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
