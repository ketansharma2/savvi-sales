'use client';

import { useState, useEffect, useRef } from "react";
import {
  Search, Phone, Filter, X, Save, Plus, Eye, Trash2,
  Calendar, MapPin, ListFilter, ArrowRight, Send, Lock, Edit, Award, Users, Briefcase, Loader2, TrendingUp
} from "lucide-react";
import Sidebar from "@/components/Sidebar"; 
import { apiFetch } from "@/lib/apiClient";


export default function LeadsTablePage() {
  // --- STATE ---
const [leads, setLeads] = useState<any[]>([]);
const [allLeads, setAllLeads] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [modalType, setModalType] = useState("");
  const [managerName, setManagerName] = useState("Manager");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingInteraction, setIsSavingInteraction] = useState(false);
  const [editingInteractionId, setEditingInteractionId] = useState<string | null>(null);
  const [interactions, setInteractions] = useState<any[]>([]);

const [newLeadData, setNewLeadData] = useState({
  company: "",
  category: "",
  state: "",
  location: "",
  reference: "",
  sourcing_date: "",
  startup: "",
  district_city: "",
  projection: "",
});

  const [interactionData, setInteractionData] = useState({
    date: new Date().toISOString().split('T')[0],
    status: '',
    remarks: '',
    next_follow_up: '',
    contact_person: '',
    contact_no: '',
    email: '',
    material: "",
    sale_amount: '',
  });

  const [formErrors, setFormErrors] = useState<any>({});
  const [interactionFormErrors, setInteractionFormErrors] = useState<any>({});

  const [indianStates] = useState(['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Telangana', 'Uttar Pradesh', 'Rajasthan']);
  const [districtsList, setDistrictsList] = useState<string[]>([]);

  const industryCategories = [
   "Sweet Shop", "Conefectionery", "Bakery", "Other F&B"
  ];

  const employeeCounts = [
    "1 - 10", "11 - 50", "51 - 200", "201 - 500", "501 - 1000", "1001 - 5000", "5000 +"
  ];

  const stateDistricts: Record<string, string[]> = {
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik'],
    'Delhi': ['New Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi'],
    'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota']
  };

  // --- FILTERS ---
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    company: "",
    location: "",
    status: "All",
    subStatus: "All",
    franchiseStatus: "All",
    startup: "All",
    projection: "All"
  });

  // --- FUNCTIONS ---
  const fetchDistricts = (stateName: string) => {
    setDistrictsList(stateDistricts[stateName] || []);
  };

  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  };

  const formatDateForCompare = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (parts) {
      return new Date(Date.UTC(parseInt(parts[1]), parseInt(parts[2]) - 1, parseInt(parts[3])));
    }
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  };



  // Apply filters
  useEffect(() => {
  applyCurrentFilters();
}, [allLeads, filters.company]);

  const applyCurrentFilters = () => {
    const filtered = allLeads.filter(lead => {
      const leadDateStr = lead.latestFollowup || '';
      const leadDate = leadDateStr ? new Date(leadDateStr + 'T00:00:00Z') : null;
      const from = filters.fromDate ? formatDateForCompare(filters.fromDate) : null;
      const to = filters.toDate ? formatDateForCompare(filters.toDate) : null;

      if (from || to) {
        if (!leadDate) return false;
      }

      const isAfterFrom = from && leadDate ? leadDate >= from : true;
      const isBeforeTo = to && leadDate ? leadDate <= to : true;

      const matchCompany = filters.company === '' ||
        ((lead.company || '').toLowerCase().includes(filters.company.toLowerCase()) ||
         (lead.contact_person || '').toLowerCase().includes(filters.company.toLowerCase()));

      const matchLocation = filters.location === '' ||
        ((lead.district_city || '') + ' ' + (lead.state || '') + ' ' + (lead.location || '')).toLowerCase().includes(filters.location.toLowerCase());

      const matchStatus = filters.status === "All" ||
        ((lead.status || '').trim().toLowerCase() === (filters.status || '').trim().toLowerCase());

      

      const matchStartup = filters.startup === "All" ||
        ((lead.startup || '').trim().toLowerCase() === (filters.startup || '').trim().toLowerCase());

      const matchProjection = filters.projection === "All" ||
        ((lead.projection || '').trim().toLowerCase() === (filters.projection || '').trim().toLowerCase());

      return isAfterFrom && isBeforeTo && matchCompany && matchLocation && matchStatus  && matchStartup && matchProjection;
    });

    setLeads(filtered);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const filtered = allLeads.filter(lead => {
      const leadDateStr = lead.latestFollowup || '';
      const leadDate = leadDateStr ? new Date(leadDateStr + 'T00:00:00Z') : null;
      const from = newFilters.fromDate ? formatDateForCompare(newFilters.fromDate) : null;
      const to = newFilters.toDate ? formatDateForCompare(newFilters.toDate) : null;

      if (from || to) {
        if (!leadDate) return false;
      }

      const isAfterFrom = from && leadDate ? leadDate >= from : true;
      const isBeforeTo = to && leadDate ? leadDate <= to : true;

      const matchCompany = newFilters.company === '' ||
        ((lead.company || '').toLowerCase().includes(newFilters.company.toLowerCase()) ||
         (lead.contact_person || '').toLowerCase().includes(newFilters.company.toLowerCase()));

      const matchLocation = newFilters.location === '' ||
        ((lead.district_city || '') + ' ' + (lead.state || '') + ' ' + (lead.location || '')).toLowerCase().includes(newFilters.location.toLowerCase());

      const matchStatus = newFilters.status === "All" ||
        ((lead.status || '').trim().toLowerCase() === (newFilters.status || '').trim().toLowerCase());

      const matchSubStatus = newFilters.subStatus === "All" ||
        ((lead.subStatus || '').trim().toLowerCase() === (newFilters.subStatus || '').trim().toLowerCase());

      const matchFranchiseStatus = newFilters.franchiseStatus === "All" ||
        ((lead.franchiseStatus || '').trim().toLowerCase() === (newFilters.franchiseStatus || '').trim().toLowerCase());

      const matchStartup = newFilters.startup === "All" ||
        ((lead.startup || '').trim().toLowerCase() === (newFilters.startup || '').trim().toLowerCase());

      const matchProjection = newFilters.projection === "All" ||
        ((lead.projection || '').trim().toLowerCase() === (newFilters.projection || '').trim().toLowerCase());

      return isAfterFrom && isBeforeTo && matchCompany && matchLocation && matchStatus && matchSubStatus && matchFranchiseStatus && matchStartup && matchProjection;
    });

    setLeads(filtered);
  };

  const clearAllFilters = () => {
    setFilters({
      fromDate: "",
      toDate: "",
      company: "",
      location: "",
      status: "All",
      subStatus: "All",
      franchiseStatus: "All",
      startup: "All",
      projection: "All"
    });
    setLeads(allLeads);
  };

  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const handleOpenProfile = () => {
    alert('Profile opened');
  };

  // --- MODAL HANDLERS ---
 const handleAction = async (lead: any, type: string) => {
  const leadId = lead._id || lead.id;

  if (type === "delete") {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      const res = await apiFetch(`/api/leads/${leadId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete lead");
      }

      setAllLeads(prev =>
        prev.filter(l => (l._id || l.id) !== leadId)
      );

      setLeads(prev =>
        prev.filter(l => (l._id || l.id) !== leadId)
      );

      alert("Lead deleted successfully");
    } catch (error: any) {
      console.error("Delete lead error:", error);
      alert(error.message || "Failed to delete lead");
    }

    return;
  }

  setSelectedLead(lead);
  setModalType(type);
  setIsFormOpen(true);
  setEditingInteractionId(null);

  if (type === "add") {
    setInteractionData({
      date: new Date().toISOString().split("T")[0],
      status: lead.status || "",
      
      remarks: "",
      next_follow_up: "",
      contact_person: lead.contact_person || "",
      contact_no: lead.contact_no || "",
      email: lead.email || "",
      material: "",
      sale_amount: "",
    });

    setInteractionFormErrors({});
  }

  if (type === "view") {
    try {
      setInteractions([]);

      const res = await apiFetch(
        `/api/leads/${leadId}/interactions`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch interactions"
        );
      }

      setInteractions(data.interactions || []);
    } catch (error: any) {
      console.error("Fetch interactions error:", error);
      alert(error.message || "Failed to load interactions");
    }
  }

  if (type === "edit") {
    if (lead.state) {
      fetchDistricts(lead.state);
    }

    setNewLeadData({
      company: lead.company || "",
      category: lead.category || "",
      state: lead.state || "",
      location: lead.location || "",
      reference: lead.reference || "",
      sourcing_date:
        lead.sourcingDate ||
        lead.sourcing_date ||
        "",
      startup:
        typeof lead.startup === "boolean"
          ? lead.startup
            ? "Yes"
            : "No"
          : lead.startup || "",
      district_city:
        lead.district_city ||
        lead.districtCity ||
        "",
      projection: lead.projection || "",
    });
  }

  if (type === "send_to_manager") {
    setManagerName("Diwakar");
  }
};

  const handleCreateNew = () => {
    setSelectedLead(null);
    setModalType("create");
    setIsFormOpen(true);
    setFormErrors({});
    setNewLeadData({
      company: '',
      category: '',
      state: '',
      location: '',
      reference: '',
      sourcing_date: '',
      startup: '',
      district_city: '',
      projection: ''
    });
  };

  // --- VALIDATION ---
  const validateNewLeadForm = () => {
    const errors: any = {};
    if (!newLeadData.company?.trim()) errors.company = 'Company Name is required';
    if (!newLeadData.category) errors.category = 'Category is required';
    if (!newLeadData.sourcing_date) errors.sourcing_date = 'Sourcing Date is required';
    if (!newLeadData.state) errors.state = 'State is required';
    if (!newLeadData.startup) errors.startup = 'Startup option is required';
    if (!newLeadData.projection) errors.projection = 'Projection is required';

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      alert('⚠️ Please fill all required fields');
      return false;
    }
    return true;
  };

 const validateInteractionForm = () => {
  const errors: any = {};

  if (!interactionData.date) {
    errors.date = "Interaction Date is required";
  }

  if (!interactionData.contact_person?.trim()) {
    errors.contact_person = "Contact Person is required";
  }

  if (!interactionData.contact_no?.trim()) {
    errors.contact_no = "Phone is required";
  }

  if (!interactionData.status) {
    errors.status = "Status is required";
  }

  if (!interactionData.material) {
    errors.material = "Material is required";
  }

  if (!interactionData.remarks?.trim()) {
    errors.remarks = "Remarks is required";
  }

  if (!interactionData.next_follow_up) {
    errors.next_follow_up =
      "Next Follow-up Date is required";
  }

  setInteractionFormErrors(errors);

  return Object.keys(errors).length === 0;
};

  // --- SAVE HANDLERS ---
const handleSaveOnly = async () => {
  if (!validateNewLeadForm()) return;

  try {
    setIsSaving(true);

    const res = await apiFetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company: newLeadData.company,
        category: newLeadData.category,
        state: newLeadData.state,
        district_city: newLeadData.district_city,
        location: newLeadData.location,
        reference: newLeadData.reference,
        sourcingDate: newLeadData.sourcing_date,
        startup: newLeadData.startup,
        projection: newLeadData.projection,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to save lead");
    }

    // API se actual MongoDB lead
    const savedLead = {
      ...data.lead,
      id: data.lead._id,
      sourcingDate: data.lead.sourcingDate || "",
      latestFollowup: data.lead.latestFollowup || "",
      nextFollowup: data.lead.nextFollowup || "",
      empCount: data.lead.empCount || "1 - 10",
      subStatus: data.lead.subStatus || "",
      franchiseStatus: data.lead.franchiseStatus || "",
    };

    setAllLeads(prev => [savedLead, ...prev]);
    setLeads(prev => [savedLead, ...prev]);

    setIsFormOpen(false);
    setSelectedLead(null);

    alert("Lead saved successfully");

  } catch (error: any) {
    console.error("Save lead error:", error);
    alert(error.message || "Failed to save lead");
  } finally {
    setIsSaving(false);
  }
};

const handleSaveAndFollowup = async () => {
  if (!validateNewLeadForm()) return;

  try {
    setIsSaving(true);

    const res = await apiFetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company: newLeadData.company,
        category: newLeadData.category,
        state: newLeadData.state,
        district_city: newLeadData.district_city,
        location: newLeadData.location,
        reference: newLeadData.reference,
        sourcingDate: newLeadData.sourcing_date,
        startup: newLeadData.startup,
        projection: newLeadData.projection,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to save lead");
    }

    const savedLead = {
      ...data.lead,
      id: data.lead._id,
      sourcingDate: data.lead.sourcingDate || "",
      latestFollowup: data.lead.latestFollowup || "",
      nextFollowup: data.lead.nextFollowup || "",
      empCount: data.lead.empCount || "1 - 10",
      subStatus: data.lead.subStatus || "",
      franchiseStatus: data.lead.franchiseStatus || "",
    };

    setAllLeads(prev => [savedLead, ...prev]);
    setLeads(prev => [savedLead, ...prev]);

    // IMPORTANT: actual MongoDB ID
    setSelectedLead(savedLead);

    setInteractionData({
      date: new Date().toISOString().split("T")[0],
      status: "",
      remarks: "",
      next_follow_up: "",
      contact_person: "",
      contact_no: "",
      email: "",
      material: "",
      sale_amount: "",
    });

    setModalType("add");

  } catch (error: any) {
    console.error("Save lead error:", error);
    alert(error.message || "Failed to save lead");
  } finally {
    setIsSaving(false);
  }
};

  const handleUpdateLead = async () => {
  if (!validateNewLeadForm()) return;

  if (!selectedLead) {
    alert("Lead not selected");
    return;
  }

  const leadId = selectedLead._id || selectedLead.id;

  try {
    setIsSaving(true);

    const res = await apiFetch(`/api/leads/${leadId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company: newLeadData.company,
        category: newLeadData.category,
        state: newLeadData.state,
        district_city: newLeadData.district_city,
        location: newLeadData.location,
        reference: newLeadData.reference,
        sourcingDate: newLeadData.sourcing_date,
        startup: newLeadData.startup,
        projection: newLeadData.projection,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to update lead");
    }

    const updatedLead = {
      ...data.lead,
      id: data.lead._id,

    sale_amount:
    data.lead.sale_amount !== undefined
      ? data.lead.sale_amount
      : interactionData.sale_amount,
     
      sourcingDate:
        data.lead.sourcingDate ||
        data.lead.sourcing_date ||
        "",
      latestFollowup:
        data.lead.latestFollowup ||
        data.lead.latest_follow_up ||
        "",
      nextFollowup:
        data.lead.nextFollowup ||
        data.lead.next_follow_up ||
        "",
    };

    setAllLeads(prev =>
      prev.map(item =>
        (item._id || item.id) === leadId
          ? updatedLead
          : item
      )
    );

    setLeads(prev =>
      prev.map(item =>
        (item._id || item.id) === leadId
          ? updatedLead
          : item
      )
    );

    setSelectedLead(updatedLead);
    setIsFormOpen(false);

    alert("Lead updated successfully");
  } catch (error: any) {
    console.error("Update lead error:", error);
    alert(error.message || "Failed to update lead");
  } finally {
    setIsSaving(false);
  }
};

  const handleSaveInteraction = async () => {
  if (!validateInteractionForm()) return;

  if (!selectedLead) {
    alert("Lead not selected");
    return;
  }

  const leadId = selectedLead._id || selectedLead.id;

  try {
    setIsSavingInteraction(true);

    let res: Response;

    if (editingInteractionId) {
      res = await apiFetch(
        `/api/leads/${leadId}/interactions/${editingInteractionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: interactionData.date,
            contact_person: interactionData.contact_person,
            contact_no: interactionData.contact_no,
            email: interactionData.email,
            status: interactionData.status,
            material: interactionData.material,
            sale_amount: interactionData.sale_amount,
            remarks: interactionData.remarks,
            next_follow_up: interactionData.next_follow_up,
          }),
        }
      );
    } else {
      res = await apiFetch(
        `/api/leads/${leadId}/interactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: interactionData.date,
            contact_person: interactionData.contact_person,
            contact_no: interactionData.contact_no,
            email: interactionData.email,
            status: interactionData.status,
            material: interactionData.material,
            sale_amount: interactionData.sale_amount,
            remarks: interactionData.remarks,
            next_follow_up: interactionData.next_follow_up,
          }),
        }
      );
    }

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(
        data.message || "Failed to save interaction"
      );
    }

    // Update current lead from API response
    if (data.lead) {
      const updatedLead = {
        ...data.lead,
        id: data.lead._id,

        sourcingDate:
          data.lead.sourcingDate ||
          data.lead.sourcing_date ||
          "",
        latestFollowup:
          data.lead.latestFollowup ||
          data.lead.latest_follow_up ||
          "",

        sale_amount: interactionData.sale_amount, 
        nextFollowup:
          data.lead.nextFollowup ||
          data.lead.next_follow_up ||
          "",
      };

      setAllLeads(prev =>
        prev.map(item =>
          (item._id || item.id) === leadId
            ? {
                ...item,
                ...updatedLead,
              }
            : item
        )
      );

      setLeads(prev =>
        prev.map(item =>
          (item._id || item.id) === leadId
            ? {
                ...item,
                ...updatedLead,
              }
            : item
        )
      );

      setSelectedLead(updatedLead);
    }

    // Refresh interactions from database
    const interactionRes = await apiFetch(
      `/api/leads/${leadId}/interactions`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const interactionDataResponse =
      await interactionRes.json();

    if (
      interactionRes.ok &&
      interactionDataResponse.success
    ) {
      setInteractions(
        interactionDataResponse.interactions || []
      );
    }

    setIsFormOpen(false);
    setEditingInteractionId(null);

    alert(
      editingInteractionId
        ? "Interaction updated successfully"
        : "Interaction saved successfully"
    );
  } catch (error: any) {
    console.error("Interaction save error:", error);
    alert(
      error.message || "Failed to save interaction"
    );
  } finally {
    setIsSavingInteraction(false);
  }
};

  const handleSendToManager = async () => {
    const updatedLeads = allLeads.map(lead =>
      lead.id === selectedLead.id
        ? { ...lead, isSubmitted: true }
        : lead
    );
    setAllLeads(updatedLeads);
    setLeads(updatedLeads);
    setIsFormOpen(false);
    alert(`Sent to Manager (${managerName}) successfully`);
  };

  const fetchLeads = async () => {
  try {
    setLoading(true);

    const res = await apiFetch("/api/leads", {
      method: "GET",
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to fetch leads");
    }

    const normalizedLeads = (data.leads || []).map((lead: any) => ({
      ...lead,

      // UI ke liye common id
      id: lead._id,

      sourcingDate: lead.sourcingDate || "",
      latestFollowup: lead.latestFollowup || "",
      nextFollowup: lead.nextFollowup || "",

      // Backend model mein ye fields nahi hain
      empCount: lead.empCount || "1 - 10",
      subStatus: lead.subStatus || "",
      franchiseStatus: lead.franchiseStatus || "",
    }));

    setAllLeads(normalizedLeads);
    setLeads(normalizedLeads);

  } catch (error: any) {
    console.error("Fetch leads error:", error);
    alert(error.message || "Failed to load leads");

    setAllLeads([]);
    setLeads([]);
  } finally {
    setLoading(false);
  }
};

// useEffect(() => {
//   fetchLeads();

//   const urlParams = new URLSearchParams(window.location.search);
//   const searchCompany = urlParams.get("search");

//   if (searchCompany) {
//     setFilters(prev => ({
//       ...prev,
//       company: searchCompany,
//     }));
//   }
// }, []);

useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const searchCompany = urlParams.get("search");

  if (searchCompany) {
    setFilters(prev => ({
      ...prev,
      company: searchCompany,
    }));
  }

  fetchLeads();
}, []);
  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-['Calibri'] text-slate-800">
      
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        onOpenProfile={handleOpenProfile}
      />
      
      <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-2 px-2 mt-1">
          <div>
            <h1 className="text-2xl font-black text-[#24a9ec] uppercase tracking-tight">Leads Database</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
              Manage & Track Client Interactions
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#24a9ec]/10 text-[#24a9ec] border border-[#24a9ec]/30">
                {leads.length} rows
              </span>
            </p>
          </div>
          <button onClick={handleCreateNew} className="bg-[#24a9ec] hover:bg-[#1a8bc4] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#24a9ec]/30 transition-transform active:scale-95">
            <Plus size={18} /> Add New Lead
          </button>
        </div>

        {/* FILTERS */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 mb-4 flex flex-row flex-nowrap gap-2 items-end overflow-x-auto whitespace-nowrap">
          <div className="flex-shrink-0 w-32">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">From Date</label>
            <input type="date" className="w-full pl-3 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:border-[#24a9ec] outline-none" onChange={(e) => handleFilterChange("fromDate", e.target.value)} />
          </div>

          <div className="flex-shrink-0 w-32">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">To Date</label>
            <input type="date" className="w-full pl-3 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:border-[#24a9ec] outline-none" onChange={(e) => handleFilterChange("toDate", e.target.value)} />
          </div>

          <div className="flex-shrink-0 w-40">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Company/Contact</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
              <input type="text" placeholder="Type name..." value={filters.company} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:border-[#24a9ec] outline-none" onChange={(e) => handleFilterChange("company", e.target.value)} />
            </div>
          </div>

          <div className="flex-shrink-0 w-40">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Location / State</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 text-gray-400" size={14} />
              <input type="text" placeholder="Delhi, Mumbai..." value={filters.location} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:border-[#24a9ec] outline-none" onChange={(e) => handleFilterChange("location", e.target.value)} />
            </div>
          </div>

          <div className="flex-shrink-0 w-32">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Status</label>
            <div className="relative">
              <ListFilter className="absolute left-3 top-2.5 text-gray-400" size={14} />
              <select className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:border-[#24a9ec] outline-none appearance-none cursor-pointer" onChange={(e) => handleFilterChange("status", e.target.value)}>
                <option>All</option>
                <option>Interested</option>
                <option>Not Interested</option>
                <option>Not Picked</option>
                <option>Onboard</option>
                <option>Call Later</option>
                <option>New</option>
              </select>
            </div>
          </div>



          <div className="flex-shrink-0 w-30">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Startup</label>
            <select className="w-full pl-3 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:border-[#24a9ec] outline-none appearance-none cursor-pointer" onChange={(e) => handleFilterChange("startup", e.target.value)}>
              <option>All</option>
              <option>Yes</option>
              <option>No</option>
              <option>Master Union</option>
            </select>
          </div>

          <div className="flex-shrink-0 w-32">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Projection</label>
            <div className="relative">
              <TrendingUp className="absolute left-3 top-2.5 text-gray-400" size={14} />
              <select className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:border-[#24a9ec] outline-none appearance-none cursor-pointer" onChange={(e) => handleFilterChange("projection", e.target.value)} value={filters.projection}>
                <option value="All">All</option>
                <option value="WP > 50">WP &gt; 50</option>
                <option value="WP < 50">WP &lt; 50</option>
                <option value="MP > 50">MP &gt; 50</option>
                <option value="MP < 50">MP &lt; 50</option>
                <option value="Not Projected">Not Projected</option>
              </select>
            </div>
          </div>

          <div className="flex-shrink-0">
            <button onClick={clearAllFilters} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* TABLE */}
<div
  className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto custom-scrollbar ${
    leads.length > 0 ? "flex-1 overflow-y-auto" : ""
  }`}
>          <table className="w-full table-fixed border-collapse text-center">
            <thead className="bg-[#24a9ec] text-white text-[10px] uppercase font-bold sticky top-0 z-20">
              <tr>
                <th className="px-2 py-2 border-r border-white/20 w-20">Sourcing Date</th>
                <th className="px-2 py-2 border-r border-white/20 text-left pl-4 w-44">Company Name</th>
                <th className="px-2 py-2 border-r border-white/20 w-20">Category</th>
                <th className="px-2 py-2 border-r border-white/20 w-24">City/State</th>
                <th className="px-2 py-2 border-r border-white/20 text-left pl-4 w-32">Contact Details</th>
                <th className="px-2 py-2 border-r border-white/20 w-44">Latest Interaction</th>
                <th className="px-2 py-2 border-r border-white/20 w-20">Next Followup</th>
                <th className="px-2 py-2 border-r border-white/20 w-20">Status</th>
                <th className="px-2 py-2 border-r border-white/20 w-28">
                Sale Amount
                </th>
                <th className="px-2 py-2 border-r border-white/20 w-28">Projection</th>
                <th className="px-2 py-2 text-center bg-[#1a8bc4] sticky right-0 z-30 w-32">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs text-gray-700 font-medium">
              {loading ? (
                <tr key="loading">
  <td
    colSpan={12}
    className="py-6 text-center text-gray-400 font-bold uppercase tracking-widest"
  >Loading leads...</td>
                </tr>
              ) : leads.length > 0 ? (
                leads.map((lead) => {
                  const isLocked = lead.isSubmitted;
                  return (
                    <tr key={lead.id} className="border-b border-gray-100 transition group hover:bg-[#24a9ec]/5">
                      <td className="px-1 py-2 border-r border-gray-100 whitespace-nowrap text-[10px]">{lead.sourcingDate}</td>

                      <td className="px-2 py-2 border-r border-gray-100 font-bold text-[#24a9ec] text-left">
                        <div className="flex items-center justify-start gap-1">
                          {(lead?.startup === true || String(lead?.startup).toLowerCase() === 'yes') && (
                            <span className="bg-green-100 text-green-700 text-[8px] font-black px-1 rounded-full border border-green-200 shrink-0">S</span>
                          )}
                          {String(lead?.startup).toLowerCase() === 'master union' && (
                            <span className="bg-purple-100 text-purple-700 text-[8px] font-black px-1 rounded-full border border-purple-200 shrink-0">M</span>
                          )}
                          <span className="truncate block" title={lead.company}>{lead.company}</span>
                        </div>
                      </td>

                      <td className="px-1 py-2 border-r border-gray-100 truncate text-[10px]" title={lead.category}>{lead.category}</td>

                      <td className="px-1 py-2 border-r border-gray-100 text-[10px] truncate" title={`${lead.district_city}, ${lead.state}`}>
                        {lead.district_city ? `${lead.district_city}, ` : ''}{lead.state}
                      </td>

                      <td className="px-3 py-2 border-r border-gray-100 text-left">
                        <div className="flex flex-col leading-tight">
                          <div className="font-bold text-gray-800 truncate text-[11px]">{lead.contact_person || 'N/A'}</div>
                          <div className="flex items-center gap-1 text-[10px]">
                            {lead.contact_no ? (
                              <a href={`tel:${lead.contact_no}`} className="font-mono font-bold text-gray-500 hover:text-[#24a9ec]">📞{lead.contact_no}</a>
                            ) : <span className="text-gray-400">-</span>}
                          </div>
                          {lead.email && (
                            <a href={`mailto:${lead.email}`} className="text-[9px] text-[#24a9ec] lowercase truncate hover:underline" title={lead.email}>{lead.email}</a>
                          )}
                        </div>
                      </td>

                      <td className="px-1 py-2 border-r border-gray-100">
                        <div className="flex flex-col gap-0.5 items-center">
                          <span className="font-bold text-[#24a9ec] text-[9px] bg-[#24a9ec]/10 px-1 rounded border border-[#24a9ec]/20">
                            {formatDateForDisplay(lead.latestFollowup)}
                          </span>
                          <span className="text-gray-500 italic truncate w-full px-1 text-[10px]" title={lead.remarks}>"{lead.remarks}"</span>
                        </div>
                      </td>

                      <td className="px-1 py-2 border-r border-gray-100 font-bold text-orange-600 text-[10px]">
                        {formatDateForDisplay(lead.nextFollowup)}
                      </td>

                      <td className="px-1 py-2 border-r border-gray-100 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border inline-block ${
                          isLocked ? 'bg-purple-100 text-purple-700 border-purple-200' :
                          lead.status === 'Interested' ? 'bg-green-50 text-green-700 border-green-200' :
                          lead.status === 'New' ? 'bg-[#24a9ec]/10 text-[#24a9ec] border-[#24a9ec]/30' :
                          'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-1 py-2 border-r border-gray-100 text-center">
  <span className="font-bold text-green-700 text-[10px] bg-green-50 px-2 py-1 rounded border border-green-200">
    {lead.sale_amount !== null &&
    lead.sale_amount !== undefined &&
    lead.sale_amount !== ""
      ? `₹${Number(lead.sale_amount).toLocaleString("en-IN")}`
      : "N/A"}
  </span>
</td>


                      <td className="px-1 py-2 border-r border-gray-100 truncate text-[10px]">{lead.projection || "NA"}</td>

                      <td className="px-1 py-2 text-center sticky right-0 bg-white group-hover:bg-[#f1f5f9] border-l border-gray-200 z-10 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {isLocked ? (
                            <>
                              <button onClick={() => handleAction(lead, 'view')} className="p-1 text-gray-500 hover:text-[#24a9ec] hover:bg-[#24a9ec]/10 rounded transition-colors" title="View">
                                <Eye size={14} />
                              </button>
                              <button onClick={() => handleAction(lead, 'edit')} className="p-1 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 transition-colors" title="Edit">
                                <Edit size={14} />
                              </button>
                              <button onClick={() => handleAction(lead, 'add')} className="p-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors" title="Interaction">
                                <Phone size={14} />
                              </button>
                              
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleAction(lead, 'view')} className="p-1 text-gray-500 hover:text-[#24a9ec] hover:bg-[#24a9ec]/10 rounded transition-colors" title="View">
                                <Eye size={14} />
                              </button>
                              <button onClick={() => handleAction(lead, 'edit')} className="p-1 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 transition-colors" title="Edit">
                                <Edit size={14} />
                              </button>
                              <button onClick={() => handleAction(lead, 'add')} className="p-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors" title="Interaction">
                                <Phone size={14} />
                              </button>
                            
                              <button onClick={() => handleAction(lead, 'delete')} className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors" title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr key="no-records" >
                  <td colSpan={12} className="p-8 text-center text-gray-400 font-bold uppercase tracking-widest">No records match your filters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-[#24a9ec]/30 backdrop-blur-sm flex justify-center items-center z-50 p-2">
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-200 border-4 border-white ${modalType === 'view' ? 'max-h-[90vh]' : ''}`}>
              {/* Modal Header */}
              <div className="bg-[#24a9ec] p-2 flex justify-between items-center text-white">
                <div>
                  <h3 className="font-bold text-lg uppercase tracking-wide">
                    {modalType === 'create' ? 'Sourcing New Lead' :
                     modalType === 'add' ? (editingInteractionId ? 'Edit Interaction' : 'Add Interaction') :
                     modalType === 'edit' ? 'Edit Lead' :
                     modalType === 'send_to_manager' ? 'Send to Manager' :
                     'Lead Details'}
                  </h3>
                  {selectedLead && (
                    <p className="text-xs opacity-70 font-mono mt-1">{selectedLead.company}</p>
                  )}
                </div>
                <button onClick={() => { setIsFormOpen(false); setInteractions([]); setSelectedLead(null); setEditingInteractionId(null); }} className="hover:bg-white/20 p-1 rounded-full transition">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4">
                {/* CREATE / EDIT FORM */}
                {(modalType === 'create' || modalType === 'edit') && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Company Name <span className="text-red-500">*</span></label>
                        <input type="text" placeholder="Enter full name" value={newLeadData.company} onChange={(e) => setNewLeadData({...newLeadData, company: e.target.value})} className={`w-full border rounded p-2 text-sm mt-1 focus:border-[#24a9ec] outline-none ${formErrors.company ? 'border-red-500' : 'border-gray-300'}`} />
                        {formErrors.company && <p className="text-red-500 text-xs mt-1">{formErrors.company}</p>}
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Category <span className="text-red-500">*</span></label>
                        <select value={newLeadData.category} onChange={(e) => setNewLeadData({...newLeadData, category: e.target.value})} className={`w-full border rounded p-2 text-sm mt-1 focus:border-[#24a9ec] outline-none ${formErrors.category ? 'border-red-500' : 'border-gray-300'}`}>
                          <option value="">Select Category...</option>
                          {industryCategories.map((cat, idx) => (
                            <option key={idx} value={cat}>{cat}</option>
                          ))}
                        </select>
                        {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Sourcing Date <span className="text-red-500">*</span></label>
                        <input type="date" value={newLeadData.sourcing_date} onChange={(e) => setNewLeadData({...newLeadData, sourcing_date: e.target.value})} className={`w-full border rounded p-2 text-sm mt-1 focus:border-[#24a9ec] outline-none ${formErrors.sourcing_date ? 'border-red-500' : 'border-gray-300'}`} />
                        {formErrors.sourcing_date && <p className="text-red-500 text-xs mt-1">{formErrors.sourcing_date}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">State <span className="text-red-500">*</span></label>
                        <select value={newLeadData.state} onChange={(e) => {
                          const selectedState = e.target.value;
                          setNewLeadData({...newLeadData, state: selectedState, district_city: ''});
                          fetchDistricts(selectedState);
                        }} className={`w-full border rounded p-2 text-sm mt-1 focus:border-[#24a9ec] outline-none ${formErrors.state ? 'border-red-500' : 'border-gray-300'}`}>
                          <option value="">Select State...</option>
                          {indianStates.map((state, idx) => (
                            <option key={idx} value={state}>{state}</option>
                          ))}
                        </select>
                        {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">District/City</label>
                        <select value={newLeadData.district_city} onChange={(e) => setNewLeadData({...newLeadData, district_city: e.target.value})} className="w-full border border-gray-300 rounded p-2 text-sm mt-1 focus:border-[#24a9ec] outline-none" disabled={!newLeadData.state}>
                          <option value="">Select District/City</option>
                          {districtsList.map((district, idx) => (
                            <option key={idx} value={district}>{district}</option>
                          ))}
                        </select>
                      </div>
                     
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Location / Area</label>
                      <textarea value={newLeadData.location} onChange={(e) => setNewLeadData({...newLeadData, location: e.target.value})} className="w-full border border-gray-300 rounded p-2 text-sm mt-1 h-16 resize-none focus:border-[#24a9ec] outline-none" placeholder="E.g., Okhla Phase 3, Near Crown Plaza..."></textarea>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Reference / Source</label>
                        <input type="text" placeholder="LinkedIn, Google, Cold Call..." value={newLeadData.reference} onChange={(e) => setNewLeadData({...newLeadData, reference: e.target.value})} className="w-full border border-gray-300 rounded p-2 text-sm mt-1 focus:border-[#24a9ec] outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Startup <span className="text-red-500">*</span></label>
                        <select value={newLeadData.startup} onChange={(e) => setNewLeadData({...newLeadData, startup: e.target.value})} className={`w-full border rounded p-2 text-sm mt-1 focus:border-[#24a9ec] outline-none ${formErrors.startup ? 'border-red-500' : 'border-gray-300'}`}>
                          <option value="">Select Option</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="Master Union">Master Union</option>
                        </select>
                        {formErrors.startup && <p className="text-red-500 text-xs mt-1">{formErrors.startup}</p>}
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Projection <span className="text-red-500">*</span></label>
                        <select value={newLeadData.projection} onChange={(e) => setNewLeadData({...newLeadData, projection: e.target.value})} className={`w-full border rounded p-2 text-sm mt-1 focus:border-[#24a9ec] outline-none ${formErrors.projection ? 'border-red-500' : 'border-gray-300'}`}>
                          <option value="">Select Projection</option>
                          <option value="Not Projected">Not Projected</option>
                          <option value="WP > 50">WP &gt; 50</option>
                          <option value="WP < 50">WP &lt; 50</option>
                          <option value="MP > 50">MP &gt; 50</option>
                          <option value="MP < 50">MP &lt; 50</option>
                        </select>
                        {formErrors.projection && <p className="text-red-500 text-xs mt-1">{formErrors.projection}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* ADD INTERACTION */}
                {modalType === 'add' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Interaction Date <span className="text-red-500">*</span></label>
                        <input type="date" value={interactionData.date} onChange={(e) => setInteractionData({...interactionData, date: e.target.value})} className={`w-full border rounded p-2 text-sm mt-1 focus:border-[#24a9ec] outline-none font-medium ${interactionFormErrors.date ? 'border-red-500' : 'border-gray-300'}`} />
                        {interactionFormErrors.date && <p className="text-red-500 text-xs mt-1">{interactionFormErrors.date}</p>}
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Contact Person <span className="text-red-500">*</span></label>
                        <input type="text" placeholder="Enter name" value={interactionData.contact_person} onChange={(e) => setInteractionData({...interactionData, contact_person: e.target.value})} className={`w-full border rounded p-2 text-sm mt-1 focus:border-[#24a9ec] outline-none ${interactionFormErrors.contact_person ? 'border-red-500' : 'border-gray-300'}`} />
                        {interactionFormErrors.contact_person && <p className="text-red-500 text-xs mt-1">{interactionFormErrors.contact_person}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Phone <span className="text-red-500">*</span></label>
                        <input type="tel" placeholder="Enter phone number" value={interactionData.contact_no} onChange={(e) => setInteractionData({...interactionData, contact_no: e.target.value})} className={`w-full border rounded p-2 text-sm mt-1 focus:border-[#24a9ec] outline-none ${interactionFormErrors.contact_no ? 'border-red-500' : 'border-gray-300'}`} />
                        {interactionFormErrors.contact_no && <p className="text-red-500 text-xs mt-1">{interactionFormErrors.contact_no}</p>}
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Email</label>
                        <input type="email" placeholder="Enter email" value={interactionData.email} onChange={(e) => setInteractionData({...interactionData, email: e.target.value})} className="w-full border border-gray-300 rounded p-2 text-sm mt-1 focus:border-[#24a9ec] outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">New Status <span className="text-red-500">*</span></label>
                        <select value={interactionData.status} onChange={(e) => setInteractionData({...interactionData, status: e.target.value})} className={`w-full border rounded p-2 text-sm mt-1 focus:border-[#24a9ec] outline-none ${interactionFormErrors.status ? 'border-red-500' : 'border-gray-300'}`}>
                          <option value="">Select Status</option>
                          <option>Interested</option>
                          <option>Not Interested</option>
                          <option>Not Picked</option>
                          <option>Onboard</option>
                          <option>Call Later</option>
                        </select>
                        {interactionFormErrors.status && <p className="text-red-500 text-xs mt-1">{interactionFormErrors.status}</p>}
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase text-orange-600">Next Follow-up Date <span className="text-red-500">*</span></label>
                        <input type="date" value={interactionData.next_follow_up} onChange={(e) => setInteractionData({...interactionData, next_follow_up: e.target.value})} className={`w-full border rounded p-2 text-sm mt-1 focus:border-orange-500 outline-none font-bold text-gray-700 ${interactionFormErrors.next_follow_up ? 'border-red-500' : 'border-orange-200'}`} />
                        {interactionFormErrors.next_follow_up && <p className="text-red-500 text-xs mt-1">{interactionFormErrors.next_follow_up}</p>}
                      </div>
                    
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Material <span className="text-red-500">*</span></label>
                        <select
  value={interactionData.material}
  onChange={(e) =>
    setInteractionData({
      ...interactionData,
      material: e.target.value,
    })
  }
  className={`w-full border rounded p-2 text-sm mt-1 focus:border-[#24a9ec] outline-none ${
    interactionFormErrors.material
      ? "border-red-500"
      : "border-gray-300"
  }`}
>
  <option value="">Select Material</option>
  <option value="Liquid Glucose">Liquid Glucose</option>
  <option value="Special Syrup">Special Syrup</option>
  <option value="SMP">SMP</option>
  <option value="Rice Protein">Rice Protein</option>
</select>

{interactionFormErrors.material && (
  <p className="text-red-500 text-xs mt-1">
    {interactionFormErrors.material}
  </p>
)}
                      </div>
                                          <div>
  <label className="text-[10px] font-bold text-gray-500 uppercase">
    Sale Amount
  </label>

  <div className="relative mt-1">
    <span className="absolute left-3 top-2.5 text-gray-500 font-bold">
      ₹
    </span>

    <input
      type="number"
      min="0"
      step="0.01"
      placeholder="Enter sale amount"
      value={interactionData.sale_amount}
      onChange={(e) =>
        setInteractionData({
          ...interactionData,
          sale_amount: e.target.value,
        })
      }
      className="w-full border border-gray-300 rounded p-2 pl-8 text-sm focus:border-[#24a9ec] outline-none"
    />
  </div>
</div>
                    
                    </div>




                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Remarks <span className="text-red-500">*</span></label>
                      <textarea value={interactionData.remarks} onChange={(e) => setInteractionData({...interactionData, remarks: e.target.value})} className={`w-full border rounded p-3 text-sm mt-1 h-24 focus:border-[#24a9ec] outline-none resize-none placeholder:text-gray-300 ${interactionFormErrors.remarks ? 'border-red-500' : 'border-gray-300'}`} placeholder="Client kya bola? Mention key points..."></textarea>
                      {interactionFormErrors.remarks && <p className="text-red-500 text-xs mt-1">{interactionFormErrors.remarks}</p>}
                    </div>
                  </div>
                )}

                {/* VIEW MODE */}
                {modalType === 'view' && (
                  <div className="max-h-[65vh] overflow-y-auto">
                    <div className="bg-gray-50 border-b border-gray-200 p-4 rounded-t-lg">
                      <div className="flex items-center gap-6 flex-wrap">
                        <div>
                          <h2 className="text-2xl font-black text-[#24a9ec] uppercase tracking-tight">{selectedLead?.company}</h2>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Company Profile</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${(selectedLead?.startup === true || String(selectedLead?.startup).toLowerCase() === 'yes') ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                              Startup: {selectedLead?.startup || 'N/A'}
                            </span>
                          </div>
                        </div>
                        <div className="h-10 w-px bg-gray-300 shrink-0"></div>
                        <div className="flex items-center gap-6 flex-wrap">
                          <div className="flex flex-col">
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Sourced Date</label>
                            <span className="text-gray-700 font-bold text-xs">{selectedLead?.latestFollowup || 'N/A'}</span>
                          </div>
                          <div className="flex flex-col">
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Category</label>
                            <span className="bg-[#24a9ec]/10 text-[#24a9ec] text-[10px] font-bold px-2.5 py-0.5 rounded border border-[#24a9ec]/30">{selectedLead?.category || 'General'}</span>
                          </div>
                          <div className="flex flex-col">
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">City / State</label>
                            <span className="text-gray-700 font-bold text-xs">{selectedLead?.district_city}, {selectedLead?.state}</span>
                          </div>
                          <div className="flex flex-col">
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Projection</label>
                            <span className="text-gray-700 font-bold text-xs">{selectedLead?.projection || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </div>


<div className="mt-4">
  <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1 mb-3">
    <span className="w-2 h-2 rounded-full bg-[#24a9ec]"></span>
    Interaction History
  </h4>

  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase sticky top-0 z-10 border-b border-gray-100">
        <tr>
          <th className="p-3">Follow-up Date</th>
          <th className="p-3">Contact Details</th>
          <th className="p-4 w-1/4">Remarks</th>
          <th className="p-4 text-center">Status</th>
          <th className="p-4 text-center">Sale Amount</th>
          <th className="p-3 text-center">Next Follow-up</th>
        </tr>
      </thead>

      <tbody className="text-xs divide-y divide-gray-50">
        {interactions.length > 0 ? (
          interactions.map((interaction) => (
            <tr
              key={interaction._id}
              className="hover:bg-[#24a9ec]/5 transition"
            >
              <td className="p-3">
                <div className="font-bold text-[#24a9ec] text-sm">
                  {formatDateForDisplay(interaction.date)}
                </div>
              </td>

              <td className="p-3">
                <div className="font-bold text-gray-800">
                  {interaction.contact_person || "N/A"}
                </div>
                <div className="text-[10px] text-gray-500">
                  {interaction.contact_no}
                </div>
              </td>

              <td className="p-4">
                <p className="text-gray-600 italic bg-gray-50 p-2 rounded-lg border border-gray-100">
                  {interaction.remarks || "No remarks"}
                </p>
              </td>

              <td className="p-4 text-center">
                <span
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                    interaction.status === "Interested"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {interaction.status}
                </span>
              </td>

              <td className="p-4 text-center">
                <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                  {interaction.sale_amount !== null &&
                  interaction.sale_amount !== undefined &&
                  interaction.sale_amount !== ""
                    ? `₹${Number(interaction.sale_amount).toLocaleString("en-IN")}`
                    : "N/A"}
                </span>
              </td>

              <td className="p-3 text-center">
                <div className="text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded border border-orange-100 inline-block">
                  {formatDateForDisplay(interaction.next_follow_up)}
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr key="no-interactions">
            <td
              colSpan={6}
              className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest"
            >
              No interactions found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>


                  </div>
                )}

                {/* SEND TO MANAGER */}
                {modalType === 'send_to_manager' && (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <p className="text-sm text-gray-500 leading-relaxed max-w-[80%] mx-auto">
                      Are you sure you want to send
                      <span className="font-bold text-[#24a9ec] block my-2 text-base">
                        {selectedLead?.company}
                      </span>
                      to Manager <span className="font-bold text-purple-600">({managerName})</span>?
                      This will lock the lead.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className={`p-4 bg-gray-50 border-t flex gap-3 ${modalType === 'send_to_manager' ? 'justify-center' : 'justify-end'}`}>
                {modalType !== 'send_to_manager' && (
                  <button onClick={() => { setIsFormOpen(false); setInteractions([]); setSelectedLead(null); setEditingInteractionId(null); }} className="px-4 py-2 text-gray-500 font-bold hover:text-gray-700 text-sm">
                    Cancel
                  </button>
                )}

                {modalType === 'create' && (
                  <>
                    <button onClick={handleSaveOnly} disabled={isSaving} className="px-5 py-2 bg-white border border-[#24a9ec] text-[#24a9ec] rounded-lg font-bold text-sm shadow-sm hover:bg-[#24a9ec]/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                      {isSaving ? <><Loader2 size={16} className="animate-spin" /> Please wait...</> : 'Save Only'}
                    </button>
                    <button onClick={handleSaveAndFollowup} disabled={isSaving} className="bg-[#24a9ec] hover:bg-[#1a8bc4] text-white px-5 py-2 rounded-lg font-black text-sm shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isSaving ? <><Loader2 size={16} className="animate-spin" /> Please wait...</> : <>Save & Add Follow-up <ArrowRight size={16} /></>}
                    </button>
                  </>
                )}

                {modalType === 'add' && (
                  <button onClick={handleSaveInteraction} disabled={isSavingInteraction} className="bg-[#24a9ec] hover:bg-[#1a8bc4] text-white px-5 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSavingInteraction ? <><Loader2 size={16} className="animate-spin" /> Please wait...</> : <><Save size={16} /> {editingInteractionId ? 'Update Record' : 'Save Record'}</>}
                  </button>
                )}

                {modalType === 'edit' && (
                  <button onClick={handleUpdateLead} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2">
                    <Edit size={16} /> Update Details
                  </button>
                )}

                {modalType === 'send_to_manager' && (
                  <button onClick={handleSendToManager} className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-200 flex items-center gap-2 transition transform active:scale-95">
                    <Send size={16} /> Yes, Confirm
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}