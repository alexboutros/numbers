import  { GetVersion } from "../../wailsjs/go/main/AppUtils";

export const checkForUpdates = async (): Promise<string | null> => {
    try {
        const CURRENT_VERSION = await GetVersion();

        const response = await fetch("https://api.github.com/repos/alexboutros/numbers/releases/latest", {
            headers: {
                "Accept": "application/vnd.github.v3+json"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch latest release.");
        }

        const data = await response.json();
        const latestTagName = data.tag_name;

        if (latestTagName && latestTagName !== CURRENT_VERSION) {
            return latestTagName;
        }

        return null;
    } catch (error) {
        console.error("Error checking for updates:", error);
        return null;
    }
};
