# shadcn/ui Reference

**shadcn/ui:** 4.1.2 | **Radix UI:** 1.4.3 | **Docs:** https://ui.shadcn.com

## Architecture

shadcn/ui is **not a library** — it's a collection of reusable components built on Radix UI primitives and Tailwind CSS. Components are copied into `components/ui/` and fully customizable.

**This project uses the shadcn v4 CLI** with Radix 1.4.3 primitives, plus additional custom components.

## Installation

```bash
# Initialize shadcn (already done)
bunx shadcn@latest init

# Add components
bunx shadcn@latest add button
bunx shadcn@latest add dialog
bunx shadcn@latest add table
bunx shadcn@latest add form
bunx shadcn@latest add dropdown-menu
bunx shadcn@latest add sidebar
```

## Project Component Inventory

### Core UI Components (in `components/ui/`)

| Component | File | Radix Primitive | Purpose |
|-----------|------|-----------------|---------|
| Accordion | `accordion.tsx` | `@radix-ui/react-accordion` | Collapsible content sections |
| Alert | `alert.tsx` | — | Alert/notification banners |
| Alert Dialog | `alert-dialog.tsx` | `@radix-ui/react-alert-dialog` | Confirmation dialogs |
| Aspect Ratio | `aspect-ratio.tsx` | `@radix-ui/react-aspect-ratio` | Maintain aspect ratios |
| Avatar | `avatar.tsx` | `@radix-ui/react-avatar` | User avatars with fallback |
| Badge | `badge.tsx` | — | Status/label badges |
| Breadcrumb | `breadcrumb.tsx` | — | Navigation breadcrumbs |
| Button | `button.tsx` | — | Primary action buttons |
| Button Group | `button-group.tsx` | — | Grouped button sets |
| Calendar | `calendar.tsx` | `@radix-ui/react-popover` + react-day-picker | Date picker calendar |
| Card | `card.tsx` | — | Card containers |
| Carousel | `carousel.tsx` | Embla Carousel | Image/content carousels |
| Checkbox | `checkbox.tsx` | `@radix-ui/react-checkbox` | Checkbox inputs |
| Collapsible | `collapsible.tsx` | `@radix-ui/react-collapsible` | Toggle visibility sections |
| Combobox | `combobox.tsx` | `@base-ui/react` | Searchable select dropdown |
| Command | `command.tsx` | `cmdk` | Command palette/search |
| Context Menu | `context-menu.tsx` | `@radix-ui/react-context-menu` | Right-click menus |
| Date Picker | `date-picker.tsx` | Calendar + Popover | Full date picker with input |
| Dialog | `dialog.tsx` | `@radix-ui/react-dialog` | Modal dialogs |
| Direction | `direction.tsx` | — | RTL/LTR direction wrapper |
| Drawer | `drawer.tsx` | `vaul` | Bottom sheet drawer |
| Dropdown Menu | `dropdown-menu.tsx` | `@radix-ui/react-dropdown-menu` | Dropdown menus |
| Empty | `empty.tsx` | — | Empty state placeholder |
| Fallback Image | `fallback-image.tsx` | — | Image with error fallback |
| Field | `field.tsx` | — | Form field wrapper |
| Form | `form.tsx` | `@radix-ui/react-label` | React Hook Form integration |
| Hover Card | `hover-card.tsx` | `@radix-ui/react-hover-card` | Hover-triggered cards |
| Input | `input.tsx` | — | Text input fields |
| Input Group | `input-group.tsx` | — | Input with addons/buttons |
| Input OTP | `input-otp.tsx` | `input-otp` | One-time password input |
| Item | `item.tsx` | — | List item component |
| Kbd | `kbd.tsx` | — | Keyboard shortcut display |
| Label | `label.tsx` | `@radix-ui/react-label` | Form labels |
| Menubar | `menubar.tsx` | `@radix-ui/react-menubar` | Application menu bar |
| Navigation Menu | `navigation-menu.tsx` | `@radix-ui/react-navigation-menu` | Top navigation menus |
| Native Select | `native-select.tsx` | — | Native browser select |
| Pagination | `pagination.tsx` | — | Pagination controls |
| Popover | `popover.tsx` | `@radix-ui/react-popover` | Popover overlays |
| Progress | `progress.tsx` | `@radix-ui/react-progress` | Progress indicators |
| Radio Group | `radio-group.tsx` | `@radix-ui/react-radio-group` | Radio button groups |
| Range Picker | `range-picker.tsx` | — | Date range selection |
| Resizable | `resizable.tsx` | — | Resizable panels |
| Scroll Area | `scroll-area.tsx` | `@radix-ui/react-scroll-area` | Custom scrollbars |
| Select | `select.tsx` | `@radix-ui/react-select` | Select dropdowns |
| Separator | `separator.tsx` | `@radix-ui/react-separator` | Visual dividers |
| Sheet | `sheet.tsx` | `@radix-ui/react-dialog` | Side panel sheets |
| Sidebar | `sidebar.tsx` | — | App sidebar navigation |
| Skeleton | `skeleton.tsx` | — | Loading placeholders |
| Slider | `slider.tsx` | `@radix-ui/react-slider` | Range sliders |
| Sonner | `sonner.tsx` | — | Toast notifications |
| Spinner | `spinner.tsx` | — | Loading spinners |
| Switch | `switch.tsx` | `@radix-ui/react-switch` | Toggle switches |
| Table | `table.tsx` | — | Data tables |
| Tabs | `tabs.tsx` | `@radix-ui/react-tabs` | Tab navigation |
| Textarea | `textarea.tsx` | — | Multi-line text inputs |
| Toggle | `toggle.tsx` | `@radix-ui/react-toggle` | Toggle buttons |
| Toggle Group | `toggle-group.tsx` | `@radix-ui/react-toggle-group` | Toggle button groups |
| Tooltip | `tooltip.tsx` | `@radix-ui/react-tooltip` | Hover tooltips |
| Chart | `chart.tsx` | Recharts | Data visualization charts |

