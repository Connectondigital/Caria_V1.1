import React, { useEffect, useState } from "react";
import Card from "components/card";
import { MdCheckCircle, MdOutlineError, MdDelete } from "react-icons/md";
import { inquiryService } from "../../../api";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

const columnHelper = createColumnHelper();

const Inquiries = () => {
    const [data, setData] = useState([]);
    const [sorting, setSorting] = useState([]);

    const fetchInquiries = async () => {
        try {
            const resp = await inquiryService.getInquiries();
            setData(resp.data);
        } catch (err) {
            console.error("Failed to fetch inquiries:", err);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this inquiry?")) {
            try {
                await inquiryService.deleteInquiry(id);
                fetchInquiries();
            } catch (err) {
                alert("Failed to delete inquiry");
            }
        }
    };

    const columns = [
        columnHelper.accessor("name", {
            id: "name",
            header: () => (
                <p className="text-sm font-bold text-gray-600 dark:text-white">AD SOYAD</p>
            ),
            cell: (info) => (
                <p className="text-sm font-bold text-navy-700 dark:text-white">
                    {info.getValue()}
                </p>
            ),
        }),
        columnHelper.accessor("email", {
            id: "email",
            header: () => (
                <p className="text-sm font-bold text-gray-600 dark:text-white">EMAİL</p>
            ),
            cell: (info) => (
                <p className="text-sm font-medium text-navy-700 dark:text-white">
                    {info.getValue()}
                </p>
            ),
        }),
        columnHelper.accessor("phone", {
            id: "phone",
            header: () => (
                <p className="text-sm font-bold text-gray-600 dark:text-white">TELEFON</p>
            ),
            cell: (info) => (
                <p className="text-sm font-medium text-navy-700 dark:text-white">
                    {info.getValue()}
                </p>
            ),
        }),
        columnHelper.accessor("status", {
            id: "status",
            header: () => (
                <p className="text-sm font-bold text-gray-600 dark:text-white">DURUM</p>
            ),
            cell: (info) => (
                <div className="flex items-center">
                    {info.getValue() === "completed" ? (
                        <MdCheckCircle className="text-green-500 me-1 dark:text-green-300" />
                    ) : (
                        <MdOutlineError className="text-amber-500 me-1 dark:text-amber-300" />
                    )}
                    <p className="text-sm font-bold text-navy-700 dark:text-white uppercase">
                        {info.getValue()}
                    </p>
                </div>
            ),
        }),
        columnHelper.accessor("created_at", {
            id: "created_at",
            header: () => (
                <p className="text-sm font-bold text-gray-600 dark:text-white">TARİH</p>
            ),
            cell: (info) => (
                <p className="text-sm font-medium text-gray-600 dark:text-white">
                    {info.getValue() ? new Date(info.getValue()).toLocaleDateString() : "-"}
                </p>
            ),
        }),
        columnHelper.display({
            id: "actions",
            header: () => (
                <p className="text-sm font-bold text-gray-600 dark:text-white">İŞLEM</p>
            ),
            cell: (info) => (
                <button
                    onClick={() => handleDelete(info.row.original.id)}
                    className="text-red-500 hover:text-red-700"
                >
                    <MdDelete className="h-5 w-5" />
                </button>
            ),
        }),
    ];

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        debugTable: false,
    });

    return (
        <div className="mt-5">
            <Card extra={"w-full h-full px-6 pb-6 sm:overflow-x-auto"}>
                <div className="relative flex items-center justify-between pt-4">
                    <div className="text-xl font-bold text-navy-700 dark:text-white">
                        Aday Müşteriler (CRM)
                    </div>
                </div>

                <div className="mt-8 overflow-x-scroll xl:overflow-x-hidden">
                    <table className="w-full">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="!border-px !border-gray-400">
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <th
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                onClick={header.column.getToggleSortingHandler()}
                                                className="cursor-pointer border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start"
                                            >
                                                <div className="items-center justify-between text-xs text-gray-200">
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {{
                                                        asc: " 🔼",
                                                        desc: " 🔽",
                                                    }[header.column.getIsSorted()] ?? null}
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row) => {
                                return (
                                    <tr key={row.id}>
                                        {row.getVisibleCells().map((cell) => {
                                            return (
                                                <td
                                                    key={cell.id}
                                                    className="min-w-[150px] border-white/0 py-3 pr-4"
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Inquiries;
