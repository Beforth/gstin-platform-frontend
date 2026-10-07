import * as React from 'react';
import { cn } from '@/lib/utils';

type Shape =
  | ['path', string]
  | ['circle', number, number, number]
  | ['rect', number, number, number, number, number];

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref'> {
  /** Stroke width on the 24px grid. */
  weight?: number;
  /** Off by default, so a plain icon is fully static. Set it to redraw the strokes when the icon (or a `group` parent) is hovered. */
  draw?: boolean;
  /** Milliseconds each stroke takes to draw. Only used with `draw`. */
  speed?: number;
}

function make(name: string, shapes: Shape[]) {
  const Icon = ({ weight = 1.75, draw, speed = 900, className, style, ...props }: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={props['aria-label'] ? undefined : true}
      className={cn('size-4 shrink-0', draw && 'icon-draw', className)}
      style={draw ? ({ '--icon-ms': `${speed}ms`, ...style } as React.CSSProperties) : style}
      {...props}
    >
      {shapes.map((s, i) => {
        const st = { '--i': i } as React.CSSProperties;
        return s[0] === 'path' ? <path key={i} d={s[1]} pathLength={1} style={st} />
          : s[0] === 'circle' ? <circle key={i} cx={s[1]} cy={s[2]} r={s[3]} pathLength={1} style={st} />
          : <rect key={i} x={s[1]} y={s[2]} width={s[3]} height={s[4]} rx={s[5]} pathLength={1} style={st} />;
      })}
    </svg>
  );
  Icon.displayName = name;
  return Icon;
}

const p = (d: string): Shape => ['path', d];

export const BefMark = make('BefMark', [p('M8 4v16h6a4 4 0 0 0 0-8H8h5a4 4 0 0 0 0-8H8')]);
export const SearchIcon = make('SearchIcon', [['circle', 11, 11, 6], p('M20 20l-4.5-4.5')]);
export const CopyIcon = make('CopyIcon', [['rect', 9, 9, 11, 11, 2.5], p('M15 5H6.5A1.5 1.5 0 0 0 5 6.5V15')]);
export const CheckIcon = make('CheckIcon', [p('M5 12.5l4.5 4.5L19 7.5')]);
export const XIcon = make('XIcon', [p('M6 6l12 12M18 6L6 18')]);
export const PlusIcon = make('PlusIcon', [p('M12 5v14M5 12h14')]);
export const MenuIcon = make('MenuIcon', [p('M4 7h16M4 12h10M4 17h16')]);
export const ArrowRightIcon = make('ArrowRightIcon', [p('M5 12h14M13 6l6 6-6 6')]);
export const ChevronRightIcon = make('ChevronRightIcon', [p('M9 6l6 6-6 6')]);
export const SunIcon = make('SunIcon', [['circle', 12, 12, 4], p('M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4')]);
export const MoonIcon = make('MoonIcon', [p('M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z')]);
export const SparkleIcon = make('SparkleIcon', [p('M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z'), p('M19 17v4M17 19h4')]);
export const ZapIcon = make('ZapIcon', [p('M13 3L5 13.5h6L10 21l9-11h-6z')]);
export const ComponentsIcon = make('ComponentsIcon', [['rect', 4, 4, 7, 7, 2], ['rect', 13, 4, 7, 7, 2], ['rect', 4, 13, 7, 7, 2], ['circle', 16.5, 16.5, 3.5]]);
export const BlocksIcon = make('BlocksIcon', [['rect', 3, 4, 18, 6, 2], ['rect', 3, 14, 8, 6, 2], ['rect', 14, 14, 7, 6, 2]]);
export const LayersIcon = make('LayersIcon', [p('M12 3l9 5-9 5-9-5z'), p('M3 13l9 5 9-5')]);
export const PackageIcon = make('PackageIcon', [p('M12 3l8 4.5v9L12 21l-8-4.5v-9z'), p('M4 7.5l8 4.5 8-4.5M12 12v9')]);
export const PaletteIcon = make('PaletteIcon', [p('M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2.2-.5-1.2.3-2.3 1.7-2.3H17a4 4 0 0 0 4-4 9 9 0 0 0-9-9z'), ['circle', 7.5, 11, 0.6], ['circle', 10, 7, 0.6], ['circle', 15, 7, 0.6]]);
export const BookIcon = make('BookIcon', [p('M5 5.5A1.5 1.5 0 0 1 6.5 4H19v13H6.5A1.5 1.5 0 0 0 5 18.5z'), p('M5 18.5A1.5 1.5 0 0 0 6.5 20H19v-3')]);
export const CommandKeyIcon = make('CommandKeyIcon', [p('M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z')]);
export const MonitorIcon = make('MonitorIcon', [['rect', 3, 4, 18, 12, 2], p('M9 20h6M12 16v4')]);
export const TabletIcon = make('TabletIcon', [['rect', 5, 3, 14, 18, 2.5], p('M11 18h2')]);
export const PhoneIcon = make('PhoneIcon', [['rect', 7, 3, 10, 18, 2.5], p('M11 18h2')]);
export const UploadIcon = make('UploadIcon', [p('M12 16V4M7 9l5-5 5 5'), p('M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3')]);

