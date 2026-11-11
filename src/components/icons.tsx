/**
 * The site's single icon set, built on Phosphor (https://phosphoricons.com).
 *
 * Icons keep the names the code already used (from Lucide), so pages import
 * them from here without other changes. Content icons use Phosphor's
 * two-tone "duotone" weight for a distinctive, clean look; interface glyphs
 * (arrows, close, check, editor controls) stay "regular" so they read crisply
 * at small sizes. Pass `weight` to override per use.
 *
 * Uses the SSR build, which works in both server and client components.
 */
import type { ComponentType, CSSProperties, MouseEventHandler } from 'react';
import * as Ph from '@phosphor-icons/react/ssr';

type Weight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

export type IconProps = {
  size?: number | string;
  color?: string;
  weight?: Weight;
  className?: string;
  style?: CSSProperties;
  /** Lucide prop: a solid fill renders Phosphor's "fill" weight. */
  fill?: string;
  /** Lucide prop, ignored: Phosphor controls stroke through `weight`. */
  strokeWidth?: number | string;
  onClick?: MouseEventHandler<SVGSVGElement>;
  'aria-hidden'?: boolean | 'true' | 'false';
  'aria-label'?: string;
};

/** Kept so existing `LucideIcon` type annotations keep compiling. */
export type LucideIcon = ComponentType<IconProps>;

function icon(Base: ComponentType<Record<string, unknown>>, defaultWeight: Weight): LucideIcon {
  function Icon({ size = 24, weight, fill, strokeWidth, ...rest }: IconProps) {
    void strokeWidth;
    const solid = fill && fill !== 'none' && fill !== 'transparent';
    return <Base size={size} weight={weight ?? (solid ? 'fill' : defaultWeight)} {...rest} />;
  }
  Icon.displayName = 'Icon';
  return Icon;
}

const ui = (Base: unknown) => icon(Base as ComponentType<Record<string, unknown>>, 'regular');
const duo = (Base: unknown) => icon(Base as ComponentType<Record<string, unknown>>, 'duotone');

// Interface glyphs
export const ArrowDown = ui(Ph.ArrowDown);
export const ArrowLeft = ui(Ph.ArrowLeft);
export const ArrowRight = ui(Ph.ArrowRight);
export const ArrowUpRight = ui(Ph.ArrowUpRight);
export const Check = ui(Ph.Check);
export const ChevronDown = ui(Ph.CaretDown);
export const ChevronLeft = ui(Ph.CaretLeft);
export const ChevronRight = ui(Ph.CaretRight);
export const Copy = ui(Ph.Copy);
export const Download = ui(Ph.DownloadSimple);
export const Edit = ui(Ph.PencilSimpleLine);
export const Edit2 = ui(Ph.PencilSimple);
export const ExternalLink = ui(Ph.ArrowSquareOut);
export const Filter = ui(Ph.Funnel);
export const Hash = ui(Ph.Hash);
export const Link = ui(Ph.Link);
export const Link2 = ui(Ph.LinkSimple);
export const Loader2 = ui(Ph.CircleNotch);
export const LogOut = ui(Ph.SignOut);
export const Menu = ui(Ph.List);
export const MoreVertical = ui(Ph.DotsThreeVertical);
export const Plus = ui(Ph.Plus);
export const Redo = ui(Ph.ArrowClockwise);
export const Repeat = ui(Ph.Repeat);
export const Search = ui(Ph.MagnifyingGlass);
export const Undo = ui(Ph.ArrowCounterClockwise);
export const Upload = ui(Ph.UploadSimple);
export const X = ui(Ph.X);
// Editor toolbar
export const AlignLeft = ui(Ph.TextAlignLeft);
export const Bold = ui(Ph.TextB);
export const Heading1 = ui(Ph.TextHOne);
export const Heading2 = ui(Ph.TextHTwo);
export const Heading3 = ui(Ph.TextHThree);
export const Italic = ui(Ph.TextItalic);
export const List = ui(Ph.ListBullets);
export const ListOrdered = ui(Ph.ListNumbers);
export const Strikethrough = ui(Ph.TextStrikethrough);

