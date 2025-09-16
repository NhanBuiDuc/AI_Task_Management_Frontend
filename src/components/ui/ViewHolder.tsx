import React from "react";

interface ViewHolderProps {
    Component: React.ComponentType
}
export function ViewHolder({Component}:ViewHolderProps){
    if (!Component) return null; // render nothing if no component
    return (
        <div className="flex-1 p-4 bg-gray-50 min-h-screen">
            <Component/>
        </div>
    );
}