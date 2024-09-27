import {ThemeProvider} from "@/components/theme-provider.tsx";
import HomeScreen from "@/components/HomeScreen/HomeScreen.tsx";

function App() {

    return (
        <ThemeProvider defaultTheme={"dark"} storageKey={"vite-ui-theme"}>
            <HomeScreen />
        </ThemeProvider>
    )
}

export default App
