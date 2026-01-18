import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    X, Menu, ChevronDown, MapPin, Building2,
    Home as HomeIcon, Waves, Mountain, Palmtree,
    Construction, Landmark, Gem, Trees, Globe
} from "lucide-react";

const Navbar = ({ isMenuOpen, setIsMenuOpen }) => {
    console.log("Navbar is rendering");
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeMegaMenu, setActiveMegaMenu] = useState(null); // 'buy', 'properties', 'services'

    const location = useLocation();
    const isHomePage = location.pathname === "/";

    useEffect(() => {
        const handleScroll = () => {
            // High threshold (90% viewport) on Home, standard threshold on other pages
            const threshold = isHomePage ? window.innerHeight * 0.9 : 50;
            setIsScrolled(window.scrollY > threshold);
        };
        handleScroll(); // Sync state on mount
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isHomePage]);

    const closeMegaMenu = () => setActiveMegaMenu(null);

    const [locations, setLocations] = useState([
        { name: "Kyrenia", icon: <Waves size={15} className="text-caria-turquoise/60" />, slug: "kyrenia" },
        { name: "Esentepe", icon: <Mountain size={15} className="text-caria-turquoise/60" />, slug: "esentepe" },
        { name: "İskele", icon: <Palmtree size={15} className="text-caria-turquoise/60" />, slug: "iskele" },
        { name: "Famagusta", icon: <Landmark size={15} className="text-caria-turquoise/60" />, slug: "famagusta" },
    ]);

    const [countries, setCountries] = useState([
        { name: "Turkey", slug: "turkey" },
        { name: "Cyprus", slug: "cyprus" },
        { name: "Italy", slug: "italy" },
        { name: "Spain", slug: "spain" },
    ]);

    const [siteContent, setSiteContent] = useState([]);
    const [dynamicMenus, setDynamicMenus] = useState([]);

    useEffect(() => {
        const fetchNavbarData = async () => {
            try {
                const apiBase = "http://localhost:5001/api";
                // Fetch dynamic menus
                const menuRes = await fetch(`${apiBase}/cms/menus`);
                const menuData = await menuRes.json();
                setDynamicMenus(menuData);

                const response = await fetch(`${apiBase}/cms/country-guides`);
                const data = await response.json();
                if (data && data.length > 0) {
                    setCountries(data.map(g => ({ name: g.country_name_tr, slug: g.slug })));
                }

                // Fetch site content for contact info
                const contentRes = await fetch(`${apiBase}/cms/content`);
                const contentData = await contentRes.json();
                setSiteContent(contentData);
            } catch (e) {
                console.error("Error fetching Navbar data:", e);
            }
        };
        fetchNavbarData();
    }, []);

    const getSetting = (key, defaultValue) => {
        const setting = siteContent?.find(c => c.content_key === key);
        return setting ? setting.value_tr : defaultValue;
    };

    const phone = getSetting('footer_phone', '+90 548 123 4567');
    const email = getSetting('footer_email', 'info@cariaestates.com');

    const categories = [
        { name: "Luxury Villas", icon: <Gem size={18} className="text-gray-400" /> },
        { name: "Sea View Apartments", icon: <Building2 size={18} className="text-gray-400" /> },
        { name: "New Developments", icon: <Construction size={18} className="text-gray-400" /> },
        { name: "Investment Land", icon: <Trees size={18} className="text-gray-400" /> },
    ];

    const services = [
        { name: "Property Management", link: "/services#management" },
        { name: "Legal Consulting", link: "/services#legal" },
        { name: "Decoration Packages", link: "/services#decoration" },
        { name: "Transfer Services", link: "/services#transfer" },
        { name: "After Sales", link: "/services#after-sales" },
        { name: "Interior Design", link: "/services#interior" },
    ];

    const howToBuyItems = [
        { name: "In Turkey", desc: "Türkiye'de Satın Alma", slug: "turkey" },
        { name: "In North Cyprus", desc: "Kuzey Kıbrıs'ta Satın Alma", slug: "cyprus" },
        { name: "In Italy", desc: "İtalya'da Satın Alma", slug: "italy" },
        { name: "In Spain", desc: "İspanya'da Satın Alma", slug: "spain" },
    ];

    const [mobileSubmenu, setMobileSubmenu] = useState(null);

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${isScrolled || activeMegaMenu
                    ? "bg-white/95 backdrop-blur-md shadow-sm text-caria-slate"
                    : "bg-transparent text-white"
                    }`}
                onMouseLeave={closeMegaMenu}
            >
                <div className="max-w-[1400px] mx-auto px-8 lg:px-12 py-6">
                    <div className="flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center">

                        {/* Left Navigation */}
                        <nav className="hidden lg:flex items-center space-x-10 justify-start">
                            {[
                                { label: "BUY", path: "/buy", mega: "buy" },
                                { label: "RENT", path: "/rent" },
                                { label: "PROPERTIES", path: "/properties", mega: "properties" },
                                { label: "COUNTRIES", path: "/properties", mega: "countries" }
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="relative group py-2"
                                    onMouseEnter={() => item.mega ? setActiveMegaMenu(item.mega) : closeMegaMenu()}
                                >
                                    <Link
                                        to={item.path}
                                        className={`text-[11px] tracking-[0.2em] font-semibold transition-all duration-300 hover:text-caria-turquoise flex items-center gap-1.5 ${isScrolled || activeMegaMenu ? "text-caria-slate" : "text-white"
                                            }`}
                                    >
                                        {item.label}
                                        {item.mega && <ChevronDown size={14} className={`transition-transform duration-300 ${activeMegaMenu === item.mega ? 'rotate-180' : ''}`} />}
                                    </Link>
                                </div>
                            ))}
                        </nav>

                        {/* Center Logo - Only visible on scroll on Home, always visible elsewhere */}
                        <div className={`flex items-center justify-center transition-all duration-700 ${!isHomePage || isScrolled || activeMegaMenu ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                            }`}>
                            <Link to="/" className="flex items-center" onClick={closeMegaMenu}>
                                <img
                                    src="/logo.png"
                                    alt="Caria Estates"
                                    className={`h-14 w-auto transition-all duration-700 ${isScrolled || activeMegaMenu ? '' : 'brightness-0 invert'}`}
                                />
                            </Link>
                        </div>

                        {/* Right Navigation */}
                        <nav className="hidden lg:flex items-center space-x-10 justify-end">
                            {[
                                { label: "HOW TO BUY", path: "/consulting-services", mega: "how-to-buy" },
                                { label: "SERVICES", path: "/services", mega: "services" },
                                { label: "VIEWING TRIP", path: "/contact" },
                                { label: "ABOUT US", path: "/about" },
                                { label: "CONTACT", path: "/contact" },
                                ...(dynamicMenus || [])
                                    .filter(m => m && m.menu_type === 'header')
                                    .map(m => ({ label: (m.title || "").toUpperCase(), path: m.url }))
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="relative group py-2"
                                    onMouseEnter={() => item.mega ? setActiveMegaMenu(item.mega) : closeMegaMenu()}
                                >
                                    <Link
                                        to={item.path || "#"}
                                        className={`text-[11px] tracking-[0.2em] font-semibold transition-all duration-300 hover:text-caria-turquoise flex items-center gap-1.5 ${isScrolled || activeMegaMenu ? "text-caria-slate" : "text-white"
                                            }`}
                                    >
                                        {item.label}
                                        {item.mega && <ChevronDown size={14} className={`transition-transform duration-300 ${activeMegaMenu === item.mega ? 'rotate-180' : ''}`} />}
                                    </Link>
                                </div>
                            ))}
                        </nav>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`lg:hidden z-[110] ${isScrolled || activeMegaMenu ? 'text-caria-slate' : 'text-white'}`}
                        >
                            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    </div>
                </div>

                {/* Mega Menu / Dropdown Panels */}
                <div
                    className={`absolute top-[90%] left-0 w-full bg-white border-t border-gray-100 shadow-2xl overflow-hidden transition-all duration-300 ease-out sm-mega-menu ${activeMegaMenu ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
                        }`}
                    style={{ maxHeight: activeMegaMenu ? '500px' : '0px' }}
                >
                    {/* BUY & PROPERTIES MEGA MENU */}
                    {(activeMegaMenu === 'buy' || activeMegaMenu === 'properties') && (
                        <div className="max-w-[1200px] mx-auto px-12 py-10 grid grid-cols-2 gap-24">
                            {/* Regions Column */}
                            <div>
                                <h4 className="text-[10px] tracking-[0.4em] uppercase text-gray-400 font-bold mb-8 flex items-center gap-2">
                                    <span className="w-4 h-[1px] bg-gray-200"></span>
                                    LOCATIONS
                                </h4>
                                <div className="grid grid-cols-1 gap-6">
                                    {locations.map((loc) => (
                                        <Link
                                            key={loc.name}
                                            to={`/properties?region=${loc.slug}`}
                                            className="group flex items-center gap-4 text-caria-slate hover:text-caria-turquoise transition-all duration-300"
                                            onClick={closeMegaMenu}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-caria-mint transition-colors">
                                                {loc.icon}
                                            </div>
                                            <span className="text-base font-light tracking-wide">{loc.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Categories Column */}
                            <div>
                                <h4 className="text-[10px] tracking-[0.4em] uppercase text-gray-400 font-bold mb-8 flex items-center gap-2">
                                    <span className="w-4 h-[1px] bg-gray-200"></span>
                                    CATEGORIES
                                </h4>
                                <div className="grid grid-cols-1 gap-6">
                                    {categories.map((cat) => (
                                        <Link
                                            key={cat.name}
                                            to="/properties"
                                            className="group flex items-center gap-4 text-caria-slate hover:text-caria-turquoise transition-all duration-300"
                                            onClick={closeMegaMenu}
                                        >
                                            <div className="w-10 h-10 flex items-center justify-center">
                                                {cat.icon}
                                            </div>
                                            <span className="text-base font-light tracking-wide">{cat.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* COUNTRIES DROPDOWN */}
                    {activeMegaMenu === 'countries' && (
                        <div className="max-w-[800px] mx-auto py-10 px-12">
                            <h4 className="text-[10px] tracking-[0.5em] uppercase text-gray-400 font-bold mb-8 text-center">EXPLORE COUNTRIES</h4>
                            <div className="grid grid-cols-4 gap-8">
                                {countries.map((country) => (
                                    <Link
                                        key={country.name}
                                        to={`/properties?country=${country.slug}`}
                                        className="group flex flex-col items-center gap-3 text-caria-slate hover:text-caria-turquoise transition-all duration-300"
                                        onClick={closeMegaMenu}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-caria-mint transition-colors">
                                            <Globe size={20} className="text-caria-turquoise/60" />
                                        </div>
                                        <span className="text-xs font-light tracking-widest uppercase">{country.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SERVICES DROPDOWN */}
                    {activeMegaMenu === 'services' && (
                        <div className="max-w-[1000px] mx-auto py-10 px-12">
                            <h4 className="text-[10px] tracking-[0.5em] uppercase text-gray-400 font-bold mb-12 text-center">OUR SERVICES</h4>
                            <div className="grid grid-cols-3 gap-x-16 gap-y-10">
                                {services.map((service) => (
                                    <Link
                                        key={service.name}
                                        to={service.link}
                                        className="text-[13px] font-extralight tracking-widest text-caria-slate hover:text-caria-turquoise transition-all duration-300 py-3 border-b border-gray-50 hover:border-caria-mint flex items-center justify-between group"
                                        onClick={closeMegaMenu}
                                    >
                                        <span className="opacity-80 group-hover:opacity-100">{service.name}</span>
                                        <ChevronDown size={12} className="-rotate-90 opacity-0 group-hover:opacity-100 transition-all text-caria-mint" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* HOW TO BUY DROPDOWN */}
                    {activeMegaMenu === 'how-to-buy' && (
                        <div className="max-w-[1000px] mx-auto py-10 px-12">
                            <h4 className="text-[10px] tracking-[0.5em] uppercase text-gray-400 font-bold mb-10 text-center">HOW TO BUY</h4>
                            <div className="grid grid-cols-4 gap-8">
                                {howToBuyItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={`/consulting-services?country=${item.slug}`}
                                        className="group flex flex-col items-center gap-3 text-caria-slate hover:text-caria-turquoise transition-all duration-300 text-center"
                                        onClick={closeMegaMenu}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-caria-mint transition-colors">
                                            <Globe size={20} className="text-caria-turquoise/60" />
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[11px] font-medium tracking-widest uppercase mb-1">{item.name}</span>
                                            <span className="text-[9px] font-light tracking-wider text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{item.desc}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-white z-[105] transition-all duration-500 ease-in-out lg:hidden ${isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
                    }`}
            >
                <div className="flex flex-col h-full pt-32 px-10 pb-12 overflow-y-auto">
                    <div className="space-y-8">
                        {/* Main Links */}
                        <div className="flex flex-col space-y-6">
                            {[
                                { label: "BUY", path: "/buy" },
                                { label: "RENT", path: "/rent" },
                                { label: "PROPERTIES", path: "/properties" },
                                { label: "COUNTRIES", path: "/properties" },
                                {
                                    label: "HOW TO BUY",
                                    path: "/consulting-services",
                                    submenu: howToBuyItems
                                },
                                { label: "SERVICES", path: "/services" },
                                { label: "VIEWING TRIP", path: "/contact" },
                                { label: "ABOUT US", path: "/about" },
                                { label: "CONTACT", path: "/contact" },
                                ...(dynamicMenus || [])
                                    .filter(m => m && m.menu_type === 'header')
                                    .map(m => ({ label: (m.title || "").toUpperCase(), path: m.url }))
                            ].map((item) => (
                                <div key={item.label} className="flex flex-col">
                                    <div className="flex items-center justify-between group">
                                        <Link
                                            to={item.path}
                                            className="text-2xl font-serif text-caria-slate tracking-wide"
                                            onClick={() => !item.submenu && setIsMenuOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                        {item.submenu && (
                                            <button
                                                onClick={() => setMobileSubmenu(mobileSubmenu === item.label ? null : item.label)}
                                                className="p-2"
                                            >
                                                <ChevronDown
                                                    size={20}
                                                    className={`transition-transform duration-300 ${mobileSubmenu === item.label ? 'rotate-180' : ''}`}
                                                />
                                            </button>
                                        )}
                                    </div>

                                    {item.submenu && mobileSubmenu === item.label && (
                                        <div className="mt-4 ml-4 flex flex-col space-y-4 border-l-2 border-caria-mint/20 pl-6 py-2 overflow-hidden transition-all animate-in slide-in-from-top-2">
                                            {item.submenu.map((sub) => (
                                                <Link
                                                    key={sub.name}
                                                    to={`/consulting-services?country=${sub.slug}`}
                                                    className="text-sm font-light tracking-[0.1em] text-caria-slate/70 flex flex-col"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    <span className="text-caria-slate font-medium text-xs mb-0.5">{sub.name}</span>
                                                    <span className="text-[10px] opacity-60 italic">{sub.desc}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="w-12 h-px bg-gray-100" />

                        {/* Secondary info */}
                        <div className="space-y-4">
                            <p className="text-[10px] tracking-[0.4em] uppercase text-gray-400 font-bold">Contact</p>
                            <p className="text-sm text-caria-slate font-light">{phone}</p>
                            <p className="text-sm text-caria-slate font-light">{email}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Blur Overlay for Mega Menu */}
            <div
                className={`fixed inset-0 bg-black/5 z-[90] transition-opacity duration-500 backdrop-blur-[2px] ${activeMegaMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={closeMegaMenu}
            />
        </>
    );
};

export default Navbar;
