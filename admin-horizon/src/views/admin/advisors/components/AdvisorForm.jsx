
import React, { useState, useEffect, useCallback } from "react";
import Card from "components/card";
import InputField from "components/fields/InputField";
import SwitchField from "components/fields/SwitchField";
import ImageUploadField from "components/fields/ImageUploadField";
import { advisorService } from "../../../../api";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { MdSave, MdCancel, MdPerson, MdPhone, MdShare, MdLanguage, MdLocationOn, MdStar, MdDescription, MdList, MdRestore } from "react-icons/md";

const TabContent = React.memo(({ id, activeTab, children }) => (
    <div className={activeTab === id ? "block" : "hidden"}>
        {children}
    </div>
));

const TABS = [
    { id: "general", label: "Genel", icon: <MdPerson /> },
    { id: "contact", label: "İletişim", icon: <MdPhone /> },
    { id: "media", label: "Profil & Medya", icon: <MdShare /> },
    { id: "about", label: "Hakkında", icon: <MdDescription /> },
    { id: "expertise", label: "Uzmanlık", icon: <MdStar /> },
    { id: "social", label: "Sosyal", icon: <MdShare /> },
    { id: "listings", label: "İlanlar", icon: <MdList /> }
];

const LANGUAGE_OPTIONS = ["English", "Turkish", "Russian", "German", "Arabic", "French", "Persian"];
const REGION_OPTIONS = ["Kyrenia", "Iskele", "Famagusta", "Nicosia", "Guzelyurt", "Lefke"];
const SPECIALTY_OPTIONS = ["Villa", "Apartment", "Investment", "Off-plan", "Rental", "Luxury", "Commercial"];

const CK_EDITOR_CONFIG = {
    toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote']
};

