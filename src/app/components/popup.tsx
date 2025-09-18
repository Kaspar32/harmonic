'use client'

import { ReactNode } from "react";

type PopUpProps = {
    onClose: () => void;
    children: ReactNode;
    width?: string;
}

export default function PopUp({ onClose, children, width = "max-w-sm" }: PopUpProps) {

    return (

        <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
            <div className={`bg-white p-6 rounded-2xl shadow-lg w-full ${width} relative`}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-black bg-yellow-200 hover:bg-yellow-100 px-3 py-1 rounded font-bold"
                >
                    X
                </button>
                {children}
            </div>
        </div>

    );



}