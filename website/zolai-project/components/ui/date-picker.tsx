"use client";

import * as React from "react";
import {
  Clock,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function DatePickerTime({
  label = "Date",
  timeLabel = "Time",
  value,
  onChange,
  className,
}: {
  label?: string;
  timeLabel?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [selectingHours, setSelectingHours] = React.useState(true);

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1) % 12 || 12);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
  const ampm = ["AM", "PM"];

  const currentHours = value ? value.getHours() % 12 || 12 : null;
  const currentMinutes = value ? value.getMinutes() : null;
  const currentAmPm = value ? (value.getHours() >= 12 ? "PM" : "AM") : "AM";

  const handleHourClick = (hour: number) => {
    const newDate = value ? new Date(value) : new Date();
    const isPM = value ? value.getHours() >= 12 : new Date().getHours() >= 12;
    newDate.setHours(isPM ? hour + 12 : hour);
    onChange?.(newDate);
    setSelectingHours(false);
  };

  const handleMinuteClick = (minute: number) => {
    const newDate = value ? new Date(value) : new Date();
    newDate.setMinutes(minute);
    onChange?.(newDate);
  };

  const handleAmPmClick = (period: string) => {
    const newDate = value ? new Date(value) : new Date();
    const currentHours = newDate.getHours();
    if (period === "AM" && currentHours >= 12) {
      newDate.setHours(currentHours - 12);
    } else if (period === "PM" && currentHours < 12) {
      newDate.setHours(currentHours + 12);
    }
    onChange?.(newDate);
  };

  const navigateHour = (direction: number) => {
    if (currentHours === null) return;
    let newHour = currentHours + direction;
    if (newHour > 12) newHour = 1;
    if (newHour < 1) newHour = 12;
    handleHourClick(newHour);
  };

  const navigateMinute = (direction: number) => {
    if (currentMinutes === null) return;
    let newMinute = currentMinutes + direction * 5;
    if (newMinute >= 60) newMinute = 0;
    if (newMinute < 0) newMinute = 55;
    handleMinuteClick(newMinute);
  };

  return (
    <FieldGroup className={className}>
      <Field>
        <FieldLabel htmlFor="date-picker">{label}</FieldLabel>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className="w-full justify-between font-normal transition-all duration-200 hover:shadow-sm"
            >
              {value ? format(value, "PPP") : "Select date"}
              <ChevronDownIcon className="h-4 w-4 opacity-50 transition-transform duration-200" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={value}
              captionLayout="dropdown"
              defaultMonth={value}
              onSelect={(date) => {
                if (date) {
                  const current = value ? new Date(value) : new Date();
                  date.setHours(current.getHours(), current.getMinutes());
                  onChange?.(date);
                } else {
                  onChange?.(undefined);
                }
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </Field>
      <Field>
        <FieldLabel htmlFor="time-picker">{timeLabel}</FieldLabel>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="time-picker"
              className="w-full justify-between font-normal transition-all duration-200 hover:shadow-sm"
            >
              {value ? format(value, "hh:mm a") : "Select time"}
              <Clock className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4" align="start">
            {/* Time Display Header */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {/* Hour Section */}
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full hover:bg-muted"
                  onClick={() => navigateHour(1)}
                >
                  <ChevronLeftIcon className="h-3 w-3" />
                </Button>
                <div className="text-3xl font-bold tabular-nums tracking-wide">
                  {currentHours !== null
                    ? String(currentHours).padStart(2, "0")
                    : "--"}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full hover:bg-muted"
                  onClick={() => navigateHour(-1)}
                >
                  <ChevronRightIcon className="h-3 w-3" />
                </Button>
              </div>

              <span className="text-3xl font-light text-muted-foreground">
                :
              </span>

              {/* Minute Section */}
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full hover:bg-muted"
                  onClick={() => navigateMinute(1)}
                >
                  <ChevronLeftIcon className="h-3 w-3" />
                </Button>
                <div className="text-3xl font-bold tabular-nums tracking-wide">
                  {currentMinutes !== null
                    ? String(currentMinutes).padStart(2, "0")
                    : "--"}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full hover:bg-muted"
                  onClick={() => navigateMinute(-1)}
                >
                  <ChevronRightIcon className="h-3 w-3" />
                </Button>
              </div>

              {/* AM/PM Section */}
              <div className="flex flex-col gap-1 ml-2">
                {ampm.map((period) => (
                  <Button
                    key={period}
                    variant={currentAmPm === period ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "text-xs px-2 py-1 h-auto transition-all duration-200",
                      currentAmPm === period ? "shadow-sm" : "hover:bg-muted",
                    )}
                    onClick={() => handleAmPmClick(period)}
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>

            {/* Selection Tabs */}
            <div className="flex gap-1 p-1 bg-muted/50 rounded-lg mb-3">
              <Button
                variant={selectingHours ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "flex-1 text-xs transition-all duration-200",
                  selectingHours && "shadow-sm",
                )}
                onClick={() => setSelectingHours(true)}
              >
                Hours
              </Button>
              <Button
                variant={!selectingHours ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "flex-1 text-xs transition-all duration-200",
                  !selectingHours && "shadow-sm",
                )}
                onClick={() => setSelectingHours(false)}
              >
                Minutes
              </Button>
            </div>

            {/* Grid Selection */}
            <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto">
              {selectingHours
                ? hours.map((hour) => (
                    <Button
                      key={`h-${hour}`}
                      variant={currentHours === hour ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "h-9 w-9 p-0 text-sm font-medium transition-all duration-200",
                        currentHours === hour
                          ? "shadow-md scale-105"
                          : "hover:bg-muted hover:scale-105",
                      )}
                      onClick={() => handleHourClick(hour)}
                    >
                      {hour}
                    </Button>
                  ))
                : minutes.map((minute) => (
                    <Button
                      key={`m-${minute}`}
                      variant={currentMinutes === minute ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "h-9 w-9 p-0 text-sm font-medium transition-all duration-200",
                        currentMinutes === minute
                          ? "shadow-md scale-105"
                          : "hover:bg-muted hover:scale-105",
                      )}
                      onClick={() => handleMinuteClick(minute)}
                    >
                      {String(minute).padStart(2, "0")}
                    </Button>
                  ))}
            </div>
          </PopoverContent>
        </Popover>
      </Field>
    </FieldGroup>
  );
}
