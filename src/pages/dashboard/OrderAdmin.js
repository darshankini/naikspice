import { useEffect, useState, useCallback } from 'react';
import { api } from '../../api';
import { money,formattedDate } from '../../components/Layout';

//const EMPTY = { name: '', price: '', category_id: '', image: '' };

export default function OrderAdmin({isOrderPreview}) {
  const [rows, setRows] = useState([]);
  const [currentPage,setCurrentPage] = useState(1);

  const orderPerPage = 10;

  const load = useCallback(() => {
    Promise.all([api.get('/orders')])
      .then(([o]) => { 
        setRows(o); 
      })
      .catch((e) => alert(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(rows.length/orderPerPage);
  const startIndex = ((currentPage - 1) * orderPerPage) + 1;
  const endIndex = orderPerPage * currentPage;
  const currentOrders = rows.slice(startIndex - 1,endIndex);

  const goToPage = (page) => {
    if(page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  const maxVisiblePages = 5;

  let startPage = Math.max(
    1,
    currentPage - Math.floor(maxVisiblePages / 2)
  );

  let endPage = startPage + maxVisiblePages - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(
      1,
      endPage - maxVisiblePages + 1
    );
  }

  const visiblePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index
  );

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-3">Order Details</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b">
            <tr>
                <th className="px-3 py-2 text-center">Sr No</th>
                <th className="px-3 py-2 text-center">Order Id</th>
                <th className="px-3 text-center">Total</th>
                <th className="px-3 text-center">Order Date</th>
                <th className='px-3 text-center'>Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {currentOrders.map((p,i) => (
              <tr key={p.id}>
                <td className="px-3 py-2 text-center">{++i}</td>
                <td className="px-3 text-center text-gray-500">{p.id}</td>
                <td className="px-3 text-center tabular-nums">{money(p.total)}</td>
                <td className="px-3 text-center tabular-nums">{formattedDate(p.created_at)}</td>
                <td className="px-3 text-center">
                    <button onClick={() => isOrderPreview(p.id)} className='bg-orange-600 rounded-md text-sm p-1 text-white'>Preview</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    
     {/* Pagination */}
    {totalPages > 1 && (
        <div className='mt-4 flex items-center justify-between border-t pt-4'>
            <p className='text-sm text-gray-500'>
                Showing{' '}
                <span className='font-medium text-gray-700'>
                    {startIndex}
                </span>
                {' - '}
                <span className='font-medium text-gray-700'>
                  {Math.min(endIndex,rows.length)}
                </span>
                {' of '}
                <span className='font-medium text-gray-700'>
                  {rows.length}
                </span>
            </p>

            <div className='flex items-center gap-1'>
              {/* Previous */}
             

              {/* Page Numbers */}
              <div className="flex items-center gap-1">

                {/* Previous */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-md border px-3 py-1.5 text-sm
                            hover:bg-gray-50
                            disabled:cursor-not-allowed
                            disabled:opacity-40"
                >
                  ←
                </button>

                {/* First page */}
                {startPage > 1 && (
                  <>
                    <button
                      onClick={() => goToPage(1)}
                      className="min-w-9 rounded-md border px-3 py-1.5 text-sm
                                text-gray-600 hover:bg-gray-50"
                    >
                      1
                    </button>

                    {startPage > 2 && (
                      <span className="px-2 text-gray-400">
                        ...
                      </span>
                    )}
                  </>
                )}

                {/* Visible pages */}
                {visiblePages.map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`min-w-9 rounded-md px-3 py-1.5 text-sm transition ${
                      currentPage === page
                        ? 'bg-gray-800 text-white'
                        : 'border text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Last page */}
                {endPage < totalPages && (
                  <>
                    {endPage < totalPages - 1 && (
                      <span className="px-2 text-gray-400">
                        ...
                      </span>
                    )}

                    <button
                      onClick={() => goToPage(totalPages)}
                      className="min-w-9 rounded-md border px-3 py-1.5 text-sm
                                text-gray-600 hover:bg-gray-50"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                {/* Next */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-md border px-3 py-1.5 text-sm
                            hover:bg-gray-50
                            disabled:cursor-not-allowed
                            disabled:opacity-40"
                >
                  →
                </button>

              </div>

              
            </div>
        </div>
    )}
    
    </div>

    
  );
}


