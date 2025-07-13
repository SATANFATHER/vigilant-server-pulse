import { Monitor, BarChart3, FileText, LogOut, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "results", label: "Results", icon: FileText },
  { id: "ssh", label: "SSH", icon: Monitor },
];

export const Sidebar = ({ activeItem, onItemClick }: SidebarProps) => {
  return (
    <div className="flex flex-col h-screen w-64 bg-gradient-to-b from-[hsl(260_85%_45%)] to-[hsl(280_90%_60%)] text-white">
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg">DIICOT</h1>
            <p className="text-sm text-white/70">Project Panel</p>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="p-4 mx-4 mt-4 bg-white/10 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">👤</span>
          </div>
          <div>
            <p className="text-sm font-medium">Welcome back</p>
            <p className="text-xs text-white/70">Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 mt-6">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-2",
              activeItem === item.id
                ? "bg-white/20 text-white shadow-lg"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Theme Toggle */}
      <div className="p-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
        >
          <Sun className="w-4 h-4 mr-2" />
          Light Mode
        </Button>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-white/20">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};