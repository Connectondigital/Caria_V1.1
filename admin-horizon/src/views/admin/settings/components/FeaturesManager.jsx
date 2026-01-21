import React, { useState, useEffect } from "react";
import { featureService } from "../../../../api";
import { MdDelete, MdAdd } from "react-icons/md";

const FeaturesManager = () => {
    const [features, setFeatures] = useState([]);
    const [newFeature, setNewFeature] = useState({ category: "interior", label_tr: "", label_en: "" });

    const fetchFeatures = async () => {
        try {
            const res = await featureService.getFeatures();
            setFeatures(res.data);
        } catch (err) {
            console.error("Failed to fetch features:", err);
        }
    };

    useEffect(() => {
        fetchFeatures();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newFeature.label_tr || !newFeature.label_en) return;
        try {
            await featureService.saveFeature(newFeature);
            setNewFeature({ category: "interior", label_tr: "", label_en: "" });
            fetchFeatures();
        } catch (err) {
            alert("Hata: " + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bu özelliği silmek istediğine emin misin?")) {
            try {
                await featureService.deleteFeature(id);
                fetchFeatures();
            } catch (err) {
                alert("Silinemedi kanka");
            }
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 dark:bg-navy-800 dark:border-white/10">
                <h4 className="text-xl font-bold text-navy-700 dark:text-white mb-6">Özellik Tanımları</h4>

                <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8 bg-gray-50 dark:bg-navy-900 p-4 rounded-xl">
                    <select
                        className="rounded-xl border border-gray-200 p-3 text-sm focus:border-brand-500 bg-white"
                        value={newFeature.category}
                        onChange={(e) => setNewFeature({ ...newFeature, category: e.target.value })}
                    >
                        <option value="interior">İç Özellikler</option>
                        <option value="exterior">Dış Özellikler</option>
                        <option value="general">Genel / Diğer</option>
                    </select>
                    <input
                        className="rounded-xl border border-gray-200 p-3 text-sm focus:border-brand-500 bg-white"
                        placeholder="Başlık (TR)"
                        value={newFeature.label_tr}
                        onChange={(e) => setNewFeature({ ...newFeature, label_tr: e.target.value })}
                    />
                    <input
                        className="rounded-xl border border-gray-200 p-3 text-sm focus:border-brand-500 bg-white"
                        placeholder="Title (EN)"
                        value={newFeature.label_en}
                        onChange={(e) => setNewFeature({ ...newFeature, label_en: e.target.value })}
                    />
                    <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-white font-medium hover:bg-brand-600 transition duration-200">
                        <MdAdd className="w-5 h-5" /> Ekle
                    </button>
                </form>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {['interior', 'exterior', 'general'].map(cat => (
                        <div key={cat} className="space-y-4">
                            <h5 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">
                                {cat === 'interior' ? 'İç' : cat === 'exterior' ? 'Dış' : 'Genel'} Özellikler
                            </h5>
                            <div className="space-y-2">
                                {features.filter(f => f.category === cat).map(f => (
                                    <div key={f.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl group hover:border-brand-300 transition-all shadow-sm">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-navy-700">{f.label_tr}</span>
                                            <span className="text-[10px] text-gray-500 font-medium">{f.label_en}</span>
                                        </div>
                                        <button onClick={() => handleDelete(f.id)} className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MdDelete className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeaturesManager;
