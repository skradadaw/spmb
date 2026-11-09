"use client"

import * as React from "react"
import { DayPicker, getDefaultClassNames, type DropdownProps } from "react-day-picker"

import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

const NAV_BUTTON = "flex size-8 cursor-pointer items-center justify-center rounded-lg border-none text-gray-500 outline-none transition-all hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-[#00AA13]/30"

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
  classNames,
  showOutsideDays = true,
  components,
  ...props
}: CalendarProps) {
  // Class ditempel langsung lewat classNames (digabung dengan class bawaan rdp-*), bukan selector
  // arbitrary: Tailwind membaca "_" sebagai spasi, sehingga `[&_.rdp-day_button]` tidak pernah cocok.
  // CSS bawaan react-day-picker diimpor di globals.css dalam layer base agar utility di sini menang.
  const defaults = getDefaultClassNames()
  return (
    <div className={cn("p-3 sm:p-4 bg-white rounded-2xl select-none w-fit mx-auto", className)}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        classNames={{
          root: cn(defaults.root, "[--rdp-accent-color:#00AA13] [--rdp-accent-background-color:#E6F7E9]"),
          month_caption: cn(defaults.month_caption, "mb-3 flex h-auto items-center justify-between"),
          dropdowns: cn(defaults.dropdowns, "flex items-center gap-1.5"),
          nav: cn(defaults.nav, "flex items-center gap-1"),
          button_previous: cn(defaults.button_previous, NAV_BUTTON),
          button_next: cn(defaults.button_next, NAV_BUTTON),
          chevron: cn(defaults.chevron, "fill-current"),
          month_grid: cn(defaults.month_grid, "w-full border-collapse"),
          weekday: cn(defaults.weekday, "py-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-gray-400"),
          day: cn(defaults.day, "size-9 p-0 text-center sm:size-10"),
          day_button: cn(
            defaults.day_button,
            "mx-auto size-[34px] cursor-pointer rounded-[10px] border border-transparent text-xs font-medium transition-all sm:size-9",
            "hover:bg-green-50 hover:text-[#00AA13] disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-inherit"
          ),
          selected: cn(
            defaults.selected,
            "text-xs [&>button]:border-transparent [&>button]:bg-[#00AA13] [&>button]:font-bold [&>button]:text-white [&>button]:shadow-md [&>button]:shadow-[#00AA13]/30",
            "[&>button:hover]:bg-[#00AA13] [&>button:hover]:text-white"
          ),
          today: cn(
            defaults.today,
            "[&:not([aria-selected]):not([data-disabled])>button]:border-green-200 [&:not([aria-selected]):not([data-disabled])>button]:bg-green-50 [&:not([aria-selected]):not([data-disabled])>button]:font-bold [&:not([aria-selected]):not([data-disabled])>button]:text-[#00AA13]"
          ),
          outside: cn(defaults.outside, "[&>button]:text-gray-300 [&>button:hover]:text-gray-400"),
          ...classNames,
        }}
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
