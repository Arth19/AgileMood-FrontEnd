"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface Sprint {
  id: string
  name: string
  startDate: Date
  endDate: Date
}

interface SprintSelectorProps {
  sprints: Sprint[]
  selectedSprint: Sprint | null
  onSprintChange: (sprint: Sprint | null) => void
  className?: string
}

export function SprintSelector({
  sprints,
  selectedSprint,
  onSprintChange,
  className
}: SprintSelectorProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedSprint
            ? `Sprint: ${selectedSprint.name}`
            : "Selecione uma Sprint"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar sprint..." />
          <CommandEmpty>Nenhuma sprint encontrada.</CommandEmpty>
          <CommandGroup>
            <CommandItem
              onSelect={() => {
                onSprintChange(null)
                setOpen(false)
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  !selectedSprint ? "opacity-100" : "opacity-0"
                )}
              />
              Todas as sprints
            </CommandItem>
            {sprints.map((sprint) => (
              <CommandItem
                key={sprint.id}
                onSelect={() => {
                  onSprintChange(sprint)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedSprint?.id === sprint.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {sprint.name} ({sprint.startDate.toLocaleDateString('pt-BR')} - {sprint.endDate.toLocaleDateString('pt-BR')})
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 