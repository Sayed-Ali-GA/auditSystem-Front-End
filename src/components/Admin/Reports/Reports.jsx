import { useEffect, useMemo, useState } from "react";
import Select from "react-select";

import {
  FiBarChart2,
  FiPrinter,
  FiFilter,
  FiRefreshCw,
  FiTrendingUp,
  FiTrendingDown,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
} from "react-icons/fi";

import auditServices from "../../../services/AuditorServices";
import brandService from "../../../services/BrandServices";
import locationServices from "../../../services/locationServices";
import storeServices from "../../../services/StoreServices";

import { useAuth } from "../../Authcontext/Authcontext";

import PageHeader from "../Shared/PageHeader";
import LoadingState from "../Shared/LoadingState";

import "../Shared/theme.css";
import "./Reports.css";

/* ------------------------------------------------------------------ */
/* CONSTANTS                                                          */
/* ------------------------------------------------------------------ */

const STATUS_OPTIONS = [
  { value: "Submitted", label: "Submitted" },
  { value: "Needs Revision", label: "Needs Revision" },
  { value: "Rejected", label: "Rejected" },
  { value: "Forwarded", label: "Forwarded" },
  { value: "Completed", label: "Completed" },
];

const RISK_OPTIONS = [
  { value: "Low", label: "Low" },
  { value: "Moderate", label: "Moderate" },
  { value: "High", label: "High" },
];

const RISK_COLORS = {
  Low: "#373e47",
  Moderate: "#9a6700",
  High: "#cf222e",
};

const PENDING_STATUSES = ["submitted", "needs revision", "forwarded"];

const emptyFilters = {
  dateFrom: "",
  dateTo: "",
  brandId: null,
  locationId: null,
  storeSerial: null,
  status: null,
  risk: null,
};

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

const normalizeString = (value) => {
  return String(value ?? "")
    .trim()
    .toLowerCase();
};

const normalizeStatus = (value) => {
  const status = normalizeString(value);

  if (!status) return "";

  if (status === "submitted") {
    return "Submitted";
  }

  if (
    status === "needs revision" ||
    status === "needs_revision" ||
    status === "needsrevision"
  ) {
    return "Needs Revision";
  }

  if (status === "rejected") {
    return "Rejected";
  }

  if (status === "forwarded") {
    return "Forwarded";
  }

  if (status === "completed" || status === "complete") {
    return "Completed";
  }

  return String(value).trim();
};

const normalizeRisk = (value) => {
  const risk = normalizeString(value);

  if (risk === "low") return "Low";
  if (risk === "moderate" || risk === "medium") return "Moderate";
  if (risk === "high") return "High";

  return String(value ?? "").trim();
};

const toNumberOrNull = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(Number(value))
  ) {
    return null;
  }

  return Number(value);
};

const getAuditBrandId = (audit) => {
  return (
    audit.brandid ?? audit.brandId ?? audit.BrandID ?? audit.brand_id ?? null
  );
};

const getAuditLocationId = (audit) => {
  return (
    audit.locationid ??
    audit.locationId ??
    audit.LocationID ??
    audit.location_id ??
    null
  );
};

const getAuditStoreSerial = (audit) => {
  return (
    audit.storeserial ??
    audit.storeSerial ??
    audit.StoreSerial ??
    audit.store_serial ??
    null
  );
};

const getAuditDate = (audit) => {
  return audit.auditdate ?? audit.auditDate ?? audit.AuditDate ?? null;
};

const getAuditStatus = (audit) => {
  return normalizeStatus(audit.status ?? audit.Status ?? "");
};

const getAuditRisk = (audit) => {
  return normalizeRisk(
    audit.risklevel ?? audit.riskLevel ?? audit.RiskLevel ?? "",
  );
};

