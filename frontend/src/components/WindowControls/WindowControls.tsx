import React, {useEffect, useState} from "react";
import {Minimize2, X} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {handleMinimise, handleQuit, openLinkInDefaultbrowser} from "@/lib/WindowManager.ts";
import {checkForUpdates} from "@/lib/updateChecker.ts";


const WindowControls = () => {
    const [latestVersion, setLatestVersion] = useState<string | null>(null);
    const [updateAvailable, setUpdateAvailable] = useState(false);

    useEffect(() => {
        checkForUpdates()
            .then((version) => {
                console.log(version);
                if (version) {
                    setLatestVersion(version);
                    setUpdateAvailable(true);
                }
            })
            .catch(console.error);

        const interval = setInterval(() => {
            checkForUpdates()
                .then((version) => {
                    console.log(version);
                    if (version) {
                        setLatestVersion(version);
                        setUpdateAvailable(true);
                    }
                })
                .catch(console.error);
        }, 120000);

        return () => clearInterval(interval);
    }, []);


    return (
        <div className="fixed top-0 left-0 right-0 z-50">
            <div className="flex flex-row h-full border-b-2 bg-background">
                {updateAvailable && (
                    <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 left-2"
                        onClick={() => openLinkInDefaultbrowser(`https://github.com/alexboutros/numbers/releases/tag/${latestVersion}`)}
                    >
                        Update Available
                    </Button>
                )}
                <div
                    className="flex flex-1 h-12"
                    style={{"--wails-draggable": "drag"} as React.CSSProperties}
                />
                <div className="flex h-12 justify-end items-center gap-2 px-2">
                    <Button variant="secondary" size="icon" onClick={() => handleMinimise()}>
                        <Minimize2 className="h-5 w-5"/>
                    </Button>
                    <Button variant="secondary" size="icon" onClick={() => handleQuit()}>
                        <X className="h-5 w-5"/>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default WindowControls;
