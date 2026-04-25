import {
  LucideProps,
  Home,
  Upload,
  FileSearch,
  Bell,
  BarChart2,
  LogOut,
  User,
  PanelLeft,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  File as FileIcon,
  Download,
  Calendar as CalendarIcon,
  ChevronDown,
  MoreHorizontal,
  FileText,
  FileX,
  Send,
  Check,
  X,
  ChevronsUpDown,
  FilePlus2,
  Loader2,
  FileCheck2,
  Paperclip,
  Trash2,
  Settings,
  FolderSearch,
  GripVertical,
  ZoomIn,
  ZoomOut,
  Maximize,
  Folder,
  FolderOpen
} from 'lucide-react';

export const Icons = {
  logo: (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m14 9-3 3 3 3" />
      <path d="M10.5 12H20" />
      <path d="M4.2 4.2a8.5 8.5 0 1 0 11.3 11.3" />
    </svg>
  ),
  home: Home,
  upload: Upload,
  review: FileSearch,
  notifications: Bell,
  reports: BarChart2,
  logout: LogOut,
  user: User,
  menu: PanelLeft,
  search: Search,
  pass: CheckCircle2,
  fail: XCircle,
  manualReview: AlertTriangle,
  pending: Clock,
  approved: FileCheck2,
  rejected: FileX,
  arrowRight: ArrowRight,
  file: FileIcon,
  download: Download,
  calendar: CalendarIcon,
  chevronDown: ChevronDown,
  more: MoreHorizontal,
  sent: Send,
  draft: FileText,
  check: Check,
  close: X,
  chevronsUpDown: ChevronsUpDown,
  addFile: FilePlus2,
  spinner: Loader2,
  attachment: Paperclip,
  delete: Trash2,
  settings: Settings,
  folderScan: FolderSearch,
  reorder: GripVertical,
  zoomIn: ZoomIn,
  zoomOut: ZoomOut,
  maximize: Maximize,
  folder: Folder,
  folderOpen: FolderOpen,
};
