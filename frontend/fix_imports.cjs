const fs = require('fs');
let content = fs.readFileSync('src/pages/RequestDetail.tsx', 'utf8');

// Find the index of "export default function RequestDetail() {"
const exportIndex = content.indexOf('export default function RequestDetail() {');

// The correct import string we want at the top of the file:
const correctImports = `import { API_BASE_URL } from '../lib/api';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowLeft, 
  FileText, 
  User, 
  Briefcase, 
  MapPin, 
  Calendar,
  Settings,
  ShieldCheck,
  FileCheck,
  History,
  AlertCircle,
  ChevronRight,
  Info,
  Download,
  MessageSquare,
  Send
} from 'lucide-react';

`;

// Replace everything before export default with correct imports
const newContent = correctImports + content.substring(exportIndex);

fs.writeFileSync('src/pages/RequestDetail.tsx', newContent);
console.log('Fixed imports in RequestDetail.tsx');
