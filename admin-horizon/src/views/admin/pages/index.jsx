import React, { useEffect, useState } from "react";
import Card from "components/card";
import { MdDelete, MdEdit, MdAdd } from "react-icons/md";
import { pageService, homepageService } from "../../../api";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
// --- Emergency UI Injection: AnasayfaBlokYonetimi Inline ---
const AnasayfaBlokYonetimi = () => {
    const [blocks, setBlocks] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [saveStatus, setSaveStatus] = React.useState("");

    React.useEffect(() => {
        const fetchBlocks = async () => {
            try {
                setLoading(true);
                // BYPASS BLOCKS ROUTE: Fetch from pages table logic
                const res = await pageService.getPageBySlug('home');
                const pageData = res.data;
                let parsedBlocks = [];
                try {
                    parsedBlocks = JSON.parse(pageData.content_html || "[]");
                } catch (e) {
                    console.error("JSON Parse error for home content_html:", e);
                    parsedBlocks = [];
                }

                if (parsedBlocks.length === 0) {
                    // Fallback UI in case JSON is empty or broken
                    parsedBlocks = [
                        { id: 'hero-1', block_type: 'hero', title: 'Hoşgeldiniz', video_url: '/assets/hero-video.mp4', subtitle: 'Exclusive Mediterranean Living', content: 'Where would you love to live?', active: 1 },
                        { id: 'stats-1', block_type: 'stats', title: 'İstatistikler', parsedContent: [{ label: 'Years Experience', value: '15+' }, { label: 'Premium Agents', value: '12+' }, { label: 'Commitment', value: '100%' }], active: 1 },
                        { id: 'services-1', block_type: 'services', title: 'Hizmetlerimiz', parsedContent: [{ title: 'Real Estate', desc: 'Expert guidance for your property journey', icon: 'Home' }], active: 1 }
                    ];
                }
                setBlocks(parsedBlocks);
                setError(null);
            } catch (err) {
                console.error("Error fetching homepage from pages table:", err);
                setError("Anasayfa verisi alınamadı. Lütfen 'home' slug'lı bir sayfa olduğundan emin olun.");
            } finally {
                setLoading(false);
            }
        };
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

    const saveAllBlocks = async () => {
        try {
            setSaveStatus(`Kaydediliyor...`);
            // Fetch current home page data first to preserve other fields
            const res = await pageService.getPageBySlug('home');
            const pageData = res.data;

            // Save updated blocks as JSON in content_html
            const updatedPage = {
                ...pageData,
                content_html: JSON.stringify(blocks)
            };

            await pageService.savePage(updatedPage);
            setSaveStatus("Tüm değişiklikler başarıyla kaydedildi!");
            setTimeout(() => setSaveStatus(""), 3000);
        } catch (err) {
            console.error("Error saving homepage blocks:", err);
            setSaveStatus("Hata oluştu kanka!");
        }
    };

    if (loading) return <div style={{ padding: '20px', color: 'blue' }}>Yükleniyor (Sistem hazirlaniyor)...</div>;

    return (
        <div style={{ padding: '20px', background: '#f4f7fe', borderRadius: '20px', color: '#1b2559' }}>
            {error && (
                <div style={{ padding: '15px', marginBottom: '20px', background: '#FFF4E5', border: '1px solid #FFCC80', borderRadius: '12px', color: '#663C00', fontWeight: '500' }}>
                    ⚠️ {error}
                </div>
            )}
            <div style={{ marginBottom: '20px', fontWeight: 'bold', color: 'green' }}>{saveStatus}</div>

            {/* HERO SECTION */}
            {blocks.filter(b => b.block_type === 'hero').map(block => (
                <div key={block.id} style={{ marginBottom: '30px', padding: '20px', background: 'white', borderRadius: '15px', borderLeft: '5px solid #4318FF' }}>
                    <h3 style={{ margin: '0 0 15px 0' }}>Seksiyon: Giriş (Hero Video)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Video URL (.mp4)</label>
                            <input
                                type="text"
                                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #e0e5f2' }}
                                value={block.video_url || ""}
                                onChange={(e) => handleFieldChange(block.id, 'video_url', e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Ana Başlık</label>
                            <input
                                type="text"
                                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #e0e5f2' }}
                                value={block.title || ""}
                                onChange={(e) => handleFieldChange(block.id, 'title', e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Alt Başlık (Subtitle)</label>
                            <input
                                type="text"
                                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #e0e5f2' }}
                                value={block.subtitle || ""}
                                onChange={(e) => handleFieldChange(block.id, 'subtitle', e.target.value)}
                            />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Arama Bölümü Başlığı (Search Section Title)</label>
                            <input
                                type="text"
                                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #e0e5f2' }}
                                value={block.content || ""}
                                onChange={(e) => handleFieldChange(block.id, 'content', e.target.value)}
                                placeholder="Örn: Where would you love to live?"
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={saveAllBlocks}
                        style={{ marginTop: '15px', padding: '10px 20px', background: '#4318FF', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Tüm Değişiklikleri Kaydet
                    </button>
                </div>
            ))}

            {/* STATS SECTION */}
            {blocks.filter(b => b.block_type === 'stats').map(block => (
                <div key={block.id} style={{ marginBottom: '30px', padding: '20px', background: 'white', borderRadius: '15px', borderLeft: '5px solid #FFB547' }}>
                    <h3 style={{ margin: '0 0 15px 0' }}>Seksiyon: İstatistikler (Stats)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                        {(block.parsedContent || []).map((stat, idx) => (
                            <div key={idx} style={{ padding: '10px', background: '#f8f9ff', borderRadius: '10px' }}>
                                <input
                                    type="text"
                                    placeholder="Değer (Ör: 10+)"
                                    style={{ width: '100%', padding: '8px', marginBottom: '5px', borderRadius: '5px', border: '1px solid #ddd' }}
                                    value={stat.value || ""}
                                    onChange={(e) => handleParsedContentChange(block.id, idx, 'value', e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Etiket"
                                    style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                                    value={stat.label || ""}
                                    onChange={(e) => handleParsedContentChange(block.id, idx, 'label', e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={saveAllBlocks}
                        style={{ marginTop: '15px', padding: '10px 20px', background: '#FFB547', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Tüm Değişiklikleri Kaydet
                    </button>
                </div>
            ))}

            {/* SERVICES SECTION */}
            {blocks.filter(b => b.block_type === 'services').map(block => (
                <div key={block.id} style={{ marginBottom: '30px', padding: '20px', background: 'white', borderRadius: '15px', borderLeft: '5px solid #01B9C5' }}>
                    <h3 style={{ margin: '0 0 15px 0' }}>Seksiyon: Hizmetlerimiz (Services)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {(block.parsedContent || []).map((service, idx) => (
                            <div key={idx} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '11px', fontWeight: 'bold' }}>İkon</label>
                                        <input
                                            type="text"
                                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                                            value={service.icon || ""}
                                            onChange={(e) => handleParsedContentChange(block.id, idx, 'icon', e.target.value)}
                                        />
                                    </div>
                                    <div style={{ flex: 2 }}>
                                        <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Hizmet Başlığı</label>
                                        <input
                                            type="text"
                                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                                            value={service.title || ""}
                                            onChange={(e) => handleParsedContentChange(block.id, idx, 'title', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Açıklama</label>
                                <textarea
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '60px' }}
                                    value={service.description || ""}
                                    onChange={(e) => handleParsedContentChange(block.id, idx, 'description', e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={saveAllBlocks}
                        style={{ marginTop: '15px', padding: '10px 20px', background: '#01B9C5', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Tüm Değişiklikleri Kaydet
                    </button>
                </div>
            ))}
        </div>
    );
};

const Pages = () => {
    const [pages, setPages] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPage, setEditingPage] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        content_html: "",
        banner_title: "",
        banner_url: "",
        gallery_json: "[]",
        active: 1
    });

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const res = await pageService.getPages();
            let allPages = res.data;
            // Force check if home exists in the list
            if (!allPages.find(p => p.slug === 'home')) {
                allPages = [{ id: 'home-fixed', title: 'Anasayfa', slug: 'home', active: 1 }, ...allPages];
            }
            setPages(allPages);
        } catch (err) {
            console.error("Error fetching pages:", err);
        }
    };

    const handleEdit = (page) => {
        setEditingPage(page);
        setFormData({
            ...page,
            banner_title: page.banner_title || "",
            banner_url: page.banner_url || "",
            gallery_json: page.gallery_json || "[]"
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bu sayfayı silmek istediğinizden emin misiniz?")) {
            try {
                await pageService.deletePage(id);
                fetchPages();
            } catch (err) {
                console.error("Error deleting page:", err);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await pageService.savePage(formData);
            setIsFormOpen(false);
            setEditingPage(null);
            setFormData({ title: "", slug: "", content_html: "", banner_title: "", banner_url: "", active: 1 });
            fetchPages();
        } catch (err) {
            console.error("Error saving page:", err);
        }
    };

    return (
        <div className="flex w-full flex-col gap-5">
            <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                    Sayfa Yönetimi
                </h4>
                <button
                    onClick={() => {
                        setEditingPage(null);
                        setFormData({ title: "", slug: "", content_html: "", banner_title: "", banner_url: "", active: 1 });
                        setIsFormOpen(true);
                    }}
                    className="flex items-center justify-center rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700"
                >
                    <MdAdd className="mr-1 h-5 w-5" /> Yeni Sayfa Oluştur
                </button>
            </div>

            {isFormOpen ? (
                editingPage?.slug === 'home' ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                                Anasayfa Blok Yönetimi
                            </h4>
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="rounded-xl border border-gray-200 px-6 py-2 text-sm font-bold text-navy-700 dark:text-white"
                            >
                                Geri Dön
                            </button>
                        </div>
                        <AnasayfaBlokYonetimi />
                    </div>
                ) : (
                    <Card extra={"w-full h-full p-6 bg-gray-50/50"}>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* BLOCK 1: BANNER SETTINGS */}
                            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-navy-700 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-brand-500 rounded-full"></span>
                                    Banner Ayarları
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="text-sm font-bold text-navy-700 dark:text-white">Sayfa Başlığı (Menü İsim)</label>
                                        <input
                                            type="text"
                                            placeholder="Ör: Hakkımızda"
                                            className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border bg-white/0 p-3 text-sm outline-none border-gray-200"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="text-sm font-bold text-navy-700 dark:text-white">URL Adresi (Slug)</label>
                                        <input
                                            type="text"
                                            placeholder="hakkimizda"
                                            className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border bg-white/0 p-3 text-sm outline-none border-gray-200"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-navy-700 dark:text-white">Banner Başlığı</label>
                                        <input
                                            type="text"
                                            placeholder="Sayfa başında görünecek büyük başlık"
                                            className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border bg-white/0 p-3 text-sm outline-none border-gray-200"
                                            value={formData.banner_title}
                                            onChange={(e) => setFormData({ ...formData, banner_title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-navy-700 dark:text-white">Banner Görsel URL</label>
                                        <input
                                            type="text"
                                            placeholder="https://..."
                                            className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border bg-white/0 p-3 text-sm outline-none border-gray-200"
                                            value={formData.banner_url}
                                            onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* BLOCK 2: CONTENT EDITOR */}
                            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-navy-700 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
                                    Sayfa İçeriği
                                </h3>
                                <div className="bg-white dark:bg-navy-800 rounded-xl border border-gray-200 overflow-hidden">
                                    <CKEditor
                                        editor={ClassicEditor}
                                        data={formData.content_html}
                                        onChange={(event, editor) => {
                                            const data = editor.getData();
                                            setFormData({ ...formData, content_html: data });
                                        }}
                                        config={{
                                            toolbar: [
                                                'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'insertTable', 'undo', 'redo'
                                            ]
                                        }}
                                    />
                                </div>
                            </div>

                            {/* BLOCK 3: IMAGE GALLERY */}
                            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-navy-700 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-cyan-500 rounded-full"></span>
                                    Görsel Galeri
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {(() => {
                                            try {
                                                const gallery = JSON.parse(formData.gallery_json || "[]");
                                                return gallery.map((img, idx) => (
                                                    <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newGallery = gallery.filter((_, i) => i !== idx);
                                                                setFormData({ ...formData, gallery_json: JSON.stringify(newGallery) });
                                                            }}
                                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <MdDelete size={16} />
                                                        </button>
                                                    </div>
                                                ));
                                            } catch (e) { return null; }
                                        })()}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const url = window.prompt("Görsel URL adresini giriniz:");
                                                if (url) {
                                                    const gallery = JSON.parse(formData.gallery_json || "[]");
                                                    setFormData({ ...formData, gallery_json: JSON.stringify([...gallery, url]) });
                                                }
                                            }}
                                            className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-brand-500 hover:text-brand-500 transition-all"
                                        >
                                            <MdAdd size={24} />
                                            <span className="text-[10px] font-bold mt-2 uppercase">Görsel Ekle</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="rounded-xl border border-gray-200 px-8 py-3 text-sm font-bold text-navy-700 hover:bg-gray-50 transition-colors"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-brand-500 px-8 py-3 text-sm font-bold text-white hover:bg-brand-600 shadow-lg shadow-brand-500/20 active:scale-95 transition-all"
                                >
                                    Değişiklikleri Kaydet & Yayınla
                                </button>
                            </div>
                        </form>
                    </Card>
                )
            ) : (
                <Card extra={"w-full h-full p-4 overflow-x-scroll"}>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 pb-2 text-left">
                                <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Sayfa Adı</th>
                                <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Slug</th>
                                <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Banner Başlığı</th>
                                <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-400">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pages.map((page) => (
                                <tr key={page.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                    <td className="py-4 text-sm font-bold text-navy-700 dark:text-white">
                                        {page.title}
                                        {page.slug === 'home' && (
                                            <span className="ml-2 rounded-lg bg-green-100 px-2 py-1 text-[10px] text-green-600 uppercase">Dinamik Bloklar</span>
                                        )}
                                    </td>
                                    <td className="py-4 text-sm text-gray-600">/{page.slug}</td>
                                    <td className="py-4 text-sm text-gray-500 italic">{page.banner_title || (page.slug === 'home' ? "Video Arka Plan" : "-")}</td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleEdit(page)} className="text-xl text-gray-400 hover:text-brand-500 transition-colors"><MdEdit /></button>
                                            <button onClick={() => handleDelete(page.id)} className="text-xl text-gray-400 hover:text-red-500 transition-colors"><MdDelete /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}
        </div>
    );
};

export default Pages;
