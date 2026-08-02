import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Link } from "react-router-dom";

import storeServices from "../../../services/StoreServices";
import "./audit.css";

const AuditForm = () => {
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
                                {getValue(
                                    "opsmanagername",
                                    "OpsManagerName"
                                )}
                            </strong>
                        </div>

                        <div className="audit-store-item">
                            <span>Store Manager</span>
                            <strong>
                                {getValue(
                                    "storemanagername",
                                    "StoreManagerName"
                                )}
                            </strong>
                        </div>
                    </div>
                )}
            </div>

            {selectedStore && (
                <div className="audit-actions">
                <Link
                    to={`/AuditDetails/${selectedStore.data.storeserial || selectedStore.data.StoreSerial}`}
                    state={{
                        store:selectedStore.data
                    }}
                >
                    Start Audit
                </Link>
                </div>
            )}
        </div>
    );
};

export default AuditForm;