### Custom Components (project-specific)

| Component | File | Purpose |
|-----------|------|---------|
| InfiniteTable | `features/admin/components/infinite-table.tsx` | Infinite scroll table with TanStack Query |
| MediaBrowser | `features/content/components/media-browser.tsx` | Media selection with upload |
| UploadZone | `features/media/components/upload-zone.tsx` | Drag-and-drop file upload |
| ContentEditor | `features/content/components/content-editor.tsx` | Unified content form |

## Component Usage

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
    <Button>Open</Button>
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

### Sidebar
```tsx
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar";

<SidebarProvider>
  <Sidebar>
    <SidebarHeader>
      {/* Logo/brand */}
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      {/* User info */}
    </SidebarFooter>
  </Sidebar>
  <SidebarInset>
    <SidebarTrigger />
    {/* Page content */}
  </SidebarInset>
</SidebarProvider>;
```

### Combobox (Searchable Select)
```tsx
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxTrigger,
  ComboboxValue,
  ComboboxList,
  ComboboxGroup,
  ComboboxLabel,
} from "@/components/ui/combobox";

<Combobox value={value} onValueChange={setValue}>
  <ComboboxTrigger>
    <ComboboxValue placeholder="Select..." />
  </ComboboxTrigger>
  <ComboboxContent>
    <ComboboxInput placeholder="Search..." />
    <ComboboxList>
      <ComboboxEmpty>No results</ComboboxEmpty>
      <ComboboxItem value="option1">Option 1</ComboboxItem>
      <ComboboxItem value="option2">Option 2</ComboboxItem>
    </ComboboxList>
  </ComboboxContent>
</Combobox>;
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
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
    <Button type="submit" disabled={form.formState.isSubmitting}>
      {form.formState.isSubmitting ? "Saving..." : "Save"}
    </Button>
  </form>
</Form>;
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
  TableCaption,
  TableFooter,
} from "@/components/ui/table";

<Table>
  <TableCaption>List of items</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map((item) => (
      <TableRow key={item.id}>
        <TableCell className="truncate" title={item.name}>{item.name}</TableCell>
        <TableCell>{item.status}</TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="sm">Edit</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>;
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
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuGroup>
      <DropdownMenuItem>
        Profile
        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem>Settings</DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      Logout
      <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

### Alert Dialog
```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>;
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    {/* Footer actions */}
  </CardFooter>
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

