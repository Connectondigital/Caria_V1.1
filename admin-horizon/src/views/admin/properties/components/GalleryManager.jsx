import React, { useState, useRef } from "react";
import { MdDelete, MdPhotoCamera, MdCheckCircle, MdDragIndicator } from "react-icons/md";
import { propertyService, BACKEND_URL } from "../../../../api";

const GalleryManager = ({ gallery, onChange, coverImage, onCoverChange }) => {
    const [uploading, setUploading] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const fileInputRef = useRef(null);

    const items = Array.isArray(gallery) ? gallery : [];

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const newItems = [...items];
            for (const file of files) {
                const res = await propertyService.uploadImage(file);
                const imageUrl = `${BACKEND_URL}${res.data.url}`;
                newItems.push({
                    url: imageUrl,
                    category: "Genel",
                    id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                });

                if (!coverImage && newItems.length === 1) {
                    onCoverChange(imageUrl);
                }
            }
            onChange(newItems);
        } catch (err) {
            alert("Yükleme hatası: " + err.message);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDelete = (index) => {
        const itemToDelete = items[index];
        const updated = items.filter((_, i) => i !== index);
        onChange(updated);
        if (itemToDelete.url === coverImage) {
            onCoverChange(updated.length > 0 ? updated[0].url : "");
        }
    };

    const onDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const onDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const updated = [...items];
        const draggedItem = updated[draggedIndex];
        updated.splice(draggedIndex, 1);
        updated.splice(index, 0, draggedItem);

        setDraggedIndex(index);
        onChange(updated);
    };

    const onDragEnd = () => {
        setDraggedIndex(null);
    };

    return (
        <div className="space-y-6">
            {/* Minimalist Upload Trigger */}
            <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
                <MdPhotoCamera className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Görsel Yüklemek İçin Tıklayın</span>
                <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
                {uploading && <div className="text-brand-500 text-[10px] mt-2 animate-pulse">YÜKLENİYOR...</div>}
            </div>

            {/* Thumbnail Grid - Matching 101evler compact style */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {items.map((item, index) => {
                    const isCover = item.url === coverImage;
                    const isDragging = draggedIndex === index;

                    return (
                        <div
                            key={item.id || index}
                            draggable
                            onDragStart={(e) => onDragStart(e, index)}
                            onDragOver={(e) => onDragOver(e, index)}
                            onDragEnd={onDragEnd}
                            className={`relative border rounded overflow-hidden transition-all cursor-move bg-white shadow-sm ${isCover ? 'ring-2 ring-brand-500' : 'border-gray-200'
                                } ${isDragging ? 'opacity-30' : 'opacity-100'}`}
                        >
                            <div className="aspect-video relative overflow-hidden flex items-center justify-center">
                                <img src={item.url} alt="" className="w-full h-full object-cover" />

                                {isCover && (
                                    <div className="absolute top-0 right-0 bg-brand-500 text-white p-0.5 text-[8px] font-bold px-1.5 rounded-bl shadow-sm">
                                        KAPAK
                                    </div>
                                )}

                                <div className="absolute top-0 left-0 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-br opacity-80 backdrop-blur-sm">
                                    #{index + 1}
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 bg-black/40 p-1 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                    {/* Action overlays removed for a cleaner look, using buttons below instead? No, reference has them usually. */}
                                </div>
                            </div>

                            <div className="p-1.5 flex justify-between items-center bg-gray-50 border-t">
                                <button
                                    type="button"
                                    onClick={() => onCoverChange(item.url)}
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isCover ? "bg-brand-500 text-white" : "bg-white text-gray-600 border"}`}
                                >
                                    {isCover ? "KAPAK" : "KAPAK YAP"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(index)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                >
                                    <MdDelete className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GalleryManager;
