import { API_BASE_URL } from '../lib/api';
import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FilePlus, LogOut, Users, FileText, Bell, Check, User, MessageSquare, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState<{ id: string; message: string; formId: string | null } | null>(null);
  const prevNotifsRef = useRef<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      'user': 'User',
      'admin': 'Administrator',
      'hod': 'Department Head',
      'hse': 'Health, Safety & Environment',
      'factory_manager': 'Factory Manager',
      'engineering_manager': 'Project & Engineering Manager'
    };
    return roleLabels[role] || role;
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`);
      if (res.ok) {
        const data = await res.json();
        
        if (prevNotifsRef.current.length > 0 && data.length > 0) {
          const prevIds = new Set(prevNotifsRef.current.map((n: any) => n.id));
          const newUnread = data.filter((n: any) => !n.is_read && !prevIds.has(n.id));
          
          if (newUnread.length > 0) {
            const latest = newUnread[0];
            setToast({ id: latest.id, message: latest.message, formId: latest.form_id });
            setTimeout(() => setToast(prev => prev?.id === latest.id ? null : prev), 5000);
          }
        }
        
        prevNotifsRef.current = data;
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markAsRead = async (id: string, formId: string | null, message: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      prevNotifsRef.current = prevNotifsRef.current.map((n:any) => n.id === id ? { ...n, is_read: true } : n);
      if (toast?.id === id) setToast(null);
      setShowNotifications(false);
      
      // Check if this is a registration notification
      if (!formId && message.includes('registration')) {
        navigate('/admin');
      } else if (formId) {
        navigate(`/request/${formId}`);
      }
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/read-all`, { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      prevNotifsRef.current = prevNotifsRef.current.map((n:any) => ({ ...n, is_read: true }));
      setToast(null);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const handleLogout = async () => {
    await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST' });
    setUser(null);
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Create Request', path: '/create-request', icon: FilePlus },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: Users });
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen flex-shrink-0 z-40">
        <div className="h-20 flex flex-col justify-center px-6 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-blue-600 mr-2" />
            <span className="font-bold text-lg text-gray-900">PEAF System</span>
          </div>
          <p className="text-[10px] font-semibold text-gray-500 ml-8 -mt-0.5 uppercase tracking-wider">PT Indofood Fortuna Makmur</p>
        </div>
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold mr-3">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{getRoleLabel(user?.role || '')}</p>
            </div>
          </div>
          <Link
            to="/profile"
            className={`flex items-center w-full px-4 py-2 mb-2 text-sm font-medium rounded-lg transition-colors ${
              location.pathname === '/profile'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <User className={`w-5 h-5 mr-3 ${location.pathname === '/profile' ? 'text-blue-700' : 'text-gray-400'}`} />
            My Profile
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30">
          <h1 className="text-xl font-semibold text-gray-900">
            {navItems.find(item => item.path === location.pathname)?.name || 'PEAF System'}
          </h1>
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none transition-transform active:scale-95"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl bg-white shadow-2xl shadow-blue-900/10 border border-slate-100 focus:outline-none z-50 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                    >
                      <Check className="w-3 h-3 mr-1" /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                      <Bell className="w-8 h-8 text-slate-200 mb-3" />
                      <p className="text-sm font-bold text-slate-400">No notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => markAsRead(notification.id, notification.form_id, notification.message)}
                          className={`p-4 cursor-pointer hover:bg-slate-50 transition-all ${!notification.is_read ? 'bg-blue-50/50' : ''}`}
                        >
                          <div className="flex gap-3">
                            {!notification.is_read && (
                              <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                            )}
                            <div>
                              <p className={`text-sm ${!notification.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>
                                {notification.message}
                              </p>
                              <p className="text-xs font-medium text-slate-400 mt-1.5">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Pop-up Notification (Toast) */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div 
            onClick={() => markAsRead(toast.id, toast.formId, toast.message)}
            className="bg-white border border-slate-200 shadow-2xl shadow-blue-900/20 rounded-2xl p-4 pr-12 flex items-start gap-4 max-w-sm cursor-pointer hover:bg-slate-50 transition-colors relative"
          >
            <div className="bg-blue-100 p-2 rounded-full flex-shrink-0 mt-1">
              {toast.message.includes('New message') ? <MessageSquare className="w-5 h-5 text-blue-600" /> : <Bell className="w-5 h-5 text-blue-600" />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">{toast.message.includes('New message') ? 'New Chat Message' : 'New Notification'}</h4>
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">{toast.message}</p>
              <span className="text-[10px] font-bold text-blue-600 uppercase mt-2 block">Click to view</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setToast(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
