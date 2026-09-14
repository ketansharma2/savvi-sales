'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Database,
  Phone,
  CheckCircle,
  Clock,
  TrendingUp,
  UserCheck,
  FileText,
  ChevronDown,
  PhoneOutgoing,
  PhoneIncoming,
  PhoneMissed,
   X,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { apiFetch } from "@/lib/apiClient";
type Lead = {
  id?: string;
  _id?: string;

  company?: string;
  contact_person?: string;
  contact_no?: string;
  sale_amount?: number | null;
  status?: string;
  startup?: string;
  projection?: string;

  nextFollowup?: string;
  latestFollowup?: string;
  sourcingDate?: string;
  createdAt?: string;

  remarks?: string;

 
};

export default function LeadGenHome() {
  const router = useRouter();

  // --------------------------------------------------
  // STATE
  // --------------------------------------------------

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [isAllData, setIsAllData] = useState(false);

  const [latestInteractionDate, setLatestInteractionDate] =
    useState("");

  const [activeDropdown, setActiveDropdown] =
    useState<string | null>(null);

  const [selectedLabel, setSelectedLabel] =
    useState("Today");

  const [leads, setLeads] = useState<Lead[]>([]);

  const [loading, setLoading] = useState(true);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
const [breakdownList, setBreakdownList] = useState<
  { material: string; count: number; total: number }[]
>([]);
const [breakdownTotal, setBreakdownTotal] = useState(0);
const [breakdownLoading, setBreakdownLoading] = useState(false);
  // --------------------------------------------------
  // FETCH REAL API DATA
  // --------------------------------------------------
 const [salesTotal, setSalesTotal] = useState(0);
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const res = await apiFetch("/api/leads", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch leads"
        );
      }

      setLeads(data.leads || []);
    } catch (error) {
      console.error("Dashboard API error:", error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --------------------------------------------------
  // DEFAULT DATE
  // --------------------------------------------------

  useEffect(() => {
    const today = new Date()
      .toISOString()
      .split("T")[0];

    setLatestInteractionDate(today);
    setFromDate(today);
    setToDate(today);
  }, []);

  // --------------------------------------------------
  // OPEN PROFILE
  // --------------------------------------------------

  const handleOpenProfile = () => {
    alert("Profile opened");
  };

  // --------------------------------------------------
  // CLOSE DROPDOWN OUTSIDE CLICK
  // --------------------------------------------------

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target as Node
        )
      ) {
        setActiveDropdown(null);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // --------------------------------------------------
  // YEARS
  // --------------------------------------------------

  const getYears = () => {
    const current = new Date().getFullYear();

    return [
      current - 2,
      current - 1,
      current,
      current + 1,
      current + 2,
    ];
  };

  // --------------------------------------------------
  // WEEKS
  // --------------------------------------------------

  const getWeeks = () => {
    const weeks: {
      label: string;
      start: string;
      end: string;
    }[] = [];

    const targetDate = new Date(
      fromDate || new Date()
    );

    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    let currentDate = new Date(
      year,
      month,
      1
    );

    let weekCount = 1;

    while (currentDate.getMonth() === month) {
      const start = new Date(currentDate);

      const dayOfWeek = currentDate.getDay();

      const daysToSaturday =
        6 - dayOfWeek;

      let end = new Date(currentDate);

      end.setDate(
        end.getDate() + daysToSaturday
      );

      if (end.getMonth() !== month) {
        end = new Date(
          year,
          month + 1,
          0
        );
      }

      weeks.push({
        label: `Week ${weekCount}`,
        start: start
          .toISOString()
          .split("T")[0],
        end: end
          .toISOString()
          .split("T")[0],
      });

      currentDate = new Date(end);

      currentDate.setDate(
        currentDate.getDate() + 1
      );

      weekCount++;
    }

    return weeks;
  };

  // --------------------------------------------------
  // DATE FILTER
  // --------------------------------------------------

  const handleDateSelection = (
    type: string,
    value?: any
  ) => {
    const today = new Date();

    let start = "";
    let end = "";

    if (type === "Year") {
      start = `${value}-01-01`;
      end = `${value}-12-31`;

      setSelectedLabel(`Year: ${value}`);
      setIsAllData(false);
    }

    else if (type === "Month") {
      start = new Date(
        today.getFullYear(),
        value,
        1
      )
        .toISOString()
        .split("T")[0];

      end = new Date(
        today.getFullYear(),
        value + 1,
        0
      )
        .toISOString()
        .split("T")[0];

      const monthName =
        new Date(
          today.getFullYear(),
          value
        ).toLocaleString(
          "default",
          {
            month: "long",
          }
        );

      setSelectedLabel(
        `Month: ${monthName}`
      );

      setIsAllData(false);
    }

    else if (type === "Week") {
      start = value.start;
      end = value.end;

      setSelectedLabel(value.label);
      setIsAllData(false);
    }

    else if (type === "All") {
      start = "2024-01-01";

      end = new Date()
        .toISOString()
        .split("T")[0];

      setSelectedLabel("All Data");
      setIsAllData(true);
    }

    setFromDate(start);
    setToDate(end);
    setActiveDropdown(null);
  };

  // --------------------------------------------------
  // FILTER LEADS ACCORDING TO DATE
  // --------------------------------------------------

  const filteredLeads = leads.filter((lead) => {
    if (isAllData) {
      return true;
    }

    const leadDate =
      lead.latestFollowup ||
      lead.sourcingDate ||
      lead.createdAt?.split("T")[0];

    if (!leadDate) {
      return false;
    }

    const dateOnly =
      leadDate.split("T")[0];

    return (
      dateOnly >= fromDate &&
      dateOnly <= toDate
    );
  });

  // --------------------------------------------------
  // KPI CALCULATIONS FROM REAL API DATA
  // --------------------------------------------------

  const totalLeads =
    filteredLeads.length;

  const totalContacts =
    filteredLeads.filter(
      (lead) =>
        !!lead.contact_person ||
        !!lead.contact_no
    ).length;

  const totalCalls =
    filteredLeads.filter(
      (lead) =>
        [
          "Interested",
          "Not Interested",
          "Not Picked",
          "Onboard",
          "Call Later",
        ].includes(
          lead.status || ""
        )
    ).length;

  const newCalls =
    filteredLeads.filter(
      (lead) =>
        lead.status === "New"
    ).length;

  const followupCalls =
    filteredLeads.filter(
      (lead) =>
        !!lead.nextFollowup
    ).length;

  const picked =
    filteredLeads.filter(
      (lead) =>
        lead.status !== "Not Picked" &&
        lead.status !== "New"
    ).length;

  const notPicked =
    filteredLeads.filter(
      (lead) =>
        lead.status === "Not Picked"
    ).length;

  const interested =
    filteredLeads.filter(
      (lead) =>
        lead.status === "Interested"
    ).length;

  // --------------------------------------------------
  // PROJECTIONS
  // --------------------------------------------------

  const mpLess50 =
    filteredLeads.filter(
      (lead) =>
        lead.projection === "MP < 50"
    ).length;

  const mpGreater50 =
    filteredLeads.filter(
      (lead) =>
        lead.projection === "MP > 50"
    ).length;

  const wpLess50 =
    filteredLeads.filter(
      (lead) =>
        lead.projection === "WP < 50"
    ).length;

  const wpGreater50 =
    filteredLeads.filter(
      (lead) =>
        lead.projection === "WP > 50"
    ).length;

  // --------------------------------------------------
  // SALES / ONBOARD
  // --------------------------------------------------

  const sales =
    filteredLeads.filter(
      (lead) =>
        lead.status === "Onboard"
    ).length;



  // --------------------------------------------------
  // FOLLOWUPS
  // --------------------------------------------------

  const followUps = filteredLeads
    .filter(
      (lead) =>
        !!lead.nextFollowup
    )
    .sort((a, b) =>
      (a.nextFollowup || "")
        .localeCompare(
          b.nextFollowup || ""
        )
    );


    const fetchSalesBreakdown = async () => {
  try {
    setBreakdownLoading(true);

    const params = new URLSearchParams({
      fromDate,
      toDate,
      isAllData: String(isAllData),
    });

    const res = await apiFetch(
      `/api/interactions/sales-breakdown?${params.toString()}`,
      { cache: "no-store" }
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to fetch breakdown");
    }

    setBreakdownList(data.breakdown || []);
    setBreakdownTotal(data.grandTotal || 0);
     setSalesTotal(data.grandTotal || 0);
  } catch (error) {
    console.error("Breakdown fetch error:", error);
    setBreakdownList([]);
    setBreakdownTotal(0);
  } finally {
    setBreakdownLoading(false);
  }
};
  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------
useEffect(() => {
  // Jab tak fromDate/toDate set na ho, skip karo
  if (!fromDate || !toDate) return;

  fetchSalesBreakdown();
}, [fromDate, toDate, isAllData]);
  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-['Calibri'] text-slate-800">

      {/* SIDEBAR */}

      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onOpenProfile={handleOpenProfile}
      />

      {/* MAIN */}

      <div className="flex-1 overflow-y-auto pb-4 custom-scrollbar">

        {/* HEADER */}

        <div className="bg-white px-6 py-2 border-b border-gray-200 sticky top-0 z-10 shadow-sm flex flex-col md:flex-row justify-between items-center gap-3">

          <div className="flex items-center gap-4">

            <h1 className="text-2xl font-black text-[#24a9ec] tracking-tight uppercase italic">
              Lead Dashboard
            </h1>

          </div>

          {/* FILTER */}

          <div
            className="flex items-center gap-4"
            ref={wrapperRef}
          >

            {latestInteractionDate && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#24a9ec]/10 border border-[#24a9ec]/30 rounded-lg">

                <Clock
                  size={12}
                  className="text-[#24a9ec]"
                />

                <span className="text-xs font-bold text-[#24a9ec]">
                  Latest Date :{" "}
                  {latestInteractionDate}
                </span>

              </div>
            )}

            {/* QUICK FILTER */}

            <div className="flex bg-gray-100 p-1 rounded-lg relative">

              {/* ALL */}

              <button
                onClick={() =>
                  handleDateSelection("All")
                }
                className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${
                  selectedLabel === "All Data"
                    ? "bg-[#24a9ec] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                All
              </button>

              {/* YEAR */}

              <div className="relative">

                <button
                  onClick={() =>
                    setActiveDropdown(
                      activeDropdown === "year"
                        ? null
                        : "year"
                    )
                  }
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md flex items-center gap-1 transition-all ${
                    selectedLabel.includes("Year") ||
                    activeDropdown === "year"
                      ? "bg-[#24a9ec] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Year
                  <ChevronDown size={10} />
                </button>

                {activeDropdown === "year" && (
                  <div className="absolute top-full left-0 mt-2 w-24 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">

                    {getYears().map(
                      (year) => (
                        <button
                          key={year}
                          onClick={() =>
                            handleDateSelection(
                              "Year",
                              year
                            )
                          }
                          className="block w-full text-left px-3 py-1.5 text-xs hover:bg-[#24a9ec] hover:text-white text-gray-700 font-bold"
                        >
                          {year}
                        </button>
                      )
                    )}

                  </div>
                )}

              </div>

              {/* MONTH */}

              <div className="relative">

                <button
                  onClick={() =>
                    setActiveDropdown(
                      activeDropdown === "month"
                        ? null
                        : "month"
                    )
                  }
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md flex items-center gap-1 transition-all ${
                    selectedLabel.includes("Month") ||
                    activeDropdown === "month"
                      ? "bg-[#24a9ec] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Month
                  <ChevronDown size={10} />
                </button>

                {activeDropdown === "month" && (
                  <div className="absolute top-full left-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 max-h-60 overflow-y-auto custom-scrollbar">

                    {Array.from({
                      length: 12,
                    }).map((_, i) => (

                      <button
                        key={i}
                        onClick={() =>
                          handleDateSelection(
                            "Month",
                            i
                          )
                        }
                        className="block w-full text-left px-3 py-1.5 text-xs hover:bg-[#24a9ec] hover:text-white text-gray-700 font-bold"
                      >
                        {new Date(
                          0,
                          i
                        ).toLocaleString(
                          "default",
                          {
                            month: "long",
                          }
                        )}
                      </button>

                    ))}

                  </div>
                )}

              </div>

              {/* WEEK */}

              <div className="relative">

                <button
                  onClick={() =>
                    setActiveDropdown(
                      activeDropdown === "week"
                        ? null
                        : "week"
                    )
                  }
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md flex items-center gap-1 transition-all ${
                    selectedLabel.includes("Week") ||
                    activeDropdown === "week"
                      ? "bg-[#24a9ec] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Week
                  <ChevronDown size={10} />
                </button>

                {activeDropdown === "week" && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">

                    {getWeeks().map(
                      (week, idx) => (

                        <button
                          key={idx}
                          onClick={() =>
                            handleDateSelection(
                              "Week",
                              week
                            )
                          }
                          className="block w-full text-left px-3 py-1.5 text-xs hover:bg-[#24a9ec] hover:text-white text-gray-700 font-bold"
                        >
                          {week.label}
                        </button>

                      )
                    )}

                  </div>
                )}

              </div>

            </div>

            {/* CUSTOM DATE */}

            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">

              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setIsAllData(false);
                  setSelectedLabel("Custom");
                }}
                className="text-xs font-bold text-slate-700 outline-none w-24 bg-transparent"
              />

              <span className="text-gray-300">
                -
              </span>

              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setIsAllData(false);
                  setSelectedLabel("Custom");
                }}
                className="text-xs font-bold text-slate-700 outline-none w-24 bg-transparent"
              />

            </div>

          </div>

        </div>

        {/* CONTENT */}

        <div className="p-4 flex flex-col gap-6">

          {/* OVERALL */}

          <div>

            <h4 className="text-xs font-black text-[#24a9ec] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">

              <span className="w-1 h-4 bg-[#24a9ec] rounded-full"></span>

              1. Overall Metrics

            </h4>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">

              {/* TOTAL LEADS */}

              <KpiCard
                title="Total Leads"
                total={String(totalLeads)}
                icon={<SearchIcon />}
                color="blue"
                
              />

              {/* CONTACTS */}

              <KpiCard
                title="Total Contacts"
                total={String(totalContacts)}
                icon={
                  <UserCheck size={18} />
                }
                color="blue"
                onClick={() =>
                  router.push("/leads")
                }
              />

              {/* CALLS */}

              <KpiCard
                title="Total Calls"
                total={String(totalCalls)}
                icon={
                  <Phone size={18} />
                }
                color="purple"
                
              />

              {/* NEW CALLS */}

              <KpiCard
                title="New Calls"
                total={String(newCalls)}
                icon={
                  <PhoneOutgoing size={18} />
                }
                color="purple"
                
              />

              {/* FOLLOWUP CALLS */}

              <KpiCard
                title="Followup Calls"
                total={String(followupCalls)}
                icon={
                  <PhoneIncoming size={18} />
                }
                color="purple"
              
              />

              {/* PICKED */}

              <KpiCard
                title="Picked"
                total={String(picked)}
                icon={
                  <CheckCircle size={18} />
                }
                color="green"
                
              />

              {/* NOT PICKED */}

              <KpiCard
                title="Not Picked"
                total={String(notPicked)}
                icon={
                  <PhoneMissed size={18} />
                }
                color="red"
                
              />

              {/* INTERESTED */}

              <KpiCard
                title="Interested"
                total={String(interested)}
                icon={
                  <TrendingUp size={18} />
                }
                color="green"
                
              />

              {/* PROJECTION */}

              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full cursor-pointer">

                <div className="mb-2">

                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider leading-tight">
                    Projection
                  </p>

                </div>

                <div className="grid grid-cols-2 gap-0.5">

                  <div className="bg-[#24a9ec] p-1 flex justify-between items-center rounded-l">

                    <span className="text-[11px] font-bold text-white">
                      MP &lt; 50
                    </span>

                    <span className="text-[11px] font-bold text-white">
                      {mpLess50}
                    </span>

                  </div>

                  <div className="bg-[#24a9ec] p-1 flex justify-between items-center rounded-r">

                    <span className="text-[11px] font-bold text-white">
                      MP &gt; 50
                    </span>

                    <span className="text-[11px] font-bold text-white">
                      {mpGreater50}
                    </span>

                  </div>

                  <div className="bg-[#24a9ec] p-1 flex justify-between items-center rounded-l">

                    <span className="text-[11px] font-bold text-white">
                      WP &lt; 50
                    </span>

                    <span className="text-[11px] font-bold text-white">
                      {wpLess50}
                    </span>

                  </div>

                  <div className="bg-[#24a9ec] p-1 flex justify-between items-center rounded-r">

                    <span className="text-[11px] font-bold text-white">
                      WP &gt; 50
                    </span>

                    <span className="text-[11px] font-bold text-white">
                      {wpGreater50}
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* CLIENTS */}

          <div>

            <h4 className="text-xs font-black text-teal-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">

              <UserCheck size={14} />

              2. Clients

            </h4>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">

              <KpiCard
  title="Sales"
  total={`₹${salesTotal.toLocaleString("en-IN")}`}
  icon={<SearchIcon />}
  color="teal"
  onClick={() => {
    setIsSalesModalOpen(true);
  }}
