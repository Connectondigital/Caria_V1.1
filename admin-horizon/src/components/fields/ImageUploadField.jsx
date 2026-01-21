import React, { useState, useRef } from "react";
import { MdDelete, MdPhotoCamera, MdLink } from "react-icons/md";
import { propertyService, BACKEND_URL } from "../../api";

const ImageUploadField = ({ id, label, value, onChange, placeholder = "Görsel URL veya Yükle" }) => {
    const [uploading, setUploading] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await propertyService.uploadImage(file);
            const imageUrl = `${BACKEND_URL}${res.data.url}`;
            onChange({ target: { id, value: imageUrl } });
        } catch (err) {
            alert("Yükleme hatası: " + err.message);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDelete = () => {
        onChange({ target: { id, value: "" } });
    };

    return (
        <div className="flex flex-col mb-4">
            <label className="text-xs font-bold text-gray-700 mb-2 dark:text-white">
                {label}
            </label>

            <div className="relative">
                {value ? (
                    <div className="relative group w-full h-40 rounded-xl overflow-hidden border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <img src={value} alt={label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3 bg-white text-navy-700 rounded-full hover:bg-brand-50 transition-colors shadow-lg"
                                title="Değiştir"
                            >
                                <MdPhotoCamera size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="p-3 bg-white text-red-500 rounded-full hover:bg-red-50 transition-colors shadow-lg"
                                title="Sil"
                            >
                                <MdDelete size={20} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => !showUrlInput && fileInputRef.current?.click()}
                        className={`w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer bg-gray-50/50
                            ${uploading ? 'border-brand-300' : 'border-gray-200 hover:border-brand-500 hover:bg-brand-50/30'}
                        `}
                    >
                        {!uploading ? (
                            <>
                                <MdPhotoCamera className="w-10 h-10 text-gray-400 mb-2" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center px-4">
                                    Görsel Yüklemek İçin Tıklayın <br />
                                    <span className="text-[10px] font-normal lowercase">(veya sürükleyip bırakın)</span>
                                </span>
                            </>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                <span className="text-xs font-bold text-brand-500 animate-pulse">YÜKLENİYOR...</span>
                            </div>
                        )}
                    </div>
                )}

                {/* URL Input Toggle */}
                <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="absolute -top-1 right-0 text-[10px] flex items-center gap-1 text-gray-400 hover:text-brand-500 transition-colors"
                >
                    <MdLink /> {showUrlInput ? "Yükleme Modu" : "URL ile ekle"}
                </button>

                {showUrlInput && (
                    <div className="mt-3">
                        <input
                            id={id}
                            type="text"
                            placeholder={placeholder}
                            value={value || ""}
                            onChange={onChange}
                            className="w-full text-xs border-b border-gray-200 py-1 focus:border-brand-500 outline-none transition-all dark:bg-navy-800 dark:text-white"
                        />
                    </div>
                )}
            </div>

            <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
            />
        </div>
    );
};

export default ImageUploadField;
