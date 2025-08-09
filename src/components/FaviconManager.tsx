import { useEffect } from "react";
import { useTheme } from "next-themes";

const ensureFaviconLink = () => {
  let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    document.head.appendChild(link);
  }
  return link!;
};

const getHalalMode = () => {
  const attr = document.documentElement.getAttribute("data-halal-mode");
  if (attr === "true" || attr === "false") return attr === "true";
  // Fallback to localStorage if attribute not set
  try { return localStorage.getItem("isHalalMode") === "true"; } catch { return false; }
};

export const FaviconManager = () => {
  const { theme } = useTheme();

  useEffect(() => {
    const updateFavicon = () => {
      const halal = getHalalMode();
      const isDark = theme === "dark";
      const href = halal
        ? (isDark ? "/icons/magit-favicon-halal-dark.png" : "/icons/magit-favicon-halal-light.png")
        : (isDark ? "/icons/magit-favicon-dark.png" : "/icons/magit-favicon-light.png");
      const link = ensureFaviconLink();
      if (link.href.endsWith(href)) return; // avoid redundant updates
      link.href = href;
      link.type = "image/png";
    };

    updateFavicon();

    // Observe halal mode attribute changes
    const observer = new MutationObserver(() => updateFavicon());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-halal-mode"] });

    // Also update on visibility change (route/theme changes might occur while hidden)
    const onVis = () => updateFavicon();
    document.addEventListener("visibilitychange", onVis);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [theme]);

  return null;
};

export default FaviconManager;
