import { createContext, useContext } from "react";
import { managementInterface, type ManagementInterface } from "../services/ManagementInterface";

const ManagementInterfaceContext = createContext<ManagementInterface>(managementInterface);

export const useManagementInterface = () => useContext(ManagementInterfaceContext);

export const ManagementInterfaceProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <ManagementInterfaceContext.Provider value={managementInterface}>
            {children}
        </ManagementInterfaceContext.Provider>
    );
};
