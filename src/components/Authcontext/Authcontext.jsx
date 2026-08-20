import React, { createContext, useContext, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);


const getUserFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);

        return {
            UserID: decoded.UserID,
            OracleID: decoded.OracleID,
            RoleID: decoded.RoleID,
            LocationID: decoded.LocationID,
            UserName: decoded.UserName,
            StoreSerial: decoded.StoreSerial,
            StoreCode: decoded.StoreCode,
            IsStoreAccount: Boolean(decoded.IsStoreAccount),
        };
    } catch (error) {
        return null;
    }
};



export const AuthProvider = ({ children }) => {


    const [token, setToken] = useState(() =>
        localStorage.getItem("token")
    );


    const [user, setUser] = useState(() =>
        getUserFromToken()
    );


const login = useCallback(({ token: newToken }) => {
    localStorage.setItem("token", newToken);

    const decoded = jwtDecode(newToken);

    const userData = {
        UserID: decoded.UserID,
        OracleID: decoded.OracleID,
        RoleID: decoded.RoleID,
        LocationID: decoded.LocationID,
        UserName: decoded.UserName,
        StoreSerial: decoded.StoreSerial,
        StoreCode: decoded.StoreCode,
        IsStoreAccount: Boolean(decoded.IsStoreAccount),
    };

    setToken(newToken);
    setUser(userData);
}, []);


    const logout = useCallback(() => {

        localStorage.removeItem("token");

        setToken(null);
        setUser(null);

    }, []);



    const value = {

        token,
        user,
        isAuthenticated: Boolean(token),
        login,
        logout

    };


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );

};



export const useAuth = () => {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider.");
    }

    return context;

};