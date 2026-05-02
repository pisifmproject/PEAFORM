import fs from 'fs';
let content = fs.readFileSync('src/pages/RequestDetail.tsx', 'utf8');

// 1. Add imports
content = content.replace("  Download\r\n} from 'lucide-react';", "  Download,\r\n  MessageSquare,\r\n  Send\r\n} from 'lucide-react';");
content = content.replace("  Download\n} from 'lucide-react';", "  Download,\n  MessageSquare,\n  Send\n} from 'lucide-react';");

// 2. Add state
content = content.replace(
  "  const [submitting, setSubmitting] = useState(false);",
  "  const [submitting, setSubmitting] = useState(false);\n\n  // QnA state\n  const [qnaMessage, setQnaMessage] = useState('');\n  const [sendingQna, setSendingQna] = useState(false);"
);

// 3. Add handleSendQna
const handleSendStr = `
  const handleSendQna = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qnaMessage.trim()) return;

    setSendingQna(true);
    try {
      const res = await fetch(\`\${API_BASE_URL}/api/forms/\${id}/qna\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: qnaMessage })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to send message');
      }

      const updatedRes = await fetch(\`\${API_BASE_URL}/api/forms/\${id}\`);
      const updatedData = await updatedRes.json();
      setData(updatedData);
      setQnaMessage('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSendingQna(false);
    }
  };
`;
content = content.replace(
  "  const handleApprove = async (e: React.FormEvent) => {",
  handleSendStr + "\n  const handleApprove = async (e: React.FormEvent) => {"
);

// 4. Update data destructuring
content = content.replace(
  "  const { form, approvals } = data;",
  "  const { form, approvals, qna = [] } = data;"
);

// 5. Add canViewQnA
const canViewStr = `
  const canViewQnA = () => {
    if (!user) return false;
    if (user.role === 'admin' || user.id === form.applicant_id) return true;
    if (approvals.some((a: any) => a.approver_id === user.id)) return true;
    if (form.status === 'pending_hse' && user.role === 'hse') return true;
    if (form.status === 'pending_engineering_manager' && user.role === 'engineering_manager') return true;
    if (form.status === 'pending_hod' && user.role === 'hod') return true;
    if (form.status === 'pending_factory_manager' && user.role === 'factory_manager') return true;
    if (form.status === 'approved') return true;
    return false;
  };
`;
content = content.replace(
  "  const canApprove = checkCanApprove();",
  "  const canApprove = checkCanApprove();\n" + canViewStr
);

// 6. Add QnA UI
const qnaUIStr = `
            {/* QnA SECTION */}
            {canViewQnA() && (
              <motion.section variants={sectionVariants} className="pt-12 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-50 p-2 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Discussion & QnA</h2>
                </div>
                
                <div className="bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden flex flex-col">
                  {/* Chat Messages */}
                  <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
                    {qna.length > 0 ? qna.map((msg: any) => {
                      const isMe = msg.sender_id === user?.id;
                      return (
                        <div key={msg.id} className={\`flex flex-col \${isMe ? 'items-end' : 'items-start'}\`}>
                          <div className={\`max-w-[80%] rounded-2xl p-4 \${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'}\`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={\`text-xs font-bold \${isMe ? 'text-blue-200' : 'text-slate-500'}\`}>{\${isMe ? "'You'" : "msg.sender_name"}}</span>
                              <span className={\`text-[10px] \${isMe ? 'text-blue-300' : 'text-slate-400'}\`}>• {msg.sender_role?.replace('_', ' ')}</span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          </div>
                          <span className="text-[10px] font-medium text-slate-400 mt-1 mx-1">
                            {format(parseDateLocal(msg.created_at), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                      )
                    }) : (
                      <div className="text-center py-8">
                        <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 font-medium">No messages yet. Start a conversation!</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Chat Input */}
                  <div className="p-4 bg-white border-t border-slate-100">
                    <form onSubmit={handleSendQna} className="flex gap-3">
                      <input 
                        type="text"
                        value={qnaMessage}
                        onChange={e => setQnaMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm"
                      />
                      <button 
                        type="submit"
                        disabled={sendingQna || !qnaMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-bold shadow-md shadow-blue-200 transition-all flex items-center gap-2 active:scale-95"
                      >
                        {sendingQna ? '...' : <Send className="w-4 h-4" />}
                      </button>
                    </form>
                  </div>
                </div>
              </motion.section>
            )}

`;

content = content.replace(
  "{/* Generic Approval Form (Fallback) */}",
  qnaUIStr + "            {/* Generic Approval Form (Fallback) */}"
);

fs.writeFileSync('src/pages/RequestDetail.tsx', content);
console.log('done');
