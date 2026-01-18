import React, { useEffect, useState } from "react";
import Card from "components/card";
import { homepageService } from "../../../api";

const Blocks = () => {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState("");

    const fetchBlocks = async () => {
        try {
            setLoading(true);
            const res = await homepageService.getBlocks();
            const parsedBlocks = res.data.map(block => {
                if (block.block_type === 'stats' || block.block_type === 'services') {
                    try {
                        block.parsedContent = JSON.parse(block.content);
                    } catch (e) {
                        block.parsedContent = [];
                    }
                }
                return block;
            });
            setBlocks(parsedBlocks);
        } catch (err) {
            console.error("Error fetching blocks:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlocks();
    }, []);

    const handleFieldChange = (blockId, field, value) => {
        setBlocks(blocks.map(b => b.id === blockId ? { ...b, [field]: value } : b));
    };

    const handleParsedContentChange = (blockId, index, field, value) => {
        setBlocks(blocks.map(b => {
            if (b.id === blockId) {
                const newContent = [...(b.parsedContent || [])];
                if (!newContent[index]) newContent[index] = {};
                newContent[index][field] = value;
                return { ...b, parsedContent: newContent };
            }
            return b;
        }));
    };

    const saveBlock = async (block) => {
        try {
            setSaveStatus(`Kaydediliyor...`);
            const dataToSave = { ...block };
            if (block.parsedContent) {
                dataToSave.content = JSON.stringify(block.parsedContent);
                delete dataToSave.parsedContent;
            }
            await homepageService.saveBlock(dataToSave);
            setSaveStatus("Başarıyla kaydedildi!");
            setTimeout(() => setSaveStatus(""), 3000);
        } catch (err) {
            setSaveStatus("Hata oluştu!");
        }
    };

    if (loading) return <div className="p-5 text-gray-600">Yükleniyor...</div>;

    return (
        <div className="mt-5">
            <div className="mb-4 flex items-center justify-between">
                <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                    Anasayfa Blok Yönetimi
                </h4>
                <div className="text-sm font-bold text-green-500">{saveStatus}</div>
            </div>

            <div className="grid grid-cols-1 gap-5">
                {/* HERO SECTION */}
                {blocks.filter(b => b.block_type === 'hero').map(block => (
                    <Card key={block.id} extra="p-5 border-l-4 border-brand-500">
                        <h3 className="text-lg font-bold text-navy-700 mb-4">Giriş Bölümü (Hero Video)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Video URL</label>
                                <input
                                    className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border bg-white/0 p-3 text-sm outline-none border-gray-200"
                                    type="text"
                                    value={block.video_url || ""}
                                    onChange={(e) => handleFieldChange(block.id, 'video_url', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Ana Başlık</label>
                                <input
                                    className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border bg-white/0 p-3 text-sm outline-none border-gray-200"
                                    type="text"
                                    value={block.title || ""}
                                    onChange={(e) => handleFieldChange(block.id, 'title', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Alt Başlık (Search)</label>
                                <input
                                    className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border bg-white/0 p-3 text-sm outline-none border-gray-200"
                                    type="text"
                                    value={block.content || ""}
                                    onChange={(e) => handleFieldChange(block.id, 'content', e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => saveBlock(block)}
                            className="mt-4 w-fit rounded-xl bg-brand-500 px-6 py-2 text-white font-bold hover:bg-brand-600"
                        >
                            Kaydet
                        </button>
                    </Card>
                ))}

                {/* STATS SECTION */}
                {blocks.filter(b => b.block_type === 'stats').map(block => (
                    <Card key={block.id} extra="p-5 border-l-4 border-amber-500">
                        <h3 className="text-lg font-bold text-navy-700 mb-4">İstatistikler</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(block.parsedContent || []).map((stat, idx) => (
                                <div key={idx} className="p-3 bg-gray-50 rounded-xl">
                                    <input
                                        placeholder="Değer (15+)"
                                        className="mb-2 h-10 w-full rounded-lg border bg-white p-2 text-sm outline-none"
                                        value={stat.value || ""}
                                        onChange={(e) => handleParsedContentChange(block.id, idx, 'value', e.target.value)}
                                    />
                                    <input
                                        placeholder="Etiket"
                                        className="h-10 w-full rounded-lg border bg-white p-2 text-sm outline-none"
                                        value={stat.label || ""}
                                        onChange={(e) => handleParsedContentChange(block.id, idx, 'label', e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => saveBlock(block)}
                            className="mt-4 w-fit rounded-xl bg-amber-500 px-6 py-2 text-white font-bold hover:bg-amber-600"
                        >
                            Kaydet
                        </button>
                    </Card>
                ))}

                {/* SERVICES SECTION */}
                {blocks.filter(b => b.block_type === 'services').map(block => (
                    <Card key={block.id} extra="p-5 border-l-4 border-cyan-500">
                        <h3 className="text-lg font-bold text-navy-700 mb-4">Hizmetlerimiz</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(block.parsedContent || []).map((service, idx) => (
                                <div key={idx} className="p-4 border border-gray-100 rounded-xl">
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <input
                                            placeholder="İkon (box-icon)"
                                            className="h-10 w-full rounded-lg border bg-white p-2 text-sm outline-none"
                                            value={service.icon || ""}
                                            onChange={(e) => handleParsedContentChange(block.id, idx, 'icon', e.target.value)}
                                        />
                                        <input
                                            placeholder="Hizmet Adı"
                                            className="h-10 w-full rounded-lg border bg-white p-2 text-sm outline-none"
                                            value={service.title || ""}
                                            onChange={(e) => handleParsedContentChange(block.id, idx, 'title', e.target.value)}
                                        />
                                    </div>
                                    <textarea
                                        placeholder="Kısa açıklama..."
                                        className="w-full rounded-lg border bg-white p-2 text-sm outline-none"
                                        rows="2"
                                        value={service.description || ""}
                                        onChange={(e) => handleParsedContentChange(block.id, idx, 'description', e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => saveBlock(block)}
                            className="mt-4 w-fit rounded-xl bg-cyan-500 px-6 py-2 text-white font-bold hover:bg-cyan-600"
                        >
                            Kaydet
                        </button>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Blocks;
