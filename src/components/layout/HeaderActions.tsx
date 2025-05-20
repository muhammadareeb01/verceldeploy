import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";

interface HeaderButton {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "outline" | "destructive";
}

interface HeaderActionsProps {
  backLink?: string;
  buttons?: HeaderButton[];
  title?: {
    icon?: React.ReactNode;
    text: string;
  };
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  backLink,
  buttons = [],
  title,
}) => {
  return (
    <div className="bg-black/5 rounded-lg px-6 py-4 mb-4">
      <div className="flex items-center justify-between">
        {/* Back Button */}
        <div>
          {backLink && (
            <Button variant="ghost" size="sm" asChild>
              <Link to={backLink}>
                <ArrowLeft className="  h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {/* Center Title */}
        {title && (
          <h1 className="text-2xl font-bold flex items-center gap-2 justify-center text-center">
            {title.icon}
            {title.text}
          </h1>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {buttons.map((btn, index) => (
            <Button
              key={index}
              onClick={btn.onClick}
              variant={btn.variant ?? "default"}
              className="flex items-center"
            >
              {btn.icon}
              {btn.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeaderActions;
