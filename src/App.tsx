import React, { useState, useEffect } from 'react';
import { 
  Hospital, 
  Milk, 
  LayoutDashboard, 
  PlusCircle, 
  Plus,
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings,
  LogOut,
  ChevronRight,
  Search,
  Filter,
  Shield,
  Download,
  Calendar,
  Send,
  Trash2,
  Edit,
  X,
  Share,
  FileText,
  Video,
  Copy,
  RotateCcw,
  MapPin,
  Globe,
  Mail,
  Upload,
  Navigation,
  Box,
  Layers,
  FileBarChart,
  Camera,
  Cake,
  Heart,
  Menu,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { format, isSameDay, parseISO, differenceInYears, isValid } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from './lib/utils';
import { HospitalEntry, DairyEntry, Template, MessageLog, MediaItem } from './types';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
      active 
        ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200" 
        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
    )}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const Card = ({ children, className }: any) => (
  <div className={cn("bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', className, ...props }: any) => {
  const variants = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-800",
    secondary: "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
  };
  return (
    <button 
      className={cn("px-4 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50", variants[variant as keyof typeof variants], className)}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ label, ...props }: any) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-zinc-700">{label}</label>}
    <input 
      className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
      {...props}
    />
  </div>
);

const Select = ({ label, options, ...props }: any) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-zinc-700">{label}</label>}
    <select 
      className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all bg-white"
      {...props}
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const ManualSelect = ({ label, options, value, onChange, defaultValue, ...props }: any) => {
  const [isManual, setIsManual] = React.useState(false);

  React.useEffect(() => {
    const val = value !== undefined ? value : defaultValue;
    if (val && options.length > 0 && !options.some((opt: any) => opt.value === val)) {
      setIsManual(true);
    }
  }, [value, defaultValue, options]);

  return (
    <div className="space-y-1.5 flex-1 w-full min-w-[200px]">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-700">{label}</label>
        <button 
          type="button" 
          onClick={() => setIsManual(!isManual)}
          className="text-[10px] uppercase tracking-wider font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          {isManual ? "Switch to List" : "Manual Entry"}
        </button>
      </div>
      {isManual ? (
        <input 
          className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium text-zinc-900"
          value={value}
          onChange={onChange}
          defaultValue={defaultValue}
          placeholder={`Enter ${label}...`}
          autoComplete="off"
          {...props}
        />
      ) : (
        <select 
          className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all bg-white font-medium text-zinc-900 cursor-pointer"
          value={value}
          onChange={onChange}
          defaultValue={defaultValue}
          {...props}
        >
          <option value="">Select {label}</option>
          {options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}
    </div>
  );
};

const FileInput = ({ label, onChange, ...props }: any) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-zinc-700">{label}</label>}
    <div className="relative">
      <input 
        type="file" 
        className="hidden" 
        id={props.name} 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              onChange(reader.result);
            };
            reader.readAsDataURL(file);
          }
        }}
        {...props}
      />
      <label 
        htmlFor={props.name}
        className="w-full flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 border-dashed hover:border-zinc-900 hover:bg-zinc-50 cursor-pointer transition-all text-sm text-zinc-500"
      >
        <PlusCircle size={16} />
        Choose File
      </label>
    </div>
  </div>
);

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", 
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const UP_DISTRICTS_DATA: Record<string, { blocks: string[], cities: string[] }> = {
  "Basti": {
    blocks: ["Basti Sadar", "Bahadurpur", "Bankati", "Dubaulya", "Gaur", "Harraiya", "Kaptanganj", "Kudraha", "Parasrampur", "Ramnagar", "Rudhauli", "Saltaua Gopalpur", "Saon Ghat", "Vikramjot"],
    cities: ["Basti", "Harraiya", "Rudhauli", "Babhnan", "Bhanpur"]
  },
  "Gonda": {
    blocks: ["Belsar", "Babhanjot", "Chhapia", "Colonelganj", "Haldharmau", "Itia Thok", "Jhanjhari", "Katra Bazar", "Mankapur", "Mujehna", "Nawabganj", "Pandri Kripal", "Paraspur", "Rupaidih", "Tarabganj", "Wazirganj"],
    cities: ["Gonda", "Colonelganj", "Nawabganj", "Katra", "Mankapur", "Khargupur", "Paraspur", "Tarabganj"]
  },
  "Balrampur": {
    blocks: ["Balrampur", "Gainsari", "Harriya Satgharwa", "Pachperwa", "Rehera Bazaar", "Shriduttganj", "Tulsipur", "Utraula"],
    cities: ["Balrampur", "Tulsipur", "Utraula", "Pachperwa", "Gainsari"]
  },
  "Ambedkar Nagar": {
    blocks: ["Akbarpur", "Baskhari", "Bhiti", "Bhiyaon", "Jalalpur", "Jahangir Ganj", "Katehari", "Ramnagar", "Tanda"],
    cities: ["Akbarpur", "Tanda", "Jalalpur", "Baskhari", "Katehari"]
  },
  "Sant Kabir Nagar": {
    blocks: ["Baghauli", "Belhar Kala", "Hainsar Bazar", "Khalilabad", "Mehdawal", "Nath Nagar", "Pauli", "Semariyawan", "Santha"],
    cities: ["Khalilabad", "Maghar", "Mehdawal", "Hariharpur", "Ledwa Mahua"]
  },
  "Siddharth Nagar": {
    blocks: ["Bansi", "Barhni", "Birdpur", "Domariyaganj", "Itwa", "Jogia", "Khunwa", "Lotan", "Naugarh", "Shohratgarh", "Uska Bazar"],
    cities: ["Naugarh", "Bansi", "Itwa", "Domariyaganj", "Shohratgarh", "Barhni Bazar"]
  }
};

// --- Main App ---