const AdvisorForm = ({ advisor, onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = useState("general");
    const [advisorListings, setAdvisorListings] = useState([]);
    const [showDraftBanner, setShowDraftBanner] = useState(false);

    const initialData = advisor ? {
        ...advisor,
        fullName: advisor.fullName || advisor.name || "",
        isActive: advisor.isActive === undefined ? true : advisor.isActive,
        socialLinks: advisor.socialLinks ? (typeof advisor.socialLinks === 'string' ? JSON.parse(advisor.socialLinks) : advisor.socialLinks) : { instagram: "", linkedin: "", facebook: "" }
    } : {
        fullName: "",
        slug: "",
        title_tr: "",
        title_en: "",
        email: "",
        phone: "",
        whatsappPhone: "",
        portraitUrl: "",
        coverImageUrl: "",
        bioRichTextTR: "",
        bioRichTextEN: "",
        languages: "",
        regions: "",
        specialties: "",
        socialLinks: { instagram: "", linkedin: "", facebook: "" },
        isActive: true
    };

    const [formData, setFormData] = useState(initialData);

    // --- DRAFT SYSTEM ---
    const draftKey = advisor ? `advisorDraft_${advisor.id}` : "advisorDraft_new";

    useEffect(() => {
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
            setShowDraftBanner(true);
        }
    }, [draftKey]);

    const saveDraft = useCallback((data) => {
        localStorage.setItem(draftKey, JSON.stringify(data));
    }, [draftKey]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            saveDraft(formData);
        }, 1000);
        return () => clearTimeout(timeout);
    }, [formData, saveDraft]);

    const applyDraft = () => {
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
            setFormData(JSON.parse(savedDraft));
            setShowDraftBanner(false);
        }
    };

    const clearDraft = useCallback(() => {
        localStorage.removeItem(draftKey);
        setShowDraftBanner(false);
    }, [draftKey]);
    // -------------------

    useEffect(() => {
        if (advisor && advisor.slug) {
            fetchAdvisorDetails();
        }
    }, [advisor]);

    const fetchAdvisorDetails = async () => {
        try {
            // Admin panel: fetch ALL listings (not just published)
            if (advisor && advisor.id) {
                const resp = await advisorService.getAdvisorListings(advisor.id);
                setAdvisorListings(resp.data || []);
            } else if (advisor && advisor.slug) {
                const resp = await advisorService.getAdvisor(advisor.slug);
                if (resp.data.listings) {
                    setAdvisorListings(resp.data.listings);
                }
            }
        } catch (err) {
            console.error("Failed to fetch listings:", err);
        }
    };

    const handleChange = useCallback((e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    }, []);

    const handleSwitchChange = useCallback((id, checked) => {
        setFormData((prev) => ({ ...prev, [id]: checked }));
    }, []);

    const handleSocialChange = useCallback((e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            socialLinks: { ...prev.socialLinks, [id]: value }
        }));
    }, []);

    const handleMultiSelect = (field, value) => {
        const current = formData[field] ? formData[field].split(",").map(s => s.trim()) : [];
        let updated;
        if (current.includes(value)) {
            updated = current.filter(v => v !== value);
        } else {
            updated = [...current, value];
        }
        setFormData(prev => ({ ...prev, [field]: updated.filter(Boolean).join(", ") }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        // Debug payload
        console.log("ADVISOR_PAYLOAD_BEFORE", formData);

        // Validation
        if (!formData.fullName || !formData.email || !formData.phone) {
            // Check which tab has the missing field and switch to it
            if (!formData.fullName) setActiveTab("general");
            else if (!formData.email || !formData.phone) setActiveTab("contact");

            alert(`Lütfen zorunlu alanları doldurun:\n${!formData.fullName ? '- Ad Soyad\n' : ''}${!formData.email ? '- E-posta\n' : ''}${!formData.phone ? '- Telefon' : ''}`);
            return;
        }

        try {
            const submissionData = {
                ...formData,
                name: formData.fullName, // Backend expects 'name'
                socialLinks: JSON.stringify(formData.socialLinks)
            };

            console.log("ADVISOR_SUBMIT_PAYLOAD", submissionData);

            await advisorService.saveAdvisor(submissionData);
            clearDraft();
            onSuccess();
        } catch (err) {
            console.error("FULL_SAVE_ERROR_DEBUG:", err);
            const status = err.response?.status;
            const errorData = err.response?.data;

            if (status === 422) {
                const detail = Array.isArray(errorData?.detail)
                    ? errorData.detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join('\n')
                    : JSON.stringify(errorData?.detail);
                alert(`Hatalı Giriş (422):\n${detail}`);
            } else if (status === 500) {
                alert(`Sunucu Hatası (500):\n${errorData?.detail || "Sunucu tarafında bir hata oluştu. Lütfen backend loglarını kontrol edin."}`);
            } else if (err.message === "Network Error") {
                alert("Network Error (Bağlantı Hatası):\nBackend'in (localhost:5001) açık olduğundan ve CORS ayarlarına izin verildiğinden emin olun. Ayrıca browser konsolunu (F12) kontrol edin.");
            } else {
                alert("Kaydetme sırasında bir hata oluştu: " + (err.message || "Bilinmeyen hata"));
            }
        }
    };

    const submissionTabs = TABS.filter(t => !t.hidden || (t.id === 'listings' && advisor));


    return (
        <Card extra={"w-full h-full p-6"}>
            <div className="flex items-center justify-between mb-8 border-b pb-4">
                <div>
                    <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
                        {advisor ? "Danışmanı Düzenle" : "Yeni Danışman Ekle"}
                    </h4>
                    {formData.slug && (
                        <p className="text-sm text-gray-500 mt-1">
                            Slug: <span className="bg-gray-100 px-2 py-0.5 rounded font-mono select-all text-brand-500">{formData.slug}</span>
                        </p>
                    )}
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-navy-700 transition-colors border rounded-xl">
                        <MdCancel /> İptal
                    </button>
                    <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all shadow-sm">
                        <MdSave /> {advisor ? "Güncelle" : "Kaydet"}
                    </button>
                </div>
            </div>

            {showDraftBanner && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                            <MdRestore size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-orange-800">Tamamlanmamış Taslak Bulundu</p>
                            <p className="text-xs text-orange-600">En son yaptığınız değişiklikler tarayıcıda kayıtlı kalmış.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={clearDraft} className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-1.5 transition-colors">Yoksay</button>
                        <button onClick={applyDraft} className="text-xs font-bold bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-all shadow-md">Taslağı Geri Yükle</button>
                    </div>
                </div>
            )}

            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-100 pb-2">
                {TABS.filter(t => t.id !== 'listings' || advisor).map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-t-lg border-b-2 ${activeTab === tab.id
                            ? "text-brand-500 border-brand-500 bg-brand-50"
                            : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                <TabContent key="general" id="general" activeTab={activeTab}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            id="fullName"
                            label="Danışman Adı Soyadı (Zorunlu)"
                            placeholder="Örn: Pilar Anguita"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                        <div className="flex items-center pt-8">
                            <SwitchField
                                id="isActive"
                                label="Aktif mi?"
                                desc="Pasif yaparsanız frontend'de listelenmez."
                                checked={formData.isActive}
                                onChange={(e) => handleSwitchChange("isActive", e.target.checked)}
                            />
                        </div>
                        <InputField
                            id="title_tr"
                            label="Ünvan (Türkçe)"
                            placeholder="Örn: Kıdemli Gayrimenkul Danışmanı"
                            value={formData.title_tr}
                            onChange={handleChange}
                        />
                        <InputField
                            id="title_en"
                            label="Title (English)"
                            placeholder="Örn: Senior Property Advisor"
                            value={formData.title_en}
                            onChange={handleChange}
                        />
                    </div>
                </TabContent>

                <TabContent key="contact" id="contact" activeTab={activeTab}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            id="email"
                            label="E-posta (Zorunlu)"
                            placeholder="pilar@cariaestates.com"
                            value={formData.email}
                            onChange={handleChange}
                            type="email"
                            required
                        />
                        <InputField
                            id="phone"
                            label="Telefon (Zorunlu)"
                            placeholder="+90 548 ..."
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                        <InputField
                            id="whatsappPhone"
                            label="WhatsApp Numarası (Opsiyonel)"
                            placeholder="+90 548 ... (Boşsa normal telefon kullanılır)"
                            value={formData.whatsappPhone}
                            onChange={handleChange}
                        />
                    </div>
                </TabContent>

                <TabContent key="media" id="media" activeTab={activeTab}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ImageUploadField
                            id="portraitUrl"
                            label="Profil Görseli (Portrait)"
                            value={formData.portraitUrl}
                            onChange={handleChange}
                        />
                        <ImageUploadField
                            id="coverImageUrl"
                            label="Kapak Görseli (Hero Cover)"
                            value={formData.coverImageUrl}
                            onChange={handleChange}
                        />
                    </div>
                </TabContent>

                <TabContent key="about" id="about" activeTab={activeTab}>
                    <div className="grid grid-cols-1 gap-8">
                        <div>
                            <label className="text-sm font-bold text-navy-700 dark:text-white mb-2 ml-1">Biyografi (Türkçe)</label>
                            <CKEditor
                                editor={ClassicEditor}
                                data={formData.bioRichTextTR}
                                onChange={(event, editor) => {
                                    const data = editor.getData();
                                    if (data !== formData.bioRichTextTR) {
                                        setFormData(prev => ({ ...prev, bioRichTextTR: data }));
                                    }
                                }}
                                config={CK_EDITOR_CONFIG}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-navy-700 dark:text-white mb-2 ml-1">Biography (English)</label>
                            <CKEditor
                                editor={ClassicEditor}
                                data={formData.bioRichTextEN}
                                onChange={(event, editor) => {
                                    const data = editor.getData();
                                    if (data !== formData.bioRichTextEN) {
                                        setFormData(prev => ({ ...prev, bioRichTextEN: data }));
                                    }
                                }}
                                config={CK_EDITOR_CONFIG}
                            />
                        </div>
                    </div>
                </TabContent>

                <TabContent key="expertise" id="expertise" activeTab={activeTab}>
                    <div className="grid grid-cols-1 gap-8">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <label className="flex items-center gap-2 text-sm font-bold text-navy-700 mb-4">
                                <MdLanguage /> Diller
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {LANGUAGE_OPTIONS.map(lang => (
                                    <button
                                        key={lang}
                                        type="button"
                                        onClick={() => handleMultiSelect("languages", lang)}
                                        className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${formData.languages?.includes(lang)
                                            ? "bg-brand-500 text-white shadow-md"
                                            : "bg-white text-gray-600 border hover:border-brand-300"
                                            }`}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>
                            <input className="mt-4 w-full bg-white border border-gray-100 p-2 text-sm rounded italic text-gray-400" value={formData.languages} readOnly />
                        </div>

                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <label className="flex items-center gap-2 text-sm font-bold text-navy-700 mb-4">
                                <MdLocationOn /> Bölgeler
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {REGION_OPTIONS.map(reg => (
                                    <button
                                        key={reg}
                                        type="button"
                                        onClick={() => handleMultiSelect("regions", reg)}
                                        className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${formData.regions?.includes(reg)
                                            ? "bg-brand-500 text-white shadow-md"
                                            : "bg-white text-gray-600 border hover:border-brand-300"
                                            }`}
                                    >
                                        {reg}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <label className="flex items-center gap-2 text-sm font-bold text-navy-700 mb-4">
                                <MdStar /> Uzmanlık Alanları
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {SPECIALTY_OPTIONS.map(spec => (
                                    <button
                                        key={spec}
                                        type="button"
                                        onClick={() => handleMultiSelect("specialties", spec)}
                                        className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${formData.specialties?.includes(spec)
                                            ? "bg-brand-500 text-white shadow-md"
                                            : "bg-white text-gray-600 border hover:border-brand-300"
                                            }`}
                                    >
                                        {spec}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </TabContent>

                <TabContent key="social" id="social" activeTab={activeTab}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            id="instagram"
                            label="Instagram"
                            placeholder="https://instagram.com/pilar"
                            value={formData.socialLinks.instagram}
                            onChange={handleSocialChange}
                        />
                        <InputField
                            id="linkedin"
                            label="LinkedIn"
                            placeholder="https://linkedin.com/in/pilar"
                            value={formData.socialLinks.linkedin}
                            onChange={handleSocialChange}
                        />
                        <InputField
                            id="facebook"
                            label="Facebook"
                            placeholder="https://facebook.com/pilar"
                            value={formData.socialLinks.facebook}
                            onChange={handleSocialChange}
                        />
                    </div>
                </TabContent>

                <TabContent key="listings" id="listings" activeTab={activeTab}>
                    <div className="">
                        <div className="flex items-center justify-between mb-6">
                            <h5 className="text-lg font-bold text-navy-700">Bu Danışmanın İlanları ({advisorListings.length})</h5>
                        </div>
                        {advisorListings.length === 0 ? (
                            <div className="bg-gray-50 p-10 text-center rounded-2xl border-2 border-dashed">
                                <p className="text-gray-400">Henüz yayınlanmış ilanı yok.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                                        <tr>
                                            <th className="px-4 py-3">Görsel</th>
                                            <th className="px-4 py-3 text-start">Başlık (TR)</th>
                                            <th className="px-4 py-3">Bölge</th>
                                            <th className="px-4 py-3">Fiyat</th>
                                            <th className="px-4 py-3">Durum</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {advisorListings.map(lst => (
                                            <tr key={lst.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-2">
                                                    <img src={lst.image} alt="" className="w-12 h-10 object-cover rounded" />
                                                </td>
                                                <td className="px-4 py-2 font-bold text-navy-700">{lst.title}</td>
                                                <td className="px-4 py-2 text-gray-600">{lst.region}</td>
                                                <td className="px-4 py-2 font-mono text-brand-500">{lst.price}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${lst.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        {lst.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </TabContent>

                <div className="mt-12 pt-6 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all font-bold"
                    >
                        İptal
                    </button>
                    <button
                        type="submit"
                        className="px-10 py-3 rounded-xl bg-brand-500 text-white font-bold hover:bg-brand-600 transition-all shadow-md active:scale-95 flex items-center gap-2"
                    >
                        <MdSave size={18} /> {advisor ? "Değişiklikleri Kaydet" : "Danışmanı Oluştur"}
                    </button>
                </div>
            </form>
        </Card>
    );
};

export default AdvisorForm;
