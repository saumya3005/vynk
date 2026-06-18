import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Link as LinkIcon, Globe, UserPlus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const isOwnProfile = !id || user?.id === id || user?._id === id;

  const profileData = {
    username: isOwnProfile ? user?.username || 'Vynk User' : 'TechEnthusiast',
    role: isOwnProfile ? user?.role || 'Student' : 'Developer',
    bio: 'Passionate about building scalable web apps and learning new tech. Open to collaborations!',
    location: 'Prayagraj, India',
    github: 'github.com/saumya3005',
    portfolio: 'vynk.dev',
    skills: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS'],
    stats: { followers: 1240, following: 350, projects: 5 },
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="h-48 md:h-64 w-full bg-linear-to-r from-vynk-lavender via-vynk-lilac to-vynk-peach relative"></div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 relative -mt-16 md:-mt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between mb-6">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden shrink-0">
                <div className="w-full h-full bg-linear-to-tr from-vynk-coral to-vynk-peach"></div>
              </div>

              <div className="pb-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-vynk-charcoal">
                  {profileData.username}
                </h1>
                <p className="text-vynk-coral font-medium">{profileData.role}</p>
              </div>
            </div>

            <div className="pb-2">
              {isOwnProfile ? (
                <button className="btn-secondary whitespace-nowrap">Edit Profile</button>
              ) : (
                <button className="btn-primary flex items-center gap-2 whitespace-nowrap">
                  <UserPlus size={18} /> Follow
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="font-bold mb-2">About</h3>
                <p className="text-vynk-charcoal/80 leading-relaxed">
                  {profileData.bio}
                </p>
              </div>

              <div>
                <h3 className="font-bold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-white/60 border border-white rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-white/40 rounded-xl border border-white">
                <div className="text-center flex-1">
                  <p className="font-bold text-xl">{profileData.stats.followers}</p>
                  <p className="text-xs text-vynk-charcoal/60 uppercase tracking-wide">
                    Followers
                  </p>
                </div>

                <div className="w-px bg-vynk-charcoal/10"></div>

                <div className="text-center flex-1">
                  <p className="font-bold text-xl">{profileData.stats.following}</p>
                  <p className="text-xs text-vynk-charcoal/60 uppercase tracking-wide">
                    Following
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-vynk-charcoal/10">
                <div className="flex items-center gap-3 text-vynk-charcoal/70 text-sm">
                  <MapPin size={16} /> {profileData.location}
                </div>

                <div className="flex items-center gap-3 text-vynk-charcoal/70 text-sm">
                  <Globe size={16} />
                  <a href="#" className="hover:text-vynk-coral">
                    {profileData.github}
                  </a>
                </div>

                <div className="flex items-center gap-3 text-vynk-charcoal/70 text-sm">
                  <LinkIcon size={16} />
                  <a href="#" className="hover:text-vynk-coral">
                    {profileData.portfolio}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
          <div className="flex gap-8 border-b border-vynk-charcoal/10 pb-4 px-4">
            <button className="font-semibold text-vynk-coral border-b-2 border-vynk-coral pb-4 -mb-4">
              Posts
            </button>

            <button className="font-medium text-vynk-charcoal/60 hover:text-vynk-charcoal">
              Projects
              <span className="ml-1 bg-vynk-charcoal/10 px-2 py-0.5 rounded-full text-xs">
                {profileData.stats.projects}
              </span>
            </button>

            <button className="font-medium text-vynk-charcoal/60 hover:text-vynk-charcoal">
              Notes
            </button>
          </div>

          <div className="py-8 flex flex-col items-center justify-center text-vynk-charcoal/50">
            <p>No recent posts to show.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;