const fs = require('fs');

// ==== UPDATE Layout.tsx ====
let layout = fs.readFileSync('src/components/Layout.tsx', 'utf8');

layout = layout.replace("import { LayoutDashboard, FilePlus, LogOut, Users, FileText, Bell, Check, User } from 'lucide-react';", 
"import { LayoutDashboard, FilePlus, LogOut, Users, FileText, Bell, Check, User, MessageSquare, X } from 'lucide-react';");

layout = layout.replace("const [showNotifications, setShowNotifications] = useState(false);", 
`const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState<{ id: string; message: string; formId: string | null } | null>(null);
  const prevNotifsRef = useRef<any[]>([]);`);

const fetchStr = `  const fetchNotifications = async () => {
    try {
      const res = await fetch(\`\${API_BASE_URL}/api/notifications\`);
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
  };`;

layout = layout.replace(/  const fetchNotifications = async \(\) => \{[\s\S]*?\};\n/, fetchStr + '\n');

layout = layout.replace("const interval = setInterval(fetchNotifications, 30000);", "const interval = setInterval(fetchNotifications, 5000);");

layout = layout.replace("setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));",
`setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      prevNotifsRef.current = prevNotifsRef.current.map((n:any) => n.id === id ? { ...n, is_read: true } : n);
      if (toast?.id === id) setToast(null);`);

layout = layout.replace("setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));",
`setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      prevNotifsRef.current = prevNotifsRef.current.map((n:any) => ({ ...n, is_read: true }));
      setToast(null);`);

const toastHtml = `      {/* Pop-up Notification (Toast) */}
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
    </div>`;

layout = layout.replace(/    <\/div>\n  \);\n\}\n$/, toastHtml + "\n  );\n}\n");

fs.writeFileSync('src/components/Layout.tsx', layout);

// ==== UPDATE Dashboard.tsx ====
let dash = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

dash = dash.replace("const [searchQuery, setSearchQuery] = useState('');",
`const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Fetch notifications to check for unread chat
    fetch(\`\${API_BASE_URL}/api/notifications\`)
      .then(res => res.json())
      .then(setNotifications)
      .catch(console.error);
      
    const intv = setInterval(() => {
      fetch(\`\${API_BASE_URL}/api/notifications\`).then(res => res.json()).then(setNotifications).catch(console.error);
    }, 5000);
    return () => clearInterval(intv);
  }, []);`);

dash = dash.replace("import { \n  FileText, ", "import { \n  MessageCircle,\n  FileText, ");

dash = dash.replace(
  `<td className="px-6 py-4">\n                        <span className="text-sm font-mono font-bold text-slate-900">\n                          {form.document_no || 'N/A'}\n                        </span>\n                      </td>`,
  `<td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-mono font-bold text-slate-900">
                            {form.document_no || 'N/A'}
                          </span>
                          {notifications.some(n => !n.is_read && n.form_id === form.id && n.message.includes('New message')) && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full w-fit animate-pulse">
                              <MessageCircle className="w-3 h-3" /> New Chat
                            </span>
                          )}
                        </div>
                      </td>`
);

fs.writeFileSync('src/pages/Dashboard.tsx', dash);
console.log('done');
