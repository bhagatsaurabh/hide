import CrashBoard from "@/components/common/CrashBoard/CrashBoard";
import { Component, ErrorInfo, PropsWithChildren } from "react";

type GlobalErrorBoundaryProps = PropsWithChildren;
type GlobalErrorBoundaryState = { hasError: boolean; error: Error | null };

export default class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crashed:", error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <CrashBoard code={this.state.error?.message} />;
    }
    return this.props.children;
  }
}
