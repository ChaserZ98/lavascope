import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import Navbar from "@/components/Navbar";
import TauriTitleBar from "@/components/TauriTitleBar";
import { addScreenSizeListener, screenSizeAtom } from "@/store/screen";
import { useSetAtom } from "jotai";
import checkCompatibility from "./utils/compatibility";

export default function App() {
    const setScreenSize = useSetAtom(screenSizeAtom);
    useEffect(() => {
        checkCompatibility();
        const removeScreenSizeListener = addScreenSizeListener(setScreenSize);
        return () => removeScreenSizeListener();
    }, []);
    return (
        <div className="flex flex-col w-full h-screen">
            <div className="w-full sticky top-0">
                <TauriTitleBar />
                <Navbar />
            </div>
            <div className="flex-1 overflow-auto ">
                <Outlet />
            </div>
            <ToastContainer
                position="bottom-left"
                theme="dark"
                className="select-none"
                toastClassName="!bg-default-200 transition-colors-opacity"
                bodyClassName="text-foreground transition-colors-opacity"
            />
        </div>
    );
}
