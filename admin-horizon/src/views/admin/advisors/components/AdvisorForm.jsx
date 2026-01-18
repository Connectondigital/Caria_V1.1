
import React, { useState } from "react";
import Card from "components/card";
import InputField from "components/fields/InputField";
import { advisorService } from "../../../../api";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const AdvisorForm = ({ advisor, onClose, onSuccess }) => {
    const [formData, setFormData] = useState(
        advisor || {
            name: "",
            slug: "",
            title: "",
            email: "",
            phone: "",
            bio_html: "",
            image_url: ""
        }
    );

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleEditorChange = (event, editor) => {
        const data = editor.getData();
        setFormData(prev => ({ ...prev, bio_html: data }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submissionData = { ...formData };
            if (!submissionData.slug) {
                submissionData.slug = submissionData.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
            }
            await advisorService.saveAdvisor(submissionData);
            onSuccess();
        } catch (err) {
            alert("Hata oluştu kanka: " + err.message);
        }
    };

    return (
        <Card extra={"w-full h-full p-6"}>
            <div className="flex items-center justify-between mb-8">
                <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                    {advisor ? "Danışmanı Düzenle" : "Yeni Danışman Ekle"}
                </h4>
                <button onClick={onClose} className="text-gray-600 hover:text-navy-700">İptal</button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                    id="name"
                    label="Danışman Adı Soyadı"
                    placeholder="Örn: Pilar Anguita"
                    value={formData.name}
                    onChange={handleChange}
                />
                <InputField
                    id="title"
                    label="Ünvan"
                    placeholder="Örn: Senior Property Advisor"
                    value={formData.title}
                    onChange={handleChange}
                />
                <InputField
                    id="email"
                    label="E-posta"
                    placeholder="pilar@cariaestates.com"
                    value={formData.email}
                    onChange={handleChange}
                />
                <InputField
                    id="phone"
                    label="Telefon"
                    placeholder="+90 548 ..."
                    value={formData.phone}
                    onChange={handleChange}
                />
                <div className="md:col-span-2">
                    <InputField
                        id="image_url"
                        label="Profil Görseli (Portrait URL)"
                        placeholder="https://..."
                        value={formData.image_url}
                        onChange={handleChange}
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-white mb-2 ml-3">Biyografi (Rich Text)</label>
                    <CKEditor
                        editor={ClassicEditor}
                        data={formData.bio_html}
                        onChange={handleEditorChange}
                        config={{
                            toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote']
                        }}
                    />
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
                        {advisor ? "Güncelle" : "Kaydet"}
                    </button>
                </div>
            </form>
        </Card>
    );
};

export default AdvisorForm;