const parseLocalDate = (value) => {
  if (!value) return null;

  const stringValue = String(value);

  // Date input: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    const [year, month, day] = stringValue.split("-").map(Number);

    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = parseLocalDate(value);

  if (!date) {
    return "-";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMoney = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(Number(value))
  ) {
    return "-";
  }

  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const buildReportRef = () => {
  const d = new Date();

  const pad = (n) => String(n).padStart(2, "0");

  return `AR-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(
    d.getDate(),
  )}-${pad(d.getHours())}${pad(d.getMinutes())}`;
};

const riskBadgeClass = (risk) => {
  const key = normalizeString(risk);

  if (key === "high") {
    return "ag-badge ag-badge-danger-solid";
  }

  if (key === "moderate") {
    return "ag-badge ag-badge-gold";
  }

  if (key === "low") {
    return "ag-badge ag-badge-success";
  }

  return "ag-badge ag-badge-muted";
};

/* ------------------------------------------------------------------ */
/* DONUT CHART                                                        */
/* ------------------------------------------------------------------ */

const DonutChart = ({ data, size = 168, thickness = 24 }) => {
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="reports-donut"
    >
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={thickness}
        />

        {total > 0 &&
          data.map((item, index) => {
            const value = Number(item.value || 0);

            if (value <= 0) {
              return null;
            }

            const dash = (value / total) * circumference;

            const gap = circumference - dash;

            const offset = -((cumulative / total) * circumference);

            cumulative += value;

            return (
              <circle
                key={`${item.label}-${index}`}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={offset}
              />
            );
          })}
      </g>

      <text x="50%" y="46%" textAnchor="middle" className="donut-center-value">
        {total}
      </text>

      <text x="50%" y="62%" textAnchor="middle" className="donut-center-label">
        Total
      </text>
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* DISTRIBUTION BARS                                                  */
/* ------------------------------------------------------------------ */

const DistributionBars = ({ rows, total }) => {
  return (
    <div className="reports-dist-list">
      {rows.map((row) => {
        const value = Number(row.value || 0);

        const pct = total > 0 ? (value / Number(total)) * 100 : 0;

        return (
          <div className="reports-dist-row" key={row.label}>
            <div className="reports-dist-header">
              <span>{row.label}: </span>
              <strong>{value}</strong>
            </div>

            <div className="reports-dist-track">
              <div
                className="reports-dist-fill"
                style={{
                  width: `${Math.min(pct, 100)}%`,
                  background: row.color,
                }}
              />
            </div>

            <span className="reports-dist-count">
              {value} <em>({pct.toFixed(0)}%)</em>
            </span>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */

const Reports = () => {
  const { user } = useAuth();

  /* -------------------------------------------------------------- */
  /* ROLES                                                          */
  /* -------------------------------------------------------------- */

  const isAdmin = Number(user?.RoleID) === 1;
  const isOpsManager = Number(user?.RoleID) === 2;

  /*
   * IMPORTANT:
   * Confirm these RoleIDs against your Roles table.
   *
   * Current code assumes:
   * Auditor     = 4
   * AuditManager = 5
   */
  const isAuditor = Number(user?.RoleID) === 4;
  const isAuditManager = Number(user?.RoleID) === 5;

  /*
   * Auditor does not see Risk Analysis.
   *
   * Admin / Ops Manager / Audit Manager can see it.
   */
  const canViewRiskAnalysis = !isAuditor;

  /* -------------------------------------------------------------- */
  /* STATE                                                          */
  /* -------------------------------------------------------------- */

  const [audits, setAudits] = useState([]);
  const [brands, setBrands] = useState([]);
  const [locations, setLocations] = useState([]);
  const [stores, setStores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    ...emptyFilters,
  });

  const [reportRef] = useState(buildReportRef());
  const [generatedAt] = useState(new Date());

  /* ---------------------------------------------------------------- */
  /* LOAD DATA                                                        */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    let mounted = true;

    const loadAll = async () => {
      try {
        setLoading(true);
        setError("");

        const [auditData, brandData, locationData, storeData] =
          await Promise.all([
            auditServices.index(),
            brandService.index(),
            locationServices.index(),
            storeServices.index(),
          ]);

        if (!mounted) {
          return;
        }

        setAudits(Array.isArray(auditData) ? auditData : []);

        setBrands(Array.isArray(brandData) ? brandData : []);

        setLocations(Array.isArray(locationData) ? locationData : []);

        setStores(Array.isArray(storeData) ? storeData : []);
      } catch (err) {
        console.error("Error loading report data:", err);

        if (mounted) {
          setError("Could not load report data. Please try again.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAll();

    return () => {
      mounted = false;
    };
  }, []);

  /* ---------------------------------------------------------------- */
  /* OPTIONS                                                          */
  /* ---------------------------------------------------------------- */

  const brandOptions = useMemo(() => {
    return brands
      .map((brand) => ({
        value: brand.brandid ?? brand.brandId ?? brand.BrandID,
        label: brand.brandname ?? brand.brandName ?? brand.BrandName ?? "-",
      }))
      .filter((brand) => brand.value !== null && brand.value !== undefined);
  }, [brands]);

  const locationOptions = useMemo(() => {
    return locations
      .map((location) => ({
        value:
          location.locationid ?? location.locationId ?? location.LocationID,
        label:
          location.locationname ??
          location.locationName ??
          location.LocationName ??
          "-",
      }))
      .filter(
        (location) => location.value !== null && location.value !== undefined,
      );
  }, [locations]);

  /* ---------------------------------------------------------------- */
  /* STORE OPTIONS                                                    */
  /* ---------------------------------------------------------------- */

  const storeOptions = useMemo(() => {
    return stores
      .filter((store) => {
        const storeBrandId = store.brandid ?? store.brandId ?? store.BrandID;

        const storeLocationId =
          store.locationid ?? store.locationId ?? store.LocationID;

        const matchesBrand =
          !filters.brandId || Number(storeBrandId) === Number(filters.brandId);

        const matchesLocation =
          !filters.locationId ||
          Number(storeLocationId) === Number(filters.locationId);

        return matchesBrand && matchesLocation;
      })
      .map((store) => ({
        value: store.storeserial ?? store.storeSerial ?? store.StoreSerial,

        label: `${
          store.storecode ?? store.storeCode ?? store.StoreCode ?? "-"
        } — ${store.brandname ?? store.brandName ?? store.BrandName ?? "-"}`,
      }))
      .filter((store) => store.value !== null && store.value !== undefined);
  }, [stores, filters.brandId, filters.locationId]);

  /* ---------------------------------------------------------------- */
  /* RESET FILTERS                                                    */
  /* ---------------------------------------------------------------- */

  const handleReset = () => {
    setFilters({
      ...emptyFilters,
    });
  };

  /* ---------------------------------------------------------------- */
  /* FILTERED AUDITS                                                  */
  /* ---------------------------------------------------------------- */

  const filteredAudits = useMemo(() => {
    return audits.filter((audit) => {
      /* ------------------------------------------------------------ */
      /* DATE FROM                                                     */
      /* ------------------------------------------------------------ */

      if (filters.dateFrom) {
        const auditDate = parseLocalDate(getAuditDate(audit));

        const fromDate = parseLocalDate(filters.dateFrom);

        if (!auditDate || !fromDate) {
          return false;
        }

        if (auditDate < fromDate) {
          return false;
        }
      }

      /* ------------------------------------------------------------ */
      /* DATE TO                                                       */
      /* ------------------------------------------------------------ */

      if (filters.dateTo) {
        const auditDate = parseLocalDate(getAuditDate(audit));

        const toDate = parseLocalDate(filters.dateTo);

        if (!auditDate || !toDate) {
          return false;
        }

        toDate.setHours(23, 59, 59, 999);

        if (auditDate > toDate) {
          return false;
        }
      }

      /* ------------------------------------------------------------ */
      /* BRAND                                                         */
      /* ------------------------------------------------------------ */

      if (filters.brandId) {
        const auditBrandId = getAuditBrandId(audit);

        if (auditBrandId !== null && auditBrandId !== undefined) {
          if (Number(auditBrandId) !== Number(filters.brandId)) {
            return false;
          }
        } else {
          const selectedBrand = brandOptions.find(
            (brand) => Number(brand.value) === Number(filters.brandId),
          );

          const auditBrandName = normalizeString(
            audit.brandname ?? audit.brandName ?? audit.BrandName,
          );

          if (
            selectedBrand &&
            auditBrandName !== normalizeString(selectedBrand.label)
          ) {
            return false;
          }
        }
      }

      /* ------------------------------------------------------------ */
      /* LOCATION                                                      */
      /* ------------------------------------------------------------ */

      if (filters.locationId) {
        const auditLocationId = getAuditLocationId(audit);

        if (auditLocationId !== null && auditLocationId !== undefined) {
          if (Number(auditLocationId) !== Number(filters.locationId)) {
            return false;
          }
        } else {
          const selectedLocation = locationOptions.find(
            (location) => Number(location.value) === Number(filters.locationId),
          );

          const auditLocationName = normalizeString(
            audit.locationname ?? audit.locationName ?? audit.LocationName,
          );

          if (
            selectedLocation &&
            auditLocationName !== normalizeString(selectedLocation.label)
          ) {
            return false;
          }
        }
      }

      /* ------------------------------------------------------------ */
      /* STORE                                                         */
      /* ------------------------------------------------------------ */

      if (filters.storeSerial) {
        const auditStoreSerial = getAuditStoreSerial(audit);

        if (auditStoreSerial === null || auditStoreSerial === undefined) {
          return false;
        }

        if (Number(auditStoreSerial) !== Number(filters.storeSerial)) {
          return false;
        }
      }

      /* ------------------------------------------------------------ */
      /* STATUS                                                        */
      /* ------------------------------------------------------------ */

      if (filters.status) {
        const auditStatus = normalizeString(getAuditStatus(audit));

        const selectedStatus = normalizeString(filters.status);

        if (auditStatus !== selectedStatus) {
          return false;
        }
      }

      /* ------------------------------------------------------------ */
      /* RISK                                                          */
      /* ------------------------------------------------------------ */

      if (filters.risk) {
        const auditRisk = normalizeString(getAuditRisk(audit));

        const selectedRisk = normalizeString(filters.risk);

        if (auditRisk !== selectedRisk) {
          return false;
        }
      }

      return true;
    });
  }, [audits, filters, brandOptions, locationOptions]);

  /* ---------------------------------------------------------------- */
  /* STATS                                                            */
  /* ---------------------------------------------------------------- */

  const stats = useMemo(() => {
    const total = filteredAudits.length;

    /* -------------------------------------------------------------- */
    /* SCORED                                                          */
    /* -------------------------------------------------------------- */

    const scored = filteredAudits.filter((audit) => {
      const score = toNumberOrNull(
        audit.finalpercentage ?? audit.finalPercentage ?? audit.FinalPercentage,
      );

      return score !== null;
    });

    const avgScore =
      scored.length > 0
        ? scored.reduce((sum, audit) => {
            const score = toNumberOrNull(
              audit.finalpercentage ??
                audit.finalPercentage ??
                audit.FinalPercentage,
            );

            return sum + score;
          }, 0) / scored.length
        : null;

    /* -------------------------------------------------------------- */
    /* RISK                                                            */
    /* -------------------------------------------------------------- */

    const riskCounts = {
      Low: 0,
      Moderate: 0,
      High: 0,
    };

    let unknownRisk = 0;

    filteredAudits.forEach((audit) => {
      const risk = normalizeString(getAuditRisk(audit));

      if (risk === "low") {
        riskCounts.Low += 1;
      } else if (risk === "moderate") {
        riskCounts.Moderate += 1;
      } else if (risk === "high") {
        riskCounts.High += 1;
      } else {
        unknownRisk += 1;
      }
    });

    /* -------------------------------------------------------------- */
    /* STATUS                                                          */
    /* -------------------------------------------------------------- */

    const statusCounts = {};

    filteredAudits.forEach((audit) => {
      const status = getAuditStatus(audit) || "Unknown";

      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const completed = filteredAudits.filter(
      (audit) => normalizeString(getAuditStatus(audit)) === "completed",
    ).length;

    const pending = filteredAudits.filter((audit) =>
      PENDING_STATUSES.includes(normalizeString(getAuditStatus(audit))),
    ).length;

    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      avgScore,
      riskCounts,
      unknownRisk,
      statusCounts,
      completed,
      pending,
      completionRate,
    };
  }, [filteredAudits]);

  /* ---------------------------------------------------------------- */
  /* STORE RANKING                                                    */
  /* ---------------------------------------------------------------- */

  const storeRanking = useMemo(() => {
    const map = {};

    filteredAudits.forEach((audit) => {
      const score = toNumberOrNull(
        audit.finalpercentage ?? audit.finalPercentage ?? audit.FinalPercentage,
      );

      if (score === null) {
        return;
      }

      const storeSerial = getAuditStoreSerial(audit);

      const storeCode =
        audit.storecode ?? audit.storeCode ?? audit.StoreCode ?? "-";

      const key =
        storeSerial !== null && storeSerial !== undefined
          ? `id-${storeSerial}`
          : `code-${storeCode}`;

      if (!map[key]) {
        map[key] = {
          storeserial: storeSerial,
          storecode: storeCode,
          brandname:
            audit.brandname ?? audit.brandName ?? audit.BrandName ?? "-",
          locationname:
            audit.locationname ??
            audit.locationName ??
            audit.LocationName ??
            "-",
          total: 0,
          count: 0,
        };
      }

      map[key].total += score;
      map[key].count += 1;
    });

    return Object.values(map)
      .map((store) => ({
        ...store,
        avg: store.count > 0 ? store.total / store.count : 0,
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [filteredAudits]);

  const topStores = storeRanking.slice(0, 5);

  const bottomStores = [...storeRanking]
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 5);

  /* ---------------------------------------------------------------- */
  /* FILTER SUMMARY                                                   */
  /* ---------------------------------------------------------------- */

  const filterSummary = useMemo(() => {
    const parts = [];

    if (filters.dateFrom || filters.dateTo) {
      parts.push(
        `Period: ${filters.dateFrom ? formatDate(filters.dateFrom) : "…"} – ${
          filters.dateTo ? formatDate(filters.dateTo) : "…"
        }`,
      );
    }

    if (filters.brandId) {
      const brand = brandOptions.find(
        (item) => Number(item.value) === Number(filters.brandId),
      );

      if (brand) {
        parts.push(`Brand: ${brand.label}`);
      }
    }

    if (filters.locationId) {
      const location = locationOptions.find(
        (item) => Number(item.value) === Number(filters.locationId),
      );

      if (location) {
        parts.push(`Location: ${location.label}`);
      }
    }

    if (filters.storeSerial) {
      const store = storeOptions.find(
        (item) => Number(item.value) === Number(filters.storeSerial),
      );

      if (store) {
        parts.push(`Store: ${store.label}`);
      }
    }

    if (filters.status) {
      parts.push(`Status: ${normalizeStatus(filters.status)}`);
    }

    if (filters.risk) {
      parts.push(`Risk: ${normalizeRisk(filters.risk)}`);
    }

    return parts.length > 0
      ? parts.join("  ·  ")
      : "All records — no filters applied";
  }, [filters, brandOptions, locationOptions, storeOptions]);

  /* ---------------------------------------------------------------- */
  /* PRINT                                                            */
  /* ---------------------------------------------------------------- */

  const handlePrint = () => {
    window.print();
  };

  /* ---------------------------------------------------------------- */
  /* LOADING                                                          */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return <LoadingState />;
  }

  /* ---------------------------------------------------------------- */
  /* CHART DATA                                                       */
  /* ---------------------------------------------------------------- */

  const riskDonutData = [
    {
      label: "Low",
      value: stats.riskCounts.Low,
      color: RISK_COLORS.Low,
    },
    {
      label: "Moderate",
      value: stats.riskCounts.Moderate,
      color: RISK_COLORS.Moderate,
    },
    {
      label: "High",
      value: stats.riskCounts.High,
      color: RISK_COLORS.High,
    },
  ];

  const statusRows = Object.entries(stats.statusCounts).map(
    ([label, value]) => ({
      label,
      value,
      color: "#373e47",
    }),
  );

  /* ---------------------------------------------------------------- */
  /* RENDER                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="reports-page">
      {/* ========================================================== */}
      {/* SCREEN HEADER                                              */}
      {/* ========================================================== */}

      <PageHeader
        icon={<FiBarChart2 />}
        eyebrow="Insights"
        title="Audit Reports"
        subtitle="Filter, review, and print formal audit performance reports."
        actions={
          <button
            type="button"
            className="ag-btn ag-btn-primary"
            onClick={handlePrint}
          >
            <FiPrinter />
            Print report
          </button>
        }
      />

      {/* ========================================================== */}
      {/* ERROR                                                       */}
      {/* ========================================================== */}

      {error && <div className="ag-error-banner no-print">{error}</div>}

      {/* ========================================================== */}
      {/* FILTERS                                                     */}
      {/* ========================================================== */}

      <div className="ag-card no-print">
        <div className="ag-card-title-row">
          <div className="ag-card-title">
            <FiFilter />
            Filters
          </div>

          <button
            type="button"
            className="ag-btn ag-btn-ghost ag-btn-sm"
            onClick={handleReset}
          >
            <FiRefreshCw />
            Reset filters
          </button>
        </div>

        <div className="ag-form-grid">
          {/* Date From */}

          <div className="ag-field">
            <label>Date from</label>

            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  dateFrom: e.target.value,
                }))
              }
            />
          </div>

          {/* Date To */}

          <div className="ag-field">
            <label>Date to</label>

            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  dateTo: e.target.value,
                }))
              }
            />
          </div>

          {/* Brand */}

          <div className="ag-field">
            <label>Brand</label>

            <Select
              classNamePrefix="ag-rs"
              className="ag-select"
              options={brandOptions}
              placeholder="All brands"
              isClearable
              value={
                brandOptions.find(
                  (option) => Number(option.value) === Number(filters.brandId),
                ) || null
              }
              onChange={(option) =>
                setFilters((prev) => ({
                  ...prev,
                  brandId: option?.value ?? null,
                  storeSerial: null,
                }))
              }
            />
          </div>

          {/* Location */}

          <div className="ag-field">
            <label>Location</label>

            <Select
              classNamePrefix="ag-rs"
              className="ag-select"
              options={locationOptions}
              placeholder="All locations"
              isClearable
              value={
                locationOptions.find(
                  (option) =>
                    Number(option.value) === Number(filters.locationId),
                ) || null
              }
              onChange={(option) =>
                setFilters((prev) => ({
                  ...prev,
                  locationId: option?.value ?? null,
                  storeSerial: null,
                }))
              }
            />
          </div>

          {/* Store */}

          <div className="ag-field">
            <label>Store</label>

            <Select
              classNamePrefix="ag-rs"
              className="ag-select"
              options={storeOptions}
              placeholder="All stores"
              isClearable
              value={
                storeOptions.find(
                  (option) =>
                    Number(option.value) === Number(filters.storeSerial),
                ) || null
              }
              onChange={(option) =>
                setFilters((prev) => ({
                  ...prev,
                  storeSerial: option?.value ?? null,
                }))
              }
            />
          </div>

          {/* Status */}

          <div className="ag-field">
            <label>Status</label>

            <Select
              classNamePrefix="ag-rs"
              className="ag-select"
              options={STATUS_OPTIONS}
              placeholder="All statuses"
              isClearable
              value={
                STATUS_OPTIONS.find(
                  (option) =>
                    normalizeString(option.value) ===
                    normalizeString(filters.status),
                ) || null
              }
              onChange={(option) =>
                setFilters((prev) => ({
                  ...prev,
                  status: option?.value ?? null,
                }))
              }
            />
          </div>

          {/* Risk */}

          <div className="ag-field">
            <label>Risk level</label>

            <Select
              classNamePrefix="ag-rs"
              className="ag-select"
              options={RISK_OPTIONS}
              placeholder="All risk levels"
              isClearable
              value={
                RISK_OPTIONS.find(
                  (option) =>
                    normalizeString(option.value) ===
                    normalizeString(filters.risk),
                ) || null
              }
              onChange={(option) =>
                setFilters((prev) => ({
                  ...prev,
                  risk: option?.value ?? null,
                }))
              }
            />
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* PRINT LETTERHEAD                                           */}
      {/* ========================================================== */}

      <div className="reports-letterhead print-only">
        <div className="reports-letterhead-top">
          <div className="reports-letterhead-brand">
            <img src="/images/logo.png" alt="Apparel Group" />

            <div>
              <h2>Apparel Group</h2>

              <span>Internal Audit &amp; Compliance Division</span>
            </div>
          </div>

          <div className="reports-letterhead-meta">
            <div>
              <span>Report Reference</span>

              <strong>{reportRef}</strong>
            </div>

            <div>
              <span>Generated</span>

              <strong>{formatDateTime(generatedAt)}</strong>
            </div>

            <div>
              <span>Prepared By</span>

              <strong>{user?.UserName || "-"}</strong>
            </div>
          </div>
        </div>

        <h1 className="reports-letterhead-title">Audit Performance Report</h1>

        <p className="reports-letterhead-scope">{filterSummary}</p>

        <p className="reports-letterhead-classification">
          Internal Use Only — Not for External Distribution
        </p>
      </div>

      {/* ========================================================== */}
      {/* FILTER SUMMARY                                             */}
      {/* ========================================================== */}

      <div className="reports-summary-line no-print">
        <FiFilter />
        {filterSummary}
      </div>

      {/* ========================================================== */}
      {/* EXECUTIVE SUMMARY                                          */}
      {/* ========================================================== */}

      <div className="ag-section-title">Executive Summary</div>

      <div className="reports-kpi-grid">
        {/* Total Audits */}

        <div className="reports-kpi-card">
          <div className="reports-kpi-icon">
            <FiBarChart2 />
          </div>

          <span className="reports-kpi-label">Total Audits</span>

          <div className="reports-kpi-value">{stats.total}</div>
        </div>

        {/* Average Score */}

        <div className="reports-kpi-card">
          <div className="reports-kpi-icon">
            <FiTrendingUp />
          </div>

          <span className="reports-kpi-label">Average Score</span>

          <div className="reports-kpi-value">
            {stats.avgScore !== null ? `${stats.avgScore.toFixed(1)}%` : "-"}
          </div>
        </div>

        {/* Completion Rate */}

        <div className="reports-kpi-card">
          <div className="reports-kpi-icon">
            <FiCheckCircle />
          </div>

          <span className="reports-kpi-label">Completion Rate</span>

          <div className="reports-kpi-value">
            {stats.completionRate.toFixed(0)}%
          </div>
        </div>

        {/* High Risk */}

        <div className="reports-kpi-card kpi-danger">
          <div className="reports-kpi-icon">
            <FiAlertTriangle />
          </div>

          <span className="reports-kpi-label">High Risk Audits</span>

          <div className="reports-kpi-value">{stats.riskCounts.High}</div>
        </div>

        {/* Pending */}

        <div className="reports-kpi-card">
          <div className="reports-kpi-icon">
            <FiClock />
          </div>

          <span className="reports-kpi-label">Pending Review</span>

          <div className="reports-kpi-value">{stats.pending}</div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* RISK ANALYSIS                                              */}
      {/* ========================================================== */}

      {canViewRiskAnalysis && (
        <>
          <div className="ag-section-title">Risk Analysis</div>

          <div className="reports-charts-row">
            {/* Risk Distribution */}

            <div className="ag-card reports-chart-card">
              <div className="ag-card-title">Risk Distribution</div>

              <div className="reports-donut-wrap">
                <DonutChart data={riskDonutData} />

                <ul className="reports-legend">
                  {riskDonutData.map((item) => (
                    <li key={item.label}>
                      <span
                        className="reports-legend-dot"
                        style={{
                          background: item.color,
                        }}
                      />

                      {item.label}

                      <strong>{item.value}</strong>
                    </li>
                  ))}
                </ul>
              </div>

              {stats.unknownRisk > 0 && (
                <p className="ag-empty-state">
                  {stats.unknownRisk} audit
                  {stats.unknownRisk !== 1 ? "s" : ""} without a recognized risk
                  level.
                </p>
              )}
            </div>

            {/* Status */}

            <div className="ag-card reports-chart-card">
              <div className="ag-card-title">Status Breakdown</div>

              {statusRows.length === 0 ? (
                <p className="ag-empty-state">No data available.</p>
              ) : (
                <DistributionBars rows={statusRows} total={stats.total} />
              )}
            </div>
          </div>
        </>
      )}

      {/* ========================================================== */}
      {/* STATUS BREAKDOWN FOR AUDITOR                               */}
      {/* ========================================================== */}

      {!canViewRiskAnalysis && (
        <>
          <div className="ag-section-title">Status Analysis</div>

          <div className="ag-card reports-chart-card">
            <div className="ag-card-title">Status Breakdown</div>

            {statusRows.length === 0 ? (
              <p className="ag-empty-state">No data available.</p>
            ) : (
              <DistributionBars rows={statusRows} total={stats.total} />
            )}
          </div>
        </>
      )}

      {/* ========================================================== */}
      {/* STORE RANKING                                              */}
      {/* ========================================================== */}

      <div className="ag-section-title">Store Performance Ranking</div>

      <div className="reports-ranking-row">
        {/* TOP STORES */}

        <div className="ag-card reports-ranking-card">
          <div className="ag-card-title">
            <FiTrendingUp />
            Top Performing Stores
          </div>

          <div className="ag-table-wrap">
            <table className="reports-ranking-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Store</th>
                  <th>Brand</th>
                  <th>Location</th>
                  <th>Score</th>
                </tr>
              </thead>

              <tbody>
                {topStores.length === 0 && (
                  <tr>
                    <td colSpan={5} className="ag-empty-state">
                      No scored audits.
                    </td>
                  </tr>
                )}

                {topStores.map((store, index) => (
                  <tr key={store.storeserial ?? store.storecode ?? index}>
                    <td>{index + 1}</td>

                    <td>{store.storecode || "-"}</td>

                    <td>{store.brandname || "-"}</td>

                    <td>{store.locationname || "-"}</td>

                    <td>
                      <span className="reports-score-pill good">
                        {store.avg.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTTOM STORES */}

        <div className="ag-card reports-ranking-card">
          <div className="ag-card-title">
            <FiTrendingDown />
            Stores Requiring Attention
          </div>

          <div className="ag-table-wrap">
            <table className="reports-ranking-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Store</th>
                  <th>Brand</th>
                  <th>Location</th>
                  <th>Score</th>
                </tr>
              </thead>

              <tbody>
                {bottomStores.length === 0 && (
                  <tr>
                    <td colSpan={5} className="ag-empty-state">
                      No scored audits.
                    </td>
                  </tr>
                )}

                {bottomStores.map((store, index) => (
                  <tr key={store.storeserial ?? store.storecode ?? index}>
                    <td>{index + 1}</td>

                    <td>{store.storecode || "-"}</td>

                    <td>{store.brandname || "-"}</td>

                    <td>{store.locationname || "-"}</td>

                    <td>
                      <span className="reports-score-pill bad">
                        {store.avg.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* DETAILED AUDIT RECORDS                                    */}
      {/* ========================================================== */}

      <div className="ag-section-title">Detailed Audit Records</div>

      <div className="ag-card">
        <div className="ag-card-title">
          Audit details ({filteredAudits.length})
        </div>

        <div className="ag-table-wrap">
          <table className="ag-table reports-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Store</th>
                <th>Brand</th>
                <th>Location</th>
                <th>Auditor</th>
                <th>Cashier</th>
                <th>Status</th>
                <th>Score</th>
                <th>Risk</th>
              </tr>
            </thead>

            <tbody>
              {filteredAudits.length === 0 && (
                <tr>
                  <td colSpan={9} className="ag-empty-state">
                    No audits match the selected filters.
                  </td>
                </tr>
              )}

              {filteredAudits.map((audit, index) => {
                const auditId =
                  audit.assignmentid ??
                  audit.assignmentId ??
                  audit.auditid ??
                  audit.auditID ??
                  audit.auditId ??
                  index;

                const status = getAuditStatus(audit);

                const risk = getAuditRisk(audit);

                const score = toNumberOrNull(
                  audit.finalpercentage ??
                    audit.finalPercentage ??
                    audit.FinalPercentage,
                );

                return (
                  <tr key={auditId}>
                    <td data-label="Date">{formatDate(getAuditDate(audit))}</td>

                    <td data-label="Store">
                      {audit.storecode ??
                        audit.storeCode ??
                        audit.StoreCode ??
                        "-"}
                    </td>

                    <td data-label="Brand">
                      {audit.brandname ??
                        audit.brandName ??
                        audit.BrandName ??
                        "-"}
                    </td>

                    <td data-label="Location">
                      {audit.locationname ??
                        audit.locationName ??
                        audit.LocationName ??
                        "-"}
                    </td>

                    <td data-label="Auditor">
                      {audit.auditorname ??
                        audit.auditorName ??
                        audit.AuditorName ??
                        "-"}
                    </td>

                    <td data-label="Cashier">
                      {audit.cashiername ??
                        audit.cashierName ??
                        audit.CashierName ??
                        "-"}
                    </td>

                    <td data-label="Status">
                      <span className="ag-badge ag-badge-muted">
                        {status || "-"}
                      </span>
                    </td>

                    <td data-label="Score">
                      {score !== null ? `${score.toFixed(2)}%` : "-"}
                    </td>

                    <td data-label="Risk">
                      {risk ? (
                        <span className={riskBadgeClass(risk)}>{risk}</span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================== */}
      {/* PRINT SIGNATURE BLOCK                                      */}
      {/* ========================================================== */}

      <div className="reports-signoff print-only">
        <div className="reports-signoff-item">
          <span>Prepared By</span>

          <div className="reports-signoff-line" />

          <em>{user?.UserName || ""}</em>
        </div>

        <div className="reports-signoff-item">
          <span>Reviewed By</span>

          <div className="reports-signoff-line" />

          <em>&nbsp;</em>
        </div>

        <div className="reports-signoff-item">
          <span>Approved By</span>

          <div className="reports-signoff-line" />

          <em>&nbsp;</em>
        </div>
      </div>

      {/* ========================================================== */}
      {/* PRINT FOOTER                                               */}
      {/* ========================================================== */}

      <div className="reports-print-footer print-only">
        Apparel Group — Internal Audit &amp; Compliance Division · Report{" "}
        {reportRef} · Confidential
      </div>
    </div>
  );
};

export default Reports;
