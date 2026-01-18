import React, { useState } from "react";
import Card from "components/card";
import InputField from "components/fields/InputField";
import { propertyService, advisorService } from "../../../../api";

const PropertyForm = ({ property, onClose, onSuccess }) => {
    const [formData, setFormData] = useState(
        property || {
            title: "",
            title_en: "",
            slug: "",
            price: "£ ",
            region: "Kyrenia",
            kocan_tipi: "Eşdeğer",
            beds_room_count: 1,
            baths_count: 1,
            plot_area: "",
            closed_area: "",
            description: "",
            description_en: "",
            image: "",
            ozellikler_ic: "",
            ozellikler_dis: "",
            advisor_id: null,
            is_featured: false
        }
    );

    const [advisors, setAdvisors] = React.useState([]);

    React.useEffect(() => {
        const fetchAdvisors = async () => {
            try {
                const res = await advisorService.getAdvisors();
                setAdvisors(res.data);
            } catch (err) {
                console.error("Advisors load failed:", err);
            }
        };
        fetchAdvisors();
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Ensure slug is generated if empty
            const submissionData = { ...formData };
            if (!submissionData.slug && submissionData.title) {
                submissionData.slug = submissionData.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
            }
            if (submissionData.advisor_id) {
                submissionData.advisor_id = Number(submissionData.advisor_id);
            }

            await propertyService.addProperty(submissionData);
            onSuccess();
        } catch (err) {
            alert("Hata oluştu kanka: " + err.message);
        }
    };

    const regions = ["Kyrenia", "Nicosia", "Famagusta", "Iskele", "Lefke", "Guzelyurt"];
    const roomTypes = ["1+0", "1+1", "2+1", "3+1", "4+1", "5+1", "5+2", "6+2"];

    return (
        <Card extra={"w-full h-full p-6"}>
            <div className="flex items-center justify-between mb-8">
                <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                    {property ? "İlanı Düzenle" : "Mükemmel İlan Ekle"}
                </h4>
                <button onClick={onClose} className="text-gray-600 hover:text-navy-700">İptal</button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                    id="title"
                    label="İlan Başlığı (TR)"
                    placeholder="Örn: Girne'de Modern Villa"
                    value={formData.title}
                    onChange={handleChange}
                />
                <InputField
                    id="title_en"
                    label="Property Title (EN)"
                    placeholder="e.g. Modern Villa in Kyrenia"
                    value={formData.title_en}
                    onChange={handleChange}
                />
                <InputField
                    id="price"
                    label="Fiyat (Sterling £)"
                    placeholder="£ 250,000"
                    value={formData.price}
                    onChange={handleChange}
                />

                <div className="flex flex-col">
                    <label className="text-sm font-bold text-gray-700 dark:text-white mb-2 ml-3">Bölge</label>
                    <select
                        id="region"
                        className="rounded-xl border border-gray-200 p-3 text-sm focus:border-brand-500"
                        value={formData.region}
                        onChange={handleChange}
                    >
                        {regions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-bold text-gray-700 dark:text-white mb-2 ml-3">Tapu Türü</label>
                    <select
                        id="kocan_tipi"
                        className="rounded-xl border border-gray-200 p-3 text-sm focus:border-brand-500"
                        value={formData.kocan_tipi}
                        onChange={handleChange}
                    >
                        <option value="Eşdeğer">Eşdeğer</option>
                        <option value="Türk Koçan">Türk Koçan</option>
                        <option value="Tahsis">Tahsis</option>
                    </select>
                </div>

                <InputField
                    id="closed_area"
                    label="Kapalı Alan (m²)"
                    placeholder="200"
                    value={formData.closed_area}
                    onChange={handleChange}
                />
                <InputField
                    id="plot_area"
                    label="Arsa Alanı (m²)"
                    placeholder="500"
                    value={formData.plot_area}
                    onChange={handleChange}
                />

                <div className="flex flex-col">
                    <label className="text-sm font-bold text-gray-700 dark:text-white mb-2 ml-3">Oda Sayısı</label>
                    <select
                        id="beds_room_count"
                        className="rounded-xl border border-gray-200 p-3 text-sm focus:border-brand-500"
                        value={formData.beds_room_count}
                        onChange={handleChange}
                    >
                        {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <InputField
                    id="baths_count"
                    label="Banyo Sayısı"
                    type="number"
                    placeholder="2"
                    value={formData.baths_count}
                    onChange={handleChange}
                />

                <div className="md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-white mb-2 ml-3">İç Özellikler</label>
                    <textarea
                        id="ozellikler_ic"
                        rows="3"
                        className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-brand-500"
                        placeholder="Klima, Beyaz Eşya, Mobilyalı..."
                        value={formData.ozellikler_ic}
                        onChange={handleChange}
                    ></textarea>
                </div>

                <div className="md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-white mb-2 ml-3">Dış Özellikler</label>
                    <textarea
                        id="ozellikler_dis"
                        rows="3"
                        className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-brand-500"
                        placeholder="Yüzme Havuzu, Otopark, Bahçe..."
                        value={formData.ozellikler_dis}
                        onChange={handleChange}
                    ></textarea>
                </div>

                <div className="md:col-span-2">
                    <InputField
                        id="image"
                        label="Kapak Görseli URL"
                        placeholder="https://..."
                        value={formData.image}
                        onChange={handleChange}
                    />
                </div>

                <div className="md:col-span-2 space-y-3">
                    <label className="text-sm font-bold text-navy-700 dark:text-white ml-3 block">
                        Sorumlu Danışman (Zorunlu)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 px-3">
                        {advisors.map((advisor) => {
                            const isSelected = Number(formData.advisor_id) === Number(advisor.id);
                            return (
                                <div
                                    key={advisor.id}
                                    onClick={() => setFormData(prev => ({ ...prev, advisor_id: Number(advisor.id) }))}
                                    className={`group cursor-pointer rounded-2xl border-2 p-3 transition-all duration-300 flex flex-col items-center text-center relative ${isSelected
                                        ? "border-brand-500 bg-brand-50/50 shadow-md transform scale-105"
                                        : "border-gray-100 hover:border-brand-200 hover:bg-gray-50 bg-white"
                                        }`}
                                >
                                    {isSelected && (
                                        <div className="absolute -top-2 -right-2 bg-brand-500 text-white rounded-full p-1 shadow-lg z-10 animate-bounce-short">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="relative">
                                        <img
                                            src={advisor.image_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop"}
                                            alt={advisor.name}
                                            className={`w-16 h-16 rounded-full object-cover mb-3 border-2 transition-all duration-300 ${isSelected ? "border-brand-500 scale-110" : "border-gray-200 group-hover:border-brand-300"
                                                }`}
                                        />
                                    </div>
                                    <span className={`text-xs font-bold leading-tight ${isSelected ? "text-brand-600" : "text-gray-700"}`}>
                                        {advisor.name}
                                    </span>
                                    <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter">
                                        {advisor.title || "Danışman"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {!formData.advisor_id && <p className="text-[10px] text-red-500 ml-3 italic">* Lütfen bir danışman seçiniz.</p>}
                </div>

                <div className="md:col-span-1">
                    <label className="text-sm font-bold text-gray-700 dark:text-white mb-2 ml-3">Açıklama (TR)</label>
                    <textarea
                        id="description"
                        rows="5"
                        className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-brand-500"
                        value={formData.description}
                        onChange={handleChange}
                    ></textarea>
                </div>
                <div className="md:col-span-1">
                    <label className="text-sm font-bold text-gray-700 dark:text-white mb-2 ml-3">Description (EN)</label>
                    <textarea
                        id="description_en"
                        rows="5"
                        className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-brand-500"
                        value={formData.description_en}
                        onChange={handleChange}
                    ></textarea>
                </div>

                <div className="md:col-span-2 flex items-center gap-2 px-3">
                    <input
                        type="checkbox"
                        id="is_featured"
                        className="h-5 w-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                        checked={formData.is_featured || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    />
                    <label htmlFor="is_featured" className="text-sm font-bold text-navy-700 dark:text-white">
                        Anasayfada Öne Çıkar (Curated Listings)
                    </label>
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
                    >
                        İptal
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-600 transition duration-200"
                    >
                        {property ? "Güncelle" : "İlanı Yayınla"}
                    </button>
                </div>
            </form>
        </Card>
    );
};

export default PropertyForm;
