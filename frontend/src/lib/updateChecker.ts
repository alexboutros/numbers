import  { GetVersion } from "../../wailsjs/go/utils/Utils";

export const checkForUpdates = async (): Promise<string | null> => {
    try {
        // Fetch the current version from the backend
        const CURRENT_VERSION = await GetVersion();
        console.log("Current version:", CURRENT_VERSION);

        // Fetch the latest release information from GitHub
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

        // Compare the current version with the latest version
        if (latestTagName && latestTagName !== CURRENT_VERSION) {
            return latestTagName;
        }

        return null; // No new version available
    } catch (error) {
        console.error("Error checking for updates:", error);
        return null;
    }
};
