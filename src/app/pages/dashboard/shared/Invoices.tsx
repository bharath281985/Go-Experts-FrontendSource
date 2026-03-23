import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import { FileText, Download, Eye, Loader2, Search, Filter } from 'lucide-react';
import api from '@/app/utils/api';
import { format } from 'date-fns';

interface Invoice {
  _id: string;
  invoice_number: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'void';
  created_at: string;
}

export default function Invoices() {
  const { isDarkMode } = useTheme();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/users/my-invoices');
      if (res.data.success) {
        setInvoices(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#F24C20] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            Invoices
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            View and download your billing history
          </p>
        </div>
      </motion.div>

      <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-100 bg-neutral-50'}`}>
                <th className="px-6 py-4 text-sm font-semibold">Invoice #</th>
                <th className="px-6 py-4 text-sm font-semibold">Date</th>
                <th className="px-6 py-4 text-sm font-semibold">Amount</th>
                <th className="px-6 py-4 text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {invoices.length > 0 ? (
                invoices.map((invoice, i) => (
                  <motion.tr
                    key={invoice._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`transition-colors ${isDarkMode ? 'hover:bg-neutral-800/50' : 'hover:bg-neutral-50'}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                          <FileText className="w-4 h-4 text-[#F24C20]" />
                        </div>
                        <span className="font-medium">{invoice.invoice_number}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      {format(new Date(invoice.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#F24C20]">
                      ₹{invoice.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${invoice.status === 'paid'
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                          : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                        }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className={`p-2 rounded-lg transition-all ${isDarkMode ? 'hover:bg-neutral-700 text-neutral-400' : 'hover:bg-neutral-200 text-neutral-500'}`}>
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className={`p-2 rounded-lg transition-all ${isDarkMode ? 'hover:bg-neutral-700 text-neutral-400' : 'hover:bg-neutral-200 text-neutral-500'}`}>
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    No invoices found in your account history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
