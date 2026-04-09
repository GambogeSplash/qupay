// Icon — Lucide-backed wrapper that preserves the Ionicons name-string API.
// Replaces @expo/vector-icons Ionicons across the app for a cleaner, modern look.
// Usage stays identical:  <Icon name="search" size={22} color="#fff" />
import React from 'react';
import {
  Search, Check, CheckCircle2, ChevronDown, ChevronRight, ChevronLeft, ChevronUp, Bird,
  ArrowRight, ArrowLeft, ArrowDown, ArrowUp, ArrowUpRight, ArrowDownLeft,
  AlertCircle, AlertTriangle, X, XCircle, Wallet, Building2, ShieldCheck, Shield,
  QrCode, Send, Bell, BellOff, Lock, Unlock, Info, Zap, Clipboard, MessageCircle,
  CreditCard, Delete, SlidersHorizontal, HelpCircle, LogOut, LogIn, Settings, Settings2,
  Users, User, Gift, Clock, TrendingUp, TrendingDown, DownloadCloud, Download, Upload,
  Share2, Copy, RefreshCw, MoreHorizontal, MoreVertical, Eye, EyeOff, Mail, Globe,
  ArrowRightLeft, Repeat, Phone, Camera, Image as ImageIcon, MapPin, Calendar,
  Filter, Plus, Minus, Edit, Edit2, Edit3, Trash, Trash2, Heart, Star, Bookmark,
  Home, Compass, ListOrdered, Bookmark as BookmarkIcon, Moon, Sun, ThumbsUp,
  Sparkles, Flame, Award, BadgeCheck, BadgeAlert, BadgeInfo, Wifi, WifiOff,
  PlusCircle, MinusCircle, FileText, File, Folder, FolderOpen, Tag, Hash,
  type LucideIcon,
} from 'lucide-react-native';

