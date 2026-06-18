import { useParams } from 'react-router-dom';
const CommunityDetails = () => {
  const { id } = useParams();
  return (
    <div className="min-h-screen pt-24 px-4 text-center">
      <div className="glass-card p-12 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Community Details</h1>
        <p>Viewing community ID: {id}</p>
      </div>
    </div>
  );
};
export default CommunityDetails;
