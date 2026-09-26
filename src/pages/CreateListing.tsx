import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CATEGORIES } from '@/lib/mockData';
import { Loader2, PlusCircle, ArrowLeft } from 'lucide-react';
import type { ListingType } from '@/types/database.types';

export default function CreateListing() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'sell' as ListingType,
    category_id: CATEGORIES[0],
    price: '',
    condition: 'Good',
    course_code: '',
    image_url: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user.id) {
      toast.error('You must be logged in to create a listing');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('listings')
        .insert([{
          user_id: session.user.id,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          category_id: formData.category_id,
          price: formData.type === 'free' ? 0 : Number(formData.price) || 0,
          condition: formData.condition,
          course_code: formData.course_code,
          image_url: formData.image_url || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80',
          status: 'active'
        }]);

      if (error) throw error;
      
      toast.success('Listing created successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create listing');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      
      {/* Top Navigation & Title */}
      <div>
        <button 
          onClick={() => navigate(-1)} 
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Publish Listing</h1>
        <p className="text-xs text-zinc-400 mt-1 tracking-tight">List gear, books, lab kits, or dorm accessories for verified campus mates.</p>
      </div>

      {/* Main Luxury Form Chassis */}
      <div className="luxury-surface rounded-3xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Listing Mode Switcher */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-widest block mb-2 font-mono">
              Listing Mode
            </label>
            <div className="luxury-inset-sm p-1.5 rounded-2xl grid grid-cols-3 gap-1.5">
              {(['sell', 'lend', 'free'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type }))}
                  className={`py-2 rounded-xl text-xs font-semibold capitalize transition-all duration-150 ${
                    formData.type === type 
                      ? 'bg-white text-black shadow-sm' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {type === 'lend' ? 'Borrow / Lend' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-widest block mb-1.5 font-mono">
              Item Title
            </label>
            <input 
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Database System Concepts 7th Ed. (Silberschatz)" 
              className="w-full luxury-inset-sm rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/[0.3] tracking-tight"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-widest block mb-1.5 font-mono">
              Item Description
            </label>
            <textarea 
              required
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detail the condition, included parts, edition year, meetup preferences..."
              rows={3}
              className="w-full luxury-inset-sm rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/[0.3] resize-none tracking-tight"
            />
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formData.type !== 'free' && (
              <div>
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-widest block mb-1.5 font-mono">
                  {formData.type === 'lend' ? 'Refundable Deposit (₹)' : 'Price (₹)'}
                </label>
                <input 
                  required
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 450" 
                  className="w-full luxury-inset-sm rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/[0.3] font-mono tabular-nums"
                />
              </div>
            )}
            
            <div className={formData.type === 'free' ? 'sm:col-span-2' : ''}>
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-widest block mb-1.5 font-mono">
                Category
              </label>
              <select 
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full luxury-inset-sm rounded-xl px-3.5 py-2.5 text-sm text-white bg-[#050507] focus:outline-none focus:border-white/[0.3]"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition & Course Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-widest block mb-1.5 font-mono">
                Condition
              </label>
              <select 
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full luxury-inset-sm rounded-xl px-3.5 py-2.5 text-sm text-white bg-[#050507] focus:outline-none focus:border-white/[0.3]"
              >
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Brand New">Brand New</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-widest block mb-1.5 font-mono">
                Course Code (Optional)
              </label>
              <input 
                name="course_code"
                value={formData.course_code}
                onChange={handleChange}
                placeholder="e.g. CS201 / MATH101" 
                className="w-full luxury-inset-sm rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/[0.3] font-mono uppercase"
              />
            </div>
          </div>

          {/* Photo URL */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-widest block mb-1.5 font-mono">
              Photo URL
            </label>
            <input 
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..." 
              className="w-full luxury-inset-sm rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/[0.3]"
            />
            <p className="text-[11px] text-zinc-500 mt-1">Provide a direct photo URL or leave empty for a clean campus category banner.</p>
          </div>

          {/* Submit Action */}
          <button 
            type="submit" 
            className="w-full luxury-btn-white py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 mt-4" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Publishing to Campus...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span>Post Listing to UniMart</span>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