// Content icons
export const AlertCircle = duo(Ph.WarningCircle);
export const AlertTriangle = duo(Ph.Warning);
export const Award = duo(Ph.Medal);
export const Ban = duo(Ph.Prohibit);
export const Battery = duo(Ph.BatteryHigh);
export const BookOpen = duo(Ph.BookOpen);
export const Bot = duo(Ph.Robot);
export const Brain = duo(Ph.Brain);
export const BrainCircuit = duo(Ph.Circuitry);
export const Briefcase = duo(Ph.Briefcase);
export const Bug = duo(Ph.Bug);
export const Building = duo(Ph.Building);
export const Building2 = duo(Ph.Buildings);
export const Calendar = duo(Ph.CalendarBlank);
export const CheckCircle = duo(Ph.CheckCircle);
export const CheckCircle2 = duo(Ph.CheckCircle);
export const CheckSquare = duo(Ph.CheckSquare);
export const Clock = duo(Ph.Clock);
export const Cloud = duo(Ph.Cloud);
export const Code = duo(Ph.Code);
export const Code2 = duo(Ph.CodeBlock);
export const Coins = duo(Ph.Coins);
export const Cpu = duo(Ph.Cpu);
export const CreditCard = duo(Ph.CreditCard);
export const Crosshair = duo(Ph.Crosshair);
export const Crown = duo(Ph.Crown);
export const Database = duo(Ph.Database);
export const DollarSign = duo(Ph.CurrencyDollar);
export const Eye = duo(Ph.Eye);
export const File = duo(Ph.File);
export const FileCode2 = duo(Ph.FileCode);
export const FileSearch = duo(Ph.FileMagnifyingGlass);
export const FileText = duo(Ph.FileText);
export const Fingerprint = duo(Ph.Fingerprint);
export const Flag = duo(Ph.Flag);
export const Flame = duo(Ph.Flame);
export const FlaskConical = duo(Ph.Flask);
export const Folder = duo(Ph.Folder);
export const GitBranch = duo(Ph.GitBranch);
export const Globe = duo(Ph.Globe);
export const GraduationCap = duo(Ph.GraduationCap);
export const HardDrive = duo(Ph.HardDrive);
export const Heart = duo(Ph.Heart);
export const Image = duo(Ph.Image);
export const Info = duo(Ph.Info);
export const Key = duo(Ph.Key);
export const Laptop = duo(Ph.Laptop);
export const Layers = duo(Ph.Stack);
export const Layout = duo(Ph.Layout);
export const LayoutDashboard = duo(Ph.SquaresFour);
export const LayoutGrid = duo(Ph.GridFour);
export const LayoutTemplate = duo(Ph.Layout);
export const Lock = duo(Ph.Lock);
export const Mail = duo(Ph.Envelope);
export const Map = duo(Ph.MapTrifold);
export const MapPin = duo(Ph.MapPin);
export const MessageCircle = duo(Ph.ChatCircle);
export const MessageSquare = duo(Ph.ChatText);
export const Microscope = duo(Ph.Microscope);
export const Monitor = duo(Ph.Monitor);
export const Network = duo(Ph.Network);
export const Newspaper = duo(Ph.Newspaper);
export const PenTool = duo(Ph.PenNib);
export const Phone = duo(Ph.Phone);
export const PlusCircle = duo(Ph.PlusCircle);
export const Printer = duo(Ph.Printer);
export const QrCode = duo(Ph.QrCode);
export const Quote = duo(Ph.Quotes);
export const Rocket = duo(Ph.RocketLaunch);
export const Save = duo(Ph.FloppyDisk);
export const Scale = duo(Ph.Scales);
export const Send = duo(Ph.PaperPlaneTilt);
export const Server = duo(Ph.HardDrives);
export const Settings = duo(Ph.Gear);
export const Share2 = duo(Ph.ShareNetwork);
export const Shield = duo(Ph.Shield);
export const ShieldAlert = duo(Ph.ShieldWarning);
export const ShieldCheck = duo(Ph.ShieldCheck);
export const Skull = duo(Ph.Skull);
export const Smartphone = duo(Ph.DeviceMobile);
export const Sparkles = duo(Ph.Sparkle);
export const Star = duo(Ph.Star);
export const Tag = duo(Ph.Tag);
export const Target = duo(Ph.Target);
export const Terminal = duo(Ph.TerminalWindow);
export const ThumbsDown = duo(Ph.ThumbsDown);
export const ThumbsUp = duo(Ph.ThumbsUp);
export const Trash2 = duo(Ph.Trash);
export const TrendingUp = duo(Ph.TrendUp);
export const UploadCloud = duo(Ph.CloudArrowUp);
export const User = duo(Ph.User);
export const UserCircle = duo(Ph.UserCircle);
export const UserPlus = duo(Ph.UserPlus);
export const Users = duo(Ph.Users);
export const Workflow = duo(Ph.FlowArrow);
export const XCircle = duo(Ph.XCircle);
export const Zap = duo(Ph.Lightning);

// Additional icons for replacing emoji and Font Awesome
export const ChatCircleText = duo(Ph.ChatCircleText);
export const Certificate = duo(Ph.Certificate);
export const Compass = duo(Ph.Compass);
export const Cookie = duo(Ph.Cookie);
export const Handshake = duo(Ph.Handshake);
export const Lightbulb = duo(Ph.Lightbulb);
export const Minus = ui(Ph.Minus);
export const Question = duo(Ph.Question);
export const SealCheck = duo(Ph.SealCheck);
export const Student = duo(Ph.Student);
export const Trophy = duo(Ph.Trophy);
export const Virus = duo(Ph.Virus);
export const FilePdf = duo(Ph.FilePdf);
export const Money = duo(Ph.Money);
export const Books = duo(Ph.Books);
export const Confetti = duo(Ph.Confetti);
export const IdentificationBadge = duo(Ph.IdentificationBadge);
export const Detective = duo(Ph.Detective);
// Brand logos
export const WhatsappLogo = duo(Ph.WhatsappLogo);
export const XLogo = duo(Ph.XLogo);
export const ThreadsLogo = duo(Ph.ThreadsLogo);
export const LinkedinLogo = duo(Ph.LinkedinLogo);
export const YoutubeLogo = duo(Ph.YoutubeLogo);
export const TiktokLogo = duo(Ph.TiktokLogo);
export const InstagramLogo = duo(Ph.InstagramLogo);
export const FacebookLogo = duo(Ph.FacebookLogo);
