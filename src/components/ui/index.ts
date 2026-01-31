// UI Components Export
// This file re-exports all UI components for easier importing

// Basic Components
export { Button, IconButton, ButtonGroup, buttonVariants } from './button';
export { Input, SearchInput, Textarea, Label, FormGroup, inputVariants } from './input';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, StatCard } from './card';
export { Badge, NotificationBadge, StatusBadge, badgeVariants } from './badge';
export { Avatar, AvatarGroup, avatarVariants } from './avatar';

// Form Components
export { Select, NativeSelect, selectVariants, type SelectOption, type SelectProps } from './select';
export { DatePicker, DateRangePicker, datePickerVariants, type DatePickerProps, type DateRange } from './date-picker';
export { TimePicker, TimeRangePicker, timePickerVariants, type TimePickerProps, type TimeRange } from './time-picker';
export { Checkbox, CheckboxGroup, checkboxVariants, type CheckboxProps, type CheckboxGroupOption } from './checkbox';
export { RadioGroup, RadioCardGroup, radioVariants, type RadioOption, type RadioGroupProps } from './radio';
export { Switch, SwitchGroup, switchVariants, type SwitchProps, type SwitchGroupOption } from './switch';
export { FileUpload, type FileWithPreview, type FileUploadProps } from './file-upload';

// Layout Components
export {
    PageTransition,
    FadeIn,
    SlideUp,
    ScaleIn,
    StaggerContainer,
    StaggerItem,
    HoverScale,
    AnimatedList,
    AnimatedListItem
} from './page-transition';
export { Breadcrumb, BreadcrumbWithDropdown, type BreadcrumbItem, type BreadcrumbProps } from './breadcrumb';

// Feedback Components
export { Skeleton, SkeletonCard, SkeletonStatCard, SkeletonTableRow, SkeletonText, SkeletonAvatar } from './skeleton';
export { ToastProvider, useToast, toastSuccess, toastError, toastWarning, toastInfo } from './toast';
export { Tooltip, TooltipProvider, type TooltipProps } from './tooltip';
export { Popover, PopoverHeader, PopoverBody, PopoverFooter, type PopoverProps } from './popover';
export {
    EmptyState,
    EmptySearchResults,
    EmptyData,
    EmptyFiles,
    EmptyMembers,
    EmptySchedule,
    NotFound,
    type EmptyStateProps
} from './empty-state';

// Data Display Components
export { AnimatedCounter, AnimatedPercentage, AnimatedCurrency, CounterWithTrend } from './animated-counter';
export { Progress, CircularProgress, StepsProgress } from './progress';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export { DataTable, type DataTableColumn, type DataTableProps, type SortDirection } from './data-table';

// Overlay Components
export {
    Modal,
    ModalContent,
    ModalHeader,
    ModalTitle,
    ModalDescription,
    ModalBody,
    ModalFooter,
    ConfirmDialog
} from './modal';
export { CommandMenu, useCommandMenu, type CommandItem, type CommandGroup, type CommandMenuProps } from './command-menu';
