
import { ArrowUp, ArrowDown, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface KeyboardNavigationHintsProps {
  visible: boolean;
}

const KeyboardNavigationHints = ({ visible }: KeyboardNavigationHintsProps) => {
  if (!visible) return null;

  return (
    <div className="absolute right-3 top-13 z-[101] flex gap-1 mt-2">
      <Badge variant="outline" className="flex items-center gap-1 h-6 bg-background/80 backdrop-blur-sm">
        <ArrowUp size={12} /> <ArrowDown size={12} /> to navigate
      </Badge>
      <Badge variant="outline" className="flex items-center gap-1 h-6 bg-background/80 backdrop-blur-sm">
        <ArrowRight size={12} /> to select
      </Badge>
    </div>
  );
};

export default KeyboardNavigationHints;
