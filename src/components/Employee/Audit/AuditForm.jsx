import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Link } from "react-router-dom";

import storeServices from "../../../services/StoreServices";
import auditServices from "../../../services/AuditorServices";
import { useAuth } from "../../Authcontext/Authcontext";
import "./audit.css";

const AuditForm = () => {
    const { user } = useAuth();

    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [drafts, setDrafts] = useState([]);
    const [loadingDrafts, setLoadingDrafts] = useState(true);

    useEffect(() => {
        const getStores = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await storeServices.index();

                const options = response.map((store) => ({
                    value: store.storeserial || store.StoreSerial,
                    label: `${store.storecode || store.StoreCode} - ${
                        store.brandname || store.BrandName
                    }`,
                    data: store
                }));

                setStores(options);
            } catch (error) {
                console.log(error);
                setError("Could not load stores. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        getStores();
    }, []);

    useEffect(() => {
        const getDrafts = async () => {
            try {
                setLoadingDrafts(true);
                const data = await auditServices.index();
                const mine = (Array.isArray(data) ? data : []).filter(
                    (a) =>
                        a.status === "Draft" &&
                        Number(a.auditorid) === Number(user?.UserID)
                );
                setDrafts(mine);
            } catch (error) {
                console.log(error);
            } finally {
                setLoadingDrafts(false);
            }
        };

        if (user?.UserID) getDrafts();
    }, [user?.UserID]);

    const getValue = (small, big) => {
        return selectedStore.data[small] || selectedStore.data[big];
    };

    return (
        <div className="audit-page">
            <div className="audit-header">
                <div>
                    <h1>Start an Audit</h1>
                    <p className="subtitle">
                        Search for a store to begin a new audit.
                    </p>
                </div>
                <Link to="/Audits" className="audit-btn secondary">
                    View Past Audits
                </Link>
            </div>

            {error && <div className="audit-error">{error}</div>}

            {!loadingDrafts && drafts.length > 0 && (
                <div className="audit-card audit-drafts-card">
                    <h3 className="audit-drafts-title">Continue a Draft</h3>
                    <p className="subtitle" style={{ marginBottom: 14 }}>
                        You have unfinished audits. Pick one up where you left off.
                    </p>

                    <div className="audit-drafts-list">
                        {drafts.map((draft) => (
                            <div className="audit-draft-item" key={draft.assignmentid}>
                                <div>
                                    <strong>
                                        {draft.storecode} — {draft.brandname}
                                    </strong>
                                    <span className="audit-draft-meta">
                                        {draft.locationname} ·{" "}
                                        {draft.auditdate
                                            ? new Date(draft.auditdate).toLocaleDateString()
                                            : "No date set yet"}
                                    </span>
                                </div>
                                <Link
                                    to={`/AuditDetails/${draft.storeserial}?draftId=${draft.assignmentid}`}
                                    className="audit-btn secondary"
                                >
                                    Continue
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="audit-card">
                <Select
                    options={stores}
                    value={selectedStore}
                    onChange={setSelectedStore}
                    placeholder="Search Store Code..."
                    isSearchable
                    isLoading={loading}
                />

                {selectedStore && (
                    <div className="audit-store-summary">
                        <div className="audit-store-item">
                            <span>Store Code</span>
                            <strong>{getValue("storecode", "StoreCode")}</strong>
                        </div>

                        <div className="audit-store-item">
                            <span>Brand</span>
                            <strong>{getValue("brandname", "BrandName")}</strong>
                        </div>

                        <div className="audit-store-item">
                            <span>Location</span>
                            <strong>
                                {getValue("locationname", "LocationName")}
                            </strong>
                        </div>

                        <div className="audit-store-item">
                            <span>Ops Manager</span>
                            <strong>
                                {getValue("opsmanagername", "OpsManagerName")}
                            </strong>
                        </div>

                        <div className="audit-store-item">
                            <span>Store Manager</span>
                            <strong>
                                {getValue("storemanagername", "StoreManagerName")}
                            </strong>
                        </div>
                    </div>
                )}
            </div>

            {selectedStore && (
                <div className="audit-actions">
                    <Link
                        to={`/AuditDetails/${selectedStore.data.storeserial || selectedStore.data.StoreSerial}`}
                        state={{ store: selectedStore.data }}
                        className="audit-btn"
                    >
                        Start Audit
                    </Link>
                </div>
            )}
        </div>
    );
};

export default AuditForm;