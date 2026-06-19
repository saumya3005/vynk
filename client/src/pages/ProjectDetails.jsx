import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProjectDetails = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen pt-24 px-4 flex flex-col items-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 max-w-4xl w-full">
        <h1 className="text-3xl font-bold mb-4">Project Details</h1>
        <p className="text-charcoal/60">Viewing details for project ID: {id}</p>
        {/* Placeholder for fully designed details page, meeting minimal requirements for now */}
      </motion.div>
    </div>
  );
};

export default ProjectDetails;
