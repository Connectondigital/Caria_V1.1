import React, { useState, useEffect, useCallback } from "react";
import Card from "components/card";
import { propertyService, advisorService, featureService } from "../../../../api";
import GalleryManager from "./GalleryManager";

// MOVE HELPERS OUTSIDE TO FIX FOCUS BUG
const SectionTitle = ({ title }) => (
    <div className="bg-[#f8f9fa] p-3 mb-6 border-l-4 border-brand-500">
        <h5 className="font-bold text-navy-700 uppercase text-sm">{title}</h5>
    </div>
);

const RenderSelect = ({ id, label, options, value, onChange, required = false }) => (
    <div className="flex flex-col mb-4">
        <label className="text-xs font-bold text-gray-700 mb-2">
            {required && <span className="text-red-500 mr-1">*</span>}{label}
        </label>
        <select
            id={id}
            value={value || ""}
            onChange={onChange}
            className="w-full rounded border border-gray-300 p-2 text-sm focus:border-brand-500 outline-none bg-white font-medium dark:bg-navy-800 dark:border-white/10 dark:text-white"
        >
            <option value="">--Seçiniz--</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const RenderInput = ({ id, label, placeholder, type = "text", value, onChange, required = false, helpText = "" }) => (
    <div className="flex flex-col mb-4">
        <label className="text-xs font-bold text-gray-700 mb-2">
            {required && <span className="text-red-500 mr-1">*</span>}{label}
        </label>
        <input
            id={id}
            type={type}
            placeholder={placeholder}
            value={value || ""}
            onChange={onChange}
            className="w-full rounded border border-gray-300 p-2 text-sm focus:border-brand-500 outline-none dark:bg-navy-800 dark:border-white/10 dark:text-white"
        />
        {helpText && <span className="text-[10px] text-gray-400 mt-1">{helpText}</span>}
    </div>
);

const PropertyForm = ({ property, onClose, onSuccess }) => {

    const parseFeatures = (data) => {
        try {
            if (!data) return [];
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) { return []; }
    };

    const [formData, setFormData] = useState(() => {
        const initial = property || {
            title: "", title_en: "", slug: "", price: "0",
            region: "Kyrenia", kocan_tipi: "Eşdeğer", beds_room_count: "3+1",
            baths_count: "2", plot_area: "", closed_area: "", description: "",
            description_en: "", image: "", ozellikler_ic: "[]", ozellikler_dis: "[]",
            ozellikler_konum: "[]", advisor_id: null, is_featured: false,
            location: "", balcony: "1", distance_sea: "", distance_center: "",
            distance_airport: "", gallery: "[]", status: "Satılık Emlak",
            property_type: "Villa", is_furnished: "Hayır", building_age: "0",
            floor_level: "1", site_within: "Hayır"
        };
        return {
            ...initial,
            ozellikler_ic: initial.ozellikler_ic || "[]",
            ozellikler_dis: initial.ozellikler_dis || "[]",
            ozellikler_konum: initial.ozellikler_konum || "[]",
            gallery: initial.gallery || "[]",
            is_featured: initial.is_featured === true || initial.is_featured === 1 || initial.is_featured === "Evet",
            advisor_id: initial.advisor_id ? Number(initial.advisor_id) : null
        };
    });

    const [advisors, setAdvisors] = useState([]);
    const [featureDefinitions, setFeatureDefinitions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [advRes, featRes] = await Promise.all([
                    advisorService.getAdvisors(),
                    featureService.getFeatures()
                ]);
                setAdvisors(advRes.data);
                setFeatureDefinitions(featRes.data);
                console.log("Loaded Features:", featRes.data);
            } catch (err) {
                console.error("Error fetching form data:", err);
            }
        };
        fetchData();
    }, []);

    const handleChange = useCallback((e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    }, []);

    const toggleFeature = (category, label) => {
        const fieldMap = { interior: "ozellikler_ic", exterior: "ozellikler_dis", general: "ozellikler_konum" };
        const field = fieldMap[category];
        const current = parseFeatures(formData[field]);
        const next = current.includes(label) ? current.filter(x => x !== label) : [...current, label];
        setFormData(prev => ({ ...prev, [field]: JSON.stringify(next) }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        try {
            const data = { ...formData };

            // CRITICAL: Ensure SLUG exists
            if (!data.slug) {
                if (data.title) {
                    data.slug = data.title.toLowerCase()
                        .replace(/ /g, "-")
                        .replace(/[^\w-]+/g, "")
                        .replace(/-+/g, "-");
                } else if (data.title_en) {
                    data.slug = data.title_en.toLowerCase()
                        .replace(/ /g, "-")
                        .replace(/[^\w-]+/g, "")
                        .replace(/-+/g, "-");
                } else {
                    data.slug = `house-${Date.now()}`;
                }
            }

            // Ensure booleans and numbers are correct
            data.is_featured = Boolean(data.is_featured);
            data.advisor_id = data.advisor_id ? Number(data.advisor_id) : null;

            // Ensure strings for the backend
            data.beds_room_count = String(data.beds_room_count || "1+1");
            data.baths_count = String(data.baths_count || "1");
            data.price = String(data.price || "0");

            console.log("Submitting payload:", data);

            const res = await propertyService.addProperty(data);
            console.log("Server response:", res.data);
            onSuccess();
        } catch (err) {
            console.error("Submission failed:", err.response?.data || err.message);
            const errorMsg = err.response?.data?.detail
                ? JSON.stringify(err.response.data.detail)
                : err.message;
            alert("Hata (422/Submission Error):\n" + errorMsg);
        }
    };

    const interiorList = featureDefinitions.filter(f => f.category === 'interior' && f.is_active !== 0);
    const exteriorList = featureDefinitions.filter(f => f.category === 'exterior' && f.is_active !== 0);
    const generalList = featureDefinitions.filter(f => f.category === 'location' && f.is_active !== 0);

    return (
        <div className="bg-white dark:bg-navy-900 min-h-screen p-0">
            <div className="max-w-7xl mx-auto">

                {/* Header Container */}
                <div className="bg-brand-500 p-4 text-white flex items-center justify-between sticky top-0 z-50">
                    <h4 className="text-lg font-bold">Caria Estates | Gayrimenkul Yönetimi</h4>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-4 py-1.5 border border-white/50 rounded text-xs font-bold hover:bg-white/10 transition-colors">Vazgeç</button>
                        <button onClick={handleSubmit} className="px-6 py-1.5 bg-white text-brand-500 rounded text-xs font-bold shadow hover:bg-gray-100 transition-colors">Kaydet ve Yayınla</button>
                    </div>
                </div>

                <div className="p-8 space-y-12 pb-32">

                    {/* 1. Genel Bilgiler */}
                    <section>
                        <SectionTitle title="Genel Gayrimenkul Bilgileri" />
                        <div className="flex gap-8 mb-6 ml-1">
                            {["Satılık Emlak", "Kiralık Emlak", "Günlük Kiralık"].map(s => (
                                <label key={s} className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" className="w-4 h-4 text-brand-500 focus:ring-brand-500" checked={formData.status === s} onChange={() => setFormData(prev => ({ ...prev, status: s }))} />
                                    <span className="text-sm font-bold text-gray-700 dark:text-white">{s}</span>
                                </label>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
                            <RenderSelect id="property_type" label="İlan Kategorisi" required options={["Daire", "Villa", "Penthouse", "Müstakil Ev", "İkiz Villa", "Arsa", "Ticari"]} value={formData.property_type} onChange={handleChange} />
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <RenderInput id="price" label="Fiyat" required type="number" value={formData.price} onChange={handleChange} />
                                </div>
                                <div className="mt-6 flex items-start">
                                    <select className="border border-gray-300 p-2 rounded text-sm bg-gray-50 dark:bg-navy-800 dark:border-white/10 font-bold h-[38px] mt-0.5 outline-none">
                                        <option>GBP</option><option>EUR</option><option>USD</option><option>TRY</option>
                                    </select>
                                </div>
                            </div>
                            <RenderSelect id="kocan_tipi" label="Koçan Tipi" options={["Eşdeğer", "Türk Koçanı", "Tahsis", "Kira"]} value={formData.kocan_tipi} onChange={handleChange} />
                        </div>
                    </section>

                    {/* 2. Lokasyon Detayları */}
                    <section>
                        <SectionTitle title="Lokasyon ve Tapu Detayları" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
                            <RenderSelect id="region" label="Bölge" required options={["Kyrenia", "Iskele", "Famagusta", "Nicosia", "Lefke", "Guzelyurt"]} value={formData.region} onChange={handleChange} />
                            <RenderInput id="location" label="Harita / Konum Detay" placeholder="Örn: Girne Merkez" value={formData.location} onChange={handleChange} />
                            <RenderSelect id="is_featured" label="Anasayfada Öne Çıkart?" options={["Hayır", "Evet"]} value={formData.is_featured ? "Evet" : "Hayır"} onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.value === "Evet" }))} />
                        </div>
                    </section>

                    {/* 3. Fiziksel Özellikler */}
                    <section>
                        <SectionTitle title="Emlak Fiziksel Özellikleri" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8">
                            <RenderSelect id="beds_room_count" label="Oda Sayısı" required options={["1+0", "1+1", "2+1", "3+1", "3+2", "4+1", "4+2", "5+1", "5+2"]} value={formData.beds_room_count} onChange={handleChange} />
                            <RenderInput id="closed_area" label="Kapalı Alan (m²)" required value={formData.closed_area} onChange={handleChange} />
                            <RenderInput id="plot_area" label="Arsa Büyüklüğü (m²)" value={formData.plot_area} onChange={handleChange} />
                            <RenderSelect id="baths_count" label="Banyo Sayısı" options={["1", "2", "3", "4", "5"]} value={formData.baths_count} onChange={handleChange} />
                            <RenderSelect id="building_age" label="Bina Yaşı" options={["0", "1-5", "6-10", "11-15", "16-20", "21+"]} value={formData.building_age} onChange={handleChange} />
                            <RenderSelect id="is_furnished" label="Eşya Durumu" options={["Eşyalı", "Eşyasız", "Yarı Eşyalı", "Beyaz Eşyalı"]} value={formData.is_furnished} onChange={handleChange} />
                            <RenderSelect id="site_within" label="Site İçerisinde mi?" options={["Evet", "Hayır"]} value={formData.site_within} onChange={handleChange} />
                            <RenderSelect id="balcony" label="Balkon Bilgisi" options={["Yok", "1", "2", "3+"]} value={formData.balcony} onChange={handleChange} />
                        </div>
                    </section>

                    {/* 4. İlan Özellik Listesi */}
                    <section>
                        <SectionTitle title="Gayrimenkul Özellik Listesi" />

                        <div className="space-y-12">
                            {/* Dış Özellikler */}
                            <div>
                                <h6 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 border-b pb-1">Dış Özellikler</h6>
                                {exteriorList.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {exteriorList.map(f => (
                                            <label key={f.id} className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 dark:hover:bg-navy-800 p-1.5 rounded transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={parseFeatures(formData.ozellikler_dis).includes(f.title_tr)}
                                                    onChange={() => toggleFeature("exterior", f.title_tr)}
                                                    className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                                                />
                                                <span className="text-xs font-semibold text-navy-700 dark:text-white group-hover:text-brand-500 transition-colors">{f.title_tr}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-orange-50 border border-orange-100 rounded text-orange-700 text-xs italic">
                                        Bu kategoride özellik tanımı yok. Lütfen Site Ayarları → Özellik Tanımları bölümünden özellik ekleyin.
                                    </div>
                                )}
                            </div>

                            {/* İç Özellikler */}
                            <div>
                                <h6 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 border-b pb-1">İç Özellikler</h6>
                                {interiorList.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {interiorList.map(f => (
                                            <label key={f.id} className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 dark:hover:bg-navy-800 p-1.5 rounded transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={parseFeatures(formData.ozellikler_ic).includes(f.title_tr)}
                                                    onChange={() => toggleFeature("interior", f.title_tr)}
                                                    className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                                                />
                                                <span className="text-xs font-semibold text-navy-700 dark:text-white group-hover:text-brand-500 transition-colors">{f.title_tr}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-orange-50 border border-orange-100 rounded text-orange-700 text-xs italic">
                                        Bu kategoride özellik tanımı yok. Lütfen Site Ayarları → Özellik Tanımları bölümünden özellik ekleyin.
                                    </div>
                                )}
                            </div>

                            {/* Konum Özellikleri */}
                            <div>
                                <h6 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 border-b pb-1">Konum / Çevre Özellikleri</h6>
                                {generalList.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {generalList.map(f => (
                                            <label key={f.id} className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 dark:hover:bg-navy-800 p-1.5 rounded transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={parseFeatures(formData.ozellikler_konum).includes(f.title_tr)}
                                                    onChange={() => toggleFeature("general", f.title_tr)}
                                                    className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                                                />
                                                <span className="text-xs font-semibold text-navy-700 dark:text-white group-hover:text-brand-500 transition-colors">{f.title_tr}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-orange-50 border border-orange-100 rounded text-orange-700 text-xs italic">
                                        Bu kategoride özellik tanımı yok. Lütfen Site Ayarları → Özellik Tanımları bölümünden özellik ekleyin.
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* 5. Görsel Galeri */}
                    <section>
                        <SectionTitle title="İlan Görselleri ve Galeri" />
                        <GalleryManager
                            gallery={parseFeatures(formData.gallery)}
                            onChange={(updated) => setFormData(prev => ({ ...prev, gallery: JSON.stringify(updated) }))}
                            coverImage={formData.image}
                            onCoverChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                        />
                    </section>

                    {/* 6. Danışman */}
                    <section>
                        <SectionTitle title="Sorumlu Gayrimenkul Danışmanı" />
                        <div className="max-w-md">
                            <RenderSelect
                                id="advisor_id"
                                label="Danışman Seçimi"
                                options={advisors.map(a => a.fullName || a.name)}
                                value={advisors.find(a => Number(a.id) === Number(formData.advisor_id))?.fullName || advisors.find(a => Number(a.id) === Number(formData.advisor_id))?.name || ""}
                                onChange={(e) => {
                                    const selected = advisors.find(a => (a.fullName || a.name) === e.target.value);
                                    setFormData(prev => ({ ...prev, advisor_id: selected ? selected.id : null }));
                                }}
                            />
                        </div>
                    </section>

                    {/* 7. Açıklamalar */}
                    <section>
                        <SectionTitle title="Açıklama ve Başlık Detayları" />
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <RenderInput id="title" label="İlan Başlığı (TR)" required placeholder="Örn: Girne'de Satılık 3+1 Villa" value={formData.title} onChange={handleChange} />
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Detaylı Açıklama (TR)</label>
                                    <textarea id="description" rows="10" value={formData.description || ""} onChange={handleChange} className="w-full border border-gray-300 rounded p-4 text-sm outline-none shadow-inner dark:bg-navy-800 dark:border-white/10 dark:text-white" />
                                </div>
                            </div>
                            <hr className="my-8 opacity-50" />
                            <div className="space-y-4">
                                <RenderInput id="title_en" label="Property Title (EN)" placeholder="Ex: 3+1 Villa for Sale in Kyrenia" value={formData.title_en} onChange={handleChange} />
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Property Description (EN)</label>
                                    <textarea id="description_en" rows="10" value={formData.description_en || ""} onChange={handleChange} className="w-full border border-gray-300 rounded p-4 text-sm outline-none shadow-inner dark:bg-navy-800 dark:border-white/10 dark:text-white" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Action Bar */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-navy-800 border-t border-gray-200 dark:border-white/10 p-4 shadow-2xl flex justify-center gap-6 z-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-12 py-3 border border-gray-300 dark:border-white/20 rounded font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-700 transition-all"
                        >
                            İptal Et
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className="px-20 py-3 bg-brand-500 text-white rounded font-bold hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all"
                        >
                            Kaydet ve Yayına Al
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PropertyForm;
