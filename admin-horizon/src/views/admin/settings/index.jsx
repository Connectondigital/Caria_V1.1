import React, { useEffect, useState } from "react";
import Card from "components/card";
import InputField from "components/fields/InputField";
import { cmsService } from "../../../api";

const Settings = () => {
    const [sliders, setSliders] = useState([]);
    const [content, setContent] = useState([]);
    const [newSlider, setNewSlider] = useState({ title: "", image_url: "", link: "#" });

    const fetchData = async () => {
        try {
            const sliderResp = await cmsService.getSliders();
            setSliders(sliderResp.data);
            const contentResp = await cmsService.getContent();
            setContent(contentResp.data);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddSlider = async (e) => {
        e.preventDefault();
        try {
            await cmsService.addSlider(newSlider);
            setNewSlider({ title: "", image_url: "", link: "#" });
            fetchData();
        } catch (err) {
            alert("Hata: " + err.message);
        }
    };

    const handleUpdateContent = async (item) => {
        try {
            await cmsService.updateContent(item);
            alert("Başarıyla güncellendi kanka!");
        } catch (err) {
            alert("Hata: " + err.message);
        }
    };

    const handleContentChange = (key, val) => {
        setContent(prev => prev.map(item => item.content_key === key ? { ...item, value_tr: val } : item));
    };

    return (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Slider Management */}
            <Card extra={"w-full p-6 h-fit"}>
                <h4 className="text-xl font-bold text-navy-700 dark:text-white mb-4">Slider Yönetimi</h4>
                <form onSubmit={handleAddSlider} className="mb-6 border-b pb-6">
                    <InputField label="Slider Başlığı" id="title" placeholder="Lüks Villa" value={newSlider.title} onChange={(e) => setNewSlider({ ...newSlider, title: e.target.value })} />
                    <InputField label="Görsel URL" id="image_url" placeholder="https://..." value={newSlider.image_url} onChange={(e) => setNewSlider({ ...newSlider, image_url: e.target.value })} />
                    <button type="submit" className="mt-3 w-full rounded-xl bg-brand-500 py-3 text-white font-medium hover:bg-brand-600">Slider Ekle</button>
                </form>
                <div className="space-y-4">
                    {sliders.map(s => (
                        <div key={s.id} className="flex items-center gap-4 p-3 border rounded-xl">
                            <img src={s.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                            <div>
                                <p className="text-sm font-bold text-navy-700">{s.title}</p>
                                <p className="text-xs text-gray-400">{s.link}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* General Settings */}
            <Card extra={"w-full p-6 h-fit"}>
                <h4 className="text-xl font-bold text-navy-700 dark:text-white mb-4">Genel Metinler</h4>
                <div className="space-y-6">
                    {content.filter(c => c.section === "intro" || c.section === "footer").map(item => (
                        <div key={item.content_key}>
                            <label className="text-sm font-bold text-gray-700 mb-2 block">{item.content_key.replace(/_/g, " ").toUpperCase()}</label>
                            <textarea
                                className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-brand-500 font-light leading-relaxed"
                                rows="8"
                                value={item.value_tr}
                                onChange={(e) => handleContentChange(item.content_key, e.target.value)}
                            ></textarea>
                            <button
                                onClick={() => handleUpdateContent(item)}
                                className="mt-2 text-brand-500 text-sm font-bold hover:underline"
                            >
                                Değişiklikleri Kaydet
                            </button>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default Settings;
