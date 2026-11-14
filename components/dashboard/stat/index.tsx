import React from "react";
import NumberFlow from "@number-flow/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bullet } from "@/components/ui/bullet";
import { cn } from "@/lib/utils";

interface DashboardStatProps {
  label: string;
  value: string;
  description?: string;
  tag?: string;
  icon: React.ElementType;
  intent?: "positive" | "negative" | "neutral";
  direction?: "up" | "down";
}

export default function DashboardStat({
  label,
  value,
  description,
  icon,
  tag,
  intent,
  direction,
}: DashboardStatProps) {
  const Icon = icon;

  // Extract prefix, numeric value, and suffix from the value string
  const parseValue = (val: string) => {
    // Match pattern: optional prefix + number + optional suffix
    const match = val.match(/^([^\d.-]*)([+-]?\d*\.?\d+)([^\d]*)$/);

    if (match) {
      const [, prefix, numStr, suffix] = match;
      return {
        prefix: prefix || "",
        numericValue: parseFloat(numStr),
        suffix: suffix || "",
        isNumeric: !isNaN(parseFloat(numStr)),
      };
    }

    return {
      prefix: "",
      numericValue: 0,
      suffix: val,
      isNumeric: false,
    };
  };

  const getIntentClassName = () => {
    if (intent === "positive") return "text-success";
    if (intent === "negative") return "text-destructive";
    return "text-muted-foreground";
  };

  const { prefix, numericValue, suffix, isNumeric } = parseValue(value);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2.5">
          <Bullet />
          {label}
        </CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent className="bg-accent flex-1 pt-2 md:pt-6 overflow-clip relative">
        <div className="flex items-center">
          <span className="text-4xl md:text-5xl font-display">
            {isNumeric ? (
              <NumberFlow
                value={numericValue}
                prefix={prefix}
                suffix={suffix}
              />
            ) : (
              value
            )}
          </span>
          {tag && (
            <Badge variant="default" className="uppercase ml-3">
              {tag}
            </Badge>
          )}
        </div>

        {description && (
          <div className="justify-between">
            <p className="text-xs md:text-sm font-medium text-muted-foreground tracking-wide">
              {description}
            </p>
          </div>
        )}

        {/* Direction Indicator */}
        {direction && (
          <div className="absolute top-0 right-0 w-12 h-full pointer-events-none flex items-center justify-center pr-3">
            <span
              className={cn(
                "text-3xl font-display leading-none opacity-40 transition-opacity hover:opacity-80",
                getIntentClassName()
              )}
            >
              {direction === "up" ? "↑" : "↓"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
