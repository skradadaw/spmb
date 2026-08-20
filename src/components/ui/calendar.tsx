"use client"

import * as React from "react"
import { DayPicker, type DropdownProps } from "react-day-picker"
import "react-day-picker/style.css"

import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function CustomDropdown(props: DropdownProps) {
  const { options, value, onChange, disabled, "aria-label": ariaLabel } = props;
  const selectedOption = options?.find((opt) => opt.value === Number(value));

  // Determine if it's month or year by options count
  const isMonth = options && options.length <= 12 && options[0]?.value === 0;

  return (
    <Select
      value={value !== undefined ? String(value) : undefined}
      onValueChange={(val) => {
        if (onChange) {
          const syntheticEvent = {
            target: { value: val },
          } as React.ChangeEvent<HTMLSelectElement>;
          onChange(syntheticEvent);
        }
      }}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          "h-8 px-2 py-1 text-xs font-semibold bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg shadow-xs focus:ring-2 focus:ring-[#00AA13]/20 focus:border-[#00AA13] gap-1 text-gray-800 transition-all cursor-pointer",
          isMonth ? "w-[102px] sm:w-[115px]" : "w-[72px] sm:w-[80px]"
        )}
        aria-label={ariaLabel}
      >
        <SelectValue>{selectedOption?.label || value}</SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-56 z-[80] bg-white rounded-xl shadow-2xl border border-gray-100 p-1">
        {options?.map((option) => (
          <SelectItem
            key={option.value}
            value={String(option.value)}
            disabled={option.disabled}
            className="text-xs font-medium py-1.5 px-2.5 rounded-lg cursor-pointer focus:bg-[#00AA13]/10 focus:text-[#00AA13]"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Calendar({
  className,
  showOutsideDays = true,
  components,
  ...props
}: CalendarProps) {
  return (
    <div
      className={cn(
        "p-3 sm:p-4 bg-white rounded-2xl select-none w-fit mx-auto",
        /* CSS Variables for react-day-picker v10 */
        "[&_.rdp-root]:[--rdp-accent-color:#00AA13] [&_.rdp-root]:[--rdp-accent-background-color:#E6F7E9]",
        "[&_.rdp-root]:[--rdp-day-height:36px] sm:[&_.rdp-root]:[--rdp-day-height:40px]",
        "[&_.rdp-root]:[--rdp-day-width:36px] sm:[&_.rdp-root]:[--rdp-day-width:40px]",
        "[&_.rdp-root]:[--rdp-day_button-height:34px] sm:[&_.rdp-root]:[--rdp-day_button-height:36px]",
        "[&_.rdp-root]:[--rdp-day_button-width:34px] sm:[&_.rdp-root]:[--rdp-day_button-width:36px]",
        "[&_.rdp-root]:[--rdp-day_button-border-radius:10px]",
        /* Header & Month Caption */
        "[&_.rdp-month_caption]:flex [&_.rdp-month_caption]:items-center [&_.rdp-month_caption]:justify-between [&_.rdp-month_caption]:mb-3 [&_.rdp-month_caption]:h-auto",
        "[&_.rdp-dropdowns]:flex [&_.rdp-dropdowns]:items-center [&_.rdp-dropdowns]:gap-1.5",
        /* Nav Buttons */
        "[&_.rdp-nav]:flex [&_.rdp-nav]:items-center [&_.rdp-nav]:gap-1",
        "[&_.rdp-button_next]:w-8 [&_.rdp-button_next]:h-8 [&_.rdp-button_next]:rounded-lg [&_.rdp-button_next]:flex [&_.rdp-button_next]:items-center [&_.rdp-button_next]:justify-center [&_.rdp-button_next]:text-gray-500 [&_.rdp-button_next]:hover:bg-gray-100 [&_.rdp-button_next]:hover:text-gray-900 [&_.rdp-button_next]:transition-all [&_.rdp-button_next]:cursor-pointer [&_.rdp-button_next]:border-none [&_.rdp-button_next]:outline-none",
        "[&_.rdp-button_previous]:w-8 [&_.rdp-button_previous]:h-8 [&_.rdp-button_previous]:rounded-lg [&_.rdp-button_previous]:flex [&_.rdp-button_previous]:items-center [&_.rdp-button_previous]:justify-center [&_.rdp-button_previous]:text-gray-500 [&_.rdp-button_previous]:hover:bg-gray-100 [&_.rdp-button_previous]:hover:text-gray-900 [&_.rdp-button_previous]:transition-all [&_.rdp-button_previous]:cursor-pointer [&_.rdp-button_previous]:border-none [&_.rdp-button_previous]:outline-none",
        /* Grid Table & Days */
        "[&_.rdp-month_grid]:border-collapse [&_.rdp-month_grid]:w-full",
        "[&_.rdp-weekday]:text-[11px] [&_.rdp-weekday]:font-bold [&_.rdp-weekday]:text-gray-400 [&_.rdp-weekday]:py-1.5 [&_.rdp-weekday]:uppercase [&_.rdp-weekday]:tracking-wider [&_.rdp-weekday]:text-center",
        "[&_.rdp-day]:text-center [&_.rdp-day]:p-0",
        "[&_.rdp-day_button]:font-medium [&_.rdp-day_button]:text-xs [&_.rdp-day_button]:transition-all [&_.rdp-day_button]:cursor-pointer [&_.rdp-day_button:hover]:bg-green-50 [&_.rdp-day_button:hover]:text-[#00AA13]",
        "[&_.rdp-day_button[aria-selected='true']]:bg-[#00AA13] [&_.rdp-day_button[aria-selected='true']]:text-white [&_.rdp-day_button[aria-selected='true']]:font-bold [&_.rdp-day_button[aria-selected='true']]:shadow-md [&_.rdp-day_button[aria-selected='true']]:shadow-[#00AA13]/30",
        "[&_.rdp-today:not([aria-selected='true'])_.rdp-day_button]:text-[#00AA13] [&_.rdp-today:not([aria-selected='true'])_.rdp-day_button]:font-bold [&_.rdp-today:not([aria-selected='true'])_.rdp-day_button]:bg-green-50 [&_.rdp-today:not([aria-selected='true'])_.rdp-day_button]:border [&_.rdp-today:not([aria-selected='true'])_.rdp-day_button]:border-green-200",
        "[&_.rdp-outside_.rdp-day_button]:text-gray-300 [&_.rdp-outside_.rdp-day_button:hover]:text-gray-400",
        className
      )}
    >
      <DayPicker
        showOutsideDays={showOutsideDays}
        components={{
          Dropdown: CustomDropdown,
          ...components,
        }}
        {...props}
      />
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
