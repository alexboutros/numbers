import * as runtime from "../../wailsjs/runtime"

export const handleMinimise = () => {
    runtime.WindowMinimise()
};

export const handleMaximise = () => {
    runtime.WindowMaximise()
};

export const handleQuit = () => {
    runtime.Quit()
};

export const handleHide = () => {
    runtime.WindowHide()
};

export const openLinkInDefaultbrowser = (url: string) => {
    runtime.BrowserOpenURL(url)
}