// Arrows and chevrons
export const ChevronLeftIcon = make('ChevronLeftIcon', [p('M15 6l-6 6 6 6')]);
export const ChevronDownIcon = make('ChevronDownIcon', [p('M6 9l6 6 6-6')]);
export const ChevronUpIcon = make('ChevronUpIcon', [p('M6 15l6-6 6 6')]);
export const ArrowLeftIcon = make('ArrowLeftIcon', [p('M19 12H5M11 6l-6 6 6 6')]);
export const ArrowUpIcon = make('ArrowUpIcon', [p('M12 19V5M6 11l6-6 6 6')]);
export const ArrowDownIcon = make('ArrowDownIcon', [p('M12 5v14M6 13l6 6 6-6')]);
export const SortIcon = make('SortIcon', [p('M8 4v16M4 8l4-4 4 4M16 20V4M12 16l4 4 4-4')]);
export const MinusIcon = make('MinusIcon', [p('M5 12h14')]);
export const MoreIcon = make('MoreIcon', [['circle', 5, 12, 1], ['circle', 12, 12, 1], ['circle', 19, 12, 1]]);
export const RefreshIcon = make('RefreshIcon', [p('M20 11a8 8 0 0 0-14-4L4 9M4 4v5h5'), p('M4 13a8 8 0 0 0 14 4l2-2M20 20v-5h-5')]);

// Status
export const InfoIcon = make('InfoIcon', [['circle', 12, 12, 9], p('M12 11v5M12 8v.01')]);
export const AlertIcon = make('AlertIcon', [p('M12 4l9 16H3z'), p('M12 10v4M12 17v.01')]);
export const AlertCircleIcon = make('AlertCircleIcon', [['circle', 12, 12, 9], p('M12 7v6M12 16.5v.01')]);
export const CheckCircleIcon = make('CheckCircleIcon', [['circle', 12, 12, 9], p('M8 12.5l3 3 5-6')]);
export const XCircleIcon = make('XCircleIcon', [['circle', 12, 12, 9], p('M9 9l6 6M15 9l-6 6')]);
export const LoaderIcon = make('LoaderIcon', [p('M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8')]);
export const ShieldIcon = make('ShieldIcon', [p('M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z'), p('M9 12l2 2 4-4')]);

// People and communication
export const UserIcon = make('UserIcon', [['circle', 12, 8, 4], p('M4 20a8 8 0 0 1 16 0')]);
export const UsersIcon = make('UsersIcon', [['circle', 9, 8, 3.5], p('M2.5 19a6.5 6.5 0 0 1 13 0'), ['circle', 17, 9, 2.5], p('M17 14a5 5 0 0 1 4.5 5')]);
export const MailIcon = make('MailIcon', [['rect', 3, 5, 18, 14, 2.5], p('M3.5 7l8.5 6 8.5-6')]);
export const BellIcon = make('BellIcon', [p('M6 17v-6a6 6 0 0 1 12 0v6l1.5 2h-15z'), p('M10 21h4')]);

// Objects
export const CalendarIcon = make('CalendarIcon', [['rect', 3, 5, 18, 16, 2.5], p('M3 10h18M8 3v4M16 3v4')]);
export const ClockIcon = make('ClockIcon', [['circle', 12, 12, 9], p('M12 7v5l3 2')]);
export const HomeIcon = make('HomeIcon', [p('M4 11l8-7 8 7'), p('M6 10v10h12V10M10 20v-5h4v5')]);
export const SettingsIcon = make('SettingsIcon', [p('M4 7h10M18 7h2M4 17h2M10 17h10'), ['circle', 16, 7, 2], ['circle', 8, 17, 2]]);
export const LockIcon = make('LockIcon', [['rect', 5, 11, 14, 9, 2.5], p('M8 11V8a4 4 0 0 1 8 0v3')]);
export const GlobeIcon = make('GlobeIcon', [['circle', 12, 12, 9], p('M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18')]);
export const StarIcon = make('StarIcon', [p('M12 3.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.8l6-.8z')]);
export const HeartIcon = make('HeartIcon', [p('M12 20s-8-4.8-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6.2-8 11-8 11z')]);
export const BookmarkIcon = make('BookmarkIcon', [p('M6 4h12v17l-6-4-6 4z')]);

