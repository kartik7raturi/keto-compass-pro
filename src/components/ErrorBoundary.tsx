import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

const RELOAD_FLAG_KEY = "ketopia_chunk_reload_attempted";

const isChunkLoadError = (message: string) =>
  /dynamically imported module|Failed to fetch dynamically imported module|Loading chunk|Importing a module script failed/i.test(
    message
  );

/**
 * Catches any uncaught render error in the app. Without this, a single
 * runtime error anywhere in the tree unmounts the whole React app and leaves
 * the user staring at a blank white page with no way to recover.
 *
 * Special-cases "stale chunk" errors: after a new deploy, a tab that's been
 * open since before the deploy references old hashed JS filenames that no
 * longer exist on the server. Rather than showing an error screen for what
 * is really just a stale cache, this silently reloads once to pick up the
 * new build. If that doesn't fix it (reload loop guard via sessionStorage),
 * it falls through to the normal friendly error screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught application error:", error, info);

    if (isChunkLoadError(error.message)) {
      const alreadyTried = sessionStorage.getItem(RELOAD_FLAG_KEY);
      if (!alreadyTried) {
        sessionStorage.setItem(RELOAD_FLAG_KEY, "1");
        window.location.reload();
        return;
      }
    }
  }

  handleReload = () => {
    sessionStorage.removeItem(RELOAD_FLAG_KEY);
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="text-center max-w-sm">
            <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-6">
              We hit an unexpected error loading this page. Reloading usually fixes it.
            </p>
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90"
            >
              Reload Ketopia
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Some chunk-load failures surface as unhandled promise rejections rather
 * than render errors (e.g. a lazy() import() rejecting before React even
 * starts rendering the new route). Catch those globally too.
 */
export const setupChunkErrorRecovery = () => {
  window.addEventListener("unhandledrejection", (event) => {
    const message = event.reason?.message || String(event.reason || "");
    if (isChunkLoadError(message)) {
      const alreadyTried = sessionStorage.getItem(RELOAD_FLAG_KEY);
      if (!alreadyTried) {
        sessionStorage.setItem(RELOAD_FLAG_KEY, "1");
        window.location.reload();
      }
    }
  });
};
