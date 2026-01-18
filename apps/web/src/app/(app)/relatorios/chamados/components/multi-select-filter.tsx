"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectFilterProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelectFilter({
  options,
  selected,
  onChange,
  placeholder = "Selecionar...",
  className,
  disabled = false,
}: MultiSelectFilterProps) {
  const [open, setOpen] = React.useState(false);

  const handleToggle = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const selectedLabels = selected
    .map((v) => options.find((o) => o.value === v)?.label)
    .filter(Boolean);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-[200px] justify-between", className)}
        >
          <span className="truncate">
            {selected.length === 0
              ? placeholder
              : selected.length === 1
                ? selectedLabels[0]
                : `${selected.length} selecionados`}
          </span>
          <div className="flex items-center gap-1">
            {selected.length > 0 && (
              <X
                className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                onClick={handleClear}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <div className="max-h-[300px] overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggle(option.value)}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent",
                selected.includes(option.value) && "bg-accent"
              )}
            >
              <div
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded border",
                  selected.includes(option.value)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground"
                )}
              >
                {selected.includes(option.value) && (
                  <Check className="h-3 w-3" />
                )}
              </div>
              <span className="truncate">{option.label}</span>
            </button>
          ))}
        </div>
        {selected.length > 0 && (
          <div className="border-t p-2">
            <div className="flex flex-wrap gap-1">
              {selectedLabels.slice(0, 3).map((label, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {label}
                </Badge>
              ))}
              {selectedLabels.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{selectedLabels.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
