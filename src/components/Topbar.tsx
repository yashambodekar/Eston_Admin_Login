import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TopbarProps {
  title: string;
}

const Topbar = ({ title }: TopbarProps) => {
  return (
    <header className="sticky top-0 z-10 bg-background border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 bg-primary">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@gmail.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