export default function App() {
  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Disable inspection shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return;
      }
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C' || e.key === 'i' || e.key === 'j' || e.key === 'c')) {
        e.preventDefault();
        return;
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return;
      }
      // Ctrl+S (Save)
      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  const [user, setUser] = useState<{ username: string; role: 'admin' | 'staff' } | null>(null);
  const [activeModule, setActiveModule] = useState<'Hospital' | 'Dairy'>('Hospital');
  const [activeTab, setActiveTab] = useState('global');
  const [cookieError, setCookieError] = useState(false);
  const [hospitalEntries, setHospitalEntries] = useState<HospitalEntry[]>([]);
  const [dairyEntries, setDairyEntries] = useState<DairyEntry[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedMediaId, setSelectedMediaId] = useState<number | null>(null);
  const [mediaToDelete, setMediaToDelete] = useState<number | null>(null);
  const [directMessage, setDirectMessage] = useState({ phone: '', message: '', templateId: '' });
  const [showTemplatePicker, setShowTemplatePicker] = useState<{ phone: string, name: string, type: string } | null>(null);
  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [staffAccounts, setStaffAccounts] = useState<any[]>([]);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [viewPasswordId, setViewPasswordId] = useState<number | null>(null);
  const [staffSubTab, setStaffSubTab] = useState<'directory' | 'accounts'>('accounts');
  const [settings, setSettings] = useState<any>({
    institution_name: 'Shri Krishna Mission Hospital',
    contact_number: '91 9918922900',
    full_address: 'Shri Krishna Nagar, Dhorika Road, Bargodwa Near Bodewan, Basti-272001, Uttar Pradesh',
    hospital_name: 'Shri Krishna Mission H',
    whatsapp_api_key: '',
    auto_birthday: false,
    auto_anniversary: false,
    logo_url: ''
  });
  const handleAddTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      module: activeModule,
      name: (formData.get('name') as string || '').trim(),
      content: (formData.get('content') as string || '').trim(),
      type: (formData.get('type') as string || '').trim(),
    };

    if (!data.name || !data.content) {
      toast.error("Both Template Name and Message Content are required");
      return;
    }

    try {
      const url = editingTemplate ? `/api/templates/${editingTemplate.id}` : '/api/templates';
      const method = editingTemplate ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success(editingTemplate ? "Template updated" : "Template created");
        setShowAddTemplateModal(false);
        setEditingTemplate(null);
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(`Failed to save template: ${errData.error || errData.message || res.statusText}`);
      }
    } catch (err) {
      toast.error("Network error while saving template");
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (confirm("Are you sure you want to delete this template?")) {
      try {
        const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success("Template deleted");
          fetchData();
        } else {
          const errData = await res.json().catch(() => ({}));
          toast.error(`Failed to delete template: ${errData.error || errData.message || res.statusText}`);
        }
      } catch (err: any) {
        toast.error(`Network error: ${err?.message || "Failed to delete template"}`);
      }
    }
  };

  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSaveStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      module: activeModule,
      name: formData.get('name'),
      username: formData.get('username'),
      password: formData.get('password'),
    };

    try {
      const url = editingStaff ? `/api/staff_accounts/${editingStaff.id}` : '/api/staff_accounts';
      const method = editingStaff ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        toast.success(editingStaff ? "Staff updated" : "Staff added");
        setShowStaffModal(false);
        setEditingStaff(null);
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        const errText = errData.error || errData.message || res.statusText || "Server error";
        toast.error(`Failed to save staff: ${errText}`);
      }
    } catch (err: any) {
      toast.error(`Network error: ${err?.message || "Failed to save staff"}`);
    }
  };

  const handleDeleteStaff = async (id: number) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      try {
        const res = await fetch(`/api/staff_accounts/${id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success("Staff deleted");
          fetchData();
        } else {
          const errData = await res.json().catch(() => ({}));
          toast.error(`Failed to delete staff: ${errData.error || errData.message || res.statusText}`);
        }
      } catch (err: any) {
        toast.error(`Network error: ${err?.message || "Failed to delete staff"}`);
      }
    }
  };

  // State Master State
  const [stateMasterList, setStateMasterList] = useState<{ id: number, name: string }[]>([
    { id: 3, name: "Assam" },
    { id: 4, name: "Bihar" },
    { id: 5, name: "Chhattisgarh" },
    { id: 6, name: "Goa" },
    { id: 7, name: "Gujarat" },
    { id: 8, name: "Haryana" },
    { id: 9, name: "Himachal Pradesh" },
    { id: 10, name: "Jharkhand" },
    { id: 11, name: "Karnataka" },
    { id: 12, name: "Kerala" },
    { id: 13, name: "Madhya Pradesh" },
    { id: 14, name: "Maharashtra" },
    { id: 15, name: "Manipur" },
    { id: 16, name: "Meghalaya" },
    { id: 17, name: "Mizoram" },
    { id: 18, name: "Nagaland" },
    { id: 19, name: "Odisha" },
    { id: 20, name: "Punjab" },
    { id: 21, name: "Rajasthan" },
    { id: 22, name: "Sikkim" },
    { id: 23, name: "Tamil Nadu" },
    { id: 24, name: "Telangana" },
    { id: 25, name: "Tripura" },
    { id: 26, name: "Uttar Pradesh" },
    { id: 27, name: "Uttarakhand" },
    { id: 28, name: "West Bengal" },
    { id: 29, name: "Andaman and Nicobar Islands" },
    { id: 30, name: "Chandigarh" },
    { id: 31, name: "Dadra and Nagar Haveli and Daman and Diu" },
    { id: 32, name: "Delhi" },
    { id: 33, name: "Jammu and Kashmir" },
    { id: 34, name: "Ladakh" },
    { id: 35, name: "Lakshadweep" },
    { id: 36, name: "Puducherry" }
  ]);
  const [newStateName, setNewStateName] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [editingStateId, setEditingStateId] = useState<number | null>(null);

  // District Master State
  const [districtMasterList, setDistrictMasterList] = useState<{ id: number, state: string, name: string }[]>([
    { id: 1, state: "Uttar Pradesh", name: "Basti" },
    { id: 2, state: "Uttar Pradesh", name: "Gonda" },
    { id: 3, state: "Uttar Pradesh", name: "Balrampur" },
    { id: 4, state: "Uttar Pradesh", name: "Ambedkar Nagar" },
    { id: 5, state: "Uttar Pradesh", name: "Sant Kabir Nagar" },
    { id: 6, state: "Uttar Pradesh", name: "Siddharth Nagar" }
  ]);
  const [newDistrictName, setNewDistrictName] = useState('');
  const [newDistrictState, setNewDistrictState] = useState('Uttar Pradesh');
  const [districtSearch, setDistrictSearch] = useState('');
  const [editingDistrictId, setEditingDistrictId] = useState<number | null>(null);

  // Block Master State
  const [blockMasterList, setBlockMasterList] = useState<{ id: number, district: string, name: string }[]>([
    { id: 1, district: "Ambedkar Nagar", name: "Akbarpur" },
    { id: 2, district: "Ambedkar Nagar", name: "Baskhari" },
    { id: 3, district: "Ambedkar Nagar", name: "Bheeti" },
    { id: 4, district: "Ambedkar Nagar", name: "Bhiyaon" },
    { id: 5, district: "Ambedkar Nagar", name: "Jahangirganj" }
  ]);
  const [newBlockName, setNewBlockName] = useState('');
  const [newBlockDistrict, setNewBlockDistrict] = useState('');
  const [blockSearch, setBlockSearch] = useState('');
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);

  // Post Master State
  const [postMasterList, setPostMasterList] = useState<{ id: number, state: string, district: string, name: string, pincode: string }[]>([
    { id: 1, state: "Uttar Pradesh", district: "Basti", name: "Basti", pincode: "272001" },
    { id: 2, state: "Uttar Pradesh", district: "Basti", name: "Civil Line Basti", pincode: "272001" },
    { id: 3, state: "Uttar Pradesh", district: "Basti", name: "Gandhinagar Basti", pincode: "272001" },
    { id: 4, state: "Uttar Pradesh", district: "Basti", name: "ITI Basti", pincode: "272001" },
    { id: 5, state: "Uttar Pradesh", district: "Basti", name: "Purani Basti", pincode: "272002" },
    { id: 6, state: "Uttar Pradesh", district: "Basti", name: "Pandey Bazar", pincode: "272002" }
  ]);
  const [newPostName, setNewPostName] = useState('');
  const [newPostState, setNewPostState] = useState('Uttar Pradesh');
  const [newPostDistrict, setNewPostDistrict] = useState('Basti');
  const [newPostPincode, setNewPostPincode] = useState('');
  const [postSearch, setPostSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Village Master State
  const [villageMasterList, setVillageMasterList] = useState<{ id: number, state: string, district: string, block: string, name: string }[]>([]);
  const [newVillageName, setNewVillageName] = useState('');
  const [newVillageBlock, setNewVillageBlock] = useState('');
  const [newVillageDistrict, setNewVillageDistrict] = useState('');
  const [newVillageState, setNewVillageState] = useState('Uttar Pradesh');
  const [villageSearch, setVillageSearch] = useState('');
  const [editingVillageId, setEditingVillageId] = useState<number | null>(null);

  const entries = activeModule === 'Hospital' ? hospitalEntries : dairyEntries;
  
  // Highlighting duplicates logic
  const phoneCount = entries.reduce((acc: any, curr: any) => {
    if (curr.phone) {
      acc[curr.phone] = (acc[curr.phone] || 0) + 1;
    }
    return acc;
  }, {});

  const handleDeleteEntry = async (id: any) => {
    if (!window.confirm("ARE YOU SURE YOU WANT TO DELETE THIS RECORD? THIS ACTION CANNOT BE UNDONE.")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/${activeModule.toLowerCase()}/entries/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success("Entry deleted successfully", { icon: '🗑️' });
        await fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(`Failed to delete: ${errData.message || 'Server error'}`);
      }
    } catch (err) {
      toast.error("Network error while deleting");
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllData = async () => {
    const confirmation = window.confirm("⚠️ DANGER: THIS WILL PERMANENTLY DELETE ALL DATA ENTERED IN THIS MODULE. THIS CANNOT BE UNDONE. Type 'DELETE' to confirm.");
    if (!confirmation) return;

    const finalConfirm = window.prompt("Type 'DELETE' to confirm bulk deletion:");
    if (finalConfirm !== 'DELETE') {
      toast.error("Clear action cancelled: Confirmation word mismatch");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/${activeModule.toLowerCase()}/entries`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success(`All ${activeModule} data cleared successfully`, { icon: '🔥' });
        await fetchData();
      } else {
        toast.error("Failed to clear data");
      }
    } catch (err) {
      toast.error("Network error while clearing data");
    } finally {
      setLoading(false);
    }
  };

  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  // Report Filter States
  const [reportFilters, setReportFilters] = useState({
    village: '',
    post: '',
    state: '',
    district: '',
    block: '',
    pincode: '',
    search: ''
  });

  // Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formFiles, setFormFiles] = useState<{ photo?: string; id_card?: string; aadhaar_card?: string }>({});
  const [locationData, setLocationData] = useState<{ 
    city: string; 
    state: string; 
    district: string; 
    block: string;
    village: string;
    post: string;
    cities: string[];
    districts: string[];
    blocks: string[];
    villages: string[];
  }>({ 
    city: '', 
    state: '', 
    district: '', 
    block: '',
    village: '',
    post: '',
    cities: [], 
    districts: [],
    blocks: [], 
    villages: [] 
  });

  const [importingFile, setImportingFile] = useState<File | null>(null);

  const [pasteData, setPasteData] = useState('');

  const parseAndUploadRawData = async () => {
    if (!pasteData.trim()) return toast.error("Please paste some data first");
    
    try {
      const lines = pasteData.trim().split('\n').filter(l => l.trim());
      const entries = lines.map(line => {
        // Detect separator: comma, tab, or double space
        let parts: string[] = [];
        if (line.includes('\t')) {
          parts = line.split('\t').map(p => p.trim());
        } else if (line.includes(',')) {
          parts = line.split(',').map(p => p.trim());
        } else {
          parts = line.split(/\s{2,}/).map(p => p.trim());
        }
        
        // Skip header rows (e.g. if part[0] is "ID" or "Name")
        if (parts[0]?.toLowerCase() === 'id' || parts[0]?.toLowerCase() === 'name') return null;
        
        // Simple heuristic to ignore empty/garbage lines
        if (parts.length < 2) return null;

        let id, name, father, phone, dob, village, block, district, age, state;
        
        // Smarter mapping based on column count and simple heuristics
        if (parts.length >= 10) {
          // ID(0), Name(1), Father(2), Phone(3), DOB(4), Anniv(5), Age(6), Village(7), Block(8), Dept(9), District(10)
          id = parts[0];
          name = parts[1];
          father = parts[2];
          phone = parts[3];
          dob = parts[4];
          age = parts[6];
          village = parts[7];
          block = parts[8];
          district = parts[10];
        } else if (parts.length === 4 || parts.length === 5) {
          // Minimal format: [ID], Name, Phone, DOB, State
          if (parts.length === 5) {
            id = parts[0];
            name = parts[1];
            phone = parts[2];
            dob = parts[3];
            state = parts[4];
          } else {
            name = parts[0];
            phone = parts[1];
            dob = parts[2];
            state = parts[3];
          }
        } else {
          // Fallback guess
          id = parts[0];
          name = parts[1] || `Patient ${id}`;
          phone = parts[2] || '';
          dob = parts[3];
          village = parts[4] || '';
          block = parts[5] || '';
          district = parts[6] || '';
          age = parts[7] || '';
          state = parts[8] || 'Uttar Pradesh';
        }

        const finalId = parseInt(id || '') || Math.floor(Date.now() + Math.random() * 1000000);
        const finalName = name || (activeModule === 'Hospital' ? `Patient ${finalId}` : `Farmer ${finalId}`);
        const finalPhone = String(phone || '').replace(/[^0-9]/g, '') || '';
        const finalAge = parseInt(age || '0') || 0;

        // Standardize DOB (DD-MM-YYYY -> YYYY-MM-DD)
        let finalDob = dob;
        if (dob && dob.includes('-')) {
          const bits = dob.split('-');
          if (bits.length === 3) {
            if (bits[2] && bits[2].length === 4) {
              finalDob = `${bits[2]}-${bits[1]}-${bits[0]}`;
            } else if (bits[0] && bits[0].length === 4) {
              finalDob = `${bits[0]}-${bits[1]}-${bits[2]}`;
            }
          }
        }

        return {
          id: finalId,
          name: finalName,
          father_husband: father || '',
          phone: finalPhone,
          dob: finalDob,
          age: finalAge,
          village: village || '',
          block: block || '',
          district: district || '',
          state: state || 'Uttar Pradesh',
          department: 'General',
          type: activeModule === 'Hospital' ? 'Patient' : 'Farmer',
          created_at: new Date().toISOString()
        };
      }).filter(Boolean);

      if (entries.length === 0) return toast.error("No valid records found in the pasted data");

      console.log('Sending entries to bulk upload:', entries);

      const res = await fetch(`/api/${activeModule.toLowerCase()}/bulk_upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries })
      });

      if (res.ok) {
        const result = await res.json();
        if (result.message && result.message.includes('local server storage')) {
          toast.success(`${result.count} records saved to local fallback (DB Restricted)`);
        } else {
          toast.success(`Successfully uploaded ${result.count || entries.length} records!`);
        }
        setPasteData('');
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        const detailedError = errData.dbError || errData.error || errData.message || res.statusText || 'Database Error';
        toast.error(`Upload failed: ${detailedError}`, { duration: 6000 });
        console.error('Upload error details:', errData);
      }
    } catch (err) {
      console.error('Parsing error:', err);
      toast.error("Parsing failed. Check data format.");
    }
  };

  const handleExcelImport = async () => {
    if (!importingFile) return toast.error("Please select a file first");
    
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'yyyy-mm-dd' });

        if (!jsonData || jsonData.length === 0) {
          throw new Error("No data found in file");
        }

        console.log(`Processing ${jsonData.length} rows from Excel...`);

        const entries = jsonData.map((row: any) => {
          const obj: any = {};
          
          // Map common variations to schema keys
          const mappings: Record<string, string[]> = {
            name: ['name', 'patient name', 'farmer name', 'full name', 'candidate name'],
            phone: ['phone', 'mobile', 'contact', 'whatsapp', 'phone number', 'mobile number'],
            father_husband: ['father/husband', 'father / husband', 'father_husband', 'father', 'husband', 'guardian'],
            dob: ['dob', 'date of birth', 'birth date', 'birthday'],
            anniversary: ['anniversary', 'wedding date', 'marriage date'],
            village: ['village', 'address', 'location', 'village name'],
            block: ['block', 'tehsil'],
            district: ['district', 'zila'],
            state: ['state', 'province'],
            pincode: ['pincode', 'pin', 'zip', 'zipcode'],
            post: ['post', 'post office'],
            age: ['age', 'years'],
            department: ['department', 'dept', 'specialty'],
            doctor: ['doctor', 'dr', 'consultant'],
            bmc_dpmc: ['bmc/dpmc', 'bmc', 'dpmc', 'center'],
            aadhar: ['aadhar', 'aadhaar', 'uid', 'aadhar number', 'aadhaar number']
          };

          // Try to find values based on mappings
          Object.keys(row).forEach(key => {
            const val = row[key];
            const lowerKey = key.toLowerCase().trim();
            
            for (const [schemaKey, variations] of Object.entries(mappings)) {
              if (schemaKey === lowerKey || variations.includes(lowerKey)) {
                obj[schemaKey] = val;
                break;
              }
            }
          });

          // Fallback for remaining keys
          Object.keys(row).forEach(key => {
            const lowerKey = key.toLowerCase().trim().replace(/\//g, '_').replace(/ /g, '_');
            if (obj[lowerKey] === undefined) {
              obj[lowerKey] = row[key];
            }
          });

          // Case-insensitive ID check
          if (!obj.id) {
            const idKey = Object.keys(row).find(k => k.toLowerCase().trim() === 'id');
            if (idKey) obj.id = parseInt(String(row[idKey]));
          }

          if (!obj.id || isNaN(Number(obj.id))) {
            obj.id = Math.floor(Date.now() + Math.random() * 1000000);
          }
          
          if (!obj.type) obj.type = activeModule === 'Hospital' ? 'Patient' : 'Farmer';
          
          // Ensure all fields are strings (except id) to prevent .toLowerCase() errors
          Object.keys(obj).forEach(k => {
            if (k !== 'id' && obj[k] !== null && obj[k] !== undefined) {
              obj[k] = String(obj[k]);
            }
          });

          return obj;
        });

        console.log(`Uploading ${entries.length} records to ${activeModule}...`);

        const res = await fetch(`/api/${activeModule.toLowerCase()}/bulk_upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entries })
        });

        if (res.ok) {
          const result = await res.json();
          const count = result.count || entries.length;
          const msg = result.message ? ` (${result.message})` : "";
          toast.success(`Imported ${count} records successfully!${msg}`);
          fetchData();
        } else {
          const errorData = await res.json().catch(() => ({}));
          const errMsg = errorData.message || errorData.error || res.statusText;
          const dbError = errorData.dbError ? ` | DB: ${errorData.dbError}` : "";
          console.error("Bulk upload failed:", errorData);
          toast.error(`Import failed: ${errMsg}${dbError}`, { duration: 6000 });
        }
      } catch (err) {
        console.error("Import error:", err);
        toast.error(err instanceof Error ? err.message : "Error processing file");
      } finally {
        setLoading(false);
        setImportingFile(null);
      }
    };
    reader.readAsArrayBuffer(importingFile);
  };

  useEffect(() => {
    fetchData();
  }, [activeModule]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoints = [
        { key: 'hospital', url: '/api/hospital/entries', setter: setHospitalEntries },
        { key: 'dairy', url: '/api/dairy/entries', setter: setDairyEntries },
        { key: 'templates', url: `/api/templates/${activeModule}`, setter: setTemplates },
        { key: 'logs', url: `/api/logs/${activeModule}`, setter: setLogs },
        { key: 'media', url: `/api/media/${activeModule}`, setter: setMediaItems },
        { key: 'settings', url: `/api/settings/${activeModule}`, setter: setSettings },
        { key: 'states', url: `/api/masters/${activeModule}/state_master`, setter: setStateMasterList },
        { key: 'districts', url: `/api/masters/${activeModule}/district_master`, setter: setDistrictMasterList },
        { key: 'blocks', url: `/api/masters/${activeModule}/block_master`, setter: setBlockMasterList },
        { key: 'posts', url: `/api/masters/${activeModule}/post_master`, setter: setPostMasterList },
        { key: 'villages', url: `/api/masters/${activeModule}/village_master`, setter: setVillageMasterList },
        { key: 'staff', url: `/api/staff_accounts/${activeModule}`, setter: setStaffAccounts },
      ];

      await Promise.all(endpoints.map(async (ep) => {
        try {
          // Use a timestamp to prevent browser caching
          const res = await fetch(`${ep.url}?t=${Date.now()}`);
          if (res.ok) {
            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('text/html')) {
              setCookieError(true);
              console.warn(`Fetch returned HTML instead of JSON for ${ep.key}. This indicates third-party cookie blocking.`);
              ep.setter(ep.key === 'settings' ? {} : []);
              return;
            }

            const text = await res.text();
            if (text.trim().startsWith('<!doctype') || text.trim().startsWith('<html') || text.trim().startsWith('<DOCTYPE') || text.trim().startsWith('<!DOCTYPE')) {
              setCookieError(true);
              console.warn(`Fetch returned HTML page instead of JSON for ${ep.key}. This indicates third-party cookie blocking.`);
              ep.setter(ep.key === 'settings' ? {} : []);
              return;
            }

            let data;
            try {
              data = JSON.parse(text);
            } catch (jsonErr) {
              console.error(`JSON Parse Error for ${ep.key}:`, jsonErr);
              ep.setter(ep.key === 'settings' ? {} : []);
              return;
            }

            const count = Array.isArray(data) ? data.length : (data ? 1 : 0);
            console.log(`Received ${count} records for ${ep.key}`);
            ep.setter(data || (ep.key === 'settings' ? {} : []));
          } else {
            console.warn(`Fetch failed for ${ep.key}: ${res.status}`);
          }
        } catch (err) {
          console.error(`Error fetching ${ep.key}:`, err);
        }
      }));
    } catch (globalErr) {
      console.error("Global fetch error:", globalErr);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch('/api/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module: activeModule,
            name: file.name,
            type: file.type,
            data: base64
          })
        });
        if (res.ok) {
          toast.success("Media uploaded successfully");
          fetchData();
        }
      } catch (err) {
        toast.error("Failed to upload media");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteMedia = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMediaToDelete(id);
  };

  const confirmDeleteMedia = async () => {
    if (!mediaToDelete) return;
    
    try {
      const res = await fetch(`/api/media/${mediaToDelete}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success("Media deleted successfully");
        if (selectedMediaId === mediaToDelete) setSelectedMediaId(null);
        setMediaToDelete(null);
        fetchData();
      }
    } catch (err) {
      toast.error("Failed to delete media");
      setMediaToDelete(null);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      ...Object.fromEntries(formData.entries()),
      auto_birthday: settings.auto_birthday,
      auto_anniversary: settings.auto_anniversary
    };
    try {
      const res = await fetch(`/api/settings/${activeModule}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        toast.success("Settings saved successfully");
        fetchData();
      }
    } catch (err) {
      toast.error("Failed to save settings");
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const usernameRaw = formData.get('username');
    const passwordRaw = formData.get('password');
    
    const username = String(usernameRaw || '').trim();
    const password = String(passwordRaw || '').trim();
    
    // Client-side credentials (for static deployments like Netlify)
    const vAdminId = (String((import.meta as any).env.VITE_ADMIN_ID || 'admin')).trim();
    const vAdminPass = (String((import.meta as any).env.VITE_ADMIN_PASSWORD || '12345')).trim();
    const vStaffId = (String((import.meta as any).env.VITE_STAFF_ID || 'staff')).trim();
    const vStaffPass = (String((import.meta as any).env.VITE_STAFF_PASSWORD || '12345')).trim();

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, module: activeModule })
      });

      if (res.ok) {
        let userData;
        try {
          const text = await res.text();
          userData = JSON.parse(text);
        } catch (jsonErr) {
          console.error("Failed to parse login response:", jsonErr);
          throw new Error("Invalid response format from server (expected JSON, got HTML?).");
        }
        setUser(userData);
        if (userData.role === 'staff') {
          setActiveTab('automation');
        }
        toast.success(`Welcome back, ${userData.username}!`);
        return;
      }
      
      // If we get here, the API call failed (e.g. 401, 404, etc.)
      console.warn(`API login failed with status: ${res.status}`);
      
      // Try client-side fallback regardless of status if it's not a success
      // This helps if the server is misconfigured but the client has the right VITE_ vars
      if ((username.toLowerCase() === vAdminId.toLowerCase() || username.toLowerCase() === 'admin' || username.toLowerCase() === 'homecookingservice2025@gmail.com') && (password === vAdminPass || password === '12345')) {
        setUser({ username, role: 'admin' });
        toast.success(`Welcome back (Local Fallback), ${username}!`);
      } else if ((username.toLowerCase() === vStaffId.toLowerCase() || username.toLowerCase() === 'staff') && (password === vStaffPass || password === '12345')) {
        setUser({ username, role: 'staff' });
        setActiveTab('automation');
        toast.success(`Welcome back (Local Fallback), ${username}!`);
      } else {
        if (res.status === 401) {
          toast.error("Invalid username or password");
        } else {
          toast.error(`Login failed (Status: ${res.status}). Try default credentials.`);
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      // Network error or backend missing - try client-side fallback
      if ((username.toLowerCase() === vAdminId.toLowerCase() || username.toLowerCase() === 'admin' || username.toLowerCase() === 'homecookingservice2025@gmail.com') && (password === vAdminPass || password === '12345')) {
        setUser({ username, role: 'admin' });
        toast.success(`Welcome back (Offline Mode), ${username}!`);
      } else if ((username.toLowerCase() === vStaffId.toLowerCase() || username.toLowerCase() === 'staff') && (password === vStaffPass || password === '12345')) {
        setUser({ username, role: 'staff' });
        setActiveTab('automation');
        toast.success(`Welcome back (Offline Mode), ${username}!`);
      } else {
        toast.error("Login failed. Check your connection or use default credentials.");
      }
    }
  };

  const fetchLocationByPincode = async (pincode: string) => {
    if (pincode.length !== 6) return;
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data[0].Status === 'Success') {
        const postOffices = data[0].PostOffice;
        const districts = Array.from(new Set(postOffices.map((po: any) => po.District))) as string[];
        const blocks = Array.from(new Set(postOffices.map((po: any) => po.Block))) as string[];
        const villages = Array.from(new Set(postOffices.map((po: any) => po.Name))) as string[];
        
        const first = postOffices[0];
        setLocationData({
          city: first.District,
          state: first.State,
          district: first.District,
          block: first.Block,
          village: first.Name,
          post: first.Name,
          cities: districts,
          districts: districts,
          blocks: blocks,
          villages: villages
        });
        toast.success("Location details fetched!");
      } else {
        toast.error("Invalid Pincode");
      }
    } catch (err) {
      toast.error("Failed to fetch location");
    }
  };

  const ageGroupDistribution = React.useMemo(() => {
    const entries = activeModule === 'Hospital' ? hospitalEntries : dairyEntries;
    const groups = [
      { name: '0-18', count: 0 },
      { name: '19-35', count: 0 },
      { name: '36-50', count: 0 },
      { name: '50+', count: 0 },
    ];
    entries.forEach(e => {
      if (!e.dob) return;
      try {
        const birthDate = parseISO(e.dob);
        const age = differenceInYears(new Date(), birthDate);
        if (age <= 18) groups[0].count++;
        else if (age <= 35) groups[1].count++;
        else if (age <= 50) groups[2].count++;
        else groups[3].count++;
      } catch (err) {
        // Skip invalid dates
      }
    });
    return groups;
  }, [hospitalEntries, dairyEntries, activeModule]);

  const locationDistribution = React.useMemo(() => {
    const entries = activeModule === 'Hospital' ? hospitalEntries : dairyEntries;
    const counts: Record<string, number> = {};
    entries.forEach(e => {
      const v = e.village || 'Unknown';
      counts[v] = (counts[v] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top4 = sorted.slice(0, 4).map(([name, value]) => ({ name, value }));
    const othersCount = sorted.slice(4).reduce((acc, curr) => acc + curr[1], 0);
    if (othersCount > 0) {
      top4.push({ name: 'Others', value: othersCount });
    }
    return top4.length > 0 ? top4 : [{ name: 'No Data', value: 1 }];
  }, [hospitalEntries, dairyEntries, activeModule]);

  const [modalEntryType, setModalEntryType] = useState<string>('');

  // Dynamic Master Lists from entered data
  const dynamicMaster = React.useMemo(() => {
    const safeHospital = Array.isArray(hospitalEntries) ? hospitalEntries : [];
    const safeDairy = Array.isArray(dairyEntries) ? dairyEntries : [];
    const entries = [...safeHospital, ...safeDairy];
    return {
      villages: Array.from(new Set([
        ...villageMasterList.map(v => v.name),
        ...entries.map(e => e.village).filter(Boolean)
      ])),
      posts: Array.from(new Set([
        ...postMasterList.map(p => p.name),
        ...entries.map(e => (e as any).post).filter(Boolean)
      ])),
      cities: Array.from(new Set([
        ...Object.values(UP_DISTRICTS_DATA).flatMap(d => d.cities),
        ...entries.map(e => (e as any).city).filter(Boolean)
      ])),
      blocks: Array.from(new Set([
        ...blockMasterList.map(b => b.name),
        ...Object.values(UP_DISTRICTS_DATA).flatMap(d => d.blocks),
        ...entries.map(e => e.block).filter(Boolean)
      ])),
      districts: Array.from(new Set([
        ...districtMasterList.map(d => d.name),
        ...entries.map(e => e.district).filter(Boolean)
      ])),
      states: Array.from(new Set([
        ...INDIAN_STATES,
        ...entries.map(e => (e as any).state).filter(Boolean)
      ])),
    };
  }, [hospitalEntries, dairyEntries, postMasterList, blockMasterList, districtMasterList]);

  useEffect(() => {
    if (showAddModal) {
      setModalEntryType(editingEntry?.type || (activeModule === 'Hospital' ? 'Patient' : 'Farmer'));
    }
  }, [showAddModal, editingEntry, activeModule]);

  const handleAddEntry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      ...Object.fromEntries(formData.entries()),
      ...formFiles
    };
    
    const endpoint = editingEntry 
      ? `/api/${activeModule.toLowerCase()}/entries/${editingEntry.id}`
      : (activeModule === 'Hospital' ? '/api/hospital/entries' : '/api/dairy/entries');
    
    try {
      const res = await fetch(endpoint, {
        method: editingEntry ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        let msg = editingEntry ? "Entry updated successfully" : "Entry added successfully";
        try {
          const resData = await res.json();
          if (resData.message) msg = resData.message;
        } catch (e) {}
        toast.success(msg);
        setShowAddModal(false);
        setEditingEntry(null);
        setFormFiles({});
        setLocationData({ city: '', state: '', district: '', block: '', village: '', post: '', cities: [], districts: [], blocks: [], villages: [] });
        fetchData();
      } else {
        let errorMsg = editingEntry ? "Failed to update entry" : "Failed to add entry";
        try {
          const errData = await res.json();
          errorMsg = errData.error || errData.message || errorMsg;
          console.error('Server error data:', errData);
        } catch (e) {
          const rawText = await res.text().catch(() => "");
          if (rawText.includes("<html") || rawText.includes("<!DOCTYPE")) {
            const h1Match = rawText.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
            const preMatch = rawText.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
            if (preMatch && preMatch[1]) {
              errorMsg = preMatch[1].trim();
            } else if (h1Match && h1Match[1]) {
              errorMsg = h1Match[1].trim();
            } else {
              errorMsg = `Server HTML error ${res.status}: ${res.statusText}`;
            }
          } else {
            errorMsg = rawText.substring(0, 300) || errorMsg;
          }
          console.error('Could not parse JSON error:', rawText);
        }
        toast.error(`Error: ${errorMsg}`, { duration: 6000 });
      }
    } catch (err) {
      // Fallback for static deployments (Netlify)
      const storageKey = activeModule === 'Hospital' ? 'local_hospital_entries' : 'local_dairy_entries';
      const localEntries = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      if (editingEntry) {
        const index = localEntries.findIndex((e: any) => e.id === editingEntry.id);
        if (index !== -1) {
          localEntries[index] = { ...editingEntry, ...data, updated_at: new Date().toISOString() };
        }
      } else {
        const newEntry = { 
          ...data, 
          id: Date.now(), 
          created_at: new Date().toISOString() 
        };
        localEntries.unshift(newEntry);
      }
      
      localStorage.setItem(storageKey, JSON.stringify(localEntries));
      
      toast.success(editingEntry ? "Entry updated (Local Mode)" : "Entry saved (Local Mode)");
      setShowAddModal(false);
      setEditingEntry(null);
      setFormFiles({});
      setLocationData({ city: '', state: '', district: '', block: '', village: '', post: '', cities: [], districts: [], blocks: [], villages: [] });
      
      // Update local state to reflect changes immediately
      if (activeModule === 'Hospital') {
        setHospitalEntries(localEntries);
      } else {
        setDairyEntries(localEntries);
      }
    }
  };

  const sendWhatsApp = async (phone: any, message: string, name: string) => {
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    const selectedMedia = mediaItems.find(m => m.id === selectedMediaId);

    if (selectedMedia) {
      try {
        await navigator.clipboard.writeText(message);
        toast.success("Message copied to clipboard!");
      } catch (err) {
        // Fallback
      }
    }

    if (selectedMedia && navigator.share) {
      try {
        const response = await fetch(selectedMedia.data);
        const blob = await response.blob();
        if (blob.size > 20 * 1024 * 1024) throw new Error("File too large (>20MB)");
        
        const file = new File([blob], selectedMedia.name, { type: selectedMedia.type });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            text: message,
          });
          toast.success("Opening share menu...");
          return;
        } else {
          throw new Error("Browser cannot share this file type");
        }
      } catch (err) {
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        toast.error(`${(err as Error).message || 'Media sharing failed'}. Attach the file manually in WhatsApp.`);
      }
    } else {
      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
      if (selectedMedia) {
        toast("Message copied! Attach the file in WhatsApp and paste the message as a caption.", {
          duration: 6000,
          icon: '📋'
        });
      }
    }
    
    // Log the message
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        module: activeModule,
        recipient_name: name,
        recipient_phone: phone,
        message,
        status: 'Sent',
        action_type: selectedMedia ? 'Share' : 'Send',
        media_name: selectedMedia?.name || null
      })
    });
    fetchData();
  };

  const handleShareEntry = (entry: any) => {
    const text = `*Entry Details*\nName: ${entry.name}\nPhone: ${entry.phone}\nLocation: ${entry.village}, ${entry.block}\nModule: ${activeModule}`;
    sendWhatsApp(entry.phone, text, entry.name);
  };

  const exportData = (data: any[], filename: string) => {
    if (data.length === 0) return toast.error("No data to export");
    
    // Define fields to exclude (mostly binary/blobs)
    const excludeFields = ['photo', 'id_card', 'aadhaar_card', 'data'];
    
    const headers = Object.keys(data[0]).filter(key => !excludeFields.includes(key));
    
    const csvRows = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => {
          const val = row[header];
          // Escape quotes and wrap in quotes if contains comma
          const escaped = String(val === null || val === undefined ? '' : val).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      )
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEntries = (Array.isArray(activeModule === 'Hospital' ? hospitalEntries : dairyEntries) ? (activeModule === 'Hospital' ? hospitalEntries : dairyEntries) : []).filter(e => 
    String(e.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(e.phone || '').includes(searchTerm) ||
    String((activeModule === 'Hospital' ? (e as HospitalEntry).village : (e as DairyEntry).village) || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReportEntries = (Array.isArray(activeModule === 'Hospital' ? hospitalEntries : dairyEntries) ? (activeModule === 'Hospital' ? hospitalEntries : dairyEntries) : []).filter(e => {
    const s = reportFilters;
    const name = String(e.name || '');
    const phone = String(e.phone || '');
    const village = String(e.village || '');
    
    const matchesSearch = !s.search || 
      name.toLowerCase().includes(s.search.toLowerCase()) || 
      phone.includes(s.search);
    
    const matchesVillage = !s.village || village.toLowerCase().includes(s.village.toLowerCase());
    const matchesPost = !s.post || String((e as HospitalEntry).post || '').toLowerCase().includes(s.post.toLowerCase());
    const matchesState = !s.state || String(e.state || '').toLowerCase().includes(s.state.toLowerCase());
    const matchesDistrict = !s.district || String(e.district || '').toLowerCase().includes(s.district.toLowerCase());
    const matchesBlock = !s.block || String(e.block || '').toLowerCase().includes(s.block.toLowerCase());
    const matchesPincode = !s.pincode || String(e.pincode || '').includes(s.pincode);
    
    return matchesSearch && matchesVillage && matchesPost && matchesState && matchesDistrict && matchesBlock && matchesPincode;
  });

  const getBirthdayBoys = () => {
    try {
      const today = format(new Date(), 'MM-dd');
      return filteredEntries.filter(e => {
        if (!e.dob || e.dob.length < 5) return false;
        try {
          const date = parseISO(e.dob);
          return format(date, 'MM-dd') === today;
        } catch {
          return false;
        }
      });
    } catch {
      return [];
    }
  };

  const getAnniversaryFolks = () => {
    try {
      const today = format(new Date(), 'MM-dd');
      return filteredEntries.filter(e => {
        if (!e.anniversary || e.anniversary.length < 5) return false;
        try {
          const date = parseISO(e.anniversary);
          return format(date, 'MM-dd') === today;
        } catch {
          return false;
        }
      });
    } catch {
      return [];
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <Toaster position="top-right" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-zinc-100"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">Admin Panel</h1>
            <p className="text-zinc-500">Please sign in to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Select Module</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModule('Hospital')}
                  className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border ${
                    activeModule === 'Hospital' 
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg scale-[1.02]' 
                    : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  Hospital
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModule('Dairy')}
                  className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border ${
                    activeModule === 'Dairy' 
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg scale-[1.02]' 
                    : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  Dairy
                </button>
              </div>
            </div>
            <Input label="Username" name="username" placeholder="Enter username" required />
            <Input label="Password" name="password" type="password" placeholder="Enter password" required />
            <Button type="submit" className="w-full py-4 bg-zinc-900 h-auto">Sign In</Button>
          </form>
          <div className="mt-8 pt-8 border-t border-zinc-100 text-center space-y-2">
            <p className="text-xs text-zinc-500 font-bold">
              Developed by Digital Communique Private limited
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white">
            {activeModule === 'Hospital' ? <Hospital size={24} /> : <Milk size={24} />}
          </div>
          <div>
            <h1 className="font-bold text-zinc-900 leading-tight">Shri Krishna</h1>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
              {activeModule === 'Hospital' ? 'Mission Hospital' : 'Sugar & Dairy'}
            </p>
          </div>
        </div>
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-zinc-400">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
        <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 mt-4">Main Menu</p>
        {user.role === 'admin' && (
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Global Overview" 
            active={activeTab === 'global'} 
            onClick={() => { setActiveTab('global'); setIsSidebarOpen(false); }} 
          />
        )}
        {user.role === 'admin' && (
          <SidebarItem 
            icon={activeModule === 'Hospital' ? Hospital : Milk} 
            label="Module Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} 
          />
        )}
        {user.role === 'admin' && (
          <SidebarItem 
            icon={Users} 
            label="Staff" 
            active={activeTab === 'staff'} 
            onClick={() => { setActiveTab('staff'); setIsSidebarOpen(false); }} 
          />
        )}
        {user.role === 'admin' && (
          <SidebarItem 
            icon={PlusCircle} 
            label="Data Entry" 
            active={activeTab === 'data'} 
            onClick={() => { setActiveTab('data'); setIsSidebarOpen(false); }} 
          />
        )}
        <SidebarItem 
          icon={MessageSquare} 
          label="Automation" 
          active={activeTab === 'automation'} 
          onClick={() => { setActiveTab('automation'); setIsSidebarOpen(false); }} 
        />
        {user.role === 'admin' && (
          <SidebarItem 
            icon={BarChart3} 
            label="Reports" 
            active={activeTab === 'reports'} 
            onClick={() => { setActiveTab('reports'); setIsSidebarOpen(false); }} 
          />
        )}
        {user.role === 'admin' && (
          <SidebarItem 
            icon={FileBarChart} 
            label="User Reports" 
            active={activeTab === 'user-reports'} 
            onClick={() => { setActiveTab('user-reports'); setIsSidebarOpen(false); }} 
          />
        )}
        {user.role === 'admin' && (
          <SidebarItem 
            icon={Globe} 
            label="State" 
            active={activeTab === 'states'} 
            onClick={() => { setActiveTab('states'); setIsSidebarOpen(false); }} 
          />
        )}
        {user.role === 'admin' && (
          <SidebarItem 
            icon={MapPin} 
            label="Village" 
            active={activeTab === 'villages'} 
            onClick={() => { setActiveTab('villages'); setIsSidebarOpen(false); }} 
          />
        )}
        {user.role === 'admin' && (
          <SidebarItem 
            icon={MapPin} 
            label="District" 
            active={activeTab === 'districts'} 
            onClick={() => { setActiveTab('districts'); setIsSidebarOpen(false); }} 
          />
        )}
        {user.role === 'admin' && (
          <SidebarItem 
            icon={Box} 
            label="Block" 
            active={activeTab === 'blocks'} 
            onClick={() => { setActiveTab('blocks'); setIsSidebarOpen(false); }} 
          />
        )}
        {user.role === 'admin' && (
          <SidebarItem 
            icon={Mail} 
            label="Post" 
            active={activeTab === 'posts'} 
            onClick={() => { setActiveTab('posts'); setIsSidebarOpen(false); }} 
          />
        )}
        {user.role === 'admin' && (
          <SidebarItem 
            icon={Upload} 
            label="Upload Data" 
            active={activeTab === 'upload-data'} 
            onClick={() => { setActiveTab('upload-data'); setIsSidebarOpen(false); }} 
          />
        )}
        {user.role === 'admin' && (
          <SidebarItem 
            icon={Download} 
            label="Export Data" 
            active={activeTab === 'export-data'} 
            onClick={() => { setActiveTab('export-data'); setIsSidebarOpen(false); }} 
          />
        )}
        {user.role === 'admin' && (
          <SidebarItem 
            icon={RotateCcw} 
            label="Switch Module" 
            onClick={() => {
              const nextModule = activeModule === 'Hospital' ? 'Dairy' : 'Hospital';
              setActiveModule(nextModule);
              setActiveTab('dashboard');
              setIsSidebarOpen(false);
              toast.success(`Switched to ${nextModule} Module`);
            }} 
          />
        )}
        {user.role === 'admin' && (
          <SidebarItem 
            icon={Settings} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} 
          />
        )}
        <SidebarItem icon={LogOut} label="Logout" onClick={() => setUser(null)} />
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden relative">
      <Toaster position="top-right" />
      
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-zinc-200 flex-col p-6 space-y-8 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 p-6 flex flex-col space-y-8 shadow-2xl lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {cookieError && (
          <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3 shadow-sm select-text">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-900 text-sm">⚠️ Browser Blocking Cookies (Sandbox Environment Warning)</h4>
              <p className="text-amber-700 text-xs leading-relaxed">
                Your browser's privacy settings are restricting the required security cookie inside this review frame.
                To activate connections and save/load database records, please <strong>open this application in a new tab</strong> by clicking the <strong>square-with-arrow (Open in New Tab)</strong> icon in the top right of the preview frame.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <a 
                  href={window.location.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition"
                >
                  <Share size={12} />
                  Open in New Tab
                </a>
                <button 
                  onClick={() => setCookieError(false)}
                  className="text-amber-500 hover:text-amber-700 text-xs font-semibold transition cursor-pointer"
                >
                  Dismiss Warning
                </button>
              </div>
            </div>
          </div>
        )}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-zinc-900 line-clamp-1">
                {activeTab === 'global' && 'Global Overview'}
                {activeTab === 'dashboard' && `${activeModule} Overview`}
                {activeTab === 'staff' && 'Staff Management'}
                {activeTab === 'data' && 'Data Management'}
                {activeTab === 'automation' && 'Messaging Automation'}
                {activeTab === 'reports' && 'Analytical Reports'}
                {activeTab === 'user-reports' && 'User Specific Reports'}
                {activeTab === 'districts' && 'District Wise Statistics'}
                {activeTab === 'villages' && 'Village Master Management'}
                {activeTab === 'states' && 'State Wise Statistics'}
                {activeTab === 'blocks' && 'Block Wise Statistics'}
                {activeTab === 'posts' && 'Post Office Wise Statistics'}
                {activeTab === 'upload-data' && 'Import Data'}
                {activeTab === 'export-data' && 'Export Data Hub'}
              </h2>
              <p className="text-sm text-zinc-500">Welcome back, {user.username}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {user.role === 'admin' && (
              <div className="flex gap-2">
                <Button onClick={() => { setEditingEntry(null); setShowAddModal(true); }} className="flex items-center justify-center gap-2">
                  <PlusCircle size={18} />
                  Add New
                </Button>
                <Button onClick={() => setActiveTab('upload-data')} variant="secondary" className="flex items-center justify-center gap-2">
                  <Upload size={18} />
                  Bulk Upload
                </Button>
              </div>
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'global' && (
            <motion.div 
              key="global"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 border-l-4 border-l-blue-500">
                  <h3 className="text-zinc-500 text-sm font-medium">Hospital Patients</h3>
                  <p className="text-3xl font-bold text-zinc-900 mt-1">{hospitalEntries.length}</p>
                  <p className="text-xs text-blue-600 mt-2 font-medium">Total Registered</p>
                </Card>
                <Card className="p-6 border-l-4 border-l-emerald-500">
                  <h3 className="text-zinc-500 text-sm font-medium">Dairy Members</h3>
                  <p className="text-3xl font-bold text-zinc-900 mt-1">{dairyEntries.length}</p>
                  <p className="text-xs text-emerald-600 mt-2 font-medium">Farmers & Customers</p>
                </Card>
                <Card className="p-6 border-l-4 border-l-purple-500">
                  <h3 className="text-zinc-500 text-sm font-medium">Total Messages</h3>
                  <p className="text-3xl font-bold text-zinc-900 mt-1">{logs.length}</p>
                  <p className="text-xs text-purple-600 mt-2 font-medium">Across All Modules</p>
                </Card>
                <Card className="p-6 border-l-4 border-l-orange-500">
                  <h3 className="text-zinc-500 text-sm font-medium">Today's Events</h3>
                  <p className="text-3xl font-bold text-zinc-900 mt-1">
                    {hospitalEntries.filter(e => {
                      try {
                        return e.dob && isValid(parseISO(e.dob)) && format(parseISO(e.dob), 'MM-dd') === format(new Date(), 'MM-dd');
                      } catch (err) { return false; }
                    }).length + 
                     dairyEntries.filter(e => {
                      try {
                        return e.dob && isValid(parseISO(e.dob)) && format(parseISO(e.dob), 'MM-dd') === format(new Date(), 'MM-dd');
                      } catch (err) { return false; }
                    }).length}
                  </p>
                  <p className="text-xs text-orange-600 mt-2 font-medium">Birthdays & Anniversaries</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-bold text-zinc-900 mb-6">Combined Growth Analysis</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Hospital', count: hospitalEntries.length, fill: '#3b82f6' },
                        { name: 'Dairy', count: dairyEntries.length, fill: '#10b981' },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#f8fafc'}} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-bold text-zinc-900 mb-6">Recent Activity Summary</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                          <Hospital size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900">Hospital Module</p>
                          <p className="text-xs text-zinc-500">{hospitalEntries.length} Patients Active</p>
                        </div>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => { setActiveModule('Hospital'); setActiveTab('dashboard'); }}>View</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                          <Milk size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900">Dairy Module</p>
                          <p className="text-xs text-zinc-500">{dairyEntries.length} Members Active</p>
                        </div>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => { setActiveModule('Dairy'); setActiveTab('dashboard'); }}>View</Button>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <Users size={24} />
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">+12%</span>
                  </div>
                  <h3 className="text-zinc-500 text-sm font-medium">Total {activeModule === 'Hospital' ? 'Patients' : 'Farmers'}</h3>
                  <p className="text-3xl font-bold text-zinc-900 mt-1">{filteredEntries.length}</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                      <Calendar size={24} />
                    </div>
                  </div>
                  <h3 className="text-zinc-500 text-sm font-medium">Birthdays Today</h3>
                  <p className="text-3xl font-bold text-zinc-900 mt-1">{getBirthdayBoys().length}</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                      <MessageSquare size={24} />
                    </div>
                  </div>
                  <h3 className="text-zinc-500 text-sm font-medium">Messages Sent</h3>
                  <p className="text-3xl font-bold text-zinc-900 mt-1">{logs.length}</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                      <BarChart3 size={24} />
                    </div>
                  </div>
                  <h3 className="text-zinc-500 text-sm font-medium">Growth Rate</h3>
                  <p className="text-3xl font-bold text-zinc-900 mt-1">8.4%</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6">
                  <h3 className="font-bold text-zinc-900 mb-6">Registration Trends</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Mon', count: 4 },
                        { name: 'Tue', count: 7 },
                        { name: 'Wed', count: 5 },
                        { name: 'Thu', count: 12 },
                        { name: 'Fri', count: 9 },
                        { name: 'Sat', count: 15 },
                        { name: 'Sun', count: 6 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" fill="#18181b" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-bold text-zinc-900 mb-6">Today's Reminders</h3>
                  <div className="space-y-4">
                    {getBirthdayBoys().length === 0 && getAnniversaryFolks().length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="mx-auto text-zinc-200 mb-3" size={48} />
                        <p className="text-zinc-400 text-sm">No events for today</p>
                      </div>
                    ) : (
                      <>
                        {getBirthdayBoys().map(person => (
                          <div key={person.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-zinc-200 text-lg">🎂</div>
                              <div>
                                <p className="text-sm font-bold text-zinc-900">{person.name}</p>
                                <p className="text-xs text-zinc-500">Birthday</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => setShowTemplatePicker({ phone: person.phone, name: person.name, type: 'Birthday' })}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            >
                              <Send size={18} />
                            </button>
                          </div>
                        ))}
                        {getAnniversaryFolks().map(person => (
                          <div key={person.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-zinc-200 text-lg">💍</div>
                              <div>
                                <p className="text-sm font-bold text-zinc-900">{person.name}</p>
                                <p className="text-xs text-zinc-500">Anniversary</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => setShowTemplatePicker({ phone: person.phone, name: person.name, type: 'Anniversary' })}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            >
                              <Send size={18} />
                            </button>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'data' && (
            <motion.div 
              key="data"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card>
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                  <h3 className="font-bold text-zinc-900">All Entries</h3>
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => {
                        setEditingEntry(null);
                        setModalEntryType(activeModule === 'Hospital' ? 'Patient' : 'Farmer');
                        setShowAddModal(true);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2 text-white font-bold"
                    >
                      <PlusCircle size={16} />
                      Add New {activeModule === 'Hospital' ? 'Patient' : 'Farmer'}
                    </Button>
                    <Button variant="secondary" className="flex items-center gap-2" onClick={() => exportData(filteredEntries, `${activeModule}_Entries`)}>
                      <Download size={16} />
                      Export
                    </Button>
                    <Button variant="secondary" className="flex items-center gap-2">
                      <Filter size={16} />
                      Filter
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50" 
                      onClick={handleClearAllData}
                    >
                      <Trash2 size={16} />
                      Clear All
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-100">
                        {activeModule === 'Hospital' ? (
                          <>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">ID</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Father/Husband</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Phone</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">DOB</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Anniv.</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Age</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Village</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Location (Post/Block)</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Dept/State</th>
                          </>
                        ) : (
                          <>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Phone</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Location</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Age</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Type</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">BMC/DPMC</th>
                          </>
                        )}
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredEntries.map((entry: any) => {
                        const isDuplicate = phoneCount[entry.phone] > 1;
                        return (
                        <tr key={entry.id} className={`hover:bg-zinc-50/50 transition-all group ${isDuplicate ? 'bg-amber-50/30' : ''}`}>
                          {activeModule === 'Hospital' ? (
                            <>
                              <td className="px-6 py-4 text-sm font-medium text-zinc-900 border-l-2 border-transparent group-hover:border-zinc-900">
                                <div className="flex items-center gap-2">
                                  #{entry.id}
                                  {(entry as any)._source === 'fallback' && (
                                    <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded-md font-bold uppercase">Fallback</span>
                                  )}
                                  {isDuplicate && <span title="Duplicate entry detected" className="text-amber-500"><AlertTriangle size={12} /></span>}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {entry.photo && <img src={entry.photo} className="w-8 h-8 rounded-full object-cover" alt="" />}
                                  <span className="text-sm font-bold text-zinc-900">{entry.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-zinc-600">{entry.father_husband}</td>
                              <td className="px-6 py-4 text-sm text-zinc-600 font-mono tabular-nums">{entry.phone}</td>
                              <td className="px-6 py-4 text-sm text-zinc-600">
                                {entry.dob}
                                {entry.dob && (() => {
                                  try {
                                    const d = parseISO(entry.dob);
                                    return isValid(d) && format(d, 'MM-dd') === format(new Date(), 'MM-dd');
                                  } catch (e) { return false; }
                                })() && (
                                  <button 
                                    onClick={() => setShowTemplatePicker({ phone: entry.phone, name: entry.name, type: 'Birthday' })}
                                    className="ml-2 p-1 text-emerald-600 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-all inline-flex items-center justify-center"
                                    title="Send Birthday Wish"
                                  >
                                    <Send size={12} />
                                  </button>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-zinc-600">
                                {entry.anniversary}
                                {entry.anniversary && (() => {
                                  try {
                                    const d = parseISO(entry.anniversary);
                                    return isValid(d) && format(d, 'MM-dd') === format(new Date(), 'MM-dd');
                                  } catch (e) { return false; }
                                })() && (
                                  <button 
                                    onClick={() => setShowTemplatePicker({ phone: entry.phone, name: entry.name, type: 'Anniversary' })}
                                    className="ml-2 p-1 text-purple-600 bg-purple-50 rounded-full hover:bg-purple-100 transition-all inline-flex items-center justify-center"
                                    title="Send Anniversary Wish"
                                  >
                                    <Send size={12} />
                                  </button>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-zinc-600">{entry.age}</td>
                              <td className="px-6 py-4 text-sm text-zinc-600">{entry.village}</td>
                              <td className="px-6 py-4 text-sm text-zinc-600">
                                <div className="max-w-[150px] truncate" title={`${entry.post}, ${entry.block}, ${entry.district}`}>
                                  {entry.post}, {entry.block}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-zinc-600">
                                <div className="flex flex-col">
                                  <span>{entry.department}</span>
                                  <span className="text-[10px] text-zinc-400">{entry.state}</span>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {entry.photo ? (
                                    <img src={entry.photo} className="w-10 h-10 rounded-full object-cover border border-zinc-100 shadow-sm" alt="" />
                                  ) : (
                                    <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-400 border border-zinc-100">
                                      <Users size={20} />
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                                      {entry.name}
                                      {(entry as any)._source === 'fallback' && (
                                        <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded-md font-bold uppercase">Fallback</span>
                                      )}
                                      {isDuplicate && <span title="Duplicate entry detected" className="text-amber-500"><AlertTriangle size={12} /></span>}
                                      {(entry.id_card || entry.aadhaar_card) && (
                                        <span title={entry.id_card ? "ID Card Available" : "Aadhaar Card Available"} className="text-blue-500">
                                          <ShieldCheck size={12} />
                                        </span>
                                      )}
                                    </p>
                                    <p className="text-[10px] text-zinc-400 font-mono tracking-tighter">ID: #{entry.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-zinc-600 font-mono">{entry.phone}</td>
                              <td className="px-6 py-4 text-sm text-zinc-600">{entry.village}, {entry.block}</td>
                              <td className="px-6 py-4 text-sm text-zinc-600">{entry.age}</td>
                              <td className="px-6 py-4">
                                <span className={cn(
                                  "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                  entry.type === 'Farmer' ? "bg-emerald-50 text-emerald-600" : 
                                  entry.type === 'Staff' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                                )}>
                                  {entry.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-zinc-600">{entry.bmc_dpmc}</td>
                            </>
                          )}
                          <td className="px-6 py-4 sticky right-0 bg-white shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.1)] md:static md:shadow-none min-w-[140px] z-10">
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={() => sendWhatsApp(entry.phone, `Hello ${entry.name},`, entry.name)}
                                className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                                title="WhatsApp"
                              >
                                <MessageSquare size={16} />
                              </button>
                              <button 
                                onClick={() => handleShareEntry(entry)}
                                className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                title="Share"
                              >
                                <Share size={16} />
                              </button>
                              <button 
                                onClick={() => {
                                  setEditingEntry(entry);
                                  setFormFiles({
                                    photo: entry.photo,
                                    id_card: entry.id_card,
                                    aadhaar_card: entry.aadhaar_card
                                  });
                                  setShowAddModal(true);
                                }}
                                className="p-2 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-all"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete Permanently"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'automation' && (
            <motion.div 
              key="automation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Today's Automation Reminders */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 bg-gradient-to-br from-emerald-50/50 to-white border-emerald-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                       <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                         <Calendar size={18} />
                       </div>
                       Today's Birthdays
                    </h3>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      {getBirthdayBoys().length} Events
                    </span>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {getBirthdayBoys().length === 0 ? (
                      <p className="text-sm text-zinc-400 text-center py-8">No birthdays today</p>
                    ) : (
                      getBirthdayBoys().map(person => (
                        <div key={person.id} className="flex items-center justify-between p-3 bg-white border border-zinc-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-lg">🎂</div>
                            <div>
                              <p className="text-sm font-bold text-zinc-900">{person.name}</p>
                              <p className="text-[10px] text-zinc-500">{person.phone}</p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => setShowTemplatePicker({ phone: person.phone, name: person.name, type: 'Birthday' })}
                            className="text-emerald-600 hover:text-emerald-700"
                          >
                            <Send size={14} className="mr-2" />
                            Wish
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-50/50 to-white border-purple-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                       <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                         <Heart size={18} />
                       </div>
                       Today's Anniversaries
                    </h3>
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                      {getAnniversaryFolks().length} Events
                    </span>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {getAnniversaryFolks().length === 0 ? (
                      <p className="text-sm text-zinc-400 text-center py-8">No anniversaries today</p>
                    ) : (
                      getAnniversaryFolks().map(person => (
                        <div key={person.id} className="flex items-center justify-between p-3 bg-white border border-zinc-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-lg">💍</div>
                            <div>
                              <p className="text-sm font-bold text-zinc-900">{person.name}</p>
                              <p className="text-[10px] text-zinc-500">{person.phone}</p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => setShowTemplatePicker({ phone: person.phone, name: person.name, type: 'Anniversary' })}
                            className="text-purple-600 hover:text-purple-700"
                          >
                            <Send size={14} className="mr-2" />
                            Wish
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-bold text-zinc-900 mb-6">Message Templates</h3>
                <div className="space-y-4">
                  {templates.map(template => (
                    <div key={template.id} className="p-4 border border-zinc-100 rounded-xl hover:border-zinc-200 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{template.type}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => { setEditingTemplate(template); setShowAddTemplateModal(true); }}
                            className="text-zinc-400 hover:text-zinc-900"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="text-zinc-400 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-zinc-900 mb-1">{template.name}</h4>
                      <p className="text-sm text-zinc-500 line-clamp-2">{template.content}</p>
                    </div>
                  ))}
                  <Button 
                    onClick={() => { setEditingTemplate(null); setShowAddTemplateModal(true); }}
                    variant="secondary" 
                    className="w-full border-dashed border-2 text-zinc-400 hover:text-zinc-900 hover:border-zinc-300"
                  >
                    + Create New Template
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold text-zinc-900 mb-6">Direct Messenger</h3>
                <div className="space-y-4">
                  <Input 
                    label="Recipient Phone" 
                    placeholder="919876543210" 
                    value={directMessage.phone}
                    onChange={(e) => setDirectMessage({ ...directMessage, phone: e.target.value })}
                    required
                  />
                  <Select 
                    label="Select Template" 
                    value={directMessage.templateId}
                    onChange={(e) => {
                      const t = templates.find(temp => temp.id === parseInt(e.target.value));
                      setDirectMessage({ 
                        ...directMessage, 
                        templateId: e.target.value,
                        message: t ? t.content.replace('{{name}}', 'Valued Customer') : directMessage.message
                      });
                    }}
                    options={[{ value: '', label: 'None' }, ...templates.map(t => ({ value: t.id, label: t.name }))]} 
                    required
                  />
                  <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                    <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider">Attach Media</p>
                    <div className="flex flex-wrap gap-2">
                      {mediaItems.map(item => (
                        <div 
                          key={item.id} 
                          onClick={() => setSelectedMediaId(selectedMediaId === item.id ? null : item.id)}
                          className={cn(
                            "relative w-12 h-12 bg-white border rounded-lg overflow-hidden cursor-pointer transition-all group",
                            selectedMediaId === item.id ? "border-zinc-900 ring-2 ring-zinc-900/10" : "border-zinc-200"
                          )}
                        >
                          {item.type.startsWith('image') ? (
                            <img src={item.data} className="w-full h-full object-cover" alt="" />
                          ) : item.type.startsWith('video') ? (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">
                              <Video size={16} />
                            </div>
                          ) : item.type.includes('pdf') ? (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-red-400">
                              <FileText size={16} />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">
                              <BarChart3 size={16} />
                            </div>
                          )}
                          <button 
                            onClick={(e) => handleDeleteMedia(item.id, e)}
                            className="absolute top-0 right-0 p-1 bg-red-500 text-white transition-opacity shadow-sm rounded-bl-lg"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      <label className="w-12 h-12 bg-white border border-zinc-200 border-dashed rounded-lg flex items-center justify-center text-zinc-300 hover:text-zinc-900 cursor-pointer transition-all">
                        <PlusCircle size={16} />
                        <input type="file" className="hidden" accept="image/*,video/*,.gif,application/pdf" onChange={handleMediaUpload} />
                      </label>
                    </div>
                    {selectedMediaId && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                        <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                          <span className="font-bold uppercase tracking-tight text-[10px] block mb-1">How to send media:</span>
                          1. Click "Send" or "Share" <br/>
                          2. WhatsApp will open (Message is already copied). <br/>
                          3. Attach the file manually and PASTE the caption.
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-zinc-700">Message</label>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(directMessage.message);
                          toast.success("Message copied!");
                        }}
                        className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
                      >
                        <Copy size={12} />
                        Copy
                      </button>
                    </div>
                    <textarea 
                      className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 h-24"
                      placeholder="Type your message here..."
                      value={directMessage.message}
                      onChange={(e) => setDirectMessage({ ...directMessage, message: e.target.value })}
                      required
                    ></textarea>
                  </div>
                  <Button 
                    variant="secondary"
                    onClick={async () => {
                      if(!directMessage.message) return toast.error("Please enter a message");
                      const selectedMedia = mediaItems.find(m => m.id === selectedMediaId);
                      
                      if (selectedMedia && navigator.share) {
                        try {
                          const response = await fetch(selectedMedia.data);
                          const blob = await response.blob();
                          const file = new File([blob], selectedMedia.name, { type: selectedMedia.type });
                          if (navigator.canShare && navigator.canShare({ files: [file] })) {
                            await navigator.share({
                              files: [file],
                              text: directMessage.message,
                            });
                            return;
                          }
                        } catch (err) {
                          console.error("Share failed", err);
                        }
                      }
                      
                      const url = `https://wa.me/?text=${encodeURIComponent(directMessage.message)}`;
                      window.open(url, '_blank');
                    }}
                    className="w-full py-3 flex items-center justify-center gap-2 mb-2"
                  >
                    <Share size={18} />
                    Share Message
                  </Button>
                  <Button 
                    onClick={() => {
                      if(!directMessage.phone || !directMessage.message) return toast.error("Please fill all fields");
                      sendWhatsApp(directMessage.phone, directMessage.message, "Direct Message");
                    }}
                    className="w-full py-3 flex items-center justify-center gap-2"
                  >
                    <Send size={18} />
                    Send Message
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold text-zinc-900 mb-6">Bulk Message Sender</h3>
                <div className="space-y-4">
                  <Select 
                    label="Select Target Group" 
                    options={
                      activeModule === 'Hospital' 
                        ? [{ value: 'all', label: 'All Patients' }, { value: 'dept', label: 'By Department' }]
                        : [{ value: 'all', label: 'All Farmers' }, { value: 'village', label: 'By Village' }]
                    } 
                    required
                  />
                  <Select 
                    label="Select Template" 
                    options={[{ value: '', label: 'None' }, ...templates.map(t => ({ value: t.id, label: t.name }))]} 
                    required
                  />
                  <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                    <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider">Media Library</p>
                    <div className="flex flex-wrap gap-2">
                      {mediaItems.map(item => (
                        <div 
                          key={item.id} 
                          onClick={() => setSelectedMediaId(selectedMediaId === item.id ? null : item.id)}
                          className={cn(
                            "relative w-16 h-16 bg-white border rounded-lg overflow-hidden cursor-pointer transition-all group",
                            selectedMediaId === item.id ? "border-zinc-900 ring-2 ring-zinc-900/10" : "border-zinc-200"
                          )}
                        >
                          {item.type.startsWith('image') || item.type.includes('gif') ? (
                            <img src={item.data} className="w-full h-full object-cover" alt={item.name} />
                          ) : item.type.startsWith('video') ? (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">
                              <Video size={20} />
                            </div>
                          ) : item.type.includes('pdf') ? (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-red-400">
                              <FileText size={20} />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">
                              <BarChart3 size={20} />
                            </div>
                          )}
                          <button 
                            onClick={(e) => handleDeleteMedia(item.id, e)}
                            className="absolute top-0 right-0 p-1 bg-red-500 text-white transition-opacity shadow-sm rounded-bl-lg"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <label className="w-16 h-16 bg-white border border-zinc-200 border-dashed rounded-lg flex items-center justify-center text-zinc-300 hover:text-zinc-900 cursor-pointer transition-all">
                        <PlusCircle size={20} />
                        <input type="file" className="hidden" accept="image/*,video/*,.gif,application/pdf" onChange={handleMediaUpload} />
                      </label>
                    </div>
                    {selectedMediaId && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                        <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                          <span className="font-bold uppercase tracking-tight text-[10px] block mb-1">Bulk Media Instructions:</span>
                          When sending in bulk, for each recipient: <br/>
                          1. Attach the file manually. <br/>
                          2. Paste the auto-copied message as caption.
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-zinc-700">Custom Message (Optional)</label>
                      <button 
                        onClick={() => {
                          const textarea = document.querySelector('textarea[placeholder="Type your message here..."]') as HTMLTextAreaElement;
                          if (textarea) {
                            navigator.clipboard.writeText(textarea.value);
                            toast.success("Message copied!");
                          }
                        }}
                        className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
                      >
                        <Copy size={12} />
                        Copy
                      </button>
                    </div>
                    <textarea 
                      className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 h-32"
                      placeholder="Type your message here..."
                      required
                    ></textarea>
                  </div>
                  <Button className="w-full py-4 flex items-center justify-center gap-2">
                    <Send size={18} />
                    Send Bulk Messages
                  </Button>
                </div>
              </Card>

              <Card className="lg:col-span-2 p-6">
                <h3 className="font-bold text-zinc-900 mb-6">Message Logs</h3>
                <div className="space-y-3">
                  {logs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-zinc-200">
                          <MessageSquare size={18} className="text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900">{log.recipient_name} ({log.recipient_phone})</p>
                          <p className="text-xs text-zinc-500">{log.message}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-zinc-900">
                          {(() => {
                            try {
                              const d = parseISO(log.sent_at);
                              return isValid(d) ? format(d, 'MMM dd, HH:mm') : 'Invalid date';
                            } catch (e) { return 'Invalid date'; }
                          })()}
                        </p>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{log.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div 
              key="reports"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8"
            >
              {/* User Report Filter UI */}
              <Card className="overflow-hidden border-none shadow-xl">
                <div className="bg-blue-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white">User Report (Village to Pincode)</h3>
                </div>
                <div className="p-8 bg-white space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-900">Village</label>
                      <input 
                        type="text" 
                        placeholder="Village..."
                        className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={reportFilters.village}
                        onChange={(e) => setReportFilters({ ...reportFilters, village: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-900">Post</label>
                      <input 
                        type="text" 
                        placeholder="Post..."
                        className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={reportFilters.post}
                        onChange={(e) => setReportFilters({ ...reportFilters, post: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-900">State</label>
                      <select 
                        className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                        value={reportFilters.state}
                        onChange={(e) => setReportFilters({ ...reportFilters, state: e.target.value })}
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-900">District</label>
                      <input 
                        type="text" 
                        placeholder="District"
                        className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={reportFilters.district}
                        onChange={(e) => setReportFilters({ ...reportFilters, district: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-900">Block</label>
                      <input 
                        type="text" 
                        placeholder="Block"
                        className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={reportFilters.block}
                        onChange={(e) => setReportFilters({ ...reportFilters, block: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-900">Pincode</label>
                      <input 
                        type="text" 
                        placeholder="Pincode"
                        className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={reportFilters.pincode}
                        onChange={(e) => setReportFilters({ ...reportFilters, pincode: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-bold text-zinc-900">Search Name/Phone</label>
                      <input 
                        type="text" 
                        placeholder="Type name or phone..."
                        className="w-full max-w-md px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={reportFilters.search}
                        onChange={(e) => setReportFilters({ ...reportFilters, search: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => fetchData()} 
                        className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                      >
                        <Search size={18} />
                        Filter Data
                      </button>
                      <button 
                        onClick={() => setReportFilters({ village: '', post: '', state: '', district: '', block: '', pincode: '', search: '' })}
                        className="flex items-center gap-2 px-8 py-2.5 bg-zinc-600 text-white rounded-lg font-bold hover:bg-zinc-700 transition-all shadow-lg shadow-zinc-200 active:scale-95"
                      >
                        <RotateCcw size={18} />
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="md:col-span-2 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-zinc-900">User Detail Report</h3>
                  <Button variant="secondary" className="flex items-center gap-2" onClick={() => exportData(filteredReportEntries, 'User_Report')}>
                    <Download size={16} />
                    Download CSV Report
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-100">
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Village</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Post</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Block</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">District</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">State</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Pincode</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredReportEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-zinc-50/50">
                          <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                            #{entry.id}
                            {(entry as any)._source === 'fallback' && (
                              <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded-md font-bold uppercase">Fallback</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-zinc-900">{entry.name}</td>
                          <td className="px-6 py-4 text-sm text-zinc-600">{entry.phone}</td>
                          <td className="px-6 py-4 text-sm text-zinc-600">{entry.village}</td>
                          <td className="px-6 py-4 text-sm text-zinc-600">{(entry as HospitalEntry).post || '-'}</td>
                          <td className="px-6 py-4 text-sm text-zinc-600">{entry.block}</td>
                          <td className="px-6 py-4 text-sm text-zinc-600">{entry.district}</td>
                          <td className="px-6 py-4 text-sm text-zinc-600">{entry.state}</td>
                          <td className="px-6 py-4 text-sm text-zinc-600">{entry.pincode}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => { setEditingEntry(entry); setShowAddModal(true); }} 
                                className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                                title="Edit Entry"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={async () => {
                                  if (confirm(`Delete ${entry.name}?`)) {
                                    await fetch(`/api/${activeModule.toLowerCase()}/entries/${entry.id}`, { method: 'DELETE' });
                                    toast.success("Entry deleted");
                                    fetchData();
                                  }
                                }}
                                className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                                title="Delete Entry"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredReportEntries.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-zinc-500">
                            No entries found matching the filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-bold text-zinc-900 mb-6">Location Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={locationDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#18181b" />
                        <Cell fill="#27272a" />
                        <Cell fill="#3f3f46" />
                        <Cell fill="#52525b" />
                        <Cell fill="#71717a" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold text-zinc-900 mb-6">Age Group Analysis</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageGroupDistribution}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#18181b" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="md:col-span-2 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-zinc-900">Message Transmission Reports</h3>
                  <Button variant="secondary" className="flex items-center gap-2" onClick={() => exportData(logs, 'Messaging_Report')}>
                    <Download size={16} />
                    Download CSV Report
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-100">
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Recipient</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Action</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Media</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {logs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-zinc-900">{log.recipient_name}</p>
                            <p className="text-xs text-zinc-500">{log.recipient_phone}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                              log.action_type === 'Share' ? "bg-blue-50 text-blue-600" : "bg-zinc-100 text-zinc-600"
                            )}>
                              {log.action_type || 'Send'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-600">
                            {log.media_name ? (
                              <div className="flex items-center gap-1">
                                <FileText size={14} className="text-zinc-400" />
                                <span className="truncate max-w-[150px]">{log.media_name}</span>
                              </div>
                            ) : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-600">
                            {(() => {
                              try {
                                const d = parseISO(log.sent_at);
                                return isValid(d) ? format(d, 'MMM dd, yyyy HH:mm') : 'Invalid date';
                              } catch (e) { return 'Invalid date'; }
                            })()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold uppercase tracking-wider">{log.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'states' && (
          <motion.div 
            key="states"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="p-4 md:p-8">
              <h3 className="text-xl font-bold text-zinc-900 mb-6">State Master</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:items-end mb-8 text-left">
                <div className="sm:col-span-2">
                  <Input 
                    label="Enter State Name" 
                    placeholder="Enter State Name"
                    value={newStateName}
                    onChange={(e: any) => setNewStateName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={async () => {
                      if (!newStateName.trim()) return toast.error("Please enter a state name");
                      try {
                        const url = editingStateId !== null ? `/api/masters/state_master/${editingStateId}` : '/api/masters/state_master';
                        const method = editingStateId !== null ? 'PUT' : 'POST';
                        const res = await fetch(url, {
                          method,
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ module: activeModule, name: newStateName })
                        });
                        if (res.ok) {
                          toast.success(editingStateId !== null ? "State updated!" : "State added!");
                          setEditingStateId(null);
                          setNewStateName('');
                          fetchData();
                        }
                      } catch (err) {
                        toast.error("Failed to save state");
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 h-[42px] px-8 flex-1"
                  >
                    {editingStateId !== null ? 'Update' : 'Save'}
                  </Button>
                  {editingStateId !== null && (
                    <Button variant="secondary" className="h-[42px]" onClick={() => { setEditingStateId(null); setNewStateName(''); }}>Cancel</Button>
                  )}
                </div>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search State..." 
                  className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900"
                  value={stateSearch}
                  onChange={(e) => setStateSearch(e.target.value)}
                />
              </div>

              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100">
                      <th className="px-6 py-4 text-sm font-bold text-zinc-900 w-24">ID</th>
                      <th className="px-6 py-4 text-sm font-bold text-zinc-900">State Name</th>
                      <th className="px-6 py-4 text-sm font-bold text-zinc-900 text-center w-48">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {stateMasterList
                      .filter(s => String(s.name || '').toLowerCase().includes(stateSearch.toLowerCase()))
                      .map((state) => (
                        <tr key={state.id} className="hover:bg-zinc-50/50">
                          <td className="px-6 py-4 text-sm text-zinc-600">{state.id}</td>
                          <td className="px-6 py-4 text-sm font-medium text-zinc-900">{state.name}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => {
                                  setEditingStateId(state.id);
                                  setNewStateName(state.name);
                                }}
                                className="px-4 py-1.5 bg-amber-400 text-white rounded font-medium text-sm hover:bg-amber-500 transition-colors"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={async () => {
                                  if (confirm(`Delete ${state.name}?`)) {
                                    try {
                                      const res = await fetch(`/api/masters/state_master/${state.id}`, { method: 'DELETE' });
                                      if (res.ok) {
                                        toast.success("State deleted");
                                        fetchData();
                                      }
                                    } catch (err) {
                                      toast.error("Failed to delete state");
                                    }
                                  }
                                }}
                                className="px-4 py-1.5 bg-red-500 text-white rounded font-medium text-sm hover:bg-red-600 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'districts' && (
          <motion.div 
            key="districts"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="p-4 md:p-8">
              <h3 className="text-xl font-bold text-zinc-900 mb-6">District Master</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:items-end mb-8 text-left">
                <Select 
                  label="Select State" 
                  value={newDistrictState} 
                  onChange={(e: any) => setNewDistrictState(e.target.value)}
                  options={INDIAN_STATES.map(s => ({ value: s, label: s }))}
                />
                <Input 
                  label="Enter District Name" 
                  placeholder="Enter District Name"
                  value={newDistrictName}
                  onChange={(e: any) => setNewDistrictName(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={async () => {
                      if (!newDistrictName.trim()) return toast.error("Please enter a district name");
                      try {
                        const url = editingDistrictId !== null ? `/api/masters/district_master/${editingDistrictId}` : '/api/masters/district_master';
                        const method = editingDistrictId !== null ? 'PUT' : 'POST';
                        const res = await fetch(url, {
                          method,
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ module: activeModule, state: newDistrictState, name: newDistrictName })
                        });
                        if (res.ok) {
                          toast.success(editingDistrictId !== null ? "District updated!" : "District added!");
                          setEditingDistrictId(null);
                          setNewDistrictName('');
                          fetchData();
                        }
                      } catch (err) {
                        toast.error("Failed to save district");
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 h-[42px] px-8 flex-1"
                  >
                    {editingDistrictId !== null ? 'Update' : 'Save'}
                  </Button>
                  {editingDistrictId !== null && (
                    <Button variant="secondary" className="h-[42px]" onClick={() => { setEditingDistrictId(null); setNewDistrictName(''); }}>Cancel</Button>
                  )}
                </div>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search District..." 
                  className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900"
                  value={districtSearch}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                />
              </div>

              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100">
                      <th className="px-6 py-4 text-sm font-bold text-zinc-900 w-24">ID</th>
                      <th className="px-6 py-4 text-sm font-bold text-zinc-900">State</th>
                      <th className="px-6 py-4 text-sm font-bold text-zinc-900">District Name</th>
                      <th className="px-6 py-4 text-sm font-bold text-zinc-900 text-center w-48">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {districtMasterList
                      .filter(d => String(d.name || '').toLowerCase().includes(districtSearch.toLowerCase()))
                      .map((district) => (
                        <tr key={district.id} className="hover:bg-zinc-50/50">
                          <td className="px-6 py-4 text-sm text-zinc-600">{district.id}</td>
                          <td className="px-6 py-4 text-sm text-zinc-600 font-medium">{district.state}</td>
                          <td className="px-6 py-4 text-sm font-bold text-zinc-900">{district.name}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => {
                                  setEditingDistrictId(district.id);
                                  setNewDistrictName(district.name);
                                  setNewDistrictState(district.state);
                                }}
                                className="px-4 py-1.5 bg-amber-400 text-white rounded font-medium text-sm hover:bg-amber-500 transition-colors"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={async () => {
                                  if (confirm(`Delete ${district.name}?`)) {
                                    try {
                                      const res = await fetch(`/api/masters/district_master/${district.id}`, { method: 'DELETE' });
                                      if (res.ok) {
                                        toast.success("District deleted");
                                        fetchData();
                                      }
                                    } catch (err) {
                                      toast.error("Failed to delete district");
                                    }
                                  }
                                }}
                                className="px-4 py-1.5 bg-red-500 text-white rounded font-medium text-sm hover:bg-red-600 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'staff' && (
          <motion.div 
            key="staff"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Elegant Sub-tabs for Staff section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-200 pb-2 gap-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStaffSubTab('accounts')}
                  className={cn(
                    "px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200",
                    staffSubTab === 'accounts'
                      ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/10"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50"
                  )}
                >
                  Staff Portal Accounts
                </button>
                <button
                  type="button"
                  onClick={() => setStaffSubTab('directory')}
                  className={cn(
                    "px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200",
                    staffSubTab === 'directory'
                      ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/10"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50"
                  )}
                >
                  Staff Field Profiles
                </button>
              </div>

              <div className="text-sm font-medium text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200/50">
                Module: <span className="font-bold text-zinc-900">{activeModule === 'Hospital' ? 'Hospital' : 'Sugar & Dairy'}</span>
              </div>
            </div>

            {staffSubTab === 'accounts' ? (
              <Card>
                <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-zinc-900">Staff Portal Accounts</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Database storage for system login details and credentials.</p>
                  </div>
                  <Button 
                    onClick={() => { setEditingStaff(null); setShowStaffModal(true); }}
                    className="bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center shadow-md shadow-zinc-900/10"
                  >
                    <PlusCircle size={16} className="mr-2" />
                    Create Staff Account
                  </Button>
                </div>
                
                <div className="p-6">
                  {staffAccounts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {staffAccounts.map((staff) => (
                        <div key={staff.id} className="flex items-center justify-between p-4 rounded-2xl border border-zinc-150 bg-white shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-300">
                          <div>
                            <p className="font-bold text-zinc-900 flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              {staff.name}
                            </p>
                            <p className="text-xs text-zinc-500 font-medium mt-1">Username / Login ID: <span className="text-zinc-800 font-mono font-bold">{staff.username}</span></p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-zinc-500 font-medium">Password:</span>
                              <span className="text-xs font-mono font-bold bg-zinc-100 px-2.5 py-0.5 rounded text-zinc-700">
                                {viewPasswordId === staff.id ? staff.password : "••••••••"}
                              </span>
                              <button 
                                type="button"
                                onClick={() => setViewPasswordId(viewPasswordId === staff.id ? null : staff.id)}
                                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 ml-1 bg-emerald-50 px-2 py-0.5 rounded transition-colors"
                              >
                                {viewPasswordId === staff.id ? "Hide" : "View"}
                              </button>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              type="button"
                              onClick={() => { setEditingStaff(staff); setShowStaffModal(true); }}
                              className="p-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all shadow-sm border border-zinc-200 bg-white"
                              title="Edit Credentials"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDeleteStaff(staff.id)}
                              className="p-2.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all shadow-sm border border-zinc-200 bg-white"
                              title="Delete Account"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
                      <Users className="mx-auto mb-3 opacity-20 text-zinc-400" size={44} />
                      <p className="text-sm font-bold text-zinc-900">No Portal Staff Accounts Found in {activeModule}</p>
                      <p className="text-xs text-zinc-500 mt-1.5 max-w-sm mx-auto">Create a login profile in Supabase to authorize staff to access messaging automation features.</p>
                      <Button 
                        onClick={() => { setEditingStaff(null); setShowStaffModal(true); }}
                        className="bg-emerald-600 hover:bg-emerald-700 mt-4 shadow-sm"
                      >
                        <Plus size={16} className="mr-1.5" /> Direct Create Now
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card>
                <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-zinc-900">Staff Field Profiles</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Directory list of active field personnel and directory profiles.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      onClick={() => {
                        setEditingEntry(null);
                        setModalEntryType('Staff');
                        setShowAddModal(true);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center shadow-sm"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Field Staff
                    </Button>
                    <Button variant="secondary" className="flex items-center justify-center" onClick={() => exportData(filteredEntries.filter(e => e.type === 'Staff'), 'Staff_List')}>Export list</Button>
                  </div>
                </div>
                <div className="overflow-x-auto font-sans">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-100">
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Staff Name</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Role/Department</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredEntries.filter(e => e.type === 'Staff').map((entry: any) => (
                        <tr key={entry.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm">
                                {entry.name.charAt(0)}
                              </div>
                              <span className="text-sm font-bold text-zinc-900">{entry.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-600 font-mono">{entry.phone}</td>
                          <td className="px-6 py-4 text-sm text-zinc-600 font-medium">{entry.department || entry.bmc_dpmc || 'Staff'}</td>
                          <td className="px-6 py-4 text-sm text-zinc-600">{entry.village}, {entry.block}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                               <button onClick={() => { setEditingEntry(entry); setShowAddModal(true); }} className="p-2 text-zinc-400 hover:text-zinc-900 shadow-sm border border-zinc-100 rounded bg-white hover:border-zinc-250"><Edit size={16} /></button>
                                <button 
                                  onClick={async () => {
                                    if (confirm(`Delete staff member ${entry.name}?`)) {
                                      await fetch(`/api/${activeModule.toLowerCase()}/entries/${entry.id}`, { method: 'DELETE' });
                                      toast.success("Staff profile deleted");
                                      fetchData();
                                    }
                                  }}
                                  className="p-2 text-zinc-400 hover:text-red-650 shadow-sm border border-zinc-100 rounded bg-white hover:border-red-200"
                                >
                                  <Trash2 size={16} />
                                </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredEntries.filter(e => e.type === 'Staff').length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-16 text-center text-zinc-500 bg-zinc-50/20">
                            <Users className="mx-auto mb-2 opacity-20 text-zinc-400" size={32} />
                            <p className="text-sm font-medium text-zinc-500">No staff field profiles found in current module.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {activeTab === 'user-reports' && (
          <motion.div 
            key="user-reports"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Overview</h3>
                <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                  {activeModule === 'Dairy' ? '🚜 Farmer Analytical Report' : '📋 User Report (Village to Pincode)'}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                 <Button variant="secondary" onClick={() => exportData(filteredReportEntries, `${activeModule}_Report`)}>
                   <Download className="mr-2" size={16} /> Export CSV
                 </Button>
              </div>
            </div>

            <Card className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 lg:items-end text-left">
                <Input 
                  label="Village" 
                  value={reportFilters.village} 
                  onChange={(e: any) => setReportFilters({ ...reportFilters, village: e.target.value })} 
                  placeholder="Village..." 
                />
                <Input 
                  label="Post" 
                  value={reportFilters.post} 
                  onChange={(e: any) => setReportFilters({ ...reportFilters, post: e.target.value })} 
                  placeholder="Post..." 
                />
                <Select 
                  label="State" 
                  value={reportFilters.state} 
                  onChange={(e: any) => setReportFilters({ ...reportFilters, state: e.target.value })} 
                  options={[
                    { value: '', label: 'Select State' },
                    ...INDIAN_STATES.map(s => ({ value: s, label: s }))
                  ]}
                />
                <Input 
                  label="District" 
                  value={reportFilters.district} 
                  onChange={(e: any) => setReportFilters({ ...reportFilters, district: e.target.value })} 
                  placeholder="District" 
                />
                <Input 
                  label="Block" 
                  value={reportFilters.block} 
                  onChange={(e: any) => setReportFilters({ ...reportFilters, block: e.target.value })} 
                  placeholder="Block" 
                />
                <Input 
                  label="Pincode" 
                  value={reportFilters.pincode} 
                  onChange={(e: any) => setReportFilters({ ...reportFilters, pincode: e.target.value })} 
                  placeholder="Pincode" 
                />
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Input 
                      label={activeModule === 'Hospital' ? "Search Name/Phone" : "Search (Name/Phone)"}
                      value={reportFilters.search} 
                      onChange={(e: any) => setReportFilters({ ...reportFilters, search: e.target.value })} 
                      placeholder={activeModule === 'Hospital' ? "Type name or phone..." : "Type to search..."} 
                    />
                  </div>
                  <button 
                    onClick={() => setReportFilters({ village: '', post: '', state: '', district: '', block: '', pincode: '', search: '' })}
                    className="p-2 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-zinc-200 transition-all mb-0.5 h-[42px]"
                    title="Reset Filters"
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>
              </div>
            </Card>

            <Card className="p-0 overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-zinc-50 border-b border-zinc-100">
                       <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">ID</th>
                       <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                         {activeModule === 'Dairy' ? 'Farmer Details' : 'Patient Details'}
                       </th>
                       {activeModule === 'Dairy' && (
                         <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Age</th>
                       )}
                       <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Full Address (V-P-B-D-S-PIN)</th>
                       <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                         {activeModule === 'Dairy' ? 'Remarks' : 'Doctor'}
                       </th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-100">
                     {filteredReportEntries.map((entry, idx) => (
                       <tr key={entry.id} className="hover:bg-zinc-50/50">
                         <td className="px-6 py-4 text-sm font-mono text-zinc-400">#{idx + 1001}</td>
                         <td className="px-6 py-4">
                           <p className="text-sm font-bold text-zinc-900">{entry.name}</p>
                           <p className="text-xs text-zinc-500 font-mono">{entry.phone}</p>
                         </td>
                         {activeModule === 'Dairy' && (
                           <td className="px-6 py-4 text-sm text-zinc-600">{entry.age}</td>
                         )}
                         <td className="px-6 py-4 text-sm text-zinc-600">
                           {entry.village} - {(entry as any).post || '-'} - {entry.block} - {entry.district} - {entry.state} - {entry.pincode}
                         </td>
                         <td className="px-6 py-4 text-sm text-zinc-600">
                           {activeModule === 'Dairy' ? 'Verified' : (entry as HospitalEntry).doctor || '-'}
                         </td>
                       </tr>
                     ))}
                     {filteredReportEntries.length === 0 && (
                       <tr>
                         <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                           No records found matching the filters.
                         </td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'blocks' && (
          <motion.div 
            key="blocks"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="p-4 md:p-8">
              <h3 className="text-xl font-bold text-zinc-900 mb-6">Block Master</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:items-end mb-8 text-left">
                <div>
                  <Select 
                    label="Select District" 
                    value={newBlockDistrict} 
                    onChange={(e: any) => setNewBlockDistrict(e.target.value)}
                    options={[
                      { value: '', label: 'Select District' },
                      ...districtMasterList.map(d => ({ value: d.name, label: d.name }))
                    ]}
                  />
                </div>
                <div>
                  <Input 
                    label="Block Name" 
                    placeholder="Enter Block Name"
                    value={newBlockName}
                    onChange={(e: any) => setNewBlockName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={async () => {
                      if (!newBlockName.trim() || !newBlockDistrict) return toast.error("Please fill all fields");
                      try {
                        const url = editingBlockId !== null ? `/api/masters/block_master/${editingBlockId}` : '/api/masters/block_master';
                        const method = editingBlockId !== null ? 'PUT' : 'POST';
                        const res = await fetch(url, {
                          method,
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ module: activeModule, district: newBlockDistrict, name: newBlockName })
                        });
                        if (res.ok) {
                          toast.success(editingBlockId !== null ? "Block updated!" : "Block added!");
                          setEditingBlockId(null);
                          setNewBlockName('');
                          fetchData();
                        }
                      } catch (err) {
                        toast.error("Failed to save block");
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 h-[42px] px-8 flex-1"
                  >
                    {editingBlockId !== null ? 'Update' : 'Save'}
                  </Button>
                  {editingBlockId !== null && (
                    <Button variant="secondary" className="h-[42px]" onClick={() => { setEditingBlockId(null); setNewBlockName(''); }}>Cancel</Button>
                  )}
                </div>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search Block..." 
                  className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900"
                  value={blockSearch}
                  onChange={(e) => setBlockSearch(e.target.value)}
                />
              </div>

              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100">
                      <th className="px-6 py-4 text-sm font-bold text-zinc-900 w-24">ID</th>
                      <th className="px-6 py-4 text-sm font-bold text-zinc-900">District</th>
                      <th className="px-6 py-4 text-sm font-bold text-zinc-900">Block</th>
                      <th className="px-6 py-4 text-sm font-bold text-zinc-900 text-center w-48">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {blockMasterList
                      .filter(b => String(b.name || '').toLowerCase().includes(blockSearch.toLowerCase()))
                      .map((block) => (
                        <tr key={block.id} className="hover:bg-zinc-50/50">
                          <td className="px-6 py-4 text-sm text-zinc-600">{block.id}</td>
                          <td className="px-6 py-4 text-sm text-zinc-600 font-medium">{block.district}</td>
                          <td className="px-6 py-4 text-sm font-bold text-zinc-900">{block.name}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => {
                                  setEditingBlockId(block.id);
                                  setNewBlockName(block.name);
                                  setNewBlockDistrict(block.district);
                                }}
                                className="px-4 py-1.5 bg-amber-400 text-white rounded font-medium text-sm hover:bg-amber-500 transition-colors"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={async () => {
                                  if (confirm(`Delete ${block.name}?`)) {
                                    try {
                                      const res = await fetch(`/api/masters/block_master/${block.id}`, { method: 'DELETE' });
                                      if (res.ok) {
                                        toast.success("Block deleted");
                                        fetchData();
                                      }
                                    } catch (err) {
                                      toast.error("Failed to delete block");
                                    }
                                  }
                                }}
                                className="px-4 py-1.5 bg-red-500 text-white rounded font-medium text-sm hover:bg-red-600 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'posts' && (
          <motion.div 
            key="posts"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="p-4 md:p-8">
              <h3 className="text-xl font-bold text-zinc-900 mb-6">Post Office Master</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:items-end mb-8 text-left">
                <Select 
                  label="Select State" 
                  value={newPostState} 
                  onChange={(e: any) => setNewPostState(e.target.value)}
                  options={[
                    { value: '', label: 'Select State' },
                    ...INDIAN_STATES.map(s => ({ value: s, label: s }))
                  ]}
                />
                <Select 
                  label="Select District" 
                  value={newPostDistrict} 
                  onChange={(e: any) => setNewPostDistrict(e.target.value)}
                  options={[
                    { value: '', label: 'Select District' },
                    ...districtMasterList.map(d => ({ value: d.name, label: d.name }))
                  ]}
                />
                <Input 
                  label="Post Name" 
                  placeholder="Post Name"
                  value={newPostName}
                  onChange={(e: any) => setNewPostName(e.target.value)}
                />
                <Input 
                  label="Pincode" 
                  placeholder="Pincode"
                  value={newPostPincode}
                  onChange={(e: any) => setNewPostPincode(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={async () => {
                      if (!newPostName.trim() || !newPostState || !newPostDistrict || !newPostPincode) return toast.error("Please fill all fields");
                      try {
                        const url = editingPostId !== null ? `/api/masters/post_master/${editingPostId}` : '/api/masters/post_master';
                        const method = editingPostId !== null ? 'PUT' : 'POST';
                        const res = await fetch(url, {
                          method,
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ module: activeModule, state: newPostState, district: newPostDistrict, name: newPostName, pincode: newPostPincode })
                        });
                        if (res.ok) {
                          toast.success(editingPostId !== null ? "Post updated!" : "Post added!");
                          setEditingPostId(null);
                          setNewPostName('');
                          setNewPostPincode('');
                          fetchData();
                        }
                      } catch (err) {
                        toast.error("Failed to save post");
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 h-[42px] px-8 flex-1"
                  >
                    {editingPostId !== null ? 'Update' : 'Save'}
                  </Button>
                  {editingPostId !== null && (
                    <Button variant="secondary" className="h-[42px]" onClick={() => { setEditingPostId(null); setNewPostName(''); setNewPostPincode(''); }}>Cancel</Button>
                  )}
                </div>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search Post / District / Pincode..." 
                  className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900"
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                />
              </div>

              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100">
                      <th className="px-6 py-4 text-sm font-bold text-zinc-900 w-24">ID</th>
                      <th className="px-6 py-4 text-sm font-bold text-zinc-900">State</th>
                      <th className="px-6 py-4 text-sm font-bold text-zinc-900">District</th>
                      <th className="px-6 py-4 text-sm font-bold text-zinc-900">Post</th>
                      <th className="px-6 py-4 text-sm font-bold text-zinc-900">Pincode</th>
                      <th className="px-6 py-4 text-sm font-bold text-zinc-900 text-center w-48">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {postMasterList
                      .filter(p => 
                        String(p.name || '').toLowerCase().includes(postSearch.toLowerCase()) || 
                        String(p.district || '').toLowerCase().includes(postSearch.toLowerCase()) ||
                        String(p.pincode || '').includes(postSearch)
                      )
                      .map((post) => (
                        <tr key={post.id} className="hover:bg-zinc-50/50">
                          <td className="px-6 py-4 text-sm text-zinc-600">{post.id}</td>
                          <td className="px-6 py-4 text-sm text-zinc-600 font-medium">{post.state}</td>
                          <td className="px-6 py-4 text-sm text-zinc-600 font-medium">{post.district}</td>
                          <td className="px-6 py-4 text-sm font-bold text-zinc-900">{post.name}</td>
                          <td className="px-6 py-4 text-sm text-zinc-600">{post.pincode}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => {
                                  setEditingPostId(post.id);
                                  setNewPostName(post.name);
                                  setNewPostState(post.state);
                                  setNewPostDistrict(post.district);
                                  setNewPostPincode(post.pincode);
                                }}
                                className="px-4 py-1.5 bg-amber-400 text-white rounded font-medium text-sm hover:bg-amber-500 transition-colors"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={async () => {
                                  if (confirm(`Delete ${post.name}?`)) {
                                    try {
                                      const res = await fetch(`/api/masters/post_master/${post.id}`, { method: 'DELETE' });
                                      if (res.ok) {
                                        toast.success("Post deleted");
                                        fetchData();
                                      }
                                    } catch (err) {
                                      toast.error("Failed to delete post");
                                    }
                                  }
                                }}
                                className="px-4 py-1.5 bg-red-500 text-white rounded font-medium text-sm hover:bg-red-600 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'villages' && (
          <motion.div 
            key="villages"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="p-4 md:p-8">
              <h3 className="text-xl font-bold text-zinc-900 mb-6">Village Master</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:items-end mb-8 text-left">
                <Select 
                  label="Select State" 
                  value={newVillageState} 
                  onChange={(e: any) => setNewVillageState(e.target.value)}
                  options={INDIAN_STATES.map(s => ({ value: s, label: s }))}
                />
                <Select 
                  label="Select District" 
                  value={newVillageDistrict} 
                  onChange={(e: any) => setNewVillageDistrict(e.target.value)}
                  options={[
                    { value: '', label: 'Select District' },
                    ...districtMasterList.map(d => ({ value: d.name, label: d.name }))
                  ]}
                />
                <Select 
                  label="Select Block" 
                  value={newVillageBlock} 
                  onChange={(e: any) => setNewVillageBlock(e.target.value)}
                  options={[
                    { value: '', label: 'Select Block' },
                    ...blockMasterList.map(b => ({ value: b.name, label: b.name }))
                  ]}
                />
                <Input 
                  label="Village Name" 
                  placeholder="Enter Village Name"
                  value={newVillageName}
                  onChange={(e: any) => setNewVillageName(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={async () => {
                      if (!newVillageName.trim()) return toast.error("Please enter a village name");
                      try {
                        const url = editingVillageId !== null ? `/api/masters/village_master/${editingVillageId}` : '/api/masters/village_master';
                        const method = editingVillageId !== null ? 'PUT' : 'POST';
                        const res = await fetch(url, {
                          method,
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            module: activeModule, 
                            state: newVillageState, 
                            district: newVillageDistrict, 
                            block: newVillageBlock, 
                            name: newVillageName 
                          })
                        });
                        if (res.ok) {
                          toast.success(editingVillageId !== null ? "Village updated!" : "Village added!");
                          setEditingVillageId(null);
                          setNewVillageName('');
                          fetchData();
                        }
                      } catch (err) {
                        toast.error("Failed to save village");
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 h-[42px] px-8 flex-1"
                  >
                    {editingVillageId !== null ? 'Update' : 'Save'}
                  </Button>
                  {editingVillageId !== null && (
                    <Button variant="secondary" className="h-[42px]" onClick={() => { setEditingVillageId(null); setNewVillageName(''); }}>Cancel</Button>
                  )}
                </div>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search Village / Block / District..." 
                  className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900"
                  value={villageSearch}
                  onChange={(e) => setVillageSearch(e.target.value)}
                />
              </div>

              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100">
                      <th className="px-6 py-4 text-sm font-bold text-zinc-900 w-24">ID</th>
                      <th className="px-6 py-4 text-sm font-bold text-zinc-900">Block</th>
                      <th className="px-6 py-4 text-sm font-bold text-zinc-900">District</th>
                      <th className="px-6 py-4 text-sm font-bold text-zinc-900">Village</th>
                      <th className="px-6 py-4 text-sm font-bold text-zinc-900 text-center w-48">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {villageMasterList
                      .filter(v => 
                        String(v.name || '').toLowerCase().includes(villageSearch.toLowerCase()) || 
                        String(v.block || '').toLowerCase().includes(villageSearch.toLowerCase()) ||
                        String(v.district || '').toLowerCase().includes(villageSearch.toLowerCase())
                      )
                      .map((vil) => (
                        <tr key={vil.id} className="hover:bg-zinc-50/50">
                          <td className="px-6 py-4 text-sm text-zinc-600">{vil.id}</td>
                          <td className="px-6 py-4 text-sm text-zinc-600 font-medium">{vil.block}</td>
                          <td className="px-6 py-4 text-sm text-zinc-600 font-medium">{vil.district}</td>
                          <td className="px-6 py-4 text-sm font-bold text-zinc-900">{vil.name}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => {
                                  setEditingVillageId(vil.id);
                                  setNewVillageName(vil.name);
                                  setNewVillageState(vil.state);
                                  setNewVillageDistrict(vil.district);
                                  setNewVillageBlock(vil.block);
                                }}
                                className="px-4 py-1.5 bg-amber-400 text-white rounded font-medium text-sm hover:bg-amber-500 transition-colors"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={async () => {
                                  if (confirm(`Delete ${vil.name}?`)) {
                                    try {
                                      const res = await fetch(`/api/masters/village_master/${vil.id}`, { method: 'DELETE' });
                                      if (res.ok) {
                                        toast.success("Village deleted");
                                        fetchData();
                                      }
                                    } catch (err) {
                                      toast.error("Failed to delete village");
                                    }
                                  }
                                }}
                                className="px-4 py-1.5 bg-red-500 text-white rounded font-medium text-sm hover:bg-red-600 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'upload-data' && (
          <motion.div 
            key="upload-data"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-8 border-dashed border-2 border-zinc-200 bg-zinc-50/50">
                <div className="text-center">
                  <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl text-white">
                    <Upload size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-2">Import CSV or Excel</h3>
                  <p className="text-zinc-500 mb-8 max-w-sm mx-auto text-sm">Upload your CSV or Excel file to bulk import registrations.</p>
                  
                  <div className="space-y-4 text-left">
                    <div 
                      className="border-2 border-dashed border-zinc-200 rounded-2xl p-8 hover:border-zinc-900 hover:bg-white transition-all cursor-pointer group text-center"
                      onClick={() => document.getElementById('csv_import')?.click()}
                    >
                      <input 
                        type="file" 
                        id="csv_import" 
                        className="hidden" 
                        accept=".csv, .xlsx, .xls" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setImportingFile(file);
                        }}
                      />
                      <Upload className={cn("mx-auto transition-colors mb-4", importingFile ? "text-emerald-500" : "text-zinc-300 group-hover:text-zinc-900")} size={32} />
                      <p className="text-xs font-bold text-zinc-900 mb-1">
                        {importingFile ? importingFile.name : "Click or drag file to upload"}
                      </p>
                    </div>
                    
                        <div className="flex gap-4">
                           <Button variant="secondary" className="flex-1 text-xs" onClick={() => {
                             const sampleRow = {
                               "ID": "1",
                               "Name": "Example Name",
                               "Father / Husband": "Example Guardian",
                               "Phone": "919999999999",
                               "DOB": "1990-01-01",
                               "Anniversary": "2015-05-20",
                               "Age": "34",
                               "Village": "Example Village",
                               "Block": "Example Block",
                               "Department": activeModule === 'Hospital' ? "General" : "Milk",
                               "District": "Basti",
                               "Post": "Example Post",
                               "Pincode": "272001",
                               "Doctor": activeModule === 'Hospital' ? "Dr. Example" : "N/A"
                             };
                             exportData([sampleRow], "Sample_Format");
                           }}>Sample Format</Button>
                           <Button className="flex-1 text-xs" onClick={handleExcelImport} disabled={!importingFile}>Import File</Button>
                        </div>
                  </div>
                </div>
              </Card>

              <Card className="p-8 bg-white border border-zinc-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">Paste Raw Data</h3>
                    <p className="text-xs text-zinc-500">Paste text records directly (Tab separated)</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <textarea 
                    className="w-full h-[180px] p-4 text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                    placeholder="Paste your records here...
Example format:
1035  9161114636  20-12-2025  Village Name  Block  District"
                    value={pasteData}
                    onChange={(e) => setPasteData(e.target.value)}
                  />
                  <Button 
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700"
                    onClick={parseAndUploadRawData}
                    disabled={!pasteData.trim()}
                  >
                    Process and Upload Raw Data
                  </Button>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <div className="flex items-start gap-4 text-left">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Users size={20} /></div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 mb-1">Data Quality Guidelines</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Records are automatically deduplicated by ID. If you paste data with existing IDs, the server will skip or merge them depending on current logic. Ensure the columns are roughly in order: ID, Phone, Date, Village, Block, District.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'export-data' && (
          <motion.div 
            key="export-data"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-8 group hover:border-zinc-900 transition-all bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Hospital size={80} />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                    <Hospital size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">Hospital Master Data</h3>
                  <p className="text-sm text-zinc-500 mb-8">Export all patient records including medical departments and doctor info.</p>
                  <Button variant="secondary" className="w-full" onClick={() => exportData(hospitalEntries, 'Hospital_Master_Data')}>
                    <Download className="inline-block mr-2" size={16} />
                    Download CSV
                  </Button>
                </div>
              </Card>

              <Card className="p-8 group hover:border-zinc-900 transition-all bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Milk size={80} />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                    <Milk size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">Dairy Master Data</h3>
                  <p className="text-sm text-zinc-500 mb-8">Export all farmer and customer records with BMC/DPMC mappings.</p>
                  <Button variant="secondary" className="w-full" onClick={() => exportData(dairyEntries, 'Dairy_Master_Data')}>
                    <Download className="inline-block mr-2" size={16} />
                    Download CSV
                  </Button>
                </div>
              </Card>

              <Card className="p-8 group hover:border-zinc-900 transition-all bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <MessageSquare size={80} />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                    <MessageSquare size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">Communication Logs</h3>
                  <p className="text-sm text-zinc-500 mb-8">Export full messaging history including delivery status and media shared.</p>
                  <Button variant="secondary" className="w-full" onClick={() => exportData(logs, 'Message_Logs_Export')}>
                    <Download className="inline-block mr-2" size={16} />
                    Download CSV
                  </Button>
                </div>
              </Card>

              <Card className="p-8 group hover:border-zinc-900 transition-all bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <MapPin size={80} />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                    <MapPin size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">Location Statistics</h3>
                  <p className="text-sm text-zinc-500 mb-8">Export distribution analysis by state, district, and village.</p>
                  <Button variant="secondary" className="w-full" onClick={() => exportData(districtMasterList, 'Location_Statistics')}>
                    <Download className="inline-block mr-2" size={16} />
                    Download Analysis
                  </Button>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto"
          >
            <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Institution Identity Card */}
              <Card className="p-8 bg-white shadow-sm border border-zinc-100 rounded-3xl">
                <h3 className="text-2xl font-bold text-zinc-900 mb-8">Institution Identity</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <p className="text-sm font-medium text-zinc-400">Logo</p>
                       <div className="w-32 h-32 border-2 border-dashed border-zinc-100 rounded-2xl flex items-center justify-center bg-zinc-50/50 mb-4 overflow-hidden relative group">
                          {settings.logo_url ? (
                            <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                          ) : (
                            <Hospital className="text-zinc-200" size={48} />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="text-white" size={24} />
                          </div>
                          <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = URL.createObjectURL(file);
                                setSettings({ ...settings, logo_url: url });
                              }
                            }}
                          />
                       </div>
                       <div className="flex items-center gap-2">
                         <input type="file" id="logo-upload" className="hidden" />
                         <label htmlFor="logo-upload" className="px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-50 cursor-pointer">
                           Choose File
                         </label>
                         <span className="text-xs text-zinc-400">No file chosen</span>
                       </div>
                    </div>

                    <div className="space-y-6">
                      <Input 
                        label="Institution Name" 
                        name="institution_name" 
                        value={settings.institution_name} 
                        onChange={(e: any) => setSettings({ ...settings, institution_name: e.target.value })}
                        placeholder="Enter Institution Name"
                      />
                      <Input 
                        label="Contact Number" 
                        name="contact_number" 
                        value={settings.contact_number} 
                        onChange={(e: any) => setSettings({ ...settings, contact_number: e.target.value })}
                        placeholder="Enter Contact Number"
                      />
                      <Input 
                        label="Email ID" 
                        name="email_id" 
                        value={settings.email_id || ''} 
                        onChange={(e: any) => setSettings({ ...settings, email_id: e.target.value })}
                        placeholder="Enter Email ID"
                      />
                      <Input 
                        label="Website (Optional)" 
                        name="website" 
                        value={settings.website || ''} 
                        onChange={(e: any) => setSettings({ ...settings, website: e.target.value })}
                        placeholder="Enter Website URL"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-600 mb-1">Full Address</p>
                    <textarea 
                      name="full_address"
                      value={settings.full_address}
                      onChange={(e) => setSettings({ ...settings, full_address: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-100 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all text-sm min-h-[120px] resize-none"
                      placeholder="Enter Full Address"
                    />
                  </div>
                </div>
              </Card>

              {/* General Settings Card */}
              <div className="space-y-8">
                <Card className="p-8 bg-white shadow-sm border border-zinc-100 rounded-3xl">
                  <h3 className="text-2xl font-bold text-zinc-900 mb-8">General Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-6">
                      <Input 
                        label="Hospital Name" 
                        name="hospital_name" 
                        value={settings.hospital_name} 
                        onChange={(e: any) => setSettings({ ...settings, hospital_name: e.target.value })}
                        placeholder="Enter Hospital Name"
                      />
                      <Input 
                        label="WhatsApp API Key" 
                        name="whatsapp_api_key" 
                        value={settings.whatsapp_api_key} 
                        onChange={(e: any) => setSettings({ ...settings, whatsapp_api_key: e.target.value })}
                        placeholder="Enter API Key"
                      />
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-4">
                        <p className="text-sm font-medium text-zinc-600">Auto Birthday Message</p>
                        <div 
                          onClick={() => setSettings({ ...settings, auto_birthday: !settings.auto_birthday })}
                          className={cn(
                            "w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300",
                            settings.auto_birthday ? "bg-emerald-500" : "bg-zinc-200"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                            settings.auto_birthday ? "translate-x-7" : "translate-x-1"
                          )}></div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm font-medium text-zinc-600">Auto Anniversary Message</p>
                        <div 
                          onClick={() => setSettings({ ...settings, auto_anniversary: !settings.auto_anniversary })}
                          className={cn(
                            "w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300",
                            settings.auto_anniversary ? "bg-emerald-500" : "bg-zinc-200"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                            settings.auto_anniversary ? "translate-x-7" : "translate-x-1"
                          )}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl text-lg font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">
                    Save Settings
                  </Button>
                </Card>

                {/* Staff Management Card */}
                <Card className="p-8 bg-white shadow-sm border border-zinc-100 rounded-3xl">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-zinc-900">Staff Management</h3>
                    <Button 
                      onClick={() => { setEditingStaff(null); setShowStaffModal(true); }}
                      className="bg-zinc-900 hover:bg-zinc-800"
                    >
                      <PlusCircle size={18} className="mr-2" />
                      Add Staff
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {staffAccounts.map((staff) => (
                      <div key={staff.id} className="flex items-center justify-between p-4 rounded-2xl border border-zinc-100 bg-zinc-50/50">
                        <div>
                          <p className="font-bold text-zinc-900">{staff.name}</p>
                          <p className="text-xs text-zinc-500">ID: {staff.username}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs font-mono text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                              {viewPasswordId === staff.id ? staff.password : "••••••••"}
                            </p>
                            <button 
                              type="button"
                              onClick={() => setViewPasswordId(viewPasswordId === staff.id ? null : staff.id)}
                              className="text-xs text-blue-600 hover:underline font-medium"
                            >
                              {viewPasswordId === staff.id ? "Hide" : "View"}
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => { setEditingStaff(staff); setShowStaffModal(true); }}
                            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-white rounded-lg transition-all"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDeleteStaff(staff.id)}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {staffAccounts.length === 0 && (
                      <div className="text-center py-8 text-zinc-400">
                        <Users className="mx-auto mb-2 opacity-20" size={40} />
                        <p className="text-sm">No regular staff accounts created yet.</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </form>
          </motion.div>
        )}
        </AnimatePresence>
      </main>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <h3 className="text-xl font-bold text-zinc-900">
                  {editingEntry ? `Edit ${activeModule === 'Hospital' ? 'Patient' : 'Entry'}` : `Add New ${activeModule === 'Hospital' ? 'Patient' : 'Entry'}`}
                </h3>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEntry(null);
                    setFormFiles({});
                  }} 
                  className="p-2 hover:bg-zinc-200 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddEntry} className="p-4 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <Select 
                    label="Entry Type" 
                    name="type"
                    value={modalEntryType}
                    onChange={(e: any) => setModalEntryType(e.target.value)}
                    options={activeModule === 'Hospital' ? [
                      { value: 'Patient', label: 'Patient' },
                      { value: 'Doctor', label: 'Doctor' },
                      { value: 'Staff', label: 'Staff' }
                    ] : [
                      { value: 'Farmer', label: 'Farmer' },
                      { value: 'Customer', label: 'Customer' },
                      { value: 'Staff', label: 'Staff' }
                    ]} 
                  />
                  <Input label="Full Name" name="name" defaultValue={editingEntry?.name} placeholder="Enter name" />
                  <Input label="Father / Husband Name" name="father_husband" defaultValue={editingEntry?.father_husband} placeholder="Enter father/husband name" />
                  <Input label="Phone Number" name="phone" defaultValue={editingEntry?.phone} placeholder="e.g. 919876543210" />
                  
                  <Input 
                    label="Pincode" 
                    name="pincode" 
                    defaultValue={editingEntry?.pincode} 
                    placeholder="6-digit Pincode" 
                    onChange={(e: any) => {
                      if (e.target.value.length === 6) fetchLocationByPincode(e.target.value);
                    }}
                  />

                  <ManualSelect 
                    label="City" 
                    name="city" 
                    value={locationData.city || editingEntry?.city || ''} 
                    onChange={(e: any) => setLocationData({ ...locationData, city: e.target.value })}
                    options={[
                      { value: '', label: 'Select City' },
                      ...Array.from(new Set([
                        ...(locationData.state === 'Uttar Pradesh' && locationData.district && UP_DISTRICTS_DATA[locationData.district]
                          ? UP_DISTRICTS_DATA[locationData.district].cities
                          : locationData.cities),
                        ...dynamicMaster.cities,
                        ...(editingEntry?.city ? [editingEntry.city] : [])
                      ])).map(c => ({ value: c, label: c }))
                    ]}
                  />

                  <ManualSelect 
                    label="State" 
                    name="state" 
                    value={locationData.state || editingEntry?.state || ''} 
                    onChange={(e: any) => {
                      const state = e.target.value;
                      setLocationData(prev => ({ 
                        ...prev, 
                        state, 
                        district: '', 
                        block: '',
                        city: '',
                        cities: [],
                        districts: state === 'Uttar Pradesh' ? Object.keys(UP_DISTRICTS_DATA) : [] 
                      }));
                    }}
                    options={[
                      { value: '', label: 'Select State' },
                      ...Array.from(new Set([...INDIAN_STATES, ...dynamicMaster.states])).map(s => ({ value: s, label: s }))
                    ]}
                  />

                  <Input label="Date of Birth" name="dob" defaultValue={editingEntry?.dob} type="date" />
                  <Input label="Anniversary" name="anniversary" defaultValue={editingEntry?.anniversary} type="date" />
                  <Input label="Age" name="age" defaultValue={editingEntry?.age} type="number" placeholder="Age" />
                  
                  <ManualSelect 
                    label="Village" 
                    name="village" 
                    value={locationData.village || editingEntry?.village || ''} 
                    onChange={(e: any) => setLocationData({ ...locationData, village: e.target.value })}
                    options={[
                      { value: '', label: 'Select Village' },
                      ...Array.from(new Set([
                        ...locationData.villages,
                        ...dynamicMaster.villages,
                        ...(editingEntry?.village ? [editingEntry.village] : [])
                      ])).map(v => ({ value: v, label: v }))
                    ]}
                  />

                  <ManualSelect 
                    label="Post" 
                    name="post" 
                    value={locationData.post || editingEntry?.post || ''} 
                    onChange={(e: any) => setLocationData({ ...locationData, post: e.target.value })}
                    options={[
                      { value: '', label: 'Select Post' },
                      ...Array.from(new Set([
                        ...locationData.villages, // Usually villages are posts in rural areas, but let's be safe
                        ...dynamicMaster.posts,
                        ...(editingEntry?.post ? [editingEntry.post] : [])
                      ])).map(p => ({ value: p, label: p }))
                    ]}
                  />

                  <ManualSelect 
                    label="Block" 
                    name="block" 
                    value={locationData.block || editingEntry?.block || ''} 
                    onChange={(e: any) => setLocationData({ ...locationData, block: e.target.value })}
                    options={[
                      { value: '', label: 'Select Block' },
                      ...Array.from(new Set([
                        ...(locationData.state === 'Uttar Pradesh' && locationData.district && UP_DISTRICTS_DATA[locationData.district]
                          ? UP_DISTRICTS_DATA[locationData.district].blocks
                          : locationData.blocks),
                        ...dynamicMaster.blocks,
                        ...(editingEntry?.block ? [editingEntry.block] : [])
                      ])).map(b => ({ value: b, label: b }))
                    ]}
                  />

                  <ManualSelect 
                    label="District" 
                    name="district" 
                    value={locationData.district || editingEntry?.district || ''} 
                    onChange={(e: any) => {
                      const dist = e.target.value;
                      setLocationData(prev => ({ 
                        ...prev, 
                        district: dist,
                        block: '',
                        city: '',
                        blocks: (prev.state === 'Uttar Pradesh' && UP_DISTRICTS_DATA[dist]) ? UP_DISTRICTS_DATA[dist].blocks : prev.blocks,
                        cities: (prev.state === 'Uttar Pradesh' && UP_DISTRICTS_DATA[dist]) ? UP_DISTRICTS_DATA[dist].cities : prev.cities
                      }));
                    }}
                    options={[
                      { value: '', label: 'Select District' },
                      ...Array.from(new Set([
                        ...(locationData.state === 'Uttar Pradesh' ? Object.keys(UP_DISTRICTS_DATA) : locationData.districts),
                        ...dynamicMaster.districts,
                        ...(editingEntry?.district ? [editingEntry.district] : [])
                      ])).map(d => ({ value: d, label: d }))
                    ]}
                  />

                  {activeModule === 'Hospital' ? (
                    <>
                      <ManualSelect 
                        label="Doctor Name" 
                        name="doctor" 
                        defaultValue={editingEntry?.doctor} 
                        placeholder="Dr. Name" 
                        options={Array.from(new Set([
                          'Dr. Gupta', 'Dr. Singh', 'Dr. Mehta',
                          ...hospitalEntries.map(e => e.doctor).filter(Boolean)
                        ])).map(d => ({ value: d, label: d }))}
                      />
                      <ManualSelect 
                        label="Department" 
                        name="department" 
                        defaultValue={editingEntry?.department} 
                        placeholder="Cardiology, etc." 
                        options={Array.from(new Set([
                          'Cardiology', 'Orthopedics', 'Pediatrics',
                          ...hospitalEntries.map(e => e.department).filter(Boolean)
                        ])).map(d => ({ value: d, label: d }))}
                      />
                      <FileInput 
                        label="Upload Photo" 
                        name="photo_input" 
                        accept="image/*" 
                        onChange={(base64: string) => setFormFiles(prev => ({ ...prev, photo: base64 }))} 
                        required={false}
                      />
                      <FileInput 
                        label="Upload ID Card" 
                        name="id_card_input" 
                        accept="image/*,application/pdf" 
                        onChange={(base64: string) => setFormFiles(prev => ({ ...prev, id_card: base64 }))} 
                        required={false}
                      />
                    </>
                  ) : (
                    <>
                      <ManualSelect 
                        label="BMC / DPMC" 
                        name="bmc_dpmc" 
                        defaultValue={editingEntry?.bmc_dpmc} 
                        placeholder="BMC/DPMC Name" 
                        options={Array.from(new Set([
                          'BMC North', 'DPMC South', 'Staff HQ',
                          ...dairyEntries.map(e => e.bmc_dpmc).filter(Boolean)
                        ])).map(b => ({ value: b, label: b }))}
                      />
                      <Input label="Aadhar Number" name="aadhar" defaultValue={editingEntry?.aadhar} placeholder="12-digit Aadhar" />
                      <FileInput 
                        label="Upload Photo" 
                        name="photo_input_dairy" 
                        accept="image/*" 
                        onChange={(base64: string) => setFormFiles(prev => ({ ...prev, photo: base64 }))} 
                        required={false}
                      />
                      <FileInput 
                        label="Upload Aadhaar Card" 
                        name="aadhaar_card_input" 
                        accept="image/*,application/pdf" 
                        onChange={(base64: string) => setFormFiles(prev => ({ ...prev, aadhaar_card: base64 }))} 
                        required={false}
                      />
                    </>
                  )}
                  <Input 
                    label={modalEntryType === 'Staff' ? "Staff Login Password" : "Login Password (Optional)"}
                    name="password" 
                    type="password"
                    defaultValue={editingEntry?.password} 
                    placeholder="Enter login password" 
                    required={modalEntryType === 'Staff'}
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingEntry(null);
                      setFormFiles({});
                      setLocationData({ city: '', state: '', district: '', block: '', village: '', post: '', cities: [], districts: [], blocks: [], villages: [] });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">{editingEntry ? 'Update Entry' : 'Save Entry'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTemplatePicker && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                <div>
                  <h3 className="font-bold text-zinc-900">Send {showTemplatePicker.type} Wish</h3>
                  <p className="text-xs text-zinc-500">To: {showTemplatePicker.name} ({showTemplatePicker.phone})</p>
                </div>
                <button onClick={() => setShowTemplatePicker(null)} className="p-2 hover:bg-zinc-200 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Select Template</p>
                <div className="grid gap-3">
                  {templates
                    .filter(t => t.type === showTemplatePicker.type || t.type === 'Custom')
                    .map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          const msg = t.content.replace('{{name}}', showTemplatePicker.name);
                          sendWhatsApp(showTemplatePicker.phone, msg, showTemplatePicker.name);
                          setShowTemplatePicker(null);
                        }}
                        className="text-left p-4 border border-zinc-100 rounded-xl hover:border-zinc-900 hover:bg-zinc-50 transition-all group"
                      >
                        <p className="text-xs font-bold text-zinc-400 mb-1">{t.name}</p>
                        <p className="text-sm text-zinc-600 line-clamp-2">{t.content.replace('{{name}}', showTemplatePicker.name)}</p>
                      </button>
                    ))}
                </div>

                <div className="pt-4 border-t border-zinc-100">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Attach Media (Optional)</p>
                  <div className="flex flex-wrap gap-2">
                    {mediaItems.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => setSelectedMediaId(selectedMediaId === item.id ? null : item.id)}
                        className={cn(
                          "relative w-14 h-14 bg-white border rounded-lg overflow-hidden cursor-pointer transition-all group",
                          selectedMediaId === item.id ? "border-zinc-900 ring-2 ring-zinc-900/10" : "border-zinc-200"
                        )}
                      >
                        {item.type.startsWith('image') ? (
                          <img src={item.data} className="w-full h-full object-cover" alt="" />
                        ) : item.type.startsWith('video') ? (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">
                            <Video size={18} />
                          </div>
                        ) : item.type.includes('pdf') ? (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-red-400">
                            <FileText size={18} />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">
                            <BarChart3 size={18} />
                          </div>
                        )}
                        <button 
                          onClick={(e) => handleDeleteMedia(item.id, e)}
                          className="absolute top-0 right-0 p-1 bg-red-500 text-white transition-opacity shadow-sm rounded-bl-lg"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <label className="w-14 h-14 bg-white border border-zinc-200 border-dashed rounded-lg flex items-center justify-center text-zinc-300 hover:text-zinc-900 cursor-pointer transition-all">
                      <PlusCircle size={18} />
                      <input type="file" className="hidden" accept="image/*,video/*,.gif,application/pdf" onChange={handleMediaUpload} />
                    </label>
                  </div>
                  {selectedMediaId && (
                    <p className="mt-2 text-[10px] text-zinc-500 italic">
                      Note: Message copied to clipboard! Paste it as a caption after attaching the file in WhatsApp.
                    </p>
                  )}
                </div>
              </div>
              <div className="p-6 bg-zinc-50 border-t border-zinc-100">
                <Button 
                  onClick={() => {
                    const msg = `Happy ${showTemplatePicker.type} ${showTemplatePicker.name}!`;
                    sendWhatsApp(showTemplatePicker.phone, msg, showTemplatePicker.name);
                    setShowTemplatePicker(null);
                  }}
                  className="w-full py-3"
                >
                  Send Default Wish
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStaffModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="font-bold text-zinc-900 text-lg">
                  {editingStaff ? 'Edit Staff Account' : 'Add Staff Account'}
                </h3>
                <button onClick={() => setShowStaffModal(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-all text-zinc-400">
                  <X size={24} />
                </button>
              </div>
              <form 
                key={editingStaff ? `edit-staff-${editingStaff.id}` : 'new-staff-form'}
                onSubmit={handleSaveStaff} 
                className="p-8 space-y-6"
              >
                <Input 
                  label="Staff Full Name" 
                  name="name" 
                  defaultValue={editingStaff?.name} 
                  placeholder="Enter staff name" 
                  required
                />
                <Input 
                  label="Staff Login ID" 
                  name="username" 
                  defaultValue={editingStaff?.username} 
                  placeholder="Enter login ID" 
                  required 
                />
                <div className="space-y-1.5 relative">
                  <label className="text-sm font-medium text-zinc-700">Login Password</label>
                  <input 
                    type="password"
                    name="password"
                    defaultValue={editingStaff?.password}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-mono"
                    placeholder="Enter password"
                    required
                  />
                  <p className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-tighter">This password will be stored in plain text for this version.</p>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="flex-1 py-3"
                    onClick={() => setShowStaffModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 py-3 bg-zinc-900">
                    {editingStaff ? 'Update Account' : 'Create Account'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddTemplateModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="font-bold text-zinc-900">
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h3>
                <button onClick={() => setShowAddTemplateModal(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>
              <form 
                key={editingTemplate ? `edit-template-${editingTemplate.id}` : 'new-template-form'}
                onSubmit={handleAddTemplate} 
                className="p-6 space-y-4"
              >
                <Input 
                  label="Template Name" 
                  name="name" 
                  defaultValue={editingTemplate?.name} 
                  placeholder="e.g. Birthday Wish" 
                  required
                />
                <Select 
                  label="Template Category" 
                  name="type" 
                  defaultValue={editingTemplate?.type || 'Custom'}
                  options={[
                    { value: 'Birthday', label: 'Birthday' },
                    { value: 'Anniversary', label: 'Anniversary' },
                    { value: 'Bulk', label: 'Bulk Greeting' },
                    { value: 'Custom', label: 'Custom' }
                  ]}
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Message Content</label>
                  <textarea 
                    name="content"
                    defaultValue={editingTemplate?.content}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                    placeholder="Use {{name}} placeholder for dynamic names"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4 border-t border-zinc-100">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="flex-1"
                    onClick={() => setShowAddTemplateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mediaToDelete && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden p-6 text-center"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="font-bold text-zinc-900 mb-2">Delete Media?</h3>
              <p className="text-sm text-zinc-500 mb-6">This action cannot be undone. Are you sure you want to remove this file?</p>
              <div className="flex gap-3">
                <Button 
                  variant="secondary" 
                  className="flex-1"
                  onClick={() => setMediaToDelete(null)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none"
                  onClick={confirmDeleteMedia}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
