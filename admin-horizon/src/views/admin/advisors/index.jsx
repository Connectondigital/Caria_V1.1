
import React, { useEffect, useState } from "react";
import Card from "components/card";
import { MdDelete, MdEdit, MdAdd } from "react-icons/md";
import { advisorService } from "../../../api";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import AdvisorForm from "./components/AdvisorForm";

const columnHelper = createColumnHelper();

const Advisors = () => {
    const [data, setData] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAdvisor, setEditingAdvisor] = useState(null);

    const fetchAdvisors = async () => {
        try {
            const resp = await advisorService.getAdvisors();
            setData(resp.data);
        } catch (err) {
            console.error("Failed to fetch advisors:", err);
        }
    };

    useEffect(() => {
        fetchAdvisors();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bu danışmanı silmek istediğinize emin misiniz?")) {
            try {
                await advisorService.deleteAdvisor(id);
                fetchAdvisors();
            } catch (err) {
                alert("Silme işlemi başarısız");
            }
        }
    };

    const handleEdit = (advisor) => {
        setEditingAdvisor(advisor);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setEditingAdvisor(null);
        setIsFormOpen(true);
    };

    const columns = [
        columnHelper.accessor("image_url", {
            id: "image",
            header: () => <p className="text-sm font-bold text-gray-600">GÖRSEL</p>,
            cell: (info) => (
                <img
                    src={info.getValue() || "https://via.placeholder.com/50"}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                />
            ),
        }),
        columnHelper.accessor("name", {
            id: "name",
            header: () => <p className="text-sm font-bold text-gray-600">AD SOYAD</p>,
            cell: (info) => (
                <p className="text-sm font-bold text-navy-700 dark:text-white">
                    {info.getValue()}
                </p>
            ),
        }),
        columnHelper.accessor("title", {
            id: "title",
            header: () => <p className="text-sm font-bold text-gray-600">ÜNVAN</p>,
            cell: (info) => (
                <p className="text-sm font-medium text-navy-700 dark:text-white">
                    {info.getValue()}
                </p>
            ),
        }),
        columnHelper.accessor("email", {
            id: "email",
            header: () => <p className="text-sm font-bold text-gray-600">E-POSTA</p>,
            cell: (info) => (
                <p className="text-sm text-gray-600 font-medium">
                    {info.getValue()}
                </p>
            ),
        }),
        columnHelper.display({
            id: "actions",
            header: () => <p className="text-sm font-bold text-gray-600">İŞLEMLER</p>,
            cell: (info) => (
                <div className="flex gap-2">
                    <button onClick={() => handleEdit(info.row.original)} className="text-brand-500 hover:text-brand-600">
                        <MdEdit className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(info.row.original.id)} className="text-red-500 hover:text-red-700">
                        <MdDelete className="h-5 w-5" />
                    </button>
                </div>
            ),
        }),
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="mt-5 pt-10">
            {isFormOpen ? (
                <AdvisorForm
                    advisor={editingAdvisor}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        fetchAdvisors();
                    }}
                />
            ) : (
                <Card extra={"w-full h-full px-6 pb-6 sm:overflow-x-auto"}>
                    <div className="relative flex items-center justify-between pt-4">
                        <div className="text-xl font-bold text-navy-700 dark:text-white">
                            Danışman Yönetimi
                        </div>
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700"
                        >
                            <MdAdd className="h-5 w-5" /> Danışman Ekle
                        </button>
                    </div>

                    <div className="mt-8 overflow-x-scroll xl:overflow-x-hidden">
                        <table className="w-full">
                            <thead>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id} className="!border-px !border-gray-400">
                                        {headerGroup.headers.map((header) => (
                                            <th key={header.id} className="cursor-pointer border-b border-gray-200 pt-4 pb-2 pr-4 text-start">
                                                <div className="text-xs text-gray-200">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.map((row) => (
                                    <tr key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="min-w-[150px] border-white/0 py-3 pr-4">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default Advisors;