// Map Ionicons name strings → Lucide components.
// Both `-outline` variants and the bare names resolve to the same Lucide icon
// because Lucide uses a single consistent stroke style.
const ICON_MAP: Record<string, LucideIcon> = {
  // Navigation / chevrons
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'chevron-forward': ChevronRight,
  'chevron-back': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'arrow-forward': ArrowRight,
  'arrow-back': ArrowLeft,
  'arrow-down': ArrowDown,
  'arrow-up': ArrowUp,
  'arrow-up-right': ArrowUpRight,
  'arrow-down-left': ArrowDownLeft,

  // Status / feedback
  'checkmark': Check,
  'checkmark-circle': CheckCircle2,
  'checkmark-circle-outline': CheckCircle2,
  'check': Check,
  'close': X,
  'close-circle': XCircle,
  'close-outline': X,
  'alert-circle': AlertCircle,
  'alert-circle-outline': AlertCircle,
  'warning': AlertTriangle,
  'warning-outline': AlertTriangle,
  'information-circle': Info,
  'information-circle-outline': Info,

  // Search / actions
  'search': Search,
  'search-outline': Search,
  'add': Plus,
  'add-outline': Plus,
  'add-circle': PlusCircle,
  'add-circle-outline': PlusCircle,
  'remove': Minus,
  'remove-circle': MinusCircle,
  'remove-outline': Minus,

  // Money / commerce
  'wallet': Wallet,
  'wallet-outline': Wallet,
  'card': CreditCard,
  'card-outline': CreditCard,
  'cash': Wallet,
  'cash-outline': Wallet,
  'business': Building2,
  'business-outline': Building2,
  'pricetag': Tag,
  'pricetag-outline': Tag,

  // Communication
  'paper-plane': Send,
  'paper-plane-outline': Send,
  'send': Send,
  'send-outline': Send,
  'mail': Mail,
  'mail-outline': Mail,
  'chatbubble': MessageCircle,
  'chatbubble-outline': MessageCircle,
  'chatbubble-ellipses': MessageCircle,
  'chatbubble-ellipses-outline': MessageCircle,
  'call': Phone,
  'call-outline': Phone,

  // Security
  'lock-closed': Lock,
  'lock-closed-outline': Lock,
  'lock-open': Unlock,
  'lock-open-outline': Unlock,
  'shield': Shield,
  'shield-outline': Shield,
  'shield-checkmark': ShieldCheck,
  'shield-checkmark-outline': ShieldCheck,
  'eye': Eye,
  'eye-outline': Eye,
  'eye-off': EyeOff,
  'eye-off-outline': EyeOff,

  // System
  'settings': Settings,
  'settings-outline': Settings,
  'options': SlidersHorizontal,
  'options-outline': SlidersHorizontal,
  'notifications': Bell,
  'notifications-outline': Bell,
  'notifications-off': BellOff,
  'notifications-off-outline': BellOff,
  'log-out': LogOut,
  'log-out-outline': LogOut,
  'log-in': LogIn,
  'log-in-outline': LogIn,
  'help-circle': HelpCircle,
  'help-circle-outline': HelpCircle,
  'flash': Zap,
  'flash-outline': Zap,
  'sparkles': Sparkles,
  'sparkles-outline': Sparkles,

  // People
  'person': User,
  'person-outline': User,
  'people': Users,
  'people-outline': Users,
  'people-circle': Users,
  'people-circle-outline': Users,

  // Time / location
  'time': Clock,
  'time-outline': Clock,
  'calendar': Calendar,
  'calendar-outline': Calendar,
  'location': MapPin,
  'location-outline': MapPin,
  'pin': MapPin,
  'pin-outline': MapPin,
  'globe': Globe,
  'globe-outline': Globe,

  // Files / data
  'document': FileText,
  'document-outline': FileText,
  'document-text': FileText,
  'document-text-outline': FileText,
  'folder': Folder,
  'folder-outline': Folder,
  'folder-open': FolderOpen,
  'clipboard': Clipboard,
  'clipboard-outline': Clipboard,
  'copy': Copy,
  'copy-outline': Copy,
  'cloud-download': DownloadCloud,
  'cloud-download-outline': DownloadCloud,
  'download': Download,
  'download-outline': Download,
  'cloud-upload': Upload,
  'cloud-upload-outline': Upload,
  'share': Share2,
  'share-outline': Share2,
  'share-social': Share2,
  'share-social-outline': Share2,

  // Charts
  'trending-up': TrendingUp,
  'trending-up-outline': TrendingUp,
  'trending-down': TrendingDown,
  'trending-down-outline': TrendingDown,
  'stats-chart': TrendingUp,
  'stats-chart-outline': TrendingUp,
  'bar-chart': TrendingUp,
  'bar-chart-outline': TrendingUp,

  // Misc
  'ellipsis-horizontal': MoreHorizontal,
  'ellipsis-horizontal-outline': MoreHorizontal,
  'ellipsis-vertical': MoreVertical,
  'ellipsis-vertical-outline': MoreVertical,
  'refresh': RefreshCw,
  'refresh-outline': RefreshCw,
  'reload': RefreshCw,
  'reload-outline': RefreshCw,
  'swap-horizontal': ArrowRightLeft,
  'swap-vertical': Repeat,
  'qr-code': QrCode,
  'qr-code-outline': QrCode,
  'gift': Gift,
  'gift-outline': Gift,
  'star': Star,
  'star-outline': Star,
  'heart': Heart,
  'heart-outline': Heart,
  'bookmark': Bookmark,
  'bookmark-outline': Bookmark,
  'home': Home,
  'home-outline': Home,
  'compass': Compass,
  'compass-outline': Compass,
  'list': ListOrdered,
  'list-outline': ListOrdered,
  'menu': MoreHorizontal,
  'menu-outline': MoreHorizontal,
  'filter': Filter,
  'filter-outline': Filter,
  'pencil': Edit3,
  'pencil-outline': Edit3,
  'create': Edit2,
  'create-outline': Edit2,
  'trash': Trash2,
  'trash-outline': Trash2,
  'image': ImageIcon,
  'image-outline': ImageIcon,
  'camera': Camera,
  'camera-outline': Camera,
  'wifi': Wifi,
  'wifi-outline': Wifi,
  'moon': Moon,
  'moon-outline': Moon,
  'sunny': Sun,
  'sunny-outline': Sun,
  'thumbs-up': ThumbsUp,
  'thumbs-up-outline': ThumbsUp,
  'flame': Flame,
  'flame-outline': Flame,
  'bird': Bird,
  'bird-outline': Bird,
  'ribbon': Award,
  'ribbon-outline': Award,
  'medal': Award,
  'medal-outline': Award,
  'badge': BadgeCheck,
  'backspace': Delete,
  'backspace-outline': Delete,
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: any;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color = '#FFFFFF',
  strokeWidth = 2,
  style,
}) => {
  const Comp = ICON_MAP[name] || HelpCircle;
  return <Comp size={size} color={color} strokeWidth={strokeWidth} style={style} />;
};

// Backwards-compat alias so existing `Ionicons` JSX keeps working until swept.
export { Icon as Ionicons };
