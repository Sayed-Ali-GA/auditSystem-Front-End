import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../Authcontext/Authcontext";

import storeServices from "../../../services/StoreServices";
import brandService from "../../../services/BrandServices";
import locationServices from "../../../services/locationServices";
import OpsManagerServices from "../../../services/OpsManagerServices";
import storeManagerServices from "../../../services/StoreManagerServices";
import AuditPointsServices from "../../../services/AuditPointsServices";

import "./HomePage.css";


const HomePage = () => {

    const { user: currentUser } = useAuth();

    const [auditPoint, setAuditPoint] = useState([]);
    const [stores, setStores] = useState([]);
    const [brands, setBrands] = useState([]);
    const [locations, setLocations] = useState([]);
    const [opsManagers, setOpsManagers] = useState([]);
    const [storeManagers, setStoreManagers] = useState([]);
    const [loading, setLoading] = useState(true);



    useEffect(() => {

        const getStoreManagers = async () => {
            try {
                const data = await storeManagerServices.index();
                setStoreManagers(data);
            } catch (error) {
                console.log(error);
            }
        };

        getStoreManagers();

    }, []);



    useEffect(() => {

        const getAuditPoints = async () => {
            try {
                const data = await AuditPointsServices.index();
                setAuditPoint(data);
            } catch (error) {
                console.log(error);
            }
        };

        getAuditPoints();

    }, []);




    useEffect(() => {

        const getStores = async () => {

            try {

                const data = await storeServices.index();
                setStores(data);

            } catch (error) {

                console.log(error);

            } finally {

                setLoading(false);

            }

        };

        getStores();

    }, []);




    useEffect(() => {

        const getBrands = async () => {

            try {

                const data = await brandService.index();
                setBrands(data);

            } catch (error) {

                console.log(error);

            }

        };

        getBrands();

    }, []);




    useEffect(() => {

        const getLocations = async () => {

            try {

                const data = await locationServices.index();
                setLocations(data);

            } catch (error) {

                console.log(error);

            }

        };

        getLocations();

    }, []);




    useEffect(() => {

        const getOpsManagers = async () => {

            try {

                const data = await OpsManagerServices.index();
                setOpsManagers(data);

            } catch (error) {

                console.log(error);

            }

        };

        getOpsManagers();

    }, []);




    if (loading) {
        return <h2>Loading...</h2>;
    }


    console.log("User: ", currentUser)

    return (

        <div className="home-page">


            <h1>
                Welcome, {currentUser?.UserName || "User"}
            </h1>


            <p>
                Manage stores, audits, criteria and reports efficiently.
            </p>



            <div className="dashboard-cards">



                {currentUser?.RoleID === 1 && (

                    <>


                        <Link to="/stores">
                            <div className="card">
                                <h3>Stores</h3>
                                <h2>{stores.length}</h2>
                            </div>
                        </Link>



                        <Link to="/brands">
                            <div className="card">
                                <h3>Brands</h3>
                                <h2>{brands.length}</h2>
                            </div>
                        </Link>



                        <Link to="/location">
                            <div className="card">
                                <h3>Locations</h3>
                                <h2>{locations.length}</h2>
                            </div>
                        </Link>



                        <Link to="/opsmanagers">
                            <div className="card">
                                <h3>Ops Managers</h3>
                                <h2>{opsManagers.length}</h2>
                            </div>
                        </Link>



                        <Link to="/storemanagers">
                            <div className="card">
                                <h3>Store Managers</h3>
                                <h2>{storeManagers.length}</h2>
                            </div>
                        </Link>



                        <Link to="/users">
                            <div className="card">
                                <h3>Users</h3>
                                <h2>Manage</h2>
                            </div>
                        </Link>


                    </>

                )}




                {(currentUser?.RoleID === 1 || currentUser?.RoleID === 2) && (

                    <Link to="/audit-points">

                        <div className="card">
                            <h3>Audit</h3>
                            <h2>{auditPoint.length}</h2>
                        </div>

                    </Link>

                )}



                {currentUser?.RoleID === 3 && (

                    <Link to="/audit">

                        <div className="card">
                            <h3>Start Audit</h3>
                            <h2>Open</h2>
                        </div>

                    </Link>

                )}



            </div>


        </div>

    );

};


export default HomePage;