<div className="space-y-3">
  <Skeleton className="h-4 w-[250px]" />
  <Skeleton className="h-4 w-[200px]" />
  <Skeleton className="h-20 w-full rounded-md" />
</div>;
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

### Sheet (Side Panel)
```tsx
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";

<Sheet>
  <SheetTrigger asChild>
    <Button>Open</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Title</SheetTitle>
      <SheetDescription>Description</SheetDescription>
    </SheetHeader>
    {/* Content */}
  </SheetContent>
</Sheet>;
```

### Drawer (Bottom Sheet)
```tsx
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

<Drawer>
  <DrawerTrigger asChild>
    <Button>Open</Button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Title</DrawerTitle>
      <DrawerDescription>Description</DrawerDescription>
    </DrawerHeader>
    {/* Content */}
    <DrawerFooter>
      <Button>Submit</Button>
      <DrawerClose asChild>
        <Button variant="outline">Cancel</Button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>;
```

### Input OTP
```tsx
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

<InputOTP maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>;
```

### Resizable Panels
```tsx
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

<ResizablePanelGroup direction="horizontal">
  <ResizablePanel defaultSize={25}>
    {/* Sidebar content */}
  </ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel defaultSize={75}>
    {/* Main content */}
  </ResizablePanel>
</ResizablePanelGroup>;
```

### Carousel
```tsx
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

<Carousel>
  <CarouselContent>
    {items.map((item) => (
      <CarouselItem key={item.id}>
        {/* Item content */}
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>;
```

### Chart (Recharts)
```tsx
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const chartConfig = {
  desktop: { label: "Desktop", color: "hsl(var(--chart-1))" },
  mobile: { label: "Mobile", color: "hsl(var(--chart-2))" },
};

<ChartContainer config={chartConfig}>
  <BarChart data={data}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" />
    <YAxis />
    <ChartTooltip content={<ChartTooltipContent />} />
    <ChartLegend content={<ChartLegendContent />} />
    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
    <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
  </BarChart>
</ChartContainer>;
```

### Breadcrumb
```tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Components</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>;
```

### Progress
```tsx
import { Progress } from "@/components/ui/progress";

<Progress value={66} />
```

### Switch
```tsx
import { Switch } from "@/components/ui/switch";

<Switch checked={enabled} onCheckedChange={setEnabled} />
```

### Tooltip
```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button>Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Tooltip content</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>;
```

## Best Practices

1. **Don't modify shadcn components** in `components/ui/` — customize via props or wrapper
2. **Use `cn()` utility** — merge Tailwind classes properly with `tailwind-merge`
3. **`asChild` prop** — for custom trigger elements (renders your element instead of default)
4. **Accessibility** — Radix handles ARIA attributes automatically, don't override
5. **Controlled vs uncontrolled** — use `value`/`onValueChange` for controlled state
6. **Form integration** — use `FormField` with React Hook Form's `control`
7. **Responsive design** — all components are mobile-friendly by default
8. **Dark mode** — components respect theme via CSS variables in `@theme`
9. **Truncate long text** — use `truncate` + `title` attribute for tooltips
10. **Loading states** — use `Skeleton` for async content, `Spinner` for actions
11. **Sidebar state** — persisted via cookie (`sidebar_state`), 7 day expiry
12. **Chart config** — define `chartConfig` object with labels and CSS variable colors
13. **Don't duplicate** — check `components/ui/` before creating new UI components
14. **Use project components** — `Combobox`, `InfiniteTable`, `MediaBrowser`, `UploadZone`