/>

            </div>

          </div>

        </div>

      </div>

      {/* RIGHT SIDEBAR */}

      <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col shadow-xl z-10 shrink-0">

        {/* HEADER */}

        <div className="bg-white px-6 py-4 border-b border-gray-200 shadow-sm sticky top-0 z-10 flex items-center justify-between">

          <h2 className="text-sm font-black text-[#24a9ec] flex items-center gap-2 tracking-tight uppercase italic">

            <Clock
              size={18}
              className="text-[#24a9ec]"
            />

            Follow-up Schedule

            <span className="text-[10px] font-bold bg-[#24a9ec]/10 text-[#24a9ec] border border-[#24a9ec]/30 px-2 py-0.5 rounded ml-2">

              {new Date().toLocaleDateString(
                "en-GB",
                {
                  day: "2-digit",
                  month: "short",
                  year: "2-digit",
                }
              )}

            </span>

          </h2>

        </div>

        {/* FOLLOWUPS */}

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">

          {loading ? (

            <div className="text-center text-sm text-gray-400 py-10">
              Loading follow-ups...
            </div>

          ) : followUps.length === 0 ? (

            <div className="text-center text-sm text-gray-400 py-10">
              No follow-ups found
            </div>

          ) : (

            followUps.map((item) => (

              <div
                key={
                  item.id ||
                  item._id ||
                  `${item.company}-${item.nextFollowup}`
                }
                className="p-3 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-[#24a9ec] transition-all group relative"
              >

                <div className="pl-2.5">

                  <h4 className="font-bold text-gray-800 text-sm leading-tight line-clamp-1 mb-1.5">

                    {item.company ||
                      "Unknown Company"}

                  </h4>

                  <div className="flex items-center gap-1.5 mb-2">

                    <div className="p-1 bg-gray-100 rounded-full text-gray-500">

                      <UserCheck size={10} />

                    </div>

                    <span className="text-xs font-bold text-slate-700">

                      {item.contact_person ||
                        "No Contact"}

                    </span>

                  </div>

                  {/* FOLLOWUP DATE */}

                  <div className="mb-2">

                    <span className="text-[10px] font-bold text-[#24a9ec]">

                      Follow-up:{" "}

                      {item.nextFollowup
                        ? new Date(
                            item.nextFollowup
                          ).toLocaleDateString(
                            "en-GB"
                          )
                        : "-"}

                    </span>

                  </div>

                  {/* LAST DISCUSSION */}

                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-2 mb-3">

                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5 flex items-center gap-1">

                      <FileText size={10} />

                      Last Discussion

                    </p>

                    <p className="text-xs text-slate-600 italic leading-snug">

                    
                      {item.remarks ||
                        "No remarks"}

                    </p>

                  </div>

                  {/* CALL */}

                  <button
                    onClick={() => {
  const company = item.company?.trim();

  if (!company) {
    alert("Company name not found");
    return;
  }

  router.push(`/dashboard/leadgen/leads?search=${encodeURIComponent(company)}`);
}}
                    className="w-full bg-[#24a9ec] text-white text-[10px] font-bold py-2 rounded-lg hover:bg-[#1a8bc4] transition-colors flex items-center justify-center gap-1.5"
                  >

                    <Phone size={12} />

                    Call Now

                  </button>

                </div>

              </div>

            ))

          )}

        </div>

        {/* DATABASE BUTTON */}

        <div className="p-4 border-t border-gray-100 mt-auto bg-white">

          <button
            onClick={() =>
              router.push("/leads")
            }
            className="w-full bg-[#24a9ec] hover:bg-[#1a8bc4] text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 text-sm"
          >

            <Database size={16} />

            Open Full Database

          </button>

        </div>

      </div>
      {/* SALES BREAKDOWN MODAL */}
{isSalesModalOpen && (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4"
    onClick={() => setIsSalesModalOpen(false)}
  >
    <div
      className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="bg-[#24a9ec] p-4 flex justify-between items-center text-white">
        <div>
          <h3 className="font-bold text-lg uppercase tracking-wide">
            Sales Breakdown
          </h3>
          <p className="text-xs opacity-80 font-mono mt-1">
            Material-wise summary from interactions
          </p>
        </div>

        <button
          onClick={() => setIsSalesModalOpen(false)}
          className="hover:bg-white/20 p-1 rounded-full transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 max-h-[70vh] overflow-y-auto">
        <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-xl flex justify-between items-center">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            Total Sales
          </span>
          <span className="text-xl font-black text-teal-700">
            ₹{breakdownTotal.toLocaleString("en-IN")}
          </span>
        </div>

        {breakdownLoading ? (
          <div className="text-center text-gray-400 py-10 font-bold uppercase tracking-widest text-xs">
            Loading breakdown...
          </div>
        ) : breakdownList.length === 0 ? (
          <div className="text-center text-gray-400 py-10 font-bold uppercase tracking-widest text-xs">
            No sales data found
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase border-b border-gray-200">
              <tr>
                <th className="p-3">Material</th>
                <th className="p-3 text-center">Interactions</th>
                <th className="p-3 text-right">Sale Amount</th>
              </tr>
            </thead>

            <tbody className="text-sm divide-y divide-gray-100">
              {breakdownList.map((item) => (
                <tr
                  key={item.material}
                  className="hover:bg-[#24a9ec]/5 transition"
                >
                  <td className="p-3 font-bold text-gray-700">
                    {item.material}
                  </td>
                  <td className="p-3 text-center font-bold text-gray-600">
                    {item.count}
                  </td>
                  <td className="p-3 text-right font-bold text-green-700">
                    ₹{item.total.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t flex justify-end">
        <button
          onClick={() => setIsSalesModalOpen(false)}
          className="px-5 py-2 bg-[#24a9ec] hover:bg-[#1a8bc4] text-white rounded-lg font-bold text-sm"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </div>
    
  );
}

// ==================================================
// KPI CARD
// ==================================================

function KpiCard({
  title,
  total,
  icon,
  color, 
  onClick,
}: {
  title: string;
  total: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}) {

  const colorClasses: Record<
    string,
    string
  > = {

    blue:
      "bg-blue-50 text-blue-700 border-blue-100",

    purple:
      "bg-purple-50 text-purple-700 border-purple-100",

    green:
      "bg-green-50 text-green-700 border-green-100",

    red:
      "bg-red-50 text-red-700 border-red-100",

    orange:
      "bg-orange-50 text-orange-700 border-orange-100",

    teal:
      "bg-teal-50 text-teal-700 border-teal-100",
  };

  const activeColor =
    colorClasses[color] ||
    colorClasses.blue;

  return (

    <div
      className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full cursor-pointer hover:border-[#24a9ec]"
      onClick={onClick}
    >

      <div className="flex items-center gap-3 mb-2">

        <div
          className={`p-2 rounded-lg ${activeColor} border shrink-0`}
        >
          {icon}
        </div>

        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider leading-tight">
          {title}
        </p>

      </div>

      <div className="flex items-end justify-between">

        <h3 className="text-2xl font-black text-slate-800 leading-none ml-1">
          {total}
        </h3>

      </div>

    </div>
    
  );
}

// ==================================================
// SEARCH ICON
// ==================================================

function SearchIcon() {

  return (

    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >

      <circle
        cx="11"
        cy="11"
        r="8"
      />

      <path d="m21 21-4.3-4.3" />

    </svg>
  );
}