import { useEffect, useState } from 'react';
import { api } from '../api';
import { money } from '../components/Layout';
import ProductsAdmin from './dashboard/ProductsAdmin';
import CategoriesAdmin from './dashboard/CategoriesAdmin';
import OrderAdmin from './dashboard/OrderAdmin';
import OrderPreview from './dashboard/OrderPreview';

function Stat({ label, value, hint }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [isPreview,setIsPreview] = useState(null);
  const [orderDetails,setOrderDetails] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then(setStats).catch((e) => console.error(e));
  }, []);

  const maxSales = stats ? Math.max(1, ...stats.trend.map((d) => Number(d.sales))) : 1;

  const onClose = () => {
    setIsPreview(false);
  }

  const isOrderPreview = async (id) => {
    
    console.log(id);
    try{
      const orderDetails = await api.get(`/orders/getOrderDetails/${id}`);
      setOrderDetails(orderDetails);
      setIsPreview(true);
    }catch(error){
      console.error('error',error);
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-100 p-4 md:p-6 space-y-6">
      <h1 className="text-xl font-bold">Dashboard</h1>

      {/* Today's stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Stat label="Orders Today" value={stats ? stats.today.orders : '…'} />
        <Stat label="Sales Today" value={stats ? money(stats.today.sales) : '…'} />
        <Stat
          label="Avg / Order"
          value={stats && stats.today.orders ? money(stats.today.sales / stats.today.orders) : money(0)}
        />
      </div>

      {/* 7-day trend */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-3">Last 7 days</h3>
        {stats && stats.trend.length ? (
          <div className="flex items-end gap-3 h-32">
            {stats.trend.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center justify-end gap-1">
                <div className="text-xs text-gray-500">{money(d.sales)}</div>
                <div
                  className="w-full bg-brand/80 rounded-t"
                  style={{ height: `${(Number(d.sales) / maxSales) * 100}%` }}
                  title={`${d.orders} orders`}
                />
                <div className="text-xs text-gray-400">{new Date(d.day).toLocaleDateString(undefined, { weekday: 'short' })}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No sales yet.</p>
        )}
      </div>

      {/* CRUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProductsAdmin />
        </div>
        <div className="lg:col-span-2">
          <OrderAdmin
          isOrderPreview={isOrderPreview}/>
        </div>
        <div>
          <CategoriesAdmin />
        </div>
      </div>

      {isPreview && (
        <OrderPreview
        orderDetails={orderDetails}
        onClose={onClose}/>
      )}
    </div>
  );
}
