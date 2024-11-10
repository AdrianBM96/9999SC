import React from 'react';
import { Code, Heart } from 'lucide-react';
import { DetailedLinkedInProfile } from '../../../../types';

interface SkillsTabProps {
  candidate: DetailedLinkedInProfile;
}

const HARD_SKILLS_KEYWORDS = [
  'programming', 'development', 'software', 'java', 'python', 'javascript',
  'react', 'angular', 'vue', 'node', 'aws', 'azure', 'docker', 'kubernetes',
  'sql', 'database', 'api', 'rest', 'graphql', 'git', 'devops', 'ci/cd',
  'testing', 'automation', 'analytics', 'data', 'machine learning', 'ai'
];

export function SkillsTab({ candidate }: SkillsTabProps) {
  const categorizeSkills = (skills: (string | { name: string })[]): { hard: string[], soft: string[] } => {
    const result = { hard: [], soft: [] };
    
    skills.forEach(skill => {
      const skillName = typeof skill === 'string' ? skill : skill.name;
      const isHardSkill = HARD_SKILLS_KEYWORDS.some(keyword => 
        skillName.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (isHardSkill) {
        result.hard.push(skillName);
      } else {
        result.soft.push(skillName);
      }
    });

    return result;
  };

  const { hard: hardSkills, soft: softSkills } = categorizeSkills(candidate.skills || []);

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h4 className="text-xl font-semibold mb-4 text-blue-600 border-b pb-2">Habilidades</h4>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center mb-4">
              <Code className="w-5 h-5 text-blue-500 mr-2" />
              <h5 className="text-lg font-semibold">Habilidades Técnicas</h5>
            </div>
            <div className="flex flex-wrap gap-2">
              {hardSkills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center mb-4">
              <Heart className="w-5 h-5 text-pink-500 mr-2" />
              <h5 className="text-lg font-semibold">Habilidades Blandas</h5>
            </div>
            <div className="flex flex-wrap gap-2">
              {softSkills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}