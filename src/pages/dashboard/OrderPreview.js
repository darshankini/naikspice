import { money } from "../../components/Layout";

const OrderPreview = ({orderDetails,onClose}) => {
    
    const {order,items,customer} = orderDetails;
    
    return (
        
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
    {/* Modal */}
    <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b bg-gray-50 px-6 py-4">
            <div>
                <p className="text-sm font-medium text-gray-500">
                    Order Details
                </p>

                <h2 className="text-xl font-bold text-gray-800">
                    Order No: #{order.id}
                </h2>
            </div>

            <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full
                           text-2xl text-gray-400 transition
                           hover:bg-gray-200 hover:text-gray-700"
            >
                &times;
            </button>
        </div>

        {/* Customer Information */}
        {customer && (
            <div className="mx-6 mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Customer Information
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="font-semibold text-gray-800">
                            {customer.customer_name}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="break-all font-semibold text-gray-800">
                            {customer.customer_email}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500">Mobile</p>
                        <p className="font-semibold text-gray-800">
                            {customer.customer_mobile}
                        </p>
                    </div>
                </div>
            </div>
        )}

        {/* Order Items */}
        <div className="px-6 py-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Order Items
            </h3>

            <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-600">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold">
                                Item
                            </th>

                            <th className="px-4 py-3 text-center font-semibold">
                                Weight
                            </th>

                            <th className="px-4 py-3 text-right font-semibold">
                                Subtotal
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {items.map((p) => (
                            <tr
                                key={p.id}
                                className="transition hover:bg-gray-50"
                            >
                                <td className="px-4 py-3 font-medium text-gray-800">
                                    {p.name}
                                </td>

                                <td className="px-4 py-3 text-center text-gray-600">
                                    <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-gray-100 px-2 py-1 font-medium">
                                        {p.grams} g
                                    </span>
                                </td>

                                <td className="px-4 py-3 text-right font-medium text-gray-800">
                                    {money(p.amount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Total */}
        <div className="border-t bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-600">
                    Total
                </span>

                <span className="text-2xl font-bold text-gray-900">
                    {money(order.total)}
                </span>
            </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t px-6 py-4">
            <button
                onClick={onClose}
                className="rounded-lg bg-gray-800 px-5 py-2.5
                           font-medium text-white transition
                           hover:bg-gray-700
                           focus:outline-none focus:ring-2
                           focus:ring-gray-400 focus:ring-offset-2"
            >
                Close
            </button>
        </div>
    </div>
</div>

    )
}

export default OrderPreview;