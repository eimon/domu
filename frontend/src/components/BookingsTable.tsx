"use client";

import { useState } from "react";
import { Booking, Property, Guest } from "@/types/api";
import { Trash2, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { deleteBooking } from "@/actions/bookings";
import { Link } from "@/i18n/routing";

interface BookingsTableProps {
    bookings: Booking[];
    properties?: Property[];
    guests?: Guest[];
}

export default function BookingsTable({ bookings, properties = [], guests = [] }: BookingsTableProps) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const t = useTranslations("Common");
    const tBooking = useTranslations("Bookings");
    const tEnums = useTranslations("Enums");

    const getPropertyName = (id: string) => properties.find(p => p.id === id)?.name || id.substring(0, 8);
    const getGuestName = (id: string) => guests.find(g => g.id === id)?.full_name || "Anonymous";

    const handleDelete = async (booking: Booking) => {
        if (!confirm(t('confirmDelete'))) {
            return;
        }

        setIsDeleting(booking.id);
        const result = await deleteBooking(booking.id);

        if (result.error) {
            alert(result.error);
        }
        setIsDeleting(null);
    };

    if (bookings.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">{tBooking('noBookings')}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t('property')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t('guest')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {tBooking('checkIn')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {tBooking('checkOut')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {tBooking('status')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t('actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <Link href={`/properties/${booking.property_id}`} className="hover:text-blue-600 flex items-center">
                                        {getPropertyName(booking.property_id)}
                                        <ExternalLink size={12} className="ml-1 opacity-50" />
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {getGuestName(booking.guest_id)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {booking.check_in}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {booking.check_out}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                            booking.status === 'TENTATIVE' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {tEnums(`BookingStatus.${booking.status}`)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button
                                            onClick={() => handleDelete(booking)}
                                            disabled={isDeleting === booking.id}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                            title={t('delete')}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
