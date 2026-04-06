import { motion } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import { Briefcase, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/app/utils/api';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function FindClients() {
  const { isDarkMode } = useTheme();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/invitations');
      if (res.data.success) {
        setInvitations(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await api.put(`/invitations/${id}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Invitation ${newStatus}`);
        fetchInvitations();
      }
    } catch (err) {
      toast.error('Failed to update invitation');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
          Find Clients
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
          View invitations and client requests
        </p>
      </motion.div>

      {/* Invitations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {loading ? (
           <div className={`p-6 ${isDarkMode ? 'text-white' : 'text-black'}`}>Loading invitations...</div>
        ) : invitations.length > 0 ? (
          invitations.map((invite, index) => {
            const clientImage = invite.client_id?.profile_image ? (invite.client_id.profile_image.startsWith('http') ? invite.client_id.profile_image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${invite.client_id.profile_image}`) : 'https://via.placeholder.com/150';

            return (
              <motion.div
                key={invite._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl border backdrop-blur-sm ${
                  isDarkMode
                    ? 'bg-neutral-900/50 border-neutral-800'
                    : 'bg-white/50 border-neutral-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={clientImage}
                      alt={invite.client_id?.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {invite.client_id?.full_name}
                      </h3>
                      <p className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                         Client Request • {format(new Date(invite.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    invite.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    invite.status === 'declined' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {invite.status.toUpperCase()}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2 text-sm">
                     <Briefcase className={`w-4 h-4 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`} />
                     <span className={`font-medium ${isDarkMode ? 'text-neutral-200' : 'text-neutral-700'}`}>
                       Project: {invite.project_id ? (
                         <Link to={`/dashboard/projects/${invite.project_id._id}`} className="text-[#F24C20] hover:underline">
                           {invite.project_id.title}
                         </Link>
                       ) : 'General Collaboration'}
                     </span>
                  </div>
                  <p className={`text-sm line-clamp-3 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    {invite.message || 'I would like to invite you to collaborate with me!'}
                  </p>
                </div>

                {invite.status === 'pending' && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleUpdateStatus(invite._id, 'accepted')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-colors border ${
                        isDarkMode 
                          ? 'border-green-500/30 text-green-400 hover:bg-green-500/10' 
                          : 'border-green-200 text-green-700 hover:bg-green-50'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" /> Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(invite._id, 'declined')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-colors border ${
                        isDarkMode 
                          ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' 
                          : 'border-red-200 text-red-700 hover:bg-red-50'
                      }`}
                    >
                      <XCircle className="w-4 h-4" /> Decline
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })
        ) : (
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className={`col-span-full py-16 text-center rounded-2xl border border-dashed ${
               isDarkMode ? 'border-neutral-800 bg-neutral-900/40' : 'border-neutral-200 bg-neutral-50/50'
             }`}
          >
             <Briefcase className={`w-16 h-16 mx-auto mb-4 opacity-50 ${isDarkMode ? 'text-neutral-600' : 'text-neutral-400'}`} />
             <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
               No Invitations Yet
             </h3>
             <p className={`max-w-md mx-auto ${isDarkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
               When clients want to hire you directly or invite you to their projects, those requests will appear here.
             </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
