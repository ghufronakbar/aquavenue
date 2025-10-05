import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-gradient-to-r from-grad-start to-grad-end">
                <AppLogoIcon className="size-5 fill-current text-white" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-black bg-gradient-to-r from-grad-start to-grad-end text-transparent bg-clip-text">
                    Aqua Venue
                </span>
            </div>
        </>
    );
}