// Actions
export const EditIcon = make('EditIcon', [p('M4 20l1-4L16 5a2 2 0 0 1 3 3L8 19z'), p('M14 7l3 3')]);
export const TrashIcon = make('TrashIcon', [p('M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5')]);
export const DownloadIcon = make('DownloadIcon', [p('M12 4v12M7 11l5 5 5-5M4 20h16')]);
export const FilterIcon = make('FilterIcon', [p('M4 5h16l-6 8v6l-4-2v-4z')]);
export const EyeIcon = make('EyeIcon', [p('M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z'), ['circle', 12, 12, 3]]);
export const EyeOffIcon = make('EyeOffIcon', [p('M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z'), ['circle', 12, 12, 3], p('M4 4l16 16')]);
export const LinkIcon = make('LinkIcon', [p('M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1'), p('M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1')]);
export const ExternalLinkIcon = make('ExternalLinkIcon', [p('M14 4h6v6M20 4l-9 9'), p('M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5')]);
export const LogOutIcon = make('LogOutIcon', [p('M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3'), p('M16 12H6M9 8l-4 4 4 4')]);
export const ListIcon = make('ListIcon', [p('M9 6h11M9 12h11M9 18h11M4.5 6v.01M4.5 12v.01M4.5 18v.01')]);

// Content and media
export const FileIcon = make('FileIcon', [p('M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z'), p('M14 3v5h5')]);
export const FolderIcon = make('FolderIcon', [p('M3 7a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z')]);
export const ImageIcon = make('ImageIcon', [['rect', 3, 4, 18, 16, 2.5], ['circle', 9, 10, 1.8], p('M4 18l5-5 4 4 3-3 4 4')]);
export const PlayIcon = make('PlayIcon', [p('M8 5l11 7-11 7z')]);
export const PauseIcon = make('PauseIcon', [p('M8 5v14M16 5v14')]);
export const BarChartIcon = make('BarChartIcon', [p('M5 20v-9M12 20V5M19 20v-7')]);
export const TrendingIcon = make('TrendingIcon', [p('M3 17l6-6 4 4 8-8M15 7h6v6')]);
export const CodeIcon = make('CodeIcon', [p('M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16')]);
export const TerminalIcon = make('TerminalIcon', [['rect', 3, 4, 18, 16, 2.5], p('M7 9l3 3-3 3M13 15h4')]);


/** Everything above by name, for galleries and pickers. */
export const icons = {
  BefMark,
  SearchIcon,
  CopyIcon,
  CheckIcon,
  XIcon,
  PlusIcon,
  MenuIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
  SparkleIcon,
  ZapIcon,
  ComponentsIcon,
  BlocksIcon,
  LayersIcon,
  PackageIcon,
  PaletteIcon,
  BookIcon,
  CommandKeyIcon,
  MonitorIcon,
  TabletIcon,
  PhoneIcon,
  UploadIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SortIcon,
  MinusIcon,
  MoreIcon,
  RefreshIcon,
  InfoIcon,
  AlertIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  LoaderIcon,
  ShieldIcon,
  UserIcon,
  UsersIcon,
  MailIcon,
  BellIcon,
  CalendarIcon,
  ClockIcon,
  HomeIcon,
  SettingsIcon,
  LockIcon,
  GlobeIcon,
  StarIcon,
  HeartIcon,
  BookmarkIcon,
  EditIcon,
  TrashIcon,
  DownloadIcon,
  FilterIcon,
  EyeIcon,
  EyeOffIcon,
  LinkIcon,
  ExternalLinkIcon,
  LogOutIcon,
  ListIcon,
  FileIcon,
  FolderIcon,
  ImageIcon,
  PlayIcon,
  PauseIcon,
  BarChartIcon,
  TrendingIcon,
  CodeIcon,
  TerminalIcon,
};
