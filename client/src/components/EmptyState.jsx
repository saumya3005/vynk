import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({ 
  icon: Icon = Sparkles, 
  title = "It's a little empty here", 
  description = "Get started by creating something amazing.", 
  actionText = "Create Now", 
  actionLink = "#" 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full flex flex-col items-center justify-center p-12 text-center"
    >
      <div className="w-24 h-24 mb-6 rounded-full bg-linear-to-tr from-mint/30 to-lavender/30 flex items-center justify-center relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-charcoal/10"
        ></motion.div>
        <Icon size={40} className="text-charcoal/40" />
      </div>
      
      <h3 className="text-2xl font-bold text-charcoal mb-2">{title}</h3>
      <p className="text-charcoal/60 mb-8 max-w-md">{description}</p>
      
      {actionLink !== "#" && (
        <Link to={actionLink} className="btn-primary">
          {actionText}
        </Link>
      )}
    </motion.div>
  );
};

export default EmptyState;
