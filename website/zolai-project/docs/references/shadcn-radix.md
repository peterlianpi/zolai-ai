# shadcn/ui + Radix UI Reference

**shadcn/ui:** 4.1.2 | **Radix UI:** 1.4.3 | **Docs:** https://ui.shadcn.com

## Architecture

shadcn/ui is **not a library** — it's a collection of reusable components built on Radix UI primitives and Tailwind CSS. Components are copied into your project and fully customizable.

## Installation

```bash
# Initialize shadcn
bunx shadcn@latest init

# Add components
bunx shadcn@latest add button
bunx shadcn@latest add dialog
bunx shadcn@latest add table
bunx shadcn@latest add form
bunx shadcn@latest add dropdown-menu
```

## Core Components

### Button
```tsx
import { Button } from "@/components/ui/button";

<Button>Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button disabled>Loading...</Button>
```

### Dialog
```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <button>Open</button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>;
```

### Select
```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>;
```

### Table
```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map((item) => (
      <TableRow key={item.id}>
        <TableCell className="truncate" title={item.name}>{item.name}</TableCell>
        <TableCell>{item.status}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>;
```

### Form (with React Hook Form)
```tsx
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input placeholder="email@example.com" {...field} />
          </FormControl>
          <FormDescription>Enter your email address</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>;
```

### Dropdown Menu
```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

### Toast (Sonner)
```tsx
import { toast } from "sonner";

toast.success("Saved successfully");
toast.error("Something went wrong");
toast.info("Information message");
toast.warning("Warning message");
toast.loading("Loading...");

toast.promise(saveData(data), {
  loading: "Saving...",
  success: "Saved successfully",
  error: "Failed to save",
});
```

### Card
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>;
```

### Badge
```tsx
import { Badge } from "@/components/ui/badge";

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

### Skeleton
```tsx
import { Skeleton } from "@/components/ui/skeleton";

<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-20 w-full rounded-md" />
```

### Command (Search/Command Palette)
```tsx
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
  CommandSeparator,
} from "@/components/ui/command";

<Command>
  <CommandInput placeholder="Search..." />
  <CommandList>
    <CommandEmpty>No results found</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>Calendar</CommandItem>
      <CommandItem>Search</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>;
```

### Tabs
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account settings</TabsContent>
  <TabsContent value="password">Change password</TabsContent>
</Tabs>;
```

### Checkbox
```tsx
import { Checkbox } from "@/components/ui/checkbox";

<Checkbox checked={checked} onCheckedChange={setChecked} />
```

### Input
```tsx
import { Input } from "@/components/ui/input";

<Input type="text" placeholder="Enter text" />
<Input type="email" placeholder="Enter email" />
<Input type="password" placeholder="Enter password" />
<Input type="file" accept="image/*" />
```

### Textarea
```tsx
import { Textarea } from "@/components/ui/textarea";

<Textarea placeholder="Enter text" className="min-h-20" />
```

## Radix UI Primitives

shadcn components are built on these Radix primitives:

| shadcn Component | Radix Primitive |
|-----------------|-----------------|
| Dialog | `@radix-ui/react-dialog` |
| Select | `@radix-ui/react-select` |
| DropdownMenu | `@radix-ui/react-dropdown-menu` |
| Tabs | `@radix-ui/react-tabs` |
| Checkbox | `@radix-ui/react-checkbox` |
| Switch | `@radix-ui/react-switch` |
| Slider | `@radix-ui/react-slider` |
| Tooltip | `@radix-ui/react-tooltip` |
| Popover | `@radix-ui/react-popover` |
| Accordion | `@radix-ui/react-accordion` |
| Avatar | `@radix-ui/react-avatar` |
| Toast | `@radix-ui/react-toast` |
| NavigationMenu | `@radix-ui/react-navigation-menu` |
| ContextMenu | `@radix-ui/react-context-menu` |
| AlertDialog | `@radix-ui/react-alert-dialog` |
| HoverCard | `@radix-ui/react-hover-card` |
| ScrollArea | `@radix-ui/react-scroll-area` |
| Collapsible | `@radix-ui/react-collapsible` |
| Menubar | `@radix-ui/react-menubar` |
| Toggle | `@radix-ui/react-toggle` |
| ToggleGroup | `@radix-ui/react-toggle-group` |
| Progress | `@radix-ui/react-progress` |
| Separator | `@radix-ui/react-separator` |
| AspectRatio | `@radix-ui/react-aspect-ratio` |

## Best Practices

1. **Don't modify shadcn components** in `components/ui/` — customize via props or wrapper
2. **Use `cn()` utility** — merge Tailwind classes properly
3. **`asChild` prop** — for custom trigger elements
4. **Accessibility** — Radix handles ARIA attributes automatically
5. **Controlled vs uncontrolled** — use `value`/`onValueChange` for controlled
6. **Form integration** — use `FormField` with React Hook Form
7. **Responsive design** — all components are mobile-friendly
8. **Dark mode** — components respect theme via CSS variables
9. **Truncate long text** — use `truncate` + `title` for tooltips
10. **Loading states** — use `Skeleton` for async content
