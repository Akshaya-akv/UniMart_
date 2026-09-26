import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Search, FileText, Upload, ArrowUp, Download, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Note = {
  id: string;
  title: string;
  description: string;
  course_code: string;
  department: string;
  semester: string;
  file_url: string;
  file_type: string;
  upvotes: number;
  downloads: number;
  created_at: string;
  profiles?: { name: string };
};

export default function Notes() {
  const { session } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_code: '',
    department: 'CSE',
    semester: 'S1',
    file_url: '',
    file_type: 'pdf'
  });

  useEffect(() => {
    fetchNotes();
  }, [query]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      let queryBuilder = supabase
        .from('notes')
        .select(`*, profiles(name)`)
        .order('upvotes', { ascending: false });

      if (query) {
        queryBuilder = queryBuilder.ilike('title', `%${query}%`);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      setNotes(data as Note[] || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user.id) {
      toast.error('You must be logged in to upload notes');
      return;
    }

    setUploading(true);
    try {
      const { error } = await supabase.from('notes').insert([{
        user_id: session.user.id,
        ...formData
      }]);

      if (error) throw error;
      
      toast.success('Notes shared with campus!');
      setIsUploadOpen(false);
      fetchNotes();
      setFormData({
        title: '', description: '', course_code: '', department: 'CSE', semester: 'S1', file_url: '', file_type: 'pdf'
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload notes');
    } finally {
      setUploading(false);
    }
  };

  const handleUpvote = async (noteId: string, currentUpvotes: number) => {
    if (!session?.user.id) return toast.error('Login to upvote');
    const { error } = await supabase.from('notes').update({ upvotes: currentUpvotes + 1 }).eq('id', noteId);
    if (!error) {
      setNotes(notes.map(n => n.id === noteId ? { ...n, upvotes: currentUpvotes + 1 } : n));
      toast.success('Upvoted!');
    }
  };

  const handleDownload = async (noteId: string, currentDownloads: number, url: string) => {
    window.open(url, '_blank');
    const { error } = await supabase.from('notes').update({ downloads: currentDownloads + 1 }).eq('id', noteId);
    if (!error) {
      setNotes(notes.map(n => n.id === noteId ? { ...n, downloads: currentDownloads + 1 } : n));
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header & Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md luxury-inset-sm text-zinc-400">
              Open Academic Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Academic Notes & Exams</h1>
          <p className="text-xs text-zinc-400 mt-1 tracking-tight">Verified course summaries, question banks, and lab guides shared by top campus peers.</p>
        </div>
        
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <button className="luxury-btn-white px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 shrink-0">
              <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Share Notes</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-[#0a0a0d] border border-white/10 shadow-2xl rounded-2xl p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-white tracking-tight">Share Academic Notes</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4 mt-2">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Subject / Document Title</label>
                <input 
                  required 
                  placeholder="e.g. DBMS Module 1-3 Comprehensive Notes"
                  className="w-full luxury-inset-sm rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/[0.3]"
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Course Code</label>
                  <input 
                    required 
                    placeholder="CS201"
                    className="w-full luxury-inset-sm rounded-xl px-3 py-2 text-xs font-mono uppercase text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/[0.3]"
                    value={formData.course_code} 
                    onChange={e => setFormData({...formData, course_code: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Dept</label>
                  <select 
                    className="w-full luxury-inset-sm rounded-xl px-2.5 py-2 text-xs text-white bg-[#050507] focus:outline-none"
                    value={formData.department} 
                    onChange={e => setFormData({...formData, department: e.target.value})}
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="ME">ME</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="GEN">GENERAL</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Semester</label>
                  <select 
                    className="w-full luxury-inset-sm rounded-xl px-2.5 py-2 text-xs text-white bg-[#050507] focus:outline-none"
                    value={formData.semester} 
                    onChange={e => setFormData({...formData, semester: e.target.value})}
                  >
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                    <option value="S4">S4</option>
                    <option value="S5">S5</option>
                    <option value="S6">S6</option>
                    <option value="S7">S7</option>
                    <option value="S8">S8</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Document Link (Drive, Notion, PDF)</label>
                <input 
                  required 
                  placeholder="https://drive.google.com/..." 
                  type="url"
                  className="w-full luxury-inset-sm rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/[0.3]"
                  value={formData.file_url} 
                  onChange={e => setFormData({...formData, file_url: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                className="w-full luxury-btn-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 mt-4" 
                disabled={uploading}
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Upload className="w-4 h-4 stroke-[2.5]" />}
                <span>Publish for Campus</span>
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clean Luxury Search Bar */}
      <div className="relative flex items-center w-full bg-[#0a0a0d] border border-white/[0.1] hover:border-white/[0.18] rounded-2xl px-4 py-3 focus-within:border-white/[0.3] focus-within:ring-1 focus-within:ring-white/20 transition-all">
        <Search className="h-4 w-4 text-zinc-500 shrink-0 mr-3" />
        <input 
          placeholder="Search course code (e.g. CS201), topic, or professor notes..." 
          className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none tracking-tight"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-7 h-7 animate-spin text-white" />
        </div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(note => (
            <div 
              key={note.id} 
              className="luxury-surface-interactive rounded-2xl p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl luxury-inset-sm flex items-center justify-center text-zinc-300 shrink-0">
                    <FileText className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <span className="luxury-pill font-semibold px-2 py-0.5 rounded text-white tracking-wider">
                      {note.course_code}
                    </span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-zinc-400 font-medium">{note.department}</span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-zinc-400 font-medium">{note.semester}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-white text-base leading-snug line-clamp-2 tracking-tight">
                    {note.title}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Uploaded by <span className="text-zinc-300 font-medium">{note.profiles?.name || 'Student'}</span>
                  </p>
                </div>
              </div>

              {/* Bottom Actions: Upvote & Download */}
              <div className="pt-3 border-t border-white/[0.08] flex items-center gap-2">
                <button 
                  onClick={() => handleUpvote(note.id, note.upvotes)}
                  className="luxury-pill px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 active:scale-95 transition-all tabular-nums"
                  title="Upvote note"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>{note.upvotes || 0}</span>
                </button>

                <button 
                  onClick={() => handleDownload(note.id, note.downloads, note.file_url)}
                  className="luxury-btn-ghost flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-white hover:text-black hover:border-white transition-all tabular-nums"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Get Material ({note.downloads || 0})</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 rounded-3xl luxury-surface">
          <div className="w-12 h-12 rounded-2xl luxury-inset-sm flex items-center justify-center mx-auto mb-3 text-zinc-500">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-base font-semibold text-white mb-1">No notes found</p>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-5">
            Be the first student to upload exam notes or study material for this course!
          </p>
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="luxury-btn-white px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>Upload Notes</span>
          </button>
        </div>
      )}

    </div>
  );
}
