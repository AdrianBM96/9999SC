import React, { useState } from 'react';
import { LinkedInProfile, DetailedLinkedInProfile } from '../../types';
import { Briefcase, MapPin, GraduationCap, Languages, Users, ExternalLink, Award, Book, ChevronDown, ChevronUp } from 'lucide-react';
import { getDetailedLinkedInProfile } from '../../api';

interface ProfileCardProps {
  profile: LinkedInProfile;
  onSave: () => void;
  saved: boolean;
}

export function ProfileCard({ profile, onSave, saved }: ProfileCardProps) {
  const [detailedProfile, setDetailedProfile] = useState<DetailedLinkedInProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchDetailedProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const publicIdentifier = profile.public_profile_url.split('/in/')[1] || profile.profile_url.split('/in/')[1];
      if (!publicIdentifier) {
        throw new Error('Unable to extract public identifier from profile URL');
      }
      const detailed = await getDetailedLinkedInProfile(publicIdentifier);
      setDetailedProfile(detailed);
    } catch (err) {
      console.error('Error fetching detailed profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch detailed profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && !detailedProfile) {
      fetchDetailedProfile();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out">
      <div className="p-4 cursor-pointer" onClick={toggleExpand}>
        <div className="flex items-center space-x-4">
          <img src={profile.profile_picture_url || 'https://via.placeholder.com/100'} alt={profile.name} className="w-16 h-16 rounded-full" />
          <div className="flex-grow">
            <h2 className="text-xl font-semibold text-gray-800">{profile.name}</h2>
            <p className="text-gray-600 text-sm">{profile.headline}</p>
          </div>
          {isExpanded ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-gray-600">
              <MapPin size={16} className="mr-2" />
              <span>{profile.location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Briefcase size={16} className="mr-2" />
              <span>{profile.current_position || 'N/A'} {profile.current_company ? `at ${profile.current_company}` : ''}</span>
            </div>
            {profile.education && profile.education.length > 0 && (
              <div className="flex items-center text-gray-600">
                <GraduationCap size={16} className="mr-2" />
                <span>
                  {profile.education[0].degree || 'Degree'} 
                  {profile.education[0].field_of_study ? ` in ${profile.education[0].field_of_study}` : ''} 
                  {profile.education[0].school ? ` from ${profile.education[0].school}` : ''}
                </span>
              </div>
            )}
            {profile.languages && profile.languages.length > 0 && (
              <div className="flex items-center text-gray-600">
                <Languages size={16} className="mr-2" />
                <span>{profile.languages.join(', ')}</span>
              </div>
            )}
            {profile.connections !== undefined && (
              <div className="flex items-center text-gray-600">
                <Users size={16} className="mr-2" />
                <span>{profile.connections} connections</span>
              </div>
            )}
          </div>

          {profile.skills && profile.skills.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Top Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.slice(0, 5).map((skill, index) => (
                  <span key={index} className="bg-gray-200 px-2 py-1 rounded-full text-sm">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {profile.experience && profile.experience.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Experience</h3>
              <ul className="space-y-2">
                {profile.experience.slice(0, 2).map((exp, index) => (
                  <li key={index} className="text-sm">
                    <div className="font-medium">{exp.title} at {exp.company}</div>
                    <div className="text-gray-600">{exp.start_date} - {exp.end_date || 'Present'}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {detailedProfile && (
            <div className="space-y-4">
              <h3 className="font-semibold">Detailed Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p><strong>Follower Count:</strong> {detailedProfile.follower_count}</p>
                <p><strong>Connections Count:</strong> {detailedProfile.connections_count}</p>
                <p><strong>Network Distance:</strong> {detailedProfile.network_distance}</p>
                <p><strong>Is Premium:</strong> {detailedProfile.is_premium ? 'Yes' : 'No'}</p>
                <p><strong>Is Influencer:</strong> {detailedProfile.is_influencer ? 'Yes' : 'No'}</p>
                <p><strong>Is Creator:</strong> {detailedProfile.is_creator ? 'Yes' : 'No'}</p>
              </div>

              {detailedProfile.websites && detailedProfile.websites.length > 0 && (
                <div>
                  <h4 className="font-semibold">Websites:</h4>
                  <ul className="list-disc list-inside">
                    {detailedProfile.websites.map((website, index) => (
                      <li key={index}>
                        <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {website} <ExternalLink size={12} className="inline" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {detailedProfile.certifications && detailedProfile.certifications.length > 0 && (
                <div>
                  <h4 className="font-semibold flex items-center"><Award size={16} className="mr-2" /> Certifications:</h4>
                  <ul className="list-disc list-inside">
                    {detailedProfile.certifications.map((cert, index) => (
                      <li key={index}>
                        {typeof cert === 'string' ? cert : cert.name}
                        {cert.organization && ` - ${cert.organization}`}
                        {cert.url && (
                          <a href={cert.url} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-500 hover:underline">
                            <ExternalLink size={12} className="inline" />
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {detailedProfile.summary && (
                <div>
                  <h4 className="font-semibold flex items-center"><Book size={16} className="mr-2" /> Summary:</h4>
                  <p className="text-sm mt-1">{detailedProfile.summary}</p>
                </div>
              )}

              {detailedProfile.hashtags && detailedProfile.hashtags.length > 0 && (
                <div>
                  <h4 className="font-semibold">Hashtags:</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {detailedProfile.hashtags.map((tag, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <a
              href={profile.public_profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              View Full Profile
            </a>
            <button
              onClick={onSave}
              disabled={saved}
              className={`inline-block px-4 py-2 ${saved ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
            >
              {saved ? 'Saved' : 'Save Candidate'}
            </button>
          </div>

          {error && <p className="mt-2 text-red-500">{error}</p>}
          {loading && <p className="mt-2 text-gray-600">Loading detailed information...</p>}
        </div>
      )}
    </div>
  );
}