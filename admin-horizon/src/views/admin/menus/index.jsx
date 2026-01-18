import React, { useEffect, useState } from "react";
import Card from "components/card";
import { MdDelete, MdAdd, MdDragIndicator } from "react-icons/md";
import { menuService, pageService } from "../../../api";

const Menus = () => {
    const [menus, setMenus] = useState([]);
    const [pages, setPages] = useState([]);
    const [formData, setFormData] = useState({ title: "", url: "", menu_type: "header", display_order: 0 });

    useEffect(() => {
        fetchMenus();
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const res = await pageService.getPages();
            setPages(res.data);
        } catch (err) {
            console.error("Error fetching pages for menu:", err);
        }
    };

    const fetchMenus = async () => {
        try {
            const res = await menuService.getMenus();
            setMenus(res.data.sort((a, b) => a.display_order - b.display_order));
        } catch (err) {
            console.error("Error fetching menus:", err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bu menü elemanını silmek istediğinizden emin misiniz?")) {
            try {
                await menuService.deleteMenu(id);
                fetchMenus();
            } catch (err) {
                console.error("Error deleting menu item:", err);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await menuService.saveMenu(formData);
            setFormData({ title: "", url: "", menu_type: "header", display_order: menus.length + 1 });
            fetchMenus();
        } catch (err) {
            console.error("Error saving menu item:", err);
        }
    };

    const updateOrder = async (id, newOrder) => {
        const item = menus.find(m => m.id === id);
        if (!item) return;
        try {
            await menuService.saveMenu({ ...item, display_order: newOrder });
            fetchMenus();
        } catch (err) {
            console.error("Error updating order:", err);
        }
    }

    return (
        <div className="flex w-full flex-col gap-5">
            <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                Menü Yönetimi (Header & Footer)
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card extra={"p-6 h-fit"}>
                    <h5 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">Yeni Navigasyon Ekle</h5>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-navy-700 dark:text-white">Görünecek İsim</label>
                            <input
                                type="text"
                                placeholder="Hakkımızda"
                                className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border bg-white/0 p-3 text-sm outline-none border-gray-200"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-navy-700 dark:text-white">URL veya Yol</label>
                                <select
                                    className="text-[10px] font-bold text-brand-500 bg-transparent outline-none cursor-pointer"
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            const page = pages.find(p => p.slug === e.target.value);
                                            setFormData({ ...formData, title: page?.title || "", url: e.target.value === 'home' ? '/' : `/${e.target.value}` });
                                        }
                                    }}
                                >
                                    <option value="">Hızlı Sayfa Seç...</option>
                                    {pages.map(p => (
                                        <option key={p.id} value={p.slug}>{p.title}</option>
                                    ))}
                                </select>
                            </div>
                            <input
                                type="text"
                                placeholder="/hakkimizda"
                                className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border bg-white/0 p-3 text-sm outline-none border-gray-200"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-sm font-bold text-navy-700 dark:text-white">Konum</label>
                                <select
                                    className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border bg-white/0 p-3 text-sm outline-none border-gray-200"
                                    value={formData.menu_type}
                                    onChange={(e) => setFormData({ ...formData, menu_type: e.target.value })}
                                >
                                    <option value="header">Header (Üst Menü)</option>
                                    <option value="footer">Footer (Alt Menü)</option>
                                </select>
                            </div>
                            <div className="w-24">
                                <label className="text-sm font-bold text-navy-700 dark:text-white">Sıra</label>
                                <input
                                    type="number"
                                    className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border bg-white/0 p-3 text-sm outline-none border-gray-200"
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full rounded-xl bg-brand-500 py-3 text-sm font-bold text-white transition duration-200 hover:bg-brand-600 shadow-lg shadow-brand-200"
                        >
                            Menüye Dahil Et
                        </button>
                    </form>
                </Card>

                <Card extra={"p-6"}>
                    <h5 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">Menü Yapısı</h5>
                    <div className="space-y-3">
                        {menus.map((item, index) => (
                            <div key={item.id} className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-all dark:bg-navy-800 dark:border-navy-700">
                                <div className="flex items-center gap-4">
                                    <div className="cursor-move text-gray-300 group-hover:text-brand-500 transition-colors">
                                        <MdDragIndicator className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-navy-700 dark:text-white">{item.title}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded uppercase font-bold text-gray-400">{item.menu_type}</span>
                                            <span className="text-xs text-brand-500">{item.url}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => updateOrder(item.id, item.display_order - 1)}
                                            className="text-xs font-bold text-gray-400 hover:text-brand-500 disabled:opacity-30"
                                            disabled={index === 0}
                                        >▲</button>
                                        <button
                                            onClick={() => updateOrder(item.id, item.display_order + 1)}
                                            className="text-xs font-bold text-gray-400 hover:text-brand-500 disabled:opacity-30"
                                            disabled={index === menus.length - 1}
                                        >▼</button>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="rounded-full p-2 text-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                                    >
                                        <MdDelete />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {menus.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <p className="text-sm italic">Henüz bir menü elemanı tanımlanmamış.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Menus;
