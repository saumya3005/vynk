import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Download, Bookmark, MessageCircle } from 'lucide-react';
import { noteApi } from '../api/noteApi';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const NoteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [note, setNote] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  
  useEffect(() => {
    loadNote();
  }, [id]);

  const loadNote = async () => {
    try {
      const data = await noteApi.getNoteById(id);
      setNote(data);
    } catch (err) {
      toast.error('Failed to load note');
      navigate('/notes');
    }
  };

  const handleDownload = async () => {
    try {
      await noteApi.downloadNote(id);
      window.open(note.fileUrl, '_blank');
      loadNote();
    } catch (err) {
      toast.error('Failed to download');
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) return;
    try {
      await noteApi.reviewNote(id, { rating, text: reviewText });
      toast.success('Review added!');
      setReviewText('');
      loadNote();
    } catch (err) {
      toast.error('Failed to add review');
    }
  };

  if (!note) return <div className="min-h-screen pt-24 px-4 text-center">Loading...</div>;

  const averageRating = note.reviews?.length 
    ? (note.reviews.reduce((acc, curr) => acc + curr.rating, 0) / note.reviews.length).toFixed(1)
    : 5.0;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-24">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left: Preview Frame */}
        <div className="flex-1 glass-card overflow-hidden flex flex-col h-150">
          <div className="p-4 border-b border-border bg-surface shrink-0 flex items-center justify-between">
            <h2 className="font-bold text-lg">Document Preview</h2>
            <div className="flex items-center gap-2">
              <button onClick={handleDownload} className="btn-primary py-1.5 px-4 text-sm flex items-center gap-2">
                <Download size={16}/> Download
              </button>
            </div>
          </div>
          <div className="flex-1 bg-black/50">
            {note.fileType === 'application/pdf' ? (
              <iframe src={`${note.fileUrl}#toolbar=0`} className="w-full h-full border-none bg-white" title="PDF Preview"/>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted">
                <p>Preview not available for this file type.</p>
                <button onClick={handleDownload} className="mt-4 text-primary hover:underline">Download to view</button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Details & Reviews */}
        <div className="w-full lg:w-96 space-y-6">
          <div className="glass-card p-6">
            <h1 className="text-2xl font-bold mb-2">{note.title}</h1>
            <p className="text-muted text-sm mb-4">{note.subject} • {note.semester}</p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {note.tags?.map(tag => (
                <span key={tag} className="px-2 py-1 bg-surface border border-border rounded-md text-[10px] font-bold uppercase tracking-wider">{tag}</span>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm text-text/80 mb-6">
              <div className="flex items-center gap-1 text-yellow-500 font-bold"><Star size={16} className="fill-yellow-500"/> {averageRating}</div>
              <div className="flex items-center gap-1 font-bold"><Download size={16}/> {note.downloads}</div>
            </div>

            <p className="text-sm text-text/90 mb-6">{note.description}</p>
            
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <img src={note.uploader?.avatar || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-full object-cover"/>
              <div>
                <p className="text-xs text-muted font-bold uppercase">Uploaded By</p>
                <p className="font-bold">{note.uploader?.username}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MessageCircle size={18}/> Reviews</h3>
            
            {/* Add Review */}
            <div className="bg-surface rounded-xl p-4 mb-6 border border-border">
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    size={20} 
                    className={`cursor-pointer ${star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted'}`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
              <textarea 
                placeholder="Write a review..."
                className="w-full bg-transparent border-none focus:ring-0 text-sm p-0 mb-3 resize-none h-16"
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
              />
              <button onClick={handleSubmitReview} className="btn-primary py-1.5 px-4 text-sm font-bold w-full">Post Review</button>
            </div>

            {/* Reviews List */}
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {note.reviews?.length === 0 ? (
                <p className="text-sm text-muted italic">No reviews yet.</p>
              ) : (
                note.reviews?.map(rev => (
                  <div key={rev._id} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{rev.user?.username}</span>
                        <span className="text-xs text-muted">{formatDistanceToNow(new Date(rev.createdAt), { addSuffix: true })}</span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500"><Star size={12} className="fill-yellow-500"/> <span className="text-xs font-bold">{rev.rating}</span></div>
                    </div>
                    <p className="text-sm text-text/80">{rev.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NoteDetails;
