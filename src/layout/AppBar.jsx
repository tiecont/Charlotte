import { LOCALES } from '$/constants/options';
import SidebarContext from '$/contexts/sidebarContext';
import { useTheme } from '$/contexts/themeContext';
import CustomTooltip from '$/ui/CustomTooltip';
import ModalBase from '$/ui/ModalBase';
import Search from '$/ui/Search';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import Headroom from 'react-headroom';
import { useNavigate } from 'react-router-dom';
import { useWindowSize } from 'react-use';

const LocaleMenu = ({ active, setActive }) => {
    return (
        <div className="flex flex-col gap-4 p-4">
            {LOCALES.map((locale) => (
                <button
                    key={locale.value}
                    className="group flex items-center gap-2.5 w-fit"
                    onClick={() => setActive(locale.value)}
                >
                    <img className="rounded-full w-5" src={locale.icon} alt={locale.label} />
                    <span
                        className={`text-sm font-medium transition group-hover:text-accent ${
                            active === locale.value ? 'text-accent' : 'text-header'
                        }`}
                    >
                        {locale.label}
                    </span>
                </button>
            ))}
        </div>
    );
};

LocaleMenu.propTypes = {
    active: PropTypes.string.isRequired,
    setActive: PropTypes.func.isRequired,
};

const AppBar = () => {
    const navigate = useNavigate();
    const { width } = useWindowSize();
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const [locale, setLocale] = useState('en-EN');
    const theme = useTheme()
    const toggleTheme = useTheme();
    const { setOpen } = useContext(SidebarContext);

    const activeLocale = LOCALES.find((l) => l.value === locale);

    useEffect(() => {
        setSearchModalOpen(false);
    }, [width]);

    return (
        <>
            <Headroom style={{ zIndex: 999 }}>
                <div className="flex items-center justify-between">
                    {width < 1920 && (
                        <button
                            className="icon text-2xl leading-none"
                            aria-label="Open sidebar"
                            onClick={() => setOpen(true)}
                        >
                            <i className="icon-bars-solid" />
                        </button>
                    )}
                    {width >= 768 && (
                        <Search wrapperClass="flex-1 max-w-[1054px] ml-5 mr-auto 4xl:ml-0" />
                    )}
                    <div className="flex items-center gap-5 md:ml-5 xl:gap-[26px]">
                        {width < 768 && (
                            <button
                                className="text-[20px] leading-none text-gray dark:text-gray-red xl:text-2xl"
                                aria-label="Open search"
                                onClick={() => setSearchModalOpen(true)}
                            >
                                <i className="icon-magnifying-glass-solid" />
                            </button>
                        )}
                        <button
                            className="text-2xl leading-none text-gray dark:text-gray-red"
                            aria-label="Change theme"
                            onClick={toggleTheme}
                        >
                            <i className={`icon-${theme === 'light' ? 'sun-bright' : 'moon'}-regular`} />
                        </button>
                        <CustomTooltip title={<LocaleMenu active={locale} setActive={setLocale} />}>
                            <button
                                className="w-6 h-6 rounded-full overflow-hidden xl:w-8 xl:h-8"
                                aria-label="Change language"
                            >
                                <img src={activeLocale.icon} alt={activeLocale.label} />
                            </button>
                        </CustomTooltip>
                        <div className="relative">
                            <button
                                className="h-8 w-8 rounded-full bg-accent text-widget text-sm flex items-center justify-center relative xl:w-11 xl:h-11 xl:text-lg"
                                onClick={() => navigate('/general-settings')}
                                aria-label="Account menu"
                            >
                                <i className="icon-user-solid" />
                            </button>
                            <span className="badge-online" />
                        </div>
                    </div>
                </div>
            </Headroom>
            {width < 768 && (
                <ModalBase open={searchModalOpen} onClose={() => setSearchModalOpen(false)}>
                    <div className="card max-w-[360px] w-full">
                        <h3 className="mb-3">Search</h3>
                        <Search placeholder="What are you looking for?" />
                    </div>
                </ModalBase>
            )}
        </>
    );
};

export default AppBar;
