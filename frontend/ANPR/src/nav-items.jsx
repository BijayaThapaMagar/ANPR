import { Activity, Image, Video, Home } from "lucide-react";
import Dashboard from "./pages/Dashboard.jsx";
import ImageProcessor from "./pages/ImageProcessor.jsx";
import VideoProcessor from "./pages/VideoProcessor.jsx";
import Index from "./pages/Index.jsx";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <Home className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <Activity className="h-4 w-4" />,
    page: <Dashboard />,
  },
  {
    title: "Image Processing",
    to: "/image-processor",
    icon: <Image className="h-4 w-4" />,
    page: <ImageProcessor />,
  },
  {
    title: "Video Processing",
    to: "/video-processor",
    icon: <Video className="h-4 w-4" />,
    page: <VideoProcessor />,
  },
];

export const routes = [
  ...navItems,